# Cells first: from bookkeeping to cells and segments

> *The brain does much more than just recollect. It intercompares, it synthesizes, it analyzes, it generates abstractions.*
> Carl Sagan, *Cosmos*, episode 11 (1980)

*Written 14 November 2026, at the end of a long day's work with the owner. It records how the machine's design moved from
an engine that keeps lists of things and works over them, to one whose behaviour falls out of cells and their
connections. Partly tested: each section says which experiments support it and what is still open. Plain words first;
the experiment codes are there to check against.*

---

## The short version

At the start of the day, the engine worked by **bookkeeping**. It kept lists: its parts and composites, its memories as
lists of placements, its frames as slots with lists of fillers. It explained a picture by scoring every part at every
place and searching for the cheapest arrangement. At rest it compared every pair of parts at every shift. It worked, but
the cells were not where anything happened, and the cost grew with everything it stored.

By the end of the day there was a tested design in which **cells are the first-class citizens**:
- an input cell has a column of cells above it;
- each cell holds segments, and each segment is one memory's evidence on that cell;
- an assembly is nothing but cells and the links between them.

On that alone, with no list anywhere, the experiments showed every one of Sagan's operations:
- **recall** from part of a memory (completion);
- **competition** between whole memories;
- **fitting** an input;
- **composition**, binding parts together;
- **decomposition**, cutting a whole at the line between what fits and what doesn't;
- the **abstraction** that comparison finds, held on shared cells.

With enough cells per column, storing fifty times more barely changed the cost of recall.

One piece of this is now in the core: fitting by competition (C75). The rest is shown in experiments, and the contracts
were updated so that this is the target: the dynamics come from cells and segments (CTR-1 CON-19), and bookkeeping may be
used to explore but never enters the core (CTR-2 CON-8).

---

## 1. The old world, and why it had to go

**Fitting.** To explain a picture, the engine took every part it knew, tried it at every place, and priced each
arrangement:
- every placement costs about 1.5;
- every pixel left unexplained costs 1;
- every pixel claimed but not there costs 1.

Its inner step was already a competition: the part that saved most took its pixels, and the rest recounted on what was
left. But on top of that sat a search, rerunning the whole competition once for every possible starting placement,
about 28 times per picture.

**Rest.** Every candidate change was tried in turn and kept only if energy fell:
- decompose two parts where they overlap, comparing every pair at every shift;
- compose a recurring arrangement into a composite;
- fold, fuse and unpack;
- make or widen frames.

Each trial refitted every recent picture.

