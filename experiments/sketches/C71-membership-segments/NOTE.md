# Sketch 38: segments as assembly membership

`./runall.sh` runs every pre-registered setting (60 runs of 35–80 s, two at a time; about 25 minutes). It then writes `summary.txt` with all the tables below. A single run: `CPC=8 MODE=seg SEGN=all node sketch.js` (seeds 101–105, M = 25…400). Flags: `MODE=sum|seg`, `NORM=fit|raw` (sum), `SEGN=16|all`, `THETA`, `CAST=1`, `SAMPLE=rare`, `CTX=0`, `CPC`, `MS`, `SEEDS`. Settings and predictions are in `PREREG.txt`, written after smoke runs on development seed 1 and before any run on test seeds 101–105. Sketch 20's code is copied in unchanged as `sketch-settle-ref.js` and `sketch-asm-ref.js`. Earlier folders are untouched.

## Question

From [hypothesis 06](hypothesis.md): finding 02 left a blending limit. With few cells per column, cells end up in several assemblies, and summed links produce mixtures. If each cell instead has one **segment per assembly it belongs to**, an AND over that assembly's other members, does that:
1. stop blending when cells are shared;
2. fit more assemblies into the same cells;
3. still complete from a part, and refuse a cue split across two assemblies;
4. keep kind transfer;
5. stay cheap, because an index means only segments with an active input are checked?

## Set-up

**Substrate (from sketch 20, unchanged).**
- The sentence world of finding 02.
- Learnt column codes: 400 columns; a word has 4 own columns plus 4 learnt by affinity.
- One cell per (word, column), claimed by the least-owned rule. Those 8 cells are the word's assembly.
- Cells per column (CPC) is swept over 2, 4, 8 and 16. Codes are learnt online, as in sketch 20.

**Episodes.**
- M "episode objects" x0…x(M−1) are added, M = 25, 50, 100, 200, 400.
- Each has one "the x is in the c", plus one "on" and one "has" sentence that give kind evidence.
- The 800 base sentences are the same for every M.

**What is co-active when an assembly forms.** Each sentence is an event. The co-active units are:
- the assembly cells and column units of every word in it except ".";
- the base's own held-state units from sketch 20c's `step()`: sequence (prev × cur) and subject (subject × cur) conjunctions, at cell and column level. These are presynaptic only.

**Version 1, summed links.**
- Hebbian learning from every co-active unit to every co-active cell: w += 0.2(1 − w).
- Completion holds the cue, projects, and casts one winner per column and 8 columns, with up to 5 castings.
- `NORM=fit` divides each cell's input by its total link weight (sketch 29). `NORM=raw` uses plain sums (sketch 20c).

**Version 2, membership segments.**
- **Growth.** A co-active cell with no segment that is *fully* active grows one segment. Its synapses are sampled from the other co-active units: 16 of them, or all of them (`SEGN=all`). Nothing chooses "true members"; the sample is whatever was co-active.
- **Firing.** A segment fires at ≥ THETA = 0.75 of its synapses active, and its cell fires (OR across segments). Fired cells and their columns join the active set, for up to 5 rounds.
- **Indexing.** Only segments with an active input are counted, through an index from unit to segments.
- **No extras.** Segments have no strengths and are never pruned.
- **`CAST=1` (diagnostic arm).** The same casting as summed links, driven by each cell's best firing segment.

**Probes** (learning off, after the whole stream; scored identically for every version):
- **Episode:** "the x is in the" → its container. 100 x are sampled per seed.
- **Fact:** "the c is in the" → its room. 9 containers; the fact is repeated about 13 times.
- **Kind:** held-out containers → a room (3 per seed); held-out objects → a container (4); seen objects → a container (20).
- **Partial:** x shows only 4 of its 8 cells (its conjunctions use only those); or the bare cue "x in".
- **Split:** the frame with half of x_A's cells, together with the frame with half of x_B's cells, where the two have different answers.

**Scoring.**
- The read-out is the non-cue word with the largest share of its assembly active, if that share is ≥ ½ and strictly the largest.
- A **blend** is another word with ≥ ½ of its *distinctive* cells active (cells not in the answer or the cue).
- **Strict** recall = right answer and no blend.

## Rules fixed beforehand

