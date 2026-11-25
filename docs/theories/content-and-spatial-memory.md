# Content and spatial memory

A theory note, from a conversation between the owner and the assistant. **Nothing here has been tested.** It records
an idea the owner first had long ago and came back to while working on learned computation: that memory should be
addressable both by **content** (what something is like) and by **place** (where it is), with the two sides of one
substrate pointing into each other. It is written to stay close to the owner's own words and pictures, with the
assistant's pushback kept separate and marked.

Related: [learned computation](learned-computation.md), [procedures from states and
transitions](procedures-from-states-and-transitions.md), [heat as the source](heat-as-the-source.md) (the automaton
moving with commands), [nothing breaks](nothing-breaks.md), [flow and heat](flow-and-heat.md) (fast on slow, sinking),
and the side note [learned competition and computation across addresses](learned-competition-and-addresses.md).
Experiments that led here: C137, C138, C139.

**How to read it.** Sections 1 to 12 record the idea as first worked out. The conversation then kept going, and
section 13 records how it moved on, as a transcript of the reasoning (who said what, and what each step changed), so
that a reader can see what led where, not only where it ended. Section 13 reframes parts of the earlier sections: in
particular, the automaton stops being a reader that roams the grid and becomes the substrate itself. Where the two
disagree, section 13 is the later thinking.

---

## 1. Where this came from: two kinds of memory

A computer's memory is **addressed by location**. You ask for "what is at address 5". You have to know the address,
and the address tells you nothing about what is there. The CPU's whole way of working is an orchestration of reading
and writing at addresses: values are loaded from memory into registers, operated on, and written back, under the
control of instructions that are themselves in memory. Each instruction, decoded, is a pattern of which select lines
turn on: which memory row, which register, read or write.

Associative memory is **addressed by content**. You give it part of something and it brings back the rest. There is no
"where".

Each has what the other lacks.

- **Content addressing** removes a layer of bookkeeping (no addresses to remember, no pointers), and similar cues bring
  back similar things, which a computer's memory has no notion of.
- **Location addressing** gives what made computers general: **pointing at a place regardless of what is in it**.
  "Read register 1" works whatever number is there, so the same program adds any two numbers. It also gives separate
  instances for free (a 5 at address 3 and another at address 9), and an order of steps for free (the next address).

The experiments C137 to C139 kept running into exactly what content addressing lacks: a value never seen in a frame had
no rivals and could not be overwritten; "two of the same thing" had no clean answer (5 is the same cells everywhere);
and the order of steps had to come from transitions. C139 borrowed the computer's answer (registers, and attention
learned over them), which generalised to new numbers because the procedure never mentioned a number. That raised the
question this note answers: is there a kind of addressing that associative memory can have natively, which gives what
location gives without becoming a computer?

## 2. The owner's experience: thoughts left in places

Two observations of the owner's own.

**Walking.** Out walking, with a chain of thought going, the thoughts become associated with where he is. Walking back
the same way, the same thoughts sometimes replay, because they are tied to the places. Places hold thoughts.

**Reading an expression.** Looking at a mathematical expression on a page, the eyes move around it, and that movement
builds a sense of space. The values, variables and operators are each associated with their place, and they also have
their ordinary associations with each other, as in associative memory, but spread out across real space.

The point the owner drew from both: the project so far has been about **how things are structured with one another**
(composition, abstraction, decomposition, transitions), in a high-dimensional space of interconnections. Nothing has
said anything about **spatial arrangement**: how pieces can be laid out in a low-dimensional space, such as two
dimensions, and how bringing them together in that arrangement gives a third kind of memory. Not content addressable,
not random access, but **spatial**. He sees this as a big missing piece.

His very early experiments were visual: assemblies built houses, super-assemblies formed from parts that fitted, and it
worked well. Those worked in space because pictures are spatial. The new thought is that memory itself could work like
this, with language coming in and being placed into a spatial address space.

## 3. The picture: a landscape of text

The owner's older idea, recalled in this conversation.

