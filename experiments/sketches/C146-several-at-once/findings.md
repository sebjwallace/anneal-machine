# C146 · Several at once: findings

Run: `node lanes.js > out.txt` (about seven minutes; [out.txt](out.txt) has the table). Read [the hypothesis](hypothesis.md)
first. Engine: C145's copy, plus a switch to count company from states only (the declared variant), and a speed cache
for rivalry between assemblies that doesn't change behaviour.

## In short

**Several copies of the facts can be live at once, each fed by its own hypothesis and judged by the engine, without
blurring, but only if company is counted from what things are, not from how they are routed.** With lanes, and
company counted only in the facts, every judgement matched the truth: 100% at 2, 4 and 8 lanes at once. Every
hypothesis that fitted was kept, every one that didn't was dropped, and the true hypothesis was kept in every trial it
was given.

**With one shared set of slots, as feared, nothing works.** No hypothesis was ever judged to fit, not even the true
one. With several hypotheses' digits in the same slots, the facts tie and nothing completes.

**With lanes but C145's rule as it was (company from everything), the lanes are no better than one shared set.** The
results are identical to the shared arm, number for number. Because every lane is fed from the same content cells, "7"
in one lane and "7" in another count as sharing company, so they become rivals, and the lanes compete with each other
before anything is judged. **C145's rule needs refining:** company should come from the facts (what things are), not
from the routing gates (how they arrive).

**Every prediction held**, after one correction to how the result was read (below).

## Results

| lanes at once | one shared set of slots | lanes, company from everything | **lanes, company from states only** |
|---|---|---|---|
| 2 | 66.2% | 66.2% | **100%** |
| 4 | 77.1% | 77.1% | **100%** |
| 8 | 81.5% | 81.5% | **100%** |

Each figure is the share of hypotheses whose judgement matched the truth (600, 1,200 and 2,400 hypotheses). In the
first two arms, every judgement was "doesn't fit": no hypothesis that fitted was kept (0 of 203, 275 and 444), the true
hypothesis was never kept (0 of 146, 150 and 172), and the percentages are just the share of hypotheses that didn't fit.
In the third arm: all 203, 275 and 444 that fitted were kept, all that didn't were dropped, and the true hypothesis was
kept 146, 150 and 172 times out of 146, 150 and 172.

## What it shows

### 1. Copies of the facts stand side by side

The owner's picture of a settled thing in the deep expanding at the surface into several copies, so several bindings
can stand at once, works here exactly. Eight hypotheses at once, each in its own lane, each routing different cells
into its own copy of the fact slots by the engine's gates, each judged by its own copy's competition. No lane affected
any other. This is what rule B needed: rival hypotheses open together, without blurring.

### 2. Company must come from what things are

C145's rule makes two things rivals if they have never been together but share company. Counting company from every
assembly, the routing gates count too. Every lane's "7" is fed from the same "place p holds 7", so they share that
company, become rivals across lanes, and the lanes compete as if they were one space. Counting company from the facts
only, a lane's digits share company only with that lane, so rivalry stays inside a lane, where it belongs. The honest
reading is that **how something arrives shouldn't make it a rival of something else**. Rivalry should come from what
things are (here, which fact they belong to), which is also closer to the owner's attraction and repulsion: things
drawn together by what they are, competing where only one can stand.

### 3. Corrections and changes after the first run

- **A reading mistake.** The first run showed the third arm keeping many wrong hypotheses. The trace showed why: when
  all activity died out, the experiment read the last recorded moment instead of "nothing on", so a wrong digit that
  was dropped looked kept. With that fixed (dying activity reads as nothing on), the third arm is 100%. Nothing in the
  engine changed.
- **The timing.** Thinking the timing was at fault, I also tried the written digit arriving one moment later (so the
  fact has completed before it arrives, as in C145). Both timings give identical results once the reading is fixed,
  so the hypothesis's timing stands. The mechanism differs, though. With the planned timing, the trace of one case shows
  a wrong written digit, routed in the same moment the fact tries to complete, beating the fact (it has more support at
  that moment). Then it dies away, because nothing holds it. With the later timing, the fact completes first and the
  wrong digit loses to it. The judgement is the same either way.
- **Fewer trials.** The hypothesis planned 1,000 trials per setting. With the second timing added, the run took too
  long, so it was cut to 300 per setting. The hypothesis file still says 1,000, as it was written.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | shared slots: well under 90% at 4 and 8 | **Holds:** 77.1% and 81.5%, and no fitting hypothesis ever kept. |
| 2 | lanes, company from everything: interfere, under 95% at 4 and 8 | **Holds**, more strongly than predicted: identical to the shared arm. |
| 3 | lanes, company from states only: 100% at every K | **Holds**, after the reading correction. |

## The ledger, after the run

**Given:** the lanes (copies of the facts, formed beforehand); the content cells; switching on each hypothesis's
selectors in its lane; the order of the protocol; reading the result (a held state counts as held, dying activity as
nothing on); counting company from states only (the variant). **The engine:** routing the digits into each lane's
slots through gates; completing the facts; competition with rivals from place; judging.

## What it suggests next

1. **Rule B, now unblocked.** Rival hypotheses in lanes, all judged at once, with the bar lowered around the heat, and
   competition between lanes picking the one that leaves no heat. The remaining question is what decides which
   hypotheses get a lane, which is where the lowering bar comes in.
2. **The refined rule as the default.** Company from what things are (states), not from routing. Worth checking it
   leaves C145's results unchanged.
3. **Copies on demand.** Here the lanes were formed beforehand. In the owner's picture they are the deep expanding at
   the surface when needed. How many lanes, and when they form, is open.
