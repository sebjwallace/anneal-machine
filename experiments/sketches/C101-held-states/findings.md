# C101 · Held states: findings

Run: `node run.js` (`out.txt`, about four minutes). The first experiment with no context in cells
([decision 009](../../../docs/decisions/009-no-context-in-cells.md)): each letter is the same two cells everywhere, and
context is what stays held. Engine and arms as in [hypothesis.md](hypothesis.md), with one change after the first run
(below).

## Results

At an episode's last letter, was the prediction exactly that letter? Last third of 900 episodes, 5 seeds. In brackets:
letters held, mean / most.

| middle | noise | K | one moment | never let go | rivals given (ceiling) | **rivals learnt** |
|---|---|---|---|---|---|---|
| "ab" | none | 2 | 0% (1/1) | 0% (6/6) | 100% (3/3) | **100% (4/4)** |
| "ab" | none | 4 | 0% (1/1) | 0% (10/10) | 100% (3/3) | **100% (4/4)** |
| "ab" | none | 8 | 0% (1/1) | 0% (18/18) | 100% (3/3) | **100% (4/4)** |
| "abcd" | none | 2 | 0% | 0% (8/8) | 100% (3/3) | **100% (6/6)** |
| "abcd" | none | 4 | 0% | 0% (12/12) | 100% (3/3) | **100% (6/6)** |
| "abcd" | none | 8 | 0% | 0% (20/20) | 100% (3/3) | **100% (6/6)** |
| "ab" | 30% | 2 / 4 / 8 | 0% | 0% (9-21) | 15% / 23% / 43% (4/4) | **0% (2/2)** |
| "abcd" | 30% | 2 / 4 / 8 | 0% | 0% (11-23) | 14% / 25% / 44% (4/4) | **0% (2/2)** |

**One change after the first run (declared).** In the first run every arm scored 0%, the given ceiling too: candidates
came from the followers of every held letter, so a held "x" kept proposing "a" again after "b". The rule was meant to be
"held plus new", and is now: what can come next is read from the letter that just arrived; held states only decide which
of those wins. Everything above is after that change.

## What it shows

- **Held states carry context with no context in cells.** "a b" is shared by every episode, yet the last letter is
  predicted exactly every time, because the context letter is still active when the end arrives, and the end's context
  segment, learnt with it, has the largest share. The same two cells stand for "a" everywhere.
- **Holding is bounded by rivalry alone, and what is stored doesn't matter.** With learnt rivals, the hold is 4 letters
  ("ab") or 6 ("abcd") whether 2 or 8 contexts are known: a context letter goes when the next context letter arrives,
  because both have followed the same letters (the ends), so they stand in the same place. No clock, no cap, no price.
  This is the bound that earlier rules for holding and fading lacked (sketches not kept), and it came from the owner's rule: a state lasts until a rival takes its
  place.
- **Never letting go fails, not only by growing.** With every past context still active, the old ones compete with the
  current one, and nothing is predicted alone. Letting go is needed for being right, not just for being cheap.
- **Noise breaks learnt rivalry, as expected beforehand.** Noise letters follow everything, so they share a predecessor
  with every letter, including the context letters, and replace them: the hold falls to 2 and the context is gone (0%).
- **Noise also hurts when rivals are given (14-44%).** Here the context survives, but a noise letter arriving just before
  the end becomes "the letter that just arrived", and everything has followed noise, so the step proposes everything and
  only the context shares are left to choose. They are diluted by whichever noise was active when each end was learnt.
  More contexts (K = 8) helps, oddly: each end's context segment then differs more from the others.

## What the noise failure points to

Both failures have one cause: **a letter that can be followed by, or follow, anything carries no information about
place,** and the rules treat it as if it did. A noise letter is a rival of everything, so as a rival it should count for
nothing; and a step from a letter followed by everything should give way to the last letter that did narrow things down.
That is the same thing the owner raised about "the" (it can be followed by almost anything), and the same thing other
sketches that day kept running into (an explanation that is one of many options is worth less).

**Note on scoring.** The noise rows above score "the end, predicted alone", which is unfair when noise letters really can
come next. A later sketch (not kept) rescored this rule by asking only that the right end is the only end predicted: still
0%, with the context letter never held. The conclusion stands. That sketch also tried letters as sparse patterns, with
rivalry measured as overlap of where letters stand: clean worlds as here (100%); with noise, when the context survived, the
right end was the only end predicted up to 95% of the time, but noise letters, which come before everything, sat in every
letter's picture of where it stands and made the context's survival depend on the world. And holding by sparse bonds alone
(a letter held while it is bonded to what just arrived, in a limited room of links) kept holds small with no rule but made
holding unreliable: the room acted as a lifetime. Both point to holding wholes over time, not single letters.

## Violations (CTR-2 CON-7)

| | Violation | Kind | Clauses |
|---|---|---|---|
| V1 | A small engine written for this sketch, on the project's principles, not the core | declared | CTR-2 DEF-3 (a sketch) |
| V2 | Each letter two fixed cells | fixed encoding, declared | CTR-1 CON-3 |
| V3 | 'given' arm: kinds of letter given by hand | puppeteered ceiling, declared; no claim rests on it | CTR-2 CON-2 |
| V4 | Predecessors and followers read by scanning segments | bookkeeping in a sketch, declared | CTR-2 CON-8 |
| V5 | Every miss grows a context segment; nothing is ever pruned | unconditional growth | CTR-1 CON-1 |
| V6 | The change to "held plus new" after the first run | declared above | CTR-2 PRN-3 |

## Next

1. **Weigh rivalry and steps by how much they narrow things down:** a letter that is a rival of everything is no one's
   rival; a step from a letter that anything can follow gives way to the last one that narrowed it. Then rerun with noise.
2. Then text with real words, where "the" is the noise letter.
