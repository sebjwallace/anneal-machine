# C110 · A hot start: hypothesis

Written before running. Follows C106 to C109, and a look at the literature (below).

## Why this sketch

C106 to C109 found one failure in four forms: committing on too little evidence. Small buffers, streaming, a full
population and incumbency were all versions of it. Every one of those sketches was **cold**. Only moves that lowered
energy at once were taken (greedy), nothing tentative existed, and what formed first stayed.

Development and physics both point the other way.

- **Overproduce, then select.** The developing brain overproduces synapses and keeps those that activity stabilises
  (Changeux's selective stabilisation). PARSER, a well-known chunking model of how infants find words, makes chunks
  freely from the stream, keeps those that are met again and lets the rest fade.
- **Nucleation.** A small cluster costs more (surface) than it saves (bulk), so it dissolves. Past a critical size it
  grows. The more supersaturated the solution, the smaller the critical size. Applied to our price: a tentative piece
  seen a few times costs more than it saves. Once seen often enough, it pays, and it becomes structure. The point of
  commitment isn't set by hand: it falls out of the price.
- **Annealing.** Hot, structure is loose and can rearrange; cool, it sets. Greedy search gets stuck in local minima,
  which is the lock-in seen in C106 and C109. In brains, plasticity is high early and closes as experience settles it,
  and the closing depends on use, not on a clock.

The owner's premise already says heat drives plasticity. So the temperature shouldn't be a schedule. It should be the
heat itself: while little is explained, much is tentative and churning; as lasting pieces explain more, it cools.

## The mechanism (no buffers)

Text streams in a character at a time. Nothing is held but what is listed here.

- **Lasting pieces** (bonds): never edited, never removed. They live in a population of fixed size N. A use costs
  1 + log2(N) / log2(alphabet), as in C108.
- **Reading**: at each step, the next unit is the longest lasting piece that matches the text ahead, or else a single
  letter. (This needs a look ahead as long as the longest piece: a given.)
- **Tentative pieces** (latches): every time a unit is read, it and the unit before it make a **pair**. If that pair
  is already tentative, its sightings go up by one. If not, it becomes tentative with one sighting. Tentative pieces
  live in a small **pool of fixed size T**. When the pool is full, the tentative piece with the fewest sightings (the
  oldest on a tie) dissolves to make room. That is the only forgetting, and it is competition for room, not a decay
  rate.
- **Nucleation**: a tentative pair seen k times, whose two units cost b to spell out, becomes a lasting piece when it
  pays for itself: k · b > b + k · use (the price from C107, counting its own uses). Then it leaves the pool.
- **Composition**: units can themselves be lasting pieces, so pairs of pieces make longer pieces: `t`+`h` → `th`,
  `th`+`e` → `the`, and so on.

There is no temperature number. "Hot" is how much of the text is still read as loose letters and how fast the pool
churns. Both are measured.

**Contract notes.** No bookkeeping over the whole text: each tentative piece holds its own count, and each decision
(nucleate, dissolve) is local to one piece or to the pool. The pool and the population are fixed sizes
(architecture), and both are tested across a wide range, as C108 did. Longest-match reading is a stand-in for
completion and competition in the engine.

## The runs

- **reader:** the reader from C106 with the two zebra sentences, streamed three times over. The third time through is
  measured.
- **story:** a longer passage written for the sketch (about 2,000 characters of ordinary prose), streamed twice. The
  second time is measured.
- Sizes: pool T = 16, 64, 256, 1024; population N = 64, 256, 1024.

## Measures

- The lasting pieces, in the order they nucleate, and when.
- How the measured pass is read: which units, and how many cut inside a word (start or end between two letters).
- "The zebra sat on the mat" on the measured pass.
- How hot it is over time: the share of characters read as loose letters, and how many tentative pieces dissolve,
  per stretch of text.

## Predictions

1. **Smallest first, this time.** Pieces grow by pairing, so the first lasting pieces are short and frequent pairs:
   `e_`, `th`, `_t`, `he`. Some are fragments (`e_`, `s_`), and the longer pieces are built on them.
2. **The measured pass is read mostly in words.** On the reader, the units read are mostly whole words with a space,
   or short phrases (`_the_`, `cat_`, `sat_on_the_`). At most a few cut inside a word.
3. **The zebra sentence isn't cut through "sat".** "zebra" itself stays loose or partly built, since it is rare.
4. **It cools.** The share of loose letters and the churn of the pool are high at the start and fall.
5. **The pool size is a cliff, then flat.** Too small (16) and evidence is lost before anything pays, so little
   nucleates. From 64 up, the results are about the same.
6. **The story is harder.** It has fewer repeats, so more stays loose, but the common words (`the_`, `and_`, `was_`)
   and endings (`ing`, `ed_`) still form.

## Success and failure

- **Success:** on the reader's measured pass, most units are words or short phrases, no more than three cut inside a
  word, the zebra sentence isn't cut through "sat", and both heat measures fall over the run. On the story, common
  words form. Results hold across T = 64 to 1024.
- **Failure:** the measured pass is read in fragments, or bad early pieces lock in as in C109, or the results swing
  with T or N.

## Addendum, written after the first run and before the second

**The first run formed nothing**, in every setting. The reason is in the price, not the code. With a population of
fixed size, a use costs 1 + log2(N) / log2(alphabet): 2.96 on the reader at N = 256. Two letters cost 2 to spell out,
so a pair of letters can never pay for itself, however often it is seen (k · 2 > 2 + k · 2.96 never holds). Growing
by pairs has a **barrier** at the bottom, which is exactly what nucleation describes: the smallest clusters cost more
than they save. In physics, clusters cross the barrier while still subcritical. They exist, grow by attachment and
mostly dissolve, and only the ones that reach the critical size last. The first run let a tentative piece grow only
by first becoming lasting, so nothing could cross.

**Second run ("hot").** Everything as above, except:

- Tentative pieces seen at least twice (a repeat) **take part in reading** alongside lasting pieces: the longest
  lasting or tentative piece that fits is read. Reading a tentative piece counts as one more sighting of it.
- So tentative pieces pair with each other and with lasting pieces, and grow while still tentative (`t`+`h`, then
  `th`+`e`, ...), before anything is lasting.
- A tentative piece is judged as a whole: b is the cost of spelling it out with lasting pieces and letters (as
  cheaply as possible). It nucleates when k · b > b + k · use. So `_the_` (5 letters, b = 5) nucleates at 3 sightings.
- "Seen at least twice" is a given: the smallest number that means "met again".

**Predictions for the second run** (the predictions and criteria above otherwise stand):

1. Short tentative pieces (`th`, `e_`, `_t`) appear first and shape reading, but don't nucleate themselves. The first
   lasting pieces are whole words with a space (`the_`, `_the_`, `and_`), not fragments.
2. While hot, reading is chopped up by tentative pairs, some of them odd. As lasting pieces appear, the tentative ones
   inside them stop being met (the lasting piece is read instead), and they dissolve.
3. The risk: tentative pieces shaping reading early could lock in odd cuts, as C109 did. If the measured pass is full
   of fragments, this is the reason.
