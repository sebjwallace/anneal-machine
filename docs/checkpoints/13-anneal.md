# 13 · (name to agree): reading a buffer whole, annealing what doesn't fit

*Covers experiments C106–C127 and their distillation, C128–C136. The engine on `main` (`amp/engine`) is unchanged.
A Go port of the learning reproduced C127 exactly and was withdrawn by the owner's decision: nothing enters the
engine, not even a hook for it, until the bookkeeping, the crutches and what is given by hand have been removed. That
work is distillation [D-03](../distillation/D-03-buffer-annealing.md), which lists every violation clause by clause
and removes them one at a time. By C136 the learning uses no index, no table, no central totals and no search through
memory, and still learns as well. Everything here lives in experiment sketches, each in its own
folder with a hypothesis, findings and output; several carry cautions added when a later experiment found a flaw in
them. The ledger's era 8 tells the same story entry by entry.*

*Some phrases below are working words from the experiments, not yet agreed or in the [glossary](../glossary.md):
"buffer", "encoder", "hot stretch", "raw experience", "differentiation", "cost as surprise", "seen again", "spelled
piece". Each
is explained in plain words where it first appears, and they are listed in the open questions for agreeing.*

## In one paragraph

The work began at a wall. Streaming text into AMP a letter at a time (the branch `l1a-reading`) could not decide where
to cut: nothing said where one piece ends and the next begins. The owner's idea was to stop streaming and take a whole
stretch of input at once (a buffer, here a sentence with its spaces removed) and anneal it into assemblies, starting
from an empty memory. Building pieces up from single letters failed in every form tried. What worked was the
opposite: hold the whole sentence as it came, and split it only by comparing it with what is already held (the shared
run, and what varies before and after it), which is what the engine's anneal already does. Two of the project's own
principles then made it learn rather than merely store. Heat: only what reading leaves unexplained is worked on.
Energy: a new piece is kept only if it makes the description cheaper. Put into a faithful copy of the engine, with the
engine able to read a whole buffer at once, it learnt as the sketches had. Then two plain mistakes in the pricing were
found and fixed. A familiar piece had cost more to use than spelling it out. And something already held was being
stored again. A final audit removed pieces that spelled strings which never occurred. The result, so far in
experiments only: from nothing, with no spaces, no lexicon and no cue for a boundary, about half of all words in unseen
text are read whole, more than half of all cuts fall at a real word gap (against a quarter by chance), "the" is
almost always read as one piece, and only 8 to 10% of unseen text is left unexplained.

## Why it matters

The project's rule is one rule: keep a change only if energy falls (CTR-1 CON-1). For text, that had never produced
words from letters without help. The checkpoints before this one built reading by streaming, with gates, competition
and completion, and it stalled exactly where a stream has to be cut. This checkpoint shows the rule doing the cutting.
Words, endings and common phrases come out of comparison and price alone, from an empty memory, online, one sentence
at a time. It also shows something about the engine. Its anneal, written for hand-given wholes, turned out to be the
right learning step. What was missing was everything around it: what to anneal (heat), what to keep (energy), and a
way to read a whole buffer.

It matters too as a record of method. Twice the work looked as if it had stalled when the real problem was a flaw in
the measuring: once in the scoring, once in the pricing. The second time, the owner spotted a result that should have
been impossible. Each fix went into a new experiment, and each flawed experiment carries a caution, so the trail stays
honest.

## The journey (how one idea led to the next)

**Price decides the cut (C106–C108).** A buffer of a few hundred characters, compared with itself from an empty memory,
keeping a piece only if the whole description gets cheaper. The cuts mostly made sense (`the`, `and`, `ing`, `was`),
and no sentence was ever stored whole. A word seen once formed nothing; seen three times in one buffer, it formed. When
each piece judged its own price, it needed to know how crowded memory was. A population of fixed size gave that, and
its size barely mattered between 24 and 256 (C108), so it behaves as part of the architecture, not a tuned number.

