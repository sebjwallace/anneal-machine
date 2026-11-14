# Sketch 37: learnt NOT (rough)

`./runall.sh` runs every pre-registered setting, about 14 minutes in all. No single run takes more than about a minute.

- **Part 1** is `node part1-exceptions.js`, with flags `MODE=pos|posmean|not|ungated`, `BETA`, `NOISE` and `NEV`.
- **Parts 2 and 3** are `node part23-entities.js`, with flags `ID=none|count|not|ungated`, `CHG=1`, `SCENE` and `BETA`.
- **Seeds and outputs:** the default seeds are the test seeds, 41–50. The outputs are the `run-p1-*`, `run-p2-*` and `run-p3-*` files.
- **Pre-registration:** `PREREG.txt` holds the settings and predictions. They were written after smoke runs on dev seed 37 and before any test run.
- **Reference code:** sketches 26 and 27 are copied here unchanged as `sketch26-ref.js` and `sketch27-ref.js`. Earlier folders are untouched.

## Question

[Hypothesis 05](hypothesis.md) asks whether inhibition can be learnt from misfit, as locally and unsupervised as everything else.

- **Learn:** when C is active, X is predicted, and X does not happen, C grows an inhibitory link onto X.
- **Unlearn:** when X happens with C active, that link weakens.

If so, does it do three things?

1. Handle exceptions without damaging the general rule.
2. Replace sketch 27's hand-written identity bookkeeping.
3. Break sketch 26's lock-in.

## Set-up

### The common rule

Only **cell-level NOT** is tested here. An inhibitory link goes from an active cell (or input column) onto a target cell, and its input is subtracted from the target's drive. Segment-level AND NOT is not tested.

- **Misfit** is the automaton's own prediction minus what happened. It is never "what the answer was".
- **Balance (Vogels-style):** every potential inhibitory link from an active cell onto a *driven* cell moves by `BETA·(active − RHO0)`. So a cell that is driven and fires more than RHO0 = 0.5 of the time gains inhibition, and one that fires less loses it.
  - This is a fixed set point, as in Vogels and colleagues (2011). It is not a target taken from the world.
  - BETA is swept over BETA/ETAI ∈ {0, .01, .03, .1, .3, 1}. The range was fixed in advance.

### Part 1: exceptions (new world)

- **The world.** Each event is a context "modifier kind" followed by its properties.
  - "bird" → "flies", "sings"; "dog" → "barks", "runs"; "fish" → "swims".
  - There are 6 modifiers ("white", "black", "brown", "grey", "small", "big"), shared by every kind.
  - Each property token is dropped at random 5% of the time (`NOISE`).
- **Exceptions:**
  - "ostrich bird": from the start, does not fly ("sings", "runs");
  - "penguin bird": first appears at event 1500, after the rule is hard ("sings", "swims");
  - "chick bird": does not fly until event 3000, then flies.
- **Substrate.** Each token is 4 cells.
  - Positive links are instar links: `w += 0.1·(post − w)` when the presynaptic cell is active, so w ≈ P(x | a).
  - A cell is predicted with p = clip(Σ positive − Σ inhibitory, 0, 1), counted per token. A token is "predicted" when its mean p ≥ 0.5.
- **Inhibitory links (`not`):**
  - over-prediction (p > what happened): each active cell's link onto x grows by ETAI·misfit, with ETAI = 0.1;
  - under-prediction: existing links shrink by the same amount.
- **Controls:**
  - `pos`: positive links only, summed drive;
  - `posmean`: positive links only, drive averaged over the context tokens, so an exception token can out-vote the rule;
  - `ungated`: inhibition grows whenever X is absent with C active, whether or not X was predicted. This is learning from the answer.
- **Probes** (no learning, every 150 events):
  - the 6 regular birds;
  - a novel "green bird", never seen;
  - dogs and fish;
  - the three exceptions;
  - every context × property pair.

### Parts 2 and 3: entities (sketch 27's code and world)

- **Learnt NOT (`ID=not`), replacing sketch 27's minimal-contrast evidence counter.**
  - **The failed prediction:** in a scene, the automaton's own free pick for a segment is an entity already claimed by another segment of the same scene. The world has just shown two things at once, so the pick was wrong.
  - **Learning:** the segment's input columns grow inhibitory links onto every cell of that entity: `w += 0.5·(1 − w)`.
  - **Unlearning:** whenever an entity is selected, the links from the current input columns onto its cells halve.
