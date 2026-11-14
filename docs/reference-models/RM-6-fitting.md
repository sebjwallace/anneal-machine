# RM-6 · Fitting

**For:** explaining an input with the assemblies already known, leaving the misfit as heat. Fitting never changes
memory; that is consolidation (RM-7, RM-8).
**Serves:**
- CTR-1 OPZ-4 (heat);
- CAP-7 (heat as a valve);
- PRN-3 (let heat decide where effort goes);
- CON-18.

## The idea
Candidate assemblies compete to explain the input. The one that saves most takes its cells; every rival recounts on what
is left; an assembly is taken only while it still saves something. In the cell form, support (how much of a memory is
active, RM-2) stands in for saving, because the bill is not yet stated in cells and links (RM-9): a known gap. Then every cell knows its own state, and the
competition is reopened only where a winner left heat.

## Local heat
After fitting, every cell is in one of these states:
```
lit and predicted              fits
lit, predicted by nothing      uncovered (heat)
predicted, not lit             claimed but not there (heat)
neither                        quiet
```
The total misfit is the sum of the two heats, but nobody adds it up: each cell knows only its own.

## What it does (the cell form, proposed)
```
fit(input):                               # input: lit input cells
    light their columns (RM-1)
    candidates: memories woken by the input (their cells' segments fire, RM-2, RM-4)
    repeat:
        winners = compete(candidates) (RM-5)         # one shared level of support; rivals refused
        the winners' cells become active; their cells are explained
        read every cell's state (local heat, above)
        hot = winners that left cells predicted but not lit
        if hot is empty: stop
        release the hot winners' cells, and let the rivals compete for them again without the hot winners
            (at most a few times: a compute limit)
    return the states                     # the misfit is what is left lit and unexplained, or predicted and not there
```
Not yet built or tested in this form. The re-settling step is shown in C75 (over placements); the waking and competition
steps are shown in C73, C74 and C78.

## Today's core (bookkeeping: not to be rebuilt this way)
The core's `explain` and `greedy` in `src/engine/see.js` do the same competition over placements: every unit is counted
against every lit pixel to make the candidates, scored, then taken greedily, then re-settled where heat is left. That is
a scan over a list of all units (CTR-1 CON-19, CTR-2 CON-8), recorded here only so a reader knows what it is.

## Rules a rebuild must keep
- **Fitting never changes memory.**
- **Re-settling touches only cells with heat;** cells that fit cleanly are never reopened.
- **A dead heat between rivals that exclude each other is not broken by order** (RM-5). In C75, refusing all ties was
  worse; the rule is to refuse only true rivals.

## Evidence
- C75: competition alone matched the old search on 1,495 of 1,500 pictures; with re-settling, on all 1,500, for about a
  fortieth of the work, and learnt exactly the same. In the core since 14 November 2026.
- The visual [z-fitting](../visuals/z-fitting.html).

