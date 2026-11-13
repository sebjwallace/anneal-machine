# 06 · Mould: the whole, from a part

## In one paragraph
Give the machine part of something and it brings back the whole. This works on two levels. With a **picture** where part is hidden, it recognises the thing from what's visible and fills in the rest. With a **few cells**, it finds the assemblies those cells belong to and fills in their missing cells, settling until nothing more fits. The same cost rule decides when it's sure enough. Nobody sets a threshold.

## Why it matters
- **Completion is what lets a few cells stand for a whole thing.** It's the basis for small assemblies (05 · Grain), for remembering cheaply, and for recalling a whole scene from a cue (the owner's "hippocampus" idea).
- **The "about 75%" rule emerged on its own.** When the machine doesn't know part is hidden, it recognises a thing only while about three quarters of it is visible. That figure came out of the costs; nobody set it.
- **An unsettled assembly is high energy.** Completion is how it settles.

## How it works
1. **Pictures:** this is seeing, with some places marked as **hidden**. A part's pixels on hidden places cost nothing, so a part is placed if what's visible pays for it. The rebuilt picture fills the hidden places.
2. **Cells:** each cell votes for "this assembly, centred there". Describing several items as one assembly saves placements, so an assembly is accepted when it takes in two or more items. The biggest saving goes first. Between equal savings, the one that claims least that wasn't seen goes first. **If the evidence fits two different completions equally well, neither is taken.**
3. **Settling:** found things are added, and it repeats. A later round can take in something found earlier as part of something bigger.

## What it showed
**One known thing, with part of it hidden.** Share of pictures restored exactly:

| Share hidden | Machine knows where | Machine thinks the gap is empty |
|---|---|---|
| up to 25% | 98% | 94% |
| 25–50% | 93% | 24% |
| 50–75% | 67% | 0% |

**Pixels removed at random:**
- 20% removed: 48% filled back;
- 40% removed: 18% filled back;
- almost nothing ever invented.

**Recall from a few cells:**
- One cell from each part of a house (two cells) brings back the whole house; one cell alone is ambiguous.
- Recall never invents pixels. Ties are left undecided rather than guessed.

**What it means:** which cells a memory keeps matters more than how many. Good cues touch different parts of the thing.

## What to show people
- A picture with a patch covered. Toggle "the machine knows it's covered" and watch the restoration change.
- A slider for how much is hidden, showing where recognition gives up (about three quarters when it isn't told).
- A few cells lighting up, and the assembly filling in around them, round by round.
- An ambiguous cue, where the machine honestly refuses to guess.

## Limits and open questions
- In this world, settling never needed more than one round, because the world is only a few levels deep. A deeper world (houses → streets → town) would test it properly.
- **The hippocampus idea:** keep a sparse sample across all levels of a scene, chosen from surprising and distinctive parts, and recall the whole scene from it. Not built yet.
- **What tells the machine "this is hidden" rather than "this is empty",** in a natural way, is open.

## Where it lives
- Code: `src/engine/complete.js` (`picture`, `settle`); `src/engine/see.js` (`explain` with hidden places). Test: `src/test/complete.js`.
- Experiment: C22. Findings: `experiments/findings/C22-completion.md`.
