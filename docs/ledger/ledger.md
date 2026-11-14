# Ledger

*Built from `records.js` by `build.js`: edit the records, then rebuild. Never edit this file by hand.*

The story of how the system came to be: each entry is an arc that opens with a gap (a problem, question, hypothesis, incident, theory or promotion), names the experiments that worked on it and what was given by hand, closes with a resolution or stays open, and says what it did to the [contracts](../contracts/README.md). It points back to the experiments and forward to the contract clauses. See the [README](README.md) for the kinds and codes.

## 1 · The first models: growing, averaging, layers

### QST-1 · Question: Can columns learn a catalogue of small patterns online, by growing and splitting?

- **Heat:** The starting point: does the basic idea learn anything at all?
- **Experiments:** [C01](../../experiments/sketches/C01-catalogue/), [C02](../../experiments/sketches/C02-explain-and-grow/), [C03](../../experiments/sketches/C03-fewest-parts/)
- **Given by hand:** The catalogue of 98 patterns (C01). An offline yardstick (C03), declared as not allowed for the machine.
- **Closed by OUT-1 · Outcome (partly):** Columns grow and every pattern gets a code, but they leave crumbs, and the catalogue isn't very compressible: the best case (40 parts for 98 patterns) needs an offline search.
- **PAT-1 · Pattern:** Heat measured as pixels left over plus pixels wrong, as a share of ink.
- **Contract:** shaped CTR-1 DEF-2; shaped CTR-1 DEF-3; shaped CTR-1 CON-4
- **Lesson:** Heat can be measured as what isn't explained; and a yardstick shows how far from the best a learner is.

### HYP-1 · Hypothesis: Layers that differ only in how fast they change (a funnel, fast to slow) give memory from specific to general.

- **Heat:** One region can't hold both what is new and what is common.
- **Experiments:** [C04](../../experiments/sketches/C04-funnel-and-episodes/), [C05](../../experiments/sketches/C05-plasticity/), [C06](../../experiments/sketches/C06-funnel-plasticity/)
- **Given by hand:** Plasticity rates per layer, set by hand.
- **Closed by OUT-2 · Outcome (partly):** Fast-to-slow works best, and episodes alongside columns cool everything; but each gain depends on rates someone chose.
- **APT-1 · Anti-pattern:** Tuning rates to make a test pass: it works, then the next world needs new rates.
- **Contract:** shaped CTR-1 CON-2; shaped CTR-1 CAP-11
- **Lesson:** Specific and general memory are both needed, but numbers set by hand make every result a tuning result.

### HYP-2 · Hypothesis: Attention: look only where it is still hot.

- **Heat:** Every layer was doing all the work on every picture.
- **Experiments:** [C07](../../experiments/sketches/C07-attention/)
- **Given by hand:** The cascade order and rates of C04-C06.
- **Closed by OUT-3 · Outcome (worked):** Detail-first attention gave the same results for about half the work.
- **Contract:** shaped CTR-1 PRN-3; shaped CTR-1 CAP-7; shaped CTR-1 OPZ-2
- **Lesson:** Effort can follow heat: work only where something doesn't fit.

### HYP-3 · Hypothesis: Layers can grow in stages, each appearing when the one below has settled; and soft columns can compete to explain parts.

- **Heat:** Fixed layer sizes were a choice; growth should come from learning.
- **Experiments:** [C08](../../experiments/sketches/C08-staged-growth/), [C09](../../experiments/sketches/C09-heat-only-updates/), [C10](../../experiments/sketches/C10-outcompeted/), [C11](../../experiments/sketches/C11-upside-down/), [C12](../../experiments/sketches/C12-restless/)
- **Given by hand:** Learning rates, settling windows, fade times, "restless" jiggle amounts.
- **Closed by OUT-4 · Outcome (failed):** Soft, averaging columns learn slowly, look settled before they are, and every fix (heat-scaled updates, upside-down layers, restless idle columns) added a mechanism and a number.
- **APT-2 · Anti-pattern:** Averaging: slow, blurred, and each repair needs another setting.
- **Contract:** shaped CTR-1 CAP-1; shaped CTR-1 CON-2; shaped CTR-1 OPZ-3
- **Lesson:** Averaging can't find logical parts, and patching it piles up structure on structure.

### HYP-4 · Hypothesis: Start with no columns and take a snapshot whenever no column is at least 90% similar (the owner's).

- **Heat:** Columns should appear because something new arrived, not on a schedule.
- **Experiments:** [C14](../../experiments/sketches/C14-snapshots/), [C15](../../experiments/sketches/C15-layered-snapshots/)
- **Given by hand:** The 90% similarity threshold (and 90-50% for layers in C15).
- **Closed by OUT-5 · Outcome (worked):** It settles just under the number of patterns by itself, and layered snapshots give specific surface to general depths.
- **DEC-1 · Decision:** Remember a picture when less than 90% of it is explained (decision 003). Retired in C30.
- **Contract:** shaped CTR-1 CAP-11
- **Lesson:** Keeping what's new as a whole is simple and stable; the threshold is the debt it leaves.

## 2 · Compare, don't average; one currency; cells

### HYP-5 · Hypothesis: Factoring at rest: compare memories with each other, and what two share becomes a part.

