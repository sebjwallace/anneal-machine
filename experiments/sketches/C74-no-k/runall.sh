#!/bin/sh
# C74: everything pre-registered in PREREG.txt. Two at a time (each run takes about 1.5 GB).
cd "$(dirname "$0")"
CPC=2 MODE=seg SEGN=all ANNEAL=3 node sketch.js > run-top-c2.txt & CPC=4 MODE=seg SEGN=all ANNEAL=3 node sketch.js > run-top-c4.txt & wait
CPC=8 MODE=seg SEGN=all ANNEAL=3 node sketch.js > run-top-c8.txt & CPC=16 MODE=seg SEGN=all ANNEAL=3 node sketch.js > run-top-c16.txt & wait
CPC=8 MODE=seg SEGN=all ANNEAL=4 MS=100,400 node sketch.js > run-half-c8.txt
