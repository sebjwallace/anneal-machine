# 11 · (name to agree): the other half of the cycle — joining, checking, context

*Covers experiments C33–C58 (November 2026) and sandbox 0.4.0. Nothing here is in `src/` yet: the core engine is
unchanged apart from one bug fix (below). The working code lives in an integrated engine copy, the **branch**
`experiments/sketches/C56-integrated/engine/`.*

## In one paragraph
Until checkpoint 10 the machine only settled what it was shown. This checkpoint is about what it does with something
that **doesn't** settle: a question with no answer ("how do I get from the bench to the oak?"), a picture it can't
quite make out, a plan that might be wrong. The owner's picture: **a gap is heat**. Heat lowers the bar for waking
memories, more of them wake, activity pushed from both ends of the gap meets in the middle, and where it meets the
connection is made; the bar goes back up and the answer settles. A route never walked can be put together this way
from pieces that were walked. Imagination makes things up, so plans are **checked against remembered experiences**,
which are kept by a rule of their own. Higher regions send **context** down to the seeing region, which settles
ambiguous views; a **misfit** sends a misread back for a second look. All of this was shown in experiments, and then
rebuilt in one copy of the real engine where every existing engine test still gives identical output.

## Why it matters
- **It closes the loop the owner described:** learn → hit a gap → heat → connect → check against experience → settle.
  Before, the engine was half a cycle.
