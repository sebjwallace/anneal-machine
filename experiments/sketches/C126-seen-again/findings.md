# C126 · Seen again: findings

> **Caution, added after [C127](../C127-spelled-pieces/).** The engine copy here read every held state of two or more
> members as a piece, by the letters of its members. Compositions (which anneal builds from about half of each part's
> members) and long words whose repeated letters were dropped therefore became pieces spelling strings that never
> occurred, such as "hape" or "saidin": about 13% of the letters held in C126's *Buster Brown* run. They were hardly
> ever read, but they were counted in memory, offered as anneal partners and counted by the energy rule. C127 makes a
> state a piece only when a chain spells it, and finds that reading on unseen text barely changes, while memory and
> energy figures here are overstated by roughly that share. This experiment also credited a stretch seen again twice (as its letters
> and as the piece); C127 credits it once.

Run: `node seen.js <folder> <book> 8` (a few seconds a book; everything is in [out.txt](out.txt)). Read
[the hypothesis](hypothesis.md) first. The "without the fixes" rows reproduce C125's "cost is surprise" exactly.
`check/check.sh` still gives the same output as the Go engine.

## In short

**The duplicate loop is gone, and the engine is better on nearly everything.** Stored states that repeat letters
already held fall from 1,579 to 4 (*Buster Brown*) and from 3,054 to 8 (*Alice*). Instead, 640 and 1,224 hot stretches
are counted as seen again. The engine holds 60 to 69% fewer assemblies (*Alice*: 10,805 to 3,361). Short words now
become familiar and are read as themselves: `at`, `it`, `to`, `in`, `on`, `as` join `the`, `and`, `of` among the most
read units.

| | energy (memory + unseen) | unseen cost per letter | loose (unseen) | words whole | cuts at a word boundary | clean | coverage |
|---|---|---|---|---|---|---|---|
| *Buster Brown*, C125 | 12,367 | 0.643 | 16% | 37% | 53% | 37% | 84% |
| ***Buster Brown*, fixed** | **10,231 (−17%)** | 0.655 (+2%) | **10%** | **46%** | **56%** | 37% | **90%** |
| *Alice*, C125 | 17,815 | 0.665 | 14% | 44% | 53% | 35% | 86% |
| ***Alice*, fixed** | **14,987 (−16%)** | 0.670 (+1%) | **8%** | **50%** | **56%** | 34% | **92%** |

- **Energy falls by 16 to 17%**, all of it from memory: no copies, and fewer patterns (*Alice*: 2,322 to 1,650).
- **Unseen text costs a little more per letter** (+1 to 2%). With fewer, shorter patterns held, unseen text is read
  with more, shorter units. Memory saves far more than unseen text loses.
- **It cools further**: 8 to 9% of letters read loose by the end of each book, against 15%. On *Alice*, "the" is read
  inside a piece 100% of the time.
- **Half of all words are read whole on *Alice*** (50%), and 56% of cuts fall at word boundaries (chance 24%). Both are
  the best of any run.
- The clean share is unchanged (34 to 37%): the pieces are as short as in C125, mostly words and word parts.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | repeats fall to near zero | **Yes** (4 and 8). |
| 2 | short words read as themselves; loose letters below 14 to 16% | **Yes** (8 to 10%). |
| 3 | energy falls: smaller memory, cheaper unseen text per letter | **Energy falls (−16 to −17%), memory smaller**, but unseen text is **slightly dearer** per letter. |
| 4 | clean and words whole the same or a little better | Clean the same, words whole clearly better. |

## Against the success and failure criteria

**Two of three met**: repeats near zero, and energy lower on both books. **Not met**: unseen text is 1 to 2% dearer per
letter, not cheaper. Reading didn't get worse on any measure.

## What this says

1. **Reuse first has to apply everywhere.** Anneal already reused what it held. Raw experience didn't, and that one gap
   made the engine treat familiar things as new thousands of times and kept them from ever becoming familiar. With the
   gap closed, memory is a third of the size and reads better.
2. **Memory and unseen text pull slightly against each other.** Fewer stored patterns mean a cheaper memory and a
   slightly dearer reading of new text. The total falls clearly. This is the trade-off the energy rule is meant to
   settle, and the yardstick now shows it.
3. **The yardstick is back**: energy, and unseen cost per letter, are reported from here on.
4. **Still open from the audit**: memory has no limit in these runs (nothing is stored away), and single loose letters
   never count as heat (only runs of two or more).

## Givens to keep in mind

- A hot stretch counts as seen again when a held state has exactly its letters. Its uses rise by one; nothing is
  stored or annealed for it. A hot stretch not held is stored and annealed as before.
- The energy rule's k counts different held patterns (sets of letters) containing the candidate, plus the whole.
- Energy is in units of a letter of average surprise (log2 26 bits), at the costs reached at the end of learning.
  Memory: each different held pattern at its cheapest description by the others and letters, or its letters if
  cheaper. Unseen: the sum of the costs of the units read.
- Everything else as C125's "cost is surprise".
