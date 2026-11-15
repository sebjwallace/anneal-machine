# RM-7 · Composition

**For:** tying parts that fit together into a whole, so that any part brings back the rest (synthesis).
**Serves:**
- CTR-1 CAP-4 (binding what happens together);
- CAP-11 (two kinds of memory);
- OPZ-3 (minimality).

## The idea
There is one way of making an assembly: **tying**. When the cells that won a moment are not already one memory, they are
tied into one. Each part gives a **handle**, two of its cells, and only the handles are linked. Later:
- if one part comes back, its handle wakes the tie;
- the tie wakes the other parts' handles;
- each part completes itself (RM-4).

A whole is held on its parts' cells, not new ones: each level adds one segment on each of its handle cells. So a whole
costs what its parts number, not what they hold, and the same cells stand for a part, a half and the whole at once,
layered by their segments.

## What it does (core)
```
tie the moment's winners:
    parts = the winners grouped by what holds them together: two are in one part when one's firing segment holds a
            link from the other                                   # read from segments, not handed in
            a winner nothing explains is a part of its own
    if there is only one part: nothing to tie                     # they are already one memory
    handle(part):
        a part of one cell: that cell
        else: two of its cells that one of its segments ties together
    sample = the handles of all parts
    each cell of the sample grows one segment over a sample of the others (RM-3: sampleSize of the sample's size)
```
- **All new:** every cell is a part of its own, so every cell is taken: a new assembly (AB, ABCD).
- **Known parts:** a handle from each: a whole (the Z from ABCD, DGJM, MNOP).
- **Wholes of wholes:** the same again (a square: four quarters, two halves of two quarters, the whole of two halves).
- **The cut** uses the same rule (RM-8).

**Why a handle, not any two cells.** A segment fires at two of its memory's cells (RM-2), so a part is woken by two of
its cells coming back together. Two cells drawn freely from a part made of smaller parts can fall in different pieces,
one in each, and wake neither: on the square, one quarter then brought back only 6 of the other 12 cells. Two cells tied
by one of the part's segments always wake it: every quarter brings back all 12, in 200 of 200 seeds.

**Why two per part.** With one cell per part, a part that comes back lights one sampled cell, and no segment of the tie
ever sees two (C76: one per part never brought the rest back).

## Keeping
- **Tied once, from a single moment:** an experience, kept at once and bounded by heat (CTR-1 CAP-11).
- **Tied because it keeps recurring:** a whole that pays over repetition.

Same mechanism, two keeping rules; neither is yet defined at the level of cells (RM-9). Today every tie is kept.

## Rules a rebuild must keep
- **Tie a handle on each part, never every cell to every other.** Extra links only add chances to fire by mistake.
- **One rule for every level.** A pair, a part and a whole are made the same way; nothing marks which is which (RM-3).
- **A tie is structure, and should pay its links** (RM-9): not yet defined at the level of cells, a known gap.

## Evidence
- C76: one sampled cell per part never brought the rest back; two always did; 30 links per composition against 132 for
  wiring everything.
- C77: at 64 cells per column, 96% clean with 500 compositions stored.
- The core (15 November 2026), in `src/test/`:
  - AB, CD, ABCD: ABCD is recognised as AB and CD and tied from them, not stored again;
  - the Z tied by a handle on each of its three parts; any part brings back the whole Z;
  - the square: every level costs 12 links (against 120 to wire 16 cells), and any quarter brings back the whole, 200
    of 200 seeds.
- The visual [z-binding](../visuals/z-binding.html) (drawn before ties were one rule); the core's viewer, `src/view/`.

## Junctions
A column with two winning cells marks where two assemblies meet (RM-5). Parts fit together by being active together,
shared cell or not (C76).

## Open
- **When to tie.** The core ties whenever a moment's winners are not one memory. What marks a moment as a whole (the
  end of a sentence, a held episode) from the region's own state is not settled.
- **A partly new input is tied as one** (AB known, EF new): EF gets no assembly of its own until a cut finds it (RM-8).
- **Which part wakes a whole above it depends on its handle.** After AB, CD, ABCD, ABEF, GH, ABCDEFHG, the outer whole's
  handle on its larger part was F0 A0: ABEF brings back GH, ABCD does not.
- When a tie should be kept (an experience against a recurring whole), at the level of cells.
