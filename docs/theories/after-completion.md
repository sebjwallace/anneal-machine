# After completion: dropping out and priming

*Followed by [Sequence memory and state memory](sequence-and-state.md): the owner's answer, built on branch
`l1a-reading`, and the question it leaves.*

A theory note, written 21 November 2026 for the owner to take away and think about, and for an agent to pick up and
talk it through with him. **Partly tested** (C103, C104); the proposal at the end is **untested**. It continues
[the tilting landscape](the-tilting-landscape.md) §2 ("completion is the sink"), and connects to the priming
experiments C89-C91 ([flow and heat](flow-and-heat.md)).

## 1. Where things stand

AMP is built in Go (`amp/`): an engine, and an interpreter with a REPL. The parts that matter here (see
[the language](../../language/README.md), especially [invoke](../../language/invoke.md) and
[edges and gates](../../language/edges-and-gates.md)):

- Each letter is a **population** of members. An **assembly** is a set of members; a **transition** is a chain of
  members in order (`cat = <c -> a -> t>` declares both). Assemblies are immutable: learning only forms new ones.
- A member is **active**, **refractory** or **ready** (its phase). Gates count active and refractory members. Every
  bond acts one moment later.
- An assembly's gate opens for its ready members when its counted part is more than half. A transition step opens when
  the step before it is counted.
- Input a gate expects turns on only the members expected. **Unexpected input turns on all of a population's ready
  members** (it bursts).
- **Primed**, today, is a display mark only: a ready member a gate reached but didn't bring on.
- Rivals (alternatives in the same place) compete; a tie is held and none of them open.
- `invoke "the cat"` reads text one letter a moment (a space is the population `_`).
- **Holding**: an assembly that completes keeps itself on. More than half is counted, so its gate opens again every
  moment (or cycles, with the refractory period on). Nothing in the rules ends it.

## 2. The problem

The engine has **one way of keeping anything, and that is activity**. A word read a moment ago, a word that completed,
the context for what comes next: each exists only as members that are still on. So holding does two jobs that pull
against each other:

1. It keeps what was read available, so a word can complete and the next can follow on from it.
2. It takes up the members. Members that are on aren't ready, so new input can't land on them, and held things pile up.

While each invoke held one word, this never showed. Reading a stream makes it unavoidable: whatever reading does, by
bonds, by fitting input to assemblies, or both, something has to end a hold, and something has to keep what was just
read without keeping it active.

The owner's picture of how people meet input: a foreign language or random characters mean nothing, so in the moment
the input isn't processed and nothing is captured; patterns are found later, at rest, by going over a record of it.
Annealing is that rest. And from the tilting landscape: **remembering is re-completing, not holding**. A completed
memory isn't kept active; what's left is a trace, and it comes back when new input completes it again.

## 3. What has been tried

### C103 · Reading with bonds only ([record](../../experiments/sketches/C103-reading-with-bonds/))

The owner's idea: while reading, form only bonds, letter to letter, and no assemblies, so noise leaves a trace without
filling the memory. A repeat then shows itself as prediction: input seen before arrives expected instead of bursting.
Example: "A B C D" then later "X B C Y". B bursts both times; the second time C is predicted from B; then C predicts D
and Y arrives instead. B C is bounded by failed predictions on both sides: that is where heat drops, and where an
assembly could be captured.

- Works: "the cat the dog the bird the mouse" read three times settles at 5 bursts of 34 and no new bonds. What still
  bursts is genuine surprise: which animal follows "the ".
- Needed: a prediction counts only from the letter just before (a burst letter turns on all its members, so every
  chain through it runs on by recall, and those made false predictions); and a change to the rivalry rule (rivals
  must share what comes before **and** after). That change is on the branch only, not approved.
- Fails: forming an assembly over each run of predicted letters. The runs overlap, the assemblies complete and hold,
  and they drown the input.

### C104 · Completion drops out ([record](../../experiments/sketches/C104-completion-drops-out/))

Two rules, each tested alone and together: (1) an assembly that completes doesn't open its gate the next moment;
(2) once it has completed, its gate needs one member fewer (the trace: easier to complete next time).

The clearest test: hand-built words read as one text, "the cat sat on the mat the dog sat on the cat a dog ran to the
mat".

| | words that ever completed | end |
|---|---|---|
| Holding (as now) | the, cat, on, to | four words held from moment 14 to the end |
| Drops out | the, cat, on, to, dog, sat, ran | still held, cycling through "the dog ran" |
| Drops out, one fewer after | the, cat, on, to | the same as holding |

- Holding stops later input being recognised at all.
- Dropping out for one moment isn't an ending: two moments later, the word's own refractory members and chain are
  still counted and restart it.
