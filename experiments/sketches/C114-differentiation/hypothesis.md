# C114 · Differentiation: hypothesis

Written before running. Follows C106 to C113.

## Why

Every sketch from C106 to C113 built structure **up**: letters paired into pieces, pieces into bigger pieces. In
Eleanor Gibson's terms that is **enrichment** (association). What learners show from the outside is mostly the other
way. Heinz Werner's orthogenetic principle says development proceeds from relative globality and lack of
differentiation to increasing differentiation and hierarchic integration. Gibson held that perceptual learning is
differentiation, not association. Children often store whole utterances unanalysed ("where's it gone") and analyse
them later by comparing chunks with what they know (Peters; MacWhinney). Infants see coarse before fine. In physics,
structure mostly comes from a uniform whole **breaking its symmetry**, splitting where it is under stress. C112 found
that a blank start is perfectly symmetrical and freezes unless something breaks it.

The project already has the mechanism: anneal on `main` compares wholes and forms the shared part (abstraction), what
varies before and after it (decomposition), and each whole again from those parts (composition). The owner's state
doc calls "decompose, don't average" the turning point of the whole project. The text work since has been
composition from letters up.

**The question:** with no chunking at all, if each utterance is held as a whole and split only by comparison with
what is held, do words come out as where the splits keep happening?

## The mechanism

- **Utterances.** The book is cut where its sentences end (`.`, `!`, `?`, `;`, `:`), the way speech comes in
  stretches between pauses. That is the only cut given, and it says nothing about where words are.
- **Two versions of the text.** **with spaces** (a space is `_`, a letter like any other, as before) and **without
  spaces** (the words of an utterance run together, like speech: "saidtheking"). The second is the real test: no
  word gaps at all.
- **Memory** is a set of pieces (strings), never edited, in a population of fixed size N. Each utterance is stored
  whole when it arrives (plain forming). When the population is full, the least used is stored away to make room
  (a storage policy, as in AMP: still there, not broken, just out of memory).
- **Differentiation.** When an utterance U arrives, it is compared with what is held, as anneal does:
  1. find the held piece P that shares the **longest run of letters, in order** with U (at least 2 letters, as on
     `main`). Only pieces that share a three-letter run with U are compared (comparison limited to things that
     touch, as the language says);
  2. form the **shared run** S, and what comes **before and after** it in P and in U, as pieces beside what is there
     (reuse first: a piece already held is reused);
  3. go on doing the same with what is left of U before and after S, until nothing left shares 2 letters with
     anything held.
- No price decides forming here: anneal on `main` always forms. The price (C108, a use costing
  1 + log2(N) / log2(alphabet)) is used only for **reading**: the cheapest description of an utterance with the
  pieces held.

## Texts and measures

*Buster Brown* and *Alice*, streamed once. The last tenth of utterances is measured, read by the cheapest description:

- **cuts at a word boundary** (precision), against chance;
- **word boundaries found** (recall): the share of real word boundaries that are cuts;
- **words read whole**: the share of words read as one unit (with spaces: the word, with its space(s)).
- The most used pieces.

N = 4096 and 16384.

## Predictions

1. **Without spaces, words come out.** The splits fall at word boundaries well above chance. Recall is low-to-middling
   (pieces will often be two- or three-word chunks, as children's early chunks are: `saidthe`, `ofthe`). Precision is
   at least 60%.
2. **With spaces it does better than C113's best (greedy, about 66% of cuts at a word gap on *Alice*)**, because
   comparison cuts where wholes differ, and wholes differ at word edges.
3. **Fragments are fewer than in C110 to C113**, because a piece only forms as the shared or varying part of a real
   comparison.
4. **The risk: explosion.** Every comparison forms up to five pieces, so memory fills fast with leftovers ("before"
   and "after" bits of long utterances). If so, N matters a lot.
5. **Coarse first:** early pieces are long (whole utterances, long shared runs); short ones appear later.

## Success and failure

- **Success:** without spaces, at least 60% of cuts at a word boundary, far above chance, with words among the most
  used pieces; with spaces, better than C113's greedy.
- **Failure:** without spaces at or near chance, or memory flooded with leftovers so that reading is mostly loose
  letters.
