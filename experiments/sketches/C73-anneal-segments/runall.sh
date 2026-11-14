#!/bin/sh
# C73: everything pre-registered in PREREG.txt (test seeds 101-105).
cd "$(dirname "$0")"
for c in 2 4 8 16; do CPC=$c MODE=seg SEGN=all ANNEAL=1 node sketch.js > run-anneal1-c$c.txt & done
CPC=8 MODE=seg SEGN=all ANNEAL=2 MS=100,400 node sketch.js > run-anneal2-c8.txt &
wait
