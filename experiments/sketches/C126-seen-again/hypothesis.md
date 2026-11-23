# C126 · Seen again: hypothesis

Written before running. Follows [C125](../C125-familiar-is-cheap/).

## The problems

An audit after C125 found a twin of the "the" problem. When reading leaves a stretch unexplained (hot), the engine
stores it as raw experience, as a new word over new members, **without checking whether it already holds exactly that
stretch**. Anneal reuses first; raw experience skipped it. In C125's *Alice* run:

- with the old flat price, 1,657 stored states repeated letters already held: `the` 151 times, `and` 107, `it` 74;
- with cost as surprise, 3,054: `it` 204 times, `to` 196, `at` 153, `as` 144, `on` 114.

It is a loop. A short piece is held but still dear, because its familiarity only grows when reading or a comparison
uses it. So it is read loose, stored again as new, and its familiarity never grows. Something seen hundreds of times is
treated as new every time.

Two more:

- The energy rule's k (the places a candidate occurs) counts held states containing it, duplicates included, so it is
  padded by those repeats.
- The yardstick agreed with the owner, how cheaply memory plus unseen text is described, wasn't reported in C123 or
  C125. Word-boundary scores were reported instead.

## The fixes

1. **Seen again, not stored again**: a hot stretch whose letters are already held as a state is counted as one more
   use of that state (its familiarity grows) instead of being stored and annealed as new. Only a stretch not held is
   stored as raw experience and annealed. This is anneal's own "reuse first", applied to raw experience.
2. **The energy rule counts each different pattern once**: k is the number of different held patterns (sets of
   letters) containing the candidate, plus the whole.
3. **The yardstick is reported**: **energy** = memory (each different held pattern at its cheapest description by the
   other patterns and letters, or its letters if cheaper, at the end-of-learning costs) + the cost of reading the unseen
   tenth (the sum of what each unit read costs), in units of a letter of average surprise. Also the unseen tenth's cost
   **per letter**, which is directly comparable between runs.

Everything else as C125's "cost is surprise". *Buster Brown* and *Alice*, no spaces, sentences, learnt on nine tenths,
read on the last. Each book is run without the fixes (C125 as it was) and with them.

## Predictions

1. Repeats of held letters fall from thousands to near zero.
2. Short words become familiar quickly and are read as themselves: `it`, `to`, `at` among the most read units. Loose
   letters on the unseen tenth fall below C125's 14 to 16%.
3. **Energy falls**: memory is smaller (no duplicates) and unseen text is cheaper per letter.
4. Clean share and words whole about the same as C125, or a little better.

## Success and failure

- **Success:** repeats near zero, energy lower than C125's on both books, unseen text cheaper per letter.
- **Failure:** energy doesn't fall, or reading gets worse (loose letters up, words whole down).
