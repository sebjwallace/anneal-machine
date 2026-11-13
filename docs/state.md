# Where Anneal stands (12 Nov 2026)

The handover document: what the engine is, how each part works and **why** it works, what's solid, what's shaky, what doesn't work yet, and the lessons from getting here. Read this first; the other docs go deeper on each piece.

> **Since this was written (13 Nov 2026):** experiments C33–C58 built the other half of the cycle (joining routes never walked, checking plans against remembered experiences, context from above) on an integrated engine copy, the branch. Read [checkpoint 11](checkpoints/11-thinking.md) next: it says what held up, what didn't, the branch's choices still to declare, and where to pick up. The core is unchanged apart from one bug fix.

> **Rewriting or reworking the core?** Read [the column guide](guides/the-column.md) first: the theory, the principles a column must keep, and what a rewrite may and may not change.

---

## 1. The one idea

Anneal learns from pictures with one rule: **keep whatever makes the whole description cheapest.**

- Everything is priced in one currency taken from the world:
  - a pixel nobody explains, or one drawn wrongly, costs 1;
  - a pixel stored in memory costs 1;
  - a **placement** ("this part, here") costs 1 plus the cost of naming which part, which is log2(number of parts) against log2(pixels in the world).
- **Energy** = **structure** (what's stored) + **flow** (the cost of explaining the recent pictures with what's stored) + **change** (the cost of describing what moved between pictures, when they come in sequence).
- Something that doesn't fit is **heat**. Learning is cooling: a change is kept only if energy falls.

There are no weights, no gradient, no training set and no hand-set numbers in the rule. It learns online, from nothing, on a CPU.

**Why this works:** one rule judges every decision (store a picture, split a part, group parts, form a kind), all in the same currency. So the decisions can't pull against each other, and nothing needs tuning against anything else. Every result in the engine traces back to "it made the description cheaper". That is also why crutches are so damaging: a crutch is a second rule, and the moment there are two rules, results stop meaning anything.

---

## 2. How it works, part by part

### 2.1 Seeing (awake) · `src/engine/see.js`
- A picture is explained by placing known parts anywhere, as cheaply as possible.
  - Awake, every possible opening placement is tried, then the rest is filled in greedily. The cheapest whole explanation wins.
  - A part may be placed many times (several houses), and at any position (learn once, recognise anywhere).
- Parts of a picture can be marked **hidden** (known to be unknown). Pixels there cost nothing, which is how completion of pictures works (2.4).
- **Remembering** a picture: it's stored as a memory only if total energy is lower with it stored than with it left in the flow (since C30). There's no threshold.

**Why:** "the cheapest explanation" is recognition. A thing is present when describing it as one placement is cheaper than describing its pixels one by one.

### 2.2 Rest: decomposition and composition · `see.js`
Pictures stop and the machine reorganises. Candidate moves are proposed, each is applied, energy is **measured**, and the move is kept only if energy fell; otherwise it's undone. The moves:
- **decompose:** two parts compared at every shift. What they share becomes a part of its own, and each original becomes a composite of the shared part plus its difference.
- **compose:** a recurring arrangement of parts becomes one composite, a layer up.
- **dissolve / fuse:** fold a composite back into its users, or turn it into one plain part.
- **unpack:** a part only one memory uses goes back to being that memory's loose pixels.
- **re-describe:** memories are re-explained with what's known now.
- **kinds** (2.6): make, widen, share, undo, fold away.
- Always removed, because they can only cost: unused parts, pass-throughs, duplicates.

**Why it works:** comparison finds **logical** parts, not statistical ones. A cross compared with a vertical bar yields the vertical bar exactly, rather than a blurred average built up over thousands of examples. Composition then gives you layers that exist only where they pay. This is your "decompose, don't average", and it is the turning point of the whole project (C16–C17).

### 2.3 Cells and assemblies · `src/engine/cells.js`
- Only **primitives** (parts not made of other parts) are **columns**.
- A column's **cells** form a grid of offsets, in **floors**:
  - floor 0 is *where* an instance is, relative to the centre of attention;
  - each higher floor is where a primitive sits inside a composite of that level.
- An **assembly** is the **smallest set of cells from which completion brings the whole thing back**. So how many cells an assembly keeps is decided by completion, not set by hand.

**Why:** it gives a sparse code that is the same wherever the thing is (40 of 40 positions give an identical house assembly), with position carried separately on floor 0.

