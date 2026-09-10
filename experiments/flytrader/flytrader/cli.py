"""Command line interface: python -m flytrader <command>"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from .decode import DecoderConfig
from .encode import EncoderConfig
from .execution import PaperBroker
from .feeds import FEED_PRESETS, SyntheticFeed, build_feed
from .taste import DEFAULT_CURVE_PATH, TasteCurve, calibrate
from .trader import FlyTrader


def _load_brain(version: str, data_dir: str | None):
    from .brain import FlyBrain
    from .connectome import DEFAULT_DATA_DIR, load_connectome

    connectome = load_connectome(data_dir or DEFAULT_DATA_DIR, version=version)
    return FlyBrain(connectome)


def cmd_calibrate(args) -> int:
    start = time.time()

    def progress(out, done, total):
        stim, rate, std, active = out
        print(
            f"[{done:2d}/{total}] {stim:5.0f} Hz sugar -> MN9 {rate:6.1f} Hz "
            f"(sd {std:4.1f}), {int(active):5d} neurons active  "
            f"[{time.time() - start:.0f}s]",
            flush=True,
        )

    frequencies = [float(f) for f in range(0, int(args.max_hz) + 1, int(args.step_hz))]
    curve = calibrate(
        frequencies=frequencies,
        version=args.version,
        duration_ms=args.duration_ms,
        n_trials=args.trials,
        n_procs=args.procs,
        progress=progress,
    )
    path = curve.save(args.out)
    print(f"\nSaved taste curve to {path}")
    print(f"  MN9 threshold:  {curve.threshold_hz:.0f} Hz sugar drive")
    print(f"  MN9 saturation: {curve.max_mn9_hz:.1f} Hz")
    return 0


def cmd_taste(args) -> int:
    curve = TasteCurve.load(args.curve)
    print(f"Taste curve  (FlyWire v{curve.connectome_version}, "
          f"{curve.n_trials} trials x {curve.duration_ms:.0f} ms)")
    print(f"  stimulus: {len(curve.stimulus_ids)} sugar GRNs")
    print(f"  readout:  {len(curve.readout_ids)} MN9 neurons\n")

    width = 44
    peak = max(curve.max_mn9_hz, 1e-9)
    print(f"  {'sugar':>6}  {'MN9':>7}   response")
    for stim, rate in zip(curve.stim_hz, curve.mn9_hz):
        bar = "#" * int(round(rate / peak * width))
        print(f"  {stim:5.0f}Hz {rate:6.1f}Hz  |{bar}")
    print(f"\n  threshold {curve.threshold_hz:.0f} Hz, saturating at {curve.max_mn9_hz:.1f} Hz")
    return 0


def _build_trader(args, curve: TasteCurve) -> FlyTrader:
    if args.feed == "synthetic":
        feed = SyntheticFeed(
            symbol="SYNTH",
            volatility=args.volatility,
            jump_probability=args.jump_probability,
            seed=args.seed,
        )
    else:
        feed = build_feed(args.feed)

    brain = _load_brain(curve.connectome_version, args.data_dir) if args.live_brain else None

    return FlyTrader(
        feed=feed,
        curve=curve,
        broker=PaperBroker(
            starting_cash=args.cash,
            fee_rate=args.fee_rate,
            slippage_rate=args.slippage,
        ),
        encoder=EncoderConfig(sensitivity=args.sensitivity),
        decoder=DecoderConfig(
            max_weight=args.max_weight,
            enter_at=args.enter_at,
            exit_at=args.exit_at,
        ),
        brain=brain,
        live_brain=args.live_brain,
        seed=args.seed,
    )


def _print_tick(tick) -> None:
    marker = "PER" if tick.intent.extended else "   "
    fill = ""
    if tick.fill:
        fill = f"  {tick.fill.side:4s} {tick.fill.quantity:10.4f} @ {tick.fill.price:.6f}"
    print(
        f"  {tick.index:4d}  px {tick.price:10.6f}  sweet {tick.taste.sweetness:4.2f} "
        f"-> {tick.taste.stim_hz:5.1f}Hz  MN9 {tick.mn9_hz:6.1f}Hz {marker}  "
        f"w {tick.weight:4.2f}  eq {tick.equity:9.2f}{fill}"
    )


def _report(session, label: str) -> None:
    s = session.summary()
    print(f"\n{label}")
    print(f"  ticks               {s['ticks']}")
    print(f"  fills               {s['fills']}")
    print(f"  time in market      {s['time_in_market']:.0%}")
    print(f"  starting equity     {s['starting_equity']:.2f}")
    print(f"  final equity        {s['final_equity']:.2f}")
    print(f"  fly return          {s['total_return']:+.2%}")
    print(f"  buy and hold        {s['buy_and_hold_return']:+.2%}")
    print(f"  max drawdown        {s['max_drawdown']:.2%}")
    verdict = "beat" if s["total_return"] > s["buy_and_hold_return"] else "lost to"
    print(f"\n  The fly {verdict} buy-and-hold on this series.")


def cmd_backtest(args) -> int:
    curve = TasteCurve.load(args.curve)
    trader = _build_trader(args, curve)
    if args.verbose:
        print(f"Running {args.ticks} ticks on feed '{args.feed}'\n")
    session = trader.run(args.ticks, on_tick=_print_tick if args.verbose else None)
    _report(session, f"Backtest: {args.feed}")
    if args.json:
        Path(args.json).write_text(json.dumps(session.summary(), indent=2) + "\n")
        print(f"\n  summary written to {args.json}")
    return 0


def cmd_trade(args) -> int:
    """Paper-trade a live feed on an interval."""
    curve = TasteCurve.load(args.curve)
    trader = _build_trader(args, curve)
    print(
        f"Paper trading '{args.feed}' every {args.interval}s. "
        f"No real orders are placed. Ctrl-C to stop.\n"
    )
    try:
        for i in range(args.ticks):
            _print_tick(trader.step())
            if i < args.ticks - 1:
                time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nstopped")
    _report(trader.session, f"Paper session: {args.feed}")
    return 0


def cmd_doctor(args) -> int:
    """Check that the data, the curve and the feeds are usable."""
    ok = True

    print("connectome")
    try:
        brain = _load_brain(args.version, args.data_dir)
        from .neurons import MN9, SUGAR_GRN_RIGHT

        c = brain.connectome
        print(f"  ok      v{args.version}: {c.n_neurons:,} neurons, "
              f"{c.n_connections:,} connections")
        c.indices_of(SUGAR_GRN_RIGHT)
        c.indices_of(MN9)
        print(f"  ok      all {len(SUGAR_GRN_RIGHT)} sugar GRNs and "
              f"{len(MN9)} MN9 neurons resolve")
    except Exception as exc:  # noqa: BLE001 - a doctor reports, it does not raise
        ok = False
        print(f"  FAIL    {exc}")

    print("\ntaste curve")
    try:
        curve = TasteCurve.load(args.curve)
        print(f"  ok      {len(curve.stim_hz)} points, threshold "
              f"{curve.threshold_hz:.0f} Hz, peak {curve.max_mn9_hz:.1f} Hz")
    except Exception as exc:  # noqa: BLE001
        ok = False
        print(f"  FAIL    {exc}")

    print("\nsynthetic feed")
    try:
        feed = SyntheticFeed(seed=0)
        prices = [feed.next_price() for _ in range(5)]
        print(f"  ok      {['%.4f' % p for p in prices]}")
    except Exception as exc:  # noqa: BLE001
        ok = False
        print(f"  FAIL    {exc}")

    if args.feed:
        print(f"\nfeed '{args.feed}'")
        try:
            price = build_feed(args.feed).next_price()
            print(f"  ok      price {price}")
        except Exception as exc:  # noqa: BLE001
            ok = False
            print(f"  FAIL    {exc}")

    print("\n" + ("all checks passed" if ok else "some checks failed"))
    return 0 if ok else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="flytrader",
        description="Trade memecoins with a simulated fruit fly brain. Paper only.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("calibrate", help="measure the fly's sugar -> MN9 response curve")
    p.add_argument("--version", default="630", help="connectome version (default 630)")
    p.add_argument("--max-hz", type=float, default=200, help="top stimulation frequency")
    p.add_argument("--step-hz", type=float, default=10, help="frequency step")
    p.add_argument("--duration-ms", type=float, default=1000.0, help="trial length")
    p.add_argument("--trials", type=int, default=5, help="trials per frequency")
    p.add_argument("--procs", type=int, default=1, help="parallel worker processes")
    p.add_argument("--out", default=str(DEFAULT_CURVE_PATH), help="output path")
    p.set_defaults(func=cmd_calibrate)

    p = sub.add_parser("taste", help="print the calibrated response curve")
    p.add_argument("--curve", default=str(DEFAULT_CURVE_PATH))
    p.set_defaults(func=cmd_taste)

    def add_trading_args(p):
        p.add_argument("--curve", default=str(DEFAULT_CURVE_PATH))
        p.add_argument("--feed", default="synthetic",
                       help=f"'synthetic', 'csv:<path>', or <preset>:<mint> "
                            f"where preset is one of {sorted(FEED_PRESETS)}")
        p.add_argument("--cash", type=float, default=1000.0)
        p.add_argument("--fee-rate", type=float, default=0.0025)
        p.add_argument("--slippage", type=float, default=0.005)
        p.add_argument("--sensitivity", type=float, default=1.5,
                       help="volatility units of momentum that count as maximally sweet")
        p.add_argument("--max-weight", type=float, default=1.0)
        p.add_argument("--enter-at", type=float, default=0.25)
        p.add_argument("--exit-at", type=float, default=0.10)
        p.add_argument("--volatility", type=float, default=0.04,
                       help="synthetic feed only: per-tick log return sd")
        p.add_argument("--jump-probability", type=float, default=0.02,
                       help="synthetic feed only")
        p.add_argument("--seed", type=int, default=0)
        p.add_argument("--live-brain", action="store_true",
                       help="run the full simulation every tick instead of "
                            "interpolating the curve (seconds per tick)")
        p.add_argument("--data-dir", default=None)

    p = sub.add_parser("backtest", help="run the fly over a price series")
    p.add_argument("--ticks", type=int, default=500)
    p.add_argument("--verbose", "-v", action="store_true")
    p.add_argument("--json", default=None, help="write the summary here")
    add_trading_args(p)
    p.set_defaults(func=cmd_backtest)

    p = sub.add_parser("trade", help="paper-trade a feed on an interval")
    p.add_argument("--ticks", type=int, default=60)
    p.add_argument("--interval", type=float, default=30.0, help="seconds between ticks")
    add_trading_args(p)
    p.set_defaults(func=cmd_trade)

    p = sub.add_parser("doctor", help="check data, curve and feeds")
    p.add_argument("--version", default="630")
    p.add_argument("--curve", default=str(DEFAULT_CURVE_PATH))
    p.add_argument("--data-dir", default=None)
    p.add_argument("--feed", default=None, help="also test this feed spec")
    p.set_defaults(func=cmd_doctor)

    return parser


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
