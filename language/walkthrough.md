# Walkthrough: AMP step by step

The language as it would be typed into the interpreter, one step at a time, in the order the owner and the assistant
went through it. Each step shows what is typed, what the interpreter prints back (always in AMP, so a run reads like the
language), and what was decided. The other pages hold the reference detail; this page is the order to learn it in.

Everything here is **provisional notation** until there is an interpreter. The decisions are agreed; the exact symbols
may still change.

---

## Step 1 · Populations and members

A **population** is a fixed group of members, declared once. It doesn't change while the engine runs. For text, a
population stands for a letter:

```
c = population 8
a = population 8
t = population 8
```

```
c: 8 members, c{1..8}, all individuals
a: 8 members, a{1..8}, all individuals
t: 8 members, t{1..8}, all individuals
```

A **community** is a fixed grouping of populations:

```
letters = community c, a, t
```

```
letters: c, a, t (24 members)
```

**Decided: member numbers are local to their population.** `c{3}` and `a{3}` are different members, and a member is
always written with its population. This follows the rule that a name followed by braces means those members of that
thing. "Individuals" means none of them belongs to an assembly yet.

---

## Step 2 · Invoking, at the population level

**Decided: the world speaks to the engine in populations, not members.** What comes in is a population ("c"), and what
comes out is a population by default. Which member inside a population takes part is the engine's own business,
decided by its own workings, which the world doesn't know and shouldn't. For example, the outside world never chooses
which individual becomes part of an assembly. This is also what lets context live inside a population: the "a" in "cat"
and the "a" in "bat" can be different members of the same population.

**Decided: braces for together, commas for one after another.**

```
invoke {c, a, t}         all three in the same moment
invoke c, a, t           c, then a, then t, a moment apart
```

On a fresh engine, the second prints:

```
moment 1   c        incomplete   heat !c
moment 2   a        incomplete   heat !a
moment 3   t        incomplete   heat !t
```

Nothing predicted any of them, so each moment leaves an incompletion, marked hot with `!`. Invoking alone learns
nothing.

**Decided (the owner): moments count on across invokes.** The memory has one clock for its whole life, so every moment
has its own number, which the record of changes, the trace and `why` can point to. A second `invoke` after this one
starts at moment 4, not moment 1, and a saved memory carries on from where it stopped. Later examples on this page
number from 1 for readability.

**A deeper level of access, not the default:**

```
inspect c
```

```
c: 8 members; active: all 8 (unexpected input, no member chosen yet)
```

**Decided (the owner): input a population didn't expect turns all its members on**, because nothing has chosen a
member yet. Expected input turns on only the member the context points to. Numenta's columns behave this way. It is
internal to the engine, not part of the language's surface.

---

## Step 3 · Resolving what invoke left

Resolving is a separate operation, run on what invoke left:

```
invoke c, a, t
resolve
```

```
moment 1   c        incomplete   heat !c
moment 2   a        incomplete   heat !a
moment 3   t        incomplete   heat !t

resolve    from heat !c, !a, !t
           forms #1 = ⟨c, a, t⟩      nothing accounted for them together
                     inward: c <-> a, a <-> t, c <-> t
           forms #2 = c -> a -> t     a followed c, t followed a, unpredicted
           heat 3 -> 0
```

- **This is the full resolve on a fresh engine.** With nothing stored, there is nothing to compare with, so the most
  complete explanation is the whole and its order. Once there is something to compare with, resolve does more (step 8).
- **Every forming line gives its cause**, so the record of changes reads like the run (CTR-1 CON-20, draft).
- The interpreter names new assemblies `#1`, `#2` until something gives them names.
- Which members inside `c`, `a` and `t` carry this is hidden unless you `inspect`.
- **Decided (the owner): members are handed out in order.** Each population gives a new assembly its next member,
  starting at the first: `c{1}`, then `c{2}`, and so on, so individuals are used up in order. Once every member has
  been used, it goes round again from `c{1}`, so later assemblies share members with earlier ones. Kept simple on
  purpose; a cleverer choice can replace it later.

Then invoking part of it shows whether anything was learnt:

```
invoke c
```

```
moment 1   c
moment 2   +a           invoked by c
moment 3   +t           invoked by a
complete   #1 ⟨c, a, t⟩   3 of 3
```

The `+` marks what the engine brought back itself, in order, one moment at a time. This is the behaviour of "hello
there" being completed from "hello".

