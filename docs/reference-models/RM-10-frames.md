# RM-10 · Frames

**For:** constants with open places ("a wall, and a roof goes here"; "animal eats animal"), and the types that fill them.
**Serves:**
- CTR-1 PRN-1 (prefer the deeper explanation to a new mechanism);
- PRN-6;
- OPZ-3.

## The idea
Frames need no mechanism of their own. A memory that has been decomposed (RM-8) and rebound (RM-7) already is one:
```
constant   the shared part decomposition finds (the wall), held once on its cells
variable   the place where different parts have been bound to that constant (where a roof goes)
type       whatever binds there (the roofs); a new part bound there joins the type, with no list of fillers kept
```
"Frame" stays as a word for this pattern, not as a part of the machine. The engine's "kinds" (a slot with a list of
fillers) are bookkeeping to distil out.

## Holding a variable open (open)
From the constant alone, every part bound to it comes back: in C78, from the wall alone, both roofs. Read as a frame,
that is right: the variable is undecided. A frame needs the possibilities held as possibilities, not blended and not
guessed, until a cue picks one. They might be held as cells predicted but not confirmed. Not yet built or tested.

## Open
- Holding a variable open (above).
- Several variables that relate to each other ("x + y = z").
- A new filler binding into a variable from its surroundings alone (C66 found types from surroundings by comparison;
  doing it with cells is open).
- What picks the cell for text (RM-1).