Imagine a corpus of text that is not in a file system but laid out in **a huge two-dimensional space**, every
character in a cell of the grid. An automaton (the owner's word for the reader at the time) **roams** this landscape.
As it reads, it associates what it has read with **where it is** in the grid. Later, reading somewhere else, something
in the content can bring back the place where it was read before.

- **Wormholes.** Say it reads about a particular ginger cat. Later, the idea of the ginger cat brings back the spatial
  address of where it last read about it, and it can jump straight there. The flat landscape is **warped by content**:
  instead of travelling across the grid back to the first reading, it goes through content space, like a wormhole.
- **Things worked on together are kept together.** The space can be read and written. The automaton can work locally,
  reading and writing in one patch, and jump between patches.
- **Nothing is overwritten.** The text already there can't be changed. Perhaps nothing written can ever be rewritten:
  the automaton writes like someone with an ink pen in a notebook who isn't allowed to cross anything out. It can move
  and write more, but never erase.

## 4. Two sides of one substrate

The owner's summary: **content memory and spatial memory are two sides of one substrate, inextricably connected.**

- **From content to place:** a cue completes, in content memory, to the places it is bound to (the wormhole).
- **From place to content:** being in a place primes what was learned there (the walk back home).
- **Across content:** the ordinary associations of associative memory, as before.
- **Across place:** neighbours. What is written next to what, above what, below what.

So a thing can be reached by what it is, by where it is, or by what is next to it, and each route leads into the others.

## 5. Working memory and episodic memory as one thing

The owner's point: this gives **episodic long-term memory and working memory at the same time, and they are the same
thing**. Working memory is the patch of the grid being read and written now. Episodic memory is every patch ever
written, still there because nothing is crossed out. There is no separate store and no transfer between them; the
difference is only how recently, and how often, a place was visited. Content memory, the bonds and assemblies the
project has been building all along, is the other side of the coin.

## 6. Arithmetic, worked through

How the picture handles the running example (the assistant's walk-through of the owner's picture).

1. **Writing a variable.** "x = 5" is written at one spot in the grid. In content memory, "x" is now bound to that
   place.
2. **Reading it somewhere else.** Later, at another spot, "x − 3" comes up. The cue "x" completes to its place (the
   wormhole), and the 5 is read from **beside** it. This is how variables work in the picture: **content finds the
   place, and the place gives the neighbours.** "x" acts as an address, but one that is found by content.
3. **Working it out.** The sum is written out locally, as on scrap paper. For multi-digit numbers, column addition is
   spatial through and through: add the digits in this column, write the result below, carry one place to the left.
   **The carry is a move in space.** The rules are small and the same for every column; only the positions change.
4. **The answer stays with its working.** The result is written next to the question. Nothing is erased, so how it
   got there can always be read back.

## 7. What it gives

- **Two of the same thing.** A 5 bound to one place and a 5 bound to another are two instances, told apart by place.
  This answers the open question in learned computation (§5.2) without context in cells (decision 009 stands: 5 is
  still the same cells everywhere; the places differ).
- **Indirection with structure.** "Read whatever is just to the right of the minus sign" works whatever is there: the
  computer's trick of pointing at a place regardless of content. Unlike a memory address, a place has neighbours, so
  the pointer carries structure.
- **Order without a program counter.** Moving through space is the order of steps, as the eyes moving across "5 − 3".
- **A glass box for free.** The working stays on the page, in order, beside what it was about: an explanation that is
  simply the record (CTR-1 GOL-4, GOL-5).
- **Nothing breaks.** Writing only adds; mistakes stay where they were made, next to what corrected them, like the
  ledgers.
- **It fits the contract.** CON-3 says memory is finite and good enough, and exact records live outside it, linked.
  The grid holds the exact text; content memory holds the good-enough structure; each points into the other.

## 8. How it meets earlier threads

- **The notebook.** The owner once wanted exact records kept in an external notebook the automaton reads and writes,
  and later called that idea legacy. This brings it back in a different form. **The difference that matters:** the
  notebook was an outside crutch that was consulted; here the spatial side is half of the memory, bound to the content
  side in both directions. Keeping that difference is what stops it sliding back into a crutch.
- **Moving with commands.** [Heat as the source](heat-as-the-source.md) gave the automaton a command line with moves
  such as MOV 1 and MOV −1. Moving is how it would build its sense of where things are.
- **Fast on slow, and sinking.** The patch being worked in is the hot, fast surface; what fits again and again sinks
  into content memory and stops needing the page ([flow and heat](flow-and-heat.md)).
- **The "hippocampus".** The owner's earlier ideas of a dead-simple, non-learning ledger coupled to the semantic
  volume, and of a region that subsamples a whole scene so it can be reloaded, both point the same way: a structure
  that records where and when, alongside one that records what.
- **Registers and attention (C139).** In this picture a register is a place, and attention is where the automaton is
  looking. The side note takes that further.

## 9. Inspiration from elsewhere (the assistant's, to borrow from, not to copy)

- **Place cells and grid cells** map physical space in the brain. Later work found grid-like coding also used for
  **abstract spaces**: in one study people navigated a space of bird shapes varying along two dimensions, and the grid
  code appeared there too.
- **The Tolman-Eichenbaum Machine** (Whittington, Behrens and colleagues) separates **the structure of a space** (where
  things are, what is next to what) from **the content** held there, and binds the two in memory. Its payoff is that
  structure carries over to new spaces with new contents. That is the owner's split, arrived at from neuroscience.
- **The method of loci** (the memory palace) is the owner's walking experience used deliberately.

## 10. Open questions and pushback (the assistant's)

1. **A perfect notebook can stop learning.** If every exact thing can be looked up on the page, content memory never
   has to get good; it only has to remember where to look, which is roughly what a language model with a search tool
   does. Something must make learning worth it. Sinking is the natural candidate: what is visited and fits repeatedly
   sinks into content memory and no longer needs the page. A memory that has learned arithmetic shouldn't jump back to
   its first worked example every time.
2. **Which place does a cue jump to?** "Ginger cat" may be written in fifty places. Places have to compete, probably
   decided by recency and by what is active now. That is competition again, over places, and it needs settling.
3. **Where to write is the hard part.** Keeping things worked on together close together depends on the automaton
   writing near what is relevant. Choosing where to write is a decision, and it has to be learned. It is also the
   easiest place for an experiment to cheat, by placing things for it.
4. **Where do places come from?** A fixed grid is declared structure: fine for AMP, which may declare structure
   openly. For the research, places might come from movement, as grid cells are thought to build up from an animal's
   own steps.
5. **Language arrives in a line.** An expression on a page is already laid out. Text streaming in is not: something has
   to decide where each piece goes, and deciding that is close to parsing.
6. **Moving needs control.** Something decides where to look next. That is the attention question from C139, now as
   "where to move" rather than "which register", and the same heat loop could learn it, but it is the hard part.
7. **It grows forever.** Append-only means the grid only grows. That fits loaded and stored by demand (cold patches
   go to disk and are primed back), but it should be said.
8. **Why two dimensions?** A good answer may be that two directions give margins and columns: annotation beside text,
   not just after it, and column arithmetic with carries. It should be two dimensions for a reason, not because a page
   is flat.

## 11. What would count as faking

Any experiment on this must say what is given. In particular: if the experiment decides **where things are written**,
**where the automaton looks next**, or **which place a cue jumps to**, then the experiment, not the memory, did that
part. A fixed grid, fixed moves and a declared reading of the cell under the automaton are fair scaffolding, and must
be listed as such.

## 12. A possible first test

**Column addition with carries on a grid.** It is arithmetic, genuinely spatial, and has a clean test that is hard to
fake: after worked examples on numbers of a few digits, **does it add numbers longer than any it has seen?** A memory
that has learned the procedure over places (this column, below, one to the left) generalises in length; one that has
memorised sums does not. The ledger would have to show which parts (the grid, the moves, the facts for single digits)
were given, and which part (where to look and write, in what order) was learned.

## 13. How the thinking moved on: a transcript

Recorded in order, as the reasoning happened. Each turn is paraphrased closely from the conversation; "what it changed"
says how the picture moved. Nothing here has been tested.

### 13.1 Placing input instead of streaming it

**The owner.** Over the weekend the question was how to stream information in: an encoder creates a buffer, and the
buffer is annealed where there is heat and otherwise just read (C135, C136, decision 011). That still seems a good idea,
but it is linear. With this new way of thinking, nothing has to be streamed and nothing buffered. Inputs are **placed**
into a new space, and the engine's attention is brought to that space; it then does its own thing there. Streaming
becomes building out the world it lives in: inputs are appended to the ledger of space. There could be several
attentions working at once, which he called **heads**, after the head of a Turing machine moving over its tape: one head
dealing with some heat, another reading new input and finding more heat, others elsewhere doing their own thing,
attracting and repelling each other in balance. Turing already had the head and the tape; he didn't have content
addressable memory.

**The assistant.** The weekend's work is kept, not thrown away: the buffer becomes the patch of space the input is
placed in, and reading it, annealing only where it is hot, is what happens when attention lands on new input. The line
stops being the only path. Two older ideas are close and worth reading as inspiration: blackboard systems (many
specialists working on one shared space, each acting where something matches what it knows), and Hofstadter's Copycat
(many small workers acting in parallel in a shared workspace under a global **temperature**: hot means exploratory,
cool means settled, which is very close to heat here). The heads also meet [the tilting
landscape](the-tilting-landscape.md), where units of energy spread over every unresolved basin: heads could simply be
those units, given a place.

Pushback: several heads is a coordination problem (two writing in one spot, all crowding the hottest patch), and a rule
for it can quietly become a scheduler, which is bookkeeping. The cleanest version: a head is not a separate thing, only
an active assembly bound to a place, limited in number by how much can be active at once and kept apart by ordinary
competition. Streaming gave order for free; placing keeps it only if the layout carries it. Placing input in the next
free patch is an honest, declared encoder choice; where attention goes after that must not be given.

**What it changed.** Input arrives by being placed in space, not pushed through the memory; the buffer survives as the
patch it lands in. Several heads were raised, and kept as a side note ([side notes, §5](learned-competition-and-addresses.md#5-several-heads)).

### 13.2 Space, time and content

**The owner.** Several heads should be a side note, tied back to the Turing machine's head, and not taken too seriously
yet: there are more fundamental problems first. On dimensions: three might be natural, because the world is spatial
and temporal. Space could be everything happening in one moment, which could be many inputs; time is how those change.
So there is **space, time and content**, and content is the binding glue that brings everything together. But time is
awkward: talking about time brings streaming back, and with simple input it becomes one character in each spatial
column marching along the time dimension, which is strange. So perhaps it is up to the AMP programmer to decide the
dimensional space, how information lands across which dimensions. What matters to the engine is that **everything has
an association to a coordinate space**. The coordinates could live in a different volume, with only one coordinate
active at a time, each coordinate a single cell or an assembly. Content can lead to space and space to content.

**What it changed.** The grid stops being a fixed two-dimensional page: the engine only requires coordinates, held as
cells or assemblies in their own volume and bound to content. How many dimensions, and what they mean, is a program's
declared choice.

### 13.3 How does it move between content and space? Perhaps it doesn't learn to

**The owner.** The question is how it learns to navigate between content and space. Maybe it doesn't learn: maybe it
is a natural dynamic, and the dynamic is heat, which goes back to the project's earlier notes. The engine has no free
will; it works off energy dynamics, it reacts and responds. **What if the automaton was not something inside the
space-and-content substrate, but the substrate itself?** Think of it as a material: not a head moving around, not a
piece of attention, but energy moving around a material where there is heating, cooling and annealing. Almost a global
thing. (He said he was drifting into conceptual space and meandering.)

**The assistant.** This removes the problem the conversation kept returning to. Every version so far needed something
to make choices (which register to read, where to look next, which head goes where), and that is exactly where
puppeteering creeps in. Here nothing chooses. The material has two kinds of connection running through it: **content
bonds** (what goes with what) and **coordinate bonds** (where things are, and what is next to what). Energy flows along
both. Where something doesn't fit, heat builds, activity concentrates, and structure forms or settles. **Attention is
just where the energy is now.** A jump to where something was read before is not a decision: activity flows from a
piece of content to its coordinate and on to what sits beside it, as it would along any bond. This is consistent with
[flow and heat](flow-and-heat.md), [the tilting landscape](the-tilting-landscape.md) and [heat as the
source](heat-as-the-source.md), and with the owner's point that the engine reacts rather than wants.

On dimensions: the split is right. The engine needs only that everything is associated with a coordinate; how many
dimensions there are (two of a page, three of a room, the many inputs of one moment side by side) is the program's
declared choice, like an encoder's. Time may not need to be a grid dimension at all: "now" can be the coordinates most
recently written, and order is what transitions already carry.

Pushback:
- **One active coordinate at a time conflicts with a busy moment.** Many inputs in one moment need different
  coordinates active together, so probably one per coordinate volume, with several volumes (one per dimension, or per
  input), rather than one in total.
- **Writing still needs a rule.** With no head, what puts new structure at a fresh coordinate? It has to be the same
  dynamics: where heat settles, structure forms, bound to the coordinates active at that moment. That must be said
  precisely, or something outside quietly does the writing.
- **Energy flowing everywhere is flooding.** [Units, flow and the states of a
  bond](units-flow-and-bond-states.md) already answers this: energy as a fixed budget of units that move and never
  copy.

**What it changed.** The automaton is no longer a reader roaming the grid (sections 3 and 6 describe it that way; read
them in this light). It is the substrate: a material of content and coordinates, with energy flowing through it, heat
where things don't fit, and structure where heat settles. The questions of control in section 10 (where to look, where
to move, which place a cue jumps to) become questions about how energy flows, not about something that decides.

### 13.4 Where it ends for now

Open, in the owner's words more or less: the idea has not answered all the questions, but may be going in an
interesting direction. What would need settling first, before any experiment:
1. how coordinates are held (one volume or several, cells or assemblies) and what a program declares about them;
2. the rule for writing: how structure comes to be bound to a fresh coordinate where heat settles;
3. how energy is kept from flooding (the fixed budget of units, or something else);
4. whether the first test (section 12, column addition on numbers longer than any seen) still stands in this framing,
   with movement replaced by flow.

### 13.5 Back to frames and variables, and a first experiment (C140)

**The owner.** Two dimensions was only familiar; the number of dimensions is arbitrary, and what matters is how the
space is used. Spatial memory (as many dimensions as it needs) is kept distinct from content memory, and spatial memory
is what lets content be laid out. If the whole thing is a substrate with energy flowing through it, attention needn't
be in one place, as a CPU is: it could be distributed and non-local. This is too high-level to answer practical
questions, so it should tie back to the original question: how do frames and variables work?

**The assistant.** In this picture, for "5 − 3 = ?": the frame is the fixed content ("−", "=") at places; **the
variables are places** relative to the frame (left of the "−", right of it, after the "="), and whatever content sits
there is the value. That answers C137's problems: a procedure learned over relative places carries any values (the
indirection C139 got from registers); values at the same place compete because one place holds one content, so
rivalry comes from position; "x = 3", then "x = 5" written elsewhere, is overwriting without erasing, the more recent
place winning; mapping is laying content out again under another arrangement of places. Many frames can settle in
different patches at once (settle locally first). The requirement everything rests on: **places must be relative and
reusable**, "left of the minus" meaning the same wherever the expression is, as with grid cells; and the separation
matters, since content memory recognises "−" anywhere and spatial memory supplies "left of" relative to it. Proposed:
subtractions at random positions, a procedure learned over relative places, tested with new numbers at unseen
positions.

**What C140 found.** With relative places, the procedure was learned from one or two examples among many distracting
digits, recalled by the engine from "−" alone, and was 100% right at positions training never used. With absolute
places, one bound procedure read the wrong cells (93% wrong) and several jammed. But the relative places were declared,
and a side probe showed the engine can't make them yet: after walking the row both ways, it could not turn "column 5,
move right" into column 6, because "arrived at 5 by moving right" and "leaving 5 by moving right" tie.

**What it changed.** Frames and variables as fixed content and relative places is no longer only a picture: it works,
given relative places. The next fundamental piece is the engine combining where it is with which way it moves, and
knowing which came first, so that relative places come from its own movement rather than being declared.

### 13.6 No separate space: relative moves inside assemblies (C141)

**The owner.** At first it was tempting to have volumes of cells and a separate thing called space, two sides of the
same coin with different behaviours. But maybe it is just volumes, with one thing added: **relative coordinates**.
Reading an expression left to right, there is a relative movement from each part to the next, and that gives an
isolated spatial chunk, not tied to a larger space: a relative space of the things relevant to each other at that
time. In neuroscience the eye movements (saccades) are associated with what is seen: looking at a face, the eyes jump
between features, and what gets stored is the direction the eyes took, so per feature there are saccade associations,
and together they build a spatial map. This lets several of the same thing exist in one space (A B B B C D D E F G)
without bleeding into each other. So there needn't be a separate space: the relative movements between parts are
stored as part of the assemblies. A frame such as "x + y" has that spatial structure, and composition follows, like
Lego or Tetris: assemblies whose shape lets them fit together, learned from the spatial structure of the input itself,
content and space learned together. His earlier visual experiments showed this to some extent, including simulating
cellular automata by learning their states and transitions (with some crutches and puppeteering). It is not bounded to
any number of dimensions, since it is all relative and dictated by the input: voxels, or even points floating in three
dimensions.

**The assistant.** This has good company: Noton and Stark's scanpaths (a picture remembered as features linked by the
eye movements between them) and Hawkins' "thousand brains" theory (features stored with the movement that leads from
one to the next, relative to the object). If a move is itself an assembly ("right", "down two"), moves are content like
any other, so it really is all volumes. But it doesn't remove what C140 found; it moves it. Reading still means
answering "from '−', moving right, what is there?", which needs the feature and the move together, with the feature as
the start. And repeats are harder: in "A B B B C", from a B moving right, the answer depends on which B, which a feature
and a move alone can't tell. Something must know where in the chunk you are.

