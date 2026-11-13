# 08 · Stamp: a change learnt once, applied anywhere

## In one paragraph
A transition learnt in one place says nothing about other places. So, at rest, the machine compares remembered transitions the way it compares parts (01 · Smelt): it slides one over the other at every shift. Where the **whole change** of one lines up with the whole change of the other, what they share before and after is kept as a **shared change**: the change itself, plus what stayed put around it, without its position. "A stick moves one step right" then applies wherever a stick is, like a stamp that makes the same mark anywhere.

## Why it matters
- **This is the owner's "decompose, don't average"** applied to change. Generalising comes from comparing two examples, not from piling up many.
- **One example run can be enough.** Steps within a single run are already the same change in different places.
- A change that applies anywhere starts to look like an **action**.

## How it works
1. **At rest,** every pair of remembered transitions is compared at every shift.
2. **The whole change must line up.** Half a change doesn't count: comparing "roof slides left" with "roof slides right" lines up only the roof leaving, and that's not a shared change.
3. **What's kept:** what both share before and after (the change plus its unchanged surroundings), without position.
4. **When predicting,** the most detailed fit wins. A remembered transition at the very place it was seen counts as more detailed than a shared change, because where it happened is detail too.
5. **Every change applies wherever it fits,** unless it touches cells already changed. Because the state carries where things were a moment ago, a still stick doesn't match "a moving stick moves on".

## What it showed (tested in a place never seen; with a cue in brackets)
| World | Before shared changes | With shared changes |
|---|---|---|
| Stick moving right (trained on one run, one row) | 0% | 100% (100%) |
| Two sticks moving together | 0% | 100% (100%) |
| One moving, one staying | 0% | 100% (100%) |
| Roof slides | 0% | at the coin-flip limit (100%) |
| Bouncing stick | 0% | 93% (100%) |

The bouncing stick's misses are at the walls.

## What to show people
- Two transitions from different places sliding over each other, with the shared change lifting out.
- One run on one row, then a correct prediction on a row never seen.
- Half a change being rejected ("the roof vanishes").

## Limits and open questions
- **Changes that depend on where** (walls) lose their position when generalised. The comparison does show when position matters ("same x, different y"), so that axis could be kept; not built yet.
- **Exact matching only:** a shared change applies where its "before" fits exactly. Recognising similar situations, not just identical ones, is the next big step (a side experiment, C27, tried it).

## Where it lives
- Code: `src/engine/change.js` (`compare`, `rest`, `predict`). Test: `src/test/change.js` (new-place column).
- Experiment: C24. Findings: `experiments/findings/C24-shared-changes.md`.
