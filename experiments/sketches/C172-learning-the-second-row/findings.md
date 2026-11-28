# C172 · Learning the second row by doing and checking (a taste): findings

Run: `SHARD=0/2 node learn.js` and `SHARD=1/2 node learn.js` side by side (about seventy-five minutes on two cores), then
`SHARD=0/2 REPORT=1 node learn.js > out.txt`. Filter check: `node filtercheck.js > filtercheck.txt`. Read
[the hypothesis](hypothesis.md) first. Engine, circuit and teacher as C171.

## In short

**The second-row way of working was found by doing and checking, from a page showing only the question.** Nothing
about it was written: not what it holds, what it reads, where it writes, where its carries go, which way it moves, or
where it starts. After two worked examples, three candidates were left. All three are the hand-written second-row frame,
started one left of the start, and they differ only in which "×" along the sign row they read. Each of the three did
200 of 200 new long multiplications' two rows right from the cue, the same as the hand-written frame.

**Nothing was bound, because of the tie.** The binding rule needs a single winner, and the three are genuinely equivalent.
The first row writes the sign along the whole sign row as it goes, so the sign is there whether the second row reads it
above-left, directly below or below-right. This was the risk named in the hypothesis. It isn't a wrong answer. The
memory has three right answers and no reason to prefer one.

**One worked example wasn't enough here, unlike the hand-overs.** The first example (525 × 67) also settled three
coincidences. They held a digit of the first row (3675) that happened to equal the multiplier's other digit, 6, instead
of holding the multiplier itself. On that page they did exactly the right thing for the wrong reason. The second example
(9188 × 54) removed them. Ways of working have many more parts than a composition does, so there are more ways to agree
by accident.

**The earlier learning could never have found this frame.** Its search assumed the answer is written at the focus, and
the second row writes three rows below it. Here the write place is a candidate like any other part.

**The cost is the warning.** Stage 1 ran 34,170 candidates and kept 988. Stage 2 ran 102,752 and kept 6. That's about
137,000 runs of the whole circuit, roughly 600 times the composition learning of C171. The search is now the expensive
part, and it's the code's (the proposing crutch). The ring limit (reads within two rows of the focus) is what kept it
feasible. Ring 3 would be about three times the size.

## Results

| | count |
|---|---|
| stage 1 candidates (start relation × three reads within two rows × sign read × units write, after the filter) | 34,170 |
| kept by stage 1 (the first units write cooled a target place) | 988 |
| stage 2 runs (each keeper × hold or not × 26 carry places × two moves) | 102,752 |
| settled the searched example (525 × 67) | 6: the right frame with each of three sign places, and the hold-a-first-row-digit coincidence with each of three sign places |
| settled the second example (9188 × 54) as well | 3: the right frame with each of three sign places |
| learned (binding rule: a single candidate settling every example) | nothing (a three-way tie) |

| what runs after the first row (test, 200 new long multiplications from the cue) | first row right | second row right |
|---|---|---|
| tied candidate: sign read below-left | 200 of 200 | 200 of 200 |
| tied candidate: sign read directly below (the hand-written frame) | 200 of 200 | 200 of 200 |
| tied candidate: sign read below-right | 200 of 200 | 200 of 200 |
| the hand-written second-row frame (reference) | 200 of 200 | 200 of 200 |

The filter check, with 100 of each kind of candidate the filter drops (a read of an empty place, a sign read of a place
without a sign, a units write to a filled place), run through stage 1: **0 of 300 passed.**

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | stage 1 keeps several hundred | **Holds:** 988. |
| 2 | exactly one settles the searched example, the hand-written frame; risk: a tie over the sign place | **Fails as stated, the risk came true:** 6 settled, three sign-place variants of the right frame and three of a coincidence. |
| 3 | the second example doesn't change the answer | **Fails:** it removed the three coincidences. |
| 4 | if one is bound, 200 of 200 on both rows | none bound; **each tied candidate did 200 of 200**. |
| 5 | the filter check: all 300 fail | **Holds, after a fix to the check's measure** (below). |

## Disclosed

- **The filter check's first run counted the wrong thing.** It reported 37 of 300 passing. All 37 wrote onto a first-row
  place that the first row had already cooled, so "cooled" was true before the candidate had done anything. The check
  now counts only a cooling after the hand-over (each cooling's first moment is now logged, which doesn't change any
  run). The main search was never affected, because it only proposes units writes to empty places. Then I reran the
  check with 100 of each kind, because the first sample was nearly all empty reads (279 of 300). 0 of 300 passed.
- The candidates' sign write is left out (the second row's target doesn't include the sign row). The hold can only be on
  the first read, but both orders of the first two reads are proposed, so either one can be held.

## The ledger

**Given:**
- the first-row way of working (by hand, as before);
- the composition's form (the first row, then one hand-over to a second frame; where it starts is learned);
- the candidates, proposed by the code (the filter and the ring limit);
- the working marked as the target, and the worked examples written out by the teacher (C170's procedure);
- the facts;
- the architecture as C171.

**The engine:** running every candidate from the cue on a page showing only the question, agreement, the Settled gate,
and the test runs. **Removed from the second row:** every part of the hand-written frame, and where it starts. **Not
done:** binding (the tie), the adding frame, and re-learning the first row under this rule.

## What it shows

A way of working with a step a page can't show (where the carries go, what's held, where it starts) can be found by
doing and checking alone, judged by the memory's own settling, from two worked examples. What's left open are a real
tie and a heavy search. Both are about choosing and proposing, not about whether the memory can tell right from wrong.
