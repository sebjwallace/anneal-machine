# C123 · The engine reads a buffer: hypothesis

Written before running. Follows [C122](../C122-the-engine-reads/).

## Why

C122 ran the learning found so far (buffers, heat, energy, raw experience, anneal) inside a faithful copy of the engine, but
kept the engine's invoke as the way to read: one letter a moment. That was the problem that started this line of work,
not the solution found since. As the owner pointed out, the point of having our own copy was the freedom to
change the engine, and the solution hadn't been put into it, so of course the problem was still seen.

This sketch puts the solution into the engine copy. **The engine reads a whole buffer at once.** It describes the
buffer as cheaply as the states it holds allow, and what nothing covers is the heat. Learning is then done with the
engine's own structures, as in C122.

## The change to the engine

`readBuffer(letters)` in `engine.js` (listed at its top). Every held state of two or more members is a piece, matched by
its letters. A loose letter costs 1. A use of a piece costs 1 + log2(16384) / log2(26), as in C118. On a tie the longer
piece is read. The pieces read are made active (their members). Invoke and everything else is unchanged, and
`check/check.sh` still gives the same output as the Go engine (1,113 lines).

## The mechanism

As C122, with reading replaced. For each sentence (a buffer):

1. **Read** it with `readBuffer`. Runs of two or more loose letters are the hot stretches.
2. **Raw experience**: each hot stretch is declared as a word (a state and a transition over new members). Always kept.
3. **Anneal** it with the held state sharing the longest run of letters (among those sharing a three-letter run), with
   the engine's anneal (the shared part, what varies, each whole composed again, reuse first), then the same for what
   is left before and after the shared run.
4. **Energy** (one of two runs): a new piece only if k · (b − link) > b, as in C118 and C122.

No spaces. Sentences. Learnt on the first nine tenths of *Buster Brown* and of *Alice*, read on the last tenth with no
learning. 8 members per letter (the interpreter's size), and 256 to check that it makes no difference now. Reading by
letters doesn't touch members, so crosstalk shouldn't matter.

## Measures

As C122 (strict): clean, coverage, words read whole, cuts at a word boundary against chance, loose letters over the
book, assemblies.

## Predictions

1. **Close to C118** (same method, now with the engine's structures): *Buster Brown* clean about 62%, coverage about
   73%, words whole about 28%, cuts about 48% (chance 25%). *Alice* clean about 51%, coverage about 77%.
2. **It cools**: loose letters fall over the book, as in C118.
3. Members per letter make no difference to reading.
4. Without the energy rule, more assemblies and lower clean share, as in C118.
5. It may differ from C118 in a few points because the engine's anneal reuses by letters (the earliest state with the
   same letters) and composes each whole again (a composed whole is a state, so it becomes a piece reading can use),
   which C118 didn't do.

## Success and failure

- **Success:** within about 5 points of C118 on clean and coverage on both books, and it cools.
- **Failure:** well below C118. That would mean the engine's structures (members, reuse, composition) change what is
  learnt, and the difference would need explaining.
