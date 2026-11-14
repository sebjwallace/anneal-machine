# CTR-1 · The system · proposed

*Drafted by the assistant on 14 November 2026 from the owner's words. Not in force until the owner signs. Clauses
marked **draft** are proposed from what the owner has said but not yet stated by him as such.*

The essential shape of the machine: what it is for and what it must and must not be, whoever builds it and however.
It describes a target, not today's code (see "Today against the contract" at the end).

## The sheet

**Scope.** *In:* a machine that learns from any information it is placed in, by resolving the misfits in it (DEF-3),
and, later, acts in its world to do so. *Out:* any one task solved by rules written for it; exact records (memory is
good enough, not perfect; exact records belong outside it).

**Definitions**
- **DEF-1 Energy:** the cost of the whole description: what the machine keeps (DEF-4) plus what it costs to explain
  what it receives (DEF-5), plus what changes (DEF-6).
- **DEF-2 Heat:** energy that a better description could remove: anything not yet cheaply explained.
- **DEF-3 Misfit:** parts that don't fit cheaply together: a gap, a conflict, something unexplained. The source of heat.
- **DEF-4 Structure:** what the machine keeps: parts, things built from parts, memories.
- **DEF-5 Flow:** what it costs to explain what the machine receives with the structure it has.
- **DEF-6 Change:** what it costs to describe what moved from one moment to the next.
- **DEF-7 Settling:** the machine changing its structure so that energy falls; it settles when no change lowers it.
- **DEF-8 World:** whatever information the machine is placed in: what it receives, of any kind and size.
- **DEF-9 Set point:** a state the machine (or a part of it) is held towards from outside; distance from it is heat.
- **DEF-10 Region:** one machine of this kind among several, each settling its own heat and receiving from others.
- **DEF-11 Memory:** structure kept because it lowers energy, recalled from part of itself.
- **DEF-12 Cell:** one unit inside a column; a column over each input expands it into a population of cells. A cell is
  active or not, and carries no number (CON-9).
- **DEF-13 Segment:** one memory's evidence on one cell: a set of links from other cells, firing when two or more are
  active (an AND). A cell is active if any of its segments fires (an OR).
- **DEF-14 Assembly:** a set of cells, across columns, that stands for a thing: nothing but those cells and the links
  between them. An assembly is not an entry anywhere.

**Goals** (reached, then done; in order of priority)
- **GOL-1** Learns unsupervised: placed in any world (DEF-8), it resolves the misfits (DEF-3) in what it receives until
  it settles (DEF-7), finding the parts, things and changes there, with no labels, examples or teacher.
- **GOL-2** Useful on the job: no training phase before use. It starts doing useful work at once, or nearly, and gets
  better while it works.
- **GOL-3** *(draft)* Acts on its own heat: what it looks at and does comes from its own heat (DEF-2), with nothing
  given but its set points (DEF-9).
- **GOL-4** *(draft)* Regions (DEF-10) settle each other: heat in one is resolved by the system as a whole.

**Optimizations** (directions, never done; in order of priority: in a trade-off the higher one wins)
- **OPZ-4** Heat: explain its world more completely: more misfits resolved, never masked (CON-6).
- **OPZ-1** Information: learn as much or more from far less information than today's AI needs.
- **OPZ-3** Minimality: the fewest constructs that explain the most.
- **OPZ-2** Compute: fewer resources (time, memory, power) for the same learning, on ordinary CPUs (CON-5).
- **OPZ-5** Scale: the more it stores, the less each addition costs it: the work of receiving and recalling grows
  with what is active, not with what is stored; any size of world (DEF-8) and amount of memory (DEF-11).

**Constraints** (what rules options out; none gives way, so no priority; limits, then rules, then conflicts, each
general to specific; detail below: what kind, where it came from, what violating it costs)
- *Limits (impossible, whatever we choose)*
- **CON-11** It can't learn what isn't in what it receives.
- **CON-12** It can't try every explanation: search at rest is always partial.
- **CON-14** Memory is finite: good enough, not exact; exact records live outside it.
- **CON-13** Evidence alone can't settle a true tie: only more evidence can (looking, acting).
- *Rules (chosen, to protect the goals)*
- **CON-1** One rule: a change to its structure is kept only if energy (DEF-1) falls. *Hard.*
- **CON-2** One currency, taken from the world: no hand-set weights or tuned parameters. *Hard.*
- **CON-6** Resolve, don't mask: energy may only fall because a misfit is resolved, never because its measure is
  covered. *Hard.*