- **Heat:** Averaging had failed (OUT-4); the parts had to come some other way.
- **Experiments:** [C16](../../experiments/sketches/C16-factoring/), [C17](../../experiments/sketches/C17-composition/)
- **Given by hand:** The 90% snapshot rule from HYP-4.
- **Closed by OUT-6 · Outcome (worked):** One rest cut 76 parts to 57 and energy from 559 to 328, with nothing lost and no new settings; composing at rest then builds layers of composites.
- **CLM-1 · Claim:** Compare, don't average: what two things share is a part, found from two examples.
- **PAT-2 · Pattern:** Awake and rest: receive quickly, reorganise while nothing comes in.
- **DEC-4 · Decision:** Search at rest is greedy: the first move that lowers energy is kept (decisions 001, 002).
- **Contract:** created CTR-1 CAP-1; created CTR-1 CAP-5; shaped CTR-1 OPZ-1; shaped CTR-1 CON-1; shaped CTR-1 CON-12
- **Lesson:** The turning point of the project: comparison finds logical parts, fast and exactly.

### QST-2 · Question: Can it learn a thing once and recognise it anywhere, and in any number?

- **Heat:** A part stored at one position is useless elsewhere.
- **Experiments:** [C18](../../experiments/sketches/C18-shift-invariance/), [C19](../../experiments/sketches/C19-instances/)
- **Given by hand:** The scene world (shapes and objects at random places).
- **Closed by CLM-2 · Claim:** Yes: parts stored once in their own frame, placed by offset; many copies in one scene are explained and counted.
- **PAT-3 · Pattern:** Placements: a part plus an offset, so a composite keeps its children's arrangement.
- **Contract:** confirmed CTR-1 GOL-1; shaped CTR-1 CAP-8
- **Lesson:** Store once, place anywhere.

### PRB-1 · Problem: Costs were counted in different units, and settings remained.

- **Heat:** With mixed units, every comparison of costs needed a weight.
- **Experiments:** [C20](../../experiments/sketches/C20-flow-energy/)
- **Given by hand:** The flow window of 100 pictures (decision 008).
- **Closed by SOL-1 · Solution:** One currency taken from the world: a loose or wrong pixel costs 1, a stored pixel 1, a placement 1 plus the cost of naming which part. Energy = structure + flow.
- **DEC-2 · Decision:** The flow window: the last 100 pictures (decision 008).
- **Contract:** created CTR-1 CON-2; created CTR-1 DEF-1; created CTR-1 DEF-5; created CTR-1 CAP-6
- **Lesson:** When everything is priced in one unit from the world, thresholds come free.

### HYP-6 · Hypothesis: A column's cells are a grid of offsets, so which cell is active says where (the owner's).

- **Heat:** Pointers can't overlap or be recalled from a part.
- **Experiments:** [C21](../../experiments/sketches/C21-codes/)
- **Given by hand:** Sampling 3 cells per child for an assembly (a crutch, removed in C26).
- **Closed by OUT-7 · Outcome (worked):** What and where are kept apart: the same thing anywhere has the same assembly; only its floor-0 cells move.
- **Contract:** created CTR-1 CAP-2
- **Lesson:** Position for free, by which cell is lit.

### QST-3 · Question: Can it bring back a whole thing from part of it?

- **Heat:** Recognition from a full view isn't enough; the world hides things.
- **Experiments:** [C22](../../experiments/sketches/C22-completion/)
- **Given by hand:** In one test, where the hidden rectangle is (told and not told both reported).
- **Closed by CLM-3 · Claim:** Yes: completion by the energy rule, not a threshold; recognised from about three quarters of a thing when not told what is hidden.
- **Contract:** created CTR-1 CAP-3; confirmed CTR-1 CAP-6
- **Lesson:** Recall is completion, priced like everything else.

### QST-4 · Question: Can it learn what follows what (states and transitions), steered by a held context?

- **Heat:** A machine in a world needs what happens next, not just what is.
- **Experiments:** [C23](../../experiments/sketches/C23-transitions/)
- **Given by hand:** The context, held from outside.
- **Closed by CLM-4 · Claim:** Yes: states as cells, transitions as links; a held context steers which transition wins.
- **Contract:** shaped CTR-1 CAP-10; shaped CTR-1 DEF-6
- **Lesson:** Happenings can use the same cells as things.

### HYP-7 · Hypothesis: Decompose changes, don't average them: compare remembered transitions as parts are compared (the owner's).

- **Heat:** A change learnt in one place should apply anywhere.
- **Experiments:** [C24](../../experiments/sketches/C24-shared-changes/)
- **Closed by OUT-8 · Outcome (worked):** Shared changes, kept without position, apply in places never seen; the most detailed fit wins.
- **DEC-3 · Decision:** On equal detail, the change seen most wins (decision 005).
- **Contract:** created CTR-1 CAP-8; confirmed CTR-1 CAP-1
- **Lesson:** Comparison works on happenings as well as things.

### QST-5 · Question: Can it learn the rules of a moving world (bumpers) from pictures alone?

- **Heat:** A first world with real dynamics.
- **Experiments:** [C25](../../experiments/sketches/C25-bumpers/)
- **Given by hand:** The world's true rules (the machine sees only pictures).
- **Closed by OUT-9 · Outcome (partly):** With where things were a moment ago in the state, the bouncing stick went from 59% to 100%.
- **Contract:** created CTR-1 CAP-12
- **Lesson:** History in the state gives direction without a separate mechanism.

### PRB-2 · Problem: Crutches had crept in (sampled cells, thresholds, filters), and completion invented pixels.

- **Heat:** Results could no longer be trusted to come from the rule.
- **Experiments:** [C26](../../experiments/sketches/C26-clean/)
- **Closed by SOL-2 · Solution:** The crutches were removed and replaced by the rule; completion refuses ties (when evidence fits two things equally, neither).
- **APT-3 · Anti-pattern:** Crutches: they make a test pass and make the result an illusion.
- **Contract:** created CTR-1 CON-3; created CTR-1 CON-7; created CTR-2 CON-3; shaped CTR-1 PRN-2
- **Lesson:** When the evidence can't decide, don't decide; and take crutches away rather than add more.

