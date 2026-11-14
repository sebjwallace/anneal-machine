# Learnt logic: OR, AND, NOT, NAND and AND NOT

> Brought in on 14 November 2026 from the owner's other repository, the homeostatic state machine, where it was
> doc 17. The text below is as it was written there; only links were changed. Its sketches 36 to 39 are here as
> [C69](../../experiments/sketches/C69-learnt-and/), [C70](../../experiments/sketches/C70-learnt-not/),
> [C71](../../experiments/sketches/C71-membership-segments/) and [C72](../../experiments/sketches/C72-segments-two-signs/),
> each with its hypothesis and findings. Anything else it mentions (other sketches and findings, core v1 to v5, doc 16)
> is in that repository. What it means for Anneal is added at the end.

*A write-up, November 2026, of the experiments on how cells and their segments can do logic, learnt from experience rather than wired in. Sketches 36–39 (findings 04, 05, 07, 08), with later lessons from core v5 and sketches 64–69. Plain words first, then the details.*

---

## The short version

A cell on its own can only **add up** what arrives, so it does **OR**: any of several inputs can drive it. Real situations often depend on a **combination** ("the grey cat **and** a full bowl" means eating; either alone means nothing much) and on **exceptions** ("birds fly, **unless** it's a penguin").

Real neurons solve this on their **dendrites**, the branches where inputs arrive. A thin branch collects inputs from a small set of cells and fires its own local spike only when enough of them are active together. That's a soft AND. Several branches on one cell make an OR of ANDs. Inhibitory inputs placed on a branch can veto it.

We copied that idea as **segments** and tested four things in turn:

1. **AND (sketch 36):** a cell grows a segment when it should have fired and didn't. **It worked**, and it generalised where the hand-made shortcut couldn't.
2. **NOT (sketch 37):** inhibition learnt from the machine's own wrong predictions. **It worked for exceptions with their own word** ("penguin"), but inhibiting each word separately also hit innocent shared words ("cat").
3. **Membership (sketch 38):** a segment per assembly, meaning "belongs to this group". It kept memories sharp, but couldn't complete from a partial cue.
4. **Two signs (sketch 39):** one segment type, two signs, grown by **one rule**: "should have fired and didn't" grows an AND; "fired and shouldn't have" grows an inhibitory segment. Placed on a single excitatory segment, that's **AND NOT** ("for this reason, unless …"). **It worked best**, made the general rule better rather than worse, cost little, and went into the core.

The owner's idea of **NAND segments** (NOT of an AND) is what led to the two-sign design. It was tested in two placements, and the cheaper, more precise one (AND NOT on a segment) won.

---

## Where it started

Before these experiments, the machine had two kinds of logic, both blunt:
- **OR, by adding up.** Links from several inputs sum on a cell. Any of them can drive it.
- **Implied inhibition, through competition.** When cells compete and only the best win, the losers are suppressed. That's a kind of NOT, but it's symmetric and unlearnt: it can only say "fewer things win", never "*this* should suppress *that*".

Combinations had been faked with a **hashed shortcut**: a separate unit for each pair of words, made by code. That's designed in, not learnt, and it shares nothing between pairs, so it can't generalise.

The question became: **how do dendrite branches do logic, and can our cells learn it locally, from heat, with no labels?**

---

## Experiment 1: AND as learnt segments (sketch 36, findings 04)

### The idea

A cell can grow **segments**. A segment is a small sample of the cells that were active at the time (8 to 16 of them). It fires when enough of them are active together, around 75%: "about 6 of these 8". That makes it a **soft** AND, tolerant of one missing input.

The rules, all driven by heat:
- **Grow:** when a cell is hot because it should have been driven and wasn't, it grows a segment from a sample of whatever was active.
- **Keep:** a segment that fires and whose cell then fits gets stronger. One that fires and whose cell doesn't fit gets weaker, and eventually goes.
- **Use:** a firing segment adds strongly to its cell's drive. A cell with several segments responds to any of their patterns (OR of ANDs).

### The test

Worlds where **only a combination** predicts the outcome:
- "grey cat" + "bowl full" → "eating";
- "grey cat" + "bowl empty" → "meowing";
- "ginger cat" + "bowl full" → "sleeping";

and so on, so that no single word predicts more than about 40% of outcomes. Some combinations were held out to test generalisation. Compared: plain links (OR only), the hashed shortcut, and learnt segments. 10 fresh seeds, settings fixed in advance.

### Results (world a / world b)

