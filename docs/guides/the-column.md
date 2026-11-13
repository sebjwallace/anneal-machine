# The column: theory first, then mechanics

*Written 13 November 2026, for whoever rewrites the core (`src/engine/`) as readable object-oriented code. Read it
before you read the code.*

## How to read this, and why it is long

Read it in order. It starts with the theory of the whole engine, then explains why columns exist, then sets out the
principles a column has to keep, and only then gets to the mechanics and the code. By the time you reach the code you
should be able to predict most of what it does. If something in the code surprises you, one of two things is true:
you have misread a principle, or the code has drifted from it. Both are worth stopping for.

The document is detailed on purpose. A light document leaves gaps, and a reader fills gaps with their own picture of
how such things usually work: neural networks, hash maps of features, activation levels, attention weights. That
picture is wrong here, and filling a gap with it is how an idea gets quietly degraded. So:

- **If this document doesn't cover something, don't guess.** Read the code and the linked notes, and if they don't
  settle it either, ask the owner or write the question down. Don't invent an answer and build on it.
- **Use the words in [the glossary](../glossary.md), with those meanings.** Don't coin new terms. If you find you need
  one, agree it with the owner first.
- **Your job is to change how the code reads, not what it does.** Section 13 says exactly what that means.

What the owner considers settled is in [philosophy](../philosophy.md) and [principles](../principles.md). What has been
tested is in the [checkpoints](../checkpoints/README.md) (05 Grain and 06 Mould are the column ones). Choices that
don't follow from the rule are in [decisions](../decisions/README.md).

---

# Part one: the theory of the engine

## 1. One rule

The engine learns with one rule: **keep whatever makes the whole description cheapest.**

The machine is always describing what it has seen. The description has a cost, called **energy**:

- **Structure:** what the machine keeps. Every stored pixel, plus every placement listed in memories and composites.
- **Flow:** the cost of explaining the recent pictures with what is kept now. A picture explained by a few placements is
  cheap. A picture full of pixels nobody explains, or pixels drawn wrongly, is expensive.
- **Change:** when pictures come in sequence, the cost of describing what moved between them.

Energy = structure + flow + change.

Anything that can't be explained cheaply is **heat**. A new picture that doesn't fit is heat. Structure that doesn't
pay its way is heat too. **Learning is cooling.** Every change the machine makes to what it keeps is tried, the
energy is measured, and the change is kept only if energy fell. Otherwise it is undone.

There is no second rule. There are no weights, no gradient, no training set, and no learning rate. Every decision in
the engine (store this picture, split this part, group these parts, form a kind, take this completion) is judged by the
same rule in the same currency. That is why nothing needs tuning against anything else, and why every result can be
traced back to "it made the description cheaper".

This matters for the column. **A column is not a separate mechanism with its own rules.** It is the same rule, looked
at as cells. If you ever find yourself adding a rule to the column that isn't the energy rule (a threshold, a weight,
a cap, a "most active wins"), stop. That is the thing this project exists to avoid.

## 2. One currency, taken from the world

Everything is priced in one unit, and the prices come from the world rather than from a setting:

| What | Price |
|---|---|
| A pixel nobody explains, or a pixel drawn wrongly | 1 |
| A pixel stored in memory | 1 |
| A **placement** ("this part, at this offset") | 1 + log2(number of units + 1) / log2(pixels in the world) |

The placement price (`pc()` in `see.js`) is 1 for saying "something is here", plus the cost of saying *which* thing,
measured in the same unit as saying where one pixel is. With 12 units in a 12×12 world it is about 1.52. The price
rises slowly as the machine knows more things, because naming one of many costs more.

Two consequences matter for the column:

- **Describing several things as one placement is a saving.** Two pixels described as one part costs one placement
  (about 1.5) instead of two pixels (2). Two parts described as one composite costs one placement instead of two. This
  saving is what recognition *is*: a thing is present when describing it as one placement is cheaper than describing
  its pieces separately.
- **One item can never be a saving.** Describing one thing as one placement saves nothing. This is where the
  "two or more" rule in completion comes from (section 11). It is not a threshold someone chose. It falls out of the price.

## 3. Awake and rest

