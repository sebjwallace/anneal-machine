# C124 · Rest in the engine: hypothesis

Written before running. Follows [C120](../C120-prime-patterns/) and [C123](../C123-the-engine-reads-a-buffer/).

## The question

In C123 the engine learns from whole buffers and holds what it learns as its own assemblies. But it never splits held
patterns against each other. In the *Alice* run, `hatter` and `matter` are each held whole, and `atter` isn't held at
all, though it sits inside 11 longer patterns. C120's rest step did that splitting in a sketch: a pattern is **prime**
when no split of it lowers energy, and `atter` came out as a part when links were cheap enough.

**Does rest, put into the engine, find the parts (like `atter`), make memory cheaper, and help it read unseen text?**

## The change to the engine

`restSplit(link)` in `engine.js`. It is C120's rest, the version that adds one part at a time with its saving worked
out exactly. Every held state of two or more members is a pattern, one per set of letters. Every split of a pattern
in two gives two halves, and a half not held is a candidate. Parts are formed one at a time, the one that makes
memory cheapest first, and rest stops when none does. A part is formed as decomposition does: over the members of the
first held state that contains it, beside it, nothing cut out, reused if one with the same letters is held. Reading
(`readBuffer`) can then use it. `memoryCost(link)` counts memory the way rest does. Invoke and everything else is
unchanged (`check/check.sh`: same 1,113 lines as the Go engine).

## The runs

C123's learning on *Alice* (no spaces, sentences, energy rule, 8 members per letter, learnt on nine tenths, read on the
last), with **rest every 200 sentences and once more at the end of learning**, against no rest. At two link prices,
used for everything (reading, the energy rule, rest): **4.0** (C123's, from a memory of 16,384) and **2.3** (C120's
cheapest, from 64).

## Measures

C123's (strict clean, coverage, words whole, cuts at a word boundary against chance). **Energy** is memory's cost plus
the cost of describing the unseen tenth. Also the parts rest formed, prime patterns, the most used primes in the unseen
tenth, and whether `atter` is held and how `hatter` and `matter` are composed.

## Predictions

1. **At 4.0, rest does almost nothing** (C120: 1 to 3 parts on a whole book). `atter` isn't formed. Results as C123.
2. **At 2.3, rest forms many parts** and lowers memory's cost. `atter` is formed, and `hatter` and `matter` are
   composed from it (`h` + `atter`, `m` + `atter`).
3. **Reading at 2.3 differs from C123** with or without rest: a cheaper link means shorter pieces pay in reading too,
   so coverage rises and the clean share may fall (more short fragments read, as in C107 and C121).
4. **Rest at 2.3 lowers energy against no rest at 2.3**, by a few percent, as in C120.

## Success and failure

- **Success:** rest lowers energy against no rest at the same price, and the parts it forms are reusable patterns
  (`atter`, word endings, short words), not scraps.
- **Failure:** energy doesn't fall, or rest fills memory with scraps that make reading worse.
