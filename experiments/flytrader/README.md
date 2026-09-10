# flytrader

A memecoin trading strategy whose only decision-maker is the brain of a fruit fly.

Not a metaphor. The strategy runs a leaky integrate-and-fire simulation of
127,400 neurons and 14,687,178 synapses from the **FlyWire adult *Drosophila
melanogaster* connectome**, feeds market momentum into the fly's sugar-sensing
gustatory receptor neurons, and sizes the position from the firing rate of
**MN9** — the motor neuron that extends the fly's proboscis when it decides
something in front of it is worth eating.

Market goes up, the coin tastes sweet, the fly sticks its tongue out, we buy.

**It loses money.** See [Does it work?](#does-it-work) — that section is the
point of the project, not a disclaimer.

## Why this is not entirely stupid

The appetitive pathway this rides on is a real, characterised circuit. Shiu et
al. (2024) built the whole-brain LIF model and showed that stimulating the
labellar sugar GRNs drives MN9 through the connectome, reproducing the
proboscis extension reflex. Their Figures 1D–1E measure the dose-response.

Two properties of that measured response do actual work as trading logic:

- **MN9 has a threshold.** Below ~40 Hz of sugar drive it does not fire at
  all. So the strategy has a flat state that nobody designed — weak signals
  produce no position because the fly is not interested.
- **MN9 saturates.** Above ~150 Hz the response flattens. So an extreme price
  move cannot argue the strategy into an extreme position.

Both come out of the wiring diagram. Neither is a parameter anyone tuned.

## The fly's actual response curve

Measured on this machine, 21 sugar GRNs stimulated, MN9 left and right read
out, 5 trials × 1000 ms per point (`python -m flytrader taste`):

```
   sugar      MN9   response
     20Hz    0.0Hz  |
     30Hz    0.0Hz  |
     40Hz    2.3Hz  |#                      <- threshold
     50Hz   18.8Hz  |#########
     60Hz   38.3Hz  |##################
     70Hz   49.9Hz  |#######################
     90Hz   62.9Hz  |#############################
    110Hz   69.0Hz  |################################
    140Hz   80.6Hz  |#####################################
    170Hz   88.6Hz  |#########################################
    200Hz   95.7Hz  |############################################
```

Around 400 of the 127,400 neurons are active under sugar stimulation, which is
what the paper reports for the same experiment.

## Pipeline

```
price history
    │  encode.py    risk-adjusted momentum -> "sweetness" -> 0-200 Hz
    ▼
21 sugar-sensing GRNs (right labellum)
    │  brain.py     127,400-neuron LIF simulation of the FlyWire connectome
    ▼
MN9 firing rate
    │  decode.py    appetite = MN9 / MN9_max, with hysteresis
    ▼
target portfolio weight
    │  execution.py paper fills, fees and slippage
    ▼
position
```

Momentum is divided by realised volatility before encoding. Without that, the
fly's 0–200 Hz dynamic range gets spent on the units of whatever token you
point it at rather than on the signal.

### The brain is not simulated per tick

Running the network takes ~5 seconds of wall clock per second of simulated
brain time. That is fine offline and useless in a trading loop.

But the thing the trader needs from the fly is one scalar function — sugar
drive in, MN9 rate out — and it only has to be measured once. So
`calibrate` sweeps the stimulation frequency, records the response, and saves
the curve to `data/taste_curve.json`; the trader interpolates it in
microseconds. What is cached is a *measurement of the real simulation*, not a
hand-fitted stand-in.

`--live-brain` runs the full network on every tick instead, so you can check
the two agree. On independent seeds they do:

| sugar drive | live brain | cached curve |
|---|---|---|
| 30 Hz | 0.0 Hz | 0.0 Hz |
| 70 Hz | 46.3 Hz | 49.9 Hz |
| 110 Hz | 69.3 Hz | 69.0 Hz |
| 170 Hz | 88.7 Hz | 88.6 Hz |

## Install

```bash
pip install -r requirements.txt
./scripts/fetch_connectome.sh        # ~370 MB, not vendored
python -m flytrader doctor           # check data, curve, feeds
python -m flytrader calibrate --procs 4   # ~3 minutes on 4 cores
python -m flytrader taste            # print the response curve
python -m flytrader backtest --ticks 500 --verbose
```

`data/taste_curve.json` is committed, so you can skip `calibrate` unless you
want to change the stimulus, the readout, or the model constants.

### Connectome version

Default is FlyWire **v630**, the version the paper used. The published neuron
IDs all resolve in it. Two of them — one sugar GRN and MN9-right — do not
exist in the current public v783 release, because FlyWire root IDs change as
proofreading merges and splits cells. v783 is fetched too if you want to
compare, but the IDs need remapping first.

## Does it work?

No. 60 synthetic price paths × 500 ticks, `python scripts/evaluate.py`:

| | median | mean | p10 | p90 |
|---|---|---|---|---|
| fly return | **−20.3%** | −7.5% | −52.9% | +61.3% |
| buy and hold | +6.5% | +129.0% | −72.1% | +420.0% |
| max drawdown | −44.9% | −46.4% | −65.2% | −31.4% |

- Beat buy-and-hold in **32%** of runs
- Profitable in **28%** of runs
- In the market 34% of the time, ~192 fills per run

With fees and slippage set to zero the median return goes to **+7.3%** and it
beats buy-and-hold in 45% of runs. So the honest reading is: the signal is
approximately a coin flip, and ~192 round trips per run of fees and slippage
turns approximately-a-coin-flip into a reliable loss. The fly is not a
momentum trader that costs too much; it is not a momentum trader.

The one thing it does do is stay out of falling markets — the MN9 threshold
means a downtrend produces no position at all, which is why the drawdowns are
smaller than buy-and-hold's worst paths. That is a property of a threshold,
not of a fly.

Note also that the synthetic feed is zero-drift by construction, and the p90
buy-and-hold figure of +420% shows how much of any single-path result is just
which path you drew. Don't read one backtest.

## No live trading

`PaperBroker` is the only broker implemented. `LiveBroker` raises
`NotImplementedError` and says why:

> Wiring this up means giving an autonomous loop the ability to spend real
> money on illiquid tokens based on a simulated insect's feeding reflex.

The evaluation above is the argument. Nothing here has an edge, and a
proboscis extension reflex has no risk controls. If you want live execution,
implement it deliberately in your own fork, with your own position limits and
kill switch.

The HTTP price feeds (Jupiter, DexScreener, CoinGecko) are written against each
provider's documented response shape but **could not be exercised** — every
crypto price API is blocked by the sandbox this was built in. Run
`python -m flytrader doctor --feed jupiter:<mint>` on a networked machine
before trusting them. The synthetic and CSV feeds are tested.

## Tests

```bash
python -m pytest tests/ -q     # 42 tests, ~40s
```

`tests/test_brain.py` is the set that matters — if the simulation is wrong,
everything downstream is a random number generator with extra steps. It checks
that an unstimulated brain is completely silent, that stimulated neurons track
their commanded rate, that sugar drives MN9, that the response is monotone with
a threshold, that silencing works, that trials are reproducible from a seed,
and that the per-step integration coefficients match a fine-grained Euler
integration of the same differential equations. It skips itself if the
connectome has not been fetched.

## Layout

| file | |
|---|---|
| `connectome.py` | load the FlyWire export, cache it as CSR |
| `brain.py` | the LIF simulation |
| `neurons.py` | the named neuron IDs, with provenance |
| `taste.py` | calibration sweep and the response curve |
| `encode.py` | market data → sugar drive |
| `decode.py` | MN9 rate → target weight |
| `feeds.py` | synthetic, CSV and HTTP price sources |
| `execution.py` | paper broker |
| `trader.py` | the loop |
| `cli.py` | `calibrate`, `taste`, `backtest`, `trade`, `doctor` |

## The aversive channel is deliberately empty

The obvious next step is a "sell" signal from the bitter-sensing (Gr66a) GRNs,
which suppress MN9 — the fly refusing food. Those neurons are not in the
published model's data files, and `neurons.py` does not invent IDs for them.
The hook exists: look them up in [FlyWire Codex](https://codex.flywire.ai)
and pass them in. Until then the trader runs on the appetitive pathway alone,
which is the pathway the paper actually characterises.

## Provenance

- **Connectome and LIF model:** Shiu, Sterne, Spiller et al., *A leaky
  integrate-and-fire computational model based on the connectome of the entire
  adult Drosophila brain reveals insights into sensorimotor processing*,
  Nature 634 (2024). Code and data:
  [philshiu/Drosophila_brain_model](https://github.com/philshiu/Drosophila_brain_model).
- **Connectome:** Dorkenwald et al., *Neuronal wiring diagram of an adult
  brain*, Nature 634 (2024). [FlyWire](https://flywire.ai) /
  [Codex](https://codex.flywire.ai).
- **Neuron IDs:** the sugar GRN and MN9 IDs in `neurons.py` are taken verbatim
  from the published notebooks. Provenance is noted per constant.
- **Model constants:** Kakaria & de Bivort 2017 (potentials, membrane time
  scale), Jürgensen et al. 2021 (synaptic time constant), Lazar et al. 2021
  (refractory period), Paul et al. 2015 (synaptic delay). `w_syn` is the
  model's one free parameter, fit in the paper.

The simulation here is a numpy reimplementation rather than a wrapper around
the authors' Brian 2 code, for one operational reason: the reference
implementation reparses a 100 MB parquet file and rebuilds the entire network
on every trial. The neuron model, its constants and the per-timestep execution
order are kept identical, and integration uses the analytic solution over a
timestep, matching Brian 2's `linear` method.

## Relationship to this repository

None. This is an isolated experiment in `experiments/flytrader/` with no
imports into `src/` and no effect on the Next.js build. It is Python; the app
is not.