**The owner.** The answer to repeats is **super-assemblies**: built by taking sparse samples of sub-assemblies as the
glue, repeated all the way up, they hold multiple instances in any arrangement, so "A B B B C" is a composition, not a
problem. Back then things were laid out on a space somewhat; now each assembly has its own relative space. And on
C140: what was the actual challenge? That there is no way to move at all, or something narrower?

**The assistant.** Agreed, with one condition: under "the same cells everywhere", sampling B three times samples the
same cells three times, so what keeps the instances apart is the relative position bound with each ("B one step on",
"B two steps on"). Super-assemblies plus relative position. And the C140 challenge was narrow: moves were given as
input, so moving was not the issue. The issue was how each step was stored: as a set, "4, right, 5" and "5, right, 6"
both contain 5 and right, so arriving and leaving tie; as a chain, "right" alone opens everything that ever followed a
right move. What is needed is a gate keyed on the start and the move, with the end outside the key: "{5, right} needs
both, then 6". It is already in the owner's language.

**What C141 found.** With one gate per step (a new shape in the engine copy: a key, then one target, opening only when
all of the key is present), every single move was exact (30 of 30, against 0 of 30), chains of moves stayed exact at
every moment, and C140's subtraction test, rerun with places reached by the engine's own moves, was 100% right at unseen
positions, and gave no answer at all where the engine had never learned to move.

