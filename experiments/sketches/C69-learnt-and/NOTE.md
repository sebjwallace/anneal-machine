# Sketch 36: AND as learnt segments

`node sketch.js` (about 5 s; 10 seeds × 3000 events). Flags: `MODE=plain|hash|hashtok|seg` (default `seg`), `WORLD=a|b`, `SEGN` (segment size, default 8), `THETA` (soft-AND threshold, default 0.75), `COLS=0` (cells only, no column units), `NEV` (events per seed). `./runall.sh` runs everything pre-registered (about 4 minutes; the THETA=0.5 runs are the slow ones because they grow thousands of segments). Outputs are in `run-*.txt`. Settings and predictions are in `PREREG.txt`, written after smoke runs on development seed 1 and before any run on test seeds 101–110. Earlier sketches are untouched; nothing was copied from them except the RNG and the general shape of columns, assemblies and casting.

## Question

From [hypothesis 04](hypothesis.md): can a cell learn a **combination** (an AND), not just a sum, by growing segments, with no labels and no designed conjunction? Four predictions:
1. segments solve combination-dependent outcomes that plain links can't;
2. they are economical: grown early, then mostly stop;
3. they are soft: one input missing or replaced by noise still lets them fire;
4. they transfer to unseen combinations that share a kind, more than the hashed shortcut.

## Set-up (fixed before running)

**World a.** Each event is four tokens and an outcome, e.g. "grey cat" + "bowl full" → "eating".
- 5 colours × 3 animals ("cat", "dog", "bird") × 3 contexts ("bowl full", "bowl empty", "door shut"). The outcome is set by animal × context through a 3 × 3 Latin square over "eating", "sleeping", "calling". Colour is irrelevant. So each single token predicts the outcome no better than chance: the measured single-token ceilings on the stream are 0.39–0.42 (above 1/3 only because held-out combinations unbalance the counts); animal + state together give 1.00.
- One context decides alone: "door open" → "leaving" for every animal.
- **Held out:** 3 (colour, context) combinations per animal never appear in training, e.g. "black cat" + "bowl full". The same animal × context is seen with the other colours.

**World b.** Same idea, bigger and with exceptions: 4 animals × 4 contexts (4 × 4 Latin square over 4 outcomes), two contexts that decide alone ("door open" → "leaving", "light on" → "sleeping"), and two three-way exceptions where one individual breaks its kind's rule ("ginger cat" + "bowl full" → "hiding", "white dog" + "light off" → "eating"). 12 held-out combinations.

**Substrate.**
- 120 columns × 8 cells. Every token (inputs and outcomes) has 6 columns: 3 own random columns and 3 learnt from its neighbours in the event ("<", "grey", "cat", "|", "bowl", "full", outcome, ">"), with slow decay and a switching margin. Each (token, column) claims one little-used cell: the token's assembly.
- Learnt codes came out as expected: colours share about 3.1 of 6 columns, animals 3.1, "full"/"empty" 3.1; colour vs animal about 0.3–0.5. Tokens never share cells.
- Active presynaptic units for an event: the cells of each input token's assembly plus its 6 column units (sketch 20's two levels). About 41 units.

**Prediction (all models).** Each outcome cell sums its input: plain links (normalised by the number of active units) plus, in segment mode, firing segments. Casting keeps one winner per column and 6 columns overall. Two more settling rounds use the outcome assemblies' internal wiring, with the input pushing at 0.25. Read-out: the outcome assembly holding most winners (at least 2, no ties).

**Heat and plasticity (all models).** After the prediction, the world shows the outcome.
- A **hot** cell is one of the actual outcome's cells that was not cast: it should have been driven and wasn't.
- Plain links: from every active unit, links to hot cells strengthen (+0.2(1−w)), to fitting cells a little (+0.02(1−w)), and links to wrongly winning cells weaken (×0.8). This is residual-heat learning: no change when everything fits.
- Outcome assemblies wire internally by plain Hebbian learning.

**Segments (MODE=seg).**
- **Grow:** a hot cell with no segment firing for it grows one segment: SEGN units sampled uniformly from **all** units active then (cells and columns of all four tokens, relevant or not). Strength s = 0.3.
- **Fire:** if at least THETA of its synapses are active. It then adds 2 · s · (fraction active) to its cell's drive.
- **Keep:** fired and its cell was in the actual outcome: s += 0.2(1−s). Fired and it wasn't: s × 0.5. Removed below 0.1.
- A cell with several segments responds to any of them: an OR of ANDs.