**Frames.** A frame (the engine's "kind") was a composite with one slot holding a list of the fillers seen there.

None of this is wrong in what it computes. The energy rule, comparison and the prices were all sound. What was wrong was
*where* it happened:
- **nothing happened in the cells.** A program walked lists of things and scored them centrally;
- **the cost grew with storage.** More parts meant more to try at every place, and more pairs to compare at rest;
- **the cells layer stood off to the side.** It existed in the core, but only as a separate representation used for
  completion.

The owner's objection was simple: an assembly is cells and their connections, not an entry in an array.

---

## 2. The words we agreed

The day began by fixing the vocabulary, because the old words ("seeing", "kind", "slot") had drifted. All are in the
[glossary](../glossary.md).

- **Resolving:** the engine's core mechanic. There is a misfit, so there is heat, and something changes until it fits
  and the heat falls. It covers an input against memory, memory against itself, and region against region. Energy
  falling because a misfit is covered rather than resolved is masking, not resolving.
- **Fitting:** resolving an input against memory without changing memory. Known assemblies compete to explain the
  input; what stays unexplained is the misfit. It replaces "seeing".
- **Consolidation:** resolving at rest by changing memory: decomposing, composing and refitting what was taken in.
- **Comparing (intercomparing):** setting two things side by side to find what they share and what differs.
- **Composition:** putting assemblies together into a larger one. Awake it is temporary; at rest it can last.
- **Decomposition:** taking an assembly apart into sub-assemblies.
- **Abstraction:** the shared part that comparing finds, in several assemblies and particular to none. It holds an
  invariant.
- **Cell, segment, assembly:** defined in the system contract (CTR-1 DEF-12 to DEF-14) and in section 3.
- **Bookkeeping:** the program keeping a list of the system's things and working over it centrally, in place of the
  dynamics of cells and segments (CTR-2 DEF-11).

Sagan's four words map directly:

| Sagan | the machine |
|---|---|
| intercompares | comparing: the core act |
| synthesizes | composition |
| analyzes | decomposition |
| generates abstractions | the shared part comparing finds |

---

## 3. The new world, piece by piece

The visuals that go with each piece are in [docs/visuals](../visuals/README.md). They share one visual language: a dot is
a cell, colour means active, an outline or band is an assembly, red is heat, a dashed ring is a cell predicted but not
there, and a sliced cell shows its segments.

### 3.1 Input cells and columns (keeping memories apart across cells)

An input cell, such as a pixel or a letter, does not stand for itself alone. Above it is a **column** of cells: a
population.
- When the input is on, one cell in its column becomes active, and which one depends on context.
- Two memories that share inputs can therefore use different cells and different links, so both can be held, and
  recalled, without colliding.

That is dimensionality expansion. It is what a classic Hopfield network lacks: there each input is one unit, every
memory using it is linked on that same unit, and memories that share inputs blur into a mixture. (Visual:
[columns](../visuals/columns.html).)

The separation is only as good as what picks the cell (section 3.10). Two patterns landing on the same cell by chance
collide there, and more cells per column means fewer such collisions (section 3.9).

### 3.2 Segments (keeping memories apart within a cell)

To use space well, one cell is reused by many memories: every memory that has the same input in the same context. If a
cell pooled all its links, evidence from different memories would add up. Two cells of A plus one of C plus one of F
would cross the bar, and the cell would wake for a memory that isn't there. C35 measured this: pooling gave about 80%
wrong recalls with five things stored.

**Segments** split a cell's links by memory:
- a segment holds the links from one memory's other cells;
- it fires when two or more of its own links are active: an **AND** of those cells;
- the cell is active if any of its segments fires: an **OR** of its segments.

So evidence is counted per memory, never summed across memories (CTR-1 CON-9), and which segment fired says which memory
woke the cell.

A segment is not a cell. Nothing links to it and it never shows downstream. That is why segments are slices of a cell
rather than more cells: they add ways of being woken without changing what the cell means, so a part shared by two
memories stays on one shared cell. In short, columns make cells different where meaning differs, and segments let one
cell stay the same where meaning is the same. (Visuals: [segments](../visuals/segments.html),
[segments-zoom](../visuals/segments-zoom.html).)

### 3.3 Waking and completion

A memory wakes when two or more of its cells are active, because two is where its segments fire. The bar comes from the
prices, not from a setting: describing two items as one placement is the first time it saves anything, so an assembly
of one cell can never pay.
- A woken memory brings back the rest of itself: **completion**, Hopfield's pattern completion.
- A cue that fits two memories equally wakes neither fully: the engine does not guess (CTR-1 CON-7).

In C73, segments read this way, a low bar plus competition, kept memories apart as well as segments that need most of
their links. They never blended a split cue, and they completed from half a cue where those segments could not.

### 3.4 Competition

Competition happens in two places:
- **In each column.** Several of a column's cells may be candidates; the one whose segment has the most support wins,
  and a tie is refused.
- **Across columns, between whole memories.** Every cell of a stored memory has a segment holding that memory's links.
  So when a cue arrives, all the best-matching memory's cells reach the same support, the highest, and nothing else
  does. One shared level of inhibition lets only the top level through, and whole memories win or lose together, with no
  list (C74). Answers then sized themselves (7.6 cells, against an assembly of 8), where before a number given by hand
  capped them at 8 columns. Half a cue completed as well as a whole one.

When competition helps, and when it does not, turned out to matter:
- **It cannot fix chance overlap.** When cells are reused by chance, an intruding memory gets exactly the same support as
  a true one, so no competition can tell them apart. Only more cells per column fixes that (C77).
- **It is needed for a genuinely shared part.** A wall shared by a house and a shed wakes both compositions. There the
  memory with more of itself active should win (C78, section 3.7).

### 3.5 Fitting, and local heat

Fitting is competition. The assembly that saves most takes its cells; every rival recounts on what is left; an assembly
is taken only while it still saves something. In the owner's Z example (a 4 × 4 grid, the rows ABCD and MNOP and the
diagonal DGJM):
- the three win, and the bill is 4.5 against 5.0 without the diagonal;
- the other candidates drop out as misfits, with too little coverage for their price or claiming cells that aren't lit;
- overlap is not penalised but wasted;
- being connected earns nothing while fitting, and pays only at rest, when a recurring Z is composed into one.

