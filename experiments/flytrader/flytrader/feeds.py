"""Price sources.

Everything downstream needs one thing: a sequence of prices, oldest first.
Feeds are kept behind that narrow interface so the fly can be driven by a
synthetic series, a recorded CSV, or a live quote endpoint without any of the
rest of the code knowing which.

Network status, stated plainly: the HTTP feed below was written against the
documented response shapes of the listed endpoints but could NOT be exercised,
because every crypto price API is blocked by this sandbox's egress proxy. The
synthetic and CSV feeds are tested. Treat `HttpFeed` as unverified until you
have run `python -m flytrader doctor --feed <name>` on a machine with network
access.
"""

from __future__ import annotations

import csv
import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol, Sequence

import numpy as np


class PriceFeed(Protocol):
    """A source of prices for one token."""

    symbol: str

    def next_price(self) -> float:
        """The current price. Called once per trading tick."""
        ...


@dataclass
class SyntheticFeed:
    """A made-up price series with memecoin manners.

    Geometric Brownian motion with a fat-tailed jump component, because the
    thing that makes memecoins memecoins is that the tails are where all the
    action is and a plain lognormal walk will flatter any strategy that is
    tested on it. Seeded, so a backtest is reproducible.
    """

    symbol: str = "SYNTH"
    start_price: float = 1.0
    drift: float = 0.0
    """Per-tick log drift. Zero by default: no free lunch handed to the fly."""

    volatility: float = 0.04
    """Per-tick standard deviation of log returns."""

    jump_probability: float = 0.02
    jump_scale: float = 0.25
    """Jumps are drawn from a Laplace distribution, so both directions are
    equally likely and large moves are not vanishingly rare."""

    seed: int | None = 0
    _price: float = field(init=False)
    _rng: np.random.Generator = field(init=False)

    def __post_init__(self) -> None:
        if self.start_price <= 0:
            raise ValueError("start_price must be positive")
        self._price = float(self.start_price)
        self._rng = np.random.default_rng(self.seed)

    def next_price(self) -> float:
        step = self.drift + self._rng.normal(0.0, self.volatility)
        if self._rng.random() < self.jump_probability:
            step += self._rng.laplace(0.0, self.jump_scale)
        self._price *= float(np.exp(step))
        # A memecoin can go to nearly nothing, but not to zero or negative.
        self._price = max(self._price, 1e-12)
        return self._price


@dataclass
class CsvFeed:
    """Replay recorded prices from a CSV file.

    The file needs a price column; a timestamp column is read if present but
    only used for the ledger. Use this to backtest the fly on real history.
    """

    path: Path | str
    symbol: str = "CSV"
    price_column: str = "price"
    timestamp_column: str = "timestamp"
    _prices: list[float] = field(init=False, default_factory=list)
    _cursor: int = field(init=False, default=0)

    def __post_init__(self) -> None:
        path = Path(self.path)
        with path.open(newline="") as handle:
            reader = csv.DictReader(handle)
            if reader.fieldnames is None or self.price_column not in reader.fieldnames:
                raise ValueError(
                    f"{path} has no '{self.price_column}' column "
                    f"(found: {reader.fieldnames})"
                )
            for row in reader:
                raw = row[self.price_column]
                if raw in (None, ""):
                    continue
                self._prices.append(float(raw))
        if not self._prices:
            raise ValueError(f"{path} contains no prices")

    def __len__(self) -> int:
        return len(self._prices)

    @property
    def exhausted(self) -> bool:
        return self._cursor >= len(self._prices)

    def next_price(self) -> float:
        if self.exhausted:
            raise StopIteration(f"{self.path} exhausted after {len(self._prices)} prices")
        price = self._prices[self._cursor]
        self._cursor += 1
        return price


# Response shapes for public quote endpoints. `path` walks the decoded JSON;
# a {mint} placeholder in the URL is filled with the token address.
FEED_PRESETS: dict[str, dict] = {
    "jupiter": {
        "url": "https://lite-api.jup.ag/price/v3?ids={mint}",
        "path": ["{mint}", "usdPrice"],
    },
    "dexscreener": {
        "url": "https://api.dexscreener.com/latest/dex/tokens/{mint}",
        "path": ["pairs", 0, "priceUsd"],
    },
    "coingecko": {
        "url": "https://api.coingecko.com/api/v3/simple/price?ids={mint}&vs_currencies=usd",
        "path": ["{mint}", "usd"],
    },
}


@dataclass
class HttpFeed:
    """Poll a JSON quote endpoint.

    UNVERIFIED - see the module docstring. The request shapes come from each
    provider's documentation, not from a successful call.
    """

    mint: str
    preset: str = "jupiter"
    symbol: str = "TOKEN"
    timeout: float = 10.0
    retries: int = 3

    def __post_init__(self) -> None:
        if self.preset not in FEED_PRESETS:
            raise ValueError(
                f"unknown feed preset {self.preset!r}; "
                f"choose from {sorted(FEED_PRESETS)}"
            )

    def _extract(self, payload):
        node = payload
        for key in FEED_PRESETS[self.preset]["path"]:
            if isinstance(key, str):
                key = key.replace("{mint}", self.mint)
            try:
                node = node[key]
            except (KeyError, IndexError, TypeError) as exc:
                raise ValueError(
                    f"{self.preset} response did not contain a price at the "
                    f"expected location: {exc}"
                ) from exc
        return float(node)

    def next_price(self) -> float:
        url = FEED_PRESETS[self.preset]["url"].replace("{mint}", self.mint)
        last: Exception | None = None
        for attempt in range(self.retries):
            try:
                request = urllib.request.Request(
                    url, headers={"Accept": "application/json", "User-Agent": "flytrader"}
                )
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    return self._extract(json.loads(response.read().decode()))
            except (urllib.error.URLError, TimeoutError, ValueError) as exc:
                last = exc
                if attempt < self.retries - 1:
                    time.sleep(2.0 ** attempt)
        raise RuntimeError(f"{self.preset} feed failed after {self.retries} attempts: {last}")


def build_feed(spec: str, **kwargs) -> PriceFeed:
    """Build a feed from a short spec string.

    ``synthetic``, ``csv:<path>``, or ``<preset>:<mint>``.
    """
    if spec == "synthetic":
        return SyntheticFeed(**kwargs)
    if spec.startswith("csv:"):
        return CsvFeed(path=spec[4:], **kwargs)
    if ":" in spec:
        preset, mint = spec.split(":", 1)
        if preset in FEED_PRESETS:
            return HttpFeed(mint=mint, preset=preset, **kwargs)
    raise ValueError(
        f"unrecognised feed spec {spec!r}. Use 'synthetic', 'csv:<path>', "
        f"or one of {sorted(FEED_PRESETS)} as '<preset>:<mint>'."
    )
