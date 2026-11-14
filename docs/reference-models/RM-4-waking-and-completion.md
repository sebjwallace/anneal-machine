# RM-4 · Waking and completion

**For:** bringing back a whole memory from part of it.
**Serves:**
- CTR-1 CAP-3 (auto-associative memory);
- GOL-2 (useful on the job);
- CON-7 (don't guess).

## The idea
A few active cells wake any memory with two or more of its cells active. A woken memory brings back the rest of itself,
round by round, until nothing new fires: pattern completion, as in Hopfield.

## What it does
```
settle(cue):                                    # cue: a set of active cells
    active = cue
    repeat (until nothing new joins, or a round limit as a compute limit):
        count segments from active (RM-2)
        candidates = cells not in active with a firing segment
        winners = compete(candidates) (RM-5)
        if winners is empty: stop
        active = active + winners
    return active            # the cue plus what was brought back (cells predicted, not seen)
```
Cells brought back are **predicted**, not seen. If they are later seen, the prediction is confirmed. If they are seen
not to be there, that is heat (RM-6).

## Rules a rebuild must keep
- **A cue that fits two memories equally brings back neither** (a tie is refused), unless the two are possibilities of
  one variable (RM-10).
- **A brought-back cell is never stored as lived** (CTR-1 CON-8).

## Evidence
- C74: with only the top level of support joining (RM-5), half a cue completed as well as a whole one (71-87%).
- C76: one part of a composition brought back the whole every time, through its binding.

## Open
- The round limit is a compute limit; with competition, settling has always stopped well within it.
