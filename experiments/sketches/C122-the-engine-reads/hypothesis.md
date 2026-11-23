# C122 · The engine reads: hypothesis

Written before running (after the engine copy was built and checked). Follows C114 to C121.

## The question

C114 to C121 learnt by differentiation (compare wholes, form the shared run and what varies) and read by "cheapest
description", a calculation over the whole sentence that the engine doesn't do. The engine reads by **invoke**:
letters arrive one a moment, gates open on what is counted, competition decides between rivals, and input a gate
expects turns on only the expected members. **When the learning from C118 (heat, energy, raw experience kept) is
done with the engine's own parts, and reading is the engine's own invoke, does it still find the patterns?**

## The engine copy

`engine.js` is a JavaScript copy of `amp/engine` on `main`: populations and members, the two shapes (a state and a
transition), members handed out in order round each population, invoke with its gates, expectation and competition,
the refractory period as a setting, and anneal. It is checked against the Go engine by `check/check.sh`: eleven
scenarios (the competition and book transcripts, anneal then reading, and eight random ones with the refractory
period on and off) give the same output from both, moment by moment (1,113 lines, no difference). Its departures are
listed at the top of `engine.js`. None changes what a moment does.

## The mechanism

Populations: one per letter, 8 members each (the size the interpreter gives a population declared for reading). No
spaces. The refractory period off (the engine's default). Text cut at sentence ends, as in C114 to C121.

For each sentence, after a reset:

1. **Read.** Invoke the sentence, one letter a moment. Two letters next to each other are **linked** when the second
   arrived because a transition gate expected it from the first (a member of the letter before, active a moment
   before). A run of linked letters is a **unit**, the engine's reading of a piece. A letter with no link either side
   is **loose**.
2. **Heat.** Runs of two or more loose letters are the hot stretches: what the engine couldn't read with what it holds.
3. **Raw experience.** Each hot stretch is declared as a word (a state and a transition over new members, as the
   interpreter declares `name = <x, y> ; x -> y`). Always kept, unjudged, as in C118.
4. **Anneal.** The hot stretch is annealed with the held state that shares the longest run of letters with it (among
   those sharing a three-letter run: choosing the partner is the experiment's, not the engine's), using the engine's
   own anneal: the shared part, what varies before and after, each whole composed again, reuse first. Then the same
   for what is left of the stretch before and after the shared run, as in C114.
5. **Energy** (one of two runs): anneal forms a new piece only if it pays, k · (b − link) > b, with k the held states
   containing its letters, b its length and link 1 + log2(16384) / log2(26), as in C118. Composition happens only when
   every piece is held. The other run has no energy rule: anneal forms everything, as on `main`.

Learning on the first nine tenths of *Buster Brown*, read with no learning on the last tenth. Measures as C117 and
C118 (strict): pieces with both edges at real word boundaries (clean), letters inside units (coverage), words read
whole, cuts at a word boundary against chance, plus heat over the book (the share of letters read loose) and the
assemblies formed. For comparison, C118's figures for *Buster Brown*, sentences, "both" (cheapest reading): clean 62%,
coverage 73%, words whole 28%, cuts at a word boundary 48% (chance 25%).

## Predictions

1. **It still finds patterns**: clean well above chance (roughly 6% for both edges), and words or patterns among the
   most read units.
2. **Worse than C118's cheapest reading**, because invoke reads left to right and commits as it goes. It can't look
   ahead, so a unit can run on past a word's end wherever a held transition carries on (`the` into `thecat` when the
   text says "thecow"). Clean roughly 40 to 55%.
3. **Crosstalk.** With 8 members per letter handed out in turn, members are shared by many assemblies. A burst of
   unexpected input turns on all 8 members of a letter, which reaches every assembly using any of them. As memory
   grows, transitions will expect letters that aren't coming, so links will appear where they shouldn't, and coverage
   will rise while cleanliness falls.
4. **It cools**: the share of loose letters falls over the book.
5. **Without the energy rule**, more assemblies and more fragments, as in C118.

## Success and failure

- **Success:** with the energy rule, clean above 40% and coverage above 40% on the unseen tenth, and it cools.
- **Failure:** reading by invoke falls near chance, or crosstalk turns every letter into one long unit.