| | plain links | hashed pairs | **segments** |
|---|---|---|---|
| seen combinations | 0.36 / 0.25 | 1.00 / 0.99 | **0.98 / 0.90** |
| held-out combinations | 0.26 / 0.13 | 0.12 / 0.10 | **0.84 / 0.71** |
| with the colour word dropped | 0.37 / 0.26 | 0.62 / 0.31 | **0.89 / 0.87** |

### What we learnt

- **AND can be learnt locally from heat, with no labels.** Plain links stay stuck at what single words allow. Segments learn the combinations almost as well as the hand-made shortcut.
- **They're soft:** a segment still fires 97–99% of the time with one input missing.
- **They generalise where the shortcut can't:** 0.84 / 0.71 on held-out combinations, against chance for the shortcut.
- **It isn't one tuned value:** sizes 8–16 with a 75% threshold all worked. A 50% threshold failed (about 6,000 segments, chance accuracy); a 100% threshold with large segments memorised and didn't generalise.
- **But:**
  - growth never stopped (11–14 grown for every one kept);
  - the transfer went through shared *words* ("cat"), not shared *kinds*;
  - **specific exceptions got outvoted** by the general segment. "ginger cat" + "bowl full" → "hiding" was right only about 30% of the time (first reported as 65%, corrected after a bug was found in sketch 39).

That last failure is what led to NOT.

---

## Experiment 2: NOT as learnt inhibition (sketch 37, findings 05)

### The idea

Everything the machine learnt was positive: things that fire together get linked. A system with only positive feedback reinforces itself, and we'd seen that lock in early mistakes. A homeostat needs a negative loop too.

The rule: **when context C is active, X is predicted, and X doesn't happen**, that's heat at X, and C's cells grow an **inhibitory link** to X: "when C, not X". If X later happens while C is active, the inhibition weakens.

The key safety gate: **inhibition is learnt only from the machine's own wrong predictions**, never from being told the right answer. Otherwise it's supervision.

### The test

Three parts:
1. **Exceptions:** "white bird flies", "black bird flies", but "penguin bird" doesn't, including exceptions that arrive late, after the rule is learnt.
2. **Identity:** could learnt inhibition between co-present entities replace hand-written bookkeeping for telling things apart?
3. **Lock-in:** could it break an earlier sketch's self-reinforcing loop?

### Results

**Exceptions: held.**

| | positive links only | positive, out-voting | **learnt NOT** | NOT without the "own prediction" gate |
|---|---|---|---|---|
| late exceptions don't "fly" | 0 | 1 | **1** | 1 |
| regular birds still "fly" | 1 | 0.70 | **1.00** | 0.15 |
| a new "green bird" "flies" | 1 | 0 | **0.8** (1.0 later) | 0.3 |
| all pairs correct | 0.92 | 0.97 | **0.998** | 0.81 |

- An exception was learnt after 1–2 sightings, **with no damage to the rule.** Positive links could only win by out-voting, which cost the rule for other birds.
- **Unlearning worked:** a "chick" that started flying recovered in 3–4 sightings.
- **It stayed balanced by itself.** A homeostatic balance rule (from Vogels and colleagues, 2011) added nothing at low strength and wore away the rule at higher strength.
- **The gate is what made it safe:** without it, four times the links and real facts lost ("ostrich runs", "penguin swims").

**Identity and lock-in: failed.** The machine rarely sees its own wrong choice of entity, so there was almost nothing to learn from. And inhibiting from each active word separately **hit shared words too**: "cat" and "sleeping" ended up suppressed as much as the actual culprit.

### What we learnt

- **Learnt NOT works wherever the world shows a prediction failed.**
- **Inhibiting single words is too blunt.** What's needed is "*this combination* suppresses X": inhibition on a segment. That's the NAND idea, and it would also fix sketch 36's outvoted exceptions.

---

## Experiment 3: segments as assembly membership (sketch 38, findings 08)

A side branch. The idea: give each cell one segment per assembly it belongs to, firing when enough of that assembly's other members are active. That's a soft AND per assembly, ORed across the assemblies it's in. The hope was one mechanism for both memory and logic.

### Results (strict recall at 400 stored memories, blends in brackets)

| cells per column | summed links | segments (16 sampled) | **segments (whole set)** |
|---|---|---|---|
| 2 | 0 (71% blends) | 0 (100) | **68 (18)** |
| 4 | 18 (37) | 0 (100) | **85 (6)** |
| 8 | 86 (3) | 0 (100) | 94 (2) |
| 16 | 94 (5) | 0 (100) | 92 (5) |

### What we learnt

