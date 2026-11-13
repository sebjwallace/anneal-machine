# C30 · When to remember a picture: findings

*Engine copy: `sketches/C30-memory-threshold/see.js` (copied from `src/engine/see.js`, only the remembering rule made
switchable). Runner: `sketches/C30-memory-threshold/run.js`. Hypothesis: `sketches/C30-memory-threshold/hypothesis.md`.*

## The rules tried
- **A number T** (today 0.9): remember the whole picture if more than 1 − T of it is unexplained or wrong. 0 = never
  remember awake; 1 = remember anything that is not perfectly explained.
- **"Cheaper now"**: remember only if storing the picture (its pixels + one placement) costs less than explaining it with
  what is known.
- **"Energy falls"**: remember only if total energy (structure + the whole flow since the last rest, this picture
  included) is lower with the picture stored than with it left in the flow. This is the rest test, applied awake.
- **"Compare at rest"**: never remember awake. At rest, for every two flow pictures, what they share (at the shift where
  they share most) is offered as a new part and kept only if energy falls.

## Results

**World (a): 12×12 scene world** (`src/test/see.js` setup: 600 scenes, seed 4242, rest every 98; scored on 300 fresh
scenes). "Energy at end" is structure after the last rest. "Cost" is the test's yardstick (dictionary + explaining 300
fresh scenes).

| rule | units | snapshots | energy at end | cost | heat | shapes found | time |
|---|---|---|---|---|---|---|---|
| 0 (never) | 0 | 0 | 0 | 4,411 | 1.000 | 0/11 | 0 s |
| cheaper now | 0 | 0 | 0 | 4,411 | 1.000 | 0/11 | 0 s |
| 0.5 | 13 | 22 | 112 | 1,180 | 0 | 11/11 | 10 s |
| 0.7 | 13 | 35 | 181 | 1,195 | 0 | 11/11 | 25 s |
| 0.8 | 12 | 44 | 206 | **1,172** | 0 | 11/11 | 42 s |
| **0.9 (today)** | 13 | 51 | 249 | 1,191 | 0 | 11/11 | 46 s |
| 0.95 / 0.99 / 1 | 12 | 53 | 254 | 1,179 | 0 | 11/11 | 28–32 s |
| energy falls | 10 | **8** | **46** | 1,436 | 0 | 8/11 | **4 s** |
| compare at rest | 8 | 0 | 26 | 1,618 | 0.011 | 6/11 | 79 s |
| *energy falls, 580 scenes* | 12 | 8 | 59 | **1,172** | 0 | 11/11 | 4 s |
| *compare at rest, 580 scenes* | 11 | 0 | 46 | 1,161 | 0 | 11/11 | 75 s |

0.9 reproduces the main-line baseline (13 units, 1,191, heat 0).

**World (b): C29 16×16 moving objects** (100 episodes = 600 pictures, seed 1, rest every 98). Next picture is scored as
exact % / overlap %, using C29's rules/predict code. Heat is measured on fresh pictures, never-seen variants included, so
it is never 0.

| rule | units | snapshots | energy at end | cost | heat | seen: exact/overlap | never-seen | time |
|---|---|---|---|---|---|---|---|---|
| 0 / cheaper now | 0 | 0 | 0 | 6,006 | 1.000 | – | – | 0 s |
| 0.5 / 0.7 | 9 | 3 | 46 | 1,510 | 0.104 | 27 / 90 | 0 / 86 | 8 s |
| 0.8 | 10 | 7 | 64 | 1,657 | 0.098 | 23 / 87 | 0 / 79 | 4 s |
| **0.9 (today)** | 13 | 11 | 85 | 1,364 | **0.067** | 47 / 92 | 0 / 72 | 7–17 s |
| 0.95 / 0.99 / 1 | 14 | 12 | 88 | **1,297** | 0.073 | **67 / 96** | 0 / 72 | 7–10 s |
| energy falls | 13 | 12 | 87 | 1,445 | 0.088 | 53 / 92 | 0 / **87** | 10–22 s |
| compare at rest | 8 | 0 | 34 | 2,075 | 0.237 | 17 / 63 | 0 / 81 | 28 s |

0.9 reproduces C29's plain-engine row (47/92, 0/72).

**The same runs without the last, short rest.** Learning stops 12 pictures after a rest, so the final rest sees a flow
of only 12 pictures. Here are the same runs scored without that final rest (`FINAL=0`), and runs that end near a rest
(97 episodes):