- **Planning and imagination without a planner.** Joining comes from the engine's own recall rule with a moving bar,
  not a route-finding algorithm (the owner's hard line: no heuristics bolted on).
- **Regions.** Things belong at the right level: pixels in a visual region, recognised things in an abstract region.
  Several hard problems became easy once handled at their level.
- **Grounded imagination.** General memory over-generalises; specific experiences catch it. Semantic and episodic
  memory pull against each other usefully.

## How it works (the ideas that held up)
1. **Every thing has a "what" and a "where".** In seeing, the what is a shape and the where is a place on the page.
   Higher up, the what is the thing itself (A is A) and the where is when it happened. The learner only had shapes, so
   every pixel encoding of higher-level things lost identity or invented coincidental parts (C36–C42). Fix: a point
   may carry a value, and points match only on the same value; pictures are the case where every value is 1 (C48).
2. **The abstract region's parts are the things it receives** (its columns), and a walk is remembered as one new
   assembly of its items, the way a picture is remembered as one new part. Naming one thing costs picking one of all
   item-and-place possibilities (C53).
3. **Assemblies with more than one slot.** "A or G, then J, then P or O" holds a family of walks with free ends. It
   forms by energy alone in the abstract region, and recalls walks that never happened (C41, C43, C52, C53).
4. **The recall rule:** a memory comes back only when **two** active things fall inside it (one memory explaining two
   clues is the saving). One clue does nothing; two walks touching at an unlit junction don't join (C41).
5. **The moving bar (pushing from both ends).** Start and end are held active the whole time (the owner's lightning:
   the charge holds until a path closes). While the gap is open the bar drops from 2 to 1, so one active thing wakes
   every memory it belongs to; where the start's side and the end's side meet, the bar goes back up and each half is
   joined the same way, until one memory holds it. Pushing is not a separate mechanism: it is the recall rule with
   the bar lowered (C44, C51). Bigger memories are shortcuts (the aeroplane): the same route in 1 round, 8 woken,
   instead of 2 rounds, 26 woken (C44, with long walks given by hand).
6. **Three honest answers:** a route; **undecided** at a real fork (two equally good routes); **no way through** when
   nothing meets and nothing new wakes ("stuck up there": the machine knows it can't see a way).
7. **Checking against remembered experiences.** A plan is trusted when every step in it was lived in some kept
   experience (the same recall rule: two things inside one memory). New combinations of lived steps pass; a step nobody
   took is a misfit (C46). Experiences need **their own rule** (keep at once, refresh when seen again, fade the
   longest-unseen); under the energy rule alone they are absorbed into general memory and real routes get doubted (C47).
8. **Context from above.** The abstract region sends down what it expects next; naming an expected thing costs log2
   of the expected set instead of all things (same currency, smaller choice). Readings are ranked by saving net of
   price, so context can matter (with one price for all, the order is unchanged). It settles ambiguous views, can't
   create sight from too little, and brings a small expectation bias (C55, C56).
9. **A second look on a misfit.** When the next view doesn't fit what was read, read it again without context: the
   bias mostly disappears and the gains stay (C56).
10. **Reading refuses ties.** If two things explain a view equally well, take neither ("not sure"), the completion
    rule's own tie rule. This stopped a systematic misperception (bridge read as hill, 17 times) from becoming a
    trusted "experience" (C58).

## What it showed (the numbers worth remembering)
| Result | Where |
|---|---|
| Bench to oak, never walked, two obscured views: both bars moving → 30/30 (clear), 26/30 (1 px missing), 6/30 (2 missing); only the abstract bar → "no way" always without it; only the visual bar reads heavily obscured views | C54, again on the branch in C56 |
| Checking against experiences catches every made-up road (12/12) and lets real new routes through | C46 |
| One rule vs two for experiences: 5×5 park at 3,000 days, real new routes trusted 1/10 (one rule) vs 8/10 (own rule); made-up roads 38 vs 10 real, all caught either way | C47 |
| Context: half-seen expected views 158/200 → 200/200; surprises misread as expected 10 → 15 with context → 11 with a second look on a misfit | C55, C56 |
| Misperceptions: about 2 % of views misread while learning became trusted experiences; refusing ties + replay at rest → 6/6 real routes, none made up | C57, C58 |
| Abstract region over items: a two-slot assembly forms by energy; B + Q (never seen) → B → J → Q; paired control invents nothing | C53 |
| Every engine test identical with all branch changes switched in (cells, complete, change, see, kinds) | C48, C52, C53, C56, C58 |

## What didn't work (don't redo these without a new idea)
- **Heat alone as imagination** (C37): settling falls into the familiar; never-seen combinations cost more than the
  nearest seen one. Imagination needs a goal or free slots.
- **Pixel encodings of higher-level things** (C36 bars, C38 strips, C39/C40 maps, C42 marks): lose identity or invent
  coincidental parts, and are slow (C39: minutes; on items: milliseconds).
- **One-point overlaps in the learner** (C52): don't help walks and make the kinds picture test worse (90 % vs 100 %).
- **Whole days as one picture** (C57): no bigger assemblies emerged; rest broke days back into shared stretches. The
  aeroplane has only been shown with long walks given by hand.
- **Counting how often a step was lived** (C58): useless against a systematic misperception.
- **General memory alone, separated from specifics** (C49): still settles narrow; the pricing question is about general
  memory itself.

## Earlier in this stretch (C33–C35)
- **C33 scale:** a bigger page is cheap; **busy scenes stall** learning under every remembering rule. Open decision:
  (a) rest decides, (b) attention, (c) objects first. C36 gave evidence for (c): learn objects from simple pictures,
  then read busy scenes 100 %.
- **C34 hex grids:** the engine is lattice-free; turns are learnt as separate parts; no engine gain until rotation or
  graded positions are worked on.
- **C35 segments** (owner's idea, episodic capacity): segments with competition equal today's completion exactly;
  pooled cells fail at once, segments alone degrade, with competition never a wrong recall, only "nothing" on
  ambiguity. Engine left alone.

## The one change in the core
- **Fix (C40): rest could hang forever** when kinds already shared one set of versions: "share" and "widen" checked only
  the kinds directly involved, so a kind could end up inside its own version. Both now check every kind using the
  set. `src/engine/see.js`, `docs/updates.md` entry 7. All engine tests identical.

## The branch (where to pick up)
`experiments/sketches/C56-integrated/engine/` is the main line plus, all switched off for pictures:
- items with identity (C48), several slots (C52), region currency and items-as-parts `o.atoms` (C53);
- `look(x, expected, hid, refuseTies)`: reading with context and the moving bar (C56, C58);
- `think(a, b)`: joining by the moving bar, with `avoid` to set aside misfitting steps (C56, C58);
- `expect(prev2, prev1)`: context sent down (C56); `restWithReplay(pictures)` (C57);
- `engine/experiences.js`: the store of experiences, own rule, `check(route)` (C56–C58).
Run `node run.js`, `node c57-days-replay.js`, `node c58-confirm.js` there. To check the engine tests: copy `src/` to a
temporary folder, drop the branch's `see.js` in, change `K.slot.set` to `K.slots[0].set` in `test/kinds.js`, run
every `test/*.js`, compare line by line with the main line.

**Choices on the branch, to declare before anything goes into the core** (owner's rule: patches are trapped heat):
- the visual bar drops to "any saving" (could be in proportion to the gap instead: an experiment);
- `think` takes the first round where the sides meet; stops after 64 rounds or 8 levels (compute limits);
- `expect` uses the last two, else the last one; time runs along x in the abstract region;
- the store of experiences holds 50, fading the longest-unseen (fading by use would be better: an experiment);
- several-slot assemblies pair slots by position; `o.atoms` is a switch (declare as architecture, or learn it?);
- refusing ties is an option; should it be the rule for reading everywhere? (run the picture tests with it on).

**Puppeteering to remove** (the owner's word: the experimenter standing in for what should be automatic): the wiring
in `run.js` decides when to look again, fetches the expectation and hands it down, and connects the regions; the
long walks in C44 were given by hand; the episodes in C41 were given by hand.

## Open questions for the owner
- **Pricing of general assemblies** (parked): using one costs naming it plus each slot's choice, so broad ones lose to
  narrow ones. Narrow ones woken together reach far (C50), so it isn't urgent.
- **Name of checkpoints 10 and 11.**
- **What goes into the core, and in what order:** suggested items with identity → several slots → the moving bar in
  completion → experiences, each with its own decision note and every test unchanged. The owner prefers to keep
  experimenting on the branch first.

## Next experiments (agreed or proposed)
- The second look inside the engine (a misfit raising heat), not in the wiring.
- The bar dropping in proportion to the gap.
- Remaining misreads that aren't ties; letting a later misfit correct what was stored.
- Bigger assemblies (the aeroplane) emerging from learning, not given.
- Drive the sandbox's `<an-assembly>` live from the engine; make "play completion" step through real rounds.

## What to show people
- `experiments/sketches/C41-episodes/viewer.html`: episodes, the recall rule, and two-slot assemblies, animated.
- Sandbox chapter 2 (`sandbox/columns.html`): `<an-columns>` (the lamp's four columns in 3D) and `<an-assembly>`
  (a thing's cells and its picture, linked).
- The C54 table: bench to oak, fixed vs moving bars in each region.

## Where it lives
- **Experiments:** `experiments/sketches/C33-…` to `C56-integrated/`, each with `hypothesis.md`, `findings.md` and its
  scripts (C57, C58: `C56-integrated/findings-c57.md`, `findings-c58.md`). The order, briefly:
  C36 abstract region · C37 imagination by heat · C38 routes as strips · C39 park map · C40 tiny map (bug fix) ·
  C41 episodes (+ viewer) · C42 hub kinds (blocked: identity) · C43 item learner · C44 pushing from both ends ·
  C45 learn then join · C46 check against experiences · C47 one rule or two · C48 identity in the engine ·
  C49 general memory alone · C50 narrow assemblies join · C51 the moving bar · C52 several slots in the engine ·
  C53 abstract region over items · C54 two regions, both bars · C55 feedback from above · C56 the integrated branch ·
  C57 whole days and replay · C58 refusing ties.
- **Philosophy:** `docs/philosophy.md`, "The other half of the cycle: a gap is heat, and heat lowers the bar".
- **Shared write-up for the owner:** the Claude doc "Imagination, planning and joining: what we learnt (C36–C45)",
  with later additions for C46–C51.
- **Sandbox:** `sandbox/components/an-columns/`, `an-assembly/` (manifests), `sandbox/data/assemblies.js`, journal 0.4.0.
- **Updates log:** `docs/updates.md` entry 7.