- **Whole-set segments keep shared cells from blending,** and hold far more memories when cells are scarce.
- **A sample isn't enough:** 16 sampled synapses blended almost every time.
- **But they can't complete from half a cue** (0%, against 81–86% for summed links), don't generalise by kind, and aren't cheap.
- **Segments are sharp; summed links are tolerant.** A cell needs both. This became the episodic/semantic split: whole-set segments became **episodes**, summed links became **knowledge** (doc 16, episodic memory, in the homeostatic state machine repository).

---

## Experiment 4: segments with two signs (sketch 39, findings 07)

### The idea (the owner's NAND proposal)

Sketches 36 and 37 failed in the same place. Both needed "this combination suppresses that". So: **one kind of segment, two signs, one growth rule**, triggered by the two signs of heat:
- **a cell should have fired and didn't** (under-driven): grow an **excitatory** segment, exactly as in sketch 36;
- **a cell fired, or was predicted, and shouldn't have** (over-driven): grow an **inhibitory** segment from a sample of what was active.

Both are soft ANDs; both strengthen when they help their cell fit and weaken when they don't. An excitatory segment adds drive; an inhibitory one subtracts. As before, inhibition is learnt only from the machine's own wrong predictions.

Two placements for the inhibition were compared:
- **NAND, on the whole cell:** "not when these are together";
- **AND NOT, on one excitatory segment:** "for this reason, unless …". It vetoes just that reason, and leaves the cell's other reasons to fire intact.

### Results (last quarter of the stream, world a / world b)

| | excitatory only | single-word NOT | **NAND** | **AND NOT** |
|---|---|---|---|---|
| individual exceptions | 0.51 / 0.29 | 0.62 / 0.37 | 0.84 / 0.60 | **0.84 / 0.62** |
| general rule | 0.88 / 0.86 | 0.84 / 0.82 | 0.97 / 0.94 | **0.97 / 0.93** |
| held-out combinations | 0.57 / 0.76 | 0.50 / 0.71 | 0.68 / 0.65 | **0.70 / 0.82** |
| far from any exception | 1.00 / 0.90 | 0.85 / 0.89 | 1.00 / 0.97 | **1.00 / 0.97** |
| work per event (synapse checks) | 583 / 879 | 628 / 974 | 2854 / 4656 | **734 / 1136** |
| inhibitory units alive at end | 0 | ~5,000 links | 323 / 520 | **45 / 66** |

### What we learnt

- **Combination exceptions get learnt:** accuracy on exceptions roughly doubled.
- **The general rule improves rather than suffers** (0.86–0.88 → 0.93–0.97), because inhibition removes the rule's own mistakes instead of fighting it.
- **No collateral damage.** Only single-word NOT hurt combinations far from any exception.
- **One rule does both jobs,** with the same code and constants for both signs.
- **It stays balanced without a balance rule.**
- **AND NOT beats NAND:** equally good on exceptions, better on held-out combinations, about a tenth of the inhibitory units, and 1.3× the cost of excitatory-only against 5× for NAND. NAND on the whole cell was wasteful: its segments got strengthened while firing on cells nothing was driving.
- **Not perfect:**
  - exceptions reached 0.62–0.84, short of the predicted ~0.9. The remaining failures were mostly on the positive side: the rule was suppressed, but nothing yet drove the exception's own outcome strongly;
  - **a cell-wide "stop growing" signal hurt.** The cells that mostly fit are exactly the ones that need to learn a rare exception. A stop signal has to be local to the situation, not an average over the cell.

---

## What went into the core

Core v1 onwards uses **excitatory segments plus AND NOT sub-segments, grown by one rule** (`class Segments` and `Predictor.learn` / `Shared.learn` in `core/core.js`):
- a segment samples 8 active units and fires at 75% of them (`SEG_N`, `SEG_THETA`);
- **keep**, one rule for both signs: when it fits, its strength moves towards 1; when it misfits, it's scaled down; below a floor, it goes;
- **grow:** a hot cell with no segment firing for it grows an excitatory segment; a segment that drove a wrongly cast cell, with no "unless" firing, grows an "unless" sub-segment on itself;
- "unless" sub-segments are checked only when their parent fires, which keeps them cheap.

So the machine's learnt logic is **OR of ANDs with AND NOT**, which is enough to express rules and their exceptions locally, from heat alone.

---

## Later lessons (sketches 64–69, findings 40–45)

The logic worlds became the hardest test for later changes:
- **Judging surprise from the whole situation's expectation improved the logic further** (sketch 66): held-out 0.85 → 0.96, exceptions 0.62 → 0.73. But it also grew several times more segments, so part of that gain was more structure.
- **Every attempt that slowed learning broke the logic** (sketches 67, 69). Rules and exceptions need segments to correct themselves fast when wrong.
- **Deleting segments while awake turned out to do real work** (sketch 65). Removing them only at rest let weak segments clutter prediction, and the logic collapsed.
- **In small situations, an "unless" can only cancel its parent, not narrow it** (findings 44). When the inputs are few, the "unless" samples the same inputs as its parent, so it switches the rule off entirely rather than carving out the exception. The machine then regrows what it just cancelled.

