# C106 · The price decides the cut: hypothesis

Written before running.

## The question

Reading needs to know where to cut a stream of text into pieces. Motifs (any run of correct predictions) cut
everywhere a repeat happens, so every repeat became an abstraction, with no limit. The owner's practical step is to
take an input of any size as a **buffer** and anneal it into assemblies. With an empty memory there is nothing to
compare the buffer with except itself.

The system contract already has a rule for what is kept, which the old picture engine used and the AMP engine does
not: **a change to structure is kept only if energy falls** (CON-1), priced in one currency taken from the world, with
no hand-set numbers (CON-2). Energy is the cost of the whole description: what is stored plus what it costs to explain
the input with what is stored (DEF-1).

This sketch asks one thing: **if a buffer is compared with itself, and a piece is kept only when it makes the whole
description cheaper, are the cuts it makes sensible?** Sensible means the pieces it keeps are things a reader would
recognise: a word, part of a word, a word with its space, or a short phrase that really repeats. Not whole sentences,
and not a pile of fragments.

## Breaks the contract, on purpose (stated up front)

- The energy is a **total over the whole buffer and every stored piece**, worked out by bookkeeping. That breaks
  cells first (CON-19) and sparse, event-driven computation (CON-18). It is allowed here only because the question is
  whether this price gives good cuts, not how cells would feel it. Nothing from here goes into the engine as it is.
- Pieces are strings of letters and other pieces, not populations, members and gates.
- Search is greedy: each step takes the single move that lowers energy most (partial search, CON-12).

## The givens (so the level of puppeteering is known)

- Text is lowercase letters and spaces; a space is written `_`, as in AMP.
- The **alphabet** is the letters the buffer contains. It is the only number taken from the world.
- A **piece** is stored as a sequence of letters and older pieces. Where one piece ends is free (no end marker).
- The description of a buffer is the buffer written with letters and pieces. Using a piece replaces every
  non-overlapping occurrence of it, left to right.
- Stored pieces are **never edited** (nothing breaks): a new piece is formed only from the buffer as it now stands,
  so it can be built from older pieces, but an older piece is never rewritten to use a newer one. A variant allows the
  rewrite (as the old engine's re-describe move did), to see what it changes.
- Moves: **form** a piece from a run that repeats in the buffer; **unpack** a piece back into the buffer (only if no
  other piece is built from it). Each step tries every candidate, takes the one that lowers energy most, and stops
  when nothing lowers it.

## The prices

Two pricings, both from the docs' rule translated to text. The first is the main one.

| | a letter left as a letter | a letter stored in a piece | a use of a piece |
|---|---|---|---|
| **docs** (main) | 1 | 1 | 1 + naming which piece: log2(pieces) / log2(alphabet) |
| **names** | naming which symbol: log2(alphabet + pieces) / log2(alphabet) | same | same |

In the docs pricing a use costs 1 for "this piece, here" plus the cost of picking it out of the pieces, measured
against the cost of picking a letter out of the alphabet. In the names pricing everything costs the same, and every
new piece makes every symbol a little dearer to name.

Worked by hand for the docs pricing: a piece of m letters used k times saves about k·m − m − k·(1 + a little). So
`the_` (4 letters) pays at about 2 uses, `th` (2 letters) needs about 3, a single letter never pays, and a sentence
used once never pays.

## Texts (written for the sketch)

1. **two sentences:** "the cat sat on the mat the dog sat on the log"
2. **reader:** a short, repetitive reader about a cat, a dog and a man (about 280 characters)
3. **prose:** an ordinary paragraph about a river in flood (about 560 characters), far less repetitive
4. **buffers in turn:** the reader cut into four buffers read one after another, with memory carrying the pieces;
   then "the zebra sat on the mat" (a new word, once); then "the zebra saw the zebra and the zebra ran" (the new word
   three times in one buffer). For a later buffer the pieces already held are applied first, in the order they were
   formed (a stand-in for invoke, stated as a given); then anneal runs on what is left. Energy is the pieces formed in
   this buffer plus this buffer's description; pieces from before are never unpacked.

## Predictions

1. **Two sentences:** the first piece is the long repeat `_sat_on_the_`. After it, perhaps `the_`; little else, the
   text is too short. No sentence is stored.
2. **Reader:** `the_` (or `_the_`) is among the first pieces, then whole common words with a space (`and_`, `cat`,
   `dog`, `sat_on_the_`). Pieces will often straddle word boundaries (such as `e_` or `t_the`), because the price
   knows nothing about words; I expect this to be common and will count it.
3. **Prose:** far fewer pieces, mostly short and frequent: `the_`, `_the_`, `ed`, `ing`, `and_`. Many letters stay
   loose.
4. **Order:** the rule does **not** put the smallest pieces first. Longer repeats save more, so they come first;
   short ones like `th` form later or not at all.
5. **The names pricing** forms more, shorter pieces than the docs pricing (a use is cheaper while there are few
   pieces).
6. **Buffers in turn:** the zebra read once forms nothing for "zebra" (its letters stay loose). Read three times in
   one buffer, a piece containing `zebra` forms.
7. **Rewriting older pieces** (the variant) gives fewer, more nested pieces, because a short piece can then earn uses
   inside the longer ones.

## What would count as failure

- A piece longer than a short phrase that isn't a literal repeat, or a whole sentence stored.
- Most kept pieces being fragments a reader wouldn't recognise (two or three letters across a word boundary, like
  `t_t`), rather than words, parts of words or short repeated phrases.

Either one would mean the price doesn't give good cuts on its own, and that should be written up, not explained away.
