# C173 · The memory keeps what it finds (a taste): hypothesis

Written before the run, after the build check (`sanity.js`). Date: 2026-11-27.

## The question

Until now, when something settled, my code chose what to keep (a single winner across every worked example) and built a
fresh test circuit from it. Can one memory do the keeping and choosing itself? It would work the worked examples, keep
whatever settles, try what it has kept on the next example, let repetition and competition do the choosing, and then
be tested, all without being rebuilt or copied.

## The setup

- **One memory for the whole run.** The first row starts at the cue (given, as before). After the first row, at the
  hand-over, a recall: the first row's end brings on one of the kept second-row ways of working. The kept ones are rivals
  from the same hand-over, and copies count (C148).
- **A kept way of working** is a frame cell bound to a shared vocabulary of parts, plus its own jump and its own end.
  The vocabulary is every part kind (hold, read, carry read, sign read, units write, carry write, move) at every place
  in reach, wired in advance. Which parts come on is what makes it this way of working and not another. (New
  architecture, general: the reach is fixed and the vocabulary doesn't grow per task. Twelve frame cells are made in
  advance.)
- **Binding on settling** (architecture, C151's binding rule moved into the same memory): when the page settles, the
  frame that's on gets another copy of its recall link.
- **The page and the target in the one memory.** Each problem gets a fresh sheet, and the page's content is bound with
  it, so one problem's writing can't be read in another. The worked example's working is given as held activity with
  the cue, like having the solution in view, and agreement gates (wired in advance at every place for every digit) cool
  a place when a write gives the target digit. Each worked example has its own Settled gate, keyed on its sheet. At
  test, no target is given.
- **Per worked example, in order:**
  1. The memory tries what it has kept: a run from the cue.
  2. If the page settles, that's the end of it. Binding adds a copy.
  3. If not, the memory's offers: every kept frame whose recall link competed at the hand-over is tried in turn, by
     giving its frame cell with the cue. Giving it with the cue makes its own recall link win, because it has more
     support (shown in the build check). Each that settles gets a copy. Reading the competition to find the offers is
     the code's (as C164).
  4. If nothing is kept at all (the first example only), the code's search proposes. It's reused from C172: the same
     example (525 × 67), searched in C172's trial circuit, where 6 candidates settled. Each is kept as a new frame with
     one copy. As a check, each is then given with the cue in the memory itself, and should settle there too.
- **Six worked examples:** C172's two, then four more (seeded). **Test:** C172's 200 new long multiplications, in the
  same memory, from the cue, with the page showing only the question.
- **Two arms.**
  - **No tie-break:** the engine as C172.
  - **The first formed wins:** an engine variant (a declared crutch) in which, among rivals tied at the same support
    and copies, the earliest formed wins instead of all being held.

## What the six kept frames will be

The order of the search's list (C172's shards) is: first the three coincidences (holding a first-row digit), each
with the sign read in three places, then the three right frames (holding the multiplier's other digit), with the sign
read in the same three places. So in each arm, frames 0 to 2 will be coincidences and frames 3 to 5 right, in that
order of sign place.

## Predictions

1. **Both arms, first example:** the search's 6 are kept. All 6 settle again in the memory itself.
2. **No tie-break:**
   - Second example: the recall ties six ways, so nothing comes on. The offers are all six, and the three right ones
     settle, getting a second copy.
   - From the third example on: the three right ones beat the coincidences by copies but tie among themselves, so recall
     again brings on nothing. The offers settle the three right ones each time, so their copies grow together.
   - At test: recall brings on nothing every time, so 200 of 200 first rows, 0 of 200 second rows.
   - **Repetition removes the coincidences, but equals stay tied for ever.**
3. **The first formed wins:**
   - Second example: recall brings on frame 0, a coincidence. It fails, the offers are tried, and the three right ones
     settle.
   - Third example: the right ones have two copies against one, so they beat the coincidences. Among them, the first
     formed (frame 3, sign read below-left) wins and settles. Recall alone then settles every later example.
   - At test: frame 3 every time, 200 of 200 on both rows.
   - Which of the three equal frames wins is decided by the order my code listed them in, which is no reason at all.
     That's why it's a crutch.
4. The coincidences are never recalled at test in either arm.

## The ledger (planned)

**Given:**
- the first row;
- the hand-over's form;
- the search (reused from C172, the code's proposing);
- reading the offers from the competition (the code's);
- the working given as the target (the encoder);
- the fresh sheet per problem (the encoder);
- the facts;
- the vocabulary and frame cells made in advance (architecture);
- in arm 2, the tie-break.

**The engine:** working every page from the cue, recall by competition with copies, agreement and settling, binding a
copy on settling, and the test.

**Removed:**
- the code choosing a single winner across examples;
- the code building a fresh test circuit from it.