**Open: the form of `resolve`.** Should `resolve` on its own mean "resolve the last incompletion", or should it always
say what it works on (`resolve last`, or `resolve #1, #2` to compare stored assemblies)? The explicit form makes the
two kinds of resolving, from the world and from memory, visibly different in the record.

---

## Step 4 · States and transitions

**What prompted it.** The owner noticed that `c -> a -> t` doesn't point back on itself, so by the earlier definition
(members pointing at each other, a cycle) it isn't an assembly. The assistant had printed the whole `#1` without its
inward bonds, which is why it looked that way. Resolving forms **two** structures, of two shapes:

| | Shape | What it does | Answers |
|---|---|---|---|
| **state** | cyclic: inward bonds, members pointing at each other | any part brings back the rest; once complete it **holds** (reverberates) | "what is this?" |
| **transition** | chain: outward bonds, pointing forwards only | carries activity on to what comes next, a moment later | "what comes next?" |

**Decided: assembly is a looser idea.** An assembly is a unit the engine treats as one thing, able to be named,
compared, composed and abstracted. States and transitions are both assemblies. What makes one a state and the other a
transition isn't a label. It is the shape of its bonds, loops or chains, so the rule holds that dynamics come from the
structure, not from a bond type. It matches the project's history: C101 kept held states and transitions apart, as the
old engine did.

**Why both.**
- With only the chain, "c" brings back "a, t" in order, but "c" and "t" together can't bring back the missing middle.
- With only the whole, "c" and "t" bring back "a", but nothing knows the order, so "cat" and "act" are the same.
- With both, you get recall from any part and the right order.

**Decided: forwards is more prominent, by structure, not strength.** Without some asymmetry, the cyclic whole would pull
backwards as easily as forwards. The forward link from "c" to "a" exists twice, once in the whole and once in the chain.
The backward link exists once, in the whole. So the next letter always has more ways in than the previous one, and more
support wins.

**The declared choice it rests on:** a transition's gate opens on **one** source; a state's gate needs **agreement**
(two, by default). A transition opens on one; a state needs agreement.

```
invoke c
moment 2   +a     chain c -> a opens it; the whole only presses it (1 of 2)
moment 3   +t     chain a -> t, and the whole now has c and a (2 of 2)
complete   #1 ⟨c, a, t⟩   3 of 3, in order
```

```
invoke t
moment 1   t      the whole presses c and a (1 of 2 each); nothing leads back from t
incomplete #1 ⟨c, a, t⟩   1 of 3
```

```
invoke {c, t}
moment 2   +a     the whole: c and t, 2 of 2
complete   #1 ⟨c, a, t⟩   3 of 3
```

Forwards flows freely, backwards needs more than one clue, and a missing middle is filled from both ends.

### Completion is graded

**Decided (the owner):** completion isn't all or nothing. As things get bigger, there will rarely be 100% or 0%. How
complete an assembly is is simply how much of it is active, `|assembly ∩ active|` out of `|assembly|`, so it falls out
of the one check. Gates still decide yes or no. What invoke reports is a degree: `complete 3 of 3`, `1 of 3`,
`11 of 14`. The incompletion is the part that's missing.

### No counts on bonds

**The owner's concern:** with prominence coming from extra bonds, RAM and performance could suffer from duplicate
bonds. Could a count of 2 be held against a bond instead?

**The answer (assistant), kept as a standing point:** there is nothing duplicated in storage. Bonds live in the gate that
receives them, and "a" has two separate gates, one belonging to the whole and one to the chain. "c" appears once on each
guest list: one bit in one gate and one bit in another. Prominence comes from two different gates, of two separate
origins, both supporting "a". With bit rows the cost is a bit per gate. A count would work mechanically, but the moment
anything can raise it, such as seeing "c, a" again, it is a weight. **If counts were ever used to compress, the rule is
strict: a count only summarises distinct structures that already exist, each with its own origin in the record, and is
never incremented by repetition.** With per-gate bits there is no need, so bonds stay binary.

---

## Step 5 · A second word, and what the two share

The engine knows "cat" as `#1 = ⟨c, a, t⟩` (the state) and `#2 = c -> a -> t` (the transition). It meets "cot":

```
o = population 8
invoke c, o, t
```

```
moment 1   c        #2 expects a next
moment 2   o        expected a (#2 c -> a); o was not expected
moment 3   t        #1 presses: c and t present, a missing
incomplete #1 ⟨c, a, t⟩   2 of 3, missing a
           heat !o, and the steps c -> o, o -> t unpredicted
```

That is a misfit and a gap together. Resolving from the world forms "cot" beside "cat", with nothing about "cat"
changed:

