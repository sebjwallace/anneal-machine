# C145 · Rivals from place: hypothesis

Follows [C144](../C144-facts-in-memory/findings.md). With the facts of addition as assemblies, completion recalled every
one correctly, but **couldn't judge a written digit**: given the three digits and a wrong units digit, the engine never
rejected it. It brought on the right digit beside it, and also opened the facts that would have made the wrong one
right. Nothing competed, because in the engine two things are rivals only through transitions (C137), and facts are not
transitions. Left to run on, a completed fact also set off its neighbours (3, 5, 29, 42 members active). C144 named the
missing piece **rivals from place**: two things in the same place compete. It is also the side notes' learned
competition (attraction and repulsion: what shares surroundings is drawn together, and competes where only one can
stand) and what [candidate B](../../../docs/theories/candidate-energy-rules.md) needs.

## The one change to the engine

Two members are **rivals from place** if they have **never been in an assembly together** but **share company** (some
member has been in an assembly with each). They stand in the same place against the same surroundings, so only one can
stand there at once. This is read from the structure as it is, when needed; nothing about it is stored or declared. In
the facts it should give exactly the five places: the first digits compete with each other, the units digits with each
other, and so on, while a first digit and a units digit (which are in facts together) never compete. The rule is
switched on per memory, so the same engine can run with and without it.

## The protocol for judging a written digit

The three digits arrive at moment 1. The written units digit arrives at moment 2, after the fact has had a moment to
complete. At moment 3 nothing arrives, and the engine's state is read: **the written digit fits if it is still on**.
With place rivals, the true fact (now fully supported) should outcompete the facts that would have made a wrong digit
right, and a wrong digit, which nothing then holds, should go off.

## Parts

1. **Judging written digits**, all 1,000 right and 9,000 wrong cases, without and with place rivals.
2. **Completion that stops.** From a cue of three digits, left to run on for four moments: how many members are active
   at each moment, without and with place rivals.
3. **Column addition with the engine judging the units digit.** C144's column addition, with the facts in memory, and
   the fit test for the units digit (the hot cell) done by the protocol above instead of by comparing in code. The
   carry is still compared in code with the recalled tens (declared). 20 seeds, C142's test.

## The ledger

**Given:** as C144, except that in Part 3 the units fit test is the engine's (the written digit surviving); the order of
the protocol (digits first, written digit next moment, read the moment after); switching the rule on. **The engine:**
the new rule; completion and competition; everything it did in C144.

## Predictions (fixed before running)

1. **Without place rivals:** as C144: the wrong digit is still on at moment 3 in all 9,000 cases (the facts that would
   make it right open and hold it). The right digit stays on in all 1,000.
2. **With place rivals:** the wrong digit is off at moment 3 in all 9,000 cases, with the right digit on; the right
   digit stays on in all 1,000.
3. **Completion that stops:** without place rivals, activity spreads as in C144; with them, it stays at the completed
   fact's five members.
4. **Column addition with the engine judging:** identical results to C144 (the same step in every seed; 100% on 4 to 8
   digits; every run stopping by itself).
5. **Nothing else breaks:** the moves (C141's gates) and the step's recall from "+" work as before with the rule on.

If 2 to 4 hold, place rivals let associative memory reject a wrong answer by itself, the mismatch becoming something
that loses rather than something that is rationalised, and the fit test moves into the engine.
