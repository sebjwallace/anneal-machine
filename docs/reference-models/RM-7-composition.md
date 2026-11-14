# RM-7 · Composition

**For:** tying parts that fit together into a whole, so that any part brings back the rest (synthesis).
**Serves:**
- CTR-1 CAP-4 (binding what happens together);
- CAP-11 (two kinds of memory);
- OPZ-3 (minimality).

## The idea
Parts active together are bound by a **small sample of their active cells**. Each sampled cell grows one new segment
holding links to the other sampled cells. Later:
- if one part comes back, its sampled cells wake the binding;
- the binding wakes the other parts' sampled cells;
- each part completes itself (RM-4).

## What it does
```
bind(active):                                  # the active cells, after settling
    parts: group the active cells by their firing assembly segments: two active cells are in the same part if one's
           firing segment (kind 'part' or 'word') holds a link from the other   # read from segments, not handed in
    sample = for each part, two of its active cells
    for each cell c in sample:
        c grows a segment (kind = 'bind') holding links to (sample without c)
    keep the binding only if it pays (RM-9)        # not yet defined at the level of cells: a known gap
```

**Why two per part:**
- a segment fires at two active links (RM-2);
- with one cell per part, a part that comes back lights one sampled cell, and no binding segment ever sees two;
- with two, every other sampled cell's segment sees two and fires.

**Which two:** the active ones; any two will do. There is no choice to make: the cells are the winners already active.

## Keeping
- **Bound once, from a single moment:** an experience, kept at once and bounded by heat (CTR-1 CAP-11).
- **Bound because it keeps recurring:** a composition, kept because it pays over repetition.

Same mechanism, two keeping rules.

## Rules a rebuild must keep
- **Bind a sample, never every cell to every other.** Extra links only add chances to fire by mistake.
- **A binding is structure, and should pay its links** (RM-9): not yet defined at the level of cells, a known gap.

## Evidence
- C76:
  - one sampled cell per part never brought the rest back; two always did;
  - 30 links per composition against 132 for wiring everything;
  - far fewer stray cells, at about a fiftieth of the work.
- C77: at 64 cells per column, 96% clean with 500 compositions stored.
- **Note:** in C76 and C77 the parts were given by the world the experiment built. Grouping the active cells into
  parts by their firing segments, as the pseudocode does, is proposed, not yet tested.
- The visual [z-binding](../visuals/z-binding.html).

## Junctions
A column with two winning cells active marks where two assemblies meet: a strong sign that they fit together, but not
required (C76's parts shared no cell).

## Open
- **When to bind.** Binding needs a moment that marks a whole (the end of a sentence, a held episode). What marks it,
  from the region's own state, is not settled; in C76-C78 and C81 the experiment chose the moment and the parts.
- When a binding should be kept (the experience store against paying over repetition), at the level of cells.
- Binding from a part only partly seen.
