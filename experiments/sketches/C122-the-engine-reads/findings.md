# C122 · The engine reads: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in the energy rule (about 4 letters; reading here was invoke, which has no price),
> while a loose letter cost 1. So a familiar short piece ("the", say) could cost more to use than to spell out: it was
> never worth reading on its own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way round: an established piece should be the cheapest thing to reach for. C125 replaced
> the flat price with cost as surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed
> it. Read the results here with that in mind: some may not depend on it, but anything about short pieces, what pays,
> or what counts as heat may.

Read [the hypothesis](hypothesis.md) first. Files:

- `engine.js`: the JavaScript copy of the engine. Its departures are listed at the top. `check/check.sh` checks it
  against the Go engine and prints `same: 1113 lines`.
- `reads.js`: the experiment. [out-150.txt](out-150.txt) is the first 150 sentences of *Buster Brown* at 8, 64 and 256
  members per letter, with and without the energy rule. [out.txt](out.txt) is the first 500 sentences at 256 members;
  the run without the energy rule didn't finish in ten minutes.
- `diagnose.js`: why it breaks down. Output in [out-diagnose.txt](out-diagnose.txt).

The full book was too slow to run in this form. The results below are from its first 150 and 500 sentences.

## In short

1. **The copy is faithful.** On eleven scenarios, the Go engine and the copy give the same output, moment by moment
   (1,113 lines, no difference). Those were the competition and book transcripts, anneal followed by reading, and
   eight random scenarios with the refractory period on and off. With words declared by hand, invoke reads perfectly:
   in "thecatsatonthemat" every word's letters are linked through its transition, and only each word's first letter
   arrives unexpected.
2. **With a learnt memory, reading by invoke breaks down.** It reads in two- and three-letter steps that keep breaking
   (`h[el][ook]e[dt]h[is]way[and]`, `t[he]n[he]bega[nto]chu[ck][le]`). Cuts are at chance (24 to 26% against 24%).
   At most 14% of units have both edges at word boundaries, and it gets worse as memory grows. On 500 sentences, clean
   is 7% and coverage 13%, and **it heats up instead of cooling**: loose letters rise from 60% to 86% over the run. C118
   (same learning, cheapest reading) had clean 62%, coverage 73%.
3. **Two causes, both shown by `diagnose.js`:**
   - **Crosstalk at 8 members per letter.** Members are handed out in turn, so with about 1,000 assemblies, each member
     of "e" belongs to 210 to 227 assemblies. Every moment becomes one big competition, with 254 rivals on average.
     With 256 members per letter, each member is in 4 to 7 assemblies and there are 72 rivals a moment. Coverage
     rises (6% to 33%), but the units stay short and badly placed.
   - **Support favours short transitions.** Support is counted part minus missing part, so near the start of a word,
     a long transition always looks worse than a short one: one letter counted of six is support −4, one of two is 0.
     At 256 members, transitions of 2 and 3 letters win 25% and 41% of the competitions they're in, and those of 6 or
     more win 2 to 5%. Composition makes a two-letter join between each pair of parts (`e -> d` in `the` + `dog`), so
     there are many short transitions, and they win. Reading then follows whichever short transition won. When the
     next letter isn't what it expected, the letter arrives unexpected and all its members come on again.

| first 150 sentences, energy rule | 8 members | 64 members | 256 members |
|---|---|---|---|
| clean | 10% | 11% | 14% |
| coverage | 6% | 11% | 33% |
| words read whole | 7% | 8% | 15% |
| cuts at a word boundary (chance 24%) | 24% | 25% | 25% |
| assemblies | 985 | 1,593 | 1,810 |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | still finds patterns, clean well above chance | **Wrong.** Units are mostly short fragments, and cuts are at chance. |
| 2 | worse than C118, clean 40 to 55% | **Far worse**: 7 to 14%. |
| 3 | crosstalk at 8 members per letter | **As predicted, and stronger**: members in over 200 assemblies, one big competition every moment. |
| 4 | it cools | **Wrong**: it heats up as memory grows. |
| 5 | without the energy rule, more assemblies and fragments | **More assemblies, yes** (3 to 4 times as many). Cleanliness is about the same, all low. |

## Against the success and failure criteria

**Failure**: reading by invoke falls to chance.

## What this says

1. **The sketches' good results came partly from their reading.** Cheapest description looks at the whole sentence and
   picks the best set of pieces. Invoke reads left to right, one moment at a time, and a single competition each moment
   decides what's expected next. The same learning gives words and patterns with the first, and fragments at chance with
   the second.
2. **Two things in the engine stop it scaling, both visible only with a learnt memory:**
   - **Population size.** At 8 members per letter, members are shared by hundreds of assemblies. Bigger populations
     remove most of the crosstalk. C108 found size to be robust over a wide middle range, so it should be chosen from
     how many assemblies will be held, not left at 8.
   - **How support is counted.** Counted minus missing penalises a long assembly for what hasn't arrived yet, so short
     ones win early, and reading never gets far enough into a long one for it to win. This is the C116 problem (short
     pieces win) inside the engine's own rule. It matters more for transitions than for states, because a transition is
     read one step at a time. This is the engine's rule to change, if it should change, so it is the owner's to decide.
     One reading: support for a transition could count only the steps that could have arrived so far (counted against
     the part already due), so a long transition reading correctly isn't marked down for its future.
3. **Learning and reading can't be judged apart.** A better reading would change what is hot, and so what is learnt.
   Here, heat rose as memory grew, because the more short transitions there are, the more often reading breaks.

## Givens and departures to keep in mind

- In the experiment (not the engine), each sentence's invoke stops after its last letter, with no recall moments after
  it, since only the moments the letters arrive are read. The memory is reset before each sentence. The refractory
  period is off (the engine's default).
- A link between two letters is a transition gate from a member of the letter before, active the moment before. A
  letter expected only by a state gate isn't linked. That makes units the transitions' reading, which is what
  "reading a piece" means here. A letter expected by a state counts as expected for heat in the engine, but not here.
- Choosing an anneal partner (the held state with the longest shared run, among those sharing a three-letter run) is
  the experiment's, not the engine's. So is the energy check passed to anneal.
- Members per letter: 8 is the interpreter's size for a population declared for reading. 64 and 256 were tried
  because of the crosstalk.