See `PREREG.txt`. It records the four design changes made while looking at dev seed 1, so they are not hidden:
- **The base's held-state units were added to the event.** A bag of words made "the c is in" 4/5 of both "the c is in the r" and "the o is in the c", so the probes tested role confusion. `CTX=0` keeps that design as a control.
- **The raw-sum baseline was added**, because fit-normalisation failed on dev.
- **The `SEGN=all` and `CAST=1` arms were added**, because 16 sampled synapses blended almost always.
- **Speed changes only** (no effect on results).

Capacity is the largest M before pooled strict episode recall falls below 75% (also given at 50%).

**After the test runs.** `runall.sh` had a bug. `shift 2` dropped the `MS=` argument, so each "a" and "b" run swept all five M values: duplicate work and roughly 2-minute runs. I fixed it to `shift 1` and reran everything. The results are identical (each (M, seed) is independent and deterministic). **No setting was changed after looking at test seeds.**

## Results (seeds 101–105 pooled)

**Strict episode recall, % (blends in brackets)**

| cells per column | M | sum, fit | **sum, raw** | segments 16 | **segments all** | segments 16 + cast | segments all + cast |
|---|---|---|---|---|---|---|---|
| 2 | 25 | 0 | 25 (22) | 0 (100) | **58 (22)** | 32 (3) | 58 (22) |
| 2 | 100 | 0 | 23 (27) | 0 (100) | **73 (8)** | 35 (6) | 73 (8) |
| 2 | 400 | 0 | **0 (71)** | 0 (100) | **68 (18)** | 32 (6) | 68 (18) |
| 4 | 25 | 0 | 71 (11) | 0 (100) | **82 (8)** | 46 (3) | 82 (8) |
| 4 | 100 | 0 | 61 (7) | 2 (98) | **83 (7)** | 30 (1) | 83 (7) |
| 4 | 400 | 0 | **18 (37)** | 0 (100) | **85 (6)** | 27 (1) | 85 (6) |
| 8 | 100 | 0 | 86 (5) | 2 (98) | 91 (0) | 36 (0) | 91 (0) |
| 8 | 400 | 0 | 86 (3) | 0 (100) | 94 (2) | 22 (0) | 94 (2) |
| 16 | 100 | 0 | 96 (4) | 8 (92) | 91 (0) | 30 (1) | 91 (0) |
| 16 | 400 | 0 | 94 (5) | 0 (100) | 92 (5) | 22 (1) | 92 (5) |

Assembly cells shared by more than one word, M = 25 → 400: 57 → 99% at 2 cells per column, 37 → 91% at 4, 19 → 45% at 8, 1 → 10% at 16. At M = 400 there are about 1,650 distinct stored sentences.

**Capacity** (largest M with strict episode recall ≥ 75% / ≥ 50%)

| | 2 cells | 4 cells | 8 cells | 16 cells |
|---|---|---|---|---|
| sum, fit | <25 / <25 | <25 / <25 | <25 / <25 | <25 / <25 |
| sum, raw | <25 / <25 | <25 / 100 | 400 / 400 | 400 / 400 |
| segments 16 (with or without cast) | <25 / <25 | <25 / <25 | <25 / <25 | <25 / <25 |
| **segments all** | <25 / **400** | **400 / 400** | 400 / 400 | 400 / 400 |

At 2 cells per column, segments-all recall varies a lot by seed: 24–76% at M = 25 and 44–93% at M = 400. Summed raw is 0–1% on every seed at M = 400.

**Other measures, M = 400 (M = 100 is similar; see `summary.txt`)**

| | sum raw, 2 cells | **seg all, 2** | sum raw, 8 | **seg all, 8** | sum raw, 16 | **seg all, 16** |
|---|---|---|---|---|---|---|
| fact "c is in" → room | 100 | 89 | 100 | 93 | 100 | 91 |
| new container → room | 13 | **0** | 13 | **0** | 7 | **0** |
| new object → container | 5 | **0** | 0 | **0** | 40 | **0** |
| seen object → container | 23 | 12 | 56 | 17 | 92 | 24 |
| partial: x at 4 of 8 cells, strict | 5 | **0** | 81 | **0** | 86 | **0** |
| bare cue "x in" | 0 | 0 | 0 | 0 | 0 | 0 |
| split: both answers / one / neither | 0 / 2 / 97 | **0 / 0 / 100** | 0 / 62 / 38 | **0 / 0 / 100** | 0 / 94 / 6 | **0 / 0 / 100** |
| new cells per episode probe | 8 | 7.5 | 8 | 7.7 | 8 | 7.7 |

