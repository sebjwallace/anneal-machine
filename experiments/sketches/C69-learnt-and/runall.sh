#!/bin/sh
# every pre-registered run (see PREREG.txt); each takes a few seconds (the long runs about 20 s)
cd "$(dirname "$0")"
for W in a b; do
  for M in plain hash hashtok; do WORLD=$W MODE=$M node sketch.js > run-$W-$M.txt; done
  for N in 4 8 16; do for T in 0.5 0.75 1; do WORLD=$W SEGN=$N THETA=$T node sketch.js > run-$W-seg-n$N-t$T.txt; done; done
  WORLD=$W COLS=0 node sketch.js > run-$W-seg-cells-only.txt
  WORLD=$W NEV=12000 node sketch.js > run-$W-seg-long.txt
done
