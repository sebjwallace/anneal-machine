# C103 · Reading with bonds only: findings

Branch `experiment/reading-bonds`. Code: `amp/engine/readbonds.go`, `amp/cmd/c103` (run `go run ./cmd/c103`), traces in
`amp/cmd/c103/debug` and `debug2`. Hypothesis and rules, written before running: `hypothesis.md`. (Its label "predicted
stretch" was mine for the experiment only, not a proposed term; below it is "a run of predicted letters".)

## Result

Reading with bonds only works, given two things the first run didn't have:

1. **A prediction counts only when it comes from the letter just before.** A letter that bursts brings on every member
   of its population, so every bond out of that letter fires, and every chain through it runs on by itself (recall)
   alongside the input. In the first run, the space after "dog" counted as predicted by `e{1}` from "the", still being
   recalled, so "dog" ended on "the"'s space member. Counting only predictions from the letter before removes it.
2. **The rivalry change below.** With the committed rule, "dog" is learned again on every pass (`d{3}`, `d{4}`).

With both, "the cat the dog the bird the mouse", read three times:

| pass | burst | bonds formed |
|---|---|---|
| 1 | 23 of 34 | 22 (`THE_CAT_The_DOG_the_BIRD_the_MOUSE`) |
| 2 | 5 of 34 | 0 (`The_Cat_the_Dog_the_Bird_the_Mouse`) |
| 3 | 5 of 34 | 0, the same |

From pass 2 on, nothing new forms and only five letters burst: the very first "t" (nothing leads into it) and the
first letter after each "the ", where the space leads on to c, d, b or m: alternatives at the same place, which tie and
are held, so the letter bursts. That surprise is genuine: which animal comes next isn't in the letters before it.

Noise: 19 random letters burst throughout and form 18 bonds; different noise afterwards also bursts throughout; the
first noise again is predicted in full (1 burst of 19).

## Predictions

| | Held? |
|---|---|
| P1 | Mostly: the 2nd "the " predicted after its "t"; the 3rd in full; the 4th in full too (I predicted it would burst at "t"). |
| P2 | Yes: 22 bonds, the space after "the" leading on to c, d, b, m. |
| P3 | Yes: "bird" ends on its own `d{2}`. Words do share the space after them (`_{2}`, which leads into "the"). |
| P4 | Mostly: the bursts are the first "t" and the four after "the "; 0 bonds, not 1 (each read starts afresh, so nothing joins the end of one read to the start of the next). |
| P5 | Yes: pass 3 is the same as pass 2, and the four bursts after "the " stay. |
| P6 | Yes: runs of predicted letters cross word boundaries ("cat_the_"), because each animal is always followed by " the". |
| P7 | Yes. |

## Rivalry change (engine, `invoke.go`, not committed)

The committed rule judged the place of a member between separately written words by (before, after) population pairs.
When a letter bursts, all its members come on, and the bonds out of them reach different letters, from different words
through the same letter: `t{1} -> h{1}` (in "the") and `t{2} -> _{2}` (ending "cat"). The committed rule made some of
these rivals, so they tied, nothing opened, and the next letter burst and took a new member.

The change: a member's place is taken from everything it connects to (all the populations it follows, and all it
leads into), and two members are alternatives only if they share a population on **both** sides (or both have nothing
on a side: both start, or both end, a chain). Following or leading into the same member still makes alternatives, as
before. So `h{1}` (after t, before e) and `_{2}` (after t, before t) aren't rivals; c, d, b, m after `_{1}` still are.
All 33 transcripts and the engine tests pass with it.

## Forming assemblies during reading: fails

Forming an assembly over each run of predicted letters as it ends (reusing one with the same members) makes reading
worse, not better: bursts go 23 → 7 → 10 → 11 over four passes, and on "the cat sat on the mat …" 38 → 40 → 43 → 58.
Trace (`debug2`): the runs overlap ("the_", "cat_the_", "og_the_"), so the assemblies formed over them complete and
hold, and from the start of the next read they keep `t, h, e`, both spaces, `o` and `g` on all the time. Input arrives
against a memory already lit up, and prediction breaks down: the "t" of "cat" bursts and takes a new member.

So reading with bonds only finds where the text repeats and where it's surprising, but an assembly isn't simply "a
run that was predicted". Open: what an assembly should be formed from, and when (during reading or at rest).
