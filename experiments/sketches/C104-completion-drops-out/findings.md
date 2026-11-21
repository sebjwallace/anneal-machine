# C104 · Completion drops out: findings

Branch `experiment/completion-drops-out` (from C103's). Code: `amp/engine/dropout.go` (both rules, settings off by
default, so every transcript is unchanged), `amp/cmd/c104` (run from `amp/`: `go run ./cmd/c104`), trace in
`amp/cmd/c104/trace`. Output: [out.txt](out.txt). Hypothesis, with the corrections made after the first run:
[hypothesis.md](hypothesis.md).

## Result

**Holding piles up, as C103 suggested. Dropping out for one moment helps, but doesn't end the activity. One member fewer
after completing undoes dropping out.**

### Words fitted to assemblies (part 2)

Hand-built words (the, cat, sat, on, mat, dog, ran, to), each `<w1 -> w2 -> w3>` with its own members, refractory on;
"the cat sat on the mat the dog sat on the cat a dog ran to the mat" read in one invoke.

| | most complete at once | words that ever completed | end |
|---|---|---|---|
| A holds | 4 (from moment 14 to the end) | the, cat, on, to | held, repeating every 10 |
| B drops out | 4, but mostly 1–3, changing | the, cat, on, to, dog, sat, ran | held, repeating every 6 |
| C drops out, one fewer | 4 (from moment 14 to the end) | the, cat, on, to | held, repeating every 6 |

- **A:** "the cat on to" complete from moment 14 and held to the end. Nothing read after that is recognised: dog, sat,
  mat and ran never complete. The held words keep their members on, so they aren't ready, and the input can't be
  predicted. The pile-up in its plainest form.
- **B:** words complete as they're read and drop out, so later words are recognised (dog, sat, ran). But completed
  words come back: "the" and "dog" keep completing again long after they were read, and the reading ends held, cycling
  through "the dog ran". Dropping out lasts one moment; two moments later the word's refractory members and its own
  chain bring it back.
- **C:** after dropping out, one fewer lets the word complete again straight away from what's still counted, so it's
  no different from holding.
- **"to" completed at moment 2**, before it was read: "t" was unexpected, so all its ready members came on, including
  the "t" of "to", and its chain brought on "o". Words not read yet join in.

### By hand

- **P1, cat with its chain:** A completes and holds (repeating every 2). B completes, drops out, then cycles below
  completion (2 of 3, repeating every 6): its chain and its refractory members restart it. So "goes quiet" failed.
- **P2, cat with no chain:** "c" alone brings nothing before cat has completed; {c, a} completes it; afterwards, under C,
  "c" alone completes it (then it completes once more from its refractory members, and goes quiet). Under B, "c" alone
  still brings nothing.

### Reading with an assembly formed over each run of predicted letters (part 1)

Neither rule rescues it. Holding: on the second text, from pass 5 every letter bursts (66 of 66): held assemblies keep
every member on and nothing is ready. Dropping out: the memory goes quiet, but bursts stay around 36 of 66, no better
than the first pass; on the first text it flickers (162 completions in the last pass). Counting assembly gates as
predictions (rule 3) made it worse: an assembly's gate brings on all its ready members at once, so in a run with two
"t"s it doesn't say which "t" comes next, and wrong bonds grow (trace). With rule 3 off, the results are much the same.
A and D were identical throughout: a held assembly is fully on, so a lower threshold never matters.

## Predictions

| | Held? |
|---|---|
| P1 | A yes. B no: completes, then cycles below completion instead of going quiet. |
| P2 | Yes (with one extra completion from its refractory members before going quiet). |
| P3 | Yes on the second text (collapses); on the first, bursts stay low but the memory lights up more and more. |
| P4 | No: quiet, but bursts don't fall. |
| P5 | No: C was worse than B, not about the same. |
| P6 | No: D was identical to A. |
| P7 | Yes: flicker, in reading (part 1) and in words fitted to assemblies (B in part 2). |
| P8 | Yes: 4 complete at once, held to the end. |
| P9 | No: up to 4, and it ends held, cycling. |
| P10 | No: one fewer made a large difference, the wrong way. |
| P11 | Yes: "to" completed before it was read. |

## What it shows

- Ending a hold is necessary: holding stops later input being recognised at all (A).
- Dropping out for a single moment isn't an ending. The word's own chain and refractory members restart it. For a
  completed word to stay quiet, it would have to stay out for longer, or something else would have to stop it
  restarting. Not decided; not tested.
- A lower threshold straight after completing works against dropping out. If what completing leaves behind is to make
  re-completing easier, it can't act while the word's own members are still counted.
