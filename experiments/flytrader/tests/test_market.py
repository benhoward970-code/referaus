"""Tests for the market-facing layers. No connectome needed."""

from __future__ import annotations

import csv
import math

import numpy as np
import pytest

from flytrader.decode import DecoderConfig, decode
from flytrader.encode import EncoderConfig, encode
from flytrader.execution import LiveBroker, PaperBroker
from flytrader.feeds import CsvFeed, SyntheticFeed, build_feed
from flytrader.taste import TasteCurve
from flytrader.trader import FlyTrader


# --- encoding ---------------------------------------------------------------

def test_empty_and_short_history_encodes_to_nothing():
    assert encode([]).stim_hz == 0.0
    assert encode([1.0]).stim_hz == 0.0
    assert encode([1.0, 1.1]).stim_hz == 0.0


def test_falling_prices_are_not_sweet():
    prices = [100.0 * 0.97**i for i in range(60)]
    assert encode(prices).sweetness == 0.0


def test_rising_prices_are_sweet():
    prices = [100.0 * 1.03**i for i in range(60)]
    taste = encode(prices)
    assert taste.sweetness > 0.5
    assert taste.stim_hz > 100.0


def test_sweetness_is_bounded_and_monotone_in_momentum():
    def sweetness(rate):
        return encode([100.0 * (1 + rate) ** i for i in range(60)]).sweetness

    values = [sweetness(r) for r in (0.001, 0.005, 0.02, 0.10, 0.50)]
    assert all(0.0 <= v <= 1.0 for v in values)
    assert values == sorted(values)


def test_volatility_scaling_normalises_the_stimulus():
    """The same risk-adjusted move should taste roughly the same however
    volatile the token is. That is the point of dividing by volatility."""
    rng = np.random.default_rng(0)
    scores = []
    for vol in (0.01, 0.05):
        returns = rng.normal(0.15 * vol, vol, 200)
        prices = 100.0 * np.exp(np.cumsum(returns))
        scores.append(encode(prices).score)
    assert scores[0] == pytest.approx(scores[1], abs=1.2)


def test_non_positive_prices_are_rejected_softly():
    assert encode([1.0, 0.0, 2.0]).stim_hz == 0.0
    assert encode([1.0, -1.0]).stim_hz == 0.0


# --- decoding ---------------------------------------------------------------

def test_silent_mn9_means_flat():
    intent = decode(mn9_hz=0.0, max_mn9_hz=100.0, currently_held=False)
    assert intent.target_weight == 0.0
    assert not intent.extended
    assert "threshold" in intent.reason


def test_strong_response_opens_a_position():
    intent = decode(mn9_hz=90.0, max_mn9_hz=100.0, currently_held=False)
    assert intent.extended
    assert intent.target_weight == pytest.approx(0.9)


def test_hysteresis_keeps_a_position_it_would_not_open():
    cfg = DecoderConfig(enter_at=0.5, exit_at=0.2)
    weak = 30.0  # appetite 0.3: between the two bars
    assert decode(weak, 100.0, currently_held=False, config=cfg).target_weight == 0.0
    assert decode(weak, 100.0, currently_held=True, config=cfg).target_weight > 0.0


def test_appetite_is_clamped_above_the_calibrated_peak():
    intent = decode(mn9_hz=500.0, max_mn9_hz=100.0, currently_held=False)
    assert intent.appetite == 1.0
    assert intent.target_weight <= 1.0


def test_max_weight_caps_the_position():
    intent = decode(100.0, 100.0, False, DecoderConfig(max_weight=0.25))
    assert intent.target_weight == pytest.approx(0.25)


def test_uncalibrated_curve_refuses_to_trade():
    intent = decode(mn9_hz=50.0, max_mn9_hz=0.0, currently_held=False)
    assert intent.target_weight == 0.0
    assert "uncalibrated" in intent.reason


def test_exit_above_enter_is_rejected():
    with pytest.raises(ValueError):
        DecoderConfig(enter_at=0.1, exit_at=0.5)


# --- execution --------------------------------------------------------------

def test_buy_then_sell_round_trip_costs_fees_and_slippage():
    broker = PaperBroker(starting_cash=1000.0, fee_rate=0.001, slippage_rate=0.002)
    broker.rebalance(1.0, price=10.0)
    assert broker.quantity > 0
    broker.rebalance(0.0, price=10.0)
    assert broker.quantity == 0.0
    # Two fills, both against us, at an unchanged price: strictly a loss.
    assert broker.cash < 1000.0
    assert broker.fees_paid > 0
    assert len(broker.fills) == 2


def test_zero_cost_round_trip_at_a_flat_price_is_breakeven():
    broker = PaperBroker(starting_cash=1000.0, fee_rate=0.0, slippage_rate=0.0)
    broker.rebalance(1.0, price=7.5)
    broker.rebalance(0.0, price=7.5)
    assert broker.cash == pytest.approx(1000.0)


def test_broker_never_spends_more_cash_than_it_has():
    broker = PaperBroker(starting_cash=100.0, fee_rate=0.01, slippage_rate=0.01)
    broker.rebalance(1.0, price=1.0)
    assert broker.cash >= -1e-9
    assert broker.equity(1.0) <= 100.0


