# Hypothesis 07: segments with two signs (AND and NAND)

*Hypothesis for sketch 39, November 2026. Follows [findings 04](../C69-learnt-and/findings.md) and [findings 05](../C70-learnt-not/findings.md). The idea of NAND segments is the owner's. Not yet tested.*

---

## Why

Two sketches failed in the same place.

- **Sketch 36 (learnt AND)** couldn't hold a specific exception against a general rule. "ginger cat" + "bowl full" → "hiding" was right only 65% of the time, because the kind-level segment for "cat" + "bowl full" → "eating" outvoted it.
- **Sketch 37 (learnt NOT)** inhibited from each active word separately. When it made a mistake, shared words like "cat" and "sleeping" got suppressed along with the actual culprit.

Both need the same thing: **"this combination suppresses that."** That is NOT of an AND: a NAND.

## The claim

There is **one kind of segment with two signs**, grown by one rule from the two signs of heat.

- **A cell should have fired and didn't** (it was hot from being under-driven): it grows an **excitatory** segment from a sample of what was active. This is sketch 36's rule.
- **A cell fired, or was predicted, and shouldn't have** (it was hot from being over-driven): it grows an **inhibitory** segment from a sample of what was active. This is new.
- Both are soft ANDs, firing when enough of their inputs are active.
- Both strengthen when they help the cell fit and weaken when they don't.
- An excitatory segment adds to the cell's drive. An inhibitory segment subtracts from it.

As in sketch 37, inhibitory segments learn only from the automaton's *own* failed predictions, never from the correct answer.

Where the inhibition lands is a variant worth testing:
- **on the whole cell (NAND):** "not when these are together";
- **on one excitatory segment (AND NOT):** "for this reason, unless …", leaving other reasons to fire intact.

## Predictions

1. **Conjunctive exceptions are learnt.** "ginger cat" + "bowl full" → "hiding", and not "eating", reaches near 100%, while "grey cat" + "bowl full" → "eating" stays intact. Sketch 36 managed 65%.
2. **No collateral suppression of shared words.** Unlike sketch 37's single-word inhibition, "cat" alone and "bowl full" alone keep their normal effect elsewhere.
3. **One rule does both jobs.** Excitatory and inhibitory segments come from the same growth and pruning code, differing only in the sign of heat that triggered them.
4. **It stays balanced without a balance rule**, as in sketch 37, because inhibitory segments only grow from the automaton's own wrong predictions.
5. **Growth settles.** With both signs, once a cell fits, it stops growing new segments of either sign. This also tests the stop signal sketch 36 lacked.

## The test (sketch 39)

- **World:** sketch 36's worlds a and b, including the individual exceptions. Add context-dependent exceptions that no single word can express, and some exceptions that later stop being exceptions.
- **Compare:**
  - excitatory segments only (sketch 36);
  - excitatory segments + single-word inhibition (sketch 37's rule);
  - **excitatory + inhibitory segments on the cell (NAND)**;
  - **excitatory + inhibitory segments on excitatory segments (AND NOT)**.
- **Measures:**
  - exceptions correct;
  - general rule intact for everything else;
  - collateral suppression of shared words in other contexts;
  - unlearning when an exception ends;
  - held-out transfer (as in sketch 36);
  - segments grown over time, by sign;
  - cost per event.
- **Settings** fixed before running (PREREG), fresh seeds, anything changed after looking marked post hoc.

## What would count against it

- Inhibitory segments don't beat single-word inhibition on conjunctive exceptions.
- They need a separate rule, or settings tuned separately from excitatory segments.
- They suppress the general rule or shared words.
- Growth of either sign never settles.

## Ways it could fool us

- If "shouldn't have fired" is judged against the correct answer rather than the automaton's own prediction, it is supervision.
- Exceptions that each have their own word are easy. The test must include exceptions that only a combination identifies.