```
resolve
```

```
resolve    from heat !o, and c -> o, o -> t
           forms #3 = ⟨c, o, t⟩
           forms #4 = c -> o -> t
           heat -> 0
```

Comparing what is stored gives the rest:

```
resolve #1, #3
```

```
           #1 ∩ #3 = {c, t}       forms #5 = ⟨#1 ∩ #3⟩
           #1 △ #3 = {a, o}       forms #6 = c -> a | o -> t
```

**Decided: set theory's words.** **Intersection** (`∩`), **difference** (`−`, what one has that the other doesn't) and
**symmetric difference** (`△`, everything in one but not both). No separate words such as "shared", "differ" or
"core": `#5` is simply the intersection of `#1` and `#3`.

**Decided: alternatives are written with competition, `|`.** `c -> a | o -> t` reads "c, then a or o, then t". It
belongs on the chain, because only transitions have positions. Braces can't be used for it, because braces mean
*together*. The things that can go there are **alternatives**. The place where they compete gets no name of its own: it
is just a step where `|` appears.

**On the word "frame".** Kept as a descriptive hook, not a construct: a frame is a transition with alternatives at one or
more steps, an ordinary assembly. Frames compose, decompose and abstract like any other assembly, and are compared only
with frames they overlap.

**What this reveals (the owner).** Frames and slots were never extra machinery. The old "kind", a form with one place and
the fillers that can go there, is a step in a chain where alternatives compete. Strictly it is an *exclusive* or,
because only one wins.

### Keys: `&`, value first

**Decided:** in `x & k1 & k2`, the first is the **value**, the thing on the path that the flow goes through. Everything
after it is a **key**, a condition on that value's gate. A value with keys opens when the step before it and **all** its
keys are active.

```
c -> (a & animals | o & nursery) -> t     a opens only with animals held; o only with nursery
c -> (a & animals & mammals | o) -> t     a needs both animals and mammals
c -> a -> t & d                           t opens only with d held as well
```

`&` always attaches to the value just before it, never to the next step. A key can be **still active from earlier**: the
gate only asks whether its sources are active now, not when each became active. A key stays active only through the
dynamics: it was invoked earlier and, being a state, its own inward bonds keep it on. Nothing outside holds it. That is the learned-computation pattern, one
thing held and one arriving, and how C101 used earlier context.

```
moment 0   d              invoked earlier; still on (its own state reverberates)
moment 1   c
moment 2   +a             invoked by c
moment 3   +t             a, and key d, still on since moment 0
```

**Notation now settled:**

| Written | Means |
|---|---|
| `a \| o` | alternatives on the path: one wins |
| `{a, d}` | together, in one moment |
| `x & k` | value x, opening only when key k is also active |

(`&` was briefly used for "joined by the next step's gate", and square brackets and `when` were considered for keys. Both
were dropped for the value-first rule. `+` was ruled out for this because it already marks what is recalled.)

### Types and context

A named set of alternatives is a **type**. A name used as a key is **context**. They are different roles:

```
vowel = a | o                    a type: what can go in a step
c -> vowel -> t                  c, then any vowel, then t
c -> (a & animals | o & nursery) -> t      animals, nursery: context, deciding which wins
```

A type need not be hand-written: `vowel` could be the name given to `#1 △ #3`, which resolve found by comparing "cat"
and "cot". The type system comes out of comparison.

---

## Step 6 · A member's definition

**The owner's question:** what does a member's definition look like, given that each part of it comes from somewhere
(a transition, a state, the alternatives)?

**Decided: a member's definition is an or of its gates.** A member can sit in several structures, so it has several
gates, and it comes on if any opens. Within a gate the sources work together. That is the standard "sum of products" form
in logic. Each term is one gate, labelled with where it formed.

An example with word populations, for readability. The sentences are "the dog barks" (by day), "the dog sleeps" (at night)
and "the cat meows".

**The path view (how the flow goes):**

```
the -> dog | cat
dog -> barks & day | sleeps & night
cat -> meows
```

**The member view (how each thing is recalled):**

```
dog    =  the                        from the -> dog | cat
       |  {the, barks} >= 2          from the whole ⟨the, dog, barks⟩
       |  {the, sleeps} >= 2         from the whole ⟨the, dog, sleeps⟩

barks  =  dog & day                  from dog -> barks & day
       |  {the, dog} >= 2            from the whole ⟨the, dog, barks⟩

sleeps =  dog & night                from dog -> sleeps & night
       |  {the, dog} >= 2            from the whole ⟨the, dog, sleeps⟩
```

