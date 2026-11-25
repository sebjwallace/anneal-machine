# C141 · A gate for each step: findings

Run: `node gate.js > out.txt` (a second or two; [out.txt](out.txt) has every probe and the first seed of each Part 2
arm). Read [the hypothesis](hypothesis.md) first. Engine: C140's copy plus one new shape, a gate (key, then one target;
opens the target only when all of the key is counted).

## In short

**One gate per step fixes it completely.** Stored as a gate whose key is where the walker was and the move, with where
it arrived as the target, every single step from every column came out exactly right (30 of 30, against 0 of 30 with
C140's shapes). Chains of moves stayed exact at every moment, in both directions and mixed (131 of 131 paths), and paths
that ran off the row brought on nothing once they left it (29 of 29).

**C140's result now comes from the engine's own moves.** With relative places reached by walking with those gates,
rather than by the experiment adding offsets, the subtraction procedure was learned in every seed from one or two
examples and was 100% right at positions training never used. With the walk learned only where training happened, the
same procedure gave **no answer at all** in the new region (0% right, 0% wrong): the engine had never learned to move
there. So carrying to new positions now depends on where the engine has learned to move, and not on coordinates the
experiment declared.

**Every prediction held.**

## Results

**Part 1, moves**

| | single steps exact (only the right column on) | moves off the row bringing on nothing | chains on the row, exact at every moment | chains leaving the row, exact then nothing |
|---|---|---|---|---|
| old shapes (C140) | 0 of 30 | 0 of 2 | – | – |
| **gate** | **30 of 30** | **2 of 2** | **131 of 131** | **29 of 29** |

Examples from the trace: from column 5, right, right, left gives 6, 7, 6. From column 2, left, right, right, right gives
1, 2, 3, 4. From column 13, four rights gives 14, 15, then nothing.

**Part 2, C140 rerun**

| arm | right | wrong | no answer | seeds at 100% | learnt at example (min / median / max) |
|---|---|---|---|---|---|
| **walk learned everywhere** | **100%** | 0% | 0% | **20 of 20** | 1 / 2 / 2 |
| walk learned only where training happened | 0% | 0% | **100%** | 0 of 20 | 1 / 1 / 2 |

Same seeds and same worlds as C140. The first arm gives the same results as C140's relative arm (seed 1's trace is identical).

## What it shows

### 1. Why the gate works where the old shapes didn't

The old shapes stored "4, right, 5" as a set, so it matched "I'm at 5 and moving right" as well as "5, right, 6" did,
and they tied. The gate keeps the target out of the key: "{4, right}, then 5" needs column 4 to be on, so from column 5
it simply doesn't open. Only "{5, right}, then 6" has its whole key present. Nothing competes, and nothing is left over:
the start column goes off, because nothing holds it, and only the column arrived at is on. Moving is now exact, and a
path of moves is just one gate after another, each keyed on the column the last one brought on.

### 2. The relativity now comes from moving

In C140 the experiment turned "+1" into "the column after the '−'" by adding. Here "+1" means "one right move from where
the '−' is", and which column that is, is decided by the engine's gates. The two arms make the point: with the walk
learned everywhere, the procedure works anywhere; with the walk learned only in the training area, the same procedure,
recalled the same way, reaches nothing in the new area and gives no answer. It doesn't guess, and it isn't wrong. The
reach of the procedure is the reach of the engine's own moves.

### 3. What is still given

The moves themselves arrive as input (standing for the owner's command line, MOV 1 and MOV −1). Counting out "+2" as
two right moves is given. Reading the content of the cell reached is given, as is finding the "−". The heat rule is
C139's, the experiment's own. And the columns are a **location code** underneath the moves, like place cells: each step
is keyed on "where the walker is", which is a column cell. The owner's fuller picture has no columns: steps keyed on
**what is seen** and the move ("from '−', moving left, the first number"), with separate instances and repeats told
apart by super-assemblies with relative position. That is the next step, and it needs instances first.

### 4. Two small things to report

- **The walk in the second arm missed one place training could read.** The hypothesis said columns 0 to 10 cover every
  place training reads, but "+3" from a "−" in column 8 is column 11. So in that arm, for problems with the "−" in
  column 8, the candidate "+3" couldn't be reached, which removed some coincidental ties, and a few seeds settled at
  example 1 rather than 2. It doesn't touch the test, which needs only −1 and +1.
- **A smoke test of the new gate** (four columns, two steps) was run while writing the engine change, to check the code
  worked, before the hypothesis was written. The experiment itself was run after.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | old shapes: 0 of 30 | **Holds.** |
| 2 | gate: 30 of 30, start column off, moves off the row bring on nothing | **Holds:** 30 of 30; 2 of 2. |
| 3 | gate chains exact on the row; nothing once off it | **Holds:** 131 of 131; 29 of 29. |
| 4 | rerun, walk everywhere: as C140's relative arm | **Holds:** 100%, 20 of 20, the same results as C140. |
| 5 | rerun, walk only in training area: 0% right, 0% wrong, 100% no answer; training unaffected (by example 2) | **Holds** (learned at example 1 or 2; see 4 above). |

## The ledger, after the run

**Given:** the moves as input; the walk and binding each step as it happens; the columns as a location code; counting
out offsets as moves; the space, finding the "−", reading a cell, the arithmetic facts, the search, the fit test and the
heat rule (all as C140).

**The engine:** the new gate shape; turning a column and a move into exactly the next column; chaining moves; storing
and recalling the procedure from "−" alone.

## What it suggests next

1. **Steps keyed on what is seen, not on a column.** "{'−', left}, then the first number" works only if each expression
   is its own instance (every expression has a different first number), so this needs separate instances told apart:
   the owner's super-assemblies with relative position. The test: the same subtraction procedure with no location code
   at all.
2. **Learning the walk from exploring,** not from a given walk: the engine forming its own gates as it moves.
3. **Repeated bindings jam** (C139, C140): still open, and still the most important gap for learning on the job.
