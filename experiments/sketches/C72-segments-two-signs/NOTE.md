# Sketch 39: segments with two signs (rough)

`./runall.sh` runs every pre-registered setting, about 8 minutes in all; no single run takes more than about 45 s.

- **Main script:** `node sketch.js`, with flags `MODE=exc|word|nand|andnot|nandug`, `STOP=0|1`, `WORLD=a|b`, `NEV`, `SEEDS`, and `DIAG=1` (prints who wins on each individual exception; reporting only).
- **Seeds and outputs:** the default seeds are the test seeds, 101–110. The outputs are the `run-<world>-<mode>-stop<0|1>.txt` files, plus two long runs `run-b-*-stop1-long.txt`.
- **Pre-registration:** `PREREG.txt`, written after smoke runs on development seeds 1–3 and before any test run.
- **Reference code:** sketch 36 is copied here unchanged as `sketch36-ref.js`. Earlier folders are untouched.

## Question

[Hypothesis 07](hypothesis.md): is there **one kind of segment with two signs**, grown by one rule from the two signs of heat?

- A cell that **should have fired and wasn't cast** grows an excitatory segment (sketch 36).
- A cell that **was cast and didn't happen** grows an inhibitory segment. This is the automaton's own failed prediction, never the correct answer.

If so, does it learn exceptions that only a *combination* identifies, without suppressing shared words elsewhere, without a balance rule, and does growth settle?

## Set-up

### Worlds

Sketch 36's worlds a and b (outcome set by animal × context through a Latin square, colour irrelevant, "door open" and in b "light on" decide alone, 3 held-out combinations per animal). "hiding" is added to world a's outcomes. Five exceptions per world, of four kinds:

| kind | world a | world b | what identifies it |
|---|---|---|---|
| **ind** (individual, from the start) | "ginger cat" + "bowl full" → "hiding"; "white dog" + "door shut" → "eating" | "ginger cat" + "bowl full" → "hiding"; "white dog" + "light off" → "calling" | colour × animal × context |
| **ctx** (every animal) | "black" + "bowl empty" → "leaving" | same | colour × context; no single word |
| **end** (stops at the switch) | "brown bird" + "bowl full" → "hiding", then the rule ("calling") | → "eating", then "calling" | colour × animal × context |
| **late** (starts at the switch) | "grey dog" + "bowl empty" → "hiding" | "grey goat" + "door shut" → "hiding" | colour × animal × context, against a hard rule |

- The ctx exception's last animal never appears with it, to probe whether it transfers.
- **Found on the dev seed: sketch 36's second world-b exception was not an exception.** "white dog" + "light off" → "eating" is exactly the dog × light-off rule. So sketch 36's "exceptions 0.65" was one real exception (about 0.3) and one free point (about 1.0). Here it is "calling", and the code refuses any exception that equals the rule.
- 9000 events per seed, 12 blocks of 750; the switch is at 4500.

### Substrate

Sketch 36 unchanged: 120 columns × 8 cells, 6 columns per token (3 own, 3 learnt), active units = the input tokens' cells plus their column units (about 41), plain links with residual-heat learning, casting (one winner per column, 6 overall), two settling rounds, read-out by the assembly holding most winners.

### The mechanism: one segment type, two signs

- **Fire:** a segment fires when at least 75% of its 8 synapses are active, and adds (excitatory) or subtracts (inhibitory) 2 · s · (fraction active).
- **Keep:** a firing segment that fits strengthens, s += 0.2(1 − s); one that misfits halves; below 0.1 it goes. Excitatory fits when its cell happened, inhibitory when its cell didn't. Same code, same constants.
- **Grow:** 8 units sampled uniformly from everything active.
  - Excitatory: on an outcome cell that happened and wasn't cast, with no excitatory segment firing for it (sketch 36).
  - Inhibitory: on a cell the automaton **cast** that didn't happen, with no inhibitory segment firing for it.

### Compared (fixed beforehand)