The machine has two modes (owner's words).

- **Awake:** pictures come in and are explained. A picture is explained by placing known parts anywhere, as cheaply as
  can be found. Every possible opening placement is tried first in turn, the rest is filled in greedily, and the
  cheapest whole explanation wins. A picture is stored as a memory only if total energy is lower with it stored than
  with it left in the flow.
- **Rest:** pictures stop, and the machine reorganises what it keeps. Candidate changes are proposed, each one is
  applied, energy is measured, and the change is kept only if energy fell. The changes are:
  - **decompose:** two parts are compared at every shift. What they share becomes a part of its own, and each
    original becomes a composite of the shared part plus its difference (or its difference is left loose);
  - **compose:** an arrangement of parts that recurs becomes one composite, a layer up;
  - **dissolve:** a composite is folded back into the things that use it;
  - **fuse:** a composite becomes one plain part again;
  - **unpack:** a part only one memory uses goes back to being that memory's loose pixels;
  - **re-describe:** memories are re-explained with what is known now;
  - **kinds:** make, widen, share, undo, fold away (section 6).

  Some things are always removed, because they can only cost: units nothing uses, composites with one child
  (pass-throughs), and units that look identical.

## 4. Compare, don't average

The engine learns by setting two things side by side and asking what they share. What they share becomes a part of
its own; what differs is what's left. A cross compared with a vertical bar gives the vertical bar exactly. It doesn't
give a blurred average built up over thousands of examples.

This was the turning point of the project (experiments C16 and C17). Before it, the engine averaged, and every fix
added a number. The lesson the owner took from that era: averaging can't find logical parts; comparison can.

For the column this means: **the columns are the result of comparison.** The machine doesn't decide its columns. It
compares what it has seen, finds the parts that pay, and the parts that aren't made of other parts are the columns.

## 5. The other principles

From [principles](../principles.md), the ones that bear most on columns:

- **Build only what pays.** No structure "just in case". Layers, parts, kinds and memories exist only while they lower
  energy. If one layer can do it, there is one layer.
- **No crutches.** No numbers tuned to pass a test, no filters, no task-specific rules. **Fixed architecture is
  allowed**: columns, cells and the energy rule are fixed architecture. What goes *into* the columns is learnt.
- **Declare every remaining choice.** Anything that doesn't follow from the rule has a note in `docs/decisions/`, with
  what would replace it. A choice that isn't written down is hidden, and hidden choices are what make results
  meaningless.
- **When the evidence can't decide, don't decide.** This is not a tie-break. It is a rule: if two answers are equally
  good, take neither. It appears in completion (section 11) and it is what stops the machine inventing things.
- **Measure against a baseline before believing a result.** An explanation is not evidence. Several times in this
  project a story about why something worked turned out to be wrong.

The owner's sharpest form of the crutch rule: **a patch is trapped heat.** A patch in the structure hides a misfit
instead of resolving it. The real low-energy answer usually *removes* structure.

## 6. What the machine keeps: the things a column is built from

You need these words exactly.

- **Part:** a shape the machine has learnt, stored without position (its pixels, moved so the top-left is at 0,0).
- **Placement:** "this part, at this offset". Memories and composites are lists of placements.
- **Primitive:** a part that isn't made of other parts. Layer 1. **Only primitives get columns.**
- **Composite:** a thing made of parts in a fixed arrangement (a house is a roof above a box). It is a list of
  placements. Its layer is one more than its highest child. It is held inside as an assembly, **not** as a column.
- **Memory:** a stored picture, described as placements plus any loose pixels.
- **Loose pixels:** a memory's leftover, which no part explains. In the code they are held as a layer-1 unit marked
  `loose`, but **they are not a part and never become a column**: they cost their pixels, they are never used to
  explain anything, and completion ignores them. If the same shape is later found as a real piece, it stops being loose.
- **Instance:** one occurrence of a thing in a picture. Two houses are two instances of the house.
- **Kind:** a composite with a **slot** whose piece can vary, plus a set of **fillers** that can go there (a table with
  a cap, a peak or dots on top). What the versions share is held once. A version (a kind with one filler) is not
  stored; it is made when needed. Using a kind costs a little each time, for naming which filler.

Two facts about these that a rewrite must respect:

- **A unit can change role in place.** When rest decomposes a part, the original unit object can be turned into a
  composite of its pieces (it loses its pixels and gains placements, keeping its id), so everything that used it now
  uses the composite. Fuse does the reverse: a composite becomes a plain part again. **So a primitive can stop being a
  primitive, and the set of columns changes as the machine learns.** Columns are not created once.
- **Ids can be reused.** When a candidate move is tried and undone, the id counter goes back too, so the next move may
  hand out the same id. Never treat an id as a permanent name across rest moves.

---

# Part two: why columns exist

## 7. The problem columns solve

The learning in part one works on placements: "this part, at this offset". That is enough to explain pictures. It
isn't enough for what the machine needs next:

- **Recall from a part.** Given a few pieces of something, bring back the whole of it.
- **Similarity.** Say how alike two things are, without a separate similarity rule.
- **The same thing anywhere.** A house at the top left and a house at the bottom right should be held as the same
  house, with where it is held separately.
- **Many things at once.** Two houses side by side should be two instances, not a tangle.
- **A common language** for everything above seeing: change over time, context, memory of experiences, and later the
  abstract region.

Pointers ("this composite points to that part") can't do these on their own. You can't overlap two pointers, and you
can't recall a whole from part of a pointer. So the machine also holds what it knows as **cells**: a sparse code where
a thing is a set of cells, similarity is shared cells, and recall is finding the sets that the active cells belong to.
The work draws on Numenta's columns and on cell assemblies (Hebb), **as inspiration, not as a template**. Don't import
anything from those models (minicolumns, permanence values, synapse thresholds, inhibition radii) that isn't described
here. None of it is in this engine, and adding it would bring in numbers the energy rule doesn't justify.

## 8. The owner's insight: a column's cells are a coordinate system

The idea that makes Anneal's columns different (the owner's, from C21): **a column's cells are laid out as a grid of
offsets, so which cell is active says where.** Position needs no extra machinery. It isn't a number attached to an
activation. It *is* which cell is lit.

