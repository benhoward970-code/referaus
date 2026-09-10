"""Tests for the simulation itself.

These are the ones that matter: if the brain is wrong, everything downstream
is a random number generator with extra steps. The headline test reproduces
the qualitative result of Shiu et al. Figure 1D-1E - sugar in, MN9 out, with a
threshold and saturation.

Tests that need the connectome are skipped when it has not been fetched, so
the suite still runs on a fresh checkout.
"""

from __future__ import annotations

import numpy as np
import pytest

from flytrader.brain import FlyBrain, LIFParams
from flytrader.connectome import DEFAULT_DATA_DIR, load_connectome
from flytrader.neurons import MN9, MN9_LEFT, SUGAR_GRN_RIGHT

CONNECTOME_VERSION = "630"

pytestmark = pytest.mark.skipif(
    not (DEFAULT_DATA_DIR / f"Completeness_{CONNECTOME_VERSION}.csv").is_file(),
    reason="connectome not fetched; run scripts/fetch_connectome.sh",
)


@pytest.fixture(scope="module")
def connectome():
    return load_connectome(version=CONNECTOME_VERSION)


@pytest.fixture(scope="module")
def brain(connectome):
    return FlyBrain(connectome)


def test_connectome_shape(connectome):
    # The published v630 export. Exact numbers, so a silently different data
    # file is caught rather than quietly changing every result.
    assert connectome.n_neurons == 127_400
    assert connectome.n_connections == 14_687_178
    assert connectome.indptr[-1] == connectome.n_connections


def test_published_neuron_ids_resolve(connectome):
    assert len(connectome.indices_of(SUGAR_GRN_RIGHT)) == 21
    assert len(connectome.indices_of(MN9)) == 2


def test_unknown_id_is_reported(connectome):
    with pytest.raises(KeyError, match="12345"):
        connectome.index_of(12345)


def test_unstimulated_brain_is_silent(brain):
    """With no input, nothing should fire. Resting potential is below threshold,
    so any spontaneous activity means the integration is wrong."""
    result = brain.run(duration_ms=200.0, rng=np.random.default_rng(0))
    assert result.n_active == 0


def test_stimulated_neurons_fire_at_the_requested_rate(brain, connectome):
    """The injected step is meant to be suprathreshold, so the sugar GRNs
    should track their commanded frequency."""
    sugar = connectome.indices_of(SUGAR_GRN_RIGHT)
    result = brain.run(
        duration_ms=1000.0,
        stimulus={int(i): 150.0 for i in sugar},
        rng=np.random.default_rng(0),
    )
    assert result.rates(sugar).mean() == pytest.approx(150.0, rel=0.1)


def test_sugar_drives_mn9(brain, connectome):
    """The paper's core sensorimotor result: sugar GRN activation makes MN9
    fire, which is the proboscis extension reflex."""
    sugar = connectome.indices_of(SUGAR_GRN_RIGHT)
    mn9 = connectome.index_of(MN9_LEFT)
    result = brain.run(
        duration_ms=1000.0,
        stimulus={int(i): 150.0 for i in sugar},
        rng=np.random.default_rng(0),
    )
    assert result.rate(mn9) > 0
    # The paper reports roughly 400 neurons active under sugar stimulation.
    assert 200 < result.n_active < 800


def test_mn9_response_is_monotone_with_a_threshold(brain, connectome):
    """Figure 1D-1E, coarsely: MN9 is silent at low sugar drive, then increases.

    Both properties are load-bearing for the trader - the threshold is what
    gives it a flat state without anyone picking a cutoff, and monotonicity is
    what makes position size mean anything.
    """
    sugar = connectome.indices_of(SUGAR_GRN_RIGHT)
    mn9 = connectome.indices_of(MN9)

    rates = []
    for stim_hz in (10.0, 50.0, 100.0, 150.0):
        response = brain.respond(
            duration_ms=500.0,
            stimulus={int(i): stim_hz for i in sugar},
            n_trials=2,
            seed=7,
        )
        rates.append(float(np.mean(response.rates(mn9))))

    assert rates[0] == 0.0, "MN9 should be silent at 10 Hz sugar drive"
    assert rates[-1] > 0.0, "MN9 should fire at 150 Hz sugar drive"
    # Non-decreasing, allowing for Poisson noise between adjacent points.
    for lo, hi in zip(rates, rates[1:]):
        assert hi >= lo - 5.0, f"MN9 response not monotone: {rates}"


def test_silencing_mn9_input_removes_the_response(brain, connectome):
    """Silencing the stimulated neurons themselves must abolish everything
    downstream: it is the sanity check that silencing does what it claims."""
    sugar = connectome.indices_of(SUGAR_GRN_RIGHT)
    mn9 = connectome.index_of(MN9_LEFT)
    result = brain.run(
        duration_ms=500.0,
        stimulus={int(i): 150.0 for i in sugar},
        silenced=[int(i) for i in sugar],
        rng=np.random.default_rng(0),
    )
    assert result.rate(mn9) == 0.0
    # The GRNs still spike - silencing zeroes their outputs, not their input.
    assert result.rates(sugar).mean() > 0


def test_trials_are_reproducible(brain, connectome):
    sugar = connectome.indices_of(SUGAR_GRN_RIGHT)
    stimulus = {int(i): 100.0 for i in sugar}
    a = brain.run(200.0, stimulus, rng=np.random.default_rng(42))
    b = brain.run(200.0, stimulus, rng=np.random.default_rng(42))
    assert np.array_equal(a.spike_counts, b.spike_counts)


def test_exact_integration_coefficients():
    """The per-step coefficients are the analytic solution, so check them
    against a fine-grained Euler integration of the same equations."""
    p = LIFParams(dt=1.0)
    brain = FlyBrain.__new__(FlyBrain)
    FlyBrain.__init__(brain, _dummy_connectome(), p)

    v, g = 0.0, 1.0  # in units of (v - v_0)
    steps = 20_000
    dt = 1.0 / steps
    for _ in range(steps):
        v += (-v + g) / p.t_mbr * dt
        g += -g / p.tau * dt

    assert brain._decay_g == pytest.approx(g, rel=1e-4)
    assert brain._coupling == pytest.approx(v, rel=1e-3)


def test_tau_equal_to_membrane_constant_is_rejected():
    with pytest.raises(ValueError, match="tau must differ"):
        LIFParams(tau=20.0, t_mbr=20.0)


def _dummy_connectome():
    from flytrader.connectome import Connectome

    return Connectome(
        indptr=np.array([0, 0], dtype=np.int64),
        indices=np.array([], dtype=np.int32),
        weights=np.array([], dtype=np.float32),
        flywire_ids=np.array([1], dtype=np.int64),
    )
