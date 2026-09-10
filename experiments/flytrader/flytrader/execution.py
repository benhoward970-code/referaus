"""Order execution.

Two brokers ship here. `PaperBroker` is the default and simulates fills
against the feed price with configurable fees and slippage. `LiveBroker` is
deliberately not implemented: it exists to define the interface and to be an
obvious, single place to put real order routing if someone decides they want
that, having read what the fly actually is.

Nothing in this package will move real funds. That is a design decision, not
an oversight - a fruit fly's proboscis extension reflex is a fine thing to
study and a poor thing to hand a wallet to.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


@dataclass(frozen=True)
class Fill:
    side: str  # "buy" or "sell"
    quantity: float
    price: float
    """Price actually paid, after slippage."""
    fee: float
    reference_price: float
    """Quoted price before slippage, for measuring execution cost."""


class Broker(Protocol):
    @property
    def cash(self) -> float: ...

    @property
    def quantity(self) -> float: ...

    def equity(self, price: float) -> float: ...

    def rebalance(self, target_weight: float, price: float) -> Fill | None: ...


@dataclass
class PaperBroker:
    """A simulated account.

    Fees and slippage default to values that are plausible for a Solana DEX
    swap on a mid-liquidity token, because a backtest run at zero cost will
    make any high-turnover strategy look better than it is - and a strategy
    driven by a reflex arc is high-turnover by nature.
    """

    starting_cash: float = 1000.0
    fee_rate: float = 0.0025
    """Taken on notional, both directions."""

    slippage_rate: float = 0.005
    """Price moves against you by this fraction on every fill."""

    min_trade_notional: float = 1.0
    """Skip rebalances smaller than this, so dust does not churn fees."""

    cash_: float = field(init=False)
    quantity_: float = field(init=False, default=0.0)
    fills: list[Fill] = field(init=False, default_factory=list)
    fees_paid: float = field(init=False, default=0.0)

    def __post_init__(self) -> None:
        if self.starting_cash <= 0:
            raise ValueError("starting_cash must be positive")
        self.cash_ = float(self.starting_cash)

    @property
    def cash(self) -> float:
        return self.cash_

    @property
    def quantity(self) -> float:
        return self.quantity_

    def equity(self, price: float) -> float:
        return self.cash_ + self.quantity_ * price

    def weight(self, price: float) -> float:
        equity = self.equity(price)
        return (self.quantity_ * price / equity) if equity > 0 else 0.0

    def rebalance(self, target_weight: float, price: float) -> Fill | None:
        """Move the position towards ``target_weight`` of current equity."""
        if price <= 0:
            raise ValueError("price must be positive")
        if not 0.0 <= target_weight <= 1.0:
            raise ValueError("target_weight must be between 0 and 1 (long only)")

        equity = self.equity(price)
        if equity <= 0:
            return None  # wiped out; nothing to rebalance

        target_qty = target_weight * equity / price
        delta = target_qty - self.quantity_
        if abs(delta) * price < self.min_trade_notional:
            return None

        side = "buy" if delta > 0 else "sell"
        # Slippage always works against the trader.
        fill_price = price * (1 + self.slippage_rate) if delta > 0 else price * (1 - self.slippage_rate)
        notional = abs(delta) * fill_price
        fee = notional * self.fee_rate

        if delta > 0:
            cost = notional + fee
            if cost > self.cash_:
                # Buy only what the cash covers, fee included.
                affordable = self.cash_ / (fill_price * (1 + self.fee_rate))
                if affordable * fill_price < self.min_trade_notional:
                    return None
                delta = affordable
                notional = delta * fill_price
                fee = notional * self.fee_rate
            self.cash_ -= notional + fee
            self.quantity_ += delta
        else:
            self.cash_ += notional - fee
            self.quantity_ -= abs(delta)
            # Clean up floating-point dust so a closed position reads as zero.
            if abs(self.quantity_) < 1e-15:
                self.quantity_ = 0.0

        self.fees_paid += fee
        fill = Fill(
            side=side,
            quantity=abs(delta),
            price=fill_price,
            fee=fee,
            reference_price=price,
        )
        self.fills.append(fill)
        return fill


class LiveBroker:
    """Placeholder for real order routing. Intentionally inert.

    Wiring this up means giving an autonomous loop the ability to spend real
    money on illiquid tokens based on a simulated insect's feeding reflex. If
    that is genuinely what you want, implement `rebalance` here yourself, with
    your own position limits and kill switch. Refusing to pre-build it is the
    point.
    """

    def __init__(self, *_args, **_kwargs) -> None:
        raise NotImplementedError(
            "LiveBroker is not implemented on purpose. flytrader is a paper-trading "
            "research toy driven by a fruit fly's proboscis extension reflex; it has "
            "no edge and no risk controls suitable for real funds. If you want live "
            "execution, implement it deliberately in your own fork."
        )