### QST-6 · Question: What happens in situations like this one, when nothing exactly like it was seen?

- **Heat:** Exact memory alone can't generalise to new surroundings.
- **Experiments:** [C27](../../experiments/sketches/C27-similar/)
- **Given by hand:** The rounding scales (2, 4, 8, 16) for nearby positions.
- **Closed by OUT-10 · Outcome (partly):** Exact first, similarity only where needed, works; two other versions didn't (kept for the record).
- **Contract:** challenged CTR-1 CAP-2
- **Lesson:** Nearby positions aren't alike in cells; graded positions are still open.

## 3 · Kinds, one energy, limits

### HYP-8 · Hypothesis: Kinds: one form with a slot whose piece can vary.

- **Heat:** Versions of a thing were held separately, so a change had to be learnt for each.
- **Experiments:** [C28](../../experiments/sketches/C28-kinds/), [C29](../../experiments/sketches/C29-one-energy/)
- **Closed by OUT-11 · Outcome (worked):** With seeing-only energy, kinds form then dissolve; with change in the same bill, they pay, and one change covers every version.
- **CLM-5 · Claim:** One energy: seeing and change in one bill.
- **Contract:** confirmed CTR-1 CAP-8; confirmed CTR-1 CON-1; created CTR-1 DEF-6
- **Lesson:** Structure pays only when everything it saves is counted in the same bill.

### PRB-3 · Problem: The 90% memory threshold was a number set by hand.

- **Heat:** A tuned number at the centre of memory.
- **Experiments:** [C30](../../experiments/sketches/C30-memory-threshold/)
- **Closed by SOL-3 · Solution:** Remember a picture only if energy is lower with it stored. DEC-1 retired.
- **Contract:** confirmed CTR-1 CON-2; confirmed CTR-1 PRN-2
- **Lesson:** A number replaced by the rule.

### HYP-9 · Hypothesis: Changes need kinds of their own (slot cells in the state).

- **Heat:** Versions might need their own changes.
- **Experiments:** [C31](../../experiments/sketches/C31-change-kinds/)
- **Closed by OUT-12 · Outcome (not borne out):** The transition memory already generalised; slot cells were harmless but gave nothing, so they stayed out.
- **Contract:** confirmed CTR-1 CON-1
- **Lesson:** Build only what pays, including in the engine's own design.

### QST-7 · Question: Should a kind that nearly fits take on a new version?

- **Heat:** A table with a peak was read as 90%, not 100%.
- **Experiments:** [C32](../../experiments/sketches/C32-near-fit/)
- **Given by hand:** Applied by hand to test it.
- **Closed by CLM-6 · Claim:** Energy rightly rejects it on thin evidence; with every picture in the flow the unchanged engine already predicts 100%.
- **INC-1 · Incident:** A kind's cached version could point at the wrong filler after an undone move (ids are reused). Fixed in the core.
- **Contract:** confirmed CTR-1 CON-1
- **Lesson:** Thin evidence should lose; the flow window is a debt (DEC-2).

### PRB-4 · Problem: Busy scenes stop learning.

- **Heat:** Real worlds are busy.
- **Experiments:** [C33](../../experiments/sketches/C33-scale/) [C33](../../experiments/sketches/C33-scenes/)
- **Given by hand:** Scenes of up to 10 objects.
- **Still open.**
- **Contract:** challenged CTR-1 GOL-1; shaped CTR-1 OPZ-5
- **Lesson:** A busy picture is never kept, because it only pays later, after rest has broken it into shared pieces.

### QST-8 · Question: Does the engine depend on the square grid?

- **Heat:** Generality: nothing should be written for one kind of world.
- **Experiments:** [C34](../../experiments/sketches/C34-hex/)
- **Given by hand:** The hexagonal world.
- **Closed by CLM-7 · Claim:** No: it learnt a hex world unchanged. Turning is where hex differs, and the engine can't use turns yet.
- **Contract:** confirmed CTR-1 CON-3
- **Lesson:** Offsets are just pairs of numbers.

### HYP-10 · Hypothesis: Dendritic segments: evidence counted per assembly, not pooled in cells (the owner's).

- **Heat:** Cells shared by many memories could blur them together.
- **Experiments:** [C35](../../experiments/sketches/C35-segments/)
- **Closed by OUT-13 · Outcome (worked):** Completion already is the segments idea (identical in 100% of scenes); pooled cells collapse at once (80% wrong with 5 things).
- **Contract:** created CTR-1 CON-9; confirmed CTR-1 CAP-3
- **Lesson:** Cells carry no numbers; evidence belongs to each memory.

## 4 · Joining, checking, regions (the branch)

### HYP-11 · Hypothesis: An abstract region over the things seen: the same engine one level up.

- **Heat:** A walk through the park is a sequence of things, not pixels.
- **Experiments:** [C36](../../experiments/sketches/C36-abstract/), [C48](../../experiments/sketches/C48-identity/), [C53](../../experiments/sketches/C53-abstract-items/)
- **Given by hand:** Values on points (identity), and a walk remembered as one memory (o.atoms), as switches.
- **Closed by OUT-14 · Outcome (worked):** With identity and a walk as one memory of its items, the region learns walks and their parts.
- **Contract:** created CTR-1 CAP-9; shaped CTR-1 PRN-6
- **Lesson:** The same mechanism with different settings.

### THY-1 · Theory: Imagination: heat makes things loosen, and settling joins pieces that fit (the owner's).

- **Heat:** How could the machine think of what it has never seen?
- **Experiments:** [C37](../../experiments/sketches/C37-imagine/)
- **Closed by OUT-15 · Outcome (partly):** Settling imagined combinations; led to the joining work (PRB-5).
- **Contract:** shaped CTR-1 CAP-7
- **Lesson:** A gap is heat.