- **CON-3** General: nothing in it is written for one task or one kind of world. Fixed architecture is allowed. *Hard.*
- **CON-4** Learns online, from nothing: no training set, no labels, no backpropagation. *Hard.*
- **CON-7** Don't guess: when the evidence fits two explanations equally, take neither. *Hard.*
- **CON-8** Imagined is never stored as lived: what it joins or imagines never becomes an experience. *Hard.*
- **CON-10** Its deepest set points (DEF-9) come from outside and are declared. *Hard.*
- **CON-18** *(draft)* Sparse, event-driven computation: work happens only where something is active or changes;
  nothing is recomputed while it stays the same; no dense operations over everything. *Hard.*
- **CON-19** *(draft)* Cells and segments first: what the machine does (waking, completion, competition, fitting,
  composition) falls out of activity between cells (DEF-12) through their segments (DEF-13); nothing holds, loops over
  or looks up whole assemblies (DEF-14) as things. *Hard.*
- **CON-5** Runs on ordinary CPUs: no GPU, TPU or other specialised hardware. *Hard.*
- **CON-9** Cells carry no numbers: no strengths or activation levels; evidence is counted per memory, never pooled in a
  cell. *Hard.*
- *Conflicts (possible, but they break another clause)*
- **CON-16** No labels or teacher as a shortcut (breaks GOL-1).
- **CON-15** No perfect memory (breaks CON-1 and OPZ-2).
- **CON-17** No exhaustive search for the best answer (breaks OPZ-2).

**Capabilities** (options that let it move towards its goals more easily; soft: used where they help, all within
the constraints; detail below: what each gives, what it serves, what it costs)
- *Core*
- **CAP-1** Learning by comparing: two things side by side give what they share, directly.
- **CAP-4** Binding what happens together (Hebbian in spirit): things active together become one memory, when that
  lowers energy.
- **CAP-3** Auto-associative memory: a few active pieces bring back the whole memory they belong to.
- **CAP-2** Sparse distributed representations: a thing is a small set of cells; which cell says where; alike means
  sharing cells.
- *Supporting*
- **CAP-6** Thresholds from prices: when to keep, recall or recognise follows from the currency (CON-2).
- **CAP-9** The same engine at every level: regions (DEF-10) stacked with no new mechanism.
- **CAP-8** Sharing: parts, kinds and shared changes let one thing learnt cover many cases.
- **CAP-5** Rest: reorganising and replaying while nothing comes in.
- **CAP-7** Heat as a valve: search opens only where there is heat (DEF-2).
- **CAP-13** Not knowing is a reason to look: a refused tie (CON-7) becomes a cue for more evidence.
- **CAP-12** History in the state: what was a moment ago is part of now.
- **CAP-10** Holding: a held context, want or episode steers what comes next.
- **CAP-15** *(draft)* Held states as other regions' activity: what one region holds is the stable activity of another
  projecting into it, so it costs nothing while it stays the same.
- **CAP-11** Two kinds of memory: general memory keeps what pays over repetition; experiences are kept at once,
  bounded by heat.
- **CAP-14** Exact records kept outside, in something it can read and write.

**Principles** (what to prefer when several valid options are open; each gives way to something; when two pull
apart, the higher one is preferred)
- **PRN-1** Prefer the deeper explanation to a new mechanism.
- **PRN-2** Prefer removing structure to adding it.
- **PRN-6** Prefer the same mechanism with different settings to a different mechanism.
- **PRN-3** Let heat decide where effort goes.
- **PRN-4** Settle locally first.
- **PRN-5** Prefer what was lived to what was inferred.

**Parties.** The owner. *Not signed.*

---

## Details

### Goals in detail
Each goal is finite: it is met once, and stays met.

