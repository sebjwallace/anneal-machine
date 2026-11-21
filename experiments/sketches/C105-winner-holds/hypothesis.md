# C105 · How a winner holds through a burst: hypothesis

Written before running. Branch `l1a-reading` (the fresh start) has L1A (sequence memory: reading, bonds, motifs) and
L1B (state memory: motifs cast into assemblies, gates, competition). With competition, one assembly wins at a time,
completes, and holds until another scores higher. Its score is how much of it the input has confirmed (members
projected up from L1A). But a burst clears every confirmation, the winner's included, so right after a burst anything
with one confirmed member takes over. The owner's design wants a state to hold through noise ("the purring cat meow":
"the cat meow" holds while "purring" goes by) and to change only when something outcompetes it.

## What is compared

Two things, every combination of them:

**How confirmations last** (what a burst does):

| | rule |
|---|---|
| clear | a burst clears every confirmation (as committed) |
| keep | a burst clears every confirmation except the winner's: the winner keeps its score |
| keep+ | as keep, but a challenger that ties the winner takes over (a tie no longer favours the winner) |
| window 4 / window 8 | a burst clears nothing; each confirmation lasts 4 (or 8) moments |

**What a burst projects up** (C105 point 2, scores inflated by bursts): every member of the population that burst
(as committed), or only the member picked.

Everything else as committed: gates open on any one confirmed member; of the open gates the highest score wins; with
no winner, a tie means none wins; the winner completes and holds until outcompeted.

## Test bed

**A. Two phrases.** A fresh memory reads "the cat meow" twice and "the dog bark" twice (casting, among others, the
phrases `the_cat_meow` and `the_dog_bark`, and `the_`). Then, each on its own copy of that memory:

| | read | want |
|---|---|---|
| A1 | the purring cat meow | ends on the cat phrase; the dog phrase never wins |
| A2 | the loud dog bark | ends on the dog phrase; the cat phrase never wins |
| A3 | the dog bark the cat meow | the dog phrase by "bark", then a change to the cat phrase by "meow" |
| A4 | meow the cat | ends on the cat phrase (order doesn't matter to state memory) |

**B. Sentences.** A fresh memory reads the five sentences from before ("the cat sat on the mat the dog sat on the
log", "the dog sat on the mat", "the cat sat on the log", "a dog and a cat sat on a mat", "the mat"). Counted over
the reads: how often a winner is taken over, and how often by an assembly with only one member confirmed (a weak
takeover).

## Predictions

| | Prediction |
|---|---|
| P1 | **clear** fails A1 and A2: during the noise word, a letter the other phrase has (r or g in "purring"; o in "loud") hands it the win. It passes A3 and A4 by the end, since what is read last decides. |
| P2 | **keep** locks in whatever wins first and fully. `the_` is short, so it is fully confirmed after "the " (score 1) and nothing can score higher than 1: A1–A3 end on `the_`, not the phrase. It fails A3 (no change). |
| P3 | **keep+** lets a fully confirmed phrase take over, but a phrase is only fully confirmed if every letter arrives with no burst in between; after the noise in A1 and A2 it can't be, so it ends like keep (`the_`). |
| P4 | **window** holds through short noise only if the noise is shorter than the window: window 8 passes A1 and A2 more often than window 4. Both make A3 change. Long phrases can't be fully confirmed inside a short window, so short assemblies win more. |
| P5 | Projecting up only the member picked at a burst lowers scores everywhere and cuts weak takeovers in B, for every rule. |
| P6 | No rule passes all four of A. Holding (A1, A2) and changing (A3) pull against each other while the score is only how much is confirmed. |

## What could fool us

- What is cast depends on the motifs, which cross word boundaries; the phrase assemblies may not be exactly
  `the_cat_meow` and `the_dog_bark`. The runner prints what was cast so the test bed can be checked.
- Reading a test text also learns (bonds, casting). Each test runs on its own copy of the trained memory, and only its
  own read's winners count.