### PRB-5 · Problem: Joining routes never walked as one, without a route-finding search (the owner ruled search out).

- **Heat:** Planning without a planner.
- **Experiments:** [C38](../../experiments/sketches/C38-routes/), [C39](../../experiments/sketches/C39-park-map/), [C40](../../experiments/sketches/C40-tiny-map/), [C44](../../experiments/sketches/C44-waves/), [C45](../../experiments/sketches/C45-learn-then-join/), [C50](../../experiments/sketches/C50-narrow-join/), [C51](../../experiments/sketches/C51-threshold/)
- **Given by hand:** In C40, every place hidden but the bench and the oak (the question).
- **Closed by SOL-4 · Solution:** The moving bar: while a gap is open the bar for waking a memory drops from 2 to 1; where the sides meet it goes back up and each half is joined the same way. It equals pushing from both ends (C44).
- **INC-2 · Incident:** An engine hang in rest when kinds shared a set (C40). Fixed in the core; tests identical.
- **Contract:** created CTR-1 CAP-7; confirmed CTR-1 CON-3; shaped CTR-1 PRN-1
- **Lesson:** Search is the recall rule with the bar lowered.

### QST-9 · Question: Can a made-up route be checked against what was lived?

- **Heat:** Joining can invent routes that don't exist.
- **Experiments:** [C41](../../experiments/sketches/C41-episodes/), [C46](../../experiments/sketches/C46-check-against-days/)
- **Closed by SOL-5 · Solution:** A store of experiences: a route is trusted only if every step was lived.
- **Contract:** created CTR-1 CON-8; shaped CTR-1 PRN-5
- **Lesson:** Grounding: what was lived checks what was inferred.

### QST-10 · Question: Do experiences need their own rule for keeping, or can one rule do?

- **Heat:** The energy rule never keeps a one-off.
- **Experiments:** [C47](../../experiments/sketches/C47-two-rules/)
- **Closed by CLM-8 · Claim:** Two rules: general memory keeps what pays; experiences are kept at once, refreshed, the oldest fading (cap 50).
- **TRD-1 · Trade-off:** One-shot memory costs a second rule.
- **Contract:** created CTR-1 CAP-11; shaped CTR-1 CON-14
- **Lesson:** Two kinds of memory, two rules.

### HYP-12 · Hypothesis: General assemblies with slots (kinds over items, several slots).

- **Heat:** Many walks share a shape with different pieces.
- **Experiments:** [C42](../../experiments/sketches/C42-hub-kinds/), [C43](../../experiments/sketches/C43-item-learner/), [C49](../../experiments/sketches/C49-general-only/), [C52](../../experiments/sketches/C52-multi-slot/)
- **Given by hand:** Hidden steps marked by hand to pose recall questions (C42-C48). Slots paired by position.
- **Still open.**
- **Contract:** challenged CTR-1 CAP-8
- **Lesson:** Open: how general assemblies should be priced (parked by the owner).

### HYP-13 · Hypothesis: Feedback from the abstract region to the visual one: context lowers the cost of what is expected (the owner's, after HTM).

- **Heat:** Obscured views were misread.
- **Experiments:** [C54](../../experiments/sketches/C54-two-regions-bar/), [C55](../../experiments/sketches/C55-feedback/)
- **Given by hand:** The wiring between the regions.
- **Closed by OUT-16 · Outcome (worked):** Context helps when readings are ranked by saving net of price; a second look without context catches misfits.
- **PAT-4 · Pattern:** The second look: on a misfit, re-read without context.
- **Contract:** shaped CTR-1 PRN-4; shaped CTR-1 GOL-4
- **Lesson:** Regions help each other, and a region checks its own misfit first.

### PRO-1 · Promotion: Bring the ideas together in one working copy: the branch.

- **Heat:** Sketches were scattered; the whole loop had never run together.
- **Experiments:** [C56](../../experiments/sketches/C56-integrated/)
- **Closed by OUT-17 · Outcome (worked):** From sketch to branch: the integrated engine copy runs the whole loop, with the engine tests identical.
- **Contract:** created CTR-2 CAP-1
- **Lesson:** A branch keeps ideas together without touching the core.

### PRB-6 · Problem: Misperceptions became experiences, and a made-up route was trusted.

- **Heat:** Checking against experience is worthless if experience is wrong.
- **Experiments:** [C57](../../experiments/sketches/C57-days-replay/), [C58](../../experiments/sketches/C58-misperceptions/)
- **Closed by SOL-6 · Solution:** Refuse ties when reading, and replay at rest: 6/6 real routes, none made up. Counting how often a step was lived didn't help.
- **Contract:** confirmed CTR-1 CON-7; shaped CTR-1 CON-6; confirmed CTR-1 CAP-5
- **Lesson:** Resolve, don't mask: a misreading that settles into memory hides the misfit.

### PRO-2 · Promotion: Bring seeing, cells, completion, change, kinds and one energy into the core.

- **Heat:** Experiments had shown them; the main line didn't have them.
- **Experiments:** [C20](../../experiments/sketches/C20-flow-energy/), [C21](../../experiments/sketches/C21-codes/), [C22](../../experiments/sketches/C22-completion/), [C23](../../experiments/sketches/C23-transitions/), [C24](../../experiments/sketches/C24-shared-changes/), [C26](../../experiments/sketches/C26-clean/), [C28](../../experiments/sketches/C28-kinds/), [C29](../../experiments/sketches/C29-one-energy/), [C30](../../experiments/sketches/C30-memory-threshold/)
- **Closed by OUT-18 · Outcome (worked):** From sketch to core: src/engine (see, cells, complete, change), with tests against baselines (checkpoints 01-10).
- **Contract:** shaped CTR-2 CON-1
- **Lesson:** Nothing goes into the core without evidence.

