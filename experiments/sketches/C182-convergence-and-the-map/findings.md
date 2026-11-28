# C182 · Convergence and the map: findings

Run: `node heat.js > out.txt` (under two minutes). Diagnostic, added after the run: `DIAG=1 node heat.js`
([diag.txt](diag.txt)). Read [the hypothesis](hypothesis.md) first, written before the run.

## In short

**No churn. One change at a time, kept, ridden along or undone cleanly.** The design settled with the owner fixed what
broke C181. Times one digit took 12 runs and was right, 200 of 200, with the part to blame (the read of an empty place)
giving way to holding at the same place on the fourth attempt.

**The second row got stuck one step short on all four worked examples** (5 to 7 places cooled, about 50 runs each), and
nothing was learned: 0 of 200. The diagnostic shows why, and it goes to the heart of the owner's residue idea. The two
changes the right way of working needs, the carry read and the answer write in their right places, had each been tried
early, while the rest of the way of working was still wrong. At that point each made things worse, so each was marked
with residue heat, and from then on each was a dead end for the whole worked example (a slimy rock). They were never
tried again, even once the surroundings had changed and they would have worked. Meanwhile the memory settled into a
local trap, with the answer and the carry written into each other's rows, where every single change made things worse.

**The residue's context was too coarse.** Here, context meant the worked example. In the owner's slimy-rock example,
caution comes back from the object together with the whole situation: boots on, out hiking, foot heading for it. The
residue should be bound with the situation it arose in, including the rest of the way of working at that moment. Then
the carry read that hurt while the answer was in the wrong row wouldn't be a dead end once the answer moved. **That's
the owner's principle applied more fully, not a new rule.** And it would also make the pair findable: a half that hurt
alone isn't barred from being tried again in different company.

## Results

| | times one digit (runs) | second row (runs) | test (200 new, from the start) |
|---|---|---|---|
| convergence and the map (C182) | 12 | 203 (all four examples stuck one step short) | 200 of 200; 0 of 200 |
| C181, energy layer | 3,010 (churned) | 6,005 (churned) | 0; 0 |
| C180, heat kept by the code | 14 | 341 | 200; 200 |

Every example of the second row climbed the same way (from out.txt): the answer write gave way first, then the carry
write, then the top read one place over, and then no part with residue had an alternative left that wasn't a slimy rock
or already on the map.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | times one digit within 5 attempts | **Holds:** settled on attempt 4. |
| 2 | the second row settles, without churn, 100 to 800 attempts, 200 of 200 | **Half:** no churn, but stuck on every example; 0 of 200. |
| 3 | risk: a pair, where the first move makes things worse and is undone, may never be found | **Came true, and worse than predicted.** The undone move was also marked as a dead end, so it couldn't come back in different company. |
| 4 | the coincidence may be settled first | Not reached. |

## The ledger

As the hypothesis. **In the substrate:** the map, residue heat and convergence, as structure (inert marks).

**The code's:** the reading rule, practising, blame, and the comparison with the best. **Disclosed:** the diagnostic was
added after the run, and changes nothing in it.

## What it shows

Structure with competition over it, one change at a time, works where it can: no churn, and the simple lesson learned
cleanly. Residue heat does what the owner said, stopping the same mistake being repeated, but it has to be bound with
the whole situation it arose in, not a broad context. Otherwise a change that was wrong in one company is wrongly barred
in another, and the memory traps itself. Next: residue bound with the situation, meaning the way of working it arose
in.