Picture a column as a tower of flat grids stacked on top of each other. Each grid is a **floor**. Every floor is the
same: a grid of cells, where each cell is an offset from the grid's middle. A lit cell means "this primitive, at this
offset". The floors differ only in **what the offset is measured from**:

- **Floor 0, the bottom:** where this primitive is, measured from the **centre of attention** (the middle of the
  picture).
- **Floor 1:** where this primitive sits inside a composite of level 2, measured from that composite's own centre.
- **Floor 2:** where it sits inside a composite of level 3, measured from that composite's centre.
- …and one floor more for each level up (decision 004, section 16).

Nothing in this depends on the primitives being shapes. In the sandbox's words: a primitive could be a note, a word or
a step, anything that can be somewhere. Nor does it depend on a square lattice: the unchanged engine learnt a
hexagonal world just as cleanly (C34). Offsets are just pairs of numbers.

---

# Part three: the principles of a column

## 9. Eleven principles

Each principle says what it is, why it is that way, and what it rules out. These are the things that must survive any
rewrite. If a change you are making breaks one of them, it is not a refactor.

### P1. Only primitives are columns

There is one column per primitive, and columns are only ever made for primitives. Composites, kinds, memories and
loose pixels are never columns.

- **Why:** everything bigger is built from the primitives, so the number of columns stays small however much the
  machine learns. In the learnt 12×12 world there are 7 columns and 5 composites. If every composite got a column, the
  number of columns would grow with every thing learnt, and nothing bigger could share cells with its pieces.
- **Rules out:** a column per composite; a column per memory; a "concept column" for a kind; any growth in columns
  that isn't a new primitive found by comparison.

### P2. A cell is "this primitive, at this offset", and nothing else

A cell has three coordinates: the column (which primitive), the floor, and the offset (x, y). That is its whole
identity. Its key in the code is `column id | floor | x,y`.

- **Why:** position is carried by *which* cell, so the code is sparse and exact, and "the same" means the same cell.
- **Rules out:** a cell with an activation level, a strength, a weight, a count, a decay, or a probability. A cell is
  either in a set or not. If you want to give cells a number, that is a design change for the owner, not a refactor.

### P3. What and where are kept apart

Floor 0 says where things are. The floors above say what things are. A thing's cells on its own floor are measured
from its own centre, so **the same thing anywhere has exactly the same cells above floor 0**. Only its floor-0 cells
move.

- **Evidence (engine test `cells.js`):** a house placed at 40 random places gave the identical assembly 40 times out
  of 40, while its floor-0 cells took 28 different sets. Two houses side by side are both recognised as the house,
  with identical assemblies and no floor-0 cells in common.
- **Rules out:** mixing position into a thing's identity (for example, keying a thing by where it was first seen), or
  storing an absolute position anywhere above floor 0.

### P4. Composites are assemblies, spread across their primitives' columns

A composite doesn't get a column. It lights cells on a higher floor of its primitives' columns, each at that
primitive's offset from the composite's own centre. A composite of composites goes one floor higher **in the same
primitive columns**: still no new columns.