(Visual: [z-fitting](../visuals/z-fitting.html).)

Competition alone has one weakness: one big assembly that covers everything but claims cells that aren't there can beat
two smaller ones that fit exactly, as when two sticks are read as a box. The fix comes from **local heat**. After fitting,
every cell knows its own state:
- lit and predicted: it fits;
- **lit but predicted by nothing:** uncovered;
- **predicted but not lit:** claimed, not there.

**Re-settling** reopens the competition only where a winner left the second kind of heat: that winner is taken back and
the rivals compete again without it. It is annealing in small: shake only what is still hot.

In C75, competition alone matched the old search on 1,495 of 1,500 pictures, and competition with re-settling on all
1,500, for about a fortieth of the work. Both learnt exactly the same. This is now the core's `explain`.

### 3.6 Composition: binding a sample

Parts that fit together, like the rows and diagonal of a Z, are composed not by wiring every cell to every other but by
**binding a small sample of their active cells**. Each sampled cell grows one new segment holding links to the other
sampled cells. Later, if one part comes back, its sampled cells wake the binding, the binding wakes the other parts'
sampled cells, and each part completes itself.

The bar of two sets the size of the sample: **two cells from each part**.
- With one per part, a part that comes back lights one sampled cell, no binding segment ever sees two, and nothing comes
  back.
- With two, it always works.

In C76, two per part brought the whole composition back every time:
- with 30 links per composition, against 132 for wiring everything;
- far fewer stray cells, because extra links only add chances to fire by mistake;
- about a fiftieth of the work.

The cheapest description that still completes and the cleanest memory turned out to be the same thing. This also gives
composition a price at the level of cells: **the links in its binding**. (Visual:
[z-binding](../visuals/z-binding.html).)

Bound once, from a single moment, a binding is an **experience**. Bound because it keeps recurring, it is a
**composition** paying its way. That is the contract's two kinds of memory (CTR-1 CAP-11), done by one mechanism with two
keeping rules.

The owner's first picture of composition was junctions: columns where two winning cells are active at once, which mark
where two assemblies meet. That is a strong sign of parts fitting together. C76 showed it isn't required: parts fit
together by being active together, shared cell or not.

### 3.7 Decomposition: the cut

Decomposition is the cut along the line between fit and misfit, done by the cells. A house is stored; a shed arrives
that shares its wall.
1. **The comparison happens by itself.** The shed lights whole columns (all their cells are candidates, since nothing
   yet predicts which), so the house's wall cells see each other active and the house partly wakes. Nothing is compared
   pair by pair: the new input simply wakes the memory it resembles.
2. **The cells' states draw the cut.** The wall's cells are lit and predicted (they fit). The house's roof is predicted
   but not lit. The shed's roof is lit but predicted by nothing.
3. **Cut there:**
   - the fitting cells become their own assembly on the same cells: the wall, the abstraction, really shared;
   - the house's roof becomes its own assembly;
   - the shed's roof gets fresh cells;
   - each whole is rebound by two sampled cells per part.
4. **Keep it only if it pays,** counted in links.

In C78:
- the cut found the right wall, roof and new roof in every family;
- the result cost 114 links against 264 for both wholes;
- with the two bindings competing as whole memories, each roof brought back its own whole and the other almost never
  (0-4%), and stayed 96-97% clean at 64 cells per column with 200 families stored.

