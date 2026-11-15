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

## 6 · Text worlds

### QST-13 · Question: First text world: does comparing what it reads find the words, with nobody saying what a word is?

- **Heat:** Language is where the engine would be useful; the Zorro circle starts from what it already does.
- **Experiments:** [C62](../../experiments/sketches/C62-reading/)
- **Given by hand:** G1-G4 in C62: the 11-word language, where the eye lands (at random), the 8-letter window, spaces kept or removed.
- **Closed by OUT-22 · Outcome (partly):** Early on 8 of 11 words are kept as parts and its cuts beat chance in every run (F1 42-66% against 33-42%); but it keeps whatever recurs, including chunks across words and pieces shared between words, and more reading finds fewer words (8 to 4; 5 to 2 without spaces).
- **CLM-10 · Claim:** Energy alone can't tell a word from any other recurring stretch; a word is where what follows varies, which is a kind with a slot.
- **Contract:** challenged CTR-1 GOL-1; challenged CTR-1 CAP-1; shaped CTR-1 CAP-8
- **Lesson:** The edge of the circle: language is made of kinds, and the engine needs slots that pay to see its words.

### HYP-15 · Hypothesis: Words are what fills the slots: a word varies independently of its neighbours, which is a kind.

- **Heat:** C62: whole words lost out to whatever recurs.
- **Experiments:** [C63](../../experiments/sketches/C63-reading-kinds/)
- **Given by hand:** As C62 (G1-G4); nothing new.
- **Closed by OUT-23 · Outcome (partly):** The words lost from parts are held as fillers (without spaces, 7 of 11 as fillers against 2 as parts at 1000 looks); "the ·" gathers the nouns. But the slots get noisy (whole-word fillers fall from 90% to 45%) and no slot holds one part of speech.
- **CLM-11 · Claim:** A word is better seen as what varies in a slot than as a chunk that recurs.
- **Contract:** confirmed CTR-1 CAP-8; shaped CTR-1 GOL-1
- **Lesson:** Kinds see words; how slots are priced decides how clean they are (the parked question, HYP-12).

### THY-5 · Theory: Sparse, event-driven computation: things change only in reaction to other things, and a held state is another region's stable activity projecting in, not recomputed (the owner's).

- **Heat:** Large language models are expensive because they compute densely over everything; and held states so far were given by hand.
- **Still open.**
- **Contract:** created CTR-1 CON-18; created CTR-1 CAP-15
- **Lesson:** Cost should follow what is happening, not what is held.

### THY-6 · Theory: Persistent assemblies: what a region settled into stays active and changes only when something arriving doesn't fit it; these are the held states (the owner's).

- **Heat:** Held states were given by hand, and recomputing everything for every input is the opposite of event-driven.
- **Still open.**
- **Contract:** confirmed CTR-1 CON-18; shaped CTR-1 CAP-15; shaped CTR-1 CAP-10
- **Lesson:** A held state is what settled earlier and still fits.

### HYP-16 · Hypothesis: Persistent assemblies while reading: carry forward what settled, let go only on a misfit (from THY-6).

- **Heat:** Explaining every window from scratch is the opposite of event-driven.
- **Experiments:** [C64](../../experiments/sketches/C64-persistent-reading/)
- **Given by hand:** C62's G1-G4; G5: the eye steps on in order by 2 or 4 letters.
- **Closed by OUT-24 · Outcome (partly):** About half the work (3.3-5.1 of 8 letters explained afresh) with less left unexplained; misfits let go by themselves. Better cuts were mostly the seam between old and new letters, as a control showed; only without spaces at step 2 did persistence clearly cut better.
- **PAT-5 · Pattern:** A control with the same seam but nothing carried over: it separates the mechanism from where it cuts.
- **Contract:** confirmed CTR-1 CON-18; shaped CTR-1 CAP-15; confirmed CTR-1 OPZ-2; confirmed CTR-2 PRN-3
- **Lesson:** What still fits costs nothing; the claim that stands is about work and heat, not cuts.

### QST-14 · Question: Frames beyond literal placement: "the bird was flying and found and ate a worm" and "bird eats worm" share one frame underneath. How? (The owner expects to discover it, perhaps from the right architecture of regions.)

- **Heat:** Frames tied to exact positions can't see that different expressions say the same thing.
- **Still open.**
- **CLM-12 · Claim:** Words agreed (14 November): frame, constant, variable, type; invariant and variant. Kind, slot and filler are the code's old words; a list of fillers is not yet a type.
- **Contract:** shaped CTR-1 GOL-1; shaped CTR-1 CAP-8
- **Lesson:** A type is bounded by a shared overlap, inside or around; a list is not.

### HYP-17 · Hypothesis: Few-shot: comparison finds constants, frames and types from a handful of sentences after one rest, where statistics need much text (the owner's).

- **Heat:** Statistical learning is expensive because it estimates from counts.
- **Experiments:** [C65](../../experiments/sketches/C65-few-sentences/)
- **Given by hand:** G1-G3 in C65: words as items; the 12 sentences; each seen once, then one rest.
- **Closed by OUT-25 · Outcome (partly):** Held as experiences, constants come from two sentences ("the … warms the"); from 12, the constant of every frame, with energy more than halved by one rest; never-seen sentences are explained by one placement of their constant. Kept by energy, nothing. Frames with variables and types did not form.
- **CLM-13 · Claim:** Comparison sees a constant from two examples; few-shot needs what is seen once to be held and to take part in rest.
- **Contract:** confirmed CTR-1 OPZ-1; confirmed CTR-1 CAP-1; confirmed CTR-1 CAP-11; shaped CTR-1 GOL-2
- **Lesson:** Constants come at once; types need the surroundings compared.

### HYP-18 · Hypothesis: Types from what surrounds words: a region receiving each word's surroundings (its place marked) finds shared surroundings by comparison, and the words they explain form the types.

- **Heat:** C65: constants but no types; sun, sea and fire share no letters.
- **Experiments:** [C66](../../experiments/sketches/C66-types/)
- **Given by hand:** G1-G3 in C66; G3, the second region's view (each word's surroundings with its place marked), is the region wiring, given by hand.
- **Closed by OUT-26 · Outcome (worked):** From 16 sentences, each seen once and one rest, every group holds one type; from 24, every type's words are together. A word seen once (lamp) joins its type. Verbs group too (warms/heats; feeds/fills). A type is still split across surroundings (one group around "warms", another around "heats").
- **CLM-14 · Claim:** A type is the group bounded by a shared surrounding; comparison finds it from a handful of examples.
- **Contract:** confirmed CTR-1 GOL-1; confirmed CTR-1 OPZ-1; confirmed CTR-1 CAP-9; confirmed CTR-1 PRN-6
- **Lesson:** What surrounds a word is where its type lives; the same comparison finds it.

### HYP-19 · Hypothesis: Comparing the groups joins a type split across frames (in a world of people, to avoid borrowing the engine's words).

- **Heat:** C66: each type split into one group per verb.
- **Experiments:** [C67](../../experiments/sketches/C67-people-types/)
- **Given by hand:** G1-G4 in C67; G3 the second region's view and G4 the merging of groups are written by hand.
- **Closed by OUT-27 · Outcome (worked):** From 16 sentences, each seen once, all four types come out whole and alone, each joined from the groups around both its verbs; a word seen once is in its type. Not steady below 16: at 12 a mixed group is carried into the merge.
- **TRD-2 · Trade-off:** Merging groups spreads errors as well as types.
- **Contract:** confirmed CTR-1 CAP-3; confirmed CTR-1 OPZ-1
- **Lesson:** The recall rule's two also joins groups into types.

### PRB-10 · Problem: Results stay in the branches: bringing anything into the core feels like too high a barrier, and experiments keep their puppeteering and crutches.

- **Heat:** The core never benefits, and results rest on what was given.
- **Closed by SOL-10 · Solution:** Distillation: read an experiment against both contracts, list its violations clause by clause, and remove them one at a time, measuring after each, until it fulfils the contracts; only then is it a candidate for the core.
- **Contract:** created CTR-2 DEF-9; created CTR-2 DEF-10; created CTR-2 GOL-3; created CTR-2 CON-7; created CTR-2 CAP-6; created CTR-2 PRN-7; changed CTR-2 CON-1
- **Lesson:** Explore freely, then distil.

### PRO-3 · Promotion: Distillation D-01, step 1: move the merging of groups into types from a hand-written rule into the engine.