### 2.4 Completion · `src/engine/complete.js`
- **Pictures:** this is just seeing with hidden places. A known thing is recognised from what's visible and the hidden pixels are filled in.
- **Cells:** from a few "where" cells, cells vote for assemblies. An assembly is accepted only if it describes two or more items as one placement, which saves energy. The biggest saving goes first. On equal savings, the one that claims least it hasn't seen goes first. **If the evidence fits two completions equally, neither is taken.**

**Why:** it's the same energy rule again ("one placement is cheaper than several"), so recognition and recall are the same act. The "don't decide when the evidence can't" rule is what stopped completion inventing pixels.

### 2.5 Transitions and shared changes · `src/engine/change.js`
- A **state** is a settled picture as cells: where things are **now**, where they **were** a moment ago, and any **context** held from elsewhere.
- Every transition is remembered with full detail, including where it happened.
- At rest, transitions are compared in pairs at every shift. Where the **whole** change of one lines up with the whole change of another, what they share is kept as a **shared change**, without position. A change learnt in one place then applies anywhere.
- To predict:
  1. the most detailed fitting change wins (an exact memory at the very place it was seen is the most detailed of all);
  2. then the one a **cue** agrees with;
  3. then the one seen most.

  Every change applies wherever it fits.

**Why:** it's the same comparison as for parts, applied to happenings. Context and cues use the same content-addressable lookup as completion. "Where things were" carries direction and momentum, which is why a bouncing stick went from 59% to 100%.

### 2.6 Kinds: one form, many versions · `see.js` (milestone 10)
- A **kind** is a composite with one **slot**, plus a list of **fillers** that can go there (a table with a cap, a peak or dots on top).
- Versions aren't stored; they're made when needed.
- Using a kind costs a little each time, for naming its filler, so a kind only survives when it pays.
- Kinds are formed, widened, shared, undone or folded away at rest, all judged by energy.
- **One energy:** when pictures come in sequence (`step(x, prev)`), the cost of describing change joins the bill, so a kind that lets one change cover every version is rewarded.

**Why:** it gives generalisation within a form, the first step towards "generic at the top, detail underneath".

---

## 3. What works well (with evidence)

| Capability | Evidence (tests in `src/test/`) |
|---|---|
| Learns shapes and objects from nothing | 12×12 world: 12 parts, all 8 shapes and 3 objects found, nothing unused, 0 heat on fresh scenes; bill 1,172 (C20 needed 30 parts and 1,407) |
| Recognises anywhere, in any number | identical house assembly at 40 of 40 places; two of the same thing seen as two instances |
| Rebuilds a thing from part of it | hidden patch: 99% / 94% / 67% / 3% restored for 0–25 / 25–50 / 50–75 / 75–100% hidden |
| Recall from a few cells | settles in one round; draws 0–4 wrong pixels per 300 scenes, and the 4 are legitimate (C32) |
| Learns change, branching, context, cues | trained places 100%; places never seen 93–100%; roof branch exactly at the coin-flip limit |
| Generalises within a form (kinds) | moving world: 100% / 90% of next pictures exact on seen objects; never-seen objects 87% overlap |
| Fast on small worlds | 600 scenes learnt in about 9 s |

---

## 4. What's shaky: still a choice, or known to be weak

