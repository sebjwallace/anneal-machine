# invoke: completion, competition and fitting

These are not separate operations. They are what [invoke](operations.md) looks like at different scales and under
different limits. All of them come from one check made by every gate: how much of my guest list is active, and is it
enough?

## Completion

**Completion** is the engine bringing back the rest of a thing from part of it. When enough of an assembly is active to
open its gates, the missing members become active. They are marked `+` as recalled.

```
A = <1, 4, 7>
{1, 4} => {1, 4, +7}
```

`=>` reads "completes to". Completion repeats until nothing new opens. Then it has settled.

**Completion is graded.** How complete an assembly is is how much of it is active: `|assembly ∩ active|` out of
`|assembly|`. Gates decide yes or no; invoke reports the degree, and the incompletion is the part that's missing.

**When completion fills in.** Only when what is active covers enough of the assembly to open its gates. A small gap
(most of the whole present, a few members missing) is filled in. A huge gap (too little present) opens nothing, so
nothing is filled in. Small gaps filled in this way are treated as noise: reading "cxt" as "cat".

**Holding.** An assembly's inward bonds point at each other, so they form loops. Once complete, its members keep each
other on: the assembly **reverberates** and stays held until competition changes it. Held assemblies are what let
earlier things join later gates (see [edges and gates](edges-and-gates.md), and held states in C101).

**When invoke can't complete**, the leftover is heat, and [anneal](anneal.md) works on it.

## Competition

When assemblies would use the same members, or the same shared part, in different ways, they **compete**.

```
A | B
```

**Most support wins. One more is enough. Ties are held.** Support is how much of each is backed by what is active,
which in practice means how many ways in each one has. A held tie keeps both, unresolved, until more evidence settles it.

**Decided, and running in the interpreter** (`amp/interpreter/testdata/11-competition.txt`):
- **Rivals (competition by order):** two members are **alternatives** when they are in different populations and stand
  in **the same place**. Within shared structure a place is a member: following the same member (`e{1} -> d{1}` and
  `e{1} -> c{1}`, where "the dog" and "the cat" share "the"), or leading into the same one. Between words written
  separately, a place is the populations either side: "a" in "cat" and "o" in "cot" both come after a "c" and before a
  "t"; "b" in "bat" and "c" in "cat" both start a word and lead into an "a". Two assemblies are rivals when one has a
  member the other lacks, the other has one the first lacks, and those are alternatives; or when, in that moment, what
  each would bring on and the other wouldn't are alternatives. A part and its whole are never rivals, nor an assembly
  and its own chain, nor two versions of one word. Found by running it: judging place by population alone made rivals
  of letters in different places (the "t" that starts "the" and the "t" that ends "cat"; "e" before thedog's "d" and
  "r" before thebird's), which stopped "the bird" and "the cat" completing.
- **Support:** an assembly's counted part minus its missing part (gates count active and refractory members).
- **Outcome:** when rivals' gates would open in the same moment, the one with most support opens. When the most support
  is shared, the tie is held: **none of the tied open**, and the tie is unsettled heat. Worked out from the most
  support down: a rival is beaten only by one with more support that wasn't itself beaten (won, or held in a tie).
  Nothing is turned off; a rival that doesn't open fades.
- This replaces the older wording above that a held tie "keeps both": in a tie, neither is recalled. Whatever was
  already active is left to its phases.

**At two scales.** An assembly can lie within one population or span several ("cat" spans three: one member in each of
the "c", "a" and "t" populations).

- **Within a population**: members compete for a place. In the middle population of "c", something, "t", the member for
  "a" and the member for "o" can't both win.
- **Across populations**: whole assemblies compete as wholes. The clash happens in a particular population, but the
  outcome applies to the whole assembly. The winner comes on everywhere it spans, and the loser stays off everywhere.
  Whole memories win or lose together, so the answer is one complete reading, not a patchwork.

**A part is not a rival of its whole.** A part shared by two wholes (the walls shared by a house and a shed) is what
both stand on, not a competitor. Seeing the walls and a roof tile brings back the house (three of four parts against the
shed's two). Seeing the walls alone is a tie, and both are held.

**Each population has a budget.** Each population can only have a few members active at once. That is what makes
competition local and constant. An assembly holds its places until a rival with more support takes them, and changes
travel outward through the bonds. Where downstream structure is congruent with a change (an OR, fed by either route), it
stays stable. Where a change lets a rival complete, the rival takes over and that change travels on in turn. The
result can't always be predicted, but every step has an exact cause.

*Open:* how many members a population allows: a fixed number for every population, or a share of its size.

**For now, a setting (the owner's, for testing), off by default:** `budget 4` lets recall have at most 4 members of
each population active at once; `budget off` removes it; it is saved in snapshots. **Input from the world isn't
limited** (the owner's choice): members arriving take places first, and recall gets what is left. Recalled members
with the most ways in (gates opened for them) come on first; if the places run out in the middle of a tie, the tie is
held and none of the tied come on. Invoke reports it: `budget a: 1 of 2 recalled`.

Held ties matter for learning. While two structures are still contesting, both are kept, and nothing is broken.

## Fitting

A thing **fits** another when it sits inside it, or mostly does. Fitting is the same overlap, measured between two whole
sets: how much of one is in the other.

```
X fits A      most of X is in A:  |X ∩ A| is large compared with |X|
```

*Open:* how much is "most", and whether fitting is a threshold or a comparison between candidates.

## Comparison

Comparing two things uses intersection and difference. Comparison reads; it changes nothing. What it finds is what
[anneal](anneal.md) may form.

```
A ∩ B     what they share
A − B     what A has that B doesn't
B − A     what B has that A doesn't
```