**Building up from a stream fails (C109–C113).** Bad early cuts (`cat_sa`) were never outcompeted (C109). A stream
built up from pairs of letters met a barrier at the bottom: a pair costs less than a pointer to it, so nothing forms
until something lets pieces grow while still tentative. Once across the barrier, the cut points of the first readings
locked in (C110). Reading densely, every overlapping piece at once, filled memory with near-copies, because every
shift of a frequent phrase pays equally (C111). AMP's pairwise competition cut worse than plain greedy reading (C112).
On four real books, greedy longest match was best, with two thirds of its cuts at word gaps, but half its pieces
started or ended inside a word (C113). The lesson: frequency can't choose where to cut, and building up locks in early
mistakes.

**Start from the whole (C114–C117).** The owner's buffer, taken literally: hold each sentence whole and split it only
by comparison with what is held. Words came out with no spaces at all. *Alice* read as `[themarchhare][interrupted]
[inagreathurry]`. Coverage was low: much of the text stayed loose. Rest, comparing held pieces with each other, added
little (C115). AMP's competition fixed some slips but let short fragments in (C116). C117 asked whether cutting at full
stops was a crutch, by cutting at fixed and random lengths instead. Full stops help but aren't what makes it work. C117
also found that C114 to C116 had scored the start and end of each sentence as clean word boundaries, which flattered
their figures by about 20 points. Scored strictly, about half the pieces had both edges at real word gaps, against
about 6% by chance.

**Heat and energy (C118–C121).** Only what reading leaves unexplained, runs of two or more loose letters (in the
experiments, "hot stretches"), is compared, and kept as it came ("raw experience"). A piece derived by comparison is
kept only if it pays. Coverage nearly doubled, half as many pieces were held, and the system cooled: the unexplained
share of each sentence fell from about 80% to about 25% over a book. Keeping raw experience out of reading made things
worse (C119). Splitting held patterns at rest into their cheapest parts gave a small alphabet of reusable pieces, but
saved only 2 to 3% (C120). The owner asked whether a minority register, slang say, would be drowned by the majority's
prices. A stretch of the King James Bible set inside *Buster Brown* learnt well with energy judged over all of memory
(`thee`, `thou`, `hath`, `unto` held), because heat keeps what is new. Judging energy locally made both registers worse
(C121). At the owner's decision, support and context stay out until this mechanism works on its own.

**Into the engine (C122–C124).** A JavaScript copy of the engine was written and checked against the Go engine on the
same scenarios, the same 1,113 lines of output moment by moment, with every departure listed at its top. C122 ran the
learning with the engine's invoke as the way to read, one letter a moment, and it failed: at 8 members per letter each
member is shared by hundreds of assemblies, and support (counted minus missing) favours short transitions. The owner
pointed out that C122 had tested the engine without the solution: the copy existed precisely so that reading could
change. C123 gave the engine a way to read a whole buffer at once, the cheapest description by the pieces it holds, and
the learning matched the sketches within 3 points on both books. Rest inside the engine added almost nothing, because
anneal already splits each hot stretch and its partner into what they share and what varies (C124).

**Familiar is cheap (C125).** Since C106 every use of a held piece had cost the same flat price, about 4 letters,
whatever the piece. So "the", 3 letters, was cheaper read as loose letters than as itself. A learnt "the" was never
used on its own, and counted as heat every time it appeared. The owner called this out as impossible for a learnt
piece. The fix is the standard principle that using something costs how surprising it is: familiar letters and pieces
are cheap, rare ones dear, with uses counted from the structure itself ("cost as surprise"). "The" was then read inside
a piece 98 to 99% of the time and cost about 1 letter, and heat on unseen text halved. A caution was added to every
experiment from C106 to C124.