- **How inhibition is used.**
  - I is the summed inhibition from the input onto the entity, counted per token.
  - It **subtracts from the matched support**: the entity is acceptable only if #matched − I > 0 and #matched − I ≥ #missing.
  - I is also added to the selection score.
- **Other variants:**
  - `ID=none`: scenes split on contradiction, but nothing is learnt;
  - `ID=count`: sketch 27 itself;
  - `ID=ungated`: inhibition is learnt between every co-present pair, whether mistaken or not.
- **Part 3 = sketch 26's loop.** `CHG=1` adds sketch 26's changeability learnt from confident updates. `SCENE=0` is sketch 26's world.
  - At SCENE=0 there are no contradictions, so learnt NOT has **no misfit to learn from**. Only the balance term can act there, so the BETA sweep is the real test.
  - `SCENE=0.2` gives it an independent source.

### Changed on the dev seed before pre-registration (stated plainly)

1. **Hard block replaced.** Parts 2 and 3 first used a hard block: an entity was rejected if I ≥ 1.
   - It deadlocked: a blocked entity is never selected, so its inhibition is never unlearnt.
   - I replaced it with "inhibition subtracts from the matched support".
2. **Balance widened.** Balance first acted only on links that misfit had already made. I widened it to every potential link onto a driven cell, as Vogels' rule acts on all inhibitory synapses.

Nothing was changed after the test runs. The diagnostic "learnt inhibition onto entities holding / not holding the token" was in the code before the test runs.

## Results (seeds 41–50, 10 seeds pooled)

### Part 1: exceptions

The values are fractions of seeds at the phase ends: 3000 is after the penguin has arrived, and 4500 is after the chick has started flying.

| | **pos** | **posmean** (out-voting) | **not**, BETA 0 | ungated | not, NOISE .2 | pos, NOISE .2 |
|---|---|---|---|---|---|---|
| "ostrich bird" not "flies" @3000 / @4500 | .1 / 0 | 1 / 1 | **1 / 1** | 1 / 1 | 1 / 1 | .4 / .3 |
| "penguin bird" (late) not "flies" @3000 / @4500 | .1 / 0 | 1 / 1 | **1 / 1** | 1 / 1 | 1 / 1 | .4 / .3 |
| "chick bird" not "flies" @3000; "flies" @4500 | .1; 1 | 1; 1 | **1; 1** | 1; 1 | 1; .9 | .4; 1 |
| chick occurrences after 3000 until it "flies" again | 1 | 3.1 | **3.6** (max 6) | 7.9 | 5.8 | 1 |
| regular birds → "flies" @4500 | 1 | **.70** (.35 @3000) | **1.00** | **.15** | .88 | 1 |
| novel "green bird" → "flies" @4500 | 1 | **0** | **.8** | .3 | .4 | .7 |
| dogs/fish → "flies" (false) | .1 | 0 | 0 | 0 | 0 | .02 |
| "ostrich runs" / "penguin swims" @4500 | 1 / 1 | .9 / .6 | .9 / 1 | **0 / 0** | .7 / .8 | 1 / 1 |
| all context × property pairs correct @4500 | .92 | .97 | **.998** | .81 | .94 | .97 |
| inhibitory links @4500 | 0 | 0 | 824 | 3216 | 846 | 0 |
| links changed per event (positive + inhibitory) | 113 | 113 | 147 | 288 | 167 | 113 |

**Balance sweep (`not`, NOISE .05).** This adds nothing at small strength and hurts at large strength.

| BETA (BETA/ETAI) | 0 | .001 (.01) | .003 (.03) | .01 (.1) | .03 (.3) | .1 (1) |
|---|---|---|---|---|---|---|
| regular birds → "flies" @4500 | 1.00 | 1.00 | 1.00 | 1.00 | .93 | .83 |
| novel "green bird" → "flies" | .8 | .8 | .7 | .7 | .5 | 0 |
| chick "flies" @4500 / occurrences to recover | 1 / 3.6 | 1 / 3.4 | 1 / 3.2 | 1 / 2.5 | 1 / 1.8 | .8 / 1.2 |
| all pairs correct @4500 | .998 | .998 | .998 | .997 | .982 | .933 |
| inhibitory weight (total) @4500 | 222 | 200 | 193 | 185 | 166 | 126 |
| links changed per event | 147 | 308 | 322 | 361 | 410 | 410 |

