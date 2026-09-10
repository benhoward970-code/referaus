"""Turn market data into something a fly can taste.

The fly has no concept of a price. What it has is a labellar sugar receptor:
a channel whose firing rate says "there is this much sugar in front of me".
So the encoder's whole job is to answer one question - how sweet does this
token look right now - and express the answer in hertz.

Sweetness is risk-adjusted momentum. Raw return is a bad stimulus because a
5% move means something different for a stablecoin than for a coin that swings
30% an hour, and the fly's dynamic range is only 0-200 Hz. Dividing by realised
volatility spends that range on the signal rather than on the units.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class EncoderConfig:
    momentum_window: int = 12
    """Samples of price history used for the momentum estimate."""

    vol_window: int = 48
    """Samples used for the realised-volatility estimate. Wider than the
    momentum window so the denominator is steadier than the numerator."""

    max_stim_hz: float = 200.0
    """Top of the fly's stimulation range. The paper sweeps to 200 Hz."""

    sensitivity: float = 1.5
    """How many volatility units of momentum count as maximally sweet. Lower
    is a twitchier fly."""

    min_vol: float = 1e-4
    """Volatility floor, so a flat series cannot divide the signal to infinity."""


@dataclass(frozen=True)
class Taste:
    """What the fly is being offered, and the resulting stimulus."""

    sweetness: float
    """0 (nothing there) to 1 (as sweet as this encoder goes)."""

    stim_hz: float
    """Sugar GRN stimulation frequency."""

    momentum: float
    """Log return over the momentum window."""

    volatility: float
    """Realised volatility of log returns over the volatility window."""

    score: float
    """Risk-adjusted momentum, before squashing. Useful for diagnostics."""


def encode(prices, config: EncoderConfig | None = None) -> Taste:
    """Encode a price history as a sugar stimulus.

    ``prices`` is a sequence of prices, oldest first. Returns a zero stimulus
    until there is enough history to estimate momentum.
    """
    cfg = config or EncoderConfig()
    series = np.asarray(prices, dtype=np.float64)

    if series.size < 2 or np.any(series <= 0):
        return Taste(0.0, 0.0, 0.0, 0.0, 0.0)

    log_prices = np.log(series)
    returns = np.diff(log_prices)

    if returns.size < 2:
        return Taste(0.0, 0.0, 0.0, 0.0, 0.0)

    window = min(cfg.momentum_window, returns.size)
    momentum = float(log_prices[-1] - log_prices[-1 - window])

    vol_window = min(cfg.vol_window, returns.size)
    # Per-window volatility, to match the units of the momentum numerator.
    volatility = float(np.std(returns[-vol_window:]) * np.sqrt(window))
    volatility = max(volatility, cfg.min_vol)

    score = momentum / volatility

    # tanh keeps the mapping monotone and bounded, and its saturation means an
    # extreme move cannot dominate the fly's whole dynamic range. Only positive
    # momentum is sweet: falling prices are simply not food.
    sweetness = float(np.tanh(max(score, 0.0) / cfg.sensitivity))

    return Taste(
        sweetness=sweetness,
        stim_hz=sweetness * cfg.max_stim_hz,
        momentum=momentum,
        volatility=volatility,
        score=score,
    )
