# Glossary

Use these words, with these meanings, and no others.
- Words marked **(owner)** are the owner's own.
- Words marked **(to confirm)** are used in the code and docs but haven't been formally agreed yet. Don't build new terms on them without checking.

| Word | Meaning |
|---|---|
| **lull** (owner) | A run of correct predictions while reading: from a character whose population burst, through the characters after it that arrived primed, until the next burst. Its length is how many predictions it got right ("the " is a lull of 3). A lull can only happen on a repeat. (Branch l1a-reading; replaces the owner's placeholder "streak".) |
| **cast** (owner) | To form an assembly from a lull. Assemblies are cast, and later annealed. (Not the older sense in the learnt-logic notes, where a cell was cast as a prediction.) |
| **heat** (owner) | Whatever can't be explained cheaply: a picture or part of one that doesn't fit what's known, or structure that doesn't pay its way. Learning is cooling. |
| **energy** (owner) | The total cost of describing everything: structure plus flow, plus change when pictures come in sequence. The machine keeps a change only if energy falls. |
| **structure** (to confirm) | What the machine keeps: stored pixels, plus every placement listed in memories and composites. |
| **flow** (to confirm) | The cost of explaining the pictures seen since the last rest, with what's known now. |
| **awake / rest** (owner) | The machine's two states. Awake: **fitting** what comes in, as it comes. Rest: **consolidation**, reorganising memory while nothing comes in, keeping only changes that lower energy. |
| **part** (to confirm) | A shape the machine has learnt, stored without position. |
| **primitive** (owner) | A basic part: one that isn't made of other parts (layer one). Only primitives get columns. |
| **composite** (owner) | A thing made of parts in a fixed arrangement (a house = roof above box). Held inside as an assembly, not as a column. |
| **placement** (to confirm) | "This part, at this offset." Memories and composites are lists of placements. |
| **memory** (to confirm) | A stored picture, described as placements plus any loose pixels. |
| **volume** (owner) | A number of columns: one machine of this kind, receiving and settling its own heat. Replaces **region** (CTR-1 DEF-10). |
| **joint** (owner, for now) | The segments that hold a whole's parts together: what a tie grows between the handles of its parts (C82). |
| **loosen** (owner, for now) | A joint losing segments because it is heated: it brings back what the input has replaced (C82). |
| **harden** (owner, for now) | A joint gaining segments because its whole is seen again, so it takes more loosening to break (C83). |
| **variable** (arithmetic sense, owner, for now) | In C82 and C83: a state such as "x" that holds one value at a time until it is rebound. Close to, but not the same as, **variable** in a frame (below). |
| **column** (owner) | One per primitive. Holds many cells. |
| **cell** (owner) | One unit inside a column. In Anneal, a column's cells are laid out as a grid of offsets: "this primitive, at this offset". |
| **floor** (to confirm) | A layer of a column's cell grid. Floor 0: where things are in the picture. Higher floors: assemblies of composites, one per level (decision 004). |
| **centre / offset** (owner, agreed C21) | Centre: the 0,0 point that offsets are measured from (the middle of the picture, or a composite's own centre). Offset: how far something sits from that centre. |
| **assembly** (owner) | A set of cells, across columns, that stands for a thing. A composite's assembly is the smallest set of its cells from which completion brings back the whole. |
| **super-assembly** (owner) | An assembly built from assemblies (a composite of composites). |
| **resolving** (owner) | The engine's core mechanic: there is a misfit, so there is heat, and something changes until it fits and the heat falls. Covers an input against memory, memory against itself (at rest), and region against region. Energy falling because a misfit is covered rather than resolved is masking, not resolving (CTR-1 CON-6). |
| **fitting** (owner) | Resolving an input against memory without changing memory: finding the cheapest composition of known assemblies that matches the input. Candidates compete on cost; what stays uncovered is the misfit. Only the arrangement moves; the assemblies don't. In the engine (since C75): one competition, then re-settling only where a winner left heat; it can still miss the best fit. Replaces **seeing**. |
| **consolidation** (owner) | Resolving at rest by changing memory: decomposing, composing and re-fitting what was taken in. Each change is kept only if energy falls. |
| **comparing / intercomparing** (owner) | Setting two assemblies side by side (at every shift) to find what they share and what differs. The core act behind decomposition and abstraction (CTR-1 CAP-1). |
| **composition** (owner) | Putting assemblies together in an arrangement to make a larger one (Sagan's "synthesizes"). Awake it is temporary: a composition explains an input for now. At rest it can last: a recurring composition is stored as a super-assembly, if that lowers energy. |
| **decomposition** (owner) | Taking an assembly apart into sub-assemblies (Sagan's "analyzes"). Where two assemblies share a piece, the piece becomes an assembly of its own, and each original becomes that piece plus what is left. Only at rest, and kept only if energy falls. |
| **abstraction** (owner) | The shared part that comparing finds: what is in several assemblies and particular to none, with what differs left out (the wall a house and a shed share). It holds an invariant. A ladder: shared parts (same cells), then frames (shared constants), then types (shared surroundings). |
| **instance** (owner) | One occurrence of a thing in a picture (two houses = two instances of the house). |
| **completion** (owner) | Bringing back a whole thing from part of it: from a partly hidden picture, or from a few cells. |
| **state** (owner) | A settled picture, held as cells: where things are now, where they were a moment ago, and any held context. |
| **transition** (owner) | A link from a state to the state that settles next. Order matters; duration doesn't. |
| **transition memory** (owner) | The machine's memory of transitions (not "temporal memory"). |
| **cue** (owner) | A hint from the input about which next state to move into (one cell of it is enough). |
| **context** (owner) | Something held from elsewhere that steers which transition happens. It has no position. |
| **shared change** (to confirm) | What two remembered transitions share when their whole changes line up: the change plus its unchanged surroundings, without position. Applies anywhere it fits. |
| **frame** (owner) | A structure of constants and variables, ready for composition but not itself a composition: "animal eats animal", "x + y = z". Replaces the old word **kind**. |
| **constant** (owner) | What stays fixed within a frame: the shared, invariant part ("eats"; "+" and "="). An assembly, found by comparison. |
| **variable** (owner) | A place in a frame, connected to its constants, where things vary (either side of "eats"). Has one or more types. Replaces the old word **slot**. |
| **type** (owner) | What may fill a variable: a generalisation or abstraction, which is itself the overlap shared by everything of that type ("animal"). The overlap can be inside (what members are made of) or around (the frames members appear in). Bounded, not an arbitrary list. |
| **invariant / variant** (owner, supporting) | A property, not a thing. Outside the language of frames: what stays the same across many assemblies, and what varies around it. A constant is an invariant seen from inside a frame; a type is an invariant shared by what fills a variable. An abstraction is the assembly that holds an invariant. |
| *kind, slot, filler* (old) | The engine's current code still uses these. A kind is a frame; a slot is a variable; its fillers are a **list** of what has been seen there, which is not yet a type (the difference matters: a list takes anything cheap to add, a type is bounded). |
| *seeing* (old) | The old word for fitting; still the engine file's name (`see.js`), which holds the whole engine, not only fitting. |
| **change (in the bill)** (to confirm) | The cost of describing what moved between pictures in a sequence. Part of energy alongside structure and flow. |
| **engine / machine** (owner) | Engine: the inner mechanism (fitting, consolidation, cells, completion, change). Machine: the engine acting in a world (to come). |
| **crutch** (owner) | Anything that makes the machine work without coming from its own principles: a fixed number, a filter, a hand-written rule. Not allowed in `src/`. |
