# Findings 07: segments with two signs (AND and NAND)

*Findings from sketch 39, November 2026. Tests [hypothesis 07](hypothesis.md).*

## What was tested

One segment type, grown by one rule from the two signs of heat:
- a cell that should have fired and didn't grows an **excitatory** segment;
- a cell that fired and shouldn't have grows an **inhibitory** segment.

"Shouldn't have" means the automaton's own wrong prediction, never the correct answer.

Inhibition was tested in two placements: on the whole cell (**NAND**), and on one excitatory segment (**AND NOT**). These were compared with excitatory segments only (sketch 36) and with single-word inhibition (sketch 37). There were 10 fresh test seeds, settings fixed in advance, and nothing changed after looking.

## Results

Last quarter of the stream, world a / world b:

| | excitatory only | single-word NOT | **NAND** | **AND NOT** |
|---|---|---|---|---|
| individual exceptions | .51 / .29 | .62 / .37 | .84 / .60 | **.84 / .62** |
| general rule | .88 / .86 | .84 / .82 | .97 / .94 | **.97 / .93** |
| held-out combinations | .57 / .76 | .50 / .71 | .68 / .65 | **.70 / .82** |
| far from any exception | 1.00 / .90 | .85 / .89 | 1.00 / .97 | **1.00 / .97** |
| work per event (synapse checks) | 583 / 879 | 628 / 974 | 2854 / 4656 | **734 / 1136** |
| inhibitory units alive at end | 0 | ~5,000 links | 323 / 520 | **45 / 66** |

## What held

1. **Inhibitory segments learn combination exceptions.** Accuracy on exceptions roughly doubled against excitatory segments only, and rose well above single-word inhibition.
2. **The general rule gets better, not worse.** It rose from .86–.88 to .93–.97, because inhibition removes the rule's own mistakes instead of fighting it.
3. **No collateral damage.** Single-word inhibition was the only version that hurt combinations far from any exception. Inhibitory segments left them intact.
4. **One rule does both jobs.** Both signs use the same code and constants, with nothing tuned separately.
5. **It stays balanced without a balance rule**, as in sketch 37.
6. **AND NOT is the better placement.** It matched NAND on exceptions, was better on held-out combinations, needed far fewer inhibitory units (45–66 against 323–520), and cost 1.3× the work of excitatory segments only, against 5× for NAND.

## What didn't

- **Exceptions fell short of the predicted ~90%,** reaching .62–.84. A diagnostic run after the test runs (post hoc) shows the remaining failures are mostly on the excitatory side: the general rule is suppressed, but nothing strong yet drives the exception's own outcome.
- **The stop signal cost accuracy.** Growing segments only in proportion to a cell's recent misfit cut growth by 30–40%, but never to zero. It also hurt exceptions and held-out combinations, because the cells that mostly fit are exactly the ones that have to learn the rare exception. So heat averaged over a cell is the wrong stop signal. It needs to be local to the specific context.
- **NAND on the whole cell is wasteful.** Its inhibitory segments got strengthened while firing on cells nothing was driving, which is why there were hundreds of them.
- **Small samples.** Only 2 individual exceptions per seed, so differences of about .1 are within seed spread. Three development seeds were used rather than one.
- **A correction to findings 04.** Sketch 36's world b had a bug: one "exception" was the same as the rule, so its reported 65% on exceptions was really about 30% on the one real exception. Findings 04 now notes this.

## Conclusions

1. **Hypothesis 07 is mostly supported.** One segment type with two signs, grown by one rule from the sign of heat, learns combination exceptions, improves the rule, and avoids the collateral damage of single-word inhibition. Prediction 1's threshold of ~90% was not met.
2. **Inhibition belongs on segments, not on whole cells.** AND NOT ("for this reason, unless …") is more accurate, much cheaper and much leaner than NAND on the cell.
3. **The stop signal is still open.** It must be local to a context, not a cell-wide average, or it stops exactly the learning exceptions need.
4. **For the distillation:** excitatory segments plus inhibitory segments on segments, grown by one rule, is a strong candidate core for "learnt logic". Cost is about 1.3× plain segments.

## Reproduce

```
cd sketches/39-segments-two-signs && ./runall.sh     # see NOTE.md and PREREG.txt
```
