# C70 · NOT as learnt inhibition

Brought in on 14 November 2026 from the owner's other repository, the homeostatic state machine, where it was
sketch 37. Everything here is as it was there: the sketch, its pre-registration (`PREREG.txt`), its note
(`NOTE.md`), its runs (`run-*.txt`), and its hypothesis and findings (`hypothesis.md`, `findings.md`, from that
repository's `hypotheses/` and `findings/`). Only links were changed, so they work here.

**Numbering.** The text uses the other repository's numbers: sketch 36 is C69 here, sketch 37 is C70, sketch 38 is
C71 and sketch 39 is C72. Other sketch, findings and core numbers it mentions (sketches 20 to 29, 64 to 69, findings
02 and 40 to 45, core v1 to v5) are in that repository and were not brought in.

**The write-up** across all four is the theory [learnt logic](../../../docs/theories/learnt-logic.md).

**Run:** `node part1-exceptions.js (part 1); node part23-entities.js (parts 2 and 3)`. Self-contained: nothing outside this folder is needed.

## In short
Can inhibition be learnt from the machine's own wrong predictions? **For exceptions with their own word, yes:** "penguin bird" stopped flying after 1-2 sightings with no damage to the rule, unlearning worked, and the gate (learn only from its own wrong predictions, never from being told) is what kept it safe. **For telling entities apart and breaking lock-in, no.** And inhibiting from single words also hit innocent shared words, which pointed to inhibition on a combination.

## Read against Anneal's contract
Inhibitory links have strengths and a learning rate (`BETA`), swept across values (against CON-9 and CON-2). The own-prediction gate fits CTR-1 GOL-1 (no teacher) and CON-6.
