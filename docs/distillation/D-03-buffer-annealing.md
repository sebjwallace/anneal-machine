# D-03 · Reading a buffer whole, annealing what doesn't fit

**The result being distilled.** From an empty memory, with no spaces and no lexicon, text read a sentence at a time is
described by the pieces held. What no piece explains (runs of two or more loose letters) is kept as it came and
annealed with a held piece, and a new piece is formed only if it lowers energy. Using a letter or a piece costs how
surprising it is. Final figures (C127): on unseen text 8 to 10% of letters stay loose, 43 to 51% of words are read
whole, and 54 to 56% of cuts fall at a word gap (chance about 25%). **Experiments:** C114 to C127 (C106 to C113 are the
dead ends before them). **Why this file exists:** a Go port of this learning reproduced C127 exactly, and was withdrawn
by the owner's decision. Nothing enters the engine, not even a hook for it, until the bookkeeping, the crutches and
what is given by hand are gone (DEC-11).

## Violations, clause by clause

Read against CTR-1 (the system) and CTR-2 (the practice). "The learning" is C127's `spelled.js` with its engine copy.

| | Violation | Kind (CTR-2 DEF-9) | Clauses broken | Where | How it might be removed |
|---|---|---|---|---|---|
| V1 | **Reading is a calculation over the whole buffer**: the cheapest description by an index of every piece held, by text | bookkeeping | CTR-2 CON-8; CTR-1 CON-19 (nothing looks up whole assemblies), CON-18 | `readBuffer` | reading by the engine's own activity: what comes on, completes and wins as the letters arrive. This is where the streaming work stalled (PRB-17), so it is the hardest step |
| V1b | **The choice between overlapping pieces is computed** (since C129): the cheapest path through the sentence's completions, not gates | a calculation outside the engine's rules | CTR-1 CON-19; CTR-2 CON-8 | `readByBonds` 'settle' | the engine's competition settling on the same choice; with one round of competition it currently costs up to 5% (C129) |
| V2 | **The index of pieces**: which states a chain spells, and their texts, kept in tables | bookkeeping | CTR-2 CON-8; CTR-1 CON-19 | `addPiece`, `spelledByText`, `pieceIndex` | goes with V1: a piece is whatever the engine can complete in order |
| V3 | **Cost as surprise from use counts in a table**: each letter's and piece's uses, the total, and the number of kinds, summed over all of memory | bookkeeping | CTR-2 CON-8; CTR-1 CON-19. (A count per memory is allowed by CON-9; the totals over all memory are not the engine's.) | `useOnce`, `surprise` | uses counted on each assembly as its own evidence; the price of pointing from the population's size (C108 found that works) rather than a total over memory |
| V4 | **The energy rule counts the held patterns containing a piece** through a three-letter index over all of memory | bookkeeping | CTR-2 CON-8; CTR-1 CON-19 | `keep` | the count from what the engine brings back when the piece is active: the held assemblies it completes or wakes |
| V5 | **The partner for anneal is chosen by the experiment**: among held pieces sharing a three-letter run, the 40 sharing most, then the longest shared run | given by hand; bookkeeping | CTR-2 CON-2, CON-8; CTR-1 GOL-3 (acts on its own heat) | `partnerFor` | the partner is what reading itself brought up around the hot stretch: the pieces read beside it, or what it wakes |
| V6 | **Seen again is a lookup by text** | bookkeeping | CTR-2 CON-8 | `learnFrom` | goes with V1: a stretch already held is one reading completes, so it is never hot |
| V7 | **Numbers that limit the search**: the top 40 partners; recursion stops at depth 30 | crutches (numbers chosen for speed, not from the world) | CTR-2 CON-3; CTR-1 CON-2 | `partnerFor`, `differentiate` | remove, and measure: if the result survives, they did nothing but save time |
| V8 | **Heat is a run of two or more loose letters**; a single loose letter is never heat | a rule written for the task | CTR-2 CON-3 (a rule written for a task); CTR-1 CON-6 if it masks a misfit | `learnFrom` | **not a violation**: the engine refuses an assembly of fewer than two members (`TooSmallError`), so a single loose letter can't be held or annealed alone; the rule is the engine's. Open, under V13: whether a single loose letter between pieces is a sign of a bad cut beside it |
| V13 | **A floor of three letters on anneal partners**, hidden in the three-letter index since C118: no partner sharing fewer than three letters in a row was ever offered. Found in C131 | a crutch (a number not from the world), unchosen | CTR-2 CON-3; CTR-1 CON-2 | `partnerFor` until C130; made explicit in C131 | find why annealing on a two-letter overlap leaves fragments the energy rule keeps, and fix the rule, not the floor |
| V9 | **Sentences cut at full stops** | given by hand (the world cut for the machine) | CTR-2 CON-2 | the experiment's `sentences` | C117 showed fixed lengths work about as well; a buffer cut by the machine itself (by heat, or by what it can hold) |
| V10 | **The text prepared**: lowercase letters only, spaces and punctuation removed | given by hand (the world prepared) | CTR-2 CON-2 | `sentences` | keep, declared: removing spaces makes the task harder, not easier. Punctuation and capitals as populations later |
| V11 | **Every raw stretch held as one assembly**: a whole first sentence needs as many members of a letter as it has of that letter; the copy wraps round, the engine refuses | departure from the engine (the copy); fixed architecture (population size) | CTR-1 CON-14 (memory is finite), CON-3 if a size is chosen to fit the books | engine copy `declareWord`; the Go port's 64 members | follows from V9 and the engine's own rule; whatever replaces V9 must hold what it is given |
| V12 | **Memory has no limit** | a limit not met | CTR-1 CON-14 | everywhere | forgetting by energy: what no longer pays goes |

Not violations: the books are the world; true word boundaries are used only to measure. The `+1` in cost as surprise
is the standard smoothing and goes with V3.

Already in the engine, and found while reading it for this file: anneal's reuse (`sameLetters`,
`reuseOrFormExactly`) and gate opening (`openGates`) look through every assembly held. By CTR-2 CON-8 that is
bookkeeping already in the core, a violation to distil out. It is noted here because V1 to V6 will lean on those
operations, and nothing distilled here should rest on them as if they were clean.