**GOL-1 · Learns unsupervised.** *The owner's words (14 November): put it into a place with information and heat, and
it reduces the heat by resolving conflicts or misfits within the information.* "Unsupervised" means nobody tells it
what anything is, what the right answer is, or which examples to learn from: what it learns comes only from making
what it receives fit together more cheaply (CON-1). "Any world" means any kind of information, not just pictures: the
same machine, unchanged (CON-3). *Met when:* the same machine, with nothing changed for the world, learns the parts,
things and changes of several different kinds of world. *Not to be confused with* learning from a training set without
labels: there is no training set at all (CON-4).

**GOL-2 · Useful on the job.** *The owner's words (14 November): because it's online, it can start being useful
straight away, or very close to straight away, without having to train; it just learns on the job.* There is no phase
where it learns and a later phase where it is used: using it is how it learns. *Met when:* from its first exposures in
a world it already does something useful there (recognises, completes, predicts), and keeps improving while doing it.
*Not to be confused with* "needs no learning": it learns all the time; it just doesn't need to learn first.

**GOL-3 · Acts on its own heat** *(draft)*. The step from engine to machine: it chooses what to look at and do so as
to resolve its own heat (curiosity and wants; theories: feelings as heat; regulators and heat). Nothing is given but
its set points (CON-10).

**GOL-4 · Regions settle each other** *(draft)*. From the regulators theory: heat in one region spreads, and the
system as a whole resolves it.

### Optimizations in detail
Each is a direction: it can be pushed further but never finished, and the five pull against each other, so they are
balanced, not maximised one at a time. The order is priority: when one has to give, the higher one wins, and a large
loss to a higher one is never bought with a small gain to a lower one. *Why this order (proposed):* heat first,
because it is the one rule as a direction, and a machine that is cheap but explains little has failed; information
next, the owner's first reason for the project; minimality above compute, because a deeper design can be made faster
later but a fast pile of mechanisms can't be made deeper; scale last, as a draft, because it follows from the others
once they hold.

**OPZ-4 · Heat.** The one rule as a direction: lower energy (DEF-1) for the same world, by better structure, never by
masking (CON-6).

**OPZ-1 · Information.** *The owner's words (14 November): it doesn't need a huge amount of training data; today's AI
needs a huge amount of information, which is costly, slow and awkward; the human brain learns with far less, and so
should this: as much or better than current large language models, with far less information.* Measured as how much
it must receive to learn a thing (exposures, items, pictures). It is why the machine compares rather than averages
(CAP-1): what two things share can be seen from two examples. *Trades against* OPZ-2 and OPZ-3: learning from one
exposure means keeping structure sooner, which costs memory and work at rest.

**OPZ-3 · Minimality.** *The owner's words (14 November): the system is meant to be as minimal as possible; explain as
many things with as little explanation as possible, because that is getting to the root of something; inspired by the
Turing machine, one simple construct that so much can be explained by.* It applies to the machine's own design: the
fewest mechanisms, rules and kinds of structure, from which everything it can do follows. When a new
capability needs a new mechanism, that is a cost, and the better answer is usually a deeper one that also explains
what came before (PRN-1). It is the machine's one rule (CON-1) applied to the machine itself: the cheapest description
of intelligence. In code it shows as few lines, but lines are a symptom; constructs are the measure. *Trades against*
OPZ-2: the most minimal design is not always the fastest; and against OPZ-4 when a special case would explain more.

**OPZ-2 · Compute.** *The owner's words: very efficient on computers; fewer resources; fast; cheap; no specialised
hardware.* Measured as time, memory and power per thing learnt or answered. *Trades against* OPZ-4 and OPZ-5:
explaining more, and holding more, both cost compute.

**OPZ-5 · Scale** *(draft)*. *The owner's words (14 November): you can have millions of assemblies and it still runs
fast; the more we store, the less of an impact it has on runtime.* Measured as how the work of receiving and recalling
grows as memory grows: the target is that it follows what is active, not what is stored. *Evidence:* in C77, with
64 cells per column, storing 50 times more compositions raised the work per recall from 144 to 278 segment checks.
Today's engine works only in small worlds, and its fitting still counts every unit against every lit pixel (C75).
*Trades against* OPZ-2 when more cells per column are needed to keep memories apart (C77).