**The audit (C126–C127).** The owner asked what other obvious problems were lurking. First, a hot stretch whose letters
were already held was being stored again as new raw experience: `it` 204 times and `to` 196 in *Alice*. Now it is
counted as a use of the piece already held ("seen again"). Repeats fell from thousands to single figures and memory to a
third. The energy figure was also made the agreed yardstick: what memory costs plus what unseen text costs to describe
(C126). Second, the engine copy had treated every held state as something it could read as text. That included
compositions, which anneal builds from about half of each part's members, so their letters spell strings that never
occurred ("hape", "saidin"). Now a state is a piece only when a chain over the same members spells it ("spelled
piece"), and its text is that chain's letters. About 13% of the letters held had been such phantoms. They were hardly
ever read, so the reading results stood, but they had inflated memory (C127).

**Onto the real engine, and back out (D-03).** The learning was ported to Go, using the engine's own populations,
declared assemblies and anneal, with one hook added to anneal so the energy rule could be asked before forming
anything. It reproduced C127's figures exactly on both books. It also found that the JavaScript copy let a word need
more members of a letter than its population has, wrapping round, where the real engine refuses. The owner withdrew
the port, hook and all: the learning is bookkeeping, and nothing goes into the engine until that is distilled out. D-03
lists twelve violations and an order for removing them.

**Distilling (C128–C136).** Each violation was removed in its own experiment and the result measured against the
last. Step 1 (C128) removed the two limits on the search, the top 40 partners and a depth of 30: energy moved by 0.2%,
so they did nothing but save time.

Reading was next, the deepest step, and the owner asked whether it could be done at all. In C129 the letters of a
sentence arrive one a moment, as the engine's input always has. Each held chain keeps its own evidence that its steps
came in order, through its own members' bonds. A chain that runs through to its last step has found its piece. That
needs no index and no search, and it found exactly the same pieces in the same places. Choosing between overlapping
pieces was the hard half. The engine's competition, run once over the sentence, cost up to 5%. C130 kept the
competition rule exactly (most support wins, a tie is held) and changed only what support is. It became the saving in
the currency, carried from moment to moment from the winner it continues, and competition happens as each letter
arrives. That reads exactly as the computed cheapest description, every figure equal. It is a change to the engine's
idea of support (currently counted minus missing), and it is the owner's to accept.

C131 took the anneal partner from what reading brought up: the held chain that ran furthest along the hot stretch.
At first the learning collapsed (*Alice* words whole 51% to 24%). Comparing partners showed why. The old index was
built on three-letter runs, so it never offered a partner sharing fewer than three letters: a floor of three, hidden
since C118, that every result had rested on. With the same floor the new partner matched the old. C132 found why the
floor mattered. Since C125, anneal reusing a piece had counted as a use of it, so annealing on common pairs like "th"
made them so cheap that "the" was never read. Counting a use only when a piece is read, when it explains the input,
removed the collapse and a rule with it. Without any floor, the result was within 1% of before. C132 also corrected the
yardstick. Memory plus the cost of the unseen tenth had rated the worst learning of C131 the best. The contract's own
energy is memory plus the cost of explaining everything received, so the whole book is now described, not a tenth.

C133 removed the central table of prices: each piece counts its own uses, each letter's population counts its own,
and the whole comes from the engine's own clock, the moments it has lived. A neutral yardstick, costing each unit by
how often it occurs in the whole book's description, compares learners that price differently: within half a percent.
C134 took the energy rule's count of patterns containing a piece from what is in front of the machine (the two wholes
compared, and the held chains this reading saw running over those letters) instead of an index: slightly better.

C135 took up the owner's framing of the boundary. Many **encoders** bring signals of every kind into the engine, each
declaring the populations it feeds and cutting its signal into **buffers**, chosen for the use. Cutting text at full
stops is the encoder's choice, declared at the boundary, not something given by hand inside the learning. The one
rule is that an encoder may shape the signal but never hands over what the engine is to discover, so text is never cut
at spaces. The learning doesn't depend on the encoder: sentences and paragraphs come within 1% of each other, and
windows cut through words cost 5% more. C136 made the engine copy refuse, as the real engine does, an assembly needing
more members of a letter than its population has. A stretch too long to hold in one go is held as consecutive parts
that fit, where the engine's own limit falls: 4 to 9 stretches a book, energy within about 1%. That is provisional,
because how individuals become members is still being worked out (decision 011).