**What it changed.** Relative places no longer have to be declared: they come from the engine's moves, through gates.
But the steps are still keyed on a column (a location code, like place cells). The owner's fuller picture keys them on
what is seen, with instances told apart by super-assemblies and relative position, and that is the next step.

### 13.7 Navigation or arithmetic? Column addition (C142)

**The owner.** Was C140 and C141 doing arithmetic, or only navigating around space?

**The assistant.** Mostly navigation: the facts were looked up, and the memory learned where to look. That is the piece
associative memory lacked (without places there is no way to say "the number to the left of the minus"), but it is not
an algorithm: nothing was written, there was one step, nothing branched.

**The owner.** The facts are the easy part: 2 + 2 is 4 is basic memory, the CPU's mapping. The hard problem is
procedures and algorithms: knowing what to move where, and in what order, which is all a computer does with its
registers. If reading, writing and moving over relative places allows something like arithmetic, then in principle it
is generic.

**The assistant.** Agreed on the framing. What would make it an algorithm and not a lookup had not been tested:
writing a result into a place, several steps where a later one uses what an earlier one wrote, a step that only
sometimes happens (a carry), and repetition. Column addition tests all of them, and the length of the numbers is an
honest test: a memorised sum can't do eight digits after seeing three; a learned procedure can. In the owner's picture
there should be no loop counter: the step is a frame over relative places, and after moving left it fits again where
there are digits and stops where there are none. **The owner** added: any loop that might not halt needs a limit, and
that limit is not a crutch.