**Reading them side by side.** The path line `dog -> barks & day | sleeps & night` becomes the first term of both `barks`
and `sleeps`. The wholes give the "enough of these" terms. Without context, `barks` and `sleeps` both have {the, dog}
satisfied, so they tie and the tie is held: the engine genuinely doesn't know. With day held, `barks` has two terms
satisfied against one, so it wins. **The path view is what you write or what resolve forms; the member view is what
`inspect` shows. They are the same structure, read from the two ends.**

**Alternatives aren't in a member's own definition.** `a | o` compete, so "o" is a rival to "a", not a way of recalling
it. Competition shows in the population, not the member.

### Fuzzy underneath, readable on top

**The owner's concern:** this looks very symbolic and structured, when he expected something fuzzier.

**The answer:** the examples give each thing one member and are perfectly clean. The fuzziness is in what they barely use:
"enough of", not "all of"; graded completion; competition by best support; and many members per thing. Realistically:

```
barks  =  {dog₁..dog₆} >= 4 & {day₁..day₅} >= 3       from #12
       |  {the₁, the₂, dog₁..dog₆} >= 5               from #4
```

Here "dog" is six members, any four of which will do, so a misspelt or partly heard "dog" still brings back "barks".
Definitions formed by resolve would be longer, overlapping and messy, closer to a learnt network than a grammar. **The
engine works in overlaps and thresholds; the notation is how it explains itself.** The risk to guard against is not that
it looks symbolic, but that clean notation tempts us into hand-writing tidy grammars and calling that learning.

### Source and compiled form

**The owner's playful question:** does it all compile down to active members and each member's conditional, a dynamic
interplay of if-thens?

**Mostly, for running.** Invoke reduces to a row of active bits, each member's condition (an or of "enough of these"),
and setting bits until nothing changes. That is a threshold Boolean network, close to how rule engines fire rules until
nothing new fires. Stuart Kauffman showed networks like this settle into attractors and cycles. **Two things need more
than that:** competition (a selection within each population, and whole assemblies winning or losing together), and
learning (resolve works on assemblies, and the record traces every rule to its origin). So there are two layers:

- **the source**: assemblies and structures, which resolve works on, explanations point to and storage moves;
- **the compiled form**: bits, each member's condition, and one selection per population, which is what invoke runs.

When resolve forms something, it updates the source and recompiles only the members affected. A close cousin is
**Datalog**, a rule language evaluated by applying rules until nothing new appears. Its tidy one-rule-per-line discipline,
not its syntax, is a good model for member definitions.

---

## Step 7 · Asking an assembly what it is

**The owner's idea.** Handed a raw gate or assembly, it may not be clear what it represents. To find out, invoke it: it
completes, and the output, read at the population level, says what it is. If `#12` completes to "c, a, t", it is "cat".
AMX can then attach a name, and from then on traces say `cat` instead of `#12`. An agent working with AMP can find an
assembly it doesn't recognise, invoke it, read it, name it, and carry on.

```
invoke #12
complete   c, a, t
name #12 cat
```

- **Abstract assemblies describe themselves too.** Invoking the intersection of "cat" and "cot" gives `c (a | o) t`, which
  shows it is a frame with alternatives, not a word.
- **Meaning depends on context.** A name should come from what an assembly completes to with no context. Where context
  changes the result, that is recorded beside the name.
- **Names are for reading only.** They never feed back into the engine.

---

## Step 8 · Reading text: resolving in the loop

**Decided (the owner): resolve runs inside the invocation loop when reading text.** It fits the goal of learning online,
and the more it learns, the quicker it gets.

**How often: every moment, acting only where invoke can't complete.** When a character was predicted, there is
nothing to resolve, so nothing happens. When it wasn't, that moment's incompletion is resolved at once. No schedule, no
chunk size, no number.

**How much: the full mechanism, every time (decided).** Resolving is never a cheap stand-in, such as just bonding one
character to the next. Every time invoke can't complete, resolve does everything it is for. It compares the incompletion
with everything it touches (what is held, and what is loaded and shares members with it), then forms whichever shapes that
comparison calls for together: composition, abstraction, decomposition, and sequence only as part of them. **Correctness
and completeness every time:** the aim is to explain the incompletion as fully as possible in that moment, not to make the
count go to zero. An earlier description in this conversation collapsed resolve to its cheapest shape. That was a
mistake, and is recorded so it isn't repeated.

