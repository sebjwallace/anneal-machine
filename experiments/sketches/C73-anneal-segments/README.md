# C73 · Anneal's segment rule on sketch 38's worlds

C71 (sketch 38, from the owner's other repository) with one mode added: segments fire at two active links (the bar from
Anneal's prices) and compete in each column, a tie refusing the column. Everything else is C71's, unchanged. Hypothesis,
predictions and findings: [hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `./runall.sh` (about 15 minutes; run at most two at a time, each takes about 1.5 GB). A single run:
`CPC=8 MODE=seg SEGN=all ANNEAL=1 node sketch.js`. `ANNEAL=2` drops the cap of K columns (the control).

**In short:** as good as whole-set segments on episodes (69-95%), never blends a split cue, and completes from half a cue
28-42% of the time where C71's segments never did. But the cap of 8 columns, given by hand, does the work of competition
across columns: without it, everything blends.