**What C142 found.** From six worked examples of two- and three-digit sums, every seed learned the step (read the carry
above, the two digits in this column; write units below; write the carry one to the left; move left), and ran it on 4
to 8 digit sums at a new position: all 4,000 exactly right, every run stopping by itself after exactly the answer's
digits, the limit never touched. Trained without carries, it almost always failed. The facts, the search over every
possible step and the loop that re-applies the step were given; the procedure was learned, and its moves were the
engine's.

**What it changed.** Associative memory with relative places has now run an algorithm it learned: writing, branching,
reading back its own writes, and repeating for as long as the space says. The biggest crutch left is the search, which
in the owner's picture is heat's work: open places pulling activity to them until what fits cools into structure.

### 13.8 Shrinking the search: steered by heat (C143)

**The owner.** Is it now possible to remove the search crutch?

**The assistant.** Not fully, honestly: removing it completely means the engine finding the step through heat, and the
rule for how energy moves is still to be put up as candidate hypotheses; building it inside an experiment would mostly
test an invention. One real step is possible first: keep the search in code but steer it by heat (in a worked example,
the hot cells are those nothing explains yet; only places near a hot cell are tried; each part is bound as its cell
cools), and see how far that shrinks it and what shape it needs.

**The owner.** Do that first, quick and cheap, and let it inform the candidate rules; then the candidates.

