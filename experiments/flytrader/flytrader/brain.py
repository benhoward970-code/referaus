"""A leaky integrate-and-fire simulation of the adult Drosophila brain.

This is a reimplementation of the model published in Shiu et al. (2024) on top
of numpy, rather than a wrapper around their Brian 2 code. The reason is purely
operational: the reference implementation reparses a 100 MB parquet file and
rebuilds the whole Brian 2 network on every trial, which is fine for a batch of
offline experiments and useless inside a loop that has to answer a question
every few seconds. Here the connectome is loaded once and each trial is a few
thousand vector operations.

The neuron model, its constants and the per-timestep execution order are kept
deliberately identical to the reference so results stay comparable:

    dv/dt = (v_0 - v + g) / t_mbr    (frozen while refractory)
    dg/dt = -g / tau                 (frozen while refractory)
    spike when v > v_th, then v <- v_rst and g <- 0

Constants come from the reference implementation, which sources them from
Kakaria & de Bivort 2017 (resting/threshold potentials, membrane time scale),
Jurgensen et al. 2021 (synaptic time constant), Lazar et al. 2021 (refractory
period) and Paul et al. 2015 (synaptic delay). ``w_syn`` is the model's one
free parameter, fit in the paper.

Integration is the exact solution over a timestep, matching Brian 2's 'linear'
method, so the 0.1 ms timestep is a sampling choice rather than a source of
integration error.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from typing import Iterable, Mapping, Sequence

import numpy as np

from .connectome import Connectome


@dataclass(frozen=True)
class LIFParams:
    """Neuron and synapse constants. Millivolts and milliseconds throughout."""

    v_0: float = -52.0  # resting potential
    v_rst: float = -52.0  # reset potential after a spike
    v_th: float = -45.0  # spike threshold
    t_mbr: float = 20.0  # membrane time scale
    tau: float = 5.0  # synaptic time constant
    t_rfc: float = 2.2  # refractory period
    t_dly: float = 1.8  # synaptic transmission delay
    w_syn: float = 0.275  # conductance step per synapse (free parameter)
    f_poi: float = 250.0  # scaling for the injected Poisson drive
    dt: float = 0.1  # simulation timestep

    def __post_init__(self) -> None:
        if self.tau == self.t_mbr:
            raise ValueError("tau must differ from t_mbr; the exact solution divides by their difference")
        if self.dt <= 0:
            raise ValueError("dt must be positive")


@dataclass
class TrialResult:
    """Spike counts from one trial, plus the rates derived from them."""

    duration_ms: float
    spike_counts: np.ndarray  # int32, one entry per neuron
    params: LIFParams

    def rate(self, index: int) -> float:
        """Firing rate of one neuron in Hz."""
        return float(self.spike_counts[index]) * 1000.0 / self.duration_ms

    def rates(self, indices: Sequence[int] | np.ndarray) -> np.ndarray:
        idx = np.asarray(indices, dtype=np.int64)
        return self.spike_counts[idx].astype(np.float64) * 1000.0 / self.duration_ms

    @property
    def n_active(self) -> int:
        """How many neurons spiked at all. A sanity check on runaway activity."""
        return int(np.count_nonzero(self.spike_counts))


@dataclass
class Response:
    """Mean and spread of firing rates over repeated trials."""

    duration_ms: float
    n_trials: int
    mean_counts: np.ndarray  # float64, one entry per neuron
    std_counts: np.ndarray

    def rate(self, index: int) -> float:
        return float(self.mean_counts[index]) * 1000.0 / self.duration_ms

    def rate_std(self, index: int) -> float:
        return float(self.std_counts[index]) * 1000.0 / self.duration_ms

    def rates(self, indices: Sequence[int] | np.ndarray) -> np.ndarray:
        idx = np.asarray(indices, dtype=np.int64)
        return self.mean_counts[idx] * 1000.0 / self.duration_ms


class FlyBrain:
    """A simulatable fly brain.

    Load the connectome once, then call :meth:`run` or :meth:`respond` as often
    as you like. The object holds no state between trials.
    """

    def __init__(self, connectome: Connectome, params: LIFParams | None = None):
        self.connectome = connectome
        self.params = params or LIFParams()
        p = self.params

        # Exact solution of the two-equation system over one timestep. Deriving
        # u = v - v_0 gives du/dt = (-u + g)/t_mbr with g decaying at rate tau:
        #   u(t+dt) = u*exp(-dt/t_mbr) + g * tau/(tau - t_mbr) * (B - A)
        self._decay_v = float(np.exp(-p.dt / p.t_mbr))
        self._decay_g = float(np.exp(-p.dt / p.tau))
        self._coupling = float(
            p.tau / (p.tau - p.t_mbr) * (self._decay_g - self._decay_v)
        )

        self._delay_steps = max(1, int(round(p.t_dly / p.dt)))
        self._rfc_steps = int(round(p.t_rfc / p.dt))
        # Conductance step in mV, from signed synapse counts.
        self._weights_mv = (connectome.weights * p.w_syn).astype(np.float32)
        self._poisson_step = np.float32(p.w_syn * p.f_poi)

    @property
    def n_neurons(self) -> int:
        return self.connectome.n_neurons

    def run(
        self,
        duration_ms: float = 1000.0,
        stimulus: Mapping[int, float] | None = None,
        silenced: Iterable[int] | None = None,
        rng: np.random.Generator | None = None,
    ) -> TrialResult:
        """Run one trial.

        Parameters
        ----------
        duration_ms:
            Simulated time. The reference experiments use 1000 ms.
        stimulus:
            ``{neuron_index: rate_hz}``. Each listed neuron receives Poisson
            drive at its rate, standing in for optogenetic activation. The
            injected step is large enough to force a spike, and stimulated
            neurons have no refractory period, so they fire at approximately
            their requested rate.
        silenced:
            Neuron indices whose outgoing connections are set to zero, standing
            in for optogenetic silencing.
        rng:
            Source of randomness for the Poisson drive. Pass a seeded generator
            for reproducible trials.
        """
        p = self.params
        rng = rng or np.random.default_rng()
        n = self.n_neurons
        n_steps = int(round(duration_ms / p.dt))
        if n_steps <= 0:
            raise ValueError("duration_ms is shorter than one timestep")

        v = np.full(n, p.v_0, dtype=np.float32)
        g = np.zeros(n, dtype=np.float32)
        rfc_left = np.zeros(n, dtype=np.int32)
        counts = np.zeros(n, dtype=np.int32)

        # Ring buffer of conductance increments in flight, one slot per timestep
        # of synaptic delay.
        n_slots = self._delay_steps + 1
        pending = np.zeros((n_slots, n), dtype=np.float32)

        indptr = self.connectome.indptr
        indices = self.connectome.indices
        weights = self._weights_mv

        # Silencing zeroes a neuron's outgoing synapses, which is equivalent to
        # letting it spike but dropping what it would have propagated.
        muted = np.zeros(n, dtype=bool)
        silenced_idx = np.asarray(list(silenced or ()), dtype=np.int64)
        if silenced_idx.size:
            muted[silenced_idx] = True

        stim_idx = np.asarray(list((stimulus or {}).keys()), dtype=np.int64)
        stim_rates = np.asarray(list((stimulus or {}).values()), dtype=np.float64)
        if stim_idx.size:
            if (stim_rates < 0).any():
                raise ValueError("stimulus rates must be non-negative")
            # Expected Poisson events per timestep, dt in ms -> seconds.
            stim_lam = stim_rates * (p.dt / 1000.0)
            # Stimulated neurons bypass refractoriness, as in the reference.
            rfc_exempt = np.zeros(n, dtype=bool)
            rfc_exempt[stim_idx] = True
        else:
            stim_lam = None
            rfc_exempt = None

        v_0 = np.float32(p.v_0)
        v_rst = np.float32(p.v_rst)
        v_th = np.float32(p.v_th)
        decay_v = np.float32(self._decay_v)
        decay_g = np.float32(self._decay_g)
        coupling = np.float32(self._coupling)

        # Scratch buffers, reused every step so the loop allocates nothing.
        scratch = np.empty(n, dtype=np.float32)
        above = np.empty(n, dtype=bool)

        for step in range(n_steps):
            # 1. State update. The equations are frozen while a neuron is
            # refractory, and only a few hundred neurons are ever refractory at
            # once, so integrate everything and put the frozen ones back. That
            # avoids a boolean-masked copy of the full population each step.
            ref = np.flatnonzero(rfc_left)
            if ref.size:
                v_hold = v[ref].copy()
                g_hold = g[ref].copy()

            v -= v_0
            v *= decay_v
            np.multiply(g, coupling, out=scratch)
            v += scratch
            v += v_0
            g *= decay_g

            if ref.size:
                v[ref] = v_hold
                g[ref] = g_hold

            # 2. Threshold. Refractory neurons cannot spike.
            np.greater(v, v_th, out=above)
            if ref.size:
                above[ref] = False
            spiked = np.flatnonzero(above)

            # 3. Synapses: deliver arrivals, inject drive, queue new spikes.
            slot = step % n_slots
            arriving = pending[slot]
            g += arriving
            arriving.fill(0.0)

            if stim_lam is not None:
                events = rng.poisson(stim_lam)
                if events.any():
                    v[stim_idx] += self._poisson_step * events.astype(np.float32)

            if spiked.size:
                target_slot = (step + self._delay_steps) % n_slots
                buf = pending[target_slot]
                for i in spiked:
                    if muted[i]:
                        continue
                    lo, hi = indptr[i], indptr[i + 1]
                    if lo != hi:
                        buf[indices[lo:hi]] += weights[lo:hi]

                # 4. Reset.
                v[spiked] = v_rst
                g[spiked] = 0.0
                rfc_left[spiked] = self._rfc_steps
                counts[spiked] += 1

            if rfc_exempt is not None:
                rfc_left[rfc_exempt] = 0
            np.subtract(rfc_left, 1, out=rfc_left, where=rfc_left > 0)

        return TrialResult(duration_ms=duration_ms, spike_counts=counts, params=p)

    def respond(
        self,
        duration_ms: float = 1000.0,
        stimulus: Mapping[int, float] | None = None,
        n_trials: int = 5,
        silenced: Iterable[int] | None = None,
        seed: int | None = None,
    ) -> Response:
        """Run several trials and summarise the firing rates.

        The Poisson drive makes a single trial noisy, so anything you intend to
        threshold on should be averaged over trials. The reference experiments
        use 30; 5 is enough to rank conditions.
        """
        if n_trials < 1:
            raise ValueError("n_trials must be at least 1")
        rng = np.random.default_rng(seed)
        stack = np.empty((n_trials, self.n_neurons), dtype=np.float32)
        for t in range(n_trials):
            stack[t] = self.run(
                duration_ms=duration_ms, stimulus=stimulus, silenced=silenced, rng=rng
            ).spike_counts
        return Response(
            duration_ms=duration_ms,
            n_trials=n_trials,
            mean_counts=stack.mean(axis=0).astype(np.float64),
            std_counts=stack.std(axis=0).astype(np.float64),
        )

    def with_params(self, **changes) -> "FlyBrain":
        """A copy of this brain with some constants changed."""
        return FlyBrain(self.connectome, replace(self.params, **changes))