Two things made it work:
- **The cut is read through the top level of support.** Without it, chance predictions from other memories leaked in,
  and the cut was right in under half the families.
- **The shared wall needs competition between whole memories.** Without it, the wall woke both.

(Visual: [decomposition-cut](../visuals/decomposition-cut.html).)

### 3.8 Abstraction and frames

The abstraction is what decomposition leaves shared: the wall, on the same cells, belonging to both wholes and particular
to neither. There is a ladder of them: shared parts (the same cells); constants (a shared part with open places beside
it); types (what fills those places).

**Frames may not need a mechanism of their own.** The engine's frames ("kinds") were a slot with a list of fillers. That
is bookkeeping, and the list was never a type. In the new world:
- a frame is the pattern a decomposed memory already forms: a shared constant with open places;
- the **constant** is the shared part decomposition finds;
- the **variable** is the place where different parts have been bound to that constant;
- the **type** is whatever binds there.

From the wall alone, C78 brought back both roofs. That is not a failure but the variable showing itself: "a wall, and a
roof goes here", not yet decided. "Frame" stays as a word for the pattern, not as a part of the machine.

What frames still need is a way to **hold a variable open**: possibilities kept as possibilities, neither blended nor
guessed, until a cue picks one. It may fall out as cells predicted but not yet confirmed (the dashed rings). That is the
next thing to test.

### 3.9 Scaling: the work follows what is active

The owner's aim: millions of assemblies, and still fast; the more it stores, the less each addition costs. In C77, with
64 cells per column, storing 50 times more compositions raised the work per recall from 144 to 278 segment checks. The
cost followed what was active, not what was stored. That is now stated as the scale optimization (CTR-1 OPZ-5).

Two conditions:
- **Enough cells per column.** With 16 cells per column, recall started spreading into other compositions as memory
  filled (45% clean at 500 compositions); with 64 it stayed at 96%. Sparse codes with enough cells are what make memory
  scale, as the owner expected.
- **Common parts decomposed out.** In C73, about 98% of all segments were checked on every probe, because every stored
  sentence held "the", "is" and "in". Decomposed into one shared assembly (a constant), common parts stop touching every
  memory.

### 3.10 What picks the cell

Which cell in a column a memory uses is the piece not yet settled.
- **Pictures:** Anneal uses offsets (the cell says where), which works but doesn't generalise.
- **Context alone fails** in the owner's earlier work: cells chosen by what came before encoded the frame, not the word
  (recall 52%).
- **Choosing per word** kept identity (88%).

The best general rule so far is **by fit, or fresh**: reuse a cell when one of its segments already fits, and give a
fresh cell to whatever nothing explains. That is the energy rule in disguise: only pay for a new cell when the old ones
can't explain it. A choice that uses both context and identity is open.

### 3.11 Learnt logic

Brought in from the owner's other repository as C69 to C72 ([learnt logic](learnt-logic.md),
[its questions and answers](learnt-logic-qa.md)):
- a cell does OR, and a segment does AND;
- inhibition learnt from the machine's own wrong predictions gives NOT;
- one rule with two signs of heat grows both an AND and an "unless" on a segment (AND NOT). That was the owner's NAND
  idea, and AND NOT won.

There, the two signs were predictions tested against what happened next, across time. So in Anneal's terms:
- **misfit within one fit** decides what to keep;
- **prediction against outcome across time** (change memory) is where rules and their exceptions would grow.

---

## 4. What is in the core now, and what is not

**In the core** (`src/engine/see.js`):
- **Fitting is competition with re-settling** where heat is left (C75). The search over openings is gone. The full test
  suite passes and matches C75's run line for line, and the fitting test runs in 13.1 s against 17.6.

**Not yet in the core** (all shown in experiments only):
- **Cell-level fitting.** The core's competition still runs over a list of every unit, counted against every lit pixel.
- **Composition by binding** and **decomposition by the cut.** Rest still works over lists of parts and memories, and is
  now most of the engine's time.
- **Cells and segments as the place where things happen.** They exist in the core only as a separate layer for
  completion.