**Long run (18000 events, `not`, BETA 0).** Total inhibitory weight was 94 at event 150, 227 at 6000, about 236 at 12000 and 240 at 18000. It levels off: the last third adds 2% of the first third's level. Every probe is still correct at 18000, and novel "green bird" is at 1.0.

### Part 2: identity (sketch 27's world, SCENE .2 unless stated)

| | none (scenes, no ID) | **count (sketch 27)** | **not** | not + BETA .005 … .5 | ungated | none / count / not at SCENE .05 |
|---|---|---|---|---|---|---|
| **single snapshots: wrong entity** | 12.0% | **2.9%** | **12.6%** | 18–19% | 12.9% | 11.2 / 5.2 / 12.2% |
| wrong entity by bin (1 → 8) | .15 .13 .10 .10 .08 .11 .13 .16 | .11 .06 .04 .01 0 0 0 .01 | .17 .13 .11 .12 .10 .10 .13 .14 | ≈ .21 → .19, flat | .21 → .12 | |
| right-name entity blocked by inhibition | – | – | 1.1% | 0–0.7% | **86%** | |
| scene contradictions (per scene) = misfit events | .018 | .000 | .019 | .007–.012 | .032 | |
| automaton entities at end (true 9) | 18.0 | 26.1 | 18.7 | 17.5–18.9 | **51.8** | 17.0 / 24.8 / 17.5 |
| true entity held by exactly one | 33% | 19% | 30% | 16–23% | 1% | 38 / 19 / 37% |
| get correct (whole stream) | **73%** | 40% | 66% | 52–53% | 26% | 76 / 50 / 73% |
| "ginger cat sleeping" created as new | 0/10 | **10/10** | 0/10 | 0/10 | 0/10 | 0 / 10 / 0 |
| inhibition from token onto entities holding it / not holding it: colour | – | – | .032 / .027 | | .32 / .54 | |
| same, activity | – | – | .046 / .023 | | .40 / .52 | |
| inhibitory links changed per event | 0 | 0 | 4–5 | **≈ 800** | ≈ 430 | |

### Part 3: lock-in (CHG=1)

| | sketch 26 (none, SCENE 0) | not, SCENE 0, BETA 0 | BETA .005 / .015 / .05 | BETA .15 | BETA .5 | none, SCENE .2 | **not, SCENE .2** | count, SCENE .2 |
|---|---|---|---|---|---|---|---|---|
| **changeability activity / animal / colour** | .09 / .10 / .88 | identical | .09 / .10 / .88 | .15 / .09 / .81 | .15 / .09 / .81 | .14 / .07 / .78 | **.15 / .09 / .81** | .32 / .17 / .64 |
| **single snapshots: wrong entity** | 60.1% | 60.1% | 60.3–60.5% | 55.1% | 56.0% | 38.2% | **54.3%** | 4.0% |
| wrong entity by bin | flat ≈ .60 | same | flat | flat ≈ .55 | flat ≈ .56 | .50 → .33 | flat ≈ .54 | .28 → 0 |
| automaton entities at end / held once | 18.5 / 26% | same | 18.5 / 26% | 18.2 / 26% | 34.1 / 7% | 29.8 / 14% | 36.2 / 12% | 50.9 / 0% |
| get correct | 37% | 37% | 37–38% | 41% | 33% | 32% | 36% | 21% |
| inhibitory links changed per event | 0 | 0 | ≈ 580 | ≈ 590 | ≈ 610 | 0 | 5–14 | 0 |

- **This sketch-26 baseline is worse than sketch 26's own run** (60% wrong against 48%). The seeds are different, and so is the world generator: sketch 27's world draws one extra random number per event. Every column here was run on the same seeds.

**Cost per step (parts 2 and 3, unchanged by NOT).** About 21 cells active, about 26 cells' links changed and 4.5–5 cells recruited per step. Learnt NOT adds 4–14 inhibitory link changes per event. Balance adds 550–800.

## Predictions (PREREG.txt)

