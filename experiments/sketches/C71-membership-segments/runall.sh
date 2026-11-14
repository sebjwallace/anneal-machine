#!/bin/sh
# every pre-registered run (see PREREG.txt); seeds 101-105; each run is about a minute; two at a time
cd "$(dirname "$0")"
{
for C in 2 4 8 16; do
  echo "sumfit-c$C MODE=sum NORM=fit CPC=$C"
  echo "sumraw-c$C MODE=sum NORM=raw CPC=$C"
  echo "seg16-c$C MODE=seg SEGN=16 CPC=$C"
  echo "segall-c$C MODE=seg SEGN=all CPC=$C"
  echo "seg16cast-c$C MODE=seg SEGN=16 CAST=1 CPC=$C"
  echo "segallcast-c$C MODE=seg SEGN=all CAST=1 CPC=$C"
done
echo "segall-t0.6-c8 MODE=seg SEGN=all THETA=0.6 CPC=8"
echo "segall-t0.7-c8 MODE=seg SEGN=all THETA=0.7 CPC=8"
echo "segall-t0.8-c8 MODE=seg SEGN=all THETA=0.8 CPC=8"
echo "seg16rare-c8 MODE=seg SEGN=16 SAMPLE=rare CPC=8"
echo "segall-noctx-c8 MODE=seg SEGN=all CTX=0 CPC=8"
echo "sumraw-noctx-c8 MODE=sum NORM=raw CTX=0 CPC=8"
} | while read name args; do
  echo "$name a MS=25,50,100,200 $args"
  echo "$name b MS=400 $args"
done | xargs -P2 -L1 sh -c 'n=$0; g=$1; shift 1; env "$@" node sketch.js > run-$n-$g.txt'
node summary.js > summary.txt