**What C143 found.** Steering by heat cut the search about 200 times. The first version lost something: a cell cooled
as soon as any standing explanation explained it, so in one seed a wrong explanation (the carry written into the
answer row) cooled the very cell that would have shown it wrong, and the right step, learned later, jammed with it
(95%). The fix, after the first run: each explanation keeps its own heat and counts only if it leaves none. With that,
the results matched the exhaustive search exactly (100%, every run stopping by itself) with 241 times fewer checks.

**What it changed.** It points to four things the engine's energy rules need: attention goes to heat, and only cool
things explain hot ones; rivals settle separately (a partial settling belongs to one hypothesis, not to the space); an
explanation is finished only when no heat is left; and ambiguity branches into separate hypotheses, held open. The
search is still the experiment's, but its shape is now the shape the engine's version would need.

### 13.9 The facts into memory first (C144)

**The owner.** Perhaps bringing the facts into associative memory should be the next step anyway, and doing it may
solve some things along the way.

**The assistant.** Agreed, and it should come before candidate B ([candidate energy rules](candidate-energy-rules.md)),
which needs it: in the engine, "this sum explains that digit" can only mean a fact assembly completing.

**What C144 found.** All 1,000 single-digit facts as assemblies, recalled by completion: 1,000 of 1,000 exact, and
column addition with every fact recalled from the engine came out identical (100% on 4 to 8 digits). The facts are
plain association, as the owner said. But completion can't judge a written digit: with a wrong one, it never rejects
it, brings on the right digit beside it, and also opens the facts that would have made the wrong digit right, the
memory recruiting explanations for a misfit (close to what the owner calls patching). Rejecting needs the two digits to
compete for the same place, and in the engine rivals come only from transitions.

**What it changed.** The oldest crutch is gone. The fit test stays given, and the next fundamental piece is clearer:
**rivals from place**, so that two things in the same place compete, the loser's mismatch becomes heat, and a completed
fact cools instead of cueing its neighbours.

### 13.10 Rivals from place (C145)

**The owner** agreed to go on to rivals from place.

**What C145 found.** One rule added to the engine: two members compete if they have never been in an assembly together
but share company. Not told which digits compete, it found the five places of a fact (first digit, second digit, carry,
units, tens) from the structure alone. With it, a written digit is judged by the engine: given the three digits and
then a written units digit, every right digit was kept and every wrong one dropped (9,000 of 9,000; none without the
rule), the right digit standing in its place. The facts that used to rationalise a wrong digit now lose to the true
fact, and a completed fact holds still instead of setting off its neighbours. Column addition with the units digit
judged this way was identical to before.

**What it changed.** It is the owner's attraction and repulsion in its plainest form: shared company draws things
together, and never meeting in the same company makes them compete for one place. A mismatch is now something that
loses rather than something patched over, and the fit test for the units digit is the engine's. What is left of the
crutches in column addition is mainly the search, which is where candidate B comes in.

### 13.11 Instances before rule B (C146)

**The assistant**, designing candidate B, hit a blocker before writing code: to judge "read these three cells", the
engine must route their digits into a fact's three slots, and with many rival hypotheses open at once, all of them route
into the same slots (the same cells everywhere) and blur. That is the instances problem again ("A B B B C", several
values at once, super-assemblies with relative position). Options: a reduced B (the code proposes, the engine judges),
a serial B (one hypothesis at a time), or instances first. **The owner** chose instances first.

**What C146 found.** Using the owner's picture of a settled thing in the deep expanding into several copies at the
surface: the facts copied into lanes, digits routed into each lane by the engine's gates, each lane judging its own
hypothesis by rivals from place. With company counted from the facts only, 2, 4 or 8 hypotheses at once were all judged
exactly right (100%). With one shared set of slots, nothing that fitted was ever kept. With lanes but C145's rule counting
the routing gates as company, the lanes behaved exactly like one shared set, because every lane's "7" is fed from the
same cell, so they became rivals across lanes.

**What it changed.** Several instances of the same thing can stand at once, which unblocks rule B. And C145's rule is
refined: rivalry should come from what things are, not from how they arrive.

### 13.12 Rule B (C147)

**The owner** confirmed rule B as the next experiment.

**What C147 found.** With the bar lowered by distance around the heat and hypotheses judged eight at a time in lanes
(facts in memory, rivals from place, company from the facts only), the right step was found in every seed, but one seed
first bound a coincidence and jammed (95%). Rule B stops at the first explanation that accounts for a whole example, so
in 19 + 22 a hypothesis reading the answer digit to the right (which happened to equal the carry) was bound before the
true explanation one step further out was ever tried. After the first run, lowering the bar one more step before
stopping gave 100%. Judging in lanes cut the engine's runs about six-fold, but distance saved almost nothing in what had
to be tried, because the true explanation is not the nearest.

**What it changed.** Judging is now the engine's, and parallel. Nearest-first is credulous: whatever fits first is
trusted. Nearness is a poor guide to where the answer is; priming from what is already known (the owner's warmth from
existing structure) is the likelier guide. The choice among fitting explanations, and the jam when a wrong early binding
is never outcompeted, remain open.