- The trace works for what it was meant for (after "cat" has completed once, "c" alone brings it back; before, it
  doesn't). But in reading it cancels dropping out: it lowers the threshold for whatever is counted, and the word's own
  leftovers are counted, so it completes again at once.
- "to" completed before it was read: an unexpected "t" turned on every word's "t", and the chain of "to" did the rest.

**What C104 shows in principle:** the trace has to respond to **new input reaching the assembly**, not to the
assembly's own leftover activity. As tested, the engine can't tell those apart.

## 4. The proposal (the owner's, untested)

1. **When an assembly completes, it drops out, and its members are left primed.** Primed becomes something a member
   *is in*, a lasting state, not only a mark for one moment.
2. **Primed members aren't counted** (gates count active and refractory only). So nothing is left to restart the word:
   the activity really ends. This is what gets round C104's restart.
3. **A primed member comes on more easily** when something reaches it.
4. **Once primed and then activated, it resets**: the trace is used once, and renewed if the word completes again.
5. **Decided: unexpected input turns on only its primed members**, if it has any; if none, all its ready members, as
   now.

This is member-centric, as the owner put it: the trace lives on members, not assemblies. A member belongs to many
assemblies, and is "holding a subset of its assemblies primed". His earlier thought: a member can only have so many of
its assemblies primed. (Latches: the owner sees these traces as what latches are. The word isn't in the language; the
brief says not to build latches. Whether "latch" comes back is his call.)

Walking through "cat": c, a, t arrive; cat completes; it drops out and c, a, t become primed, not counted; the memory
goes quiet. Later "c" arrives and lands on the primed c, comes on, and resets; a, t follow; cat completes again and is
primed again.

What it would fix: no restart and no flicker (nothing left is counted); no pile-up (only what's being read is on); a
trace that limits itself (a word read again stays primed; one never met again stays primed but does nothing).

What rule 5 does:

- **Context settles surprise.** After "cat" and "dog" are read, "the " then an unexpected "c": only cat's primed "c"
  comes on, not every "c", and cat's chain predicts "a", "t".
- **Nothing changes where nothing has completed**: bond-only reading (C103) and noise never prime anything, so they
  burst as now.
- **Primed rivals still compete**: if "cat" and "cap" both completed earlier, both primed "c"s come on and their
  assemblies compete.
- **A new word can borrow an old word's start**: "car" after "cat" lands on cat's "c" and "a", then "r" bursts (not
  primed). So "car" shares cat's "ca" path, close to how C103 settled a burst letter by what followed. Probably wanted;
  worth knowing.

## 5. Open questions

In the order they probably need settling. Question 1 is the one to settle before an experiment (C105).

1. **When a completed word's members become primed.** If at once, the bond from its last letter can't act a moment
   later, so "the " no longer predicts what follows (C103 relies on it). If a moment later, the word's leftovers are
   still counted, which is where C104's restart came from. Is there a moment where the last bond acts but the
   assembly's own gate doesn't restart it? Does it differ for the assembly and its chain?
2. **What "comes on more easily" means.** It must keep the rule C89 found necessary: priming never brings anything on
   by itself; it acts only once something reaches it. One natural reading uses today's meaning of primed: a gate that
   reaches a primed member brings it on even if, by its count, it wouldn't open. Alternatives: the assembly's gate
   counting its primed members towards opening, but only once one of its members is counted.
3. **What "activated" means for the reset.** By input only, or by any gate? If recall can reset a primed member, the
   word's own chain or an overlapping assembly could use up the trace without any input.
4. **Shared members.** Priming a member makes it easier for every assembly it's in, not only the one that completed.
   Context spreading to related things, or noise?
5. **How many.** The owner's limit: a member can have only so many of its assemblies primed. Is priming per member, or
   per member and assembly? Is there a limit at all, given primed never wakes anything alone? If there is, what picks
   which stays primed (most recent?), and is that a number (like the budget) or a rule?
6. **How long.** Does priming last until used, or fade? Fading would need time, which nothing else has.
7. **The word.** "Primed" would change from a one-moment display mark to a fourth phase (active, refractory, ready,
   primed). The meanings are close (reached or left behind, not on, easier to bring on), but it's the owner's word and
   his decision. The theory notes also have "trace" for what's left behind.
8. **Composition.** If a part ("cat") completes and drops out, does the whole it belongs to still complete? A whole
   binds a sample of each part, so the part's members dropping out at once might stop the whole ever counting enough.
9. **Rest.** Where does annealing come in? The owner's picture: a record of the input, gone over at rest, finding
   what recurs. When the input stops is the only stopping point so far that adds nothing from outside. What is the
   record? The engine has the command log and the record of changes, but neither keeps the input itself.

## 6. For an agent picking this up

- Read this note, the two experiment records, [the tilting landscape](the-tilting-landscape.md) §2, and the C89-C91
  priming results in [flow and heat](flow-and-heat.md). The engine code is in `amp/engine/` (`invoke.go`: `upcoming`,
  `openGates`, `wouldOpen`, `step`). The C103 and C104 code is on the branches `experiment/reading-bonds` and
  `experiment/completion-drops-out` (not on main): `amp/engine/readbonds.go`, `amp/engine/dropout.go`,
  `amp/cmd/c103`, `amp/cmd/c104`.
- The owner gives the principles and constraints; the agent works out the details and runs the experiments, on a
  branch, with predictions written before running. Experiment records (README, hypothesis, findings, out.txt) go onto
  main; code stays on the branch.
- **Don't coin terms**, in prose, tables, column headers or sketches. Use the language's words; propose any new word
  explicitly first. **Answer the question asked**; don't turn it into a change nobody asked for.
- Keep it simple. When unsure, ask the owner rather than add a mechanism.