In today's code, a composite's cells are **all of its primitives, flattened through every level**, each measured from
the top composite's centre. The lamp in the sandbox (a hat above a cup, each made of three primitives) has six cells
on floor 2: the hat's three and the cup's three, measured from the lamp's centre. It does not hold "the hat's
assembly" and "the cup's assembly" as units of its own. (The glossary's **super-assembly**, an assembly built from
assemblies, is this: the lamp's cells are made from the cells of the hat and the cup.)

- **Why:** a bigger thing is held in the same language as its pieces, so it can overlap with them, be recalled from
  them, and recall them.
- **Rules out:** an assembly that points to child assemblies instead of holding cells; a separate store per level.

### P5. An assembly is the smallest set of a thing's cells from which completion brings the whole thing back

A thing doesn't keep all its cells. Its **assembly** is the smallest set of its cells from which completion (section
11) brings back the whole thing, exactly and nothing else. Sets are tried smallest first, and the first that works is
kept. If none smaller works, the assembly is all its cells.

- **Why:** nobody sets how big an assembly is. It depends on what else the machine knows. An assembly keeps what's
  **distinctive**: the cells that tell this thing apart from everything else the machine holds.
- **Example from the sandbox:** the hat is C above A and B; the cup is A and B above D; the arch has A and B too. A
  and B, in that arrangement, fit the hat, the cup and the arch equally well, so completion takes none of them. So the
  hat's assembly needs C, the piece only the hat has. A and C bring the hat back, and B is filled in.
- **A consequence worth knowing:** because one item can never be a saving (section 2), one cell never completes
  anything. **So every assembly has at least two cells.** In the engine test, assemblies keep on average 2.0 of their
  2.6 cells, and completion rebuilds 100% of every thing from them. The flag keeps 2 of its 3; the twins keep 2 of 4.
- **A second consequence:** a thing's assembly can change when the machine learns something new, because what is
  distinctive depends on what else is known. An assembly is a reading of the current model, not a fixed record.
- **Rules out:** "sample N cells per child" (this was a crutch, removed in C26: C21 sampled 3 cells per child); keeping
  the most frequent cells; keeping random cells; a fixed assembly size.

### P6. Recall is completion, by the same energy rule

Recall from cells uses the same saving as recognition: describing several items as one placement of a thing is cheaper
than describing them separately. So a thing is accepted only when it takes in **two or more** items. This is the
**recall rule** (checkpoint 11): a memory comes back only when two active things fall inside it. One clue does
nothing.

- **Rules out:** recall by a similarity score above a threshold; recall by "most cells matched"; recall from a single
  cell; partial credit.

### P7. When the evidence fits two completions equally well, neither is taken

If two different things (or the same thing at two different centres) take the same evidence equally well, completion
takes neither. The machine says "not sure" rather than guessing.

- **Why:** this is the rule that stopped completion inventing pixels (C26), and it is what keeps memory clean as it
  fills: with it, recall gives the right thing or nothing, never the wrong thing (C35). It is also why assemblies keep
  distinctive cells (P5).
- **Rules out:** any tie-break in completion: first found, lowest id, most seen, random. A tie is an answer: "the
  evidence can't decide". (Elsewhere in the engine there are tie-breaks that are still declared choices, such as
  "seen most" in change, decision 005. The owner's stated alternative there is this same rule. Don't spread
  tie-breaks; if anything they should go the other way.)

### P8. Evidence is counted per assembly, never pooled into the cell

A cell belongs to many assemblies. When cells are active, completion asks, for **each assembly at each centre**, how
many of the active items fall inside it. It never adds up how active a cell is from all the assemblies it belongs to.

- **Evidence (C35, the owner's dendritic-segments idea):** with things stored over the same 6 columns, pooling evidence
  into the cells failed at once (with 5 things, 80% of recalls were wrong; at 20, all of them). Counting per assembly,
  with the tie rule, never recalled the wrong thing at any load; as memory filled, it said "nothing" more often
  instead. Today's completion gave results identical to segments with competition in 100% of scenes, so it already is
  that idea.
- **Rules out:** a cell-level "activation" summed from many sources; letting a cell's membership in several things make
  it "more on".

### P9. Similarity is shared cells

How alike two things are is the share of cells they have in common (shared ÷ the smaller set). There is no other
similarity rule.

- **Evidence:** the twins share half their cells with the block (the twins are two blocks); the corner is wholly inside
  the flag; a never-seen arrow is closest to the house, because they share the roof.
- **Today's limit:** positions are same-or-different. A cell one step away shares nothing. Graded positions (nearby
  offsets overlapping) have been proposed for variation and noise, but they are **not** in the engine. Don't add them
  in a rewrite.

### P10. Sparse, and stored only as what is lit