## 5 · Theories and heat

### THY-2 · Theory: Architecture and regulation: many regions, the same engine with a few settings, wired by a few kinds of connection; heat as distance from each region's stasis.

- **Heat:** How would many regions work together?
- **Still open.**
- **Contract:** created CTR-1 GOL-4; created CTR-1 CON-10; created CTR-1 DEF-9; created CTR-1 DEF-10
- **Lesson:** Set points come from outside.

### THY-3 · Theory: Feelings as heat: trapped heat is distress, patching is rationalising, outward heat is curiosity.

- **Heat:** What drives the machine to act?
- **Still open.**
- **Contract:** created CTR-1 GOL-3; created CTR-1 CON-6
- **Lesson:** Resolve, don't mask; curiosity is heat with a path.

### QST-11 · Question: Does a craving's heat turn into structure?

- **Heat:** The owner's picture of learning from wants.
- **Experiments:** [C59](../../experiments/sketches/C59-craving/)
- **Given by hand:** Coffee as an item after the café; the "ends count together" option.
- **Closed by OUT-19 · Outcome (partly):** The first craving found the way (bar dropped); once kept, the next craving needed no valve (6 woken, not 21). But one satisfied walk wasn't kept: only after 4 (repetition pays; satisfaction isn't in the bill).
- **CLM-9 · Claim:** Binding is Hebbian in spirit: repetition matters only because it makes a binding pay.
- **Contract:** created CTR-1 CAP-4; confirmed CTR-1 CAP-7
- **Lesson:** Heat becomes structure; but the energy rule alone turns repetition, not heat, into structure.

### HYP-14 · Hypothesis: Heat bounds a memory: an experience runs from where a want's heat rose to where it fell (the owner's).

- **Heat:** One satisfied walk should be enough; and memories need edges.
- **Experiments:** [C60](../../experiments/sketches/C60-heat-arc/)
- **Given by hand:** The craving's rise and fall (from the body); the walk itself.
- **Closed by OUT-20 · Outcome (worked):** Kept at the arc as an experience: the next craving comes straight back with no valve and lasts. Energy alone keeps nothing; every walk kept fades; the whole stretch brings back extras.
- **Contract:** confirmed CTR-1 CAP-11; confirmed CTR-1 CAP-10; confirmed CTR-1 CON-1
- **Lesson:** Heat decides what is worth keeping as an experience, and where it starts and ends.

### THY-4 · Theory: Regulators and heat: everything is a regulator; a disturbance spreads and is settled together.

- **Heat:** From regions to whole systems.
- **Still open.**
- **Contract:** created CTR-1 PRN-4; confirmed CTR-1 GOL-4
- **Lesson:** Settle locally first; share what can't be settled.

### QST-12 · Question: Searching for lost keys: does "don't look again" fall out without negative associations?

- **Heat:** Negation seemed to need a new kind of memory.
- **Experiments:** [C61](../../experiments/sketches/C61-lost-keys/)
- **Given by hand:** G1-G5 in C61 (house, perception, the want, tie order, house order when nothing fits).
- **Closed by OUT-21 · Outcome (partly):** In a sketch, pricing claims against what the machine itself has seen gives no repeats and leaves nothing behind; without holding its looks it is stuck. Not yet run through the engine.
- **APT-4 · Anti-pattern:** Puppeteering a result: marking rooms by hand gave 1.00 look, better than the true odds allow.
- **Contract:** created CTR-1 CON-13; created CTR-1 CAP-13; created CTR-2 PRN-3
- **Lesson:** Absence is a misfit against what was seen, not a stored "no".

### PRB-7 · Problem: Puppeteering drifts in and becomes normal (the owner, from earlier sessions).

- **Heat:** Results that rest on what was given waste the work.
- **Experiments:** [C61](../../experiments/sketches/C61-lost-keys/)
- **Closed by SOL-7 · Solution:** Declare what was given by hand in every experiment; claims only about what wasn't given.
- **Contract:** created CTR-2 CON-2; created CTR-2 OPZ-1
- **Lesson:** Puppeteer only to narrow in, and say so.

### PRB-8 · Problem: Goals were implicit and principles spread across many documents; things could be forgotten.

- **Heat:** Code, experiments and theories had become hard to reason about together.
- **Closed by SOL-8 · Solution:** Two contracts (the system, the practice) and this ledger.
- **Contract:** created CTR-1 GOL-1; created CTR-1 GOL-2; created CTR-1 OPZ-1; created CTR-1 OPZ-3; created CTR-2 GOL-2
- **Lesson:** A small contract to reason by, and a ledger of how it came to be.

### PRB-9 · Problem: Owner and agent drifted apart in words: terms made up by the agent, gaps filled with the reader's own picture.

- **Heat:** Misreadings cost time and send work the wrong way.
- **Closed by SOL-9 · Solution:** Plain words agreed before use; visuals (docs/visuals) walked through by what to press; detailed guides where misreading is likely (docs/guides).
- **Contract:** created CTR-2 CON-5; created CTR-2 CAP-2; created CTR-2 PRN-5; created CTR-2 PRN-6; confirmed CTR-2 CAP-3
- **Lesson:** A picture leaves less room to read different things into the words.

## Index back: experiments

