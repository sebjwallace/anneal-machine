# C80 · Reading from letters, one region: findings

> **How not to do time ([decision 009](../../../docs/decisions/009-no-context-in-cells.md)).** This experiment carries
> context in which cell fires (HTM-style temporal memory), or builds on something that does. The owner has ruled that
> out: it is brittle, and these results are kept as the evidence. Read the numbers as measurements, not as a direction.

Test seeds 101-105, settings fixed in [PREREG.txt](PREREG.txt) after development seed 1 (one change declared there).
Output: `out.txt`. The cells engine: [experiments/cells-engine](../../cells-engine/).

## Results (last quarter of one reading; first quarter in brackets)

| | with spaces: cells | with spaces: one cell per letter | without spaces: cells | without spaces: one cell per letter |
|---|---|---|---|---|
| inside words: next letter right | 98% (80) | 100% (94) | 98% (80) | 100% (90) |
| inside words: predicted alone (sharp) | **75%** (62) | 38% (37) | **67%** (55) | 27% (26) |
| letters predicted, inside words / at first letters | 1.3 / 4.6 | 3.2 / 8.0 | 1.7 / 4.4 | 4.3 / 8.2 |
| boundaries where the breadth peaks: precision / recall | 84 / 96% | 65 / 79% | **76 / 83%** (54 / 60) | 53 / 61% |
| boundaries from surprise alone: recall | – | – | 15% | 0% |
| segment checks per letter | 46 (32) | 102 (79) | 63 (36) | 100 (73) |
| cells used / segments | 445 / 1,047 | 20 / 137 | 477 / 1,335 | 19 / 181 |

## Predictions

| | prediction | result |
|---|---|---|
| P1 | next letter inside words right ≥ 95% | **Holds:** 98% with and without spaces. |
| P2 | sharper than one cell per letter by ≥ 25 points | **Holds:** +37 and +40. |
| P3 | without spaces, breadth peaks: precision ≥ 70%, recall ≥ 80%, ≥ 15 points above one cell per letter | **Holds:** 76 / 83%, against 53 / 61%. |
| P4 | surprise alone finds ≤ 30% of boundaries | **Holds:** 15%. |
| P5 | breadth at first letters ≥ 2.5 times inside | **Holds:** 2.6 (3.5 with spaces). |
| P6 | boundary precision rises ≥ 10 points | **Holds:** 54% → 76%. |
| P7 | work per letter grows less than 2 times | **Holds:** 1.75 times (1.4 with spaces). |

## What it means

- **One region, given only letters, learns where words are.**
  - After reading 400 short sentences once, it predicts the next letter inside a word 98% of the time, and alone two
    times in three.
  - Where its predictions are broadest, words begin: without spaces it found 83% of the word boundaries, and 76% of its
    guesses were real.
  - Nothing told it what a word is.
- **Context cells make the difference.** One cell per letter predicts the right letter too, but among three or four
  others, because "ca" means the same to it in "cat", "car" and "cart". With context cells, "ca" after "the" in one
  sentence and "ca" elsewhere become different cells. Its boundaries are 23 points worse.
- **The second kind of heat finds the words; surprise doesn't.** Once the region has read enough, it predicts every
  letter that can begin a word, so a word's first letter is rarely a surprise (15% recall). What marks the start of a
  word is that many letters were predicted and only one lit: predicted but not there, the dashed rings. That is Zellig
  Harris's "successor variety" (1955), arrived at from our own local heat.
- **The work stays small.** With context cells, each letter checks fewer segments than with one cell per letter (46-63
  against 100), because predictions are narrower. It grew by under two times over the reading, as memory grew.
- **Not yet words as assemblies.** The boundaries are found, but the words are not yet held as assemblies of their own,
  nor composed into sentences. That is the next step: the run of cells between two boundaries becomes an assembly
  (RM-3), and repeated words are cut out of the stream as shared parts (RM-8).

## Audit against the contracts (14 November 2026)
- **The boundaries are measured, not done by the machine.** Peak-picking is our code reading the region's state. The
  claim is that the region's state marks where words begin, not that the region finds them itself.
- **No energy rule:** every segment grown is kept (CTR-1 CON-1); see the cells engine's README.
- Otherwise the reading is the engine's own: no list of words, nothing given beyond the letters and the settings below.

## Given by hand (declared)
- The world: 24 words, random three-word sentences.
- 32 cells per column, context of two steps.
- The boundary measure: a peak in breadth, which reads the region's own state; the measuring is ours, not the region's.

serves: CTR-1 GOL-1, OPZ-1, CAP-2, CAP-12, CON-19; CTR-2 D-01 V1 (words no longer given).
