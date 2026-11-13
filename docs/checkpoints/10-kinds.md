# 10 · (name to agree): one form, many versions

## In one paragraph
Some things are the same except for one piece: a table with a cap on top, a table with a peak, a table with dots. A **kind** holds what they share once, with one **slot** for the piece that varies and a list of the **fillers** that can go there. A particular table-with-a-cap isn't stored; it is made from the kind when needed. A kind costs something every time it's used (naming which filler), so on pictures alone it rarely pays. It starts to pay once the cost of describing **what changes** between pictures is counted in the same bill: then one remembered change ("a table moves right") covers every version of the table, instead of one change per version.

## Why it matters
- **Generalising within a form.** A thing can vary inside a fixed shape and still be recognised as the same thing. On this world, seeing alone also gets there once rest has enough pictures to weigh against; one energy gets there with a smaller description (see the numbers below).
- **One energy.** Seeing and change are now priced together, so what the machine keeps is what makes both cheaper. Kinds aren't added by a rule; they are kept because they lower the bill.
- It's a first step towards a scene held generically at the top and in detail underneath.

## How it works
1. **At rest, four new moves are tried**, each kept only if energy falls:
   - **make**: two composites the same except for one placement become one kind with two fillers;
   - **widen**: another composite that fits the kind adds a filler;
   - **share**: two kinds use one filler list;
   - **undo**: a kind folds back into separate composites, or away altogether.
2. **Prices** use the same currency as everything else. The slot and each filler are placements. Each use of a kind also pays for naming its filler: log2(number of fillers) against log2(pixels in the world).
3. **Change in the bill.** When pictures come in sequence (`step(x, prev)`), each thing before is paired with the same thing after (decision 007). Each different change is stored once and named each time it happens, and something that appears or vanishes costs a placement. A kind's versions count as the kind.
4. **A thing can never contain itself.** Moves that would make one are refused (found as a hang in C28/C29).

## What it showed (moving world: table moves right, frame down, cart left; frame+dots and cart+peak never shown)
| | Things | Kinds kept | Different changes | Next picture, seen objects | Never-seen objects |
|---|---|---|---|---|---|
| Seeing only | 14 | 2 | 7 | 100% exact | 0% exact, 87% overlap |
| One energy | 11 | 3 | 4 | 90% exact | 0% exact, 87% overlap |

These are the numbers after C30's fixes: the flow now carries across rests, and pictures are remembered by energy. Before those fixes the last rest of a run weighed against only 12 pictures and threw structure away. That made seeing only look far worse (43%) than it really is, and the first version of this note overstated the gain.

**What one energy really buys:** the same predictions from a smaller description, with fewer things and about half the changes. Kinds also form from pictures alone once rest has enough pictures to weigh against.

**Its one miss:** table + peak is read as table + dots with three pixels wrong, so the prediction draws dots. Table + peak is in only 2 of 100 episodes. The one rest whose flow holds it sees just 6 of its pictures, too few for any way of storing it to pay. With every picture as the flow, it's 100% (C32). A rest move that adds the missing version was tried (C32); energy turns it down for the same reason.

Every earlier engine test gives the same results or better, apart from completion from cells, which drew 4 pixels that weren't there in 300 scenes at the 50% cue (previously 0). That turned out to be the twins assembly, legitimately recalled from what the cue kept; the earlier 0 was luck in which cells the cue kept (C32).

## What to show people
- The C29 viewer: both learners side by side, kinds drawn with their versions, and a "what happens next?" test.
- A never-seen object: the base moves correctly but the top is wrong.

## Limits and open questions
- **Only what's been seen.** A kind's fillers are the ones it has seen with it. Nothing makes the machine guess that dots could go on a frame. Should energy reward predicting what hasn't been seen yet (for example, one filler list shared by every base)? That's an open question for the owner.
- **The transition memory (`change.js`) doesn't use kinds, and on this world it doesn't need to.** It works on primitive cells, and the tops break into small shared pieces, so its shared changes already cover every version, including never-seen ones (C31). Kinds in the transition memory were tried and gave no gain here. The next-picture read-out in the test is a simple one ("each thing moves its usual way"). Merging the two is the next step.
- One slot per kind.

## Where it lives
- Code: `src/engine/see.js` (KINDS, CHANGE, kind moves). World: `src/worlds/moving.js`. Test: `src/test/kinds.js` (baseline `src/test/baseline/C29-kinds.txt`).
- Experiments: C28, C29. Findings: `experiments/findings/C28-kinds.md`, `experiments/findings/C29-one-energy.md`.