### 13.13 More structure wins (C148)

**The assistant** proposed fixing the jam before priming: it had caused failures in four experiments, and would have
rescued C147's failed seed on its own. **The owner** agreed.

**What C148 found.** Two reasons for the jam, read from the engine's code: every binding was a separate chain on fresh
members, so nothing competed; and even on the same cells, one opening's support didn't know how many copies of itself
existed, so one wrong and three right still tied. With both changed (the same cells for every binding of the step, and
in competition the structure that exists more times winning among rivals at the same support), a wrong step bound
once and the right one twice recalls the right step, and C147's rule B is 100%. Neither change works alone.

**What it changed.** The owner's principle now holds in the engine: being wrong is more structure, nothing breaks, and
what has been confirmed more outcompetes it. Reinforcement is more of the same structure, not a strength on a bond.

### 13.14 Does the machine perform arithmetic from associative memory? (C149)

**The owner.** Where have we come from, where are we, and does the machine now perform arithmetic from associative
memory, or are there still fundamental things to work through?

**The assistant.** Not yet, by itself: the engine held the facts, judged fit, moved, and held and recalled the learned
step, but the experiment's code carried the step out (went to the places, fed the digits into a fact, wrote into a grid,
applied the step again). The engine was the program, the memory and the legs; the code was still the hands. Every piece
needed existed separately in the engine; what hadn't been done was wiring them into one process: the space as the
engine's memory, writing as forming structure, and carrying out the step as the engine's own dynamics.

**What C149 found.** With the space held as place-to-content associations, a fixed write rule (a place and a value on
together become bound), the learned step bound as structure, routing by gates, facts as gates, and a six-phase clock
that only moves on when a fact completes, the experiment's code only wrote the numbers in and read the answer out. In
one engine run, every seed's learned step added 4 to 8 digit numbers exactly right (4,000 of 4,000), each run stopping
by itself when nothing was left to read. Without the write rule, nothing works.

**What it changed.** Yes: the machine performs arithmetic from associative memory, with a fixed architecture (clock,
gates, the write rule) and an encoder that pads each number with a leading 0. What remains is learning the step in the
same circuit, rather than learning it elsewhere and turning it into gates, and making "nothing here" mean 0.

### 13.15 Learning in the circuit (C150)

**The assistant** proposed learning the step in the same circuit that runs it: a worked example already has its working
written, so running a candidate over it makes every write meet something; the same digit cools, anything else is heat,
and running the step becomes its own test. **The owner** agreed.

**What C150 found.** With worked examples written in full and candidates running in lanes of C149's circuit, every seed
learned the right step by the first or second example, and bound into the circuit it added 4 to 8 digit numbers 100%
right, stopping by itself. There was no separate checker. Without carries in training, the right step was still bound,
but partly by distance: with every carry 0, reading the carry above and the carry to the left were indistinguishable,
and the nearer won.

**What it changed.** The circuit that does arithmetic also learns it, by doing arithmetic on worked examples. Still the
experiment's: proposing candidates, reading off "no heat left", choosing among ties, and binding the winner in. The
next pieces are making "settled" and binding the circuit's own, and priming in place of distance.

### 13.16 Settled and bound by the circuit (C151)

**The assistant** proposed making "settled" and binding the circuit's own: a lane with nothing hot switching something
on, which then ties its parts to the "+", the way the write rule works. **The owner** agreed.

**What C151 found.** With cooling as cells switched on by agreement gates, a misfit stopping the lane's clock, a Settled
gate needing every cell of the working cooled, and a fixed rule binding a settled lane's step into a long-term store
(no held-open rule; whatever the store gives from "+" is what has been learned, the most-bound structure winning), all
20 seeds learned the right step and added 4 to 8 digit numbers 100% right. Without carries, the two explanations the
evidence can't tell apart tied for ever, and the store gave nothing, where C150's candidate order had quietly guessed.

**What it changed.** Explaining, deciding and remembering are one process inside the circuit. Left to the experiment:
proposing candidates, and declaring which cells are the working (the heat).

### 13.17 A second procedure on the same circuit (C152)

**The assistant** proposed subtraction with borrowing on C151's circuit, to see whether the circuit is general or
addition-shaped: subtraction facts beside the addition facts, the family as a learned part of the step, each worked
example with its sign, and both steps in one store and one circuit. It noted that the circuit has only one step per
operator, and that borrowing might show whether many learned states would be needed. **The owner** said not to let
that framing steer it: it needn't follow a Turing machine's shape, states may turn out not to be needed at all, and the
point is to see what comes out.

**What C152 found.** The learning machinery is general: in every subtraction example the lanes settled the right step,
which has exactly addition's shape (only the family and which read is taken from differ), and alone it subtracts 4 to 8
digit numbers 100% right. But the two procedures share four of their seven parts, and that breaks both the store and
the circuit. In the store, recall from a sign follows its own procedure only up to the first shared part; after that the
procedure bound more often wins, so "−" gave subtraction's reads with addition's family, and with equal counts recall
stopped. At the end of training, nothing was recalled from either sign in any seed. In the circuit, with both steps bound
in by hand, the other step's state completed from the shared parts and both procedures ran at once: 0%.

