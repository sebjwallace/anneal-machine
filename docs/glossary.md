# Glossary

Use these words, with these meanings, and no others.
- Words marked **(owner)** are the owner's own.
- Words marked **(to confirm)** are used in the code and docs but haven't been formally agreed yet. Don't build new terms on them without checking.

| Word | Meaning |
|---|---|
| **heat** (owner) | Whatever can't be explained cheaply: a picture or part of one that doesn't fit what's known, or structure that doesn't pay its way. Learning is cooling. |
| **energy** (owner) | The total cost of describing everything: structure plus flow, plus change when pictures come in sequence. The machine keeps a change only if energy falls. |
| **structure** (to confirm) | What the machine keeps: stored pixels, plus every placement listed in memories and composites. |
| **flow** (to confirm) | The cost of explaining the pictures seen since the last rest, with what's known now. |
| **awake / rest** (owner) | Awake: seeing and explaining pictures as they come. Rest: comparing memories and reorganising, keeping only changes that lower energy. |
| **part** (to confirm) | A shape the machine has learnt, stored without position. |
| **primitive** (owner) | A basic part: one that isn't made of other parts (layer one). Only primitives get columns. |
| **composite** (owner) | A thing made of parts in a fixed arrangement (a house = roof above box). Held inside as an assembly, not as a column. |
| **placement** (to confirm) | "This part, at this offset." Memories and composites are lists of placements. |
| **memory** (to confirm) | A stored picture, described as placements plus any loose pixels. |
| **column** (owner) | One per primitive. Holds many cells. |
| **cell** (owner) | One unit inside a column. In Anneal, a column's cells are laid out as a grid of offsets: "this primitive, at this offset". |
| **floor** (to confirm) | A layer of a column's cell grid. Floor 0: where things are in the picture. Higher floors: assemblies of composites, one per level (decision 004). |
| **centre / offset** (owner, agreed C21) | Centre: the 0,0 point that offsets are measured from (the middle of the picture, or a composite's own centre). Offset: how far something sits from that centre. |
| **assembly** (owner) | A set of cells, across columns, that stands for a thing. A composite's assembly is the smallest set of its cells from which completion brings back the whole. |
| **super-assembly** (owner) | An assembly built from assemblies (a composite of composites). |
| **instance** (owner) | One occurrence of a thing in a picture (two houses = two instances of the house). |
| **completion** (owner) | Bringing back a whole thing from part of it: from a partly hidden picture, or from a few cells. |
| **state** (owner) | A settled picture, held as cells: where things are now, where they were a moment ago, and any held context. |
| **transition** (owner) | A link from a state to the state that settles next. Order matters; duration doesn't. |
| **transition memory** (owner) | The machine's memory of transitions (not "temporal memory"). |
| **cue** (owner) | A hint from the input about which next state to move into (one cell of it is enough). |
| **context** (owner) | Something held from elsewhere that steers which transition happens. It has no position. |
| **shared change** (to confirm) | What two remembered transitions share when their whole changes line up: the change plus its unchanged surroundings, without position. Applies anywhere it fits. |
| **kind** (to confirm) | A thing with one slot whose piece can vary: what the versions share, held once, plus a list of fillers. |
| **slot / filler** (to confirm) | Slot: the place in a kind where the piece varies. Filler: one piece that can go there. |
| **change (in the bill)** (to confirm) | The cost of describing what moved between pictures in a sequence. Part of energy alongside structure and flow. |
| **engine / machine** (owner) | Engine: the inner mechanism (seeing, cells, completion, change). Machine: the engine acting in a world (to come). |
| **crutch** (owner) | Anything that makes the machine work without coming from its own principles: a fixed number, a filter, a hand-written rule. Not allowed in `src/`. |
