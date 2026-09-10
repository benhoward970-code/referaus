#!/usr/bin/env bash
# Fetch the FlyWire adult Drosophila connectome export used by this project.
#
# The data is not vendored: the two files together are ~370 MB. They are
# published alongside Shiu et al. (2024) in the repository accompanying the
# paper, which is the same source the paper's own figures were computed from.
#
# Version 630 is the default because the neuron IDs published with the paper
# (the sugar GRNs and MN9) all resolve in it. Two of them do not exist in v783:
# FlyWire root IDs change as proofreading merges and splits cells.
set -euo pipefail

REPO="https://github.com/philshiu/Drosophila_brain_model.git"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA="$HERE/data"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$DATA"

if [[ -f "$DATA/Completeness_630.csv" && -f "$DATA/Connectivity_630.parquet" ]]; then
  echo "Connectome already present in $DATA. Delete the files to re-fetch."
  exit 0
fi

echo "Cloning connectome data (~370 MB) from $REPO ..."
git clone --depth 1 "$REPO" "$TMP/dbm"

echo "Installing into $DATA ..."
cp "$TMP/dbm/2023_03_23_completeness_630_final.csv" "$DATA/Completeness_630.csv"
cp "$TMP/dbm/2023_03_23_connectivity_630_final.parquet" "$DATA/Connectivity_630.parquet"
# v783 is the current public release; kept for anyone who wants to compare.
cp "$TMP/dbm/Completeness_783.csv" "$DATA/Completeness_783.csv"
cp "$TMP/dbm/Connectivity_783.parquet" "$DATA/Connectivity_783.parquet"

echo
echo "Done. Next:"
echo "  python -m flytrader doctor"
echo "  python -m flytrader calibrate --procs 4   # a few minutes"
echo "  python -m flytrader backtest --ticks 500"