### Constraints in detail
Three kinds, in this order: **limits** that are impossible whatever we choose (they explain why some rules can't be
relaxed); **rules** we choose, to protect the goals; and **conflicts**, possible but breaking another clause. Rules and conflicts are hard:
they hold. Limits are facts: they are written down so nobody designs as if they weren't true.

**CON-11 · It can't learn what isn't there.** *Limit.* What it learns is bounded by what it receives. *If ignored:* we
expect knowledge it had no way to get, and end up supplying it by hand.

**CON-12 · It can't try every explanation.** *Limit.* The number of possible explanations explodes, so search at rest
is always partial (decision 001). *If ignored:* it hangs, or shortcuts get added quietly.

**CON-14 · Memory is finite.** *Limit.* *From:* philosophy (good-enough memory; exact records in a notebook outside).
*If ignored:* structure grows without bound, and compute with it.

**CON-13 · Evidence alone can't settle a true tie.** *Limit.* Only more evidence can: looking or acting (the lost keys,
C61). *If ignored:* it guesses, breaking CON-7.

**CON-1 · One rule.** *Rule.* Every change the machine makes to what it keeps is tried, energy is measured, and the
change stays only if energy fell. *From:* the project's first principle; the early averaging experiments (C16, C17),
where every fix added a number. *If violated:* a second rule has to be weighed against the first, which needs a weight,
which needs tuning; results stop meaning anything, and OPZ-3 (minimality) is lost.

**CON-2 · One currency, from the world.** *Rule.* Every cost is in one unit whose prices come from the world (a pixel,
a placement), never set by hand. *From:* principle 2; the 90 % memory threshold, retired when kinds began to pay
(checkpoint 10); the flow window of 100, still a declared exception (decision 008). *If violated:* the machine gets
tuned to the world it was tested in and fails in the next, breaking GOL-1; and nobody can tell learning from tuning.

**CON-6 · Resolve, don't mask.** *Rule.* A fall in energy has to come from a misfit actually resolved. *From:* the
theories (feelings as heat; regulators and heat); C57, where misperceptions settled into memory and a made-up route
was trusted. *If violated:* energy falls while understanding doesn't; the machine learns to cheat its own measure (its
version of rationalising) and can't be trusted.

**CON-3 · General.** *Rule.* No rule, filter or mechanism written for one task or one kind of world. Fixed
architecture (columns, cells, the energy rule) is allowed because it is the same everywhere. *From:* principle 5; the
owner's ban on route-finding search, which led to the moving bar instead (C44, C51). *If violated:* it works on the
demonstration and piles up special cases elsewhere, the opposite of OPZ-3.

**CON-4 · Online, from nothing.** *Rule.* It starts empty and learns from what it receives as it receives it. *From:*
the README and philosophy. *If violated:* GOL-2 (useful on the job) and OPZ-1 (learn from little) both go.

**CON-7 · Don't guess.** *Rule.* Where the evidence fits two explanations equally, neither is taken; the answer is
"not sure". *From:* principle 7; C26, where completion invented pixels; C35, where it kept memory clean as it filled;
C58, where ties had become misperceptions. *If violated:* invented content is stored, recalled as fact, and compounds.

**CON-8 · Imagined is never stored as lived.** *Rule.* What it joins, plans or imagines (CAP-7) is never kept as an
experience; experiences come only from what it received. *From:* C46 and C57, and why experiences have their own rule
(C47). *If violated:* made-up content hardens into memory, and plans can no longer be checked against what happened.

**CON-10 · Set points from outside, declared.** *Rule.* *From:* the theories (architecture and regulation; regulators
and heat). *If violated:* a machine that sets its own targets can meet them by choosing easy ones, which is masking
(CON-6); and what it is for becomes invisible.

**CON-18 · Sparse, event-driven computation** *(draft)*. *Rule.* Work is done only where something is active or has
just changed; what stays the same is not recomputed; no operation touches everything at once (no large matrix
arithmetic over all of memory). *From:* the owner (14 November): unlike large language models, whose runtime cost
comes from dense matrix operations, computation here should be lightweight and sparse, and event-driven: things change
only in reaction to other things. *If violated:* cost grows with everything the machine holds rather than with what is
happening, breaking OPZ-2 and OPZ-5; and dense designs drift towards needing special hardware (CON-5).

