# Brief: building AMP, AMX and AMT

This brief is for an agent picking up the build. It says **what is being built, why, and in what order**, explains the
ideas in enough detail to start with confidence, and points to where the detail lives. It was written at the end of a
long run of conversations between the owner and an assistant, so the repository holds a lot of history. **Part of your
job is to separate the current picture from the record of how it was reached.** Section 1 tells you how.

If something here conflicts with an older document, this brief and the `language/` folder win. If something here
conflicts with what the owner tells you, the owner wins. If you find a real contradiction, raise it rather than choosing.

---

## 0. The goal in one paragraph

The owner wants an engine that learns language, unsupervised and online, from text it reads once, and whose knowledge
can be **read directly**: explained (why it did something) and understood (what it knows). **The first milestone is for
it to be practically useful.** It should learn general English from ordinary text, then learn a specific domain from that
domain's documents, then complete what it reads in that domain. A person should be able to explore what it learnt about
the domain, with every piece linked back to the passages that taught it. Where its understanding is incomplete or
inconsistent, that should show for free, because incompletion is what the engine measures anyway. Everything below
serves that milestone.

---

## 1. How to read this repository

The repository is the owner's research record. It contains several earlier designs, many experiments and a lot of
theory, some of it superseded. Read it in this order, and treat the rest as background.

### Current: read these first

| Where | What it is |
|---|---|
| `docs/brief.md` | this brief |
| `language/README.md` | AMP's terms and ground rules; start with its **Terms** section |
| `language/walkthrough.md` | **the language step by step**, as typed into the interpreter and printed back (steps 1 to 9). The most important file after this one. |
| `language/operations.md` | the two root operations, invoke and resolve |
| `language/invoke.md`, `language/resolve.md` | what each operation does |
| `language/edges-and-gates.md`, `language/members-and-sets.md`, `language/assemblies.md` | the objects |
| `language/instructions.md` | the instruction set, the REPL and the three logs |
| `language/heat-and-learning.md` | heat as incompletion; loaded and stored |
| `language/open-and-deferred.md` | everything still open, in one list |
| `docs/contracts/system.md` (CTR-1) | goals, optimizations and constraints the system is held to. Several clauses are marked *draft*. |
| `docs/decisions/009-no-context-in-cells.md`, `docs/decisions/010-language-replaces-core.md` | the two decisions that shape the current design most |

### Current thinking: theory notes that are still live

In `docs/theories/`. Read these for the *why* behind the language:

| Note | Why it matters |
|---|---|
| `explainable-by-design.md` | AMP and AMX; explainability as structural; the record of changes; the vision of engineering with associative memory, and why it feels harder than deep learning |
| `understandable-by-design.md` | understandability, the open box, the domain-learning use case |
| `structure-over-strength.md` | no weights: reinforcement is more structure |
| `nothing-breaks.md`, `assemblies-first.md` | bonds and assemblies are never edited or removed during learning; assemblies are the main things; bonds live with the gate that receives them |
| `learned-computation.md` | writing is bonding, reading is completion; held operands waiting for operators |
| `categories-from-context.md` | how a category such as "animal" should form, implicitly and explicitly, with a test |
| `procedures-from-states-and-transitions.md` | how procedures live in AMP: frames chained by transitions, a population of one as a register, loops, counting, subroutines, flexible switching; with a hand-written first test |

### Background, superseded in part: use for context, not instructions

- `docs/theories/how-heat-restructures.md`: its breaking sections are superseded by `nothing-breaks.md`.
- `docs/theories/heat-as-the-source.md`, `units-flow-and-bond-states.md`, `the-tilting-landscape.md`: exploratory
  pictures (phantom assemblies, lattices, energy units, a tilting landscape). They contain useful intuitions, such as heat
  as incompletion, held context and the refractory period, but **none of their mechanics is in the language**. Don't
  build from them.
- All other theory notes predate the current language.
- `docs/state.md`, `docs/philosophy.md`, `docs/principles.md`, `docs/checkpoints/`: the project's history and its
  lasting lessons. Read `philosophy.md` once. The principles of one currency, comparing rather than averaging, and
  completion carry through, but the mechanisms they describe are the old engine's.

