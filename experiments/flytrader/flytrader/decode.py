"""Turn the fly's motor output into a position.

MN9 drives the proboscis extension reflex: when the fly decides that what it
is tasting is worth eating, MN9 fires and the proboscis comes out. So MN9's
firing rate is read here as the fly's conviction, and the target portfolio
weight is proportional to it.

Two properties of the connectome's response do real work in this mapping,
which is the reason for going through a brain rather than a formula:

* MN9 has a threshold. Below some sugar drive it does not fire at all, so
  there is a band of weak signals that produce no position without anyone
  choosing a cutoff.
* MN9 saturates. Above some drive it stops responding, so an extreme move
  cannot talk the strategy into an extreme position.

Hysteresis is added on top, because a reflex that chatters on and off around
its threshold would pay the spread every tick. That part is not the fly's; it
is risk management, and it is labelled as such.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DecoderConfig:
    max_weight: float = 1.0
    """Largest fraction of the account the fly may hold in the token."""

    enter_at: float = 0.25
    """Fraction of maximum appetite needed to open a position."""

    exit_at: float = 0.10
    """Appetite below which an open position is closed. Keep below `enter_at`;
    the gap is the hysteresis band."""

    def __post_init__(self) -> None:
        if not 0.0 <= self.exit_at <= self.enter_at:
            raise ValueError("exit_at must be between 0 and enter_at")
        if not 0.0 < self.max_weight <= 1.0:
            raise ValueError("max_weight must be in (0, 1]")


@dataclass(frozen=True)
class Intent:
    """The fly's decision, as a target weight."""

    target_weight: float
    """Fraction of the account to hold. 0 is flat."""

    appetite: float
    """MN9 rate as a fraction of its calibrated maximum, 0 to 1."""

    mn9_hz: float
    extended: bool
    """Whether the proboscis is out: the fly wants to eat this."""

    reason: str


def decode(
    mn9_hz: float,
    max_mn9_hz: float,
    currently_held: bool,
    config: DecoderConfig | None = None,
) -> Intent:
    """Map an MN9 firing rate to a target weight."""
    cfg = config or DecoderConfig()

    if max_mn9_hz <= 0:
        return Intent(0.0, 0.0, mn9_hz, False, "uncalibrated: MN9 never fired in the sweep")

    appetite = max(0.0, min(1.0, mn9_hz / max_mn9_hz))

    if mn9_hz <= 0.0:
        return Intent(0.0, appetite, mn9_hz, False, "MN9 silent: below the fly's own threshold")

    # Hysteresis: a higher bar to open than to stay open.
    bar = cfg.exit_at if currently_held else cfg.enter_at
    if appetite < bar:
        state = "holding" if currently_held else "flat"
        return Intent(
            0.0,
            appetite,
            mn9_hz,
            False,
            f"appetite {appetite:.2f} below {state} bar {bar:.2f}",
        )

    return Intent(
        target_weight=appetite * cfg.max_weight,
        appetite=appetite,
        mn9_hz=mn9_hz,
        extended=True,
        reason=f"proboscis extended, appetite {appetite:.2f}",
    )
