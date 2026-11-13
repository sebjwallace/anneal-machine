# C33 · Scaling check (bigger pictures, busier scenes): findings so far

The engine as it is, on the scene world's shapes placed at random (`sketches/C33-scale/run.js`). 200 pictures, rest every 98.

| Size | Objects per scene | Pixels | Seeing (ms per picture) | Rest total | Things learnt | Memories |
|---|---|---|---|---|---|---|
| 12 | 2 | 11 | 25 | 7 s | 11 | 17 |
| 24 | 2 | 11 | 26 | 6 s | 14 | 10 |
| 32 | 2 | 11 | 26 | 8 s | 16 | 9 |
| 32 | 6 | 35 | 29 | 9 s | 9 | 1 |
| 32 | 10 | 59 | 40 | 0 s | **0** | **0** |

## What it shows
1. **Picture size alone costs almost nothing.** Seeing and rest take about the same time at 12, 24 and 32.
2. **Busy scenes stop learning.** With "remember a picture only if the bill falls" (C30), a busy picture is never remembered. Stored whole, it only pays later, once rest has broken it into shared pieces, and a one-step check can't see that. At 10 objects per scene nothing is learnt at all; at 6, one memory.
3. **The old 90% rule is far too slow on busy scenes.** Every busy picture is stored whole (about 60 pixels), and rest compares every pair of stored pictures at every shift (`geoms`: 1.4 s per rest step with only 8 memories). 98 pictures and one rest didn't finish in 9 minutes.
4. **"Remember only what's new, always"** (known things that fit exactly, plus what nothing explains; `see-new.js`) runs on the small world. It's 10× faster awake, but the bill is much worse (1,840 against 393): every picture with anything new becomes a permanent memory, so the bill keeps growing. On busy scenes it still didn't finish in 9 minutes, because early on everything is new and whole pictures are stored anyway.

## The real question (for the owner)
How should a busy scene become memory? Every rule tried so far fails one way or another:
- judged one picture at a time: it can't see later sharing, so it never starts;
- store everything whole: rest can't keep up;
- store everything new: memory grows without limit.

Candidates:
- **(a) Judge memories at rest, not awake.** Pictures go to the flow; rest proposes "store this flow picture (or what's new in it)" as a move, measured against the whole flow, where its sharing shows. No number. It needs rest to compare pictures within the flow, which is costly, but only within the window.
- **(b) Attention.** Look at part of a scene at a time, a window that moves, so each look is small, like the small worlds where everything works. The scene is then built from looks. This is closer to how eyes work, and to the owner's columns and centre of attention.
- **(c) Learn small worlds first** (objects), then scenes. Busy scenes are then mostly explained by known things, and only what's new remains. This is a curriculum, so it would be declared (decision 006 covers designed demonstrations).
