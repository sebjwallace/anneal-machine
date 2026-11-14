# C77 · Binding with competition

C76 with two fixes for crowding tried: more cells per column (the owner's), and C74's top-level competition. Hypothesis,
predictions, findings: [hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `node run.js` (about a minute; `SEEDS=1` is the development seed).

**In short:** more cells per column fixes it (96% clean at 500 compositions with 64 cells, against 45% with 16);
competition can't, because a part that shares cells by chance gets the same support as a true one. At 64 cells, storing
50 times more raised the work per recall by less than double: cost follows what is active, not what is stored.