def test_dust_rebalances_are_skipped():
    broker = PaperBroker(starting_cash=1000.0, min_trade_notional=50.0)
    assert broker.rebalance(0.01, price=10.0) is None
    assert broker.quantity == 0.0


def test_short_positions_are_rejected():
    broker = PaperBroker()
    with pytest.raises(ValueError, match="long only"):
        broker.rebalance(-0.5, price=10.0)


def test_equity_tracks_price_moves():
    broker = PaperBroker(starting_cash=1000.0, fee_rate=0.0, slippage_rate=0.0)
    broker.rebalance(1.0, price=10.0)
    assert broker.equity(20.0) == pytest.approx(2000.0)


def test_live_broker_refuses_to_exist():
    with pytest.raises(NotImplementedError, match="on purpose"):
        LiveBroker()


# --- feeds ------------------------------------------------------------------

def test_synthetic_feed_is_seeded_and_positive():
    a = [SyntheticFeed(seed=1).next_price() for _ in range(20)]
    b = [SyntheticFeed(seed=1).next_price() for _ in range(20)]
    assert a[:1] == b[:1]
    feed = SyntheticFeed(seed=3)
    assert all(feed.next_price() > 0 for _ in range(200))


def test_synthetic_feed_differs_across_seeds():
    a = SyntheticFeed(seed=1).next_price()
    b = SyntheticFeed(seed=2).next_price()
    assert a != b


def test_csv_feed_replays_then_stops(tmp_path):
    path = tmp_path / "prices.csv"
    with path.open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["timestamp", "price"])
        for i in range(3):
            writer.writerow([i, 1.0 + i])
    feed = CsvFeed(path=path)
    assert [feed.next_price() for _ in range(3)] == [1.0, 2.0, 3.0]
    with pytest.raises(StopIteration):
        feed.next_price()


def test_csv_feed_rejects_a_file_with_no_price_column(tmp_path):
    path = tmp_path / "bad.csv"
    path.write_text("timestamp,close\n1,2\n")
    with pytest.raises(ValueError, match="price"):
        CsvFeed(path=path)


def test_feed_spec_parsing():
    assert isinstance(build_feed("synthetic"), SyntheticFeed)
    with pytest.raises(ValueError, match="unrecognised feed spec"):
        build_feed("nonsense")
    with pytest.raises(ValueError, match="unrecognised feed spec"):
        build_feed("notapreset:abc")


# --- the loop ---------------------------------------------------------------

def _curve() -> TasteCurve:
    """A stand-in taste curve with the shape the real one has: a dead zone,
    a rise, then saturation."""
    stim = [0.0, 20.0, 40.0, 60.0, 80.0, 100.0, 150.0, 200.0]
    mn9 = [0.0, 0.0, 0.0, 10.0, 40.0, 70.0, 95.0, 100.0]
    return TasteCurve(
        stim_hz=stim,
        mn9_hz=mn9,
        mn9_hz_std=[0.0] * len(stim),
        n_active=[0.0] * len(stim),
        connectome_version="test",
        n_trials=1,
        duration_ms=1000.0,
        readout_ids=[1],
        stimulus_ids=[2],
    )


def test_curve_interpolation_is_clamped_at_both_ends():
    curve = _curve()
    assert curve.response(-50.0) == 0.0
    assert curve.response(10_000.0) == pytest.approx(100.0)
    assert curve.threshold_hz == 60.0


def test_trader_runs_and_records_every_tick():
    trader = FlyTrader(feed=SyntheticFeed(seed=5), curve=_curve(), seed=5)
    session = trader.run(120)
    assert len(session.ticks) == 120
    assert all(math.isfinite(t.equity) and t.equity >= 0 for t in session.ticks)
    assert session.starting_equity == 1000.0


def test_trader_stops_when_the_feed_runs_out(tmp_path):
    path = tmp_path / "short.csv"
    path.write_text("price\n1\n2\n3\n")
    trader = FlyTrader(feed=CsvFeed(path=path), curve=_curve())
    session = trader.run(50)
    assert len(session.ticks) == 3


def test_a_falling_market_keeps_the_fly_flat():
    """Nothing about a downtrend is sweet, so the fly should never open."""

    class Falling:
        symbol = "DOWN"

        def __init__(self):
            self.price = 100.0

        def next_price(self):
            self.price *= 0.97
            return self.price

    trader = FlyTrader(feed=Falling(), curve=_curve())
    session = trader.run(100)
    assert session.n_fills == 0
    assert session.time_in_market == 0.0
    assert session.final_equity == pytest.approx(1000.0)


def test_a_rising_market_gets_the_fly_invested():
    class Rising:
        symbol = "UP"

        def __init__(self):
            self.price = 1.0

        def next_price(self):
            self.price *= 1.02
            return self.price

    trader = FlyTrader(feed=Rising(), curve=_curve())
    session = trader.run(120)
    assert session.n_fills > 0
    assert session.time_in_market > 0.5
    assert session.total_return > 0.0


def test_session_metrics_are_coherent():
    trader = FlyTrader(feed=SyntheticFeed(seed=11), curve=_curve(), seed=11)
    session = trader.run(200)
    summary = session.summary()
    assert -1.0 <= summary["max_drawdown"] <= 0.0
    assert 0.0 <= summary["time_in_market"] <= 1.0
    assert summary["final_equity"] == pytest.approx(session.ticks[-1].equity)
