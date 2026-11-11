# Findings C22: completion

*Code: `models/complete.js`, on a learnt C20 model and C21's cells (neither is changed). Runner: `sketches/C22-completion/run.js`. Seed 4242.*

## Definition used (from the handoff reply doc)
- Completion means: recognise a thing from part of it, fill in the rest, settle over rounds, with heat = mismatch between what is predicted and what is seen.
- "Recognised" uses the energy rule, not a threshold: a thing counts as present when describing it as one whole, plus what it predicts, is cheaper than describing what is seen of it piece by piece.

## 1. Damaged pictures
- **One known thing, with a rectangle hidden over part of it.** Results by how much of the thing was hidden (picture restored exactly):

  | | 0–25% hidden | 25–50% | 50–75% | 75–100% |
  |---|---|---|---|---|
  | told where the hidden patch is | 99% | 94% | 67% | 3% |
  | not told (patch looks empty) | 94% | 21% | 0% | 0% |

  - When it isn't told, a missing pixel counts against a thing. Recognition then holds only while about three quarters of the thing is visible. That is the "~75%" from the reply doc, arising from the costs, not set by hand.
  - When it knows a region is hidden, missing pixels there cost nothing. Recognition then holds with up to half the thing hidden, and often more.
- **Pixels removed at random, not told:**
  - with 20% removed, 45% of the removed pixels are filled back;
  - with 40% removed, 15% are filled back.
  - It almost never draws pixels that weren't there (0.04–0.10% of empty pixels).
  - Heat (prediction against what is seen) is 0.20 and 0.37, a direct measure of the damage.

## 2. Recall from a few cells (the step the hippocampus idea needs)
- Each kept "where" cell votes for "this assembly, centred there". An assembly is accepted if it takes in two or more items (cells, or things found earlier) as one placement, and the cells it predicts are added. This repeats until nothing more pays.
- **Two houses:**
  - one cell from each roof and one from each box: both houses found, picture back 100%, nothing extra;
  - two cells from each box only: two boxes found, picture back 38%. That is correct, since a box alone is a valid thing;
  - one cell from each house: nothing found, because one cell is ambiguous.
- **Random cues over ordinary scenes:**

  | cells kept | picture from the cue alone | picture after settling | things wholly back |
  |---|---|---|---|
  | 25% | 33% | 36% | 23% |
  | 50% | 52% | 58% | 43% |
  | 75% | 73% | 80% | 69% |

  - Almost no invented pixels.
  - The gains are small because most things in these scenes are a single primitive (one cell is the whole thing), and a random cue often lands inside one sub-part.

## What this says
- Completion works when the cue is **informative**: it must touch two different parts of the whole. Which cells a memory keeps matters more than how many. This supports sampling where things were surprising, or across sub-parts, rather than uniformly.
- **Settling over rounds never needed more than one round.** That's because each assembly votes with all its parts flattened at once. Rounds would matter if assemblies only knew a sample of their children's cells (as in C21's sampled codes), so that a thing found in round 1 had to be recognised as part of something bigger in round 2. The code supports that (a later round can take in an earlier find), but this world is too shallow to need it.