**Cost per probe** (segments checked through the index, out of segments stored; 8 cells per column; 2 cells is the same within 2%)

| M | 25 | 100 | 400 |
|---|---|---|---|
| segments all | 28,156 of 28,811 | 37,781 of 38,578 | 73,094 of 74,825 |
| segments 16 | 21,994 of 25,817 | 30,454 of 35,068 | 61,030 of 69,991 |
| sum raw (link reads) | 84,383 | 145,052 | 330,858 |

- Segments grown per (cell, event): 0.80 at M = 25, rising to 0.93 at M = 400. Nearly every cell grows a new segment on nearly every new sentence.
- A whole-set segment holds every other co-active unit, so the synapse count far exceeds the summed link count, which at M = 400 is about 0.8 M links at 8 cells per column.

**Secondary runs, 8 cells per column, M = 100 / 400**

| | seg all θ 0.75 | θ 0.6 | θ 0.7 | θ 0.8 | seg 16, rare sampling | seg all, bag of words | sum raw, bag of words |
|---|---|---|---|---|---|---|---|
| episode strict | 91 / 94 | 90 / 91 | 92 / 95 | 67 / 68 | 48 / 40 | **0 / 0** | 89 / 46 |
| episode blend | 0 / 2 | 9 / 8 | 0 / 2 | 0 / 1 | 10 / 7 | 94 / 97 | 5 / 15 |
| fact strict | 91 / 93 | 33 / 20 | 96 / 84 | 60 / 82 | 60 / 56 | 0 / 0 | 100 / 100 |
| partial (4 of 8) strict | 0 / 0 | **61 / 64** | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 74 / 65 |
| split: both answers | 0 / 0 | **53 / 62** | 0 / 0 | 0 / 0 | 0 / 0 | 8 / 7 | 0 / 0 |
| segments checked / stored (M = 400) | 98% | 98% | 98% | 98% | **10%** | 98% | – |

## Predictions

| | prediction | result |
|---|---|---|
| P1 | fewer blends at 2 and 4 cells per column (≥ 10 points below sum raw, M ≥ 100) | **Holds at 2 cells per column** (8–23% against 27–71%). At 4 cells per column it holds only at M = 400 (6 against 37). Below that, summed links fail by giving the *wrong* answer, not by blending. |
| P2 | more assemblies in the same cells | **Holds.** At 4 cells per column: 400 against <25 (75% level). At 2: 400 against <25 at the 50% level; neither reaches 75% at 2. At 8–16 cells per column both reach 400 (no difference). |
| P3a | completion from a partial cue (≥ 60%) | **Fails: 0%** at θ = 0.75, against 81–86% for sum raw at 8–16 cells per column. |
| P3b | a split cue completes neither | **Holds** (neither 100%, both 0%). But sum raw doesn't blend either: it picks one answer, or none at small column sizes. |
| P4 | kind transfer kept (≥ 60%) | **Fails: 0%** for new containers and new objects. Summed raw is weak here too (0–60% across sizes and M), well below finding 02. |
| P5 | cheap: the index checks a small share of segments | **Fails.** 98% of stored segments are checked on every probe, and the count grows linearly with stored sentences. |

## What it suggests

- **Whole-set membership segments do remove sharing-driven failure.**
  - At 4 cells per column, with 91% of assembly cells shared, segments keep 85% strict recall at M = 400. Summed links fall to 18%.
  - At 2 cells per column (99% shared), segments keep about 70% with 8–23% blends. Summed links reach 0% with 71% blends.
  - That is the hypothesis' central claim, and it holds in this setting. At 8–16 cells per column, where little is shared, the two versions are equal (about 90–95%).
- **But the AND is all or nothing, and the window is narrow.**
  - At θ = 0.75 the same strictness that rejects "half of A plus half of B" also rejects "half of x": partial cues complete 0% of the time.
  - At θ = 0.6, partial cues work (61–64%), but split cues blend (53–62%) and fact recall drops to 20–33%.
  - At θ = 0.8, recall falls to 67%.
  - With a single threshold, "completes from a part" and "refuses a mixture" are the same knob turned in opposite directions. Summed links with casting sit at a different point on that trade-off: graceful from a part, and they pick one answer rather than blend.