### History only

- `experiments/`: about 95 sketches from earlier designs. Many import a deleted core (`src/`) and no longer run.
- `docs/architecture.md`, `docs/engine-api.md`, `docs/reference-models/`: they describe the **retired core**.
- `sandbox/`: a workbench for the retired core. It no longer runs.

### Words to watch

- **Retired:** "machine" and "automaton". Older notes use them freely. What runs AMP is **the engine**, and everything it
  holds is **the memory**.
- **"Memory"** never means RAM. Parts of the memory are **loaded** (in RAM) or **stored** (on disk).
- **"Latch"**, **"switch"**, **"unit"**, **"phantom"** and **"landscape"** appear in theory notes but are **not** in the
  language. Don't build them. Temporary binding, which latches were meant for, now comes from **holding plus
  competition**: a population with room for one member acts as a register
  (`docs/theories/procedures-from-states-and-transitions.md` §3).
- **"Frame"** is kept as a descriptive word, not a construct. A frame is a transition with alternatives at one or more
  steps: an ordinary assembly.
- **Don't coin terms.** The owner agrees every term before it is used, so propose names to the owner instead of
  inventing them in code, docs or the interface.

---

## 2. What is being built

Three applications sharing **one engine library**, written in **Go**:

| Application | For | What it does |
|---|---|---|
| **AMP** (Associative Memory Programming) | the engine itself | the engine library, the interpreter for the notation, and a **REPL** |
| **AMX** (Associative Memory Examination) | **agents** | a command-line tool to run test worlds, query structure, trace runs, name assemblies by invoking them, and score results. Output in AMP notation and in a machine-readable form. |
| **AMT** (Associative Memory Terminal) | **people** | a terminal interface built with Bubble Tea: watch a run, browse assemblies, and explore what has been learnt, linked back to sources |

**AMX and AMT only ever read from the engine.** Examination never feeds back into learning. Names given by AMX are
for reading only. This rule is what keeps results honest (see `docs/theories/explainable-by-design.md` §8).

**Why Go:** fast compilation while the design is still moving; `uint64` bit rows with `math/bits` popcount for the
set operations; easy to keep allocation out of inner loops. Rust stays an option later, if speed ever demands it, since
the language is the specification.

