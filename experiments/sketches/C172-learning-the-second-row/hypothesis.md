# C172 · Learning the second row by doing and checking (a taste): hypothesis

Written before the run. Date: 2026-11-27.

## The question

C171 found that a worked example only teaches if its working is something to agree with, not something to read. The
composition of long multiplication was learned that way, but two of its three ways of working were still written by
hand: the second row and the adding. Can the second-row way of working, and where it starts, be learned the same way?
The page would show only the question, the worked example's working would be a target the memory's own writes must agree
with, and the way of working could read only what's given and what has been written already in this attempt.

This is the first time a way of working is learned under that rule. Earlier frame learning (up to C164) read the worked
page and assumed the answer is written at the focus. The second row writes three rows below the focus, so the earlier
search could never have found it.

## The setup

- **The circuit (C171's):** the first-row way of working starts at the cue (given, as in C171), then one hand-over to a
  candidate second way of working started at a relation to the start latch (-2 to +2 columns). The candidate's parts:
  which place is held, a second read, the carry read, the sign read, where the units digit is written, where the carry
  is written, and the move.
- **The page:** only what's given (the encoder's page as C170 and C171). **The target:** the worked example's working
  for both rows and their carries (rows 0, 3, 5, 6), written out by the teacher (C170's hand-written procedure, used
  only to produce the worked example). Agreement gates cool a target place when a write there gives the target digit.
  The Settled gate comes on when every target place has cooled.
- **Stage 1:** start relation × three digit reads (within two rows of the focus) × sign read × units write. Kept if
  the first units write cooled a target place. The run is limited to the first row plus one column of the candidate.
- **Stage 2:** each keeper with the first read held or not, every carry-write place, and both moves. Kept if the whole
  page settles.
- **Learning:** search on one worked example (525 × 67). Check each settled candidate on a second worked example
  (9188 × 54). The binding rule: a single candidate that settles both is bound.
- **Test:** 200 new long multiplications (2- to 5-digit tops by 2-digit multipliers), the first row then the learned
  second frame from the cue, on a page showing only the question. Measures: first row right, second row right. The
  hand-written frame is the reference.

### The code's filter (outcome-equivalent, disclosed)

To keep the search small, the code doesn't propose three kinds of candidate. It drops reads of places that are empty when
the second frame starts, sign reads of places with no sign, and units writes to places that already hold something. In
the circuit, an empty read gives no digit, so no fact fires, the clock stalls and nothing is written. A refused write
can't cool anything. So these candidates can't pass stage 1, and the filter changes how long the search takes, not what
it finds. I'll check this on a random sample of 300 filtered-out candidates, which should all fail stage 1.

### The reach limit (a search-order crutch, disclosed)

Reads are limited to within two rows of the focus (the same nearest-first ordering as earlier searches, as a ring). Writes can be anywhere in the
frame's reach. The hand-written second row needs reads two rows up and two rows down, so it is inside the limit. If
nothing settles, the next step would be ring 3, about 111,000 candidates.

## Predictions

1. Stage 1 keeps several hundred candidates. A single units digit agrees by coincidence about one time in ten.
2. Exactly one candidate settles the searched example, and it is the hand-written second-row frame, started one left of
   the start. Every alternative read set, carry place or move should break agreement somewhere on a page with several
   columns.
   - Risk: equivalent variants. Several places along the sign row hold "×" (the first row writes it as it goes), so a
     sign read one column to the side may work just as well. If so, two or three candidates will tie, all differing only
     in where the sign is read, and nothing is bound by the binding rule. I'll report that as a tie, not a failure, and
     test each tied candidate.
3. The second worked example doesn't change the answer: whatever settled the first settles the second.
4. If one is bound: 200 of 200 first rows and 200 of 200 second rows at test, matching the hand-written reference.
5. The filter check: all 300 sampled filtered-out candidates fail stage 1.

## The ledger (planned)

**Given:**
- the first-row way of working (by hand, as before);
- the composition's form (one hand-over to a second frame; where it starts is learned);
- the candidates, proposed by the code, including the filter and the reach limit;
- the working marked as the target (the encoder);
- the facts.

**The engine:** running every candidate from the cue, agreement, and the Settled gate. **Not included yet:** the adding
frame and its hand-over (the next step); re-learning the first row under this rule (after that).