## Order

From the cheapest to the deepest, measuring after each against C127 (both books, the same measures):

1. **V7**, the limits on the search. Nothing should depend on them.
2. **V8**, single letters as heat.
3. **V5**, the partner from what reading brought up, not chosen.
4. **V3**, uses counted per assembly, the price of pointing from population size.
5. **V4**, the energy rule's count from what the engine brings back.
6. **V1, V2 and V6** together: reading by the engine's own activity. This is the real research. It reconnects with the
   streaming work and its open problem (PRB-17).
7. **V9, V11 and V12**: buffers the machine cuts itself, holding only what it can, and forgetting.

## Steps

| Step | Removed | Experiment | Survived? |
|---|---|---|---|
| 1 | V7, the limits on the search (top 40 partners, depth 30) | C128 | **Yes**: energy +0.2% on both books; every reading measure the same or a point better |
| 6 (taken early) | V1, V2, V6: reading by the chains' own bonds as letters arrive, no index; seen again from the reading's own completions | C129 | **Yes, with the choice still computed**: choosing by the cheapest description of the sentence, reading is identical and energy within 2%. Choosing by the engine's competition instead (no calculation) costs 0.3% to 5% (*Alice* words whole 52% to 47%). Left: the choice between overlapping pieces (V1b) |

| 6b | V1b: the choice between overlapping pieces, by the engine's competition rule with support in the currency, carried from moment to moment | C130 | **Yes**: every figure equal to the computed cheapest description on both books. Needs the owner's decision: support as the saving in the currency, instead of counted minus missing |

| 2 | V8 | — | **Not a violation**: it follows from the engine's own rule that an assembly needs two members |
| 3 | V5: the partner from what reading brought up (the held chain that ran furthest along the stretch), no index | C131 | **Partly**: the index is gone and, with a floor of three letters, partners match it (energy within 0.5%). Without the floor the learning falls (*Alice* words whole 51% to 24%). The floor was hidden in the index since C118: V13 |

| 3b | V13, the floor of three letters, by counting a use only when a piece is read (anneal's forming and reuse no longer count) | C132 | **Yes**: without any floor, energy over the whole book within 1% (+0.4%, −0.6%); *Alice* reads better, *Buster* a little worse. The floor was still worth about 1%, recorded |

**The yardstick (C131, C132).** Energy as first measured (memory plus the cost of the unseen tenth) rated the worst
learning of C131 the best. From C132 the yardstick is the contract's own (CTR-1 DEF-1): memory plus the cost of
describing everything received, with the final memory. It ranks every setting as the reading measures do.

| 4 | V3: prices from each thing's own evidence (uses on each state and each population) and the engine's own clock, no table, total or count of kinds | C133 | **Yes**: on a neutral yardstick (each unit costed by how often it occurs in the whole book's description), energy within 0.5% on both books; reading +2 to −3 points |

| 5 | V4: the energy rule's count from what is in front of the machine (the two wholes compared, and the held chains this reading saw running over the letters), no index | C134 | **Yes**: neutral energy −0.7% and −0.2%; reading within 2 points |

## Where it stands after step 5

Removed: V1, V2, V3, V4, V5, V6, V7, V13 (V8 was the engine's own rule). The learning now reads by the chains' own
bonds and the engine's competition, takes its partner and its evidence from what reading brought up, and prices from
each thing's own evidence and the engine's clock. On the neutral yardstick it is within 1% of where D-03 started, and
reads about as well (C134 against C127: *Alice* words whole 48% against 51%, *Buster* 45% against 43%).

Still to do, in what is left of D-03:
- **V1b's change to support** (C130): support as the saving in the currency, carried, instead of counted minus missing.
  The owner's decision.
- **V9, V11, V12** (step 7): buffers the machine cuts itself, holding only what it can at its population size, and
  forgetting.
- **V10**, the text prepared (lowercase letters only): kept, declared.
- **What the engine already does centrally**: anneal's reuse (`sameLetters`) and gate opening look through every
  assembly. The learning relies on anneal's reuse. That is the engine's own bookkeeping, a separate distillation.
- **A remnant**: the experiment still checks that a partner's state is marked as spelled, a mark kept by the engine
  copy's own index (`addPiece`). Reading by bonds finds pieces without it; only that check and the measures use it.

| 7a | V9, V10: cutting the signal into buffers and choosing the populations are the **encoder's** choices, at the boundary between the outside world and the engine (the owner's framing): many encoders, declared, none handing over the structure to be discovered | C135 | **Yes**: the learning doesn't depend on the encoder (sentences and paragraphs within 1% on neutral energy; windows cutting through words 5% more). Sentences are the default for language |

| 7b | V11: the copy refuses, as the engine does, an assembly needing more of a letter than its population has; a stretch too long is held as consecutive parts that fit. Provisional: how individuals become members is still open (decision 011) | C136 | **Yes**: 4 to 9 stretches per book held in parts; neutral energy +0.3% to +1.1% |

## Next step

Step 7c: V12, forgetting.
