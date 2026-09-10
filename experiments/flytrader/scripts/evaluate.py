"""Evaluate the fly over many synthetic series and report honestly.

A single backtest of a threshold strategy on a jump-diffusion series is close
to meaningless - the result is dominated by whether that particular path
happened to trend. So run a lot of paths and report the distribution, plus the
same runs with costs switched off, which separates "the signal is bad" from
"the signal is fine and turnover eats it".

    python scripts/evaluate.py [--runs 60] [--ticks 500]
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from flytrader import FlyTrader, PaperBroker, SyntheticFeed, TasteCurve  # noqa: E402


def run_batch(curve, runs: int, ticks: int, fee_rate: float, slippage: float):
    out = []
    for seed in range(runs):
        trader = FlyTrader(
            feed=SyntheticFeed(seed=seed),
            curve=curve,
            broker=PaperBroker(starting_cash=1000.0, fee_rate=fee_rate, slippage_rate=slippage),
            seed=seed,
        )
        session = trader.run(ticks)
        out.append(
            (
                session.total_return,
                session.buy_and_hold_return,
                session.max_drawdown,
                session.time_in_market,
                session.n_fills,
            )
        )
    return np.array(out)


def report(label: str, data: np.ndarray) -> None:
    fly, bh, dd, tim, fills = data.T
    print(f"\n{label}")
    print(f"  {'':18}{'median':>9}{'mean':>9}{'p10':>9}{'p90':>9}")
    for name, values in (("fly return", fly), ("buy and hold", bh), ("max drawdown", dd)):
        print(
            f"  {name:18}{np.median(values):>8.1%}{values.mean():>9.1%}"
            f"{np.percentile(values, 10):>9.1%}{np.percentile(values, 90):>9.1%}"
        )
    print(f"  beat buy-and-hold in {(fly > bh).mean():.0%} of runs")
    print(f"  profitable in        {(fly > 0).mean():.0%} of runs")
    print(f"  time in market       {tim.mean():.0%}, {fills.mean():.0f} fills per run")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--runs", type=int, default=60)
    parser.add_argument("--ticks", type=int, default=500)
    args = parser.parse_args()

    curve = TasteCurve.load()
    print(f"{args.runs} runs x {args.ticks} ticks, FlyWire v{curve.connectome_version}")

    report(
        "With realistic costs (0.25% fee, 0.5% slippage)",
        run_batch(curve, args.runs, args.ticks, 0.0025, 0.005),
    )
    report(
        "With zero costs (isolates the signal from turnover drag)",
        run_batch(curve, args.runs, args.ticks, 0.0, 0.0),
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