| Experiment | Entries |
|---|---|
| [C01](../../experiments/sketches/C01-catalogue/) | QST-1 |
| [C02](../../experiments/sketches/C02-explain-and-grow/) | QST-1 |
| [C03](../../experiments/sketches/C03-fewest-parts/) | QST-1 |
| [C04](../../experiments/sketches/C04-funnel-and-episodes/) | HYP-1 |
| [C05](../../experiments/sketches/C05-plasticity/) | HYP-1 |
| [C06](../../experiments/sketches/C06-funnel-plasticity/) | HYP-1 |
| [C07](../../experiments/sketches/C07-attention/) | HYP-2 |
| [C08](../../experiments/sketches/C08-staged-growth/) | HYP-3 |
| [C09](../../experiments/sketches/C09-heat-only-updates/) | HYP-3 |
| [C10](../../experiments/sketches/C10-outcompeted/) | HYP-3 |
| [C11](../../experiments/sketches/C11-upside-down/) | HYP-3 |
| [C12](../../experiments/sketches/C12-restless/) | HYP-3 |
| [C14](../../experiments/sketches/C14-snapshots/) | HYP-4 |
| [C15](../../experiments/sketches/C15-layered-snapshots/) | HYP-4 |
| [C16](../../experiments/sketches/C16-factoring/) | HYP-5 |
| [C17](../../experiments/sketches/C17-composition/) | HYP-5 |
| [C18](../../experiments/sketches/C18-shift-invariance/) | QST-2 |
| [C19](../../experiments/sketches/C19-instances/) | QST-2 |
| [C20](../../experiments/sketches/C20-flow-energy/) | PRB-1, PRO-2 |
| [C21](../../experiments/sketches/C21-codes/) | HYP-6, PRO-2 |
| [C22](../../experiments/sketches/C22-completion/) | QST-3, PRO-2 |
| [C23](../../experiments/sketches/C23-transitions/) | QST-4, PRO-2 |
| [C24](../../experiments/sketches/C24-shared-changes/) | HYP-7, PRO-2 |
| [C25](../../experiments/sketches/C25-bumpers/) | QST-5 |
| [C26](../../experiments/sketches/C26-clean/) | PRB-2, PRO-2 |
| [C27](../../experiments/sketches/C27-similar/) | QST-6 |
| [C28](../../experiments/sketches/C28-kinds/) | HYP-8, PRO-2 |
| [C29](../../experiments/sketches/C29-one-energy/) | HYP-8, PRO-2 |
| [C30](../../experiments/sketches/C30-memory-threshold/) | PRB-3, PRO-2 |
| [C31](../../experiments/sketches/C31-change-kinds/) | HYP-9 |
| [C32](../../experiments/sketches/C32-near-fit/) | QST-7 |
| [C33](../../experiments/sketches/C33-scale/) [C33](../../experiments/sketches/C33-scenes/) | PRB-4 |
| [C34](../../experiments/sketches/C34-hex/) | QST-8 |
| [C35](../../experiments/sketches/C35-segments/) | HYP-10 |
| [C36](../../experiments/sketches/C36-abstract/) | HYP-11 |
| [C37](../../experiments/sketches/C37-imagine/) | THY-1 |
| [C38](../../experiments/sketches/C38-routes/) | PRB-5 |
| [C39](../../experiments/sketches/C39-park-map/) | PRB-5 |
| [C40](../../experiments/sketches/C40-tiny-map/) | PRB-5 |
| [C41](../../experiments/sketches/C41-episodes/) | QST-9 |
| [C42](../../experiments/sketches/C42-hub-kinds/) | HYP-12 |
| [C43](../../experiments/sketches/C43-item-learner/) | HYP-12 |
| [C44](../../experiments/sketches/C44-waves/) | PRB-5 |
| [C45](../../experiments/sketches/C45-learn-then-join/) | PRB-5 |
| [C46](../../experiments/sketches/C46-check-against-days/) | QST-9 |
| [C47](../../experiments/sketches/C47-two-rules/) | QST-10 |
| [C48](../../experiments/sketches/C48-identity/) | HYP-11 |
| [C49](../../experiments/sketches/C49-general-only/) | HYP-12 |
| [C50](../../experiments/sketches/C50-narrow-join/) | PRB-5 |
| [C51](../../experiments/sketches/C51-threshold/) | PRB-5 |
| [C52](../../experiments/sketches/C52-multi-slot/) | HYP-12 |
| [C53](../../experiments/sketches/C53-abstract-items/) | HYP-11 |
| [C54](../../experiments/sketches/C54-two-regions-bar/) | HYP-13 |
| [C55](../../experiments/sketches/C55-feedback/) | HYP-13 |
| [C56](../../experiments/sketches/C56-integrated/) | PRO-1 |
| [C57](../../experiments/sketches/C57-days-replay/) | PRB-6 |
| [C58](../../experiments/sketches/C58-misperceptions/) | PRB-6 |
| [C59](../../experiments/sketches/C59-craving/) | QST-11 |
| [C60](../../experiments/sketches/C60-heat-arc/) | HYP-14 |
| [C61](../../experiments/sketches/C61-lost-keys/) | QST-12, PRB-7 |

## Index forward: contract clauses

What shaped each clause. A clause with no entries hasn't been tested or argued for yet.