| | prediction | outcome |
|---|---|---|
| E1 | NOT honours all three exceptions with the rule intact; pos fails them; posmean honours them but fails "green bird" | **held** (posmean also loses the rule for regular birds: .35–.70) |
| E2 | NOT does not rescue novel "green bird" (< 50%) | **failed**: .8 at 4500, 1.0 at 18000 (better than predicted) |
| E3 | chick recovers in ≤ 10 occurrences | **held** (3.6, max 6) |
| E4 | ungated breaks positive predictions; ≥ 3× the links | **held** ("ostrich runs" and "penguin swims" 0/10, regular birds fly .15; 3.9× links) |
| E5 | without balance, inhibition levels off; BETA/ETAI ≥ .3 breaks the rule | levels off: **held**. Rule breaks at .3: **failed as stated** (.93 at .3, .83 at 1). Small BETA changes little: **held** |
| I1 | NOT > count and within 5 points of none on wrong entity | **held** (12.6 vs 2.9 and 12.0) |
| I2 | ungated silences (> 30% blocked) and multiplies duplicates | **held** (86%, 52 entities) |
| L1 | lock-in not broken at SCENE 0 for any BETA; wrong entity within 5 points | **held** (colour ≥ .81 > activity ≤ .15; best 55.1% vs 60.1%, right at the 5-point edge) |
| L2 | with scenes, NOT does not break the lock-in | **held**, and NOT made it worse than no ID learning (54% vs 38%) |

## What it suggests

### Part 1: cell-level NOT works for exceptions

- **Learnt from the automaton's own failed prediction, cell-level NOT does exactly what the hypothesis says.**
  - The early, late and lapsed exceptions are all honoured.
  - The late "penguin" is honoured after 1–2 occurrences, even though "bird" → "flies" was already hard.
  - The general rule stays at 100% for the regular birds and at 80–100% for a bird never seen.
  - "chick" recovers in 3–4 occurrences once it starts flying.
  - Nothing is silenced, and total inhibition levels off with no balance at all.
- **This is Rescorla–Wagner conditioned inhibition** in local, cell-level form. It is not new, but it fits the theory cleanly: heat is the over-prediction at X, and once the prediction fits, nothing more changes.
- **Positive-only fails in the expected two ways.**
  - With summed drive, exceptions are never honoured.
  - With out-voting (averaged drive), exceptions are honoured but the rule is damaged for everyone: regular birds fly in only 35–70% of seeds, and "green bird" in 0%.
- **The prediction gate is what keeps it cheap and harmless.** Without the gate, inhibition is learnt from every absence, so it learns from the answer. That produces 4× the links and destroys the positive knowledge: "ostrich runs" and "penguin swims" are lost, and regular birds fly in only 15%.

### Balance (Vogels-style) is not needed here, and costs a lot

- The prediction gate is already a negative feedback loop: inhibition stops growing the moment the prediction fits.
- A fixed set point (RHO0 = 0.5) fights the world's real rates. At BETA/ETAI ≥ .3 it starts inhibiting the rule itself.
- Balance also costs 2–3× the link changes in part 1, and 100× the inhibitory link changes in parts 2 and 3, because it touches every potential link onto every driven cell. That goes against "only what changes costs anything".
- Prediction 4 of the hypothesis ("it stays balanced") holds, but **without** the balance rule.

### Part 2: learnt NOT does not replace sketch 27's bookkeeping

- **The wrong-entity rate is 12.6%, the same as learning nothing (12.0%), against 2.9% for sketch 27.**
- **Too few failed predictions.** The misfit event is the automaton picking a co-present entity, and that happens only about 0.02 times per scene, or about 8 times per seed.
- **Wrong credit assignment.** Each misfit event credits *all* of the segment's tokens. A contradiction typically comes from a minimal contrast ("grey cat sleeping . black cat sleeping"), so the shared tokens ("cat", "sleeping") get as much inhibition as the identity token ("black").
  - Unlearning needs many selections to sort that out.
  - Learnt inhibition onto entities *holding* a token ends up as large as onto entities *not* holding it (colour .032 vs .027; activity .046 vs .023).
- **No transfer.** The inhibition is per entity. Nothing generalises to "colour is identity", so "ginger" is never created as new (0/10, against 10/10 for sketch 27).
  - Sketch 27's counter works because it is per column (per kind), and because it uses every minimal contrast in a scene, not only the ones the automaton gets wrong.