- **exc:** excitatory segments only (sketch 36).
- **word:** excitatory segments + sketch 37's single-word rule. Every active unit grows an inhibitory link onto a wrongly cast cell (w += 0.1(1 − w)); for a cell that happened and wasn't cast, links from active units shrink by 0.1. One token's full links subtract as much as one full segment.
- **nand:** inhibitory segments on the whole cell: "not when these are together".
- **andnot:** an inhibitory sub-segment on one excitatory segment: "for this reason, unless …". It subtracts from that segment's output only, floored at 0. A segment brought to 0 hasn't fired, so it is neither credited nor blamed. Sub-segments grow on every excitatory segment that drove a wrongly cast cell and had no sub-segment fire; a wrong cell cast by plain links alone gets nothing. Sub-segments die with their segment.
- **nandug (control):** nand with inhibitory segments grown on *every* outcome cell that didn't happen: learnt from the answer.

### The growth stop signal (STOP=1), fixed beforehand

Each cell keeps a temperature: whenever it is cast or happens, T ← 0.9 T + 0.1 · misfit (misfit 1 if it happened uncast or was cast and didn't happen; T starts at 1). A cell that qualifies for growth grows a segment of either sign only with probability T. So a cell that mostly fits rarely grows. STOP=0 is sketch 36's rule. Every mode runs with both.

## Rules fixed beforehand

See `PREREG.txt`. Stated plainly:
- The brief asked for one dev seed. I used seed 1 for smoke runs, and seeds 1–3 for one look at each mode and a diagnostic print. No constant was tuned; all are sketch 36's or sketch 37's.
- Before pre-registration I raised NEV from 6000 to 9000 and added last-quarter prequential accuracy, because the final probe of 2 individual exceptions per seed is a single yes/no each and too noisy.
- **Nothing was changed after the test runs.** One post hoc diagnostic is marked below.

## Results (seeds 101–110; "a / b" = the two worlds; pooled = their mean)

### Main comparison, STOP=0

"Last quarter" is prequential accuracy over events 6750–9000 (predict, then learn). The others are final probes with learning off.

| | **exc** (36) | **word** (37's rule) | **nand** | **andnot** | nandug (ungated) |
|---|---|---|---|---|---|
| **ind exceptions, last quarter** | .51 / .29 | .62 / .37 | **.84 / .60** | **.84 / .62** | .79 / .63 |
| ind exceptions, final probe | .50 / .40 | .60 / .30 | .75 / .80 | .90 / .60 | .80 / .65 |
| ctx exceptions, last quarter | .94 / .88 | .96 / .92 | .96 / .89 | .98 / .93 | .99 / .94 |
| late exceptions, last quarter | .44 / .28 | .53 / .36 | .46 / .73 | .72 / .56 | .49 / .58 |
| ended exception: occurrences until right | 1.4 / 1.8 | 1.4 / 2.3 | 2.1 / 1.8 | 1.9 / 1.9 | 2.4 / 1.9 |
| ended exception follows the rule (final) | 1.0 / .9 | 1.0 / 1.0 | 1.0 / .9 | 1.0 / 1.0 | 1.0 / 1.0 |
| ctx on its never-seen animal | .3 / .6 | .5 / .6 | .2 / .4 | .6 / .3 | .2 / .6 |
| **rule, last quarter** | .88 / .86 | .84 / .82 | **.97 / .94** | **.97 / .93** | .98 / .94 |
| rule, seen combinations (final) | .91 / .86 | .88 / .83 | .97 / .94 | .96 / .96 | .98 / .95 |
| rule, held-out combinations | .57 / .76 | .50 / .71 | .68 / .65 | **.70 / .82** | .59 / .57 |
| one input decides | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |

### Collateral: rule combinations sharing two of (colour, animal, context) with an exception

| STOP=0 | exc | word | nand | andnot | nandug |
|---|---|---|---|---|---|
| sharing colour + animal (e.g. "ginger cat" + "door shut") | .93 / .93 | .91 / .86 | .96 / .96 | .96 / .97 | .98 / .96 |
| sharing colour + context (e.g. "ginger dog" + "bowl full") | .99 / .91 | .93 / .86 | .97 / .93 | 1.00 / 1.00 | 1.00 / .98 |
| sharing animal + context (e.g. "grey cat" + "bowl full") | .86 / .75 | .85 / .73 | .95 / .89 | .94 / .93 | .97 / .90 |
| far from every exception | 1.00 / .90 | **.85** / .89 | 1.00 / .97 | 1.00 / .97 | 1.00 / .97 |
| ind/late exception with colour dropped → kind rule | .43 / .63 | .57 / .73 | .70 / .90 | .60 / .87 | .70 / .87 |

### Populations and cost, STOP=0

| | exc | word | nand | andnot | nandug |
|---|---|---|---|---|---|
| excitatory alive at end | 68 / 107 | 73 / 120 | 49 / 86 | 78 / 126 | 46 / 80 |
| inhibitory alive at end (segments / sub-segments / word links) | 0 | 4804 / 5555 links | 323 / 520 | 45 / 66 | 446 / 668 |
| … of which grown on ind / ctx / late events | – | – | 39+21+21 / 23+20+13 | 7+4+4 / 7+5+3 | 28+22+12 / 18+28+7 |
| … grown on rule events | – | – | 207 / 407 | 27 / 46 | 274 / 422 |
| excitatory grown in total | 4978 / 4557 | 4947 / 4662 | 3066 / 3466 | 2455 / 2935 | 2700 / 3445 |
| inhibitory grown in total | 0 | 117k / 112k links | 1048 / 1333 | 1370 / 1693 | 1207 / 1627 |
| **segment synapse checks per event** | 583 / 879 | 628 / 974 (+1489 / 1396 word-link reads) | **2854 / 4656** | **734 / 1136** | 3874 / 5952 |
| plain-link reads per event | about 1430 / 1390 in every mode |

### Growth over time by sign (blocks of 750; world b; world a is similar)

| world b | | blocks 1 … 12 |
|---|---|---|
| exc, STOP 0 | excitatory grown | 718 469 396 369 357 311 371 331 314 311 309 301 |
| nand, STOP 0 | excitatory grown | 723 421 350 293 264 221 257 217 208 183 171 158 |
| | inhibitory grown | 537 164 116 87 68 52 69 57 53 49 44 38 |
| | inhibitory alive | 392 455 483 497 504 505 516 521 521 523 522 520 |
| nand, STOP 1 | excitatory grown | 554 262 180 153 108 97 100 73 77 70 72 54 |
| | inhibitory grown | 425 137 92 75 55 46 51 42 38 34 38 29 |
| andnot, STOP 0 | excitatory grown | 654 326 265 233 204 182 221 177 187 168 169 147 |
| | inhibitory grown | 463 226 164 138 106 89 117 86 87 78 77 64 |
| | inhibitory alive | 90 87 84 81 75 74 75 71 70 67 68 66 |
| andnot, STOP 1 | excitatory grown | 514 250 211 171 128 123 149 139 133 124 131 106 |
| | inhibitory grown | 253 112 75 56 31 32 39 35 34 30 32 24 |
| word, STOP 0 | inhibitory links created | 24439 11719 9626 8925 8144 7361 7185 7044 6838 6747 7291 6352 |
| **nand, STOP 1, 18 000 events** (blocks of 1500) | excitatory grown | 816 333 206 159 136 132 134 120 92 92 86 75 |
| | inhibitory grown | 562 167 100 77 60 62 69 64 46 50 45 42 |

### The stop signal (STOP=1 against STOP=0)

| last quarter: ind / rule (a / b) | exc | word | nand | andnot |
|---|---|---|---|---|
| STOP 0 | .51 .88 / .29 .86 | .62 .84 / .37 .82 | .84 .97 / .60 .94 | .84 .97 / .62 .93 |
| STOP 1 | .55 .83 / .31 .81 | .57 .80 / .36 .77 | .76 .96 / .68 .92 | .73 .89 / .45 .85 |
| held-out, STOP 0 → 1 | .57→.60 / .76→.66 | .50→.44 / .71→.68 | .68→.43 / .65→.53 | .70→.62 / .82→.65 |
| segments grown, both signs, STOP 0 → 1 | 4978→3500 / 4557→2776 | – | 4114→2730 / 4799→2862 | 3825→3011 / 4628→2931 |

Long runs (world b, STOP 1, 18 000 events) do not improve exceptions: ind last quarter nand .73, andnot .45; rule .94 / .89.

### Why individual exceptions still fail (post hoc diagnostic, `DIAG=1`, world b, STOP 0)

Looked at after the test runs; nothing was changed. Of the 20 final ind probes:
- **nand** fails 4: in 2 the kind rule still wins; in 2 the kind rule is suppressed (0–1 cells) but nothing drives the exception outcome (no winner, or a third outcome). Inhibitory segments fire on the kind-rule cells in all 20.
- **andnot** fails 7: in 4 the kind rule still wins (a drive from plain links or from a segment with no sub-segment can't be vetoed); in 3 it is suppressed but the exception outcome doesn't win.

So the inhibitory side mostly does its job in nand. The gap is on the excitatory side: the exception's own segments are weak or absent.

## Predictions (PREREG.txt)

| | prediction | outcome |
|---|---|---|
| P1 | nand / andnot reach ind ≥ 0.9 and ctx ≥ 0.9; beat exc and word on ind by ≥ 0.2; rule no worse than exc − 0.03 | **partly.** ind .72 / .73 pooled: **fails the 0.9 bar** (exc here .40). Beats exc by .32 / .33 and word by .22 / .23: **held.** ctx .93 / .96: held, but exc already gets .91, so ctx doesn't separate the modes. Rule **improves** (.96 vs .87). |
| P2 | no collateral: neighbours ≥ exc − .03 and ≥ word; far unchanged | **held** in all three neighbour kinds, both worlds. Word's collateral shows as expected (far .85 in a, neighbours .73–.86). |
| P3 | one rule, shared settings | **held** at the shared constants (P1-relative and P2 hold with nothing tuned). |
| P4 | inhibitory population levels off without a balance rule (< 10% change over the last 4 blocks); nandug ≥ 1.5× nand's and worse on held-out | levels off: **held** (nand 520 → 520, andnot 70 → 66). nandug count: **failed** (1.3–1.4×). Worse held-out: **held** (.58 vs .67). |
| P5 | STOP=1: last block < 25% of first for both signs and below STOP=0; ind and rule within .05 of STOP=0 | growth falls: **held** (last/first 10–21%, and 30–40% less in total). Accuracy: **failed** for andnot (ind −.11 / −.17, rule −.08 in b) and mixed for nand (ind −.08 in a, +.08 in b). Held-out fell by .1–.25 for nand / andnot. Growth never reaches zero (0.05 excitatory, 0.03 inhibitory per event at 18 000). |
| U | ended exception right again in ≤ 5 occurrences; final ≥ .9 | **held** (about 2 occurrences), but exc alone also does it in 1.4–1.8: unlearning is not what inhibition adds. |
| L | nand late exceptions ≥ .8 | **failed** (.46 / .73); andnot .72 / .56. |
| T | held-out within .1 of exc | nand **held in a** (.68 vs .57), **failed in b by a hair** (.65 vs .76); andnot held (.70 / .82). |
| C | nand ≥ 3× exc's synapse checks; andnot ≤ 1.5× | **held** (nand 4.9× / 5.3×; andnot 1.26× / 1.29×). |

Against-criteria from the hypothesis: inhibitory segments **do** beat word inhibition on ind; they **don't** hurt the rule or neighbours; growth **does** settle in rate but never stops.

## What it suggests

- **One rule with two signs works, and it is the first thing in these sketches that holds a conjunctive exception against a general rule** without harming the rule. The real individual exception went from about .3–.5 (exc) to about .6–.85, at the same constants as the excitatory side.
- **Inhibition helps the general rule too.** Rule accuracy rose from .87 to .96, and the "animal + context" neighbours (e.g. "grey cat" + "bowl full") from .80 to .92–.94. Most inhibitory segments grow on ordinary rule events (207–407 of 323–520 alive in nand). They prune the soft ANDs that fire on the neighbouring combination, which sketch 36 found was where errors came from ("softness and specificity are the same knob"). A second sign gives that knob a second hand.
- **Single-word inhibition is the wrong shape here, as sketch 37 found.** It is a little better than nothing on exceptions (.50 vs .40), costs 100 000+ link creations, and is the only mode that damages combinations far from any exception (.85 in a).
- **NAND and AND NOT differ in cost more than in accuracy.** AND NOT keeps about 50 sub-segments and costs only about 30% more than excitatory-only, because sub-segments are checked only when their segment matches. NAND keeps 300–500 inhibitory segments, mostly "right" for free on cells that were never driven, and costs about 5× in synapse checks. AND NOT also transfers best (held-out .70 / .82). But AND NOT can't veto a drive that doesn't come through a segment, and it is more fragile when growth is throttled.
- **The own-prediction gate matters much less for segments than for word links.** The ungated control is about as good as nand on exceptions and the rule, and only somewhat worse on held-out (.58 vs .67). Segment selection (halve on misfit) already removes inhibitory segments that fire where their cell happens. In sketch 37 the gate was what kept word inhibition safe; here selection does most of that work. The gate still buys fewer segments and better transfer.
- **The temperature stop signal slows growth by a third and doesn't stop it, and it costs accuracy.** Exceptions are rare events on cells that mostly fit, so a cold cell is exactly the cell that has to learn the exception. "Grow only when you're hot" by cell temperature makes cells deaf to the rare case. A stop signal probably needs to be local to the *context* (a segment that fired and fit), not to the cell.
- **The remaining gap is on the excitatory side.** Once the kind rule is suppressed, the exception outcome often has no strong segment of its own. That is sketch 36's selection problem (a segment must happen to sample the colour), not an inhibition problem.

## Ways it could be fooling us

- **Few exceptions per seed.** 2 ind, 1 ctx (×3–4 animals), 1 end, 1 late. Final ind probes are 20 yes/no answers per world; the last-quarter numbers (about 35–40 events per exception) are steadier, but differences of .1 are within seed spread.
- **ctx is too easy.** "black" + "bowl empty" → "leaving" is learnt by excitatory segments alone (.91), because "leaving" is never a combination outcome, so nothing competes for its cells. It doesn't test what it was meant to test. A ctx exception whose outcome is another combination's outcome would.
- **The "late" exceptions get about 37 occurrences**, and prequential accuracy is still rising at the end in b; .8 may simply need more events. The long run didn't help ind, though.
- **Inhibitory segments are judged whenever they fire, even on cells that weren't driven.** That is the symmetric rule, but it lets NAND segments earn strength for doing nothing. That is why NAND keeps hundreds and costs 5×. A rule that judges inhibition only when the cell had excitatory drive would be cheaper; it was not tested.
- **The AND NOT attachment rule (every firing segment on a wrong cell) is one choice.** "Only the strongest" or "only the segment that decided" are others.
- **The world changed from sketch 36's** ("hiding" added to a, 5 exceptions, 9000 events), so exc's held-out (.57 / .76) is not comparable with sketch 36's .84 / .71. All comparisons are within this sketch.
- **The stop signal has one form and one rate (0.1).** A slower temperature, or a per-segment version, might behave differently. I fixed it in advance and didn't sweep it.
- **Read-out is a symbolic step for scoring only**, as before.
- **The dev seeds were 1–3, not one**, and the dev-seed print was used to understand the mechanism before pre-registration.

## How to run

```
./runall.sh                                   # every pre-registered run, about 8 min
WORLD=a|b MODE=exc|word|nand|andnot STOP=0|1 node sketch.js   -> run-<w>-<mode>-stop<s>.txt
WORLD=a|b MODE=nandug node sketch.js          # ungated control
WORLD=b MODE=nand|andnot STOP=1 NEV=18000 node sketch.js       # long runs
DIAG=1 WORLD=b MODE=nand node sketch.js       # who wins on each exception (post hoc diagnostic)
SEEDS=1 ...                                   # development seed
```
