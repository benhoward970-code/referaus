"""Calibrate the fly's appetite: sugar GRN drive in, MN9 firing rate out.

Running the whole brain takes seconds per trial, which is fine offline and no
use inside a trading loop. But the thing the trader needs from the fly is a
single scalar function - how strongly it wants to eat, given how sweet the
input is - and that function only has to be measured once.

So this module sweeps the stimulation frequency of the sugar-sensing GRNs,
records MN9's response at each step, and saves the curve. The trader then
interpolates it. The decision boundary is still the connectome's: what gets
cached is a measurement of the real simulation, not a hand-fitted stand-in.

Figures 1D-1E of Shiu et al. (2024) are the same measurement.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Sequence

import numpy as np

from .brain import FlyBrain, LIFParams
from .connectome import load_connectome
from .neurons import MN9, SUGAR_GRN_RIGHT

DEFAULT_CURVE_PATH = Path(__file__).resolve().parent.parent / "data" / "taste_curve.json"


@dataclass
class TasteCurve:
    """MN9 firing rate as a function of sugar GRN stimulation frequency."""

    stim_hz: list[float]
    mn9_hz: list[float]
    mn9_hz_std: list[float]
    n_active: list[float]
    connectome_version: str
    n_trials: int
    duration_ms: float
    readout_ids: list[int]
    stimulus_ids: list[int]

    def response(self, stim_hz: float | np.ndarray) -> np.ndarray:
        """Interpolate MN9's rate at an arbitrary stimulation frequency.

        Clamped at both ends: below the measured floor the fly is not
        interested, above the ceiling it is already saturated.
        """
        return np.interp(
            np.asarray(stim_hz, dtype=np.float64),
            np.asarray(self.stim_hz, dtype=np.float64),
            np.asarray(self.mn9_hz, dtype=np.float64),
        )

    @property
    def max_mn9_hz(self) -> float:
        return max(self.mn9_hz) if self.mn9_hz else 0.0

    @property
    def threshold_hz(self) -> float:
        """Lowest stimulation frequency at which MN9 fires at all.

        This is the fly's own decision boundary, and the trader uses it as the
        boundary between 'not interested' and 'worth a position'.
        """
        for stim, rate in zip(self.stim_hz, self.mn9_hz):
            if rate > 0:
                return float(stim)
        return float("inf")

    def save(self, path: Path | str = DEFAULT_CURVE_PATH) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(asdict(self), indent=2) + "\n")
        return path

    @classmethod
    def load(cls, path: Path | str = DEFAULT_CURVE_PATH) -> "TasteCurve":
        path = Path(path)
        if not path.is_file():
            raise FileNotFoundError(
                f"No taste curve at {path}. Run `python -m flytrader calibrate` first."
            )
        return cls(**json.loads(path.read_text()))


def _measure(args) -> tuple[float, float, float, float]:
    """One frequency point. Module-level so it can be sent to a worker."""
    stim_hz, version, duration_ms, n_trials, seed, sugar_ids, readout_ids = args

    connectome = load_connectome(version=version)
    brain = FlyBrain(connectome, LIFParams())
    stim_idx = connectome.indices_of(sugar_ids)
    read_idx = connectome.indices_of(readout_ids)

    stimulus = {int(i): float(stim_hz) for i in stim_idx}
    response = brain.respond(
        duration_ms=duration_ms,
        stimulus=stimulus,
        n_trials=n_trials,
        seed=seed,
    )
    # Average across the readout neurons (MN9 left and right).
    rate = float(np.mean(response.rates(read_idx)))
    std = float(np.mean([response.rate_std(int(i)) for i in read_idx]))
    n_active = float(np.count_nonzero(response.mean_counts))
    return stim_hz, rate, std, n_active


def calibrate(
    frequencies: Sequence[float] = tuple(range(0, 201, 10)),
    version: str = "630",
    duration_ms: float = 1000.0,
    n_trials: int = 5,
    seed: int = 0,
    n_procs: int = 1,
    stimulus_ids: Sequence[int] = SUGAR_GRN_RIGHT,
    readout_ids: Sequence[int] = MN9,
    progress=None,
) -> TasteCurve:
    """Sweep sugar GRN stimulation frequency and record MN9's response."""
    jobs = [
        (
            float(f),
            version,
            duration_ms,
            n_trials,
            seed + i,  # a different seed per point, reproducible as a whole
            tuple(stimulus_ids),
            tuple(readout_ids),
        )
        for i, f in enumerate(frequencies)
    ]

    if n_procs > 1:
        import multiprocessing as mp

        with mp.get_context("spawn").Pool(n_procs) as pool:
            results = []
            for out in pool.imap_unordered(_measure, jobs):
                results.append(out)
                if progress:
                    progress(out, len(results), len(jobs))
    else:
        results = []
        for job in jobs:
            out = _measure(job)
            results.append(out)
            if progress:
                progress(out, len(results), len(jobs))

    results.sort(key=lambda r: r[0])
    return TasteCurve(
        stim_hz=[r[0] for r in results],
        mn9_hz=[r[1] for r in results],
        mn9_hz_std=[r[2] for r in results],
        n_active=[r[3] for r in results],
        connectome_version=version,
        n_trials=n_trials,
        duration_ms=duration_ms,
        readout_ids=[int(i) for i in readout_ids],
        stimulus_ids=[int(i) for i in stimulus_ids],
    )
