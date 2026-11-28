# C176 · One memory, two lessons: hypothesis

Written before the run, after the build check (`sanity.js`). Date: 2026-11-27.

## The question

In C175, lesson 2 got cheaper because my code read pieces off lesson 1's ways of working and handed them to a separate
search. That crutch proved that reuse saves tries. Now it comes out. One memory goes through both lessons. In lesson 2,
whatever lesson 1 left in the memory has to come up by itself, by association with the new situation, and be adapted
there. Does lesson 2 still come cheap?

## The setup

- **One memory for both lessons and both tests** (C173's design). A kept way of working is a frame cell over a shared
  vocabulary of parts, wired in advance (now including the sign write and both signs).
- **What brings a way of working up:** its link from the start, through what was in view at the start (the sign under
  the first column: the encoder's "what's in view", as since C159). The link is a chain, start → view → frame, so a frame
  seen with the same view has more support than one seen with another view. In a new lesson, nothing has been seen with
  its view, so the old lesson's frames come up only through the start they share. They come up as rivals.
- **Binding on settling** (C173): the frame that's on when the page settles gets another copy of its link, with the view
  of this page.
- **Per worked example:**
  1. The memory tries what the start brings up.
  2. If that doesn't settle, every frame the start brought up as a rival is tried, given with the cue. These are the
     memory's offers; reading them from the competition is the code's, as C173.
  3. If none settles, the one or ones that got furthest (the most of the working cooled) are varied one part at a time:
     first whether the first read is held or read, and only if that fails, each part moved to another place. A variation
     is tried as a new frame cell, offered with the cue. It's kept only if it settles (binding links it). Failed
     variations are left in the memory unlinked, so they're never brought up.
  4. If nothing has been kept at all (the very first example), the code's search from scratch runs (C175's).
- **Lessons and examples** are C175's: two worked examples each.
- **Tests:** 200 new sums of each lesson, in the same memory, from the cue.
- **Two arms:**
  - no tie-break;
  - the first formed wins (C173's declared crutch).

## Predictions

1. **Lesson 1, first example:** the code's search (2,052 tries) settles six equal ways of working, kept with "+".
   Second example: they tie, all six offers settle, and each gets another copy.
2. **Lesson 2, first example:** the start brings up the six adding ways of working (none seen with "×"), and in neither
   arm do any of them settle a times page. In the no-tie-break arm they tie, so recall brings up nothing and all six are
   offers. In the tie-break arm, the first one wins and fails, and the six are offers.
   - The two that put the carry in the carry place get the first column right and then stop (furthest, two places
     cooled).
   - Varying whether their first read is held: one of them becomes times one digit and settles, and it's kept, seen
     with "×". The other holds the top number and fails.
   - **About 1 + 6 + 2 = 9 runs, against 1,112 from scratch and 180 when my code carried the pieces over.**
3. **Lesson 2, second example:** the start brings up the new way of working (seen with "×") over the adding ones, and it
   settles first time.
4. **Tests:**
   - Times one digit: 200 of 200 in both arms.
   - Adding: in the no-tie-break arm, 0 of 200, because the six equal adding ways of working tie for ever, as in C173.
     In the tie-break arm, 200 of 200.
5. Unlike C175's arbitrary choice, transfer here doesn't depend on which of the six was chosen. The offers bring up
   all six, so the one that carries over is found whichever the tie-break chose.

## The ledger (planned)

**Removed:** the code reading pieces off a learned way of working, and carrying them to a separate search in another
memory.

**Given:**
- the view at the start (the encoder);
- reading the offers from the competition, ranking them by how much they cooled, and varying one part at a time (the
  code's, declared, a smaller crutch);
- the first example's search;
- the target, the sheets and the lesson order;
- the facts and the signs' meanings;
- the vocabulary and frame cells made in advance;
- in arm 2, the tie-break.
