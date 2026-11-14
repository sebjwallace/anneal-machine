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
is left; an assembly is taken only while it still saves something. Then every cell knows its own state, and the
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

## What it does (as in the core, over placements)
```
fit(input):
    best = compete(input, banned = none)
    current = best; banned = {}
    repeat at most 6 times (a compute limit):
        hot = winners in current that claimed cells not lit
        if hot is empty: stop
        banned = banned + hot                         # take back only the winners that left heat
        current = compete(input, banned)
        if cost(current) < cost(best): best = current
    return best

compete(input, banned):
    candidates scored by saving = newly explained - claimed but not there - price (RM-9)
    repeat: take the best candidate, if its saving is above zero; every other candidate recounts on what is left
```

## The cell form (proposed)
The same steps with cells:
- candidates are the memories woken by the input (RM-4);
- the "saving" of each is its support against its price;
- the shared level of support picks winners (RM-5);
- the states above are read straight from the cells;
- re-settling releases the cells of a winner that left "claimed but not there" and lets the rivals compete again for
  them.

Not yet built.

## Rules a rebuild must keep
- **Fitting never changes memory.**
- **Re-settling touches only cells with heat;** cells that fit cleanly are never reopened.
- **A dead heat between rivals that exclude each other is not broken by order** (RM-5). In C75, refusing all ties was
  worse; the rule is to refuse only true rivals.

## Evidence
- C75: competition alone matched the old search on 1,495 of 1,500 pictures; with re-settling, on all 1,500, for about a
  fortieth of the work, and learnt exactly the same. In the core since 14 November 2026.
- The visual [z-fitting](../visuals/z-fitting.html).

## Note on the core today
The core's competition (`greedy` in `src/engine/see.js`) builds its candidates by counting every unit against every lit
pixel. That is association in bookkeeping form, and at the pixel level nothing can be skipped. It is to be replaced by
the cell form.
