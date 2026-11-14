# Findings 04: AND as learnt segments

*Findings from sketch 36, November 2026. Tests [hypothesis 04](hypothesis.md).*

## What was tested

Can a cell learn a soft AND? The mechanism: a cell grows a **segment** (a small sample of the cells active at the time) when it is hot, and keeps it only if it helps the cell fit.

It was tested in two worlds where the outcome depends on a combination, such as "grey cat" + "bowl full" → "eating". In world a, any single token predicts at most about 40% of outcomes. World b is larger and adds two individual exceptions.

Segments were compared with:
- plain links (OR only);
- the hashed-pair shortcut used before.

There were 10 fresh test seeds, with settings fixed in advance and nothing changed after the test runs.

## Results

| world a / world b | plain links | hashed pairs | **segments** |
|---|---|---|---|
| seen combinations | .36 / .25 | 1.00 / .99 | **.98 / .90** |
| held-out combinations | .26 / .13 | .12 / .10 | **.84 / .71** |
| with the colour word dropped | .37 / .26 | .62 / .31 | **.89 / .87** |

## What held

1. **Learnt combinations work.** Plain links stay stuck at what single inputs allow. Segments learn the combinations almost as well as the hand-made shortcut, and learn them faster early on.
2. **They are soft.** A segment still fires 97–99% of the time with one input missing.
3. **They generalise where the shortcut can't.** On held-out combinations, segments reach .84 / .71, while the shortcut is at chance, because it shares nothing between combinations.
4. **The surviving population is small.** About 60–95 segments, in a world with thousands of events.
5. **It works across a range of settings, not one tuned value.** Segment sizes 8–16 with a threshold of 75% passed in both worlds, and so did size 4 with a threshold of 100%. A threshold of 50% failed: about 6,000 segments and chance accuracy. A threshold of 100% with large segments memorised and didn't generalise.

## What didn't

- **Growth never stops.** About 11–14 segments are grown for every one that survives, and growth continues at a low rate to the end. The population stays flat because pruning keeps pace, but that's wasted work.
- **The transfer goes through shared words, not shared kinds.** The hypothesis said segments would generalise through shared columns, i.e. kind. In fact 98% of the segments doing the work were grown on the same animal with another colour. They transfer through the shared "cat" assembly. True kind-level transfer, where things share columns but no word, is untested.
- **Individual exceptions get outvoted.** "ginger cat" + "bowl full" → "hiding" is right only 65% of the time, against 100% for the shortcut. The kind-level segment wins.
  *Correction from sketch 39:* one of world b's two "exceptions" ("white dog" + "light off" → "eating") was the same as the kind rule, so it wasn't an exception at all. The real exception scored about 30%, not 65%. That makes the case for NOT stronger.
- **Cost:** about 50% more work per event, because every segment is checked on every event.

## Conclusions

1. **AND can be learnt locally from heat, with no labels.** Segments replace the hashed shortcut and generalise better. Hypothesis 04 is supported.
2. **Growth needs a stopping signal.** A likely candidate is heat itself: a cell whose existing segments already fit should stop growing new ones. As it stands, cells keep sampling.
3. **Exceptions need NOT.** A specific exception can't beat a well-supported general segment by adding positive weight. "Cat and full bowl, unless it's the ginger cat" is exactly AND NOT, which is the motivation for [hypothesis 05](../C70-learnt-not/hypothesis.md).
4. **Efficiency:** segment matching should be event-driven: only segments with an active input get checked, via an index from cell to segment. That is a clear target for the distillation step.

## Next

- A test where kind-mates share columns but no word, to check kind-level transfer.
- Stopping growth when existing segments fit.
- AND NOT: segment-level inhibition, after sketch 37.

## Reproduce

```
cd sketches/36-learnt-and && ./runall.sh     # about 4 minutes; see NOTE.md and PREREG.txt
```