**Comparisons.** `plain` (links only); `hash` (sketch 20c's shortcut: the pair *entity phrase × context phrase* gets 8 fixed units of a separate 4000-unit pool, with plain links from them); `hashtok` (control added beforehand: every pair of input tokens hashed, so "cat"+"full" is one shared unit set).

## Rules fixed beforehand

See `PREREG.txt`. Main setting SEGN = 8, THETA = 0.75, columns on. Sweep SEGN ∈ {4, 8, 16} × THETA ∈ {0.5, 0.75, 1.0} in both worlds; cells-only; a 12 000-event run. Two bugs were fixed on the dev seed before pre-registration (the names of the dropped tokens were in the wrong order, and the hashed item ignored dropped tokens). **Nothing was changed after the test runs.** No post hoc runs.

## Results (10 test seeds pooled; final tests with learning off)

**Main comparison.** "Drop" removes one token; "noise" replaces it with 6 random cells (+ columns); "extra" adds one unrelated token. Dropping colour or object leaves the answer determined; dropping animal or state doesn't (chance about 0.33 in a, 0.25 in b).

| world a | plain | hash (item pair) | hash (token pairs) | **segments** | segments, cells only | segments, 12 000 events |
|---|---|---|---|---|---|---|
| seen combinations | 0.36 | 1.00 | 1.00 | **0.98** | 0.99 | 1.00 |
| **held-out combinations** | 0.26 | 0.12 | 0.09 | **0.84** | 0.86 | 0.91 |
| "door open" (one input decides) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| drop / noise colour | .37/.37 | .62/.56 | .99/1.0 | **.89/.89** | .99/.99 | .97/.95 |
| drop / noise object | .38/.37 | .35/.33 | .99/.99 | **.81/.80** | .73/.73 | .93/.90 |
| drop animal / drop state | .30/.24 | .36/.29 | .36/.38 | .33/.22 | .33/.27 | .34/.21 |
| extra token | 0.28 | 0.38 | 0.80 | 0.74 | 0.81 | 0.74 |

| world b | plain | hash (item pair) | hash (token pairs) | **segments** | segments, cells only | segments, 12 000 events |
|---|---|---|---|---|---|---|
| seen combinations | 0.25 | 0.99 | 0.99 | **0.90** | 0.97 | 0.97 |
| **held-out combinations** | 0.13 | 0.10 | 0.24 | **0.71** | 0.91 | 0.88 |
| exceptions (2 per seed) | 0.20 | 1.00 | 0.90 | 0.65 | 0.65 | 0.65 |
| drop / noise colour | .26/.27 | .31/.31 | 1.0/1.0 | **.87/.90** | .99/.98 | .94/– |
| drop / noise object | .26/.25 | .31/.30 | .99/.99 | **.76/.76** | .59/.59 | .86/– |
| drop animal / drop state | .24/.18 | .25/.18 | .26/.33 | .25/.23 | .25/.25 | – |
| extra token | 0.24 | 0.23 | 0.69 | 0.65 | 0.77 | – |

**Accuracy over time** (combination events, prequential, blocks of 250):

| | blocks 1 … 12 |
|---|---|
| a, plain | .36 .33 .33 .34 .34 .34 .35 .32 .33 .36 .35 .33 |
| a, hash | .56 .84 .98 .99 .99 1.0 1.0 1.0 1.0 1.0 1.0 1.0 |
| a, **segments** | .73 .89 .92 .91 .92 .94 .94 .94 .96 .95 .96 .97 |
| a, segments, held-out probe | .64 .69 .73 .66 .69 .73 .70 .81 .79 .78 .82 .84 |
| b, **segments** | .60 .76 .79 .82 .82 .84 .87 .87 .88 .88 .88 .89 |
| b, segments, held-out probe | .51 .58 .70 .65 .58 .62 .63 .72 .71 .79 .78 .71 |

Segments learn faster than the hashed item pair at first (0.73 vs 0.56 in block 1), because a segment grown on "grey cat" + "bowl full" already fires for "white cat" + "bowl full"; the hash has to see each of the 45 items separately. The hash then overtakes and reaches 1.00.

**Segments over time** (main):

| | alive, block 1 → 12 | grown in block 1 → 12 | grown per combination event | alive per (animal × context) per cell |
|---|---|---|---|---|
| world a | 70 → 59 | 217 70 52 53 52 40 37 39 27 33 25 19 | 0.30 | 0.89 |
| world b | 107 → 98 | 316 140 131 109 106 96 78 83 79 82 78 68 | 0.70 | 0.76 |
| a, cells only | 81 → 68 | 167 31 21 16 19 12 9 12 7 11 9 6 | 0.14 | 1.00 |
| a, 12 000 events (blocks of 1000) | 63 → 56 | 391 167 104 108 73 87 68 43 55 51 31 31 | 0.14 | 0.84 |
| b, 12 000 events (blocks of 1000) | 102 → 93 | 697 363 306 243 231 190 173 166 149 140 133 132 | 0.38 | 0.73 |

"One per experience" would be 6 per event (one per hot cell). Only 11–24 segments per seed survive from "door open" / "light on" events, where links alone are enough.

**What fires.**
- Seen combinations: a right-outcome segment fires 99% of the time; a wrong-outcome one also fires 41% (a) / 61% (b), and loses the competition.
- Held-out: a right-outcome segment fires 98%, a wrong-outcome one 83%. Of the right-outcome segments firing on a held-out combination, **98% were grown on the same animal × context with another colour.**
- With colour or object dropped, a right segment still fires 97–99%. With animal dropped, 24% (a) / 23% (b).

**Sweep** (seen / held-out / segments grown per seed; both worlds, 3000 events):

| SEGN \ THETA | 0.5 | 0.75 | 1.0 |
|---|---|---|---|
| 4, world a | .36 / .23 / 6336 | .91 / .82 / 1625 | **1.00 / .77** / 252 |
| 4, world b | .23 / .23 / 6963 | .69 / .58 / 2910 | **1.00 / .82** / 423 |
| 8, world a | .33 / .29 / 6244 | **.98 / .84** / 662 | 1.00 / .33 / 263 |
| 8, world b | .24 / .25 / 6802 | **.90 / .71** / 1366 | 1.00 / .44 / 432 |
| 16, world a | .34 / .23 / 6343 | **.96 / .78** / 508 | 1.00 / .06 / 329 |
| 16, world b | .27 / .24 / 6791 | **.91 / .80** / 986 | 1.00 / .10 / 554 |

Bold: meets the pre-registered bar (seen ≥ 0.85 and held-out ≥ 0.6). Softness drops with THETA = 1: drop colour .56 / .44 at SEGN 8; .78 / .78 at SEGN 4.

**Cost per event** (main, world a; b in brackets): 41 active units; about 1150 (1330) link reads; 500 (810) segment-synapse checks over 63 (102) alive segments. The plain and hash models do the link reads only (the token-pair hash about 1970). So segments add about half again to the work, and they are checked by a scan of every segment; an index from presynaptic unit to segment would make it proportional to what is active.

## Predictions, verdicts

1. **Combinations: holds.** Segments reach 0.98 (a) and 0.90 (b) on seen combinations; plain links stay at 0.36 / 0.25, at or under the single-token ceiling. The hashed shortcut reaches 1.00 on seen combinations, so segments are slightly worse on what has been seen, in exchange for transfer and softness.
2. **Economy: holds by the pre-registered measures, but growth never stops.** Grown per combination event 0.30 / 0.70 (well under 6); last block's growth 9% / 22% of the first's (b only just under 25%); alive per real combination per cell 0.9 / 0.8. But the 12 000-event runs show growth still running at 0.03 (a) and 0.13 (b) per event at the end. The population is stable in size (about 60 / 95) with steady **turnover**: a segment that samples badly fires on the wrong combinations, is halved and goes, and a hot cell grows a replacement. About 11 (a) to 14 (b) segments are grown for each one alive at the end.
3. **Softness: mostly holds.** Drop or noise on colour: 0.89 / 0.87–0.90. On the object word: 0.81 (a), but **0.76 in world b, under the 0.8 bar**. Right-segment firing with a token dropped stays at 97–99%; the losses come from the competition, not from segments failing to fire. Dropping the animal or the state falls to chance, as it should.
4. **Transfer: holds, but not for the reason the hypothesis gives.** Held-out 0.84 / 0.71 (0.91 / 0.88 with 12 000 events), against 0.12 / 0.10 for the hashed item pair and 0.09 / 0.24 for hashed token pairs. Plain links score 0.26 / 0.13 (above the predicted 0.2 in a; the hash in a at 0.12 is above the predicted 0.1: both small misses on the baselines). **But the transfer is through the shared "cat" token's cells, not through shared columns.** The cells-only run transfers as well or better (0.86 / 0.91), and 98% of the segments doing the work were grown on the same animal and context. No test here shares *only* columns.

**Against the hypothesis?** No pre-registered "against" criterion triggered. SEGN 8 / THETA 0.75 and SEGN 4 / THETA 1.0 pass in both worlds, and SEGN 16 / THETA 0.75 in both as well. The working range is a band, not a point: THETA = 0.5 fails everywhere (segments fire on everything, about 6000 grown, accuracy at chance), and THETA = 1.0 only transfers when segments are small enough (4) to often miss the colour token by chance. Roughly, a segment must be able to lose about one token's share of its synapses and still fire: θ·N ≈ N − N/4.

## What it suggests

- **A heat-grown, randomly sampled soft AND works.** Nothing told segments which inputs matter. They sample from everything active, and selection (fit strengthens, misfit halves) keeps the samples that happen to land on animal + state. Colour and object end up as passengers the segment can lose.
- **Softness and specificity are the same knob.** Combinations here differ by one token ("cat full" vs "cat empty"), which is exactly what "one input dropped" also is. A threshold that tolerates one missing token also fires on the neighbouring combination; what decides is competition (graded drive, the better match wins) and the weakening of segments that misfire. That is why wrong-outcome segments fire 40–80% of the time and still lose.
- **Turnover is the price.** The automaton never settles to zero growth, because some sampled segments are bad and are replaced. It is bounded (the alive count is flat) and cheap, but it is not "grow early, then stop".
- **Column units cost more than they give here.** Cells-only is cleaner (seen 0.99 / 0.97, growth falls to about 6 per block in a), because shared column units ("full" and "empty" share 3 columns) make segments less specific. They only helped softness to dropping the object word, because the object's columns are shared with the animal's learnt columns.
- **Individual exceptions stay half-learnt** (0.65): the kind-level segments for "cat" + "bowl full" fire on "ginger cat" too and outvote the exception's own. The hash gets them at 1.00. An exception needs a segment that includes the colour, and the selection rule doesn't favour that.
- **For sketch 20d's slot problem**, this suggests a segment on the next-word cells sampling (subject × slot) would give the slot-specific conjunction without a hashed pool. Not tested.

## Ways it could be fooling us

- **Transfer goes through a shared token.** "black cat" and "grey cat" share the whole "cat" assembly (cells and columns), so prediction 4's "through columns" is not tested. A world where kind-mates share columns but no cells (e.g. names whose kind is learnt only from use) is the real test.
- **The world is small and regular**: 9 or 16 kind-level combinations, a Latin square, tokens in fixed slots. The held-out set is 9 / 12 per seed; differences of 0.1 between runs are within seed spread (held-out ranges 0.5–1.0 per seed).
- **Held-out combinations are adversarial for additive learners by construction:** every token's training history points away from the held-out outcome. So plain and hashed models score *below* chance there. That is fair to them (it is what single inputs say) but makes the gap look larger than "no transfer vs transfer".
- **The token-pair hash is a strong control on softness** (0.99 when colour or object is dropped) and is designed in. It fails transfer here only because 5 of its 6 pairs mislead; with fewer distracting pairs it might transfer.
- **Segments keep the same graded drive rule** (2 · s · fraction), the halving on misfit, and SMIN. Only SEGN and THETA were swept; the other constants were chosen once on the dev seed.
- **Readout counts winning cells per assembly**, which is a symbolic step for scoring only; the mechanism itself never looks at token names.
- **Exceptions are 2 per seed**: 0.65 is 13 of 20.

## How to run

```
./runall.sh                                   # every pre-registered run, about 4 minutes
WORLD=a|b MODE=plain|hash|hashtok node sketch.js
WORLD=a|b SEGN=4|8|16 THETA=0.5|0.75|1 node sketch.js   -> run-<w>-seg-n<N>-t<T>.txt
WORLD=a|b COLS=0 node sketch.js               # cells only     -> run-<w>-seg-cells-only.txt
WORLD=a|b NEV=12000 node sketch.js            # long run       -> run-<w>-seg-long.txt
SEEDS=1 node sketch.js                        # development seed
```
