# amp (branch l1a-reading: the fresh start)

Starting again from first principles: populations, and reading into them, which forms bonds (L1A, sequence memory);
and casting each motif into an assembly in L1B (state memory), with no activity in L1B yet. The earlier engine is on
`main`.

```
go run ./cmd/amp                     the REPL (or pipe lines in)
go run ./cmd/amt                     AMT on a memory of its own: type text, watch it read
go run ./cmd/amt reading.json        AMT on a snapshot amp saves, opened again whenever amp saves
go test ./...                        the engine tests, the AMT tests and the transcripts
```

## Reading

`invoke "the cat"` streams the text in, one character a moment; a space is the population `_`. A letter not seen
before is declared with 9 members. Each read starts afresh: nothing is active before its first character. For each
character:

- If the moment before primed members of its population, those members are active and the population doesn't burst.
  One of them is selected (at random if several were primed).
- Otherwise the population **bursts**: every member is active, and an **individual** is picked at random. It is the
  member selected, and from now on a **member**.
- The member selected the moment before **bonds** to the member selected now, unless that bond already exists. A bond
  points one way: when its first member is active, its second is primed the moment after.

So when B bursts in X B C Y after A B C D, the new B member is bonded from X, the B member from A B C D primes C, and
the new B member bonds to that C too. A read is all or nothing: if a population that bursts has no individual left,
it is refused and nothing changes. The random picks are decided by the seed and the moment, so the same reads give the
same memory.

A **motif** is a run of correct predictions: from a character whose population burst, through the characters after
it that arrived primed, up to the next burst. Its length is how many predictions it got right: in X B C Y after
A B C D, B C is a motif of 1; "the " read again is a motif of 3. A motif only happens on a repeat. Motifs are what will
be cast into assemblies.

## Casting

When a motif ends (at the burst after it, or at the end of the read) it is **cast** into L1B, a community with
populations of its own, one for each character, 9 members each:

- If no assembly has those characters in that order yet, a new one is cast: an individual is picked in L1B for each
  character (each position its own, so `_` twice gets two members), and they are all bonded to each other, both ways.
- Each L1A member that took part **projects up** to its L1B member: the member selected at each moment, and at the
  moment that burst, also the members that primed the next one. In X B C Y after A B C D, both B members project up
  to the assembly's b.
- If an assembly already has those characters, only the projections it doesn't have yet are added. Motifs that
  overlap ("the_cat_" and "the_") are different assemblies.

With gates, members are reused: casting picks any member of the L1B population (individual or not) that isn't
already in the assembly, so L1B doesn't run out.

**Gates.** While reading, L1B is active. Each moment: a burst in L1A clears L1B; the L1B members that L1A's active
members project up to come on; an L1B member that came on stays on until the next burst; each assembly's gate counts
its own members that are on, and opens as soon as any one is counted (the owner's choice, for now: `GateOpens`); an
open gate brings on the assembly's other members the moment after, and it completes. A member shared by several
assemblies counts for each of them.

## The REPL

| Line | What it does |
|---|---|
| `a, b = population 9` | declares populations (`pop` for short) |
| `invoke "text"` | reads the text (`inv`); prints each moment, a summary line (upper case where it burst), the motifs with their lengths and what was cast |
| `bonds` | every bond, in the order formed |
| `assemblies`, `inspect #1` | L1B's assemblies; one assembly's members and the L1A members projecting up to each |
| `inspect b` | a population's members, and the bonds into and out of each |
| `seed`, `seed 7` | shows or sets the seed |
| `save file.json`, `save`, `open file.json` | snapshots |

## AMT

Draws the memory as its members (`t₄`: a letter and its member number) joined by its bonds, laid out left to right,
with lines that branch out, join up and loop back. Type text and press enter: AMT reads it into its own copy of the
memory (never saved) and plays it a moment every 0.6 s. With the input empty, space pauses and plays, ← → step,
Home / End jump. Each moment shows only what it had reached. Under the text, a bracket marks each motif reached so
far (the one the moment is in highlighted), and the lines below give the lengths.

Below the text, **L1B**: each of its populations as a 3×3 grid of its members, numbered row by row, with how many
are members under each. The shape says what a member is (· an individual, ○ a member of an assembly, ◇ a member of
the assembly selected), filled (● ◆) when it is on; the colour says why it is on (green: projected up from L1A this
moment; magenta: brought on by a gate; plain: on since earlier). Then the assemblies in the order cast, each with its
gate (shut, open with how much is counted, or complete in magenta) and its members. ↑ ↓
select an assembly; the L1A members that project up to it are marked ◆ on the graph. While a read plays, the assembly
cast or added to at the moment shown is selected, and what casting did is in yellow.

Colours: **green** arrived primed; **red** burst (every member of the population on), with the individual **picked**
in reverse; **cyan** primed for the next moment by sequence memory, with the bonds priming it; **yellow** the bond
formed this moment; **underlined** the members of the motif the moment is in, as far as it has gone; **blue** the assembly selected; **magenta** state memory: members a gate brought on (and later, L1A members primed
from L1B).
