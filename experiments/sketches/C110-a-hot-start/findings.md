# C110 · A hot start: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (fixed by the population size, about 3 letters), while a loose letter cost 1. So a
> familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its own,
> it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way
> round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. The "barrier at the
> bottom" found in the first run (a pair of letters can never pay, however often it is seen) is a direct result of the
> flat price. Under cost as surprise, a frequent pair is cheap and can pay. Read the results here with that in mind:
> some may not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node hot.js` (under a second; everything is in [out.txt](out.txt)); `node hot.js steps` also lists every
run's lasting pieces. Read [the hypothesis](hypothesis.md) first, including the **addendum**: the first run formed
nothing, and a second run was designed, with predictions, before it was run. No buffers in either: text streams in a
character at a time.

## In short

1. **Cold, nothing can form (first run).** With a population of fixed size, a use costs about 3. A pair of letters
   costs 2 to spell out, so it can never pay, however often it is seen. **Growing from the smallest pieces up has a
   barrier at the bottom**, the same barrier nucleation theory describes. So the original instinct ("tiniest, most
   frequent patterns first") can't happen if every step has to pay its way as lasting structure.
2. **Hot, it crosses the barrier and learns words from a stream, with no buffers (second run).** Tentative pieces met
   again take part in reading and pair up while still tentative. They are judged only when whole, so `_the_` (5
   letters) nucleates at 3 sightings. From the story it learned `river`, `children_`, `miller_`, `walk`, `was_`,
   `had_`, `old_`, `ice_`, `_and_`, `the_`, `_the_river`, `on_the_`, `to_the_`. On the reader, **the zebra sentence
   is read `[_the_zebra][_sat_on_the_mat_]`**, which C106 and C109 never managed.
3. **But it cuts where the hot reading happened to cut.** While hot, reading is chopped greedily by whichever
   tentative piece fits first. Lasting pieces are built from those chopped units, so they inherit the chop points:
   `d_tha` (from "sai|d_t|ha|t"), `an_s`, `cat_an`, `e_th`, `nd_t`, `_the_cat_sa`. On the reader's measured pass 15 of
   47 units cut inside a word. On the story most units read are tentative fragments (`ill`, `ag`, `st`, `oo`).
4. **The story doesn't cool in two passes.** Loose letters fall from 73% to about 25 to 30% and stay there, and the
   pool keeps churning at about 140 dissolved per stretch. The reader cools further (loose letters from 77% to 0 to
   10% for most of the run).

The problem has moved. It is no longer "committing too early". It is **where the tentative cuts fall**: a single
greedy reading while hot decides the cut points, and the price only judges what that reading offered it.

## Against the predictions

First set (for the mechanism as first designed): all moot, since nothing formed. The addendum's predictions:

| | Predicted | Seen |
|---|---|---|
| A1 | short tentative pieces first, not nucleating themselves; first lasting pieces whole words | **Mostly.** The first lasting pieces are `_the_`, `_the_dog`, `cat_`, `the_` (reader) and `_the_`, `the_` (story). Later ones are often fragments. Short pieces mostly stay tentative, but `he_`, `er_`, `ld_` and `_to` nucleate late on the story, after 11 sightings. |
| A2 | hot reading chopped by odd pairs; tentative pieces inside lasting ones stop being met and dissolve | **The first half is right.** The second is unclear on the reader (the pool never filled, so nothing dissolved). On the story the pool churns throughout. |
| A3 | the risk: early tentative cuts lock in odd pieces | **This is what happened.** |
| 3 | zebra sentence not cut through "sat" | **As predicted**, from pool 64 up. |
| 4 | it cools | **Partly.** The reader cools. The story's share of loose letters falls by half, then stalls, and its churn doesn't fall. |
| 5 | pool: a cliff at 16, flat from 64 | **The reader matches this**: a cliff at 16, nearly flat from 64, identical from 256. **The story doesn't**: 64, 256 and 1024 differ (5 to 65 lasting pieces). The population N matters little except where it fills (64 on the story). |
| 6 | story harder, common words and endings form | **As predicted**: common words form, and so do `ing`, `ed_`, `er_`. |

## Against the success and failure criteria

**Mixed, leaning to failure.** For success: no buffers, the zebra sentence read right, the reader cools, words learnt
from a plain stream. Failing: far more than 3 units cut inside a word on the reader's measured pass, and fragments
lock in as lasting pieces.

## What this says

1. **Nucleation is the right picture, and the barrier is real.** Structure can't grow up from the bottom one paid
   step at a time. It has to pass through a tentative stage that doesn't pay yet. This matches the physics (small
   clusters exist, grow and mostly dissolve) and the biology (overproduce, then select).
2. **Tentative pieces carry evidence across time, so buffers aren't needed for that.** C109's need, a rival building
   up evidence before it forms, is met by the pool.
3. **A hot reading that commits to one cut is still too cold.** Hot, many readings should be live at once: every
   tentative piece that fits should be met, overlapping, not just the one that fits first. The price would then
   judge rival cuts, not just whichever cut the reader made. This sounds like the owner's own observation from an
   earlier experiment: heat lowered a population's sparsity threshold and gave a "flash" of denser activity, so more
   assemblies lit up and found the missing context. So: hot means dense and overlapping; cool means sparse and single.
   Not tried here.
4. The story may simply need more text. Two passes of 1,571 characters is little.

## Givens to keep in mind

- Reading takes the longest lasting or tentative piece that fits (seen at least twice): one reading, greedy. That is
  the main limit found.
- Tentative pieces dissolve only when the pool is full, the least seen first.
- The pool counts sightings: counting from the structure, one count per tentative piece. No count is pooled or
  averaged, and nothing decays.
- "Cuts inside a word" counts every unit read, tentative ones included.
- Small texts written for the sketch, streamed more than once.