That remaining bookkeeping is listed in the system contract's "Today against the contract", as a violation to distil
out, not grandfathered in.

---

## 5. What changed in the contracts

**Both contracts:**
- every list runs from general to specific;
- goals, optimizations and principles are in order of priority: in a trade-off the higher one wins, and a large loss to
  it is never bought with a small gain to a lower one;
- constraints have no priority, since none gives way;
- codes stay with clauses when they move (PRB-11).

**The system contract (CTR-1):**
- **DEF-12 to DEF-14:** cell, segment and assembly defined.
- **CON-19 (draft): cells and segments first.** What the machine does falls out of activity between cells through their
  segments; nothing holds, loops over or looks up whole assemblies.
- **OPZ-5 restated:** the work of receiving and recalling grows with what is active, not with what is stored.

**The practice contract (CTR-2):**
- **DEF-11:** bookkeeping defined.
- **CON-8 (draft):** bookkeeping is allowed in experiments, declared as a violation, but never enters the core.

---

## 6. The evidence

| experiment | what it showed |
|---|---|
| C69-C72 | From the owner's other repository: learnt AND, learnt NOT, membership segments (sharp but no completion), two signs of heat (AND NOT wins). |
| C73 | Anneal's reading of segments (fire at two, compete, refuse ties): as clean as strict segments, never blends a split cue, completes from half a cue; but a cap of 8 columns given by hand was doing the work of competition across columns. |
| C74 | The cap removed: only the top level of support joins. Answers size themselves; half a cue completes as well as a whole one; sharp and tolerant from one mechanism. |
| C75 | Fitting is competition; the search over openings was overhead. With re-settling where heat is left, the same fit on 1,500 of 1,500 pictures for about a fortieth of the work. In the core. |
| C76 | Composition by binding a sample: two cells per part is the smallest binding that completes and the cleanest; one per part never works. |
| C77 | More cells per column fixes crowding (96% clean at 500 compositions with 64 cells); competition can't; the work follows what is active. |
| C78 | Decomposition by the cut: the right parts every time, fewer links, and with whole memories competing each part brings back its own whole. |

---

## 7. Open problems

1. **What picks the cell** for a new memory, using both context and identity (section 3.10). This is the key to text.
2. **Holding a variable open:** possibilities kept as possibilities, neither blended nor guessed (section 3.8).
3. **The full currency at the level of cells.** Links price a composition and a decomposition. The rest of the bill
   (what an unexplained input cell costs, what a prediction not there costs) needs restating in cells and links, so
   that one currency still covers everything (CTR-1 CON-2).
4. **The shared level of inhibition is global:** one number over all the candidates. Cheap, but not local. It could
   become something that only spans a region.
5. **Binding segments know they bind** (C78). Whether bindings can compete as whole memories without that label is open.
6. **Rest as replay.** In the new world, rest's job is to replay recent experiences so that cuts and bindings can happen
   while nothing new arrives. Not yet built.
7. **Shifts without offsets.** For pictures, a wall at another place is different cells. Whether shift-invariance
   survives without the offset scheme is parked.
8. **The bookkeeping still in the core** (section 4), the first distillation (D-01, the text result), and the parked ideas
   (reference models in place of a component library).

---

## Where to look

| what | where |
|---|---|
| experiments | `experiments/sketches/C69-learnt-and` to `C78-decomposition-by-the-cut`, each with hypothesis, pre-registration, findings |
| visuals | [assemblies](../visuals/assemblies.html), [columns](../visuals/columns.html), [segments](../visuals/segments.html), [segments-zoom](../visuals/segments-zoom.html), [z-fitting](../visuals/z-fitting.html), [z-binding](../visuals/z-binding.html), [decomposition-cut](../visuals/decomposition-cut.html) |
| contracts | [system](../contracts/system.md) (DEF-12 to 14, CON-19, OPZ-5), [practice](../contracts/practice.md) (DEF-11, CON-8) |
| ledger | PRB-11, HYP-20 to HYP-26, PRO-4, PRB-12, and THY-7 for this note |
| the core | `explain` and `greedy` in `src/engine/see.js`; decision 001 |
