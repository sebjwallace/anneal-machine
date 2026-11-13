# 07 · Transition: one state into the next

## In one paragraph
A settled picture, held as cells, is a **state**. When the next picture settles, the machine links the two: that link is a **transition**. Later, being in a state primes the states that have followed it. If there's more than one (a branch), a **cue** (a hint from the input) or a **context** (something held from elsewhere) decides which one it moves into. Otherwise the most travelled path wins. It's a fuzzy state machine, built from memory. Order matters; duration doesn't.

## Why it matters
- **It's the owner's "transition memory",** deliberately not "temporal memory": time and duration don't matter, only what follows what.
- **It needs no new mechanism.** It's content-addressable memory and completion again: a state primes the cells of the states that followed it, and a cue completes into one of them.
- **This is how the machine models things that change,** and how it could later model state machines in its world.

## How it works
1. **A state** is the cells of where things are now, plus where things were a moment ago, plus any held context (one cell, with no position).
2. **Learning:** each state is remembered with the picture that settled after it, including what went off, what came on, and where.
3. **Predicting:** remembered changes that fit the current state are candidates. The most detailed fit wins: an exact memory, at the place it was seen, is the most detailed of all. Next comes one a cue agrees with, then the most often seen. Anything not changed stays as it is.
4. **No "two of the same" confusion:** when something moves, its old cell goes off as its new cell comes on, so a moving thing is never seen as two.

## What it showed (tested where it was trained)
| World | Without a cue | With a cue |
|---|---|---|
| Roof sliding left or right and back (a branch at the normal house) | 77% (the branch is a coin flip; 75% is the most possible) | 100% |
| One stick moving | 100% | 100% |
| Two sticks moving together | 100% | 100% |
| One moving, one staying | 100% | 100% |
| Bouncing stick, no context | 100% | 100% |
| Bouncing stick, with context | 100% | 100% |

- The bouncing stick no longer needs a context: the moment of history already carries its direction.
- Nothing moving was ever seen as two things.

## What to show people
- A roof sliding: its cell stepping one place in the roof column, with everything else still.
- A branch: the normal house priming two possible next states, and a single cue cell picking one.
- History: why "where it was a moment ago" tells a moving stick from a still one.

## Limits and open questions
- Linking whole states versus only what changed made no difference so far; it may matter later.
- **Things appearing from nowhere** aren't predicted.
- **Changes of whole composites** (a house moving as one) are seen as changes to their primitives' cells.

## Where it lives
- Code: `src/engine/change.js` (`state`, `learn`, `predict`). Test: `src/test/change.js`.
- Experiment: C23. Findings: `experiments/findings/C23-transitions.md`.
