#!/bin/sh
# Every pre-registered run (test seeds 41-50). About 5 minutes in all.
cd "$(dirname "$0")"
p1() { env "$@" node part1-exceptions.js > "run-p1-$(echo "$@" | tr ' =' '_-').txt"; }
p23() { env "$@" node part23-entities.js > "run-p$(echo "$@" | grep -q CHG=1 && echo 3 || echo 2)-$(echo "$@" | tr ' =' '_-').txt"; }
for m in pos posmean ungated; do p1 MODE=$m; done
for b in 0 0.001 0.003 0.01 0.03 0.1; do p1 MODE=not BETA=$b; done
p1 MODE=pos NOISE=0.2; for b in 0 0.01 0.1; do p1 MODE=not NOISE=0.2 BETA=$b; done
for b in 0 0.01; do p1 MODE=not NEV=18000 BETA=$b; done
for id in none count ungated; do p23 ID=$id SCENE=0.2; done
for b in 0 0.005 0.015 0.05 0.15 0.5; do p23 ID=not SCENE=0.2 BETA=$b; done
for id in none count not; do p23 ID=$id SCENE=0.05; done
p23 ID=none CHG=1 SCENE=0
for b in 0 0.005 0.015 0.05 0.15 0.5; do p23 ID=not CHG=1 SCENE=0 BETA=$b; done
for id in none count not; do p23 ID=$id CHG=1 SCENE=0.2; done
