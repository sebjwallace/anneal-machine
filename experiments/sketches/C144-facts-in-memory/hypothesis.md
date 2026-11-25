# C144 · The facts in memory: hypothesis

Follows [C142](../C142-column-addition/findings.md) and [C143](../C143-search-steered-by-heat/findings.md). In both, the
single-digit facts of addition (what three digits add up to, its units digit, whether it carries) were looked up by
the experiment's code. The owner's view: the facts are the easy part, plain association (the CPU's mapping), and the
hard part is the procedure. That was accepted as a crutch, but it should be shown. It is also needed for the
[candidate energy rules](../../../docs/theories/candidate-energy-rules.md): in candidate B, "this sum explains that
digit" can only mean a fact assembly completing in the engine.

## The question

**With the facts held as assemblies in associative memory and recalled by completion, does column addition still
learn and run exactly as before? And can completion by itself say whether a written digit fits, which is what
candidate B would need?**

## The facts

Each fact is a state assembly of five members, one from each of five populations: the first digit, the second digit,
the carry in (each 0 to 9), the units digit of the sum (0 to 9) and its tens (0 to 2). For example "7, 5, 1 gives 3,
tens 1". All 1,000 combinations are formed once, before training (the facts taught beforehand, as times tables are;
declared, and not under test). **Recalling a fact:** the three digits are given to the engine together, and the units
and tens that come on the next moment are the answer. Which read place is which digit is its order in the step (an
empty cell, or the "+", counts as 0).

## Parts

1. **Recall.** All 1,000 cues: does completion bring on exactly the right units and tens, and nothing else?
2. **Column addition with the facts in memory.** C143's best arm (each explanation keeps its own heat and must leave
   none), and C142's test (4 to 8 digits, at a new position, 40 per length, 20 seeds, the same seeds), with every
   fact, in training and at test, recalled from the engine instead of looked up.
3. **Can completion judge a written digit?** For every cue, the three digits **and** a written units digit are given
   together, right or wrong. If the engine is to judge fit by itself, only the fact with that units digit should come
   on when it is right, and nothing should when it is wrong.

## The ledger

**Given:** the 1,000 facts, formed beforehand; the roles (which population each read takes, by order); counting empty
as 0; comparing the recalled units digit with the hot cell in the search (the fit test) unless part 3 shows the engine
can do it; everything else as C143. **The engine:** forming the facts, and recalling every one by completion; as C143,
storing and recalling the step and every move.

## Predictions (fixed before running)

1. **Recall:** 1,000 of 1,000 exact. A cue of three digits has three of a fact's five members, so only the fact with all
   three opens (support 1); facts sharing two of them don't (support −1).
2. **Column addition:** identical to C143's best arm: the same step in every seed, 100% at 4 to 8 digits, every run
   stopping by itself.
3. **Judging a written digit: no.** With the right digit written, its fact opens (four of its five members counted).
   With a wrong digit written, the same fact still opens (three of five counted is already enough), and brings on the
   right digit beside the wrong one. Nothing rejects the wrong digit: **completion gives the right answer alongside it,
   but can't say the written one is wrong.** Rejecting needs the two units digits to compete for the same place, and in
   the engine rivals come only from transitions (C137), which facts are not. If this holds, the fit test stays given
   until rivals can come from places.
