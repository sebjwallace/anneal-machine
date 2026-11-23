# C123 · The engine reads a buffer: findings

> **Caution, added after [C127](../C127-spelled-pieces/).** The engine copy here read every held state of two or more
> members as a piece, by the letters of its members. Compositions (which anneal builds from about half of each part's
> members) and long words whose repeated letters were dropped therefore became pieces spelling strings that never
> occurred, such as "hape" or "saidin": about 13% of the letters held in C126's *Buster Brown* run. They were hardly
> ever read, but they were counted in memory, offered as anneal partners and counted by the energy rule. C127 makes a
> state a piece only when a chain spells it, and finds that reading on unseen text barely changes, while memory and
> energy figures here are overstated by roughly that share.

> **Caution, added after [C125](../C125-familiar-is-cheap/).** In this experiment every use of a held piece cost the
> same price whatever the piece in reading and in the energy rule (about 4 letters), while a loose letter cost 1. So a
> familiar short piece ("the", say) could cost more to use than to spell out: it was never worth reading on its own,
> it counted as heat each time it appeared, and nothing that judged what pays could keep it as a piece. That is the wrong way
> round: an established piece should be the cheapest thing to reach for. C125 replaced the flat price with cost as
> surprise (the more familiar a letter or piece, the cheaper it is to use), and that fixed it. This is where the owner
> spotted it. Read the results here with that in mind: some may not depend on it, but anything about short pieces,
> what pays, or what counts as heat may.

Run: `node buffer.js <folder> <book> <members per letter>` (10 to 40 seconds a run; everything is in
[out.txt](out.txt)), with the folder holding the unzipped `gutenberg.zip` from NLTK's corpus collection. Read
[the hypothesis](hypothesis.md) first. `check/check.sh` still gives the same output as the Go engine (1,113 lines): the
change adds a way to read and leaves everything else as it was.

## In short

**With the solution put into the engine, the engine learns as the sketches did.** Each sentence is read whole
(`readBuffer`), what nothing explains is the heat, and the heat is annealed into the engine's own structures (states,
transitions, members, reuse, composition), with the energy rule deciding what is kept. The results match C118 within
a few points, on both books, and it cools.

| | clean | coverage | words whole | cuts at a word boundary (chance) |
|---|---|---|---|---|
| *Buster Brown*, C118 (sketch, cheapest reading) | 62% | 73% | 28% | 48% (25%) |
| *Buster Brown*, C122 (engine, invoke one letter a moment; 500 sentences) | 7% | 13% | 7% | 25% (24%) |
| ***Buster Brown*, C123 (engine, reading a buffer)** | **63%** | **71%** | **27%** | **47% (25%)** |
| *Alice*, C118 | 51% | 77% | 27% | 47% (24%) |
| ***Alice*, C123** | **54%** | **75%** | **27%** | **45% (24%)** |

C123 figures are at 8 members per letter, with the energy rule. At 256 members per letter they are within 3 points
(*Alice* clean 51%), since reading a buffer matches by letters and doesn't touch members.

- **It cools**: the share of letters read loose falls from about 85% at the start of each book to about 27% by the end.
- **The energy rule matters a lot**: without it, anneal forms everything (as on `main`), there are about three times as
  many assemblies, and the clean share falls by about 20 points (*Buster Brown* 63% to 44%, *Alice* 54% to 33%).
  Coverage rises a little.
- *Alice*, with no spaces, reads `[them][archhare][inter][rupt][edina][great][hurry]`,
  `[well][atany][rate][thedo]r[mouse]s[aidthe][hatter][wenton][looking][anxiously][round]`, `youmust[remember][remark]ed
  [theking][orill][have]you[execut]ed`. Its most read units: `said`, `theking`, `that`, `alice`, `ofthe`, `with`,
  `thequeen`, `this`, `would`, `inthe`, `thing`, `jury`, `little`, `hatter`, `voice`, `important`, `court`. The
  patterns that cross word edges, like `aidthe` and `thedo`, are still there, as in C118 and C119.

## Against the predictions

| | Predicted | Seen |
|---|---|---|
| 1 | close to C118 | **Yes**, within 3 points on every measure on both books. |
| 2 | it cools | **Yes.** |
| 3 | members per letter make no difference | **Yes** (within 3 points). |
| 4 | without the energy rule, more assemblies, lower clean | **Yes.** |
| 5 | small differences from the engine's reuse and composition | **Small, and slightly in the engine's favour on *Alice*** (+3 clean). |

## Against the success and failure criteria

**Success**: within 5 points of C118 on clean and coverage on both books, and it cools.

## What this says

1. **The solution works inside the engine.** The learning found from C106 to C121 (whole buffers, heat, raw experience,
   anneal, the energy rule) needs nothing outside the engine's own structures, once the engine can read a buffer
   whole.
2. **C122's failure was reading one letter a moment**, the old way, not the engine's structures. With the same memory
   and the same learning, reading a buffer whole gives 63% clean where invoke gave 7%.
3. **What the engine holds is now its own**: states, transitions and compositions over members. So what comes next
   (recall, completion, composition of the patterns into larger wholes, support and context) can build on it directly.
4. **Invoke still has the problems C122 found** (crosstalk at 8 members per letter, support favouring short
   transitions). They matter wherever the engine is asked to read or recall a moment at a time.

## Givens and departures to keep in mind

- `readBuffer` matches held states by their letters and takes the cheapest description, as C118's reading did. It is
  a calculation over the whole buffer, not gates opening on members: the engine's structures are used for what is
  learnt and held, and the buffer read is the new way in.
- The anneal partner is chosen by the experiment (longest shared run among held states sharing a three-letter run).
  The energy check is passed to the engine's anneal. Both are as in C122.
- No spaces. Sentences. Last tenth never learnt from.