| rule | units before → after the final rest | seen, no final rest | never-seen | seen, 97 episodes |
|---|---|---|---|---|
| 0.9 | 17 → 13 | **90 / 99** | 0 / 87 | 90 / 99 |
| 1 | 17 → 14 | **100 / 100** | 0 / 87 | 100 / 100 |
| energy falls | 15 → 13 | 87 / 98 | 0 / 87 | 87 / 98 |
| compare at rest | – | – | – | 73 / 98 |

**With noise** (world a, 2% of pixels flipped during training):

| rule | snapshots in the first 97 scenes | result |
|---|---|---|
| 0.9 | 97 | the first rest did not finish within 7.5 minutes |
| 1 | 97 | the first rest did not finish within 7.5 minutes |
| energy falls | 8 | 9 snapshots over 300 scenes, 5 s, but only 3/11 shapes found, heat 0.14 |

## What it shows
1. **Rest cannot start from nothing.** With T = 0, no units are ever made. Every rest move rearranges parts that already
   exist. The only way structure is born is a snapshot, or a new move like "compare at rest".
2. **"Cheaper now" is the same as never remembering.** On its own, a picture can always be explained more cheaply by
   leaving its pixels loose than by storing it (pixels + a placement). A memory pays only because something comes back,
   and a one-picture comparison cannot see that. So this rule learns nothing.
3. **The fixed number matters little anywhere between 0.8 and 1.** On world (a), every value from 0.5 to 1 finds all 11
   shapes, with a cost between 1,172 and 1,195 (within noise). On world (b), values at 0.8 and below remember too little
   (3–7 snapshots) and predict worse. 0.95, 0.99 and 1 behave identically, because in clean worlds a picture is either
   explained perfectly or has more than 5% wrong. **1 ("remember anything not perfectly explained") is at least as good
   as 0.9 on both worlds, and it has no number.**
4. **"Energy falls" works and needs no number.** It makes 6× fewer snapshots (8 instead of 51) and runs about 10× faster
   on world (a). When the run ends near a rest, it reaches the best cost (1,172). It is the only rule that keeps the
   snapshot count down under noise (8 instead of 97). Its weak points:
   - Few memories anchor its structure, so more of what it learns is held only by the current flow. The last rest on a
     thin flow then throws more of it away (world a at 600 scenes: 10 units, 8/11 shapes, cost 1,436).
   - It sees only recurrence *within the current flow window*. Rest every 98 pictures, an existing choice, now also
     decides what counts as "seen again".
   - Under noise it does not blow up, but it learns little (3/11 shapes).
   No hidden number is used beyond that window and the existing greedy compute limit.
5. **"Compare at rest" can learn shapes with no snapshots at all** (11/11 on world a at 580 scenes). But with no memories,
   nothing outlasts the flow: anything not in the latest window is forgotten. Rests are also slower, and it is worst on
   world (b).
6. **Side finding, bigger than the threshold itself:** the final rest on a short flow (12 pictures) removes structure for
   *every* rule. On C29, the plain engine goes from 90/99 to 47/92 because of it, and the C29 "plain engine" row
   understates the engine. Structure that only the flow supports is judged on whatever happens to be in the flow at that
   moment. This is the "forgetting" question in decision 003's open note.

## Recommendation
**Replace 0.9 with the energy rule** ("remember a picture only if total energy falls with it stored"). This is the engine's
own rest test, so it adds no number. It costs one extra energy measurement per picture, but it is still much faster
overall.

**Caveat:** it only beats 0.9 once the thin-flow forgetting (finding 6) is dealt with, because it leans on the flow more.
Until then, the safe drop-in is **1** ("remember anything not perfectly explained"). It has no number and is as good as or
better than 0.9 on both worlds, but like 0.9 it snapshots every noisy picture.

## Choices that would need declaring (decision 003; not edited here)
- If the energy rule is adopted: 003's "What" becomes "stored when that lowers total energy (structure + flow)". The 90%
  goes away. A new dependency should be noted: the flow window (the rest rhythm) now also decides what counts as recurring.
- If 1 is adopted: "stored whenever not perfectly explained". No number remains, but the known weakness under noise (C14)
  stays.
- In either case, a new open item: a rest on a short flow forgets structure that only the flow supported (finding 6). It
  should be decided whether rest may run on a thin flow, or whether evidence should outlast a rest.