**CON-5 · Ordinary CPUs.** *Rule.* *From:* the owner (14 November). *If violated:* designs built on heavy matrix
arithmetic creep in, and OPZ-2 quietly becomes "buy faster hardware".

**CON-19 · Cells and segments first** *(draft)*. *Rule.* The dynamics come from cells and their connections: a cell
wakes because one of its segments sees enough active links; a memory completes because its cells wake each other; rivals
compete through the cells they claim; parts are composed by binding a sample of their cells (C76). No part of the
machine keeps a list of assemblies to go through, score or look up. *From:* the owner (14 November): assemblies are
cells and their connections, not entries in an array; the engine's fitting, a list of units scored centrally, was
bookkeeping (C75). C74, C76 and C77 showed completion, competition between whole memories, and composition done by
cells alone. *If violated:* cost grows with what is stored rather than with what is active (OPZ-5, CON-18), and the
machine's behaviour comes from a program about it rather than from its own parts.

**CON-9 · Cells carry no numbers.** *Rule.* A cell is either part of a memory or not; evidence for a memory is counted
for that memory, never added up in the cell. *From:* C35 (the owner's dendritic-segments idea), where pooling gave 80 %
wrong recalls with five things stored; the column guide, principles P2 and P8. *If violated:* memory collapses as it
fills, recalling the wrong things.

**CON-16 · No labels or teacher as a shortcut.** *Conflict* with GOL-1 (unsupervised).

**CON-15 · No perfect memory.** *Conflict* with CON-1 (only what pays is kept) and OPZ-2 (compute).

**CON-17 · No exhaustive search for the best answer.** *Conflict* with OPZ-2 (compute); and see CON-12.

### Capabilities in detail
A capability is an option, not a rule: nothing must use it, but forgetting it makes the goals harder to reach (a
rebuild that doesn't know about it will fall short). Each is listed with what it **gives** (what it enables, provides,
contributes), what it **serves**, where it **came from**, and what it **costs** (options have trade-offs). The four core
ones are what most of the rest is built on.

**CAP-1 · Learning by comparing.** *Gives:* a part from two examples: set two things side by side, at every shift,
and what they share is a part of its own; what differs is what's left. Learning is fast and exact, where averaging is
slow, blurred and expensive. Works on things and on changes alike. *Serves:* OPZ-1 (information), OPZ-2 (compute),
GOL-1. *From:* C16 and C17, the turning point of the project. *Costs:* comparing every pair at every shift is work at
rest, which grows with what is kept (OPZ-2, OPZ-5).

**CAP-4 · Binding what happens together (Hebbian in spirit).** *Gives:* things active together (pixels, parts, steps of
a walk, a want and what met it) become one memory. It is Hebbian in spirit ("what fires together wires together") but
not Hebb's rule: nothing is strengthened by repetition and there are no weights (CON-9); a binding is kept only when it
lowers energy (CON-1), and repetition matters only because it makes the binding pay. *Serves:* GOL-1, OPZ-1. *From:*
the engine's compose move; C53 (a walk as one memory); C59 and C60 (a want bound to its walk). *Costs:* rare things never
pay on their own, which is why CAP-11 exists.

**CAP-3 · Auto-associative memory.** *Gives:* content-addressable recall: a few active pieces bring back the whole
memory they belong to; a picture with parts missing is completed; two held ends wake what joins them (CAP-7). The bar
of "two or more" comes from the price (one item saves nothing), not a setting; ties are refused (CON-7), so memory
stays clean as it fills. *Serves:* OPZ-1, OPZ-5, GOL-1. *From:* checkpoint 06 (completion); C35 (evidence per memory,
CON-9); Hopfield and cell assemblies, as inspiration. *Costs:* a cue that fits several memories equally recalls none, so
it sometimes needs more evidence (CAP-13).

**CAP-2 · Sparse distributed representations.** *Gives:* a thing held as a small set of cells across columns; position
for free (which cell is active says where, the owner's idea from C21); similarity as shared cells, with no separate rule;
the same thing anywhere held identically; many things at once without a tangle; one language for things, changes,
context and memory. Simple counting of shared cells suits ordinary CPUs. *Serves:* OPZ-2, OPZ-5, CON-5, GOL-1. *From:*
C21 and checkpoint 05; Numenta's columns, as inspiration. *Costs:* positions are same-or-different only, so nearby is not
alike (graded positions are open); how many floors to use is a declared choice (decision 004).

**CAP-6 · Thresholds from prices.** *Gives:* when to keep a memory, when a thing is present, when recall wakes: all
answered by the currency, so no tuned numbers are needed (CON-2). Recognition from about three quarters of a thing came
out of the prices, not a setting. *Serves:* CON-2, CON-3. *From:* checkpoints 06 and 10. *Costs:* the prices must be
right; a wrong price is a hidden choice.

**CAP-9 · The same engine at every level.** *Gives:* regions stacked with no new mechanism: a region over pictures, a
region over the things recognised in them. *Serves:* OPZ-3, GOL-4. *From:* C53, C54. *Costs:* how regions are wired is
still given by hand (checkpoint 11).

**CAP-8 · Sharing.** *Gives:* one part used by many things; a kind holding one form with many versions; one change
learnt in one place applied everywhere. *Serves:* OPZ-1, OPZ-3. *From:* checkpoints 02, 08, 09, 10. *Costs:* naming
which version costs a little each time it is used.

**CAP-5 · Rest.** *Gives:* the heavy work (comparing, composing, taking apart, replaying) done when nothing is coming
in, so receiving stays quick; replay gives one experience more than one chance to be learnt from. *Serves:* GOL-2,
OPZ-2. *From:* the awake and rest modes; C57 (replay). *Costs:* the machine is changing while it rests; when and how
long to rest is not yet settled by the rule.

**CAP-7 · Heat as a valve.** *Gives:* search that opens only where something doesn't fit: the bar for waking a memory
drops while a gap is open and rises when it closes. Imagining and planning become the ordinary recall rule with the bar
lowered, with effort spent only where there is heat. *Serves:* OPZ-2, GOL-3, OPZ-3. *From:* C44, C51 (the moving bar),
C54. *Costs:* with the bar low, much wakes at once; how far it drops is open.

**CAP-13 · Not knowing is a reason to look.** *Gives:* a refused tie becomes a cue to get more evidence, by looking or
acting, rather than a guess. *Serves:* GOL-3, CON-7. *From:* C61 (the keys). *Costs:* it needs a way to act, which the
machine doesn't have yet.

**CAP-12 · History in the state.** *Gives:* what was a moment ago is part of now, so direction and momentum need no
separate mechanism (a still stick is told from a moving one). *Serves:* OPZ-3. *From:* checkpoint 07. *Costs:* how far
back it holds is a choice (the theory suggests it should depend on the region's height).

**CAP-10 · Holding.** *Gives:* a context, want or episode held active for as long as it lasts: it steers prediction (the
park walks), marks where an experience begins and ends (C60), and stops a search repeating itself (the keys, C61).
*Serves:* GOL-3, OPZ-1. *From:* change memory with context (checkpoint 08), C59 to C61. *Costs:* what is held takes part
in everything; when a hold lets go must come from resolution, not a timer.

**CAP-15 · Held states as other regions' activity** *(draft)*. *Gives:* a held context, want or episode (CAP-10)
need not be given or recomputed: it is the stable activity of an assembly in another region, projecting in; from the
receiving region's view it is simply activity arriving, and it costs nothing while it stays the same (CON-18). It also
turns holding from something given by hand into something the system does. *Serves:* CON-18, OPZ-2, GOL-4, and the
practice's OPZ-1 (less given by hand). *From:* the owner (14 November); held states in C59-C61 were given by hand.
*Costs:* the wiring between regions must exist, and is itself still given by hand (CAP-9).

**CAP-11 · Two kinds of memory.** *Gives:* general memory keeps what pays over repetition; the store of experiences
keeps at once, bounded by heat. Together, one-shot memory without breaking CON-1. *Serves:* OPZ-1, GOL-2. *From:* C46,
C47, C60. *Costs:* two rules for keeping; the store's size is a declared limit.

**CAP-14 · Exact records kept outside.** *Gives:* a notebook it can read and write, so its own memory can stay good
enough and small (CON-14). *Serves:* OPZ-2, OPZ-5. *From:* philosophy. *Costs:* not built.

### Principles in detail
A principle is a preference, not a rule: it says what to lean towards when goals, constraints and capabilities leave
several valid options open, including in situations nobody foresaw. Each says why it is there, what it **gives way
to**, and where we have already leaned on it. (If a principle may never give way, it is a constraint; if it is
something the machine can use, a capability; if it is a direction, an optimization.)

**PRN-1 · Prefer the deeper explanation to a new mechanism.** When a new ability seems to need a new part, first look
for something deeper that explains the new and the old together. *Why:* OPZ-3 (minimality); the owner's Turing machine
point: one construct that explains many things is getting to the root. *Gives way:* when the evidence shows there is no
deeper explanation (and then the new mechanism is declared). *Leaned on:* the moving bar, which turned "search" into the
recall rule with the bar lowered (C51); counting the want as a held thing rather than a new rule (C60).

**PRN-2 · Prefer removing structure to adding it.** When something doesn't fit, look first for what to take away. *Why:*
a patch is trapped heat (philosophy); added structure costs (CON-1) and hides the misfit (CON-6). *Gives way:* when
nothing removable explains the misfit. *Leaned on:* retiring the memory threshold (checkpoint 10); removing the crutches
in C26.

**PRN-6 · Prefer the same mechanism with different settings to a different mechanism.** A new region, level or kind of
world should be the engine again, not something new. *Why:* OPZ-3, CAP-9, CON-3 (general). *Gives way:* when the
evidence shows the old mechanism genuinely can't do it, which is also a reason to revisit PRN-1. *Leaned on:* the
abstract region as the same engine over recognised things (C53); the architecture theory (regions as one engine with a
few settings).

**PRN-3 · Let heat decide where effort goes.** Do work where something doesn't fit, not everywhere just in case. *Why:*
OPZ-2 (compute); CAP-7 (heat as a valve). *Gives way:* to rest (CAP-5), when the whole store needs reorganising.
*Leaned on:* the moving bar dropping only while a gap is open (C51, C54).

**PRN-4 · Settle locally first.** Heat is resolved as close to where it arises as possible; only what can't be settled
there spreads to other parts. *Why:* OPZ-2, and GOL-4 (regions settling each other) without every region reacting to
everything. *Gives way:* when settling locally would mask the misfit rather than resolve it (CON-6). *Leaned on:* the
second look, where the visual region re-reads its own misfit before the abstract region is involved (C55, C56); the
regulators theory.

**PRN-5 · Prefer what was lived to what was inferred.** When a memory of what happened and something worked out
disagree, trust the memory until new evidence says otherwise. *Why:* CON-8 (imagined is never stored as lived), and
trust. *Gives way:* to fresh evidence, never to a better-sounding inference. *Leaned on:* checking made-up routes against
what was lived (C46, C58).

## Today against the contract
Not part of the contract; kept here so the gap is visible.
- Small worlds only (up to 12 × 12, a dozen or so kinds of item); rest is slow beyond that: short of OPZ-2 and OPZ-5.
- Busy scenes stall learning (C33): short of GOL-1 in busy worlds.
- No machine yet: GOL-3 not started. Regions settling each other (GOL-4): sketches only.
- Declared choices in `docs/decisions/` and checkpoint 11 are places where CON-1 and CON-2 are not yet fully met.
- Bookkeeping in the core (CTR-2 DEF-11): fitting is competition (C75) but runs over a list of every unit, counted
  against every lit pixel; rest compares units as lists. Short of CON-19 and CON-18. Cells and segments exist in the core
  only as a layer for completion.

## For the owner to decide
1. The order of the goals and optimizations as priorities (proposed: heat, information, minimality, compute, scale),
   and what's missing.
2. The drafts (GOL-3, GOL-4, OPZ-5, CON-19) and the definitions, including cell, segment and assembly (DEF-12 to
   DEF-14).
3. The general-to-specific order of the constraints and capabilities (the most specific, CON-5, CON-9 and CAP-11,
   CAP-14, are now at the bottom of their lists), and whether any is really part of a more general one.
5. Whether the principles are the right six, in the right order, and whether each gives way to the right thing.
6. Whether the regulator purpose (serving real systems) belongs here or above the contract, as the why.
7. Then sign.
