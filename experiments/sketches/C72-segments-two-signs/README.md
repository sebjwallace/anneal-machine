# C72 · Segments with two signs (AND NOT and NAND)

Brought in on 14 November 2026 from the owner's other repository, the homeostatic state machine, where it was
sketch 39. Everything here is as it was there: the sketch, its pre-registration (`PREREG.txt`), its note
(`NOTE.md`), its runs (`run-*.txt`), and its hypothesis and findings (`hypothesis.md`, `findings.md`, from that
repository's `hypotheses/` and `findings/`). Only links were changed, so they work here.

**Numbering.** The text uses the other repository's numbers: sketch 36 is C69 here, sketch 37 is C70, sketch 38 is
C71 and sketch 39 is C72. Other sketch, findings and core numbers it mentions (sketches 20 to 29, 64 to 69, findings
02 and 40 to 45, core v1 to v5) are in that repository and were not brought in.

**The write-up** across all four is the theory [learnt logic](../../../docs/theories/learnt-logic.md).

**Run:** `./runall.sh (or node sketch.js with the flags in NOTE.md)`. Self-contained: nothing outside this folder is needed.

## In short
One kind of segment, two signs, one growth rule: "should have fired and didn't" grows an excitatory segment (AND); "fired and shouldn't have" grows an inhibitory one. The owner's NAND idea, tested in two placements. **AND NOT (inhibition on one excitatory segment) worked best:** exceptions roughly doubled (0.84 / 0.62), the general rule improved (0.97 / 0.93), no collateral damage, about a tenth of NAND's inhibitory units at 1.3x the cost of excitatory-only (NAND 5x). It went into that repository's core. A cell-wide stop signal for growth hurt.

## Read against Anneal's contract
Strengths again (CON-9) and chosen settings (CON-2). Growth is driven by the two signs of local heat, which is the same split Anneal now uses for fitting: a cell lit but not predicted, and a cell predicted but not lit.
