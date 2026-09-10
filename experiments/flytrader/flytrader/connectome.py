"""Load the FlyWire FAFB adult brain connectome into a sparse CSR matrix.

Source data is the connectivity export published with Shiu et al. (2024),
"A leaky integrate-and-fire computational model based on the connectome of the
entire adult Drosophila brain reveals insights into sensorimotor processing"
(https://doi.org/10.1038/s41586-024-07763-9). See scripts/fetch_connectome.sh.

The parquet export is ~100 MB and takes several seconds to parse, which is far
too slow to do per market tick, so the first load caches a .npz of the CSR
arrays next to the source files. Subsequent loads are a memory-mapped read.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np

# Column names as published in Connectivity_783.parquet.
_COL_PRE = "Presynaptic_Index"
_COL_POST = "Postsynaptic_Index"
_COL_WEIGHT = "Excitatory x Connectivity"

DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


@dataclass(frozen=True)
class Connectome:
    """A weighted, directed connectome held as CSR indexed by presynaptic neuron.

    Row ``i`` holds the outgoing connections of neuron ``i``: reading a row gives
    every postsynaptic partner and the signed synapse count. That is the access
    pattern the simulation needs (a neuron spikes, we add its row to the pending
    conductance buffer), so CSR-by-presynaptic is the right orientation.

    Weights are signed synapse counts, not millivolts: negative means the
    published neurotransmitter prediction for the presynaptic neuron is
    inhibitory. Multiply by ``w_syn`` to get a conductance step.
    """

    indptr: np.ndarray  # int64, len n_neurons + 1
    indices: np.ndarray  # int32, postsynaptic indices
    weights: np.ndarray  # float32, signed synapse counts
    flywire_ids: np.ndarray  # int64, index -> FlyWire root ID

    @property
    def n_neurons(self) -> int:
        return len(self.flywire_ids)

    @property
    def n_connections(self) -> int:
        return len(self.indices)

    def index_of(self, flywire_id: int) -> int:
        """Map a FlyWire root ID to its row index, or raise KeyError."""
        pos = int(np.searchsorted(self._sorted_ids, flywire_id))
        if pos >= len(self._sorted_ids) or self._sorted_ids[pos] != flywire_id:
            raise KeyError(f"FlyWire ID {flywire_id} is not in this connectome")
        return int(self._sorted_order[pos])

    def indices_of(self, flywire_ids) -> np.ndarray:
        """Vectorised :meth:`index_of`. Raises KeyError naming every miss."""
        wanted = np.asarray(list(flywire_ids), dtype=np.int64)
        pos = np.searchsorted(self._sorted_ids, wanted)
        pos_clipped = np.clip(pos, 0, len(self._sorted_ids) - 1)
        missing = self._sorted_ids[pos_clipped] != wanted
        if missing.any():
            raise KeyError(
                "FlyWire IDs not in this connectome: "
                + ", ".join(str(i) for i in wanted[missing])
            )
        return self._sorted_order[pos_clipped].astype(np.int64)

    # Sorted-ID lookup table, built lazily so the dataclass stays cheap to pass
    # around. object.__setattr__ because the dataclass is frozen.
    @property
    def _sorted_ids(self) -> np.ndarray:
        self._ensure_lookup()
        return self.__dict__["_sorted_ids_cache"]

    @property
    def _sorted_order(self) -> np.ndarray:
        self._ensure_lookup()
        return self.__dict__["_sorted_order_cache"]

    def _ensure_lookup(self) -> None:
        if "_sorted_ids_cache" in self.__dict__:
            return
        order = np.argsort(self.flywire_ids, kind="stable")
        object.__setattr__(self, "_sorted_order_cache", order.astype(np.int64))
        object.__setattr__(self, "_sorted_ids_cache", self.flywire_ids[order])


def _cache_path(data_dir: Path, version: str) -> Path:
    return data_dir / f"connectome_{version}.npz"


def build_cache(data_dir: Path | str = DEFAULT_DATA_DIR, version: str = "783") -> Path:
    """Parse the published parquet/csv pair into a CSR .npz cache."""
    import pandas as pd  # imported lazily: only the cache build needs pandas

    data_dir = Path(data_dir)
    path_comp = data_dir / f"Completeness_{version}.csv"
    path_con = data_dir / f"Connectivity_{version}.parquet"
    for path in (path_comp, path_con):
        if not path.is_file():
            raise FileNotFoundError(
                f"{path} not found. Run scripts/fetch_connectome.sh to download "
                "the connectome export first."
            )

    # The completeness CSV is the authoritative neuron list, and its row order
    # defines the *_Index columns used by the connectivity table.
    df_comp = pd.read_csv(path_comp, index_col=0)
    flywire_ids = df_comp.index.to_numpy(dtype=np.int64)
    n = len(flywire_ids)

    df_con = pd.read_parquet(path_con, columns=[_COL_PRE, _COL_POST, _COL_WEIGHT])
    pre = df_con[_COL_PRE].to_numpy(dtype=np.int64)
    post = df_con[_COL_POST].to_numpy(dtype=np.int32)
    weight = df_con[_COL_WEIGHT].to_numpy(dtype=np.float32)

    if pre.size and (pre.max() >= n or post.max() >= n):
        raise ValueError(
            "connectivity indices exceed the neuron count; the completeness and "
            "connectivity files are from different releases"
        )

    # Counting sort into CSR. argsort would work but this avoids a 15M-element
    # int64 permutation array on top of everything else.
    counts = np.bincount(pre, minlength=n)
    indptr = np.zeros(n + 1, dtype=np.int64)
    np.cumsum(counts, out=indptr[1:])
    order = np.argsort(pre, kind="stable")

    data_dir.mkdir(parents=True, exist_ok=True)
    out = _cache_path(data_dir, version)
    np.savez(
        out,
        indptr=indptr,
        indices=post[order],
        weights=weight[order],
        flywire_ids=flywire_ids,
    )
    return out


def load_connectome(
    data_dir: Path | str = DEFAULT_DATA_DIR,
    version: str = "783",
    rebuild: bool = False,
) -> Connectome:
    """Load the connectome, building the CSR cache on first use."""
    data_dir = Path(data_dir)
    cache = _cache_path(data_dir, version)
    if rebuild or not cache.is_file():
        build_cache(data_dir, version)

    with np.load(cache) as z:
        return Connectome(
            indptr=z["indptr"].astype(np.int64),
            indices=z["indices"].astype(np.int32),
            weights=z["weights"].astype(np.float32),
            flywire_ids=z["flywire_ids"].astype(np.int64),
        )