- **Heat:** C67's types rested on a rule written outside the engine (V3).
- **Experiments:** [C68](../../experiments/sketches/C68-distil-merge/)
- **Given by hand:** The remaining violations of D-01 (V1, V2, V4-V6, V8).
- **Closed by OUT-28 · Outcome (worked):** The result survives: the engine comparing the groups gives the same four types at 8 and 24 sentences. It is stricter (an overlap of two words doesn't pay for itself), so one type stays split at 16 and fewer mistakes are merged at 12.
- **PAT-6 · Pattern:** Distil one violation at a time and compare with the run before: a result that survives never depended on it.
- **Contract:** shaped CTR-2 GOL-3; confirmed CTR-2 PRN-7; confirmed CTR-1 CON-1
- **Lesson:** Removing a hand-written rule can leave the result standing and the engine stricter.

### PRB-11 · Problem: The contracts' lists read as if every clause weighed the same: specific clauses (about cells, hardware) sat among general ones, and nothing said which goal or optimization wins a trade-off.

- **Heat:** A rebuild could treat a detail as fundamental, and a trade-off had no way to be settled.
- **Closed by SOL-11 · Solution:** Every list runs from general to specific; goals, optimizations and principles are also in order of priority, with leeway: in a trade-off the higher one wins, and a large loss to it is never bought with a small gain to a lower one. Constraints have no priority, since none gives way. Codes stay with their clauses when they move.
- **DEC-5 · Decision:** Proposed order of the system's optimizations: heat, information, minimality, compute, scale.
- **Contract:** changed CTR-1 OPZ-4; changed CTR-1 OPZ-3; changed CTR-1 OPZ-2; changed CTR-1 CON-9; changed CTR-1 CAP-2; changed CTR-1 PRN-6; changed CTR-2 CON-1
- **Lesson:** Order says what matters most; a code says only which clause.

### HYP-20 · Hypothesis: Cells can learn logic from their own heat: segments as learnt ANDs, inhibition learnt from their own wrong predictions as NOT, and one rule with two signs growing AND and AND NOT (the owner's NAND idea). Brought in from the owner's other repository (sketches 36-39 there).

- **Heat:** A cell that only adds up does OR; rules that depend on a combination, and their exceptions, were out of reach or faked by a hashed shortcut.
- **Experiments:** [C69](../../experiments/sketches/C69-learnt-and/), [C70](../../experiments/sketches/C70-learnt-not/), [C71](../../experiments/sketches/C71-membership-segments/), [C72](../../experiments/sketches/C72-segments-two-signs/)
- **Given by hand:** The worlds and their words; segment sizes, thresholds and learning rates chosen (several values worked); strengths on segments and links.
- **Closed by OUT-29 · Outcome (partly):** AND learnt and generalised (C69); NOT learnt for exceptions with their own word (C70); whole-set segments kept shared cells apart but could not complete from half a cue (C71); one rule with two signs, AND NOT on a segment, learnt combination exceptions and improved the general rule at little cost (C72). Not yet run in Anneal's currency.
- **CLM-15 · Claim:** A cell is an OR of its segments, each an AND of its links; an "unless" on a segment makes AND NOT.
- **PAT-7 · Pattern:** Learn inhibition only from the machine's own wrong predictions, never from being told.
- **TRD-3 · Trade-off:** Segments are sharp, summed links tolerant: sharp keeps memories apart, tolerant completes from part.
- **Contract:** shaped CTR-1 CAP-4; shaped CTR-1 CAP-3; challenged CTR-1 CON-9; challenged CTR-1 CON-2; confirmed CTR-1 GOL-1
- **Lesson:** Logic can be grown from the two signs of heat; in Anneal it still has to be paid for in the one currency.

### HYP-21 · Hypothesis: A low bar plus competition gives segments both sharpness and tolerance: firing at two active links (from the prices) and competing in each column, a tie refused, on sketch 38's worlds.

- **Heat:** C71: segments at 75% kept memories apart but never completed from half a cue; at 60% they completed but blended.
- **Experiments:** [C73](../../experiments/sketches/C73-anneal-segments/)
- **Given by hand:** K = 8 columns per answer, the world, words, column codes and probes (all C71's).
- **Closed by OUT-30 · Outcome (partly):** As good as whole-set segments on episodes (69-95%), no blend on a split cue (0%), and completion from half a cue 28-42% where C71's segments gave 0 (summed links 81-86%). Without the cap of K columns, everything blends: competition inside columns is not enough.
- **CLM-16 · Claim:** Competition and the refused tie, not the bar, keep segments from blending.
- **PAT-8 · Pattern:** A cap given by hand can hide a missing mechanism: here K stood in for competition across columns.
- **Contract:** confirmed CTR-1 CAP-3; confirmed CTR-1 CON-7; challenged CTR-1 CON-18
- **Lesson:** The bar can be low if competition is real; what is still missing is competition between whole assemblies.

### HYP-22 · Hypothesis: Without the cap of K columns, answers size themselves if only the cells at the top level of support join: one shared level of inhibition, so whole memories compete with no list.

- **Heat:** C73: K = 8 given by hand stood in for competition across columns; without it, everything blended.
- **Experiments:** [C74](../../experiments/sketches/C74-no-k/)
- **Given by hand:** The world, words, column codes and probes (C71's). K removed.
- **Closed by OUT-31 · Outcome (worked):** Answers came out at 7.6 cells (an assembly is 8) with nothing setting it; half a cue completed as well as a whole one (71-87%), matching summed links at 8-16 cells per column and far better where cells are scarce; split cues almost never blended (1-3%). Episode recall a few points below the capped version, lost to refusals. Within half of the top blended everything.
- **CLM-17 · Claim:** A memory's cells share its count, so one shared level of inhibition lets whole memories compete with no list.
- **TRD-4 · Trade-off:** Taking only the top level refuses more often: a few points of recall for no number given by hand.
- **Contract:** confirmed CTR-1 CAP-3; confirmed CTR-1 CON-7; confirmed CTR-1 OPZ-1; confirmed CTR-2 OPZ-1; challenged CTR-1 CON-18
- **Lesson:** Sharp and tolerant need not be two mechanisms: the same segments, read through one shared level of inhibition, are both.

### HYP-23 · Hypothesis: Fitting's inner step already is competition (the biggest saver takes its cells, rivals recount); the search reruns it from every opening placement. Competition alone fits as well, keeps the same, and does far less work.

- **Heat:** Fitting looked like a central search that grows with memory and breaks CON-18.
- **Experiments:** [C75](../../experiments/sketches/C75-fitting-by-competition/)
- **Given by hand:** The engine test's world and pictures; a cap of 6 re-settling rounds (the settle arm, added after the test results).
- **Closed by OUT-32 · Outcome (worked):** Competition alone matched the search on 1,495 of 1,500 fresh scenes and learnt exactly the same on every seed, with about a fortieth of the work. Re-settling only where a winner left cells claimed but not lit matched all 1,500 and the engine's test suite, except completion with hidden parts (better when not told where; very slightly more pixels drawn at 40% removed).
- **CLM-18 · Claim:** Fitting is competition; the search over openings was overhead.
- **PAT-9 · Pattern:** Reopen competition only where heat is left: annealing in small.
- **DEC-6 · Decision:** Proposed for the owner: explain in the core becomes competition with re-settling.
- **Contract:** confirmed CTR-1 CON-18; confirmed CTR-1 OPZ-2; confirmed CTR-1 PRN-3; confirmed CTR-1 CAP-7; confirmed CTR-1 OPZ-3; challenged CTR-1 CON-7
- **Lesson:** What looked like a search was competition wrapped in a search; unwrapped, it costs a fortieth and loses nothing.

### PRO-4 · Promotion: Bring fitting by competition with re-settling into the core, replacing the search over opening placements.

- **Heat:** The core's fitting reran its competition from every opening placement: about 28 passes per picture, growing with memory.
- **Experiments:** [C75](../../experiments/sketches/C75-fitting-by-competition/)
- **Given by hand:** A cap of 6 re-settling rounds (compute limit, decision 001).
- **Closed by SOL-12 · Solution:** explain in src/engine/see.js is one competition plus re-settling only where heat is left; openings and greedy's take-this-first path removed. The full test suite passes and matches C75's settle run line for line; the seeing test ran in 13.1 s against 17.6 s.
- **Contract:** confirmed CTR-2 CON-1; confirmed CTR-1 CON-18; confirmed CTR-1 OPZ-3
- **Lesson:** A promotion is easy when the experiment already ran the real test suite.

### HYP-24 · Hypothesis: Compose parts by binding a small sample of their active cells (the owner's idea): with segments firing at two, two cells per part is the smallest binding that completes, and the cleanest.

- **Heat:** Composition was done at rest over a list of placements; nothing at the level of cells tied parts together.
- **Experiments:** [C76](../../experiments/sketches/C76-binding-a-sample/)
- **Given by hand:** A random world of parts and compositions; the sampled cells (the first two of each part); 6 rounds.
- **Closed by OUT-33 · Outcome (worked):** One sampled cell per part never brought the rest back; two always did, with 30 links per composition against 132 for wiring everything, far fewer intrusions (45% clean against 17% at 500 compositions) and about a fiftieth of the work. As memory filled, recall spread into other compositions; competition within columns did not stop it.
- **CLM-19 · Claim:** The bar of two sets the size of a binding: two cells from each part.
- **CLM-20 · Claim:** The smallest binding that completes is also the cleanest: extra links only add chances to fire by mistake.
- **Contract:** confirmed CTR-1 CAP-4; confirmed CTR-1 CAP-3; confirmed CTR-1 OPZ-3; confirmed CTR-1 CON-18; shaped CTR-1 CAP-6
- **Lesson:** A composition can be priced at the level of cells: the links in its binding.

### HYP-25 · Hypothesis: Crowding in C76 is fixed by more cells per column (the owner's view), or by competition between whole memories (C74).

- **Heat:** C76: as compositions were stored, recall spread into other compositions (45% clean at 500, 16 cells per column).
- **Experiments:** [C77](../../experiments/sketches/C77-binding-with-competition/)
- **Given by hand:** As C76.
- **Closed by OUT-34 · Outcome (worked):** More cells per column fixed it: 96% clean at 500 compositions with 64 cells. Top-level competition added nothing and cost about 25 times the work: a part sharing cells by chance gets the same support as a true one. At 64 cells, storing 50 times more raised work per recall from 144 to 278 checks.
- **CLM-21 · Claim:** Crowding is fixed in the code (more cells), not in the reading: competition cannot tell a chance overlap from a true part.
- **CLM-22 · Claim:** With enough cells, the work of recall follows what is active, not what is stored.
- **Contract:** confirmed CTR-1 CON-18; confirmed CTR-1 OPZ-5; confirmed CTR-1 CAP-2
- **Lesson:** Sparse codes are what make memory scale: more cells, less crosstalk, and work that grows with activity, not storage.

### PRB-12 · Problem: Assemblies were held as entries in a list and worked over by the program: bookkeeping, with cells not first-class; and scale was stated only as any size.

- **Heat:** The core's fitting scored a list of units centrally (C75); experiments C74, C76 and C77 did the same jobs with cells and segments alone.
- **Experiments:** [C74](../../experiments/sketches/C74-no-k/), [C75](../../experiments/sketches/C75-fitting-by-competition/), [C76](../../experiments/sketches/C76-binding-a-sample/), [C77](../../experiments/sketches/C77-binding-with-competition/)
- **Closed by SOL-13 · Solution:** CTR-1: cell, segment and assembly defined (DEF-12 to DEF-14); CON-19 (draft): the dynamics fall out of cells and their segments, nothing loops over whole assemblies; OPZ-5 restated: the work of receiving and recalling grows with what is active, not with what is stored. CTR-2: bookkeeping defined (DEF-11); CON-8 (draft): bookkeeping allowed in experiments, declared, never in the core; what is already there is a violation to distil.
- **Contract:** created CTR-1 DEF-12; created CTR-1 DEF-13; created CTR-1 DEF-14; created CTR-1 CON-19; changed CTR-1 OPZ-5; created CTR-2 DEF-11; created CTR-2 CON-8
- **Lesson:** Cells are the first-class citizens; a list of assemblies is a stand-in for what they should do.

### HYP-26 · Hypothesis: Decomposition by cells: a new input partly wakes the memory it resembles, the cells' states draw the cut (fits / predicted but not there / unexplained), and cutting there gives the shared part on the same cells.

- **Heat:** Decomposition at rest was bookkeeping: every pair of parts compared at every shift, every recent picture refitted per trial.
- **Experiments:** [C78](../../experiments/sketches/C78-decomposition-by-the-cut/)
- **Given by hand:** Random column worlds; the house stored exactly; which cells are sampled; binding segments know they bind (kind); one global level of inhibition.
- **Closed by OUT-35 · Outcome (worked):** Read through the top level of support, the cut found the right wall, roof and new roof in 100% of families; decomposed and rebound costs 114 links against 264; with bindings competing as whole memories each roof brought back its own whole (other roof 0-4%; clean 96-97% at 64 cells per column, 200 families). Without the top level the cut was right in 9-38%; read plainly, the shared wall woke both.
- **CLM-23 · Claim:** The cut between fit and misfit is where decomposition happens; the comparison is a memory partly woken by what resembles it.
- **CLM-24 · Claim:** A genuinely shared part is where competition between whole memories is needed; chance overlap is fixed only by more cells.
- **Contract:** confirmed CTR-1 CAP-1; confirmed CTR-1 CON-19; confirmed CTR-1 CAP-3; confirmed CTR-1 OPZ-3; challenged CTR-1 CON-7
- **Lesson:** Intercomparing, analysis and abstraction, done by cells: the premise of the project, shown in one mechanism.

### THY-7 · Theory: Cells first: the machine's behaviour falls out of cells and their segments, not a program keeping lists of assemblies. Columns separate memories across cells, segments within a cell; waking, completion, competition, fitting, composition and decomposition are all done by cells.

- **Heat:** The engine worked by bookkeeping: fitting searched a list of parts, rest compared every pair, frames kept lists of fillers; nothing happened in the cells and the cost grew with storage.
- **Experiments:** [C73](../../experiments/sketches/C73-anneal-segments/), [C74](../../experiments/sketches/C74-no-k/), [C75](../../experiments/sketches/C75-fitting-by-competition/), [C76](../../experiments/sketches/C76-binding-a-sample/), [C77](../../experiments/sketches/C77-binding-with-competition/), [C78](../../experiments/sketches/C78-decomposition-by-the-cut/)
- **Given by hand:** As in each experiment; the core holds only fitting by competition so far.
- **Closed by OUT-36 · Outcome (partly):** Written up as docs/theories/cells-first.md. Shown with cells alone: recall, competition between whole memories, fitting, composition by binding a sample, decomposition by the cut, abstraction on shared cells, and work that follows activity. In the core: fitting by competition with re-settling. Open: what picks the cell, holding a variable open, the full currency in cells and links, a local level of inhibition, rest as replay, and the bookkeeping left in the core.
- **CLM-25 · Claim:** Frames need no mechanism of their own: a decomposed memory is a constant with open places.
- **Contract:** shaped CTR-1 CON-19; shaped CTR-1 OPZ-5; shaped CTR-2 CON-8; confirmed CTR-1 PRN-1; confirmed CTR-1 PRN-6
- **Lesson:** Intercomparing, synthesis, analysis and abstraction, done by cells: the project's premise, now a design.

### PRB-13 · Problem: Experiments rebuilt each piece from scratch, and a library of versioned components would bring the overhead of managing code.

- **Heat:** No agreed description of how to build each part existed for the cells-first design; the column guide described the old engine.
- **Experiments:** [C74](../../experiments/sketches/C74-no-k/), [C75](../../experiments/sketches/C75-fitting-by-competition/), [C76](../../experiments/sketches/C76-binding-a-sample/), [C77](../../experiments/sketches/C77-binding-with-competition/), [C78](../../experiments/sketches/C78-decomposition-by-the-cut/)
- **Closed by SOL-14 · Solution:** Reference models (docs/reference-models/): RM-1 cells and columns, RM-2 segments, RM-3 assemblies, RM-4 waking and completion, RM-5 competition, RM-6 fitting, RM-7 composition, RM-8 decomposition, RM-9 prices, RM-10 frames; each with purpose, clauses served, data, pseudocode, rules, evidence, open questions and status. CTR-2 CAP-7 (draft).
- **DEC-7 · Decision:** Agreed descriptions and pseudocode, judged by the contracts, in place of shared code to manage.
- **Contract:** created CTR-2 CAP-7; shaped CTR-1 CON-19; shaped CTR-2 CON-8
- **Lesson:** Describe how to build it, and let any rebuild borrow; the contracts judge.

### HYP-27 · Hypothesis: What picks the cell, in text: the column is the word, the cell is its context (Numenta's scheme on our cells and segments): a predicted cell if context predicts one, else the whole column lights and the least-used cell learns.

- **Heat:** Context alone encoded the frame, not the word; one cell per word lost the context; only pictures had a scheme (offsets).
- **Experiments:** [C79](../../experiments/sketches/C79-context-cells/)
- **Given by hand:** Words as items (one column per word); the first word on cell 0; context = the previous two words; two fixes on the development seed (declared).
- **Closed by OUT-37 · Outcome (worked):** After one reading, the last word of "the S V the O" was predicted right and sharply every time in both worlds, where one cell per word predicted every object of the verb (5.6 and 14.9 words); a newcomer predicted only valid objects through its column. Learning from winners was needed (66% without it on dev). Least-used beat random slightly. The word after the first creeps: three readings used 63% more cells.
- **CLM-26 · Claim:** The column is identity, the cell is context; a whole column lighting is how a new context compares widely.
- **PAT-10 · Pattern:** Learn from winners: a cell predicted only through a burst must still learn its context.
- **Contract:** confirmed CTR-1 CAP-2; confirmed CTR-1 CAP-12; confirmed CTR-1 CON-19
- **Lesson:** What picks the cell is settled for text, as Numenta did it; the creep is the next thing.

### PRO-5 · Promotion: A fresh engine built from the reference models: a region of columns, cells and segments, with no list of assemblies (experiments/cells-engine).

- **Heat:** The core still works by bookkeeping; the cells-first design existed only as separate experiments.
- **Experiments:** [C80](../../experiments/sketches/C80-reading-letters/)
- **Closed by SOL-15 · Solution:** Region: columns and cells, segments firing at two, assemblies stored as segments, reading a stream with the column as identity and the cell as context (learning from winners), completion with one shared level of support, binding a sample. Its own tests pass. Not built: fitting by cells, the cut, prices in links.
- **Contract:** confirmed CTR-1 CON-19; confirmed CTR-2 CAP-7; confirmed CTR-2 CON-8
- **Lesson:** The reference models were enough to build from.

### HYP-28 · Hypothesis: One region given only letters learns where words are: inside words the next letter becomes predictable, and words begin where its predictions are broadest.

- **Heat:** Every text sketch so far was given its words as items (D-01 V1).
- **Experiments:** [C80](../../experiments/sketches/C80-reading-letters/)
- **Given by hand:** 24 words in random three-word sentences; 32 cells per column, context of two steps; the boundary measure (ours).
- **Closed by OUT-38 · Outcome (worked):** After one reading of 400 sentences: next letter inside words right 98%, alone 67-75% (one cell per letter 27-38%); without spaces, boundaries where the breadth of prediction peaks 76% precision, 83% recall (one cell per letter 53 / 61%); surprise alone found 15%. Work per letter 46-63 segment checks, against about 100 for one cell per letter.
- **CLM-27 · Claim:** Words begin where many letters were predicted and one lit: the second kind of heat, not surprise, finds the boundaries.
- **Contract:** confirmed CTR-1 GOL-1; confirmed CTR-1 OPZ-1; confirmed CTR-1 CAP-12; confirmed CTR-1 CON-19; confirmed CTR-2 OPZ-1
- **Lesson:** Words no longer need to be given: the region finds them from its own heat.

### HYP-29 · Hypothesis: Levels emerge from cells alone above letters in context: words held as assemblies once read from a fixed boundary context, shared parts cut out of words, sentences bound by two cells per word.

- **Heat:** C80: words existed only as chains of context cells, a different chain after every different preceding word; nothing composed or abstracted.
- **Experiments:** [C81](../../experiments/sketches/C81-levels-from-letters/)
- **Given by hand:** The world; two fixed boundary cells; region 2 told region 1's boundaries; sentences bound only where all three words were cut exactly (chosen by the measuring code).
- **Closed by OUT-39 · Outcome (partly):** With true boundaries every level formed: one chain of cells per word, recognised every time; parts exactly the shared beginnings; every sentence bound, object recalled 100%. Without letting go, 7.3 chains per word. One region letting go at its own guesses fell to 46% boundaries; two regions (one marks, one holds) kept 74 / 82%, one chain per word, 54% of words recognised exactly, parts mostly fragments (18% real), 90 sentences bound, object recalled 75%. Sequence and assembly segments had to be kept apart in the engine.
- **CLM-28 · Claim:** A word's identity needs letting go of the old context at its start; the region that marks boundaries must not be the one that lets go.
- **PAT-11 · Pattern:** Keep segments that predict the next input apart from segments that complete the present.
- **Contract:** confirmed CTR-1 CAP-9; confirmed CTR-1 CAP-4; confirmed CTR-1 CON-19; confirmed CTR-1 GOL-1; shaped CTR-1 CAP-12
- **Lesson:** Three levels above letters form from cells when the boundaries are right; the boundaries are now the bottleneck.

### INC-3 · Incident: Audit at the owner's request: were C80, C81 and the cells engine clean against the contracts?

- **Heat:** Results written up before being read against every clause.
- **Experiments:** [C80](../../experiments/sketches/C80-reading-letters/), [C81](../../experiments/sketches/C81-levels-from-letters/)
- **Closed by SOL-16 · Solution:** Not clean. C81: recognition and parts done by the experiment scanning every segment (bookkeeping); the boundary rule and letting go written outside the engine; every run stored on first sight (no energy rule); sentences grouped by true sentence number and bound only when cut exactly against the truth, so the sentence result with the region's own boundaries cannot be claimed. Engine: no energy rule at all, a use count per cell, one global inhibition level, chosen C and K. C80: boundaries measured by our code, not found by the region. Findings and READMEs corrected.
- **APT-5 · Anti-pattern:** Writing up a result before reading it against the contracts: violations slip into the claims.
- **Contract:** confirmed CTR-2 CON-7; confirmed CTR-2 CON-2; challenged CTR-1 CON-1; challenged CTR-1 CON-19
- **Lesson:** Read every experiment against both contracts before writing what it shows.

### INC-4 · Incident: Audit of the reference models against the contracts, at the owner's request: are they clean?

- **Heat:** Experiments had been allowed shortcuts; the risk was that the models carried them into any rebuild.
- **Closed by SOL-17 · Solution:** Not fully. Fixed: RM-6 now gives the cell form, with the core's placement version labelled bookkeeping; RM-5 gives a local test for rivals and refuses their ties, and RM-4 uses it; RM-7 reads parts from firing segments instead of taking them as given, and marks when to bind as open; RM-1 and RM-2 read fewest segments from structure, not a counter; RM-9 names the naming cost as bookkeeping. Left open and stated: the energy rule at the level of cells (the largest gap: growth is unconditional), global inhibition, and boundaries, letting go, recognition and region wiring (not in any model). A standing rule: gaps are left visible, never filled with lists, scans, hand-set numbers or the truth.
- **PAT-12 · Pattern:** A model names its gaps; a rebuild leaves them visible rather than filling them.
- **Contract:** changed CTR-2 CAP-7; challenged CTR-1 CON-1; confirmed CTR-1 CON-7; confirmed CTR-1 CON-19; confirmed CTR-2 CON-8
- **Lesson:** The models are only as clean as what they admit they lack.

## 7 · The core rebuilt from cells

### PRO-6 · Promotion: The core rebuilt from scratch from the reference models, at the owner's instruction: a volume (the owner's word for a region) of columns, cells and segments, in plain object-oriented JavaScript with no dependencies, and a viewer to watch it run (src/engine, src/test, src/view).

- **Heat:** The old core worked by bookkeeping and carried patches and crutches; the owner removed it so the core could be built clean.
- **Given by hand:** The inputs and their order: sequences typed by the owner (ABCD DGJM MNOP, the Z, the house and shed, a square of four quarters). Four cells per column (fixed architecture).
- **Closed by SOL-18 · Solution:** Built from RM-1 to RM-8 with no list of assemblies, work only through the segments active cells feed, no tuned numbers and no round limits. Every gap the models name is left visible and declared in src/README.md. Its tests stand in for the old core's, which were removed with it: the step into the core was the owner's instruction, not a distillation measured against the old baseline. The reference models were brought up to date from it.
- **PAT-13 · Pattern:** Build the core from the models, run it in a viewer, and let what it does correct the models.
- **Contract:** confirmed CTR-1 CON-19; confirmed CTR-1 CON-18; confirmed CTR-2 CON-8; changed CTR-2 CAP-7; confirmed CTR-2 CAP-2; challenged CTR-2 CON-1
- **Lesson:** The models were enough to build a clean core from, and building it showed where they were wrong.

### PRB-14 · Problem: An assembly of two cells could never fire: each cell's segment holds one link, under the bar of two. So a whole made of pairs was stored again as a copy on fresh cells (ABCD after AB and CD), and pairs never recalled.

- **Heat:** Copies of what was already known; pairs dead on arrival.
- **Closed by SOL-19 · Solution:** A segment that completes the present counts its own cell when that cell is active (RM-2's "+1 if the cell itself is active", read into firing as well as support): the bar of two is two of a memory's cells active, the cell included. A pair is recognised when both are seen and never completed from one; ABCD after AB and CD is tied from them.
- **Contract:** confirmed CTR-1 CAP-6; confirmed CTR-1 OPZ-3
- **Lesson:** The bar of two counts the memory's members, and the cell is one of them.

### HYP-30 · Hypothesis: The cut (RM-8) works in the core, by cells, with wholes that share a part competing by the share of themselves that is active (RM-5).

- **Heat:** Decomposition had been shown only in C78's own code.
- **Given by hand:** As PRO-6.
- **Closed by OUT-40 · Outcome (worked):** ABCD, then ABEF: ABCD's four segments removed, AB and CD tied on the same cells, ABCD tied again from them, ABEF from AB with E and F; both recognised afterwards with nothing more grown or cut. ABCD then brings back nothing more, ABEF nothing more, ABC only D, AB alone both (the tie held). Recall from part of a memory alone is not a cut: the input must have a remainder of its own.
- **CLM-29 · Claim:** Decomposition and the abstraction it leaves (AB shared by two wholes, on the same cells) work in the core, as in C78.
- **Contract:** confirmed CTR-1 CAP-1; confirmed CTR-1 CON-7; challenged CTR-1 CON-1
- **Lesson:** The cut by cells holds in the core; whether it pays is still unasked (RM-9).

### PRB-15 · Problem: Junctions were refused: where two memories meet in one column (D0 for ABCD and D1 for DGJM, in the Z), both cells are fully supported, tie, and neither wins; so the Z was composed without its corners and a part seen alone lost them.

- **Heat:** RM-5 named it open: rivals that can both be right are not a tie.
- **Closed by SOL-20 · Solution:** In a lit column, a cell whose memory is wholly seen (every member active, every link in a lit column) wins, and several such all win. In recall, two cells in one column are rivals only when woken by the same evidence. A true tie, a cue fitting two memories from the same evidence, is still refused. Every part of the Z brings back the whole Z, junctions included.
- **Contract:** confirmed CTR-1 CON-7
- **Lesson:** A tie is two explanations of the same evidence; two memories each wholly there are not a tie.

### INC-5 · Incident: Labels on segments (seq, part, bind), carried over from C81: the owner named them a patch. The cortex keeps no such marks; what a synapse does follows from what it connects.

- **Heat:** The engine read a word on each segment to decide what to do with it.
- **Closed by SOL-21 · Solution:** seq became wiring: each cell's output arrives also a moment later (its "was"), and a segment wired to that predicts, one wired to cells completes; every result unchanged. bind was first removed with the old rival test kept, which broke recall (a twelve-cell assembly came back whole from half of itself in 0 of 200 seeds against 200, and no part brought back the Z), and was put back while a cause was found: the test of "one memory" needed every member to link every other. It was then replaced by a rule read from topology: memories compete only for evidence that is a whole of its own (the pair AB, against A0 B0 as a sample of ABCD). 200 of 200, the Z whole, the house and shed as before.
- **APT-6 · Anti-pattern:** Removing a patch without resolving the misfit it covered: the misfit comes straight back.
- **PAT-14 · Pattern:** What a segment does is read from what it is connected to; a distinction the machine needs is found in its topology, or the machine does not need it.
- **Contract:** confirmed CTR-2 CON-3; confirmed CTR-1 CON-19; confirmed CTR-1 PRN-1
- **Lesson:** A label stood in for a distinction the topology already held: which evidence is a whole of its own.

### HYP-31 · Hypothesis: There is one kind of thing, the assembly, from a pair to a whole of wholes, made by one rule: when a moment's winners are not one memory, tie a handle from each part (the owner's).

- **Heat:** Assemblies and compositions were grown by two rules (store every cell; bind two per part), and two cells drawn from a part made of parts could fall one in each piece and wake neither.
- **Given by hand:** As PRO-6.
- **Closed by OUT-41 · Outcome (worked):** One rule: a part of one cell gives that cell (so new cells are all taken), a larger part gives two cells one of its segments ties (a handle), and the handles are linked 2⌈ln n⌉ per cell. On a square of four quarters, two halves and the whole, each level costs 12 links (against 120 to wire 16 cells), and any quarter brings back the whole in 200 of 200 seeds (before handles, in one run, 6 of 12 cells). All earlier results kept.
- **CLM-30 · Claim:** Assemblies all the way up: a whole is held on its parts' cells, each level one more segment on a few of them, costing what its parts number, not what they hold.
- **DEC-8 · Decision:** Links per cell of a tie: 2⌈ln n⌉, the connectivity threshold of a random graph doubled for the bar of two (the owner's choice from a comparison of three rules).
- **Contract:** confirmed CTR-1 OPZ-3; confirmed CTR-1 CAP-4; confirmed CTR-1 DEF-14; confirmed CTR-1 OPZ-5; confirmed CTR-1 CAP-3
- **Lesson:** Composition is not a second mechanism: it is the assembly rule applied to parts that already exist.

### HYP-32 · Hypothesis: A bond can be undone as cheaply as it is tied, by heat: when a joint brings back what the input has replaced ("x" seen with "5" brings back "3"), it loosens by one segment per cell (from the owner's conversation on "the", variables and heat).

- **Heat:** Every tie in the core is kept, so "x" alone brings back every value it ever held.
- **Experiments:** [C82](../../experiments/sketches/C82-rebinding/)
- **Given by hand:** The inputs and their order; a blank before every input (no transitions); which columns are a variable and which a value.
- **Closed by OUT-42 · Outcome (partly):** Over 1,000 rebindings, "x" alone brings back exactly its current value 100% of the time (core 0%, about 10 values per probe), with structure flat (44 completing segments throughout, 12 links per rebinding). But the rule is symmetric: binding "y" to the value "x" holds breaks "x"'s bond (91% exact when values are shared; every failure from that). And a whole built once from known parts ("ABCD" from "AB" and "CD") is forgotten when "ABEF" arrives. All 16 core tests still pass, none checking that case.
- **CLM-31 · Claim:** Unbinding can be driven by the moment's own misfit (a joint bringing back what the input has replaced), with no heat signal set by hand.
- **TRD-5 · Trade-off:** Loosening a joint by heat frees a variable, but forgets as easily a whole built once from parts.
- **Contract:** shaped CTR-1 CAP-4; challenged CTR-1 CON-1; confirmed CTR-1 OPZ-3; confirmed CTR-2 CON-7
- **Lesson:** Unbinding is cheap and real; telling a fast bond from a lasting one is not in the structure yet.

### QST-15 · Question: A variable holds one value; a value can belong to many variables. What in the structure says which side of a bond is which, so that binding "y" to "1" does not undo "x = 1"?

- **Heat:** C82's loosening is symmetric and loses 9-10% when values are shared.
- **Experiments:** [C82](../../experiments/sketches/C82-rebinding/)
- **Still open.**
- **Contract:** shaped CTR-1 CAP-4; shaped CTR-1 CON-16
- **Lesson:** Binding is not symmetric, and the machine has to find out which side holds one.

### HYP-33 · Hypothesis: Hardness without strengths: a whole wholly seen again is tied again from its parts, so a bond seen many times is backed by more segments than loosening takes at once (the owner's annealing picture).

- **Heat:** With loosening alone (C82), a whole seen many times is as fragile as a variable bound once.
- **Experiments:** [C83](../../experiments/sketches/C83-hardening/)
- **Given by hand:** The inputs, their order and the counts; a blank before every input; a whole's parts read from each cell's first completing segment (declared).
- **Closed by OUT-43 · Outcome (partly):** Seen once, a bond breaks at the first clash; seen three or more times it survives (100%); seen twice, 3 of 5 seeds. "ABCD" seen twice or more survives "ABEF" ("ABC" brings back "D" 100%, against 0% with loosening alone). But a bond is heated once, not worn down: after the first clash the new whole wins by share and the old one is never brought back or heated again, so both values are kept for good, and no race between them happens. Every repetition adds about four segments, without limit. 15 of 16 core tests (test 9 forbids growth on a repeat).
- **CLM-32 · Claim:** Repetition can protect a bond structurally, with no strength on any segment.
- **TRD-6 · Trade-off:** Hardening by re-tying costs segments on every repetition, needed or not: unconditional growth again (RM-9).
- **APT-7 · Anti-pattern:** Expecting heat to wear a bond down clash by clash: competition by share stops a beaten memory from being heated at all.
- **Contract:** confirmed CTR-1 CON-9; shaped CTR-1 CAP-11; challenged CTR-1 CON-1; confirmed CTR-2 CON-7
- **Lesson:** Fast bonds and lasting ones can come from one mechanism, but only a memory that is brought back can be heated.

### HYP-34 · Hypothesis: First candidates for the energy rule at the level of cells, after heat was reduced to one idea (what is active and what is held disagree, in three shapes: unheld, unthere, twice): squeeze (a full column clears its least-backed cell), used (wholes seen again fill in links), fade (a claim not met loses a link), and a yardstick (a use count, breaking CON-9 on purpose).

- **Heat:** Every growth, cut and tie in the core is unconditional (RM-9, the largest gap); C82 and C83 each ended on it.
- **Experiments:** [C84](../../experiments/sketches/C84-energy-rules/)
- **Given by hand:** The mixed world (recurring objects, one-off noise, a variable), its proportions and order; a blank before every input.
- **Closed by OUT-44 · Outcome (not borne out):** No arm ever cleared a cell: a novel input is never stored as new, because any two of its columns wake an old memory and the cut and tie rebuild it from fragments, so unheld heat goes to zero and the volume never runs short. Structure grew about 40% in the core, all from cuts and ties. Unthere heat did not fall (about 25 cells brought back per moment; 50 with noise on the objects' columns, where half of any object brought back all 60 other columns in every arm but fade). Fade cut the chaining to 19 columns but frayed the objects and tripled growth through churn.
- **CLM-33 · Claim:** Heat is where what is active and what is held disagree: something there that nothing holds, something held that isn't there, something held twice. Every earlier use of the word is one of these.
- **CLM-34 · Claim:** In the core, growth comes from cutting and tying fragments, not from running out of cells; an energy rule must judge the cut and the tie.
- **APT-8 · Anti-pattern:** Reading zero unexplained input as understanding: it can mean everything is being explained as fragments of the past.
- **Contract:** challenged CTR-1 CON-1; shaped CTR-1 CON-14; confirmed CTR-1 CON-9; confirmed CTR-2 CON-7
- **Lesson:** The energy rule belongs at the cut and the tie: whether explaining something as pieces of the past is worth what it adds.

### PRB-16 · Problem: One-off inputs are kept as compositions of old fragments and chain memories together; nothing at the level of cells asks whether a cut or a tie pays.

- **Heat:** C84: unthere heat never falls, and with shared columns any object brings back everything.
- **Experiments:** [C84](../../experiments/sketches/C84-energy-rules/)
- **Still open.**
- **Contract:** challenged CTR-1 CON-1; challenged CTR-1 OPZ-3
- **Lesson:** Open: the bill restated in cells, at the cut and the tie.

### HYP-35 · Hypothesis: Bond on cooling (the owner's flow-and-heat premise): a memory explains an input only if it explains at least as many cells as it claims that aren't there (RM-9's prices of 1); one-offs stay loose and are cleared when cells run short; bonds freeze by returning.

- **Heat:** C84: one-offs are patched from fragments of the past, heat held in structure never falls, and with shared columns everything chains.
- **Experiments:** [C85](../../experiments/sketches/C85-bond-on-cooling/)
- **Given by hand:** As C84.
- **Closed by OUT-45 · Outcome (partly):** With one-offs on columns of their own: structure flat (about 520 segments against the core's 394 rising to 549), heat held in structure ("unthere") about 1 cell per moment against 26, objects exact 100%, "x" 100%, the one-offs' heat left unexplained (about 4 per moment). The bill without clearing grew structure 9-13 times the core's. With one-offs on the objects' columns: chaining gone (at most 0.6 stray columns against 60), but objects lost cells to the squeeze (exact 20-27%); freezing by return did not help, since an object that has lost a cell is never seen whole again. The bill forbids recall from a small cue (5 core tests fail).
- **CLM-35 · Claim:** Priced at the fit, a one-off's heat can pass through instead of being patched into structure, if loose structure can flow out again.
- **TRD-7 · Trade-off:** The bill at the fit stops patching and chaining, but forbids recall from a small cue.
- **TRD-8 · Trade-off:** One-offs that pass through still need cells; where they share the cells memories use, capacity becomes the fault.
- **Contract:** shaped CTR-1 CON-1; shaped CTR-1 CON-14; confirmed CTR-1 OPZ-3; confirmed CTR-2 CON-7
- **Lesson:** The premise works where heat has a way out: bonds kept on cooling, one-offs passing through.

### QST-16 · Question: When is completing a memory from a small part worth what it claims? In a stream the machine can't tell "not there" from "not seen yet"; the old core priced hidden parts at nothing by marking them known-unknown.

- **Heat:** C85: the bill at the fit stops a quarter of the square bringing back the whole.
- **Experiments:** [C85](../../experiments/sketches/C85-bond-on-cooling/)
- **Still open.**
- **Contract:** shaped CTR-1 CON-1
- **Lesson:** Open: known-unknown, in cells.

### PRO-7 · Promotion: Bringing C82-C85 into the core, at the owner's request: each change read against the reference models and both contracts first (D-02).

- **Heat:** The owner wants to experiment on active assemblies changing, on a core that carries what was learnt.
- **Experiments:** [C82](../../experiments/sketches/C82-rebinding/), [C83](../../experiments/sketches/C83-hardening/), [C84](../../experiments/sketches/C84-energy-rules/), [C85](../../experiments/sketches/C85-bond-on-cooling/)
- **Closed by SOL-22 · Solution:** The heat meter is in the core: each moment reports heat in three shapes (unheld, unthere, twice), reporting only, with a test of its own; 17 of 17. Kept out by the owner's decision: the bill at the fit (breaks CAP-3, five core tests; waits on QST-16) and loosening (forgets wholes built from parts without a clean way to harden them). Kept out as not distilled or not shown on their own: harden, squeeze, densify, fade.
- **DEC-9 · Decision:** The bill at the fit and loosening stay out of the core until recall from a small cue (QST-16) and hardening have clean answers (the owner's).
- **Contract:** confirmed CTR-2 CON-1; confirmed CTR-1 OPZ-4; confirmed CTR-1 CAP-3; shaped CTR-1 CAP-6
- **Lesson:** Read before promoting: the strongest result of the day pulled against a capability the core already had.

### HYP-36 · Hypothesis: Poles and arms (the owner's): slow, settled structure and fast, temporary bonds in two volumes of the same machinery, the fast one fed by the slow one's winners, resolve the conflict of C82 and C83.

- **Heat:** In one volume a quick bond and a lasting one look the same: loosening rebinds "x" and forgets "ABCD".
- **Experiments:** [C86](../../experiments/sketches/C86-poles-and-arms/)
- **Given by hand:** The inputs, teaching and order; a blank before every input; in one arm, the slow volume kept from learning by restoring it after each moment.
- **Closed by OUT-46 · Outcome (partly):** Each kind of knowledge survives in its own volume: "x" exact 100% in the fast one, "ABC" -> "D" 100% in the slow one, which no single volume managed (core 0% / 100%, loosen 100% / 53%). But read together, as one machine, they disagree: the slow volume, learning, brings back every value of "x" (0%), and the fast one adds "EF" to "ABC" after a recent rival (53%). The split looked perfect only when the experimenter chose which volume to read.
- **CLM-36 · Claim:** Fast and slow bonds in separate volumes keep both kinds of knowledge intact.
- **APT-9 · Anti-pattern:** Reading each question from the part that answers it well: the experimenter doing the machine's choosing.
- **Contract:** shaped CTR-1 CAP-11; shaped CTR-1 CAP-15; confirmed CTR-2 CON-2; confirmed CTR-2 CON-7
- **Lesson:** Splitting the bonds works; making the two volumes settle into one answer is the next step.

### QST-17 · Question: How do a slow volume and a fast one settle into one answer, and how does what settles in the fast one sink into the slow one, without the experimenter choosing?

- **Heat:** C86: read together, the two volumes disagree and do worse than either alone.
- **Experiments:** [C86](../../experiments/sketches/C86-poles-and-arms/)
- **Still open.**
- **Contract:** shaped CTR-1 CAP-15; shaped CTR-1 CAP-11
- **Lesson:** Open: disagreement between volumes as heat.

### HYP-37 · Hypothesis: Sinking by fit (the owner's sinking and rising): a link the fast volume has settled sinks into the slow volume when the slow structure already connects its two ends (connecting the dots); otherwise it evaporates.

- **Heat:** C86: nothing decided what passes from the fast volume to the slow one (QST-17).
- **Experiments:** [C87](../../experiments/sketches/C87-sinking-by-fit/)
- **Given by hand:** The world, teaching and stream; a blank before every input; the slow volume's learning gated from outside; the sinking test run by the experiment.
- **Closed by OUT-47 · Outcome (partly):** The slow volume's own settling separated connected links from unconnected ones in 20 of 20 tests, and gating on it kept "cat flies" out (a volume learning everything took it in). But settling spreads to everything connected: from "cat" the slow volume brought back seven things, and "cat mammal" and "fish mammal" were recalled without being learnt. With no near or far, "fish mammal" (false, connected) passed, and "bird walks" (true, unconnected) evaporated after seven failed tests.
- **CLM-37 · Claim:** A slow volume's own settling says whether a new link connects its dots.
- **CLM-38 · Claim:** Settling without a bar spreads to everything connected: every dot is already joined, so fit has no near or far.
- **TRD-9 · Trade-off:** Admitting only what already fits keeps slow memory coherent, but keeps out what is true and new.
- **Contract:** shaped CTR-1 CAP-11; shaped CTR-1 CAP-1; shaped CTR-1 CON-1; confirmed CTR-2 CON-7
- **Lesson:** Connecting the dots needs distance: heat lowering the bar, so near fits count more than far ones.

### HYP-38 · Hypothesis: Lowering the bar (primitive; the owner's aha): the deep lets its settling through one round at a time from each end of a new link; where the fronts meet, the dots connect, locally, and a better-supported link meets sooner or on more.

- **Heat:** C87: the deep lit everything connected from any cue, so fit had no near or far.
- **Experiments:** [C88](../../experiments/sketches/C88-lowering-the-bar/)
- **Given by hand:** The world and its teaching; a blank before every input; the two fronts settled separately and compared by the experiment.
- **Closed by OUT-48 · Outcome (partly):** Locality: at the meeting each end had lit about one thing in the deep, against eight when settling ran to the end. Connected links met in every seed, unconnected never. "Cat mammal" (three walking mammals behind it) met no later than "fish mammal" in 5 of 5 seeds (sooner in 3), but met on more in only 3 of 5: the size of the aha is not yet graded. The rounds count cells, not things, and the fast-spreading "mammal" front did most of the travelling.
- **CLM-39 · Claim:** Letting the deep's settling through one round at a time gives it locality: the dots connect in a small lit region.
- **Contract:** shaped CTR-1 CAP-1; confirmed CTR-1 CON-18; confirmed CTR-2 CON-7
- **Lesson:** The bar gives the aha a place; a primed deep may give it a size.

### HYP-39 · Hypothesis: Priming from the surface (the owner's): the poles that turn at the surface warm the deep beneath them, so a new piece meets warm, welcoming ground: warmth helps a deep cell wake alongside the new piece, never by itself, and once reached joins the front.

- **Heat:** C88: lowered from cold and evenly, the bar gave locality but no graded fit.
- **Experiments:** [C89](../../experiments/sketches/C89-priming/)
- **Given by hand:** The world, teaching and contexts; a blank before every input; the deep gated during the context; warmth lasting the whole context.
- **Closed by OUT-49 · Outcome (partly):** A matching context brought the meeting sooner where there was room ("fish mammal" after swimming, 3 of 5 seeds: the preregistered 4 of 5 fails) and, seen after the fact, bigger where there was not ("cat mammal" after walking met on 8.8 cells against 3.8). Mismatched and unrelated contexts changed nothing; unconnected links never met in any context. Three fixes after the development seed brought the code into line with the model: warmth never wakes anything alone, flows once reached, and is never the piece itself.
- **CLM-40 · Claim:** Priming is selective and invents nothing: warm ground welcomes a piece that fits, and can't make one fit.
- **PAT-15 · Pattern:** Write the rule as a model before the code, and when the code disagrees with the result, check it against the model first.
- **Contract:** shaped CTR-1 CAP-10; shaped CTR-1 CAP-1; confirmed CTR-1 CON-18; confirmed CTR-2 CON-7
- **Lesson:** Warm meets warm: where the deep is primed, a fitting piece lands sooner or takes hold more widely.

### HYP-40 · Hypothesis: Warm meets warm, confirmed: a context that warms the right patch of the deep makes a fitting piece take hold more widely when it lands (C89's after-the-fact observation, predicted first).

- **Heat:** C89 saw it only after the run.
- **Experiments:** [C90](../../experiments/sketches/C90-warm-meets-warm/)
- **Given by hand:** As C89; fresh seeds 201-210; a cow and a shark added to the world.
- **Closed by OUT-50 · Outcome (worked):** After a walking context "cat mammal" and "cow mammal" met on 9 cells (all of "walks") against about 4, in 10 of 10 seeds each; after swimming, "fish mammal" and "shark mammal" met bigger or sooner in 8 and 9 of 10. Contexts touching neither end changed nothing; unconnected links never met. One prediction failed on a mislabel: the walking context is about mammals, so it also helped the swimmers' "mammal" end (4 and 2 of 10).
- **CLM-41 · Claim:** The size of the aha depends on where the deep is warm: the first graded fit.
- **Contract:** confirmed CTR-1 CAP-10; shaped CTR-1 CAP-1; confirmed CTR-2 PRN-2; confirmed CTR-2 CON-7
- **Lesson:** A context warms one end or both; the deep counts which, even when the experimenter doesn't.

### HYP-41 · Hypothesis: Closing the loop (the owner's picture taken literally): talk turns the surface, the deep warms where it turns, and a new piece settled at the surface sinks only where its fronts meet on warm ground; on cold ground it stays up; fitting nowhere, it evaporates.

- **Heat:** The pieces (two volumes, sinking by fit, the bar, priming) had been tested apart.
- **Experiments:** [C91](../../experiments/sketches/C91-closing-the-loop/)
- **Given by hand:** The world, teaching, contexts and episodes; where an episode ends; a blank before every input; the deep gated; the meeting test run by the experiment.
- **Closed by OUT-51 · Outcome (worked):** Every seed alike: "cat mammal" and "cow mammal" sank after talk of walking and stayed up otherwise; "cat flies" and "bird walks" evaporated. False links taken in: 5 of 20 (warm), 10 of 20 (any meeting), 20 of 20 (learning all). But after talk of swimming the machine took in "fish mammal" (fits by a far route) every time: context decides belief, and the rule does not yet tell a snug fit from a loose one on warm ground. "Bird walks" (true, new) never got in.
- **CLM-42 · Claim:** Sinking only where the deep is warm runs as one cycle and keeps out most of what is false, and everything that fits nowhere.
- **TRD-10 · Trade-off:** Warmth lets the right talk bring in a plausible wrong idea: priming decides belief.
- **Contract:** shaped CTR-1 CAP-11; confirmed CTR-1 CAP-10; shaped CTR-1 CAP-15; confirmed CTR-2 CON-7
- **Lesson:** The loop closes; a snug fit must count for more than a loose one, and the new needs another way in.

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
| [C62](../../experiments/sketches/C62-reading/) | QST-13 |
| [C63](../../experiments/sketches/C63-reading-kinds/) | HYP-15 |
| [C64](../../experiments/sketches/C64-persistent-reading/) | HYP-16 |
| [C65](../../experiments/sketches/C65-few-sentences/) | HYP-17 |
| [C66](../../experiments/sketches/C66-types/) | HYP-18 |
| [C67](../../experiments/sketches/C67-people-types/) | HYP-19 |
| [C68](../../experiments/sketches/C68-distil-merge/) | PRO-3 |
| [C69](../../experiments/sketches/C69-learnt-and/) | HYP-20 |
| [C70](../../experiments/sketches/C70-learnt-not/) | HYP-20 |
| [C71](../../experiments/sketches/C71-membership-segments/) | HYP-20 |
| [C72](../../experiments/sketches/C72-segments-two-signs/) | HYP-20 |
| [C73](../../experiments/sketches/C73-anneal-segments/) | HYP-21, THY-7 |
| [C74](../../experiments/sketches/C74-no-k/) | HYP-22, PRB-12, THY-7, PRB-13 |
| [C75](../../experiments/sketches/C75-fitting-by-competition/) | HYP-23, PRO-4, PRB-12, THY-7, PRB-13 |
| [C76](../../experiments/sketches/C76-binding-a-sample/) | HYP-24, PRB-12, THY-7, PRB-13 |
| [C77](../../experiments/sketches/C77-binding-with-competition/) | HYP-25, PRB-12, THY-7, PRB-13 |
| [C78](../../experiments/sketches/C78-decomposition-by-the-cut/) | HYP-26, THY-7, PRB-13 |
| [C79](../../experiments/sketches/C79-context-cells/) | HYP-27 |
| [C80](../../experiments/sketches/C80-reading-letters/) | PRO-5, HYP-28, INC-3 |
| [C81](../../experiments/sketches/C81-levels-from-letters/) | HYP-29, INC-3 |
| [C82](../../experiments/sketches/C82-rebinding/) | HYP-32, QST-15, PRO-7 |
| [C83](../../experiments/sketches/C83-hardening/) | HYP-33, PRO-7 |
| [C84](../../experiments/sketches/C84-energy-rules/) | HYP-34, PRB-16, PRO-7 |
| [C85](../../experiments/sketches/C85-bond-on-cooling/) | HYP-35, QST-16, PRO-7 |
| [C86](../../experiments/sketches/C86-poles-and-arms/) | HYP-36, QST-17 |
| [C87](../../experiments/sketches/C87-sinking-by-fit/) | HYP-37 |
| [C88](../../experiments/sketches/C88-lowering-the-bar/) | HYP-38 |
| [C89](../../experiments/sketches/C89-priming/) | HYP-39 |
| [C90](../../experiments/sketches/C90-warm-meets-warm/) | HYP-40 |
| [C91](../../experiments/sketches/C91-closing-the-loop/) | HYP-41 |

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
| CTR-1 DEF-10 | Volume: one machine of this kind among several, each settling its own heat and receiving from othe | THY-2 (created) |
| CTR-1 DEF-11 | Memory: structure kept because it lowers energy, recalled from part of itself. | — |
| CTR-1 DEF-12 | Cell: one unit inside a column; a column over each input expands it into a population of cells.  | PRB-12 (created) |
| CTR-1 DEF-13 | Segment: one memory's evidence on one cell: a set of links from other cells, firing when two or mor | PRB-12 (created) |
| CTR-1 DEF-14 | Assembly: a set of cells, across columns, that stands for a thing: nothing but those cells and the l | PRB-12 (created), HYP-31 (confirmed) |
| CTR-1 GOL-1 | Learns unsupervised: placed in any world (DEF-8), it resolves the misfits (DEF-3) in what  | QST-2 (confirmed), PRB-4 (challenged), PRB-8 (created), QST-13 (challenged), HYP-15 (shaped), QST-14 (shaped), HYP-18 (confirmed), HYP-20 (confirmed), HYP-28 (confirmed), HYP-29 (confirmed) |
| CTR-1 GOL-2 | Useful on the job: no training phase before use. It starts doing useful work at once, or n | PRB-8 (created), HYP-17 (shaped) |
| CTR-1 GOL-3 | Acts on its own heat: what it looks at and does comes from its own heat (DEF-2), with noth | THY-3 (created) |
| CTR-1 GOL-4 | Regions (DEF-10) settle each other: heat in one is resolved by the system as a whole. | HYP-13 (shaped), THY-2 (created), THY-4 (confirmed) |
| CTR-1 OPZ-4 | Heat: explain its world more completely: more misfits resolved, never masked (CON-6). | PRB-11 (changed), PRO-7 (confirmed) |
| CTR-1 OPZ-1 | Information: learn as much or more from far less information than today's AI needs. | HYP-5 (shaped), PRB-8 (created), HYP-17 (confirmed), HYP-18 (confirmed), HYP-19 (confirmed), HYP-22 (confirmed), HYP-28 (confirmed) |
| CTR-1 OPZ-3 | Minimality: the fewest constructs that explain the most. | HYP-3 (shaped), PRB-8 (created), PRB-11 (changed), HYP-23 (confirmed), PRO-4 (confirmed), HYP-24 (confirmed), HYP-26 (confirmed), PRB-14 (confirmed), HYP-31 (confirmed), HYP-32 (confirmed), PRB-16 (challenged), HYP-35 (confirmed) |
| CTR-1 OPZ-2 | Compute: fewer resources (time, memory, power) for the same learning, on ordinary CPUs (CO | HYP-2 (shaped), HYP-16 (confirmed), PRB-11 (changed), HYP-23 (confirmed) |
| CTR-1 OPZ-5 | Scale: the more it stores, the less each addition costs it: the work of receiving and reca | PRB-4 (shaped), HYP-25 (confirmed), PRB-12 (changed), THY-7 (shaped), HYP-31 (confirmed) |
| CTR-1 CON-11 | It can't learn what isn't in what it receives. | — |
| CTR-1 CON-12 | It can't try every explanation: search at rest is always partial. | HYP-5 (shaped) |
| CTR-1 CON-14 | Memory is finite: good enough, not exact; exact records live outside it. | QST-10 (shaped), HYP-34 (shaped), HYP-35 (shaped) |
| CTR-1 CON-13 | Evidence alone can't settle a true tie: only more evidence can (looking, acting). | QST-12 (created) |
| CTR-1 CON-1 | One rule: a change to its structure is kept only if energy (DEF-1) falls. | HYP-5 (shaped), HYP-8 (confirmed), HYP-9 (confirmed), QST-7 (confirmed), HYP-14 (confirmed), PRO-3 (confirmed), INC-3 (challenged), INC-4 (challenged), HYP-30 (challenged), HYP-32 (challenged), HYP-33 (challenged), HYP-34 (challenged), PRB-16 (challenged), HYP-35 (shaped), QST-16 (shaped), HYP-37 (shaped) |
| CTR-1 CON-2 | One currency, taken from the world: no hand-set weights or tuned parameters. | HYP-1 (shaped), HYP-3 (shaped), PRB-1 (created), PRB-3 (confirmed), HYP-20 (challenged) |
| CTR-1 CON-6 | Resolve, don't mask: energy may only fall because a misfit is resolved, never because its  | PRB-6 (shaped), THY-3 (created) |
| CTR-1 CON-3 | General: nothing in it is written for one task or one kind of world. Fixed architecture is | PRB-2 (created), QST-8 (confirmed), PRB-5 (confirmed) |
| CTR-1 CON-4 | Learns online, from nothing: no training set, no labels, no backpropagation. | QST-1 (shaped) |
| CTR-1 CON-7 | Don't guess: when the evidence fits two explanations equally, take neither. | PRB-2 (created), PRB-6 (confirmed), HYP-21 (confirmed), HYP-22 (confirmed), HYP-23 (challenged), HYP-26 (challenged), INC-4 (confirmed), HYP-30 (confirmed), PRB-15 (confirmed) |
| CTR-1 CON-8 | Imagined is never stored as lived: what it joins or imagines never becomes an experience. | QST-9 (created) |
| CTR-1 CON-10 | Its deepest set points (DEF-9) come from outside and are declared. | THY-2 (created) |
| CTR-1 CON-18 | Sparse, event-driven computation: work happens only where something is active or changes; | THY-5 (created), THY-6 (confirmed), HYP-16 (confirmed), HYP-21 (challenged), HYP-22 (challenged), HYP-23 (confirmed), PRO-4 (confirmed), HYP-24 (confirmed), HYP-25 (confirmed), PRO-6 (confirmed), HYP-38 (confirmed), HYP-39 (confirmed) |
| CTR-1 CON-19 | Cells and segments first: what the machine does (waking, completion, competition, fitting, | PRB-12 (created), HYP-26 (confirmed), THY-7 (shaped), PRB-13 (shaped), HYP-27 (confirmed), PRO-5 (confirmed), HYP-28 (confirmed), HYP-29 (confirmed), INC-3 (challenged), INC-4 (confirmed), PRO-6 (confirmed), INC-5 (confirmed) |
| CTR-1 CON-5 | Runs on ordinary CPUs: no GPU, TPU or other specialised hardware. | — |
| CTR-1 CON-9 | Cells carry no numbers: no strengths or activation levels; evidence is counted per memory, | HYP-10 (created), PRB-11 (changed), HYP-20 (challenged), HYP-33 (confirmed), HYP-34 (confirmed) |
| CTR-1 CON-16 | No labels or teacher as a shortcut (breaks GOL-1). | QST-15 (shaped) |
| CTR-1 CON-15 | No perfect memory (breaks CON-1 and OPZ-2). | — |
| CTR-1 CON-17 | No exhaustive search for the best answer (breaks OPZ-2). | — |
| CTR-1 CAP-1 | Learning by comparing: two things side by side give what they share, directly. | HYP-3 (shaped), HYP-5 (created), HYP-7 (confirmed), QST-13 (challenged), HYP-17 (confirmed), HYP-26 (confirmed), HYP-30 (confirmed), HYP-37 (shaped), HYP-38 (shaped), HYP-39 (shaped), HYP-40 (shaped) |
| CTR-1 CAP-4 | Binding what happens together (Hebbian in spirit): things active together become one memor | QST-11 (created), HYP-20 (shaped), HYP-24 (confirmed), HYP-29 (confirmed), HYP-31 (confirmed), HYP-32 (shaped), QST-15 (shaped) |
| CTR-1 CAP-3 | Auto-associative memory: a few active pieces bring back the whole memory they belong to. | QST-3 (created), HYP-10 (confirmed), HYP-19 (confirmed), HYP-20 (shaped), HYP-21 (confirmed), HYP-22 (confirmed), HYP-24 (confirmed), HYP-26 (confirmed), HYP-31 (confirmed), PRO-7 (confirmed) |
| CTR-1 CAP-2 | Sparse distributed representations: a thing is a small set of cells; which cell says where | HYP-6 (created), QST-6 (challenged), PRB-11 (changed), HYP-25 (confirmed), HYP-27 (confirmed) |
| CTR-1 CAP-6 | Thresholds from prices: when to keep, recall or recognise follows from the currency (CON-2 | PRB-1 (created), QST-3 (confirmed), HYP-24 (shaped), PRB-14 (confirmed), PRO-7 (shaped) |
| CTR-1 CAP-9 | The same engine at every level: regions (DEF-10) stacked with no new mechanism. | HYP-11 (created), HYP-18 (confirmed), HYP-29 (confirmed) |
| CTR-1 CAP-8 | Sharing: parts, kinds and shared changes let one thing learnt cover many cases. | QST-2 (shaped), HYP-7 (created), HYP-8 (confirmed), HYP-12 (challenged), QST-13 (shaped), HYP-15 (confirmed), QST-14 (shaped) |
| CTR-1 CAP-5 | Rest: reorganising and replaying while nothing comes in. | HYP-5 (created), PRB-6 (confirmed) |
| CTR-1 CAP-7 | Heat as a valve: search opens only where there is heat (DEF-2). | HYP-2 (shaped), THY-1 (shaped), PRB-5 (created), QST-11 (confirmed), HYP-23 (confirmed) |
| CTR-1 CAP-13 | Not knowing is a reason to look: a refused tie (CON-7) becomes a cue for more evidence. | QST-12 (created) |
| CTR-1 CAP-12 | History in the state: what was a moment ago is part of now. | QST-5 (created), HYP-27 (confirmed), HYP-28 (confirmed), HYP-29 (shaped) |
| CTR-1 CAP-10 | Holding: a held context, want or episode steers what comes next. | QST-4 (shaped), HYP-14 (confirmed), THY-6 (shaped), HYP-39 (shaped), HYP-40 (confirmed), HYP-41 (confirmed) |
| CTR-1 CAP-15 | Held states as other regions' activity: what one volume holds is the stable activity of an | THY-5 (created), THY-6 (shaped), HYP-16 (shaped), HYP-36 (shaped), QST-17 (shaped), HYP-41 (shaped) |
| CTR-1 CAP-11 | Two kinds of memory: general memory keeps what pays over repetition; experiences are kept  | HYP-1 (shaped), HYP-4 (shaped), QST-10 (created), HYP-14 (confirmed), HYP-17 (confirmed), HYP-33 (shaped), HYP-36 (shaped), QST-17 (shaped), HYP-37 (shaped), HYP-41 (shaped) |
| CTR-1 CAP-14 | Exact records kept outside, in something it can read and write. | — |
| CTR-1 PRN-1 | Prefer the deeper explanation to a new mechanism. | PRB-5 (shaped), THY-7 (confirmed), INC-5 (confirmed) |
| CTR-1 PRN-2 | Prefer removing structure to adding it. | PRB-2 (shaped), PRB-3 (confirmed) |
| CTR-1 PRN-6 | Prefer the same mechanism with different settings to a different mechanism. | HYP-11 (shaped), HYP-18 (confirmed), PRB-11 (changed), THY-7 (confirmed) |
| CTR-1 PRN-3 | Let heat decide where effort goes. | HYP-2 (shaped), HYP-23 (confirmed) |
| CTR-1 PRN-4 | Settle locally first. | HYP-13 (shaped), THY-4 (created) |
| CTR-1 PRN-5 | Prefer what was lived to what was inferred. | QST-9 (shaped) |
| CTR-2 DEF-1 | The core: `src/engine/`, the main line. | — |
| CTR-2 DEF-2 | The branch: the integrated working copy, `experiments/sketches/C56-integrated/engine/`. | — |
| CTR-2 DEF-3 | A sketch: an experiment copy outside both, for a quick question. | — |
| CTR-2 DEF-4 | Given by hand (puppeteering): anything supplied by the experimenter instead of done by the machine. | — |
| CTR-2 DEF-5 | A crutch: a number tuned to pass a test, a filter, or a rule written for a task. | — |
| CTR-2 DEF-6 | A patch: structure added to cover a misfit instead of resolving it. | — |
| CTR-2 DEF-7 | A declared choice: anything in the system that doesn't follow from its rule, written down with what would | — |
| CTR-2 DEF-8 | Evidence: a measured result against a baseline, with what was given by hand (DEF-4) stated. | — |
| CTR-2 DEF-9 | A violation: a place where an experiment breaks a clause of CTR-1 or CTR-2: something given by hand, a | PRB-10 (created) |
| CTR-2 DEF-10 | Distillation: removing an experiment's violations (DEF-9) one at a time, measuring after each, until wha | PRB-10 (created) |
| CTR-2 DEF-11 | Bookkeeping: the program keeping a list of the system's things (assemblies, memories, placements) and | PRB-12 (created) |
| CTR-2 GOL-1 | A system that fulfils CTR-1, with evidence (DEF-8) for each clause it claims. | — |
| CTR-2 GOL-2 | The owner and any agent who picks up the work hold the same understanding of it, without d | PRB-8 (created) |
| CTR-2 GOL-3 | Every result we build on is distilled (DEF-10): what it rests on fulfils the contracts. | PRB-10 (created), PRO-3 (shaped) |
| CTR-2 OPZ-1 | Less given by hand (DEF-4), in every experiment and in the system. | PRB-7 (created), HYP-22 (confirmed), HYP-28 (confirmed) |
| CTR-2 OPZ-2 | Fewer declared choices (DEF-7): each moved into the system's rule, or removed. | — |
| CTR-2 OPZ-3 | Less time lost: to results that rested on puppeteering, to drift, to misunderstanding. | — |
| CTR-2 OPZ-4 | The smallest code that fulfils CTR-1: fewest constructs and lines, echoing CTR-1 OPZ-3. | — |
| CTR-2 CON-3 | No crutches (DEF-5) and no patches (DEF-6). | PRB-2 (created), INC-5 (confirmed) |
| CTR-2 CON-2 | Given by hand (DEF-4) only to narrow in on something, always declared, and no claim may re | PRB-7 (created), INC-3 (confirmed), HYP-36 (confirmed) |
| CTR-2 CON-7 | Every experiment lists its violations (DEF-9), clause by clause. Violations are allowed wh | PRB-10 (created), INC-3 (confirmed), HYP-32 (confirmed), HYP-33 (confirmed), HYP-34 (confirmed), HYP-35 (confirmed), HYP-36 (confirmed), HYP-37 (confirmed), HYP-38 (confirmed), HYP-39 (confirmed), HYP-40 (confirmed), HYP-41 (confirmed) |
| CTR-2 CON-4 | Every declared choice (DEF-7) is written in `docs/decisions/`. | — |
| CTR-2 CON-1 | Nothing goes into the core (DEF-1) unless it is distilled (DEF-10), with evidence (DEF-8)  | PRO-2 (shaped), PRB-10 (changed), PRB-11 (changed), PRO-4 (confirmed), PRO-6 (challenged), PRO-7 (confirmed) |
| CTR-2 CON-8 | Bookkeeping (DEF-11) may be used in experiments, declared as a violation (CON-7), but neve | PRB-12 (created), THY-7 (shaped), PRB-13 (shaped), PRO-5 (confirmed), INC-4 (confirmed), PRO-6 (confirmed) |
| CTR-2 CON-5 | No new terms without the owner's agreement; words keep the meanings in the glossary. | PRB-9 (created) |
| CTR-2 CON-6 | Commits and bundles only when the owner asks. | — |
| CTR-2 CAP-4 | The assistant: reasoning, writing, building and running experiments. | — |
| CTR-2 CAP-3 | Written memory that outlasts a session: checkpoints, findings, theories, guides, contracts | PRB-9 (confirmed) |
| CTR-2 CAP-6 | The contracts as a measuring rod: any experiment can be read against them clause by clause | PRB-10 (created) |
| CTR-2 CAP-7 | Reference models: documents and pseudocode describing how to build each part (`docs/refere | PRB-13 (created), PRO-5 (confirmed), INC-4 (changed), PRO-6 (changed) |
| CTR-2 CAP-1 | Sketch, branch and core (DEF-3, DEF-2, DEF-1): ideas tried cheaply, kept apart until they' | PRO-1 (created) |
| CTR-2 CAP-2 | Visuals and the sandbox: agreeing how something works by seeing it. | PRB-9 (created), PRO-6 (confirmed) |
| CTR-2 CAP-5 | The system itself as a helper ("Neil"), once it can hold our history. | — |
| CTR-2 PRN-1 | Don't change anything until you understand it. | — |
| CTR-2 PRN-2 | Measure against a baseline before believing a result; an explanation is not evidence. | HYP-40 (confirmed) |
| CTR-2 PRN-3 | A result that looks too good is checked for what was given by hand (CON-2). | QST-12 (created), HYP-16 (confirmed) |
| CTR-2 PRN-7 | Explore freely, then distil: once a handful of experiments have made a result worth keepin | PRB-10 (created), PRO-3 (confirmed) |
| CTR-2 PRN-4 | Inspired, not copied. | — |
| CTR-2 PRN-6 | Detail where misreading is likely: a reader fills gaps with their own picture. | PRB-9 (created) |
| CTR-2 PRN-5 | Plain words, and pictures when words drift (CAP-2); walk through a visual by what to press | PRB-9 (created) |

## Open

- PRB-4 · Problem: Busy scenes stop learning.
- HYP-12 · Hypothesis: General assemblies with slots (kinds over items, several slots).
- THY-2 · Theory: Architecture and regulation: many regions, the same engine with a few settings, wired by a few kinds of connection; heat as distance from each region's stasis.
- THY-3 · Theory: Feelings as heat: trapped heat is distress, patching is rationalising, outward heat is curiosity.
- THY-4 · Theory: Regulators and heat: everything is a regulator; a disturbance spreads and is settled together.
- THY-5 · Theory: Sparse, event-driven computation: things change only in reaction to other things, and a held state is another region's stable activity projecting in, not recomputed (the owner's).
- THY-6 · Theory: Persistent assemblies: what a region settled into stays active and changes only when something arriving doesn't fit it; these are the held states (the owner's).
- QST-14 · Question: Frames beyond literal placement: "the bird was flying and found and ate a worm" and "bird eats worm" share one frame underneath. How? (The owner expects to discover it, perhaps from the right architecture of regions.)
- QST-15 · Question: A variable holds one value; a value can belong to many variables. What in the structure says which side of a bond is which, so that binding "y" to "1" does not undo "x = 1"?
- PRB-16 · Problem: One-off inputs are kept as compositions of old fragments and chain memories together; nothing at the level of cells asks whether a cut or a tie pays.
- QST-16 · Question: When is completing a memory from a small part worth what it claims? In a stream the machine can't tell "not there" from "not seen yet"; the old core priced hidden parts at nothing by marking them known-unknown.
- QST-17 · Question: How do a slow volume and a fast one settle into one answer, and how does what settles in the fast one sink into the slow one, without the experimenter choosing?