| Clause | | Entries |
|---|---|---|
| CTR-1 DEF-1 | Energy: the cost of the whole description: what the machine keeps (DEF-4) plus what it costs to ex | PRB-1 (created) |
| CTR-1 DEF-2 | Heat: energy that a better description could remove: anything not yet cheaply explained. | QST-1 (shaped) |
| CTR-1 DEF-3 | Misfit: parts that don't fit cheaply together: a gap, a conflict, something unexplained. The sourc | QST-1 (shaped) |
| CTR-1 DEF-4 | Structure: what the machine keeps: parts, things built from parts, memories. | — |
| CTR-1 DEF-5 | Flow: what it costs to explain what the machine receives with the structure it has. | PRB-1 (created) |
| CTR-1 DEF-6 | Change: what it costs to describe what moved from one moment to the next. | QST-4 (shaped), HYP-8 (created) |
| CTR-1 DEF-7 | Settling: the machine changing its structure so that energy falls; it settles when no change lowers  | — |
| CTR-1 DEF-8 | World: whatever information the machine is placed in: what it receives, of any kind and size. | — |
| CTR-1 DEF-9 | Set point: a state the machine (or a part of it) is held towards from outside; distance from it is he | THY-2 (created) |
| CTR-1 DEF-10 | Region: one machine of this kind among several, each settling its own heat and receiving from othe | THY-2 (created) |
| CTR-1 DEF-11 | Memory: structure kept because it lowers energy, recalled from part of itself. | — |
| CTR-1 GOL-1 | Learns unsupervised: placed in any world (DEF-8), it resolves the misfits (DEF-3) in what  | QST-2 (confirmed), PRB-4 (challenged), PRB-8 (created) |
| CTR-1 GOL-2 | Useful on the job: no training phase before use. It starts doing useful work at once, or n | PRB-8 (created) |
| CTR-1 GOL-3 | Acts on its own heat: what it looks at and does comes from its own heat (DEF-2), with noth | THY-3 (created) |
| CTR-1 GOL-4 | Regions (DEF-10) settle each other: heat in one is resolved by the system as a whole. | HYP-13 (shaped), THY-2 (created), THY-4 (confirmed) |
| CTR-1 OPZ-1 | Information: learn as much or more from far less information than today's AI needs. | HYP-5 (shaped), PRB-8 (created) |
| CTR-1 OPZ-2 | Compute: fewer resources (time, memory, power) for the same learning, on ordinary CPUs (CO | HYP-2 (shaped) |
| CTR-1 OPZ-3 | Minimality: the fewest constructs that explain the most. | HYP-3 (shaped), PRB-8 (created) |
| CTR-1 OPZ-4 | Heat: explain its world more completely: more misfits resolved, never masked (CON-6). | — |
| CTR-1 OPZ-5 | Scale: any size of world (DEF-8) and amount of memory (DEF-11). | PRB-4 (shaped) |
| CTR-1 CON-1 | One rule: a change to its structure is kept only if energy (DEF-1) falls. | HYP-5 (shaped), HYP-8 (confirmed), HYP-9 (confirmed), QST-7 (confirmed), HYP-14 (confirmed) |
| CTR-1 CON-2 | One currency, taken from the world: no hand-set weights or tuned parameters. | HYP-1 (shaped), HYP-3 (shaped), PRB-1 (created), PRB-3 (confirmed) |
| CTR-1 CON-3 | General: nothing in it is written for one task or one kind of world. Fixed architecture is | PRB-2 (created), QST-8 (confirmed), PRB-5 (confirmed) |
| CTR-1 CON-4 | Learns online, from nothing: no training set, no labels, no backpropagation. | QST-1 (shaped) |
| CTR-1 CON-5 | Runs on ordinary CPUs: no GPU, TPU or other specialised hardware. | — |
| CTR-1 CON-6 | Resolve, don't mask: energy may only fall because a misfit is resolved, never because its  | PRB-6 (shaped), THY-3 (created) |
| CTR-1 CON-7 | Don't guess: when the evidence fits two explanations equally, take neither. | PRB-2 (created), PRB-6 (confirmed) |
| CTR-1 CON-8 | Imagined is never stored as lived: what it joins or imagines never becomes an experience. | QST-9 (created) |
| CTR-1 CON-9 | Cells carry no numbers: no strengths or activation levels; evidence is counted per memory, | HYP-10 (created) |
| CTR-1 CON-10 | Its deepest set points (DEF-9) come from outside and are declared. | THY-2 (created) |
| CTR-1 CON-11 | It can't learn what isn't in what it receives. | — |
| CTR-1 CON-12 | It can't try every explanation: search at rest is always partial. | HYP-5 (shaped) |
| CTR-1 CON-13 | Evidence alone can't settle a true tie: only more evidence can (looking, acting). | QST-12 (created) |
| CTR-1 CON-14 | Memory is finite: good enough, not exact; exact records live outside it. | QST-10 (shaped) |
| CTR-1 CON-15 | No perfect memory (breaks CON-1 and OPZ-2). | — |
| CTR-1 CON-16 | No labels or teacher as a shortcut (breaks GOL-1). | — |
| CTR-1 CON-17 | No exhaustive search for the best answer (breaks OPZ-2). | — |
| CTR-1 CAP-1 | Learning by comparing: two things side by side give what they share, directly. | HYP-3 (shaped), HYP-5 (created), HYP-7 (confirmed) |
| CTR-1 CAP-2 | Sparse distributed representations: a thing is a small set of cells; which cell says where | HYP-6 (created), QST-6 (challenged) |
| CTR-1 CAP-3 | Auto-associative memory: a few active pieces bring back the whole memory they belong to. | QST-3 (created), HYP-10 (confirmed) |
| CTR-1 CAP-4 | Binding what happens together (Hebbian in spirit): things active together become one memor | QST-11 (created) |
| CTR-1 CAP-5 | Rest: reorganising and replaying while nothing comes in. | HYP-5 (created), PRB-6 (confirmed) |
| CTR-1 CAP-6 | Thresholds from prices: when to keep, recall or recognise follows from the currency (CON-2 | PRB-1 (created), QST-3 (confirmed) |
| CTR-1 CAP-7 | Heat as a valve: search opens only where there is heat (DEF-2). | HYP-2 (shaped), THY-1 (shaped), PRB-5 (created), QST-11 (confirmed) |
| CTR-1 CAP-8 | Sharing: parts, kinds and shared changes let one thing learnt cover many cases. | QST-2 (shaped), HYP-7 (created), HYP-8 (confirmed), HYP-12 (challenged) |
| CTR-1 CAP-9 | The same engine at every level: regions (DEF-10) stacked with no new mechanism. | HYP-11 (created) |
| CTR-1 CAP-10 | Holding: a held context, want or episode steers what comes next. | QST-4 (shaped), HYP-14 (confirmed) |
| CTR-1 CAP-11 | Two kinds of memory: general memory keeps what pays over repetition; experiences are kept  | HYP-1 (shaped), HYP-4 (shaped), QST-10 (created), HYP-14 (confirmed) |
| CTR-1 CAP-12 | History in the state: what was a moment ago is part of now. | QST-5 (created) |
| CTR-1 CAP-13 | Not knowing is a reason to look: a refused tie (CON-7) becomes a cue for more evidence. | QST-12 (created) |
| CTR-1 CAP-14 | Exact records kept outside, in something it can read and write. | — |
| CTR-1 PRN-1 | Prefer the deeper explanation to a new mechanism. | PRB-5 (shaped) |
| CTR-1 PRN-2 | Prefer removing structure to adding it. | PRB-2 (shaped), PRB-3 (confirmed) |
| CTR-1 PRN-3 | Let heat decide where effort goes. | HYP-2 (shaped) |
| CTR-1 PRN-4 | Settle locally first. | HYP-13 (shaped), THY-4 (created) |
| CTR-1 PRN-5 | Prefer what was lived to what was inferred. | QST-9 (shaped) |
| CTR-1 PRN-6 | Prefer the same mechanism with different settings to a different mechanism. | HYP-11 (shaped) |
| CTR-2 DEF-1 | The core: `src/engine/`, the main line. | — |
| CTR-2 DEF-2 | The branch: the integrated working copy, `experiments/sketches/C56-integrated/engine/`. | — |
| CTR-2 DEF-3 | A sketch: an experiment copy outside both, for a quick question. | — |
| CTR-2 DEF-4 | Given by hand (puppeteering): anything supplied by the experimenter instead of done by the machine. | — |
| CTR-2 DEF-5 | A crutch: a number tuned to pass a test, a filter, or a rule written for a task. | — |
| CTR-2 DEF-6 | A patch: structure added to cover a misfit instead of resolving it. | — |
| CTR-2 DEF-7 | A declared choice: anything in the system that doesn't follow from its rule, written down with what would | — |
| CTR-2 DEF-8 | Evidence: a measured result against a baseline, with what was given by hand (DEF-4) stated. | — |
| CTR-2 GOL-1 | A system that fulfils CTR-1, with evidence (DEF-8) for each clause it claims. | — |
| CTR-2 GOL-2 | The owner and any agent who picks up the work hold the same understanding of it, without d | PRB-8 (created) |
| CTR-2 OPZ-1 | Less given by hand (DEF-4), in every experiment and in the system. | PRB-7 (created) |
| CTR-2 OPZ-2 | Fewer declared choices (DEF-7): each moved into the system's rule, or removed. | — |
| CTR-2 OPZ-3 | Less time lost: to results that rested on puppeteering, to drift, to misunderstanding. | — |
| CTR-2 OPZ-4 | The smallest code that fulfils CTR-1: fewest constructs and lines, echoing CTR-1 OPZ-3. | — |
| CTR-2 CON-1 | Nothing goes into the core (DEF-1) without evidence (DEF-8) and the owner's approval: test | PRO-2 (shaped) |
| CTR-2 CON-2 | Given by hand (DEF-4) only to narrow in on something, always declared, and no claim may re | PRB-7 (created) |
| CTR-2 CON-3 | No crutches (DEF-5) and no patches (DEF-6). | PRB-2 (created) |
| CTR-2 CON-4 | Every declared choice (DEF-7) is written in `docs/decisions/`. | — |
| CTR-2 CON-5 | No new terms without the owner's agreement; words keep the meanings in the glossary. | PRB-9 (created) |
| CTR-2 CON-6 | Commits and bundles only when the owner asks. | — |
| CTR-2 CAP-1 | Sketch, branch and core (DEF-3, DEF-2, DEF-1): ideas tried cheaply, kept apart until they' | PRO-1 (created) |
| CTR-2 CAP-2 | Visuals and the sandbox: agreeing how something works by seeing it. | PRB-9 (created) |
| CTR-2 CAP-3 | Written memory that outlasts a session: checkpoints, findings, theories, guides, contracts | PRB-9 (confirmed) |
| CTR-2 CAP-4 | The assistant: reasoning, writing, building and running experiments. | — |
| CTR-2 CAP-5 | The system itself as a helper ("Neil"), once it can hold our history. | — |
| CTR-2 PRN-1 | Don't change anything until you understand it. | — |
| CTR-2 PRN-2 | Measure against a baseline before believing a result; an explanation is not evidence. | — |
| CTR-2 PRN-3 | A result that looks too good is checked for what was given by hand (CON-2). | QST-12 (created) |
| CTR-2 PRN-4 | Inspired, not copied. | — |
| CTR-2 PRN-5 | Plain words, and pictures when words drift (CAP-2); walk through a visual by what to press | PRB-9 (created) |
| CTR-2 PRN-6 | Detail where misreading is likely: a reader fills gaps with their own picture. | PRB-9 (created) |

## Open

- PRB-4 · Problem: Busy scenes stop learning.
- HYP-12 · Hypothesis: General assemblies with slots (kinds over items, several slots).
- THY-2 · Theory: Architecture and regulation: many regions, the same engine with a few settings, wired by a few kinds of connection; heat as distance from each region's stasis.
- THY-3 · Theory: Feelings as heat: trapped heat is distress, patching is rationalising, outward heat is curiosity.
- THY-4 · Theory: Regulators and heat: everything is a regulator; a disturbance spreads and is settled together.
