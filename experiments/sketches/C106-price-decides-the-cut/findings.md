# C106 · The price decides the cut: findings

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece (1 plus naming it among the pieces held, so rising as memory grew), while a loose
> letter cost 1. So a familiar short piece ("the", say) could cost more to use than to spell out: it was never worth
> reading on its own, it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece.
> That is the wrong way round: an established piece should be the cheapest thing to reach for. C125 replaced the flat
> price with cost as surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. Here
> it is why single letters and most two-letter pieces could never pay, and part of why the longest repeats came first.
> Read the results here with that in mind: some may not depend on it, but anything about short pieces, what pays, or
> what counts as heat may.

Run: `node anneal.js` (about 40 seconds; everything is in [out.txt](out.txt)). `node anneal.js steps` also prints every
step for every setting. Read [the hypothesis](hypothesis.md) first: the energy here is bookkeeping over the whole buffer,
which breaks cells first on purpose. These are measurements of whether the price cuts well, not a mechanism.

## In short

On a buffer of a few hundred characters, keeping a piece only when it makes the whole description cheaper gives cuts
that mostly make sense. It never stored a sentence, and the first pieces are the ones a reader would pick: `_the_`,
`_and`, `ing`, `was_`, `_of_the_`, `_she_`. A word seen once forms nothing; seen three times in one buffer, it forms.

It fails on **small buffers**. With little text, coincidences look like structure: "sat" and "saw" share "sa", so the
cut falls inside the word (`cat_sa`, `t_on_the_`). Because pieces are never edited, and later buffers are read with
the pieces already held, **a bad early cut stays and gets used again**: "the zebra sat on the mat" is read as
`the_zebra_sa[t_on_the_]mat`. So whether the price gives good cuts depends on how much text it is given at once.

The price knows nothing about words. Where its pieces line up with words, it's because the space repeats along with
the word. Where they don't (`er_`, `_wo`, `_the_ma`), it's because the letters really do repeat there.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 two sentences | `_sat_on_the_` first, then perhaps `the_`; no sentence | **As predicted**, in all four settings. |
| 2 reader | `_the_` early, then common words with a space; cuts often across word boundaries | `_the_` first (20 uses). Then mostly literal phrases: `_and_the_dog_`, `sat_on_the_`, `_the_cat`, and the long `_the_dog_and_the_dog_` (repeated word for word twice). One fragment, `_the_ma` (from "man" and "mat"). Fewer cross-boundary cuts than predicted. |
| 3 prose | few pieces, short and frequent: `_the_`, `ed`, `ing`, `and_` | **Mostly as predicted**: 12 pieces, `_the_`, `_and`, `er_`, `_she_`, `ing`, `was_`, `_of_the_`, … `ed` did not form. 305 of 552 letters stay loose. |
| 4 order | longer repeats first; short ones like `th` late or never | **Half right.** In the two sentences the long repeat came first. In the reader and the prose the most frequent piece came first (`_the_`, 17-20 uses), because frequency times length is what saves. `th` never formed under the main pricing; a single letter (the space) never can. |
| 5 names pricing | more, shorter pieces | **As predicted**, and they are worse: `_w`, `_t`, `d_`, `er` in the prose. The docs pricing makes fewer, more sensible cuts. |
| 6 buffers in turn | "zebra" once forms nothing; three times, it forms | **As predicted.** Read once, its letters stay loose. Read three times in one buffer, `zebra_` forms. |
| 7 rewriting older pieces | fewer, more nested pieces | Under the docs pricing it **changes almost nothing** (same pieces in the prose). Under the names pricing it nests more (`at` inside `_the_cat`, `sat_on_the_`) and forms more pieces, not fewer. |

## Against the failure criteria

- **A sentence stored, or a long piece that isn't a literal repeat:** never, in any setting. The longest pieces
  (`_the_dog_and_the_dog_`, `ing_the_river_`) are word-for-word repeats in the text.
- **Most kept pieces being fragments:**
  - **Not met on a single buffer of a few hundred characters** under the main pricing. In the prose, 1 of 12 pieces is a
    fragment (`_wo`, from "woman", "wooden", "wonder", "would"). `er_` and `ing` are word endings, and
    `ing_the_river_` starts mid-word but repeats exactly.
  - **Met on small buffers.** In the reader cut into buffers of 40 to 90 characters, 4 of the 7 pieces cut inside a
    word (`cat_sa`, `t_on_the_`, `_and_the_dog_sa`, `man_sa`), and one more cuts across words oddly (`at_and_the_`).

## What this says

1. **The rule does the job motifs couldn't, with one change: a repeat must pay to be kept.** No limit was set by hand;
   the price stopped every sentence and nearly every fragment on a decent-sized buffer.
2. **Buffer size matters, and a window doesn't settle it.** The rule needs enough text in front of it for
   coincidences to be outweighed. A buffer of a sentence or two is too small. The prose (one paragraph) was fine.
3. **Early pieces lock in.** Nothing is edited and later reading uses what is held, so a cut made from too little
   evidence shapes everything after it. Two ways out, neither tried here: start with a large first buffer; or let a
   better cut form beside the bad one and outcompete it in reading (which fits "nothing breaks", but needs reading
   to choose between rival pieces, which the stand-in here doesn't do: it applies pieces in the order they formed).
4. **Rewriting older pieces barely matters under the main pricing**, so "pieces are never edited" costs little here.
5. **Frequency, not size, decides what comes first on real text.** The rule doesn't give "smallest first". It gives
   "what saves most first", which on English was `_the_`.

## Givens to keep in mind

- The energy is a total over everything, worked out each step: the contract break stated in the hypothesis.
- Reading a later buffer with what is held is a stand-in (pieces applied in the order they formed, longest-first is
  not tried), so the lock-in in point 3 is partly the stand-in's doing.
- The texts were written for the sketch and are small. Nothing here was run on ordinary text of any length.
- Search is greedy, one best move at a time; a different order might find cheaper descriptions.

## Open

- What should be the first buffer's size, or should it grow until the cuts stop changing?
- When a later buffer has a better cut than one held, how does the better one win?
- How could cells or gates feel this price locally, without a total over everything (the real question, if the price
  is kept)?
