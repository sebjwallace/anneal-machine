# C112 · Rivals compete as in AMP: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (fixed by the population size), while a loose letter cost 1. So a familiar short piece
> ("the", say) could cost more to use than to spell out: it was never worth reading on its own, it counted as heat
> each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way round: an
> established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as surprise (the
> more familiar a letter or piece, the cheaper it is to use), and that fixed it. Read the results here with that in
> mind: some may not depend on it, but anything about short pieces, what pays, or what counts as heat may.

Run: `node compete.js` (about a second; everything is in [out.txt](out.txt)); `node compete.js steps` also lists
every run's lasting pieces. Read [the hypothesis](hypothesis.md) first, including the **addendum**: the first run
formed nothing, and two more runs were designed, with predictions, before they were run.

## In short

**It failed, in all three readings of support.** AMP's competition rule, put in place of C110's greedy reading with
nothing else changed, didn't give better cuts. It gave the same kind of cuts or worse.

| support | reader: lasting, shifted copies, units, loose, cutting inside a word | the zebra sentence |
|---|---|---|
| C110 (greedy, for comparison) | 35, –, 47, 4, 15 | `[_the_zebra][_sat_on_the_mat_]` |
| length (first run) | **0**: nothing forms | all loose |
| ways in | 26, 9, 122, 65, 52 | `[og_the_]zeb[ra_][sat_on_the_m][at_]` |
| length, then ways in | 26, 3, 57, 17, 20 | `[og_the_]z[ebra][_s][at_on_the_mat]` |

On the story all three read most of the text as fragments (`ba`, `er_`, `op`, `en`, `ed_`, `hi`, `s_`).

## What was learnt

1. **From nothing, ties freeze everything (first run).** Every tentative piece starts as two letters, so every rival
   is the same length. Neighbouring pairs ("th" and "he") always tie. Ties are held, so neither wins, and evidence
   can only arrive by winning, so it never arrives. A system that starts from nothing starts **symmetrical**, and
   AMP's tie rule keeps it that way. Something has to break the symmetry. In physics that is a fluctuation. Here,
   counting ways in did it, because the data isn't symmetrical ("he" is in "the", "then" and "when").
2. **Pairwise competition between rivals isn't what made C106 cut well.** C106 compared **whole descriptions** (the
   cheapest reading of all the text at once). Here each rival is only compared with those it overlaps. That is local,
   as AMP's rule is meant to be, but it gave worse cuts than C110's greedy reading on the reader.
3. **Shifted copies fell but didn't go.** 3 to 9 on the reader, 15 on the story, against C111's hundreds. Most of
   what's left is one real pattern: `d_the_`, `n_the_`, `t_the_`, `y_the_` against `_the_s`, `_the_o`. "and the", "in
   the", "at the" really are frequent in English, so pieces spanning the word gap are real regularities of this text,
   not noise.
4. **The yardstick may be part of the problem.** "Cuts inside a word" counts against the machine when it finds
   something the text genuinely repeats across a word gap (`d_the_` in "and the"). On a few hundred characters,
   letter statistics and word boundaries disagree more than they would on a lot of text. Infants split words where
   the next sound becomes hard to predict, and that difference only shows up with plenty of input. Every sketch
   since C106 has used a few hundred to 1,600 characters. **The evidence so far may say as much about the texts as
   about the mechanisms.**

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | few shifted copies | **Partly**: far fewer than C111, not near zero |
| 2 | at most 5 cutting inside a word on the reader; zebra right | **Wrong**: 20 at best; zebra cut (`[_s][at_on_the_mat]`) |
| 3 | phrases form (longest wins) | Partly: `at_on_the_mat`, `_and_the_dog_s`, cut at odd places |
| 4 | the risk: ties everywhere stall learning | **This happened** in the first run, completely |
| A | ways in: short frequent pieces win, fewer phrases, odd straddles | **As predicted** |
| A | length, then ways in: like the first prediction set | **Wrong**: worse than C110 |
| A | if both fail, how rivals compete isn't the missing piece | **Both failed** |

## Against the success and failure criteria

**Failure** on every criterion.

## What this says for the line of work (C106 to C112)

- What has held up: the price as the judge (keep structure only if it lowers energy), the barrier at the bottom and
  the need for a tentative stage (nucleation), and a fixed-size population carrying the cost of crowding.
- What hasn't: every way of making the reading **local** has cut worse than the global cheapest reading of C106.
  These were greedy (C110), dense and independent (C111), and pairwise competition (C112).
- Before more mechanism, the next step should be **much more text**. All of these were judged on tiny hand-written
  texts, where cross-word regularities (`d_the_`) are real and words aren't yet the obvious unit. A plain book's
  worth of text (a public-domain book as a text file) would tell whether the mechanisms are wrong or the texts are too
  small.

## Givens to keep in mind

- Support of a full match is its length (first run), its ways in (sightings; lasting pieces keep counting), or length
  with ways in breaking ties between equal lengths.
- Rivals are candidates that start inside another and end beyond it. Each starting point offers its longest
  candidate. A tie also holds the rival at its own start.
- Everything else as C110. Small texts written for the sketches.
