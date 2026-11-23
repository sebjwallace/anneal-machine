# C116 · Reading by support: findings

> **Correction ([C117](../C117-no-full-stops/)).** The clean shares below count utterance starts and ends as clean
> edges, as C114 and C115 did. Scored strictly, cheapest is about 48 to 53% and support about 40 to 45% without spaces.
> The comparison between the readings stands; the absolute figures are lower.

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in the cheapest reading (fixed by the population size), while a loose letter cost 1.
> So a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its
> own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong
> way round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. Its "named by ways in"
> reading was a first step towards cost as surprise, but it counted only ways in and left letters at a flat cost, and
> made little difference. Read the results here with that in mind: some may not depend on it, but anything about short
> pieces, what pays, or what counts as heat may.

Run: `node support.js <folder>` (about eight minutes; everything is in [out.txt](out.txt)), the same books as C114.
Read [the hypothesis](hypothesis.md) first. The "cheapest" rows reproduce C114 (no rest) and C115 (rest every 100).

## In short

**AMP's competition, with support as ways in, fixes the slips and reads far more of the text, but it lets frequent
short fragments in.** Naming by ways in barely changes anything.

- **support** (most ways in wins, ties held, parts aren't rivals) reads `and most [things]`, `[but][thedormouse]`,
  `deny[it]`, where cheapest read `[tthing]`, `bu[tthedormouse]`, `[denyi]`. The slips lose to the overlapping clean
  rival, as the hypothesis said they would.
  - Coverage goes from 41 to 63% (cheapest) to **58 to 83%**.
  - Words read whole roughly double or triple: from 12 to 21% to **28 to 37%**.
  - Cuts at a word boundary, counting every cut, rise from about 31% to **38 to 46%** without spaces, against chance at
    24 to 25%. That is the first time this overall measure has moved well clear of chance in C114 to C116.
- But **its clean share falls** from 69 to 79% to **50 to 56%**. Short pieces have the most ways in (they are formed
  by the most comparisons), so `im`, `or`, `an`, `en`, `ed`, `re`, `ne`, `ar` win wherever no long rival overlaps
  them. Its most used pieces without spaces are `the`, `and`, `to`, `it`, `at`, `ed`, `re`, `an`, `be`, `en`, `she`.
- **named by ways in** gains 0 to 3 points of cleanliness and 0 to 2 of coverage. Ways in are spread over so many
  pieces (W is in the tens of thousands) that even a common piece costs about 2.8 to name, so short words still
  don't pay.

| | clean: cheapest, support, named | coverage: cheapest, support, named | words whole: cheapest, support, named |
|---|---|---|---|
| *Buster*, no spaces | 75, 56, 76 | 41, 66, 43 | 12, 31, 14 |
| *Buster*, no spaces, rest | 77, 52, 78 | 46, 77, 47 | 12, 35, 14 |
| *Alice*, no spaces | 69, 52, 71 | 52, 77, 54 | 13, 32, 16 |
| *Alice*, no spaces, rest | 67, 50, 70 | 56, 83, 56 | 14, 33, 15 |
| *Buster*, spaces | 79, 55, 79 | 48, 58, 48 | 16, 28, 16 |
| *Alice*, spaces | 77, 52, 77 | 59, 73, 59 | 20, 36, 21 |

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | named by ways in is best; clean above 80% without spaces; much more coverage | **Wrong.** Almost no change. |
| 2 | support cleans slips where a clean rival overlaps; less coverage than cheapest | **Half right.** It cleans those slips, but coverage is much *higher*, not lower, and short fragments get in. |
| 3 | with rest, both better | Support's coverage rises with rest (to 77 to 83%), its clean share dips slightly. Named about the same. |

## Against the success and failure criteria

**Neither reading meets the criterion as written**: support's gain is in coverage and whole words, not in the clean
share, which falls. But support is the first reading in C114 to C116 whose cuts *overall* are well clear of chance,
and it reads two to three times as many words whole.

## What this says

1. **Competition between overlapping rivals is the right shape for reading, once the candidates come from
   differentiation.** In C112, built up from letters, it made things worse. Here it fixes exactly the slips C115
   diagnosed, from AMP's own rule.
2. **Ways in alone over-rewards short pieces.** A two-letter piece is formed by more comparisons than any word, so it
   wins wherever nothing longer overlaps it. AMP's invoke notes give support two readings: "counted part minus missing
   part" (how much of the piece the input backs, which is its length on a full match) and "how many ways in". This
   sketch used only the second, and C112 used the first then the second. The open question is how the two combine,
   and it is a design question for the owner, not one to settle by tuning.
3. Naming by how often is not enough by itself here: the counts are spread too thin for short words to come out cheap.

## Givens to keep in mind

- Ways in: each comparison that forms a piece, or forms it again, adds one. Reading doesn't add ways in.
- Support reading: every held piece matching the utterance is a candidate. They are resolved from the most ways in
  down, equal support is resolved together, and a held tie blocks its lower rivals. The reading is the outermost
  winners.
- All three readings read the same memory at the same moment. Learning is exactly C114's or C115's.
