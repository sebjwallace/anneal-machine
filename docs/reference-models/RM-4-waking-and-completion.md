# RM-4 · Waking and completion

**For:** bringing back a whole memory from part of it.
**Serves:**
- CTR-1 CAP-3 (auto-associative memory);
- GOL-2 (useful on the job);
- CON-7 (don't guess).

## The idea
A few active cells wake any memory with two or more of its cells active. A woken memory brings back the rest of itself,
round by round, until nothing new fires: pattern completion, as in Hopfield. Through the levels of a whole (RM-7), one
part brings back the whole: its handle wakes the level above, which wakes the other parts' handles, and each part
completes itself.

## What it does (core)
```
settle(cue):                                    # cue: the cells lit this moment
    active = cue
    repeat until nothing new joins:
        count segments wired to cells, from active (RM-2), with competition between memories (RM-5)
        candidates = cells not in active with a firing segment
        top = the candidates at the top level of support
        refuse rivals among them: two cells in one column, of different memories, woken by the same evidence
        if nothing is left: stop
        active = active + the rest of top
    return active            # the cue plus what was brought back (predicted, not seen)
```
- **Rivals are alternatives, not neighbours.** Two cells in one column woken by the same active cells are two
  explanations of one thing, and neither is taken (CON-7). Two woken by different evidence can both be right, where two
  memories meet in one column (a recalled junction, RM-5), and both join.
- **It ends by itself:** what is active only grows, and cells are finite. No round limit is needed.

Cells brought back are **predicted**, not seen. If they are later seen, the prediction is confirmed. If they are seen
not to be there, that is heat (RM-6).

## Rules a rebuild must keep
- **A cue that fits two memories equally brings back neither** (a tie is refused), unless the two are possibilities of
  one variable (RM-10).
- **A brought-back cell is never stored as lived** (CTR-1 CON-8): what the volume keeps as the moment before is what
  was seen.

## Evidence
- C74: with only the top level of support joining (RM-5), half a cue completed as well as a whole one (71-87%).
- C76: one part of a composition brought back the whole every time, through its binding.
- The core (15 November 2026): half a stored assembly brings back the rest; a cue fitting two memories from the same
  evidence brings back neither; any part of the Z, and any quarter of a square tied in two levels, brings back the
  whole (200 of 200 seeds). In `src/test/`.

## Open
- The level of support is one over all candidates in a round: global (RM-5, open).