**Economy is part of resolving correctly.** The best resolution is the most complete explanation with the least added.
Reusing a known part, or joining an existing frame as a new alternative, explains more while adding less. So "build only
what pays" isn't a separate rule bolted on: resolving properly means preferring what already exists over forming
anything new.

**This is the online learning.** The resolve loops inside one invocation are how the engine learns. Like anything that
learns, it is slow at first: early on almost nothing is predicted, so almost every moment resolves. As it learns, more is
predicted, fewer moments need resolving, and it speeds up.

**How much it takes in: what is currently held.** Resolving the current character alone could only form tiny pieces. A
fixed "how far back" would bring a chunk size in by another door. Instead, the context a resolve takes in is whatever is
held now (reverberating states), limited by each population's budget, not by a chosen window. The window falls out of
the dynamics.

**Across time, mostly for free.** Resolve isn't comparing an input with itself. When "cot" arrives months after "cat",
reading "c" invokes whatever is loaded that starts with "c", including "cat", which predicts "a". "o" arriving instead is
a comparison between new and old, made by reading itself. The deliberate quiet-time comparison (`resolve #1, #3`) covers
things that never met while reading, and is **limited to assemblies that share members**, through the pivot points. The
old engine compared every stored assembly with every other, which hit the wall on busy scenes (C33).

**What one sentence can teach.** Reading "the cat sat on the mat" with full resolve in the loop:
- the second "the" is recognised as a repeat the moment it starts, because "t, h" predicts "e";
- when "sat" arrives, comparing it with the just-formed "cat" forms their intersection and the alternatives `c | s` at
  once, not in a later quiet period;
- by "mat", the frame is already there, and "m" simply joins it: `(c | s | m) -> a -> t`, an abstraction from one
  sentence;
- spaces break the chain into word-sized pieces.

More text confirms or outgrows what was formed.

---

## Step 9 · Instructions, the REPL and the logs

The notation so far is **declarative**: it says what exists. Beneath it sits an **instruction set**, which is
imperative and says what to do. They are two registers of one language, like a schema and a query language. Every
declaration maps onto instructions: `⟨c, a, t⟩` is an `ASML`, `c -> a -> t` a `CHN`, `a & animals` a `GATE`. The
reference list is on [instructions](instructions.md).

**A REPL** is where the two meet: declarations for structure, commands for actions, one line at a time.

**Decided (the owner): in the REPL a state is typed and printed with ordinary angle brackets, `<c, a, t>`,** because
`⟨ ⟩` aren't on a keyboard. `⟨ ⟩` is still accepted, so lines can be pasted from these pages, and the pages keep it as
the typeset form. Everything printed can be typed back in.

```
amp> cat = ⟨c, a, t⟩ ; c -> a -> t
amp> cot = ⟨c, o, t⟩ ; c -> o -> t
amp> invoke {c, t}
moment 2   tie: cat (2 of 3) | cot (2 of 3), held
incomplete
amp> invoke a
moment 3   cat wins: cat 3 of 3; cot 2 of 3
amp> why cat
cat: 3 of 3: c, t, then a, all from input
```

**Every run is logged, as instructions**, each with what it found or made, so the log and the trace are written in the
same language. Indentation shows what a resolve ran inside itself. One command, `invoke c, o, t` with "cat" known and
resolve in the loop, might expand to:

```
; moment 2
  SEQ   o                       o active
  INV   o                       a predicted but o arrived: incomplete
  RSLV  last                    compare with what it touches: #1, #2 (share c)
    DIFF  {o},{a}               {o}           o not accounted for
    CHN   c,a|o                 formed #3 = c -> a | o   o joins as an alternative to a
; moment 3
  SEQ   t
  INV   t                       #1 ⟨c, a, t⟩ 2 of 3, a missing
  RSLV  last
    ASML  ⟨c,o,t⟩               formed #5 = ⟨c, o, t⟩
    CAP   #1,#5                 {c, t}
    SYMD  #1,#5                 {a, o}
    ASML  ⟨#1 ∩ #5⟩             formed #6 = ⟨c, t⟩
    CHN   c,a|o,t               formed #7 = c -> a | o -> t
```

**A gap the log exposed.** At moment 2 resolve forms `c -> a | o`, and at moment 3 it needs `c -> a | o -> t`, which
would mean extending an assembly, and assemblies are immutable. Either the longer chain forms beside the short one, which
then loses, or a sequence's forming completes as the sequence settles. Open.

---

## Next

What exactly forms from an incompletion, member by member; how the engine chooses a member inside a population; how a
chain grows mid-sequence when assemblies are immutable.
