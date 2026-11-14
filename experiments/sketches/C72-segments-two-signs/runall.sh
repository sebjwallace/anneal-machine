#!/bin/sh
# every pre-registered run (see PREREG.txt); each takes 10-40 s
cd "$(dirname "$0")"
for W in a b; do
  for M in exc word nand andnot; do for S in 0 1; do WORLD=$W MODE=$M STOP=$S node sketch.js > run-$W-$M-stop$S.txt; done; done
  WORLD=$W MODE=nandug node sketch.js > run-$W-nandug-stop0.txt
done
for M in nand andnot; do WORLD=b MODE=$M STOP=1 NEV=18000 node sketch.js > run-b-$M-stop1-long.txt; done
