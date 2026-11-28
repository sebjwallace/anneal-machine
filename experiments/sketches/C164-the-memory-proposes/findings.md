# C164 · The memory proposes: findings

Run: two shards side by side (`SEEDS=4 SHARD=0/2 node learn.js` and `SHARD=1/2`, about fifty minutes), then
`SEEDS=4 REPORT=1 node learn.js > out.txt`. Read [the hypothesis](hypothesis.md) first. Engine: C162's (ties pass what
all agree on). Everything learned in one continuous run; no ways of working given.

## In short

**The memory's own offers did most of the proposing.** With my replay of every stored step removed, 31 of 48 worked
examples were settled by what the memory offered: recall (3), the frames it couldn't choose between when recall
stalled (21), or those varied (7). The first multiplication in seed 1 was settled by one of the 42 frames the memory
offered from a stalled recall, and the first long row by that offer with a read held. That's the memory proposing what
to try from its own memories, rather than my code enumerating them.

**But search still ran 17 times, not once per seed,** and the end result is poor: at test, recall gave nothing for
about 90% of sums, and right answers were 0 to 11%. Far worse than the tastes, where the ways of working were handed
over.

**The reason is the important finding: binding every memory to its page makes every memory unique, so repetition can
no longer strengthen anything.** Learning by search, each worked example settles many equally good variants (in seed 1
the first addition settled 258, differing in reading order, carry place and pass-on). Earlier, identical variants
pooled their copies and the store winnowed them by repetition. Now each one is bound together with that example's own
digits, so no two memories are ever the same structure, copies never pool, and nothing gets winnowed. Every later
recall faces hundreds of near-identical memories that differ only in incidental digits and in parts that don't matter.
The tie rule passes what they agree on, but they disagree on too much. **The tastes hid this,** because handing over
one frame meant each example bound exactly one memory.

**Two smaller things fed the searches.** First, my offer mechanism only reads offers from ties that were held. When
recall stalled because several memories won at once rather than tied, it offered nothing (the first subtraction in
seed 1, for instance). That's a limit of this build, not of the idea. Second, coincidences got in: "120 × 1", with no
carries, was settled by an addition-like frame that copies the top number, which then sat in memory as a rival.

## Results

How each worked example was settled (R recall, O the memory's offer, V the offer varied, S search):

| seed | + − × L L L + − × L L L |
|---|---|
| 1 | S S O V R R O O S S S S |
| 2 | S S V O O S O R O S O O |
| 3 | S S V O O O O O V O O S |
| 4 | S S V O O O S O S O V V |

Over all seeds: recall 3, the memory's offer 21, the offer varied 7, search 17 (of 48).

| test (240 sums of each kind over 4 seeds) | right | recalled nothing |
|---|---|---|
| long first row | 2.9% | 223 |
| × one digit | 5.0% | 214 |
| + | 0.0% | 240 |
| − | 10.0% | 216 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | search once per seed; every later example by recall, the offer, or the offer varied | **Fails:** search 17 times. But the memory's own offers settled 31 of 48. |
| 2 | the same ways of working as before | **Partly:** reading and holding were found and bound, but so were many variants and some coincidences, and the store gives no single one. |
| 3 | at test, "nothing recalled" about where C162 left it | **Fails:** about 90%, against about 50%, for the reason above. |

## The ledger

**Given:** search (when the memory offers nothing that settles); the variations tried on an offer; the facts; the
encoder; the fixed architecture, including binding a frame with what was in view and C162's tie rule. **The engine:**
recall, what it offers when it stalls, settling, binding, running every test. **Disclosed:** the offers are read from
held ties only (a limit of this build, above). 4 seeds, one run.

## What it suggests next

The clash is between two things that each worked alone. Binding a frame with its page lets context choose. Repetition
pooling identical memories lets the store winnow variants down to one. Together, the first defeats the second. That
points to **keeping the frame and its contexts apart**: the frame remembered once, as one structure that every example
it settles strengthens, and each page's view remembered as a separate association that points to it. Then repetition
works on the frames, and context works on which frame to bring on. That's close to the owner's transition-memory
picture, a cue and context deciding which state completes, where the state itself is one thing, not a copy per
situation. It's a design decision, though, about how memories are built, and it's the owner's to make.