- **Sampling breaks it.**
  - Segments of 16 sampled synapses blend almost every time (92–100%), because a cell has a segment for every sentence it was in. A sentence sharing the frame with the cue reaches 12 of 16 now and then, and OR over dozens of segments makes that near-certain.
  - Casting hides the blend but leaves recall at 22–46%.
  - "Combinatorial capacity from sampled segments" (the Numenta argument) did not appear here. Only segments holding the whole co-active set worked.
- **The AND works only with order and role units in the event.**
  - With a bag of word assemblies (CTX = 0), whole-set segments score 0% and blend 94–97%. The shared frame makes every "in" sentence 3/5 like the cue, and completing one sentence starts completing every other sentence that contains its words.
  - The sequence and subject conjunctions are what make "enough of *this* one" sharp. Membership segments don't replace that machinery; they lean on it.
- **Kind does not transfer through segments.** 0% in every segment arm. A segment that needs 75% of a specific sentence's units can't be satisfied by a word that shares only 2–3 columns with the original. This is P4's "too specific to generalise", as the hypothesis listed under what would count against it.
- **The cost is the opposite of cheap.**
  - Frame words and their conjunction units feed almost every segment, so the index prunes nothing (98% checked).
  - Nearly every cell grows a segment on nearly every new sentence (0.8–0.93 per cell-event). Storage grows with sentences experienced, not with things known.
  - Homeostatic sampling (synapses weighted to rarely-active units) cuts checking to 10%, but recall falls to 40–48%.
- **Fit-normalisation is the wrong reading for multi-member cells.** It scored 0% everywhere: a hub cell, such as a container that sits in dozens of episodes, is never "mostly active" by its own total. That is consistent with the hypothesis' remark that fit-normalisation is a one-assembly-per-cell version of a segment.

## Verdict

Partly supported. Whole-set segments do what the hypothesis says about **sharing**: no collapse at 2–4 cells per column, where summed links collapse. Capacity holds to the largest M tested at 4 cells per column. A split cue completes neither.

Three of the five predictions fail, and they are the ones that matter for using segments as *the* mechanism:
- no completion from half a cue;
- no kind transfer;
- no saving from the index.

As built, a membership segment is close to a stored copy of each co-active set, with an exact-ish match rule. It is excellent at telling stored episodes apart and poor at everything that needs graded overlap.

## Ways it could be fooling us

- **The design was changed on the dev seed.** Adding the held-state units, the raw-sum baseline and whole-set segments were all choices made after seeing seed 1 fail. They are recorded in `PREREG.txt`, but the main segment arm is not the hypothesis' literal "one segment sampled from the other cells". The sampled version (segments 16) failed.
- **"Episode" here is a whole co-active sentence,** not a sequence prediction as in finding 02. So kind-transfer numbers are not comparable with finding 02's 87–100%. The summed baseline is also much weaker here (0–60%). P4 compares two weak numbers.
- **Segments have no strength.** The repeated fact grows one segment, not a stronger one, so recall can't use frequency. Summed links do, which helps them on facts (100% against about 90%).
- **Whole-set segments are expensive** (synapse count well above the link count). Part of their advantage may simply be that they store more. A summed version with the same storage budget, such as per-episode hidden units, was not tried.
- **Strict scoring treats any second word at half its distinctive cells as a blend.** At 2 cells per column, distinctive sets are small, so blends there are noisy. Per-seed recall at 2 cells per column spans 24–93%.
- **Small sets:** 9 facts, 3 held-out containers and 4 held-out objects per seed. Differences of a few points there are noise. The episode numbers rest on 500 probes per cell of the table.
- **Not measured:** the synapse count per segment and the run time per probe, beyond index hits.

## How to run

```
cd sketches/38-membership-segments
./runall.sh                               # all pre-registered runs (~25 min, 2 cores) -> run-*.txt, summary.txt
CPC=4 MODE=seg SEGN=all node sketch.js    # one arm, seeds 101-105, M = 25..400
CPC=4 MODE=sum NORM=raw node sketch.js
SEEDS=1 MS=50,400 CPC=8 MODE=seg SEGN=all node sketch.js   # dev seed smoke run (~10 s)
```
