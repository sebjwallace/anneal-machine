#!/bin/sh
cd "$(dirname "$0")"
CUTS=top node run.js > out-top.txt
CUTS=all CS=64 MS=10,50 node run.js > out-all-c64.txt & CUTS=all CS=16 MS=10 node run.js > out-all-c16.txt & wait
