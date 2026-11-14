# C69 · AND as learnt segments

Brought in on 14 November 2026 from the owner's other repository, the homeostatic state machine, where it was
sketch 36. Everything here is as it was there: the sketch, its pre-registration (`PREREG.txt`), its note
(`NOTE.md`), its runs (`run-*.txt`), and its hypothesis and findings (`hypothesis.md`, `findings.md`, from that
repository's `hypotheses/` and `findings/`). Only links were changed, so they work here.

**Numbering.** The text uses the other repository's numbers: sketch 36 is C69 here, sketch 37 is C70, sketch 38 is
C71 and sketch 39 is C72. Other sketch, findings and core numbers it mentions (sketches 20 to 29, 64 to 69, findings
02 and 40 to 45, core v1 to v5) are in that repository and were not brought in.

**The write-up** across all four is the theory [learnt logic](../../../docs/theories/learnt-logic.md).

**Run:** `node sketch.js`. Self-contained: nothing outside this folder is needed.

## In short
Can a cell learn a combination (an AND), not just a sum, by growing segments, with no labels? **Yes:** segments learnt combination-dependent outcomes almost as well as a hand-made shortcut (0.98 / 0.90 seen), were soft (fired with one input missing), and generalised where the shortcut couldn't (0.84 / 0.71 held out). But growth never stopped, transfer went through shared words rather than shared kinds, and specific exceptions were outvoted by the general segment (about 30% right), which led to C70.

## Read against Anneal's contract
Segments carry strengths that rise and fall (against CTR-1 CON-9, cells carry no numbers); the segment size (8) and threshold (75%) are chosen settings, though several worked (against CON-2); segments are kept or dropped by strength, not by energy (CON-1). The world and its words are given, as in every text sketch.
