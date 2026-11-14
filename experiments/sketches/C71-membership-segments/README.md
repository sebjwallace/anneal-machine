# C71 · Segments as assembly membership

Brought in on 14 November 2026 from the owner's other repository, the homeostatic state machine, where it was
sketch 38. Everything here is as it was there: the sketch, its pre-registration (`PREREG.txt`), its note
(`NOTE.md`), its runs (`run-*.txt`), and its hypothesis and findings (`hypothesis.md`, `findings.md`, from that
repository's `hypotheses/` and `findings/`). Only links were changed, so they work here.

**Numbering.** The text uses the other repository's numbers: sketch 36 is C69 here, sketch 37 is C70, sketch 38 is
C71 and sketch 39 is C72. Other sketch, findings and core numbers it mentions (sketches 20 to 29, 64 to 69, findings
02 and 40 to 45, core v1 to v5) are in that repository and were not brought in.

**The write-up** across all four is the theory [learnt logic](../../../docs/theories/learnt-logic.md).

**Run:** `./runall.sh (or node sketch.js with the flags in NOTE.md); node summary.js`. Self-contained: nothing outside this folder is needed.

## In short
A segment per assembly a cell belongs to, firing on most of that assembly's members. **Whole-set segments kept shared cells from blending** and held far more memories when cells were scarce (68-94% strict recall at 400 memories, against 0-94% for summed links). A sample of 16 synapses wasn't enough. **But they couldn't complete from half a cue** (0%, against 81-86% for summed links). Sharp against tolerant: a cell needs both.

## Read against Anneal's contract
This is the "owner's earlier finding" behind Anneal's C35. The threshold is a chosen fraction (`t0.6` to `t0.8` swept; against CON-2). In Anneal the bar is two active links, from the prices, not a fraction, and C35 recalled from a few cells: so whether Anneal's two-link segments are sharp enough at this scale is an open, testable question.