- **Ungated co-presence inhibition is worse.** "cat" inhibits every other cat, and since a blocked entity can't unlearn, 86% of right-name entities end up blocked: 52 entities for 9.

### Part 3: the lock-in is not broken

- **At SCENE 0 there is no misfit for learnt NOT to learn from.** In single snapshots, the only judge of a wrong entity is the automaton's own selection, which is the same trap as sketch 26.
  - With BETA = 0, learnt NOT is identical to sketch 26 by construction.
- **Balance alone (pure activity homeostasis) is a negative feedback loop, but it is blind.**
  - It inhibits the over-winning entity from whatever is active, including its own name.
  - At BETA .15 it trims the wrong-entity rate by 5 points (60 → 55%), and changeability stays inverted (colour .81, activity .15).
  - At BETA .5 it doubles the duplicates.
- **With scenes, learnt NOT made things worse** (54% wrong vs 38% with scenes alone).
  - Activity tokens end up inhibiting the entities that hold them (.25 vs .11), so true activity updates are pushed away.
  - That leaves colour updates as the "confident updates" that drive changeability.
- **Even sketch 27's counter (count + CHG) only suppresses the merges** (4% wrong). Changeability still comes out the wrong way round (colour .64 > activity .32).
  - The changeability statistic stays inverted even when the merges stop, so what it learns is not "what changes".

### Overall

**Learnt NOT is a good local mechanism where the world itself supplies the failed prediction:**
- what happens next;
- what is predicted to co-occur.

**It is not a source of independent evidence.** Where the only check on a prediction is the automaton's own decision (entity selection), it inherits the same blindness. The hypothesis's prediction 3 ("negative feedback is the missing counterbalance") does not hold in this form.

## Ways it could be fooling us

- **Part 1's world is easy for RW-style learning.** Each exception has its own token, so the exception is linearly separable. A context-dependent exception (for example "bird flies, unless caged *and* old") needs segment-level AND NOT and was not tested.
- **The probe threshold (0.5) and the cell grouping (4 symmetric cells per token) make cell level here equivalent to token level.** Nothing yet shows a difference that cell identity makes.
- **Instar positive links already partly encode the exceptions** (P("flies" | "bird") ≈ .65). Plain saturating Hebbian links, as in earlier sketches, would make positive-only look worse and might make NOT carry more load. I did not run it.
- **"penguin honoured after N occurrences" for `pos` is misleading.** Instar noise briefly takes it under 0.5, so use the phase-end numbers.
- **Parts 2 and 3 use one fixed setting** (ETAI 0.5, multiplicative unlearn 0.5, and inhibition subtracting from the matched parts). A slower rate with more misfit events might sort out credit assignment. The rate of contradictions, not the rate of learning, looks like the limit, but I did not test that.
- **The misfit source in part 2 is a choice.** I took "own pick is a co-present entity". Another reading of the hypothesis, mutual inhibition between co-present entities' identity parts, is the ungated control, and it failed differently.
  - Neither version limits learning to the *differing* tokens. Doing that would recreate sketch 27's minimal-contrast rule by hand.
- **The fixed balance set point (0.5) is arbitrary.** A target taken from each cell's own history (calibration) would probably be harmless in part 1, but it is a different rule.
- **The part 3 baseline is worse than sketch 26's own run** (60% against 48%), because the seeds and the random draws in the world generator differ. The comparisons are within this sketch only.
- **Changes made on the dev seed** (the hard block, and balance on potential links) were decisions, not discoveries. The hard block failed by deadlock, which is itself a lesson: inhibition that blocks selection prevents its own unlearning.

## How to run

```
./runall.sh                                   # everything pre-registered, about 14 min
MODE=not BETA=0 node part1-exceptions.js      # part 1, mechanism (MODE=pos|posmean|ungated; NOISE=0.2; NEV=18000)
ID=not SCENE=0.2 node part23-entities.js      # part 2 (ID=none|count|ungated; SCENE=0.05; BETA=...)
ID=not CHG=1 SCENE=0 BETA=0.15 node part23-entities.js   # part 3
SEEDS=37 ...                                  # dev seed
```