**The layout** (started; `cmd/amx`, `cmd/amt` and `worlds` don't exist yet):

```
amp/                 the Go module
  engine/            the library: the data objects (populations, communities, assemblies …) and the operations
                     on them (invoke, resolve); knows nothing about text
  interpreter/       reads a line of AMP, carries it out on the engine, prints the result back in AMP
    testdata/        transcripts: lines typed at the prompt and the exact output expected, run as tests
  cmd/amp/           the REPL and script runner
  cmd/amx/           the agent CLI
  cmd/amt/           the Bubble Tea interface
  worlds/            AMX test worlds and their generators
```

The notation is the language as written, so reading and printing it is the interpreter's job, not a separate package.
Each walkthrough step is added as a transcript first, then built until it passes.

The owner has a coding style guide for AI agents (domain modelling, readability, minimalism). Ask for it before writing
code.

---

## 3. The engine, in enough detail to start

This summarises `language/`. Where it is terse, the walkthrough has worked examples with exact expected output.

### 3.1 Objects

- **Population**: a fixed group of members, declared once (`c = population 8`). For text, a population stands for a
  character. Members are numbered **within** their population (`c{3}`).
- **Member**: the smallest thing, on or off. **Members are private to the engine.** The world speaks in populations:
  input arrives as populations, output leaves as populations, and which member takes part is the engine's own business.
  `inspect` gives deeper access for examination.
- **Community**: a fixed grouping of populations.
- **Assembly**: a unit the engine treats as one thing. It has two shapes, decided by the shape of its bonds, not by a
  label:
  - a **state**: cyclic, with bonds pointing at each other. Any part brings back the rest, and once complete it
    **reverberates**, staying on until competition changes it. `⟨c, a, t⟩`.
  - a **transition**: a chain, with bonds pointing forwards. It carries activity on to what comes next, one moment
    later. `c -> a -> t`.
- **Bond**: always directed, binary, stored **with the gate that receives it**. A member keeps no list of where it
  points.
- **Gate**: how a member decides to come on: "enough of these sources are active". Thresholds are declared: a
  transition's gate opens on **one** source, and a state's needs **agreement** (two by default). A member's full
  definition is the **or of its gates**, each labelled with the assembly it came from (walkthrough step 6).
- **Alternatives** `a | o`: on a chain, things that compete for one step. The old idea of a "slot" is just this.
- **Keys** `x & k`: x is on the path and k is a condition on x's gate. All keys are required, along with the step
  before. A named set of alternatives is a **type**; a name used as a key is **context**.

### 3.2 Two operations

- **invoke** reads. Gates open until nothing new opens. It returns a **completion**, which is **graded**
  (`complete 3 of 3`, `2 of 3`), or an **incompletion**, the part that's missing. It never changes structure.
  - **Competition** happens within a population (members compete for places) and across populations (whole assemblies
    win or lose together). Most support wins, a true tie is **held**, and a part is never a rival of the whole it
    belongs to. Each population has a **budget** of how many members may be active at once.
  - **Holding** comes only from reverberation. There is **no instruction that keeps something on**. That would be
    puppeteering.
  - **Timing (proposed):** every bond acts one moment later.
- **resolve** learns. It turns an incompletion into new structure. **It always does the full mechanism**: compare the
  incompletion with everything it touches (what is held, and what is loaded and shares members with it), then form
  whichever shapes that calls for, together:
  - **composition**: a new whole from known parts, the union plus the bonds that join it;
  - **abstraction**: the intersection of overlapping things, as a new assembly;
  - **decomposition**: the parts that vary, as alternatives beside the whole;
  - **sequence**: outward bonds, as part of the above, never instead of them.

  **Economy is part of resolving correctly:** the most complete explanation with the least added, so reuse what exists
  first. **Never a cheap stand-in.** An early description that collapsed resolve to "bond one character to the next"
  was a mistake, and is recorded in the walkthrough so it isn't repeated.
- **Composing them** is a declared **policy**: invoke only; invoke then resolve; resolve inside the loop; or resolve
  alone over stored assemblies. **For reading text: resolve inside the loop**, every moment, acting only where invoke
  can't complete, and taking in **what is currently held** as context. There is no fixed window or chunk size. The
  resolve loops inside one invocation **are the online learning**: slow at first, faster as more is predicted.

### 3.3 Heat is incompletion

Without metaphor, heat is what invoke couldn't complete, counted three ways (`language/heat-and-learning.md`):

- **missing**: how much of a partly active assembly isn't active;
- **unexplained**: active members no assembly accounts for;
- **unsettled**: ties being held. Counted, but resolve doesn't act on them, because only more evidence settles a tie.

This is what lets the milestone flag what's incomplete for free: incompletion is always measured.

### 3.4 Rules about structure

- **Nothing breaks during learning.** Bonds and assemblies are never edited or removed by learning. New structure forms
  **beside** old. Mistakes are outcompeted, not erased.
- **Assemblies are immutable.** One known consequence is still open: how a chain grows part-way through a word.
- **Loaded and stored.** Assemblies move between RAM and disk by demand, as whole units. This can wait until memory size
  makes it necessary. Deleting cold structure is a **storage policy**, never learning.
- **No counts on bonds.** If counts were ever used to compress, a count only summarises distinct existing structures,
  each with its own origin, and is never incremented by repetition.

### 3.5 Source and compiled form

For running, invoke reduces to a row of active bits, each member's condition, and one selection per population: a
threshold Boolean network. Keep two layers: the **source** (assemblies, which resolve and explanations work on) and the
**compiled form** (bits and conditions, which invoke runs). When resolve forms something, recompile only the members
affected (walkthrough step 6).

---

## 4. Non-negotiables

These come from the contract (CTR-1, `docs/contracts/system.md`) and from repeated decisions with the owner. If a
design needs one broken, stop and ask.

1. **Binary.** Members are on or off, and bonds exist or don't. **No weights, no strengths, no counts that learn.**
2. **No randomness.** Runs are deterministic and replayable. Ties are held, not broken at random. Where a fixed choice is
   unavoidable, declare it.
3. **No puppeteering.** Nothing outside steers the dynamics: no forced activity, no tuned thresholds to pass a test, no
   hand-picked order presented as learning. Text source and order are **declared per run**.
4. **Nothing without a recorded cause** (CON-20, draft). Every change to structure and every activation has a cause
   stated in AMP.
5. **Examination never feeds back.** AMX and AMT read; they never write into the memory.
6. **The world speaks in populations.** Members stay private.
7. **One rule for keeping a change** (CON-1): keep it only if it lowers the cost. Here that means the incompletion it
   removes outweighs the structure it adds (§3.2, economy). How "structure added" is counted is still open (§7).
8. **Set vocabulary.** Union, intersection, difference, symmetric difference, subset, count. Borrow nothing else from
   mathematics.
9. **Predictions before runs.** Every AMX world has its predictions, scoring and "what could fool us" written before it
   runs, and a failed prediction is reported as a failure.

---

## 5. Explainability and understandability from day one

The owner wants a glass box from the first commit, not added later.

- **Three logs** (`language/instructions.md`): the **command log** (what was asked), the **record of changes** (every
  structure formed, loaded, stored or named, with its cause; always on), and the **trace** (every moment; on per run, or
  regenerated by replay). With no randomness, the command log plus the starting state **replays** any run exactly.
- **Everything prints in AMP.** The interpreter's output, the logs and the trace use the language's own notation and
  instruction mnemonics, so a run reads as the language.
- **`WHY`** answers which gate opened a member and from what.
- **Naming by invoking:** invoke an unfamiliar assembly, read what it completes to, and name it. Names are display-only.
- **Sources:** every assembly records the input that formed it, so concepts link back to passages.
- **AMT vocabulary:** only the language's terms and AMX's names. **No labels the language hasn't defined.** An early
  mockup used "traits", which isn't a term, and that was wrong.
- **Naming at scale, and reading the engine's workings.** Naming every assembly by hand won't keep up, so an agent
  working with the owner proposes names through AMX, by invoking: find the input that completes an assembly best and
  name it from that ("cat", "dog" and "bird" all invoking one assembly suggests "animal"). **Every name carries its
  evidence,** and AMT shows it on request. The payoff is that AMT can show a run, including a procedure, in words:
  what is held, what is being associated, which states and transitions are active ("held: carrying one, next
  column"). **That readout is our labels laid over what the engine does, not the engine thinking in English.** So
  AMT must show unnamed and weakly evidenced assemblies plainly, as gaps, and never hide them to make the readout
  look tidier. A wrong name is worse than none, because it makes a wrong run look sensible.

---

## 6. Data layout

- Sets as rows of `uint64`, with intersection, union and count as AND, OR and popcount.
- Gates as short guest lists. "At least k of these" checked bit-parallel across many gates at once (walkthrough
  step 9's log; the "seen once, seen twice" trick generalises).
- Assemblies as the units of storage and of the record of changes. Members as indices within populations.
- No allocation in the inner loop, so the garbage collector stays out of the way.

---

## 7. The plan

### Phase 1: the reading engine on hand-written structure (buildable now)

- **Engine:** populations, communities, states, transitions, alternatives, keys, gates and member definitions; invoke
  with competition, the per-population budget, held ties, graded completion; the three logs; replay.
- **Notation:** parse and print the walkthrough's notation.
- **REPL:** declarations and commands, stepping, `inspect`, `why`, invoke-only policy.
- **AMX, minimal:** run a script, query an assembly, show the trace, name by invoking. Machine-readable output.
- **AMT, first views:** a run view (populations lighting as you step, the log) and an assembly browser.
- **Tests:** the walkthrough's examples with their exact expected output. "cat" forward completion, backward needing
  two clues, the missing middle, the dog/day/night tie and its resolution by context.
- **A hand-written procedure**, to test that the representation can hold a method and not only a pattern: a counting
  loop that hands off at ten, a world-keyed loop ("stir until thick"), a switch between two recipes that share steps, and a
  subroutine reused by two callers. Predictions are in `docs/theories/procedures-from-states-and-transitions.md` §10.
  This run will force two decisions, which go to the owner: **arrivals versus held states** (a count must advance once per
  arrival of a tick, not once per moment it is on) and **returning to the right caller**.

### Phase 2: resolve (blocked on owner decisions)

Before building resolve, these need the owner's answers (`language/open-and-deferred.md`):

1. **What exactly forms from an incompletion**, member by member, and which held context comes along.
2. **How the engine chooses a member** inside a population when something forms.
3. **How a chain grows mid-sequence** when assemblies are immutable.
4. **How "least added" is counted** for the economy rule.

Also from the procedures work: whether transitions act on **arrivals** (change) rather than on what is held, how a
subroutine **returns** to the right caller, and how a loop that never exits is **let go**.

Smaller defaults to settle along the way: the population budget, the default state threshold, how to address a single
gate (proposed `barks{2}#4`), and whether `resolve` must always name what it works on.

Then the AMX ladder, each world with predictions fixed first: words from letters; noisy words ("cxt"); same letters in
different contexts ("cat"/"cot"); the categories test (`docs/theories/categories-from-context.md`).

### Phase 3: general English

Read ordinary text with resolve in the loop. Suggested sources, simplest first: a slice of **TinyStories** (small
vocabulary, CDLA-Sharing-1.0; note it is model-generated text), then the **BabyLM** 10M-word corpus (developmentally
plausible English; check each component's licence), then optionally Simple English Wikipedia and public-domain
children's books. **Measure three lines:** completion on what is read; completion on **held-out** text with resolve
switched off (the real evidence); and structure size against text read (it should grow more slowly than the text).

### Phase 4: a domain, and the milestone

Read a small domain corpus (a few dozen pages on one topic) on top of the English foundation. Build AMT's
**explorer**: start at a concept, see what it is grouped with, the assemblies it appears in, related things it isn't
part of (each with *why*, read from the structure), and jump to the source passages. Show where the engine's
understanding is **incomplete** (graded completion, unexplained input) or **unsettled** (held ties, rival readings).
**The milestone is reached when a person can learn the domain faster with the explorer than with the documents alone.**
Write the questions down before the map is built.

---

## 8. Working with the owner

- **Plain, everyday language.** Keep the project's jargon light, put words the engine reads in quotes ("cat"), and
  explain before showing notation.
- **Real pushback.** The owner wants disagreement where it's warranted, not agreement. Be wary of building things that
  just confirm what was imagined.
- **Agree terms first.** Propose names, don't invent them.
- **Detailed write-ups**, without filler, for anything recorded.
- **Visual.** The owner learns best from visuals and step-by-step interactive views. Explain them as a walkthrough.
- **Step by step.** The language was built one step at a time with the owner, and that is the pace to keep: show what
  you'd type and what it prints, then ask one question.
- **Commits** go on `main`, when the owner asks.

---

## 9. Where to look for more

| Topic | File |
|---|---|
| The language, step by step | `language/walkthrough.md` |
| Instruction set, REPL, logs | `language/instructions.md` |
| Everything open | `language/open-and-deferred.md` |
| Goals and constraints | `docs/contracts/system.md` |
| Why no weights | `docs/theories/structure-over-strength.md` |
| Why nothing breaks; assemblies first | `docs/theories/nothing-breaks.md`, `docs/theories/assemblies-first.md` |
| Explainability, AMX's test worlds and honesty rules | `docs/theories/explainable-by-design.md` |
| Understandability, the explorer, the domain use case | `docs/theories/understandable-by-design.md` |
| The first real test of learning | `docs/theories/categories-from-context.md` |
| Procedures, loops, counting, subroutines | `docs/theories/procedures-from-states-and-transitions.md` |
| Learned computation | `docs/theories/learned-computation.md` |
| Lasting lessons from the old engine | `docs/philosophy.md`, `docs/checkpoints/` |
| No context in cells | `docs/decisions/009-no-context-in-cells.md` |