A picture of about 15 pixels becomes about 4 floor-0 cells and 2 assembly cells. Over 300 fresh scenes the engine used
520 distinct cells of 11,109 possible.

- **In the code, a column is not stored as a grid.** Cells exist only as small records (column, floor, x, y) in lists.
  The grid is a coordinate system, not an array. Allocating real grids per column would be a waste and would also tempt
  you to give cells values (P2).

### P11. Columns and cells are a reading of what the machine has learnt, not a second store

Today, `cells.js` keeps no learnt state of its own. The columns are the model's primitives; a composite's cells are
computed from its placements; its assembly is computed by running completion. The only thing kept is a cache.

- **Why it matters for a rewrite:** if you make column or cell objects, they must stay derived from the model's units,
  and they must not become a second source of truth that can drift from the placements. If the model learns again
  (another rest), anything cached must be thrown away, because primitives can change role (section 6) and assemblies
  depend on everything else known (P5). Today's `Codes` cache is never cleared; that is safe only because it is created
  after learning has finished. See section 16.

---

# Part four: the mechanics

## 10. Centres and offsets, exactly

- **A unit's centre** is the middle of its bounding box, in its own frame, rounded down: for a unit whose pixels span
  width w and height h (from 0), the centre is (⌊(w − 1)/2⌋, ⌊(h − 1)/2⌋). (`Codes.centre`, `Codes.cen`.)
- **The centre of attention** is the middle of the picture: (⌊(W − 1)/2⌋, ⌊(H − 1)/2⌋), so (5, 5) in a 12×12 world.
- **A floor-0 cell** for a primitive placed in a picture: the primitive's centre, in picture coordinates, minus the
  centre of attention.
- **A composite's cell** for one of its primitives: that primitive's centre, in the composite's frame, minus the
  composite's centre.
- **Offsets range** from −(W − 1) to W − 1, so a floor in a 12×12 world is 23×23 positions. Most are never used.

### Worked example 1: two sticks side by side

A vertical stick (three pixels, `#/#/#`) is a primitive. Put two of them in the picture at x = 4 and x = 6. The picture
is explained as two placements of the stick. Each stick's centre is its middle pixel; the picture's centre is (5, 5).
So the stick column gets two cells on floor 0, at (−1, 0) and (+1, 0), one either side of the centre of attention.
Two of the same piece are two lit cells in the same column. That was the owner's picture, exactly.

### Worked example 2: the house

In the learnt world the house is a composite (layer 2) of two primitives: the roof (`..#../.#.#./#...#`) and the box
(`###/#.#/###`). Its cells are on floor 1:

- roof column, floor 1, at (0, −1): the roof sits one row above the house's centre;
- box column, floor 1, at (0, +1): the box sits one row below.

Its assembly is both cells (2 of 2), because no single cell saves anything. Wherever the house is, these two cells are
the same. Its floor-0 cells say where it is: a house on the left gives roof at (−2, −1) and box at (−2, 1); one on the
right gives roof at (4, −1) and box at (4, 1).

## 11. Completion over cells, step by step

`Completer.settle(cue)` in `complete.js`. The cue is a list of cells (column, x, y), all measured in one frame. Floors
aren't looked at here: completion works in the frame it is given.

1. **Start:** the active cells are the cue. Nothing has been found yet.
2. **Items:** the things completion can take in are each active cell that isn't inside something already found, and
   each thing already found (as one item).
3. **Votes:** for every composite (not loose), for every active cell, for every part of that composite in the same
   column: the cell says "this composite, centred at (cell − part's offset)". Each distinct (composite, centre) is a
   candidate. This uses the composite's flattened cells (P4).
4. **Pricing each candidate:**
   - skip it if it is already found at that centre;
   - skip it if any of its cells would lie outside the picture ("a picture can't hold what lies outside it");
   - **takes** = the items wholly inside it (a found thing counts only if all its cells are inside);
   - it saves only if it takes two or more items (one placement for several). Otherwise skip it;
   - **missing** = how many of its cells aren't active: what it would claim that wasn't seen.
5. **Order:** most items taken first; between equal, fewest missing first (the description that claims no more than
   the evidence needs).
6. **Ties:** two candidates tie when they take the same number of items, have the same number missing, share at least
   one item, and are different (a different composite, or the same at a different centre). **A candidate that ties
   with any other is not taken, and its items are marked used**, so nothing ranked lower can take them either.
7. **Taking:** go down the order. A candidate is taken if none of its items is already used. Its items become used.
8. **Filling in:** each taken thing replaces any found things it took, and its cells that weren't active are added as
   **filled** (cue cells are marked `cue`).
