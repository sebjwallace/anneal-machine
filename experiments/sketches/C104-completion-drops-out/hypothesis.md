# C104 · Completion drops out: hypothesis

Written before running. C103 found that assemblies formed while reading complete and **hold**, keep their members on,
and drown the input; nothing in the rules ends a hold. The owner's idea (in `docs/theories/the-tilting-landscape.md`
§2, "remembering is re-completing, not holding"): when an assembly completes, its activity drops out, but it leaves
something behind that makes it easier to complete next time. Untested so far.

## Rules (fixed before running)

1. **Completion drops out.** An assembly whose members are all active at a moment does not open its gate the next
   moment. Its members stay on only if something else brings them on (input, or another assembly's gate). This applies
   to assemblies, not transitions: a bond is a sequence step, not something that completes.
2. **What it leaves behind.** Once an assembly has completed, its gate needs one member fewer than before to open
   (more than half, less one; never fewer than one). It lasts; the owner's limit per member is left out for now.
3. Reading is C103's (bonds letter to letter; a prediction counts only from the letter just before; the C103 rivalry
   rule), with an assembly formed over each run of predicted letters as it ends, which was C103's failing case. One
   change: a letter also counts as predicted when an assembly's gate expected one of its members, since predicting is
   what the assemblies are for.

Four conditions, each reading the text over and over on a fresh memory:

| | completion | after completing |
|---|---|---|
| A | holds (as now) | same threshold |
| B | drops out | same threshold |
| C | drops out | one member fewer |
| D | holds | one member fewer |

Measured each pass: letters that burst, assemblies formed, members on that weren't input (how lit up the memory is),
and completions.

## Predictions

| | Prediction |
|---|---|
| P1 | By hand, `mouse = <m -> o -> u -> s -> e>`, invoke "mouse": under B it completes and goes quiet within two moments, never held; under A it is held. |
| P2 | Under C, invoking "mo" doesn't complete "mouse" before it has ever completed (2 of 5 isn't more than half), and does after (one fewer: 2 is enough). |
| P3 | A reproduces C103's failure: bursts fall, then rise again by pass 3–4. |
| P4 | B: bursts fall and stay down, close to C103's floor with bonds only (5 of 34 on the first text); assemblies formed fall to none by pass 4; far fewer members on that weren't input than A. |
| P5 | C: about as many bursts as B, but more members on that weren't input: with one fewer, a two-member assembly ("e_") opens from a single letter. Least sure of this one. |
| P6 | D is the worst of the four. |
| P7 | Watch for flicker under B and C: an assembly completing, dropping out, and completing again from members its overlapping neighbours keep on. Completions far above the number of times its letters are read would show it. |

## Added after the first run (before running what they predict)

**Corrections.** (1) P1 and P2 used "mouse", which can't complete from its own chain in any condition: with the
refractory period on, gates count two letters, and 2 of 5 is never more than half (known: a flat assembly of more than
three letters can't be completed by its own chain). Redone with "cat". P1: `cat = <c -> a -> t>`, refractory on, invoke
"cat": A held, B completes and goes quiet. P2: `cat = <c, a, t>` with no chain, so only its own gate can bring members
on: invoke "c" brings nothing before cat has completed (1 of 3); invoke {c, a} completes it (2 of 3); then under C,
invoke "c" completes it (one fewer: 1 is enough). (2) "Completes" means all members counted (active or refractory), as
the engine reports completion; the first run used active only. Reading has the refractory period off, so it's the same
there.

**Part 2: words fitted to assemblies.** Forming assemblies over runs of predicted letters already failed in C103 for its
own reasons, so it confounds the question. The direct question is the one the owner asked: when input fits assemblies,
does completion dropping out end the pile-up of holds? Words with three letters or fewer, each declared by hand as its own
`<w1 -> w2 -> w3>` (so each takes its own members), refractory on: the, cat, sat, on, mat, dog, a, ran, to. Invoke "the cat
sat on the mat the dog sat on the cat a dog ran to the mat" in one go, and count, each moment, the assemblies complete.

| | Prediction |
|---|---|
| P8 | A (holds): the number of assemblies complete at once climbs through the text; by the end, several words are complete together (more than three). |
| P9 | B (drops out): no more than two complete at once at any moment; each word completes as it's read and goes quiet; after the input ends, nothing stays complete. |
| P10 | C: like B. With three-letter words and their chains, words complete easily anyway, so one fewer should make little difference here. |
| P11 | A letter is a member of only one word ("t" of "the" is a different member from "t" of "cat"), so an unexpected letter turns on all its ready members: in A, held words could be joined by others that share letters, and the pile-up includes words not read yet. |
