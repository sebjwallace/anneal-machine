# amp (branch l1a-reading: the fresh start)

Starting again from first principles: populations, and reading into them, which forms bonds. This is sequence
memory, one community's worth (L1A); state memory (assemblies) comes later. The earlier engine is on `main`.

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

A **lull** is a run of correct predictions: from a character whose population burst, through the characters after
it that arrived primed, up to the next burst. Its length is how many predictions it got right: in X B C Y after
A B C D, B C is a lull of 1; "the " read again is a lull of 3. A lull only happens on a repeat. Lulls are what will
be cast into assemblies.

## The REPL

| Line | What it does |
|---|---|
| `a, b = population 9` | declares populations (`pop` for short) |
| `invoke "text"` | reads the text (`inv`); prints each moment, a summary line (upper case where it burst) and the lulls with their lengths |
| `bonds` | every bond, in the order formed |
| `inspect b` | a population's members, and the bonds into and out of each |
| `seed`, `seed 7` | shows or sets the seed |
| `save file.json`, `save`, `open file.json` | snapshots |

## AMT

Draws the memory as its members (`t₄`: a letter and its member number) joined by its bonds, laid out left to right,
with lines that branch out, join up and loop back. Type text and press enter: AMT reads it into its own copy of the
memory (never saved) and plays it a moment every 0.6 s. With the input empty, space pauses and plays, ← → step,
Home / End jump. Each moment shows only what it had reached. Under the text, a bracket marks each lull reached so
far (the one the moment is in highlighted), and the lines below give the lengths.

Colours: **green** arrived primed; **red** burst (every member of the population on), with the individual **picked**
in reverse; **cyan** primed for the next moment by sequence memory, with the bonds priming it; **yellow** the bond
formed this moment; **underlined** the members of the lull the moment is in, as far as it has gone; **magenta** kept for what state memory primes, once it exists.