---

## What we never tested

- **XOR** ("one or the other, not both") as a target in its own right. In principle, two excitatory segments each with an "unless" for the other's input can express it, but we didn't run it.
- **Kind-level transfer:** segments generalised through shared words ("cat"), never shown through shared kinds alone.
- **Exceptions identified by more than two words,** and nested exceptions ("unless … unless …").

## Open problems

1. **A local stop signal for growth:** grow only where *this* situation keeps misfitting, not by a cell-wide average.
2. **The positive side of exceptions:** once the rule is vetoed, something must drive the exception's own outcome strongly.
3. **The "unless" that can only cancel** in small situations.
4. **Segment life cycle:** segments are made and destroyed after a few mistakes, which suits correction but means they can't hold a slow sense of "what's usual" (findings 45).

## Where to look

| what | where |
|---|---|
| sketch 36 (AND) | [C69-learnt-and](../../experiments/sketches/C69-learnt-and/): hypothesis 04, findings 04 |
| sketch 37 (NOT) | [C70-learnt-not](../../experiments/sketches/C70-learnt-not/): hypothesis 05, findings 05 |
| sketch 38 (membership) | [C71-membership-segments](../../experiments/sketches/C71-membership-segments/): hypothesis 06, findings 08 |
| sketch 39 (two signs) | [C72-segments-two-signs](../../experiments/sketches/C72-segments-two-signs/): hypothesis 07, findings 07 |
| in that repository's core | `class Segments`, `Predictor.learn`, `Shared.learn` in `core/v5/core.js` (not brought in) |

---

## What it means for Anneal

*Added 14 November 2026, when the work was brought in. A reading, not a result: nothing below has been run in Anneal yet.*

**The two signs of heat, and where they apply.** Rebuilding fitting at the level of cells left each cell knowing its
own heat, in two kinds: a cell lit that nothing predicted, and a cell predicted that didn't light. Sketch 39's one rule
grows structure from two signs too: "should have fired and didn't" grows an AND; "fired and shouldn't have" grows an
"unless". *Corrected after [the other agent's answers](learnt-logic-qa.md):* there, both signs were a prediction tested
against what happened next, across time, never a mismatch within one settling; misfit within one settling drove
something else, recruiting new cells for what is unexplained. So in Anneal's terms, misfit within one fit decides what
to keep, and prediction against outcome across time, which is change memory, is where rules and their exceptions would
grow, with no teacher (CTR-1 GOL-1).

**AND NOT is competition that has been learnt.** Fitting by competition needs assemblies to suppress each other where
their claims overlap. Plain competition only says "fewer things win"; it can't say "this, unless that". An "unless"
grown on a segment is the specific form: one memory vetoed in one situation, with everything else left alone. It may
be what competition between assemblies becomes once it has been learnt from experience.

**Sharp against tolerant, and Anneal's two.** Sketch 38 found that segments firing on most of an assembly keep shared
cells apart but can't complete from half a cue, while summed links complete but blend, so a cell needs both. Anneal's
segments (C35) fire at two active links, a bar that comes from the prices rather than a chosen fraction, and C35
recalled from a few cells without blending. That sits between the two, and whether it holds at sketch 38's scale (400
memories, 2 to 16 cells per column) is a direct, cheap test with C71's worlds.

**The energy rule may be the local stop signal.** Sketch 39's first open problem is a stop signal for growth that is
local to the situation, since a cell-wide one hurt. In Anneal, a segment would be structure that costs its synapses,
kept only if it removes more misfit than it costs (CTR-1 CON-1). That rule is local by nature: growth stops wherever
nothing more pays, and goes on where a rare exception still misfits.

**What doesn't fit the contract yet.** These sketches give segments and links strengths that rise and fall, and they use
chosen settings (a segment of 8, a 75% threshold, learning rates), though several values worked. Anneal's contract has
cells and segments carry no numbers (CON-9), no tuned settings (CON-2), and keeping by energy alone (CON-1). So bringing
learnt logic into Anneal is a distillation: the same mechanisms, with strengths and thresholds replaced by prices.

**Other links.** The episodic and semantic split that came out of sketch 38 matches Anneal's two kinds of memory (CAP-11).
Absence was priced in C61 (the lost keys), and AND NOT is its form at the level of cells. A frame with an exception ("a
bird flies, unless it is a penguin") is a frame with an "unless". XOR was never tested.