Each declared choice has its own note in `docs/decisions/`.
- **001 · Greedy search at rest** (a compute limit): rest re-explains the flow quickly rather than exactly.
- **002 · Rest search order:** the first move that lowers energy is kept, not necessarily the best one. Local minima are possible; one was found and fixed in C28 (a kind that couldn't be folded away).
- **004 · One floor per level** for assemblies. Your decision is pending; a shared floor would allow similarity across levels.
- **005 · "Seen most"** breaks the last tie in change.
- **006 · Designed demonstrations:** tests use curricula.
- **007 · Nearest-first pairing** when pricing change in the bill. This is the same idea that was removed from `change.js` as a crutch; it's declared so it can't creep in unseen.
- **008 · The flow window** (a compute limit): rest weighs against the last 100 pictures. Ideally it would be every picture, and rare things suffer from the window (table + peak).
- **Exact matching in change:** a shared change applies only where its "before" fits exactly. Similar-but-not-identical situations were tried in a side branch (C27).
- **Changes whose rule depends on where** (walls) lose position when generalised.

---

## 5. What doesn't work yet

- **Busy scenes (the current wall, C33).** Bigger pictures are fine; busy ones aren't.

  | How pictures are remembered | What happens on busy scenes |
  |---|---|
  | Only if the bill falls (current rule) | Never starts. A busy picture only pays once rest has broken it up, and a one-picture check can't see that. |
  | Stored whole (the old 90% rule) | Rest can't keep up, because it compares every stored picture with every other at every shift. |
  | Only what's new, every time | Memory grows without limit. |

  Proposed ways forward (your call): **(a)** rest decides what to remember; **(b)** attention, meaning small looks at a scene with the scene built from looks; **(c)** objects first, then scenes.
- **Never-seen combinations within a kind.** A kind only has the fillers it has seen with it. Should energy reward predicting unseen combinations? That's an open question for you.
- **Whole scenes as one memory (episodic memory)** isn't shown yet. It's blocked by busy scenes.
- **Imagination / self-correcting rules** (C25–C27) is paused as a side branch.
- **Forgetting** is not designed.

---

## 6. Lessons: how we got here and why

**From the statistical era (C02–C15):** columns that learnt by averaging, plasticity schedules, funnels, staged growth, restless columns and snapshot thresholds were all slow and messy. They produced crumbs and blurred parts, and every fix added a number. The lesson was that averaging can't find logical parts. Comparison can.

**The turning points:**
1. **C14 snapshots:** remember a whole picture when nothing fits. It was simple and immediate, and it gave rest something to work on.
2. **C16–C17 decomposition and composition by comparison:** logical parts appeared (bars, halves, diagonals), and a new shape was rebuilt exactly on first sight.
3. **C18–C19:** parts stored without position plus placements gave learn-once-recognise-anywhere, in any number.
4. **C20 one currency, energy counts the flow:** the last hand-set cost went away, and structure became judged by how well it explains what's actually seen.
5. **C21–C24:** cells, completion and change all turned out to be the same comparison and the same energy, expressed differently.
6. **C26 crutches out:** memory scraps, search budgets and "sample 3 cells" were each replaced by the energy rule or by "don't decide".
7. **C28–C30:** kinds; one energy; remembering by energy; the flow kept across rests.

**Working lessons:**
- **Measure; don't trust a story.** Several times the explanation was wrong:
  - the C29 "47% → 100%" gain was mostly a too-short final rest;
  - the "transition memory can't generalise across versions" claim (C31) was false, because decomposition into shared pieces already does it;
  - "invented pixels" was legitimate recall (C32).

  Always rerun against a baseline before believing a gain.
- **Every move must be judged by the bill.** Every time something was added outside it (thresholds, pairing shortcuts, filters), it later had to come out.
- **Local minima come from missing moves.** When a two-step improvement exists but the first step costs, add the combined move rather than a rule (C28's "fold a kind away").
- **Test small first, and watch for hangs.** Two "slow runs" were infinite loops (a kind containing itself).
- **Don't add what doesn't earn its place.** Kinds in the transition memory (C31) and the near-fit move (C32) work but give no measured gain, so they stay as experiments.
- **Keep to the main line.** Side curiosities (imagination) are valuable but get paused when they pull focus.

---

## 7. Open decisions for you

1. **Busy scenes:** (a) rest decides, (b) attention, or (c) objects first, then scenes. The recommendation is (b), possibly with (c) as a warm-up.
2. **Predictive value:** should the bill reward predicting combinations not yet seen?
3. **One floor per level, or a shared floor** (decision 004).
4. **"Remember one thing" at rest** (C32): it lowers the bill but makes damaged-picture recall slightly worse. Pursue it or not?
5. **The milestone 10 name** (the foundry series: Smelt, Heat, Pattern, Cast, Grain, Mould, Transition, Stamp, Fettle, then …?).
6. **Glossary words marked "to confirm"**: structure, flow, part, placement, memory, floor, shared change, kind, slot, filler, change (in the bill).

---

## 8. Where things are

| | |
|---|---|
| The engine | `src/engine/` (see, cells, complete, change) |
| Its tests and expected results | `src/test/`, `src/test/baseline/`, `docs/architecture.md` |
| Worlds | `src/worlds/` (catalogue, scenes, moving, bumpers) |
| Checkpoint notes (01–11) | `docs/checkpoints/` |
| Declared choices | `docs/decisions/` |
| What it exposes | `docs/engine-api.md` |
| Words | `docs/glossary.md` |
| Every experiment | `experiments/sketches/Cnn-*/` and `experiments/findings/Cnn-*.md` (C02–C33) |
| Backlog and your ideas | `docs/backlog.md`, `docs/ideas.md` |
| The sandbox | `sandbox/` (Sandkit; chapter 1 is the basics) |
