# C125 · Familiar is cheap: hypothesis

Written before running. Follows [C123](../C123-the-engine-reads-a-buffer/) and [C124](../C124-rest-in-the-engine/).

## The problem

In every run since C106, using a held piece cost 1 + log2(N) / log2(alphabet), about 4 letters at a memory of
16,384, whatever the piece. A loose letter cost 1. So reading "the" as three loose letters (3) was cheaper than using
the held assembly for "the" (4). Even once "the" was learnt, reading never chose it on its own, and those three letters
were read loose, so they counted as heat, as though never seen. And the energy rule could never keep "the" as a piece:
it saves 3 letters and costs 4 to point to, however often it occurs.

The owner's point: an established, well-used piece must be cheaper to point to than to be surprised by. Anything else
is the wrong way round. The cost of a piece should fall as it becomes familiar.

## The fixes tried (nothing new invented)

1. **as before** (C123): a piece costs 1 + log2(N) / log2(26) ≈ 3.98, a letter 1.
2. **no placement charge**: a piece costs only what it takes to name it among everything held, log2(N) / log2(26) ≈
   2.98 letters. The extra 1 for placing it is dropped. "the" then just about breaks even (2.98 against 3).
3. **cost is surprise**: the standard principle from information theory. Using anything, a letter or a piece, costs
   −log2 of how often it has been used, as a share of everything used: log2(total / uses), in units of a letter of
   average surprise (divided by log2 26). Familiar things are cheap, rare things dear, letters included ("e" is cheaper
   than "z"). A thing's uses are counted from the structure: each time reading uses it, and each time a comparison
   forms or reuses it (its ways in). One extra use is added to every count, so that something new isn't impossible to
   use (the usual minimal smoothing; a given). The energy rule uses the same costs: a new piece pays if spelling it
   out in the k places it occurs costs more than storing it once and pointing to it k times at what a piece used k
   times would cost.

Everything else is C123: whole-buffer reading, heat as runs of two or more loose letters, raw experience kept, the
engine's anneal, the energy rule. No spaces. Sentences. 8 members per letter. *Buster Brown* and *Alice*, learnt on
nine tenths, read on the last.

## Measures

C123's (strict clean, coverage, words whole, cuts at a word boundary), plus heat on the unseen tenth (letters read
loose), and **how "the" is read** in the unseen tenth: inside a piece (all its letters inside one unit), or loose.

## Predictions

1. **as before**: "the" is mostly read loose or as part of longer pieces (`theking`, `ofthe`), never as `the` alone.
2. **no placement charge**: "the" read as a piece more often; short words (`and`, `was`, `she`) begin to be read.
   Coverage up, clean share down somewhat, as with a cheaper link in C124.
3. **cost is surprise**: "the" is cheap from early on and is read as a piece almost always. Common short words are
   read as themselves, and rare long runs only where they really recur. Loose letters on the unseen tenth fall well
   below C123's. It reads more words whole than the other two. The clean share should hold up better than C124's cheap
   link, because rare short scraps stay dear.

## Success and failure

- **Success:** with cost as surprise, "the" in the unseen tenth is read inside a piece at least 90% of the time, heat
  is clearly lower than C123's, and clean and words whole don't fall below C123's.
- **Failure:** "the" is still often read loose, or familiar-is-cheap floods reading with short fragments, as C124's
  cheap link did.