**What it changed.** The column procedure looks like one shape with different facts plugged in, and the circuit can
learn it either way. What's missing isn't more machinery for learning but something that keeps track of which
procedure is running once two procedures share structure: the sign starts it and is then gone. Three directions come
out of the evidence, with none assumed: keep the starting context on while the procedure runs; let each part carry its
context (bind "in this procedure, then this"); or have no separate procedures at all, one step that reads the sign as
one more input and takes its family and order from it. The last bears directly on the owner's question of whether
separate states are needed.

### 13.18 One step reads the sign (C153)

**The owner** asked for the most valuable next experiment. **The assistant** recommended not keeping two procedures
apart but asking whether there need be two: C152's steps differed only in their facts and their reading order, and
addition doesn't care about order. With the sign on the page, read like a digit, one step might do both. It argued
against simply keeping the sign switched on, since one more member wouldn't stop the other step's state completing.
It also warned that wiring "+" to the addition facts would rig the experiment, so that link would have to be learned
too. **The owner** agreed.

**What C153 found.** With the sign written under every column (a declared crutch), a step with a sign read and no
family, links from sign to facts learned from which facts settled each example, and one cue for every step: every seed
learned one step from two examples, top number first, sign below, "+" meaning the addition facts and "−" the
subtraction facts. In one circuit it added and subtracted 4 to 8 digit numbers 100% right. The order was found by
repetition: the first addition settles all three orders, the first subtraction only top-first, which then has more
copies. With addition proposed in one order only, the two steps differed, were rivals under the one cue, and the store
gave nothing.

**What it changed.** For this family of procedures, separate states weren't needed. The difference between adding and
subtracting lives on the page and is read each column; what it selects is facts, not a procedure. The next pieces are
writing the sign once, so the step must carry it along as a variable, and a procedure whose step really differs in
shape, to find where one step stops being enough.

### 13.19 The sign carried along (C154)

**The owner** asked to go ahead with writing the sign once, and named long multiplication as the aim further on.
**The assistant** gave the step a sign write, by the same write rule as digits, with the sign written once under the
starting column. The worked examples don't show the carried sign, so if the carrying is learned, it is learned from
its effect: without it, the next column has no sign to read.

**What C154 found.** Every seed learned C153's step plus writing the sign under the next column to the left, where the
moved focus reads it, from the first two examples. With each test sum's sign written once, it added and subtracted 4 to
8 digit numbers 100% right. When training pages had the sign under every column, carrying was never needed, all
fifteen sign places settled alike, and the store gave no step.

**What it changed.** A variable is now carried through the frame by the procedure itself: picked up, used, and passed
on, selected only because nothing else lets the procedure keep going. The step is still one step. Long multiplication
is the first procedure where that plainly won't be enough on its own: a multiplier digit held across a whole row,
carries above 1, several rows at shifting offsets, and adding them up. A way in is multiplying by a single digit first.

### 13.20 Times one digit (C155)

**The assistant** proposed multiplying by a single digit as the first piece of long multiplication. The multiplier is
written once, like the sign, so the step would have to carry it along, and a pass-on write that does nothing where the
bottom row is full might let one step cover all three kinds of sum. **The owner** agreed. A build check before the
main run showed that the planned change to the search let coincidences through and could never find a multiplication.
The assistant revised the design before the main run: before searching, replay the steps already in the store.

**What C155 found.** Every seed learned one step: C154's, plus passing the bottom digit on to its left. In every seed,
only the first addition was searched. The first subtraction and the first multiplication were each settled by replay:
of the 270 steps the addition had left in the store (every pass-on fitting alike there), exactly two settled the
multiplication, and the top-first one won by repetition. In one circuit the step added, subtracted and multiplied by a
digit, 100% right at 4 to 8 digits. Carries up to 8 caused no trouble.

**What it changed.** Three kinds of sum are one procedure with carried variables (the sign and the multiplier) and the
carry, still with no separate states. And for the first time an earlier procedure was the source of a later one, not
its rival: the additions left the needed variant in memory, and the multiplication picked it out. Long multiplication
needs one thing this hasn't had to do: go back to the start of a row and begin again with the next multiplier digit.
Whether one step can do that, or a second step must take over, is the next real question.

### 13.21 Long multiplication, a taste (C156)

**The owner** asked for long multiplication next, but as a short run for an early indication rather than a thorough
one. **The assistant** first put C155's step on long-multiplication pages by hand. On a two-digit multiplier it went
wrong from the second column, because the place it passes the multiplier into already holds the multiplier's next
digit. The small run then asked whether the learner could find another way to do the first row on the paper layout.

**What C156 found.** It couldn't. Over two seeds, the search found nothing that settles, only coincidences (a
multiplier ending in 1, or two equal digits). The store kept C155's step: about 10% right on long first rows by
coincidence, still 100% on single-digit multiplication.

**What it changed.** Everything the circuit has carried so far (the carry, the sign, the multiplier), it carried by
writing on the page. Long multiplication is the first procedure where the page has no room for that. A person keeps
"times 6" in mind for the whole row. So the indication is that a value must be held on in the circuit while a row runs.
This is the first time held context, a kind of state, has been called for by a procedure itself. The next step is
offering "hold this read" as a part a candidate can have and seeing whether the long pages select it. After that comes
the restart to the next row.