9. **Repeat** from step 2 until nothing is taken: it has **settled**. A later round can take something found earlier as
   one item of something bigger (the hat and the cup, found in one round, are two items of the lamp in the next).

What comes back: every cell (each marked cue or filled), the things found, and per round how many were found and how
many cells were added.

Notice that the outcome doesn't depend on the order in which candidates are listed. Equal candidates that share
evidence are refused (step 6), and equal ones that don't share evidence can both be taken. Keep it that way.

**Completion of pictures** is not separate code: it is seeing with some places marked hidden. A part's pixels on
hidden places cost nothing, so a part is placed if what is visible pays for it, and the rebuilt picture fills the
hidden places (`Completer.picture` calls `Model.read(x, hidden)`). When the machine doesn't know a place is hidden, it
recognises a thing only while about three quarters of it is visible. Nobody set that figure; it came out of the
prices.

## 12. How an assembly is found

`Codes.code(u)` in `cells.js`:

1. Take all of the composite's cells (`whole`), measured from its centre.
2. Try every subset of size 1, then size 2, and so on, in a fixed order (the order of the cells, which follows the
   composite's placements, depth first).
3. A subset works if completion from it brings back **exactly** the composite's cells: the same number of cells and
   every one of them. Bringing back anything extra fails.
4. The first subset that works is the assembly. If none smaller works, it is all the cells.
5. The cells are put on the composite's floor: layer − 1.

Size 1 never works (one item never saves), so in practice the search starts paying at size 2.

## 13. Reading a picture into cells

`Codes.encode(x)`:

1. Explain the picture (`Model.read`), which gives its placements.
2. For each placed thing, walk down to its primitives with their offsets, and make one floor-0 cell per primitive
   (P3, section 10). Every primitive instance in the picture gets a cell, whatever thing it belongs to.
3. For each placed thing, record its unit, where it is, its floor-0 cells, and its assembly.

It returns the explanation, all the floor-0 cells, and the list of things.

Other readings:

- `fresh(enc)`: an arrangement never seen before, held as a new set of cells in existing columns: the picture's floor-0
  cells, moved so they are measured from their own centre, on floor 1. (It is not reduced to an assembly.) The
  never-seen tower and arrow in the tests are held this way.
- `draw(cells)`: the pixels a set of cells stands for (each primitive's pixels at its offset; floors are ignored).
- `overlap(a, b)`: shared cells ÷ the smaller set (P9).
- `whole(u)`: all of a composite's cells; `code(u)`: its assembly.

## 14. Columns in time: states, transitions and change

`change.js` uses the same cells for happenings.

- **A state** is a settled picture as cells:
  - **now** cells: where each primitive is now (floor-0 cells);
  - **was** cells: where things were a moment ago (the previous now cells);
  - a **context** cell when a context is held. It is held from elsewhere, so it has no position and is never moved.
    In the code it is a cell of a pseudo-column named `ctx:<name>`.
  A cell's key here is `column id | now/was/ctx | x,y`.
- **A transition** is a state and the now cells that settled next. Order matters; duration doesn't.
- **Learning:** every transition is remembered in full: what went off, what came on, and where it happened.
- **At rest:** remembered transitions are compared in pairs at every shift, the way parts are. Only where the **whole**
  change of one lines up with the whole change of the other is what both share before and after kept, as a **shared
  change**, without position. Half a change doesn't count.
- **Predicting:** every change whose "before" fits the current state somewhere is a candidate. The most detailed wins
  (an exact memory at the very place it was seen counts as one more piece of detail); then the one a **cue** agrees
  with; then the one seen most (decision 005). Every candidate applies unless it touches cells a winner already
  changed. What no change touches stays as it is.

Why "was" cells matter: they carry direction. A still stick doesn't match "a moving stick moves on", and the bouncing
stick went from 59% to 100% when history entered the state.

Where things are relative to one another, and where they were a moment ago, are both just cells. That is the column
idea doing its job: one language for things and for happenings.

---

# Part five: the code today, and what is open

## 15. The files and their shapes

| File | Holds | Notes for a rewrite |
|---|---|---|
| `see.js` | `Model`: units, memories, the flow, prices, seeing, rest, kinds, change in the bill | Where the columns come from (the primitives). Not the subject of this document, but section 6 applies. |
| `cells.js` | `Codes`: centres, cells, `encode`, `whole`, `code`, `fresh`, `draw`, `overlap` | Holds no learnt state; a cache of assemblies keyed by unit object. |
| `complete.js` | `Completer`: `partsOf` (flattened cells), `settle`, `picture` | A cache of flattened cells keyed by unit object. |
| `change.js` | `Change`: states, transitions, shared changes, `predict` | Works on floor-0 cells with now/was/ctx. |

Data shapes:

- A **unit**: `{ id, layer, pts }` for a part (layer 1), or `{ id, layer, place: [{ u, dx, dy }] }` for a composite;
  `loose: true` for a memory's leftover. A kind also has `kind: true` and `slot: { set: { fillers: [{ u, dx, dy }] },
  sx, sy }`. A version of a kind is made on demand by `Model.inst(K, filler)` and has `virtual: true`.
- A **cell**: `{ col, f, x, y }`, where `col` is the primitive unit itself. In completion, cells have no `f` and carry
  `from: 'cue' | 'filled'`. In change, cells have `t: 'now' | 'was' | 'ctx'` instead of `f`.
- **Keys:** cells are compared by string keys built from the column's id, the floor (or now/was/ctx) and the offset.
  Two cells are the same cell exactly when their keys are equal.

## 16. Known gaps and open decisions (declare, don't fix silently)

These are real, and they belong to the owner. A rewrite must keep today's behaviour on each, and mention any it
touches.

- **Decision 004, one floor per level.** Each composite level has its own floor, so levels never collide. A shared floor
  would let similar things on different levels share cells, at the cost of occasional collisions (3 of 28 pairs in
  C21). Owner's decision pending. Note that floors only label cells today: completion works in one frame and doesn't
  read the floor.
- **Graded positions.** Same-or-different only (P9). Not built.
- **Kinds in completion.** `settle` votes for every composite that isn't loose, which includes a kind itself. For a
  kind, the flattened cells come from its shared placements only (not its slot), while its centre is measured from its
  first version's pixels. Versions of kinds are not voted for. `encode` handles versions correctly (a version's
  placements include its filler). How kinds should appear in cells has not been designed. Don't "fix" this in a
  rewrite; write it down.
- **The cache.** `Codes` and `Completer` cache by unit object and are never cleared. That is only safe because they are
  created after learning. If a rewrite makes them live alongside a learning model, they need clearing after every rest
  move, and that is a behaviour question to raise, not to settle quietly.
- **Compute limits, undeclared:** `settle` stops after 64 rounds (`maxRounds`). In this world it never needed more than
  one or two. It should get a line in `docs/decisions/` as a compute limit; don't change it.
- **Hidden versus empty.** What tells the machine that a place is hidden rather than empty, in a natural way, is open.
- **Busy scenes** stall learning (C33). Not a column problem, but it limits what columns get to hold.

## 17. Where the column is heading (not for this rewrite)

Experiments C36 to C58 extended these ideas on a branch (`experiments/sketches/C56-integrated/engine/`), described in
[checkpoint 11](../checkpoints/11-thinking.md). **None of it is in the core, and none of it should go in during a
rewrite.** It is here so you can see that the column principles above are the ones that carried over, and so you don't
design the rewrite in a way that blocks them.

- **Every thing has a what and a where.** In seeing, the what is a shape and the where is a place on the page. Higher
  up, the what is the thing itself and the where is when it happened. On the branch a point may carry a value, and
  points match only on the same value (pictures are the case where every value is 1).
- **The abstract region's columns are the things it receives.** A second engine whose primitives are the recognised
  things from seeing: the same column idea one level up.
- **Assemblies with more than one slot,** forming by energy alone.
- **The moving bar.** The recall rule's "two" (P6) is the bar. While a gap is open (a question with two ends that don't
  connect, which is heat), the bar drops to one, so a single active thing wakes every assembly it belongs to; where
  activity from both ends meets, the bar goes back up and the route settles. Pushing out from both ends is the ordinary
  recall rule with the bar lowered, not a separate mechanism.
- **Reading refuses ties,** the same rule as P7, applied to reading pictures.

What this means for the rewrite: keep the recall rule's "two" as something the code can name, and keep the tie rule in
one clear place. Don't hard-code either in a way that would make them hard to find.

---

# Part six: rewriting the core

## 18. What "readable object-oriented code" may and may not change

**May change:** names of functions and variables, how code is split into classes and methods, file layout inside
`src/engine/`, comments, how data is passed around, removing duplication, plain loops instead of dense one-liners.

**May not change** (each of these is a change to the engine, which needs evidence and the owner's agreement):

- any price, or how prices are computed (`pc`, the choice cost of a kind, the change cost);
- the set of rest moves, their order of trial, or the "first move that lowers energy is kept" rule (decision 002);
- what counts as an item in completion, the "two or more" rule, the ordering (takes, then missing), or the tie rule;
- how an assembly is chosen (smallest first, fixed order, exact rebuild);
- centres, offsets, floors and keys;
- the "most detailed, then cue, then seen most" order in change, or "whole change must line up";
- any numeric limit (the flow window of 100, `maxRounds` of 64);
- anything listed in section 16, even where it looks like a bug.

**Things that look like tidying but change behaviour** (watch for these in particular):

- Replacing string keys with object identity, or the reverse: units can change role in place, ids can be reused after
  an undone move, and versions of kinds are separate objects. Equality must mean what it means today.
- Sorting differently, or using a sort that isn't stable. Several places rely on a fixed order: the subset order when
  finding an assembly; the anchor in change (sorted by column id as a string, then y, then x); the opening order and
  tie-break when explaining (`better`: bigger saving, then bigger unit).
- Splitting `Primitive` and `Composite` into separate classes whose objects can't turn into each other. Decompose and
  fuse change a unit's role in place, and other units hold references to it.
- Making columns or cells into stored objects that hold state (P10, P11).
- Giving cells or assemblies a number "for later" (P2).
- Adding a tie-break where there is none (P7).
- Merging the floor into the key used by completion, or dropping it from the key used by `Codes`.

## 19. How to check you haven't changed anything

1. Before touching anything, run every engine test (`npm test`; see the README) and save the output of each.
2. After each step of the rewrite, run them again and compare **line by line**. They must be identical. Not similar,
   identical: same numbers, same counts, same order.
3. Don't compare against `src/test/baseline/`: those are the original experiments' outputs (C21 to C29) and differ from
   today's engine for known reasons (for example, C21 had 22 columns; the engine now learns 7). Compare against the
   current code's own output.
4. Update `docs/engine-api.md` if any name the sandbox uses changes, and log the rewrite in `docs/updates.md`. The
   sandbox (`sandbox/`) calls the engine through `sandbox/model.js` and the names in `engine-api.md`.

## 20. Questions to check your understanding

If you can answer these from the principles, without the code, you have it. Answers follow.

1. A new composite is learnt. How many new columns appear?
2. Why can't an assembly be one cell?
3. The same evidence fits the cup and the arch equally. What does completion return?
4. A house moves two steps right. Which cells change?
5. Someone proposes giving each cell a count of how often it has been active, to help recall. What principle does that
   touch, and what should you do?
6. Why might a thing's assembly differ after the machine learns something unrelated?
7. Rest decomposes a primitive into two pieces. What happens to its column?
8. Why does completion work if candidates are listed in a different order?

**Answers.**
1. None. Only primitives are columns (P1). The composite lights cells on a higher floor of its primitives' columns.
2. One item can never be a saving (section 2), so completion never takes anything from one cell (P6). An assembly is
   what completion rebuilds from (P5).
3. Neither. When the evidence can't decide, it doesn't (P7). The cue cells stay as they were, with nothing filled in.
4. Only its floor-0 cells. Its floor-1 cells (what it is) stay exactly the same (P3).
5. It gives a cell a number (P2), and it is close to pooling evidence into the cell (P8), which collapsed in C35. It is
   a design change: raise it with the owner, don't build it.
6. Because an assembly keeps what is distinctive, and what is distinctive depends on everything else known (P5).
7. The primitive becomes a composite of the two pieces (the same unit, changed in place), so it is no longer a column;
   the pieces are primitives, so they are. Things that used it now use the composite (section 6).
8. Equal candidates that share evidence are refused, and equal ones that don't can both be taken, so the listing order
   never decides the outcome (section 11).

## Where to read more

- Code: `src/engine/cells.js`, `complete.js`, `change.js`, `see.js`. Tests: `src/test/*.js`.
- Checkpoints: [05 Grain](../checkpoints/05-grain.md) (cells), [06 Mould](../checkpoints/06-mould.md) (completion),
  [07 Transition](../checkpoints/07-transition.md), [08 Stamp](../checkpoints/08-stamp.md) (change),
  [11](../checkpoints/11-thinking.md) (the branch).
- Findings: `experiments/findings/C21-codes.md` (columns as coordinates), `C22-completion.md`, `C26-clean.md`
  (crutches removed), `C34-hex.md` (lattice-free), `C35-segments.md` (evidence per assembly).
- The sandbox's chapter 2, `sandbox/columns.html`, teaches all of this with the hat, cup, arch and lamp, on the
  engine's own code. Open it in a browser alongside this document.
