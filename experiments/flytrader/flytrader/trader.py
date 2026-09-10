"""The loop: price in, taste, brain, proboscis, position out.

    price history -> encode  -> sugar GRN drive (Hz)
                  -> brain   -> MN9 firing rate (Hz)
                  -> decode  -> target weight
                  -> broker  -> fill

The brain step has two modes. By default it interpolates the taste curve
measured by `flytrader.taste`, which is a cached measurement of the real
simulation and costs microseconds. With `live_brain=True` it runs the whole
127,400-neuron network on every tick instead, which costs seconds per tick and
gives the same answer plus Poisson noise. The curve is the sane default; the
live mode is there so you can confirm they agree.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

import numpy as np

from .brain import FlyBrain
from .decode import DecoderConfig, Intent, decode
from .encode import EncoderConfig, Taste, encode
from .execution import Fill, PaperBroker
from .taste import TasteCurve


@dataclass
class Tick:
    """One decision, with everything needed to explain it afterwards."""

    index: int
    price: float
    taste: Taste
    mn9_hz: float
    intent: Intent
    fill: Fill | None
    equity: float
    weight: float


@dataclass
class Session:
    """The record of a run."""

    ticks: list[Tick] = field(default_factory=list)
    starting_equity: float = 0.0

    @property
    def final_equity(self) -> float:
        return self.ticks[-1].equity if self.ticks else self.starting_equity

    @property
    def total_return(self) -> float:
        if self.starting_equity <= 0:
            return 0.0
        return self.final_equity / self.starting_equity - 1.0

    @property
    def n_fills(self) -> int:
        return sum(1 for t in self.ticks if t.fill is not None)

    @property
    def buy_and_hold_return(self) -> float:
        """What simply holding the token would have returned.

        The only benchmark that matters for something like this: if the fly
        cannot beat doing nothing, the fly is decoration.
        """
        if len(self.ticks) < 2:
            return 0.0
        return self.ticks[-1].price / self.ticks[0].price - 1.0

    @property
    def max_drawdown(self) -> float:
        if not self.ticks:
            return 0.0
        equity = np.array([t.equity for t in self.ticks], dtype=np.float64)
        peak = np.maximum.accumulate(equity)
        return float(np.min(equity / peak) - 1.0)

    @property
    def time_in_market(self) -> float:
        """Fraction of ticks holding a position."""
        if not self.ticks:
            return 0.0
        return sum(1 for t in self.ticks if t.weight > 1e-9) / len(self.ticks)

    def summary(self) -> dict:
        return {
            "ticks": len(self.ticks),
            "fills": self.n_fills,
            "starting_equity": self.starting_equity,
            "final_equity": self.final_equity,
            "total_return": self.total_return,
            "buy_and_hold_return": self.buy_and_hold_return,
            "max_drawdown": self.max_drawdown,
            "time_in_market": self.time_in_market,
        }


class FlyTrader:
    """A fly, a price feed, and an account."""

    def __init__(
        self,
        feed,
        curve: TasteCurve,
        broker: PaperBroker | None = None,
        encoder: EncoderConfig | None = None,
        decoder: DecoderConfig | None = None,
        brain: FlyBrain | None = None,
        live_brain: bool = False,
        live_brain_ms: float = 500.0,
        live_brain_trials: int = 3,
        seed: int | None = 0,
    ):
        if live_brain and brain is None:
            raise ValueError("live_brain=True needs a FlyBrain instance")
        self.feed = feed
        self.curve = curve
        self.broker = broker or PaperBroker()
        self.encoder = encoder or EncoderConfig()
        self.decoder = decoder or DecoderConfig()
        self.brain = brain
        self.live_brain = live_brain
        self.live_brain_ms = live_brain_ms
        self.live_brain_trials = live_brain_trials
        self.prices: list[float] = []
        self.session = Session(starting_equity=self.broker.starting_cash)
        self._rng_seed = seed

        if live_brain:
            self._stim_idx = brain.connectome.indices_of(curve.stimulus_ids)
            self._read_idx = brain.connectome.indices_of(curve.readout_ids)

    def _mn9_rate(self, stim_hz: float) -> float:
        """MN9's firing rate for a given sugar drive."""
        if not self.live_brain:
            return float(self.curve.response(stim_hz))

        response = self.brain.respond(
            duration_ms=self.live_brain_ms,
            stimulus={int(i): stim_hz for i in self._stim_idx},
            n_trials=self.live_brain_trials,
            seed=self._rng_seed,
        )
        if self._rng_seed is not None:
            self._rng_seed += 1  # advance, so ticks are not identically noisy
        return float(np.mean(response.rates(self._read_idx)))

    def step(self) -> Tick:
        """Advance one tick."""
        price = float(self.feed.next_price())
        self.prices.append(price)

        taste = encode(self.prices, self.encoder)
        mn9_hz = self._mn9_rate(taste.stim_hz)
        intent = decode(
            mn9_hz=mn9_hz,
            max_mn9_hz=self.curve.max_mn9_hz,
            currently_held=self.broker.quantity > 0,
            config=self.decoder,
        )
        fill = self.broker.rebalance(intent.target_weight, price)

        tick = Tick(
            index=len(self.prices) - 1,
            price=price,
            taste=taste,
            mn9_hz=mn9_hz,
            intent=intent,
            fill=fill,
            equity=self.broker.equity(price),
            weight=self.broker.weight(price),
        )
        self.session.ticks.append(tick)
        return tick

    def run(self, n_ticks: int, on_tick: Callable[[Tick], None] | None = None) -> Session:
        """Run until ``n_ticks`` have passed or the feed runs out."""
        for _ in range(n_ticks):
            try:
                tick = self.step()
            except StopIteration:
                break
            if on_tick:
                on_tick(tick)
        return self.session