## How it works (the ideas that held up)

As distilled (C136). An encoder declares the populations (the letters) and cuts the text into buffers (sentences).
For each buffer:

1. **Read as the letters arrive.** The letters come one a moment. Each held chain keeps its own evidence: a step is
   counted only if its letter just arrived and the step before was counted the moment before, in the same chain. A
   chain counted to its last step has found its piece there, if a state holds exactly the chain's members. As each
   letter arrives, the ways of explaining the buffer so far compete: the letter read loose, or a piece just found,
   each continuing whatever won where it started. Support is what a way saves against spelling every letter,
   carried from what it continues. Most support wins; a tie is held. Using a letter or a piece costs how surprising
   it is, log2((moments lived + 1) / (its uses + 1)) in letters of the alphabet, with each piece's uses counted on
   its own state and each letter's on its own population. A use is counted when something is read.
2. **Heat.** Runs of two or more loose letters are what didn't fit (an assembly needs two members).
3. **Seen again.** If one of this reading's own pieces covers exactly such a run, it counts as a use of that piece
   (its letters' uses are taken back), and nothing is stored.
4. **Keep the experience.** Otherwise the run is declared as an assembly, a state and a transition over new members,
   and always kept (CTR-1 CAP-11). A run too long for the populations is held as consecutive parts that fit.
5. **Anneal.** Compare it with the held piece whose chain ran furthest along it as it was read. Form what they share
   and what varies before and after, and compose each whole again from its parts. Reuse first. Then do the same for
   what lies before and after the shared run.
6. **Energy.** A new piece is formed only if pointing to it from every pattern in front of the machine that contains
   it (the two wholes compared, and the held chains this reading saw running over those letters) costs less than
   spelling it out in each. Otherwise nothing forms for it.

The ideas underneath: **start from the whole and differentiate**, never build up from letters. **Heat says where to
work**: what is explained is left alone, so learning cools. **Energy says what to keep**, one rule for every piece.
**The familiar is the cheapest thing to reach for.** **Only what occurred is read as text**: a recognition state is not
a spelling.

## What it showed (the numbers worth remembering)

Learnt on the first nine tenths of each book, a sentence at a time, read on the last tenth with no learning, no spaces
anywhere. Before distilling (C127), and distilled (C136: reading by bonds and carried support, partner and evidence
from reading, prices from each thing's own evidence and the clock, sentence encoder, holding what fits).

| | *Buster*: C127 | **C136** | *Alice*: C127 | **C136** |
|---|---|---|---|---|
| letters left loose in unseen text | 10% | **7%** | 8% | **7%** |
| words read whole | 43% | **43%** | 51% | **47%** |
| cuts at a real word gap (chance) | 54% (25%) | **55%** (25%) | 56% (24%) | **54%** (24%) |
| "the" read inside a piece | 98% | **98%** | 100% | **100%** |
| text read into pieces | 90% | **93%** | 92% | **93%** |
| pieces with both edges at word gaps (strict) | 34% | **30%** | 34% | **30%** |
| different patterns held | 1,094 | **1,004** | 1,387 | **1,156** |
| loose while learning, first tenth to last | 50% → 9% | **52% → 8%** | 37% → 9% | **37% → 7%** |

On the neutral yardstick (memory plus describing the whole book, each unit costed by how often it occurs in that
description), the distilled learning ends within about 1% of where distilling began (*Buster* 43,996, *Alice* 75,894;
C133 to C136 within that). The earlier tenth-only energy figures (C126 to C131) are kept in their own folders but no
longer used to judge.

Along the way: C114 found words with no spaces (*Alice* `[themarchhare][interrupted]`). C118's heat and energy nearly
doubled coverage and made learning cool. C123 showed the learning works inside the engine's own structures (63% clean
pieces against 7% with one-letter invoke). C125's cost as surprise halved unexplained text. C126's seen again cut
memory to a third.

The most read units in unseen text are what a reader would expect: `the`, `and`, `of`, `he`, `his`, `it`, `ing`, `ed`,
`to`, `had`, `was`, `you`.

## What didn't work (don't redo these without a new idea)

- **Building up from letters** (C109–C112): a barrier at the bottom, early cuts that lock in, and near-copies when
  reading densely.
- **Pairwise local competition for cutting** (C112, C116): worse than the cheapest description over the whole buffer.
- **Keeping raw experience out of reading** (C119).
- **Judging energy against a neighbourhood** (C121): a loose neighbourhood only makes every link cheaper.
- **Rest as a separate phase** (C115, C120, C124): little left to find once anneal decomposes each hot stretch.
- **Reading with invoke a letter a moment, on a learnt memory** (C122): crosstalk, and support favouring short
  transitions.
- **A flat price per piece** (C106–C124): familiar short pieces cost more than spelling them out.

## What was given by hand (how much to trust it)

Up to C127, a lot: reading by searching an index of every piece, prices from a central table, the energy rule's
count through an index over memory, the partner chosen by the experiment, two limits on the search, and a hidden floor
of three letters. That is bookkeeping and crutches (CTR-2 DEF-11, DEF-5), and it is why none of it went into the engine.

After C136, what remains is declared. The encoder (sentences; lowercase letters only) is a choice at the boundary.
Holding what fits follows the engine's own limit and is provisional (decision 011). Support as the saving in the
currency, carried, is a change to the engine's rule awaiting the owner. The engine copy's anneal still checks for reuse
by looking through every assembly, which is the engine's own bookkeeping (the Go engine does the same), a separate
distillation. Scoring against word boundaries uses the book's own spaces, which the learner never sees.

## What to show people

Run `node fits.js <folder> carroll-alice.txt sentences 8` in `experiments/sketches/C136-holding-what-fits` (the books from
NLTK's Gutenberg collection). It learns *Alice* in about a second, a sentence at a time with no spaces, and prints how
it reads the last tenth it never learnt from, with sample readings such as `[the]wo[rst][of][itwas][bu]s[ter]`: words
and endings, found with no help.

## Limits and open questions

- **Before anything goes into the engine** ([D-03](../distillation/D-03-buffer-annealing.md)): the owner's decision on
  support (the saving in the currency, carried, instead of counted minus missing); forgetting (V12: memory has no
  limit, CTR-1 CON-14); and the engine's own reuse check, which looks through every assembly.
- **How individuals become members** is still being worked out. Holding what fits (decision 011) follows the engine's
  rule as it stands.
- **Encoders and populations have to fit**: long buffers on small populations are held in parts. Harmless for text;
  another signal may make it matter.
- **Invoke on a learnt memory** (C122) still reads badly, one letter a moment with expected input switching others
  off. Reading by bonds (C129, C130) is a different way in, and how it relates to invoke for recall and completion is
  open.
- **Two-letter partners** cost about 1% (C132). Most two-letter overlaps are coincidences between words; whether the
  energy rule should see that is open.
- **Clean against coverage.** Cheap familiar pieces read more of the text in shorter, reusable parts (`hat` + `ter`),
  so about a third of pieces have both edges at word gaps. Whether that is a fault or what compression wants is open.
- **Support and context** stay out by the owner's decision until this mechanism is settled.
- **Words to agree**: buffer, encoder, hot stretch, raw experience, differentiation, cost as surprise, seen again,
  spelled piece.
- **Not yet in the ledger**: C92 to C105.

## Where it lives

- The experiments: `experiments/sketches/C106-price-decides-the-cut` to `C136-holding-what-fits`. The engine copy and
  its check against the Go engine: from `C122-the-engine-reads`; the encoders: `C135-encoders/encoders.js`.
- The distillation: [D-03](../distillation/D-03-buffer-annealing.md). Decision
  [011](../decisions/011-holding-what-fits.md), holding what fits.
- The ledger, era 8: [ledger](../ledger/ledger.md) (HYP-42 to PRB-22).
- What came before: the streaming approach and its wall, in [sequence and state](../theories/sequence-and-state.md).
