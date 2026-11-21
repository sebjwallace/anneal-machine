# amp

The engine and interpreter for AMP. See [the brief](../docs/brief.md) and [the walkthrough](../language/walkthrough.md).

```
go run ./cmd/amp                     the REPL (or pipe lines in)
go run ./cmd/amp walkthrough.json    the REPL, opening a saved snapshot first
go run ./cmd/amt walkthrough.json    AMT: watch the snapshot amp saves, invoke, and step through moments
go test ./...                        the engine tests, the snapshot tests and the transcripts
```

**AMT** (the terminal interface) opens a snapshot and reloads it whenever `amp` saves, so run it beside `amp`. Type
the input to an invoke (`c, {a, t}`) and press enter: the moments play, one every 0.6 s, and if something is held
they keep going round its repeating moments, so an assembly can be watched reverberating. With the input empty, space
pauses and plays, ← → pause and step, Home / End jump to the first / last. Each population is a row of its members, ● active, ◐ refractory, · ready; each assembly shows
how much of it is counted; the moment table is the one `amp` prints, with the moment shown highlighted. Tab shows
every assembly and the phases of its members. Esc or Ctrl-C quits. AMT only reads: its invokes run on its own copy and
are never saved.

**Keys.** At a terminal, lines edit as in a shell: ← → move, ↑ ↓ go through earlier lines (kept between sessions in
`~/.amp_history`), Ctrl-R searches them, Ctrl-A / Ctrl-E jump to the start / end. `exit`, Ctrl-C or Ctrl-D quits.
Line editing comes from [liner](https://github.com/peterh/liner).

**Saving.** `save walkthrough.json` writes what the memory holds to a JSON snapshot; `open walkthrough.json` replaces
the memory with it. The file last opened or saved (or given when starting `amp`) is the current file, and `save` on
its own saves to it. A snapshot holds declarations (and later assemblies), not what is active, so an opened memory
starts with nothing on. The file name is the rest of the line.

| Package | What it is |
|---|---|
| `engine` | the memory (populations and communities so far) and the operations on it (invoke so far; anneal to come) |
| `interpreter` | reads a line of AMP, carries it out on the engine, prints the result back in AMP |
| `snapshot` | saves the memory to a JSON file and opens it again, rebuilding it through the engine's own rules |
| `cmd/amp` | the REPL |
| `cmd/amt` | AMT, the terminal interface ([Bubble Tea](https://github.com/charmbracelet/bubbletea)) |

**Transcripts.** Each file in `interpreter/testdata` is a REPL session on a fresh engine. A line starting `amp> ` is
typed, and the lines after it are what must print back, exactly. A new walkthrough step starts as a transcript.

**Comparing.** `compare thedog, thecat` compares any declared names by the populations they cover (an assembly by
its members' populations, a community by its populations): intersection ∩, union ∪, both differences −, symmetric
difference △, each with its count, and whether either is a subset ⊆ of the other. With more than two, the
intersection and union of them all. It only reads.

**Starting afresh.** `reset` lets go of all activity: nothing active or refractory. What the memory knows, the
settings and the clock stay as they are, so the next invoke starts from a quiet memory without reopening the file.

**Listing assemblies.** `assemblies` lists every assembly in the order formed, 20 to a page (`#1 cat <c, a, t>`);
`assemblies 2` shows the second page, and the last line says which page this is and what to type for the next.
`inspect cat` shows one assembly's members.

**Seeing the phases.** `phases on` makes each invoke also print a table with one row per moment and one column per
population, one mark per member (● active, ◦ primed, · ready, a blank for refractory), so reading down shows how activity moves. Off by
default, and not saved: it is about what amp prints, not what the memory holds.

**The budget** is a setting too, off by default: `budget 4` lets recall have at most 4 members of each population
active at once (input from the world isn't limited); `budget off` removes it; `budget` shows it. Saved in snapshots.

**The refractory period** is a setting, off by default: `refractory on` / `refractory off` (`refractory` shows it).
It is saved in snapshots, and AMT shows it in its title line. The transcripts written for walkthrough step 4 onwards
turn it on in their first line.

**Built so far:** walkthrough step 1, populations and communities (several populations at once:
`a, b, c = population 8`); step 2, `invoke` (one moment per comma, braces
for together) and `inspect`; and assemblies written by hand, as in step 9: `cat = <c, a, t> ; c -> a -> t`, or
for short `cat = <c -> a -> t>`. Composition: an assembly's name inside a declaration is a part, as in
`thedog = <the -> dog>`; a whole binds the fewest members of each part that still complete it, and a chain joins parts
last member to first. Decomposition: `ca = <cat{c, a}>` forms an assembly over just those members of cat, beside it. Intersection:
`the = intr thedog, thecat` forms what they share, taken from the first; difference: `dog = diff thedog, the` forms what
the first has that the rest don't, letters taken away in order. Short forms: `pop`, `com`, `intr`, `diff`, `inv`,
`insp`, `annl`.

**Reading text.** `invoke "the cat"` reads the text one character a moment, a space as the population `_`, declaring
any letter not seen before (8 members). Letters and spaces only, for now.

**Annealing.** `anneal thedog, thecat` compares stored wholes and forms, beside them and unnamed: the part they share,
what varies in each, and each whole again from those parts. `inspect #9` looks at an assembly that has no name. Each
population hands out its members in order and goes round again once all are used; everything on one line shares
members; `inspect cat` shows them. Step 4: invoke runs the gates, with every bond acting one moment later, members
active, refractory or ready, and an assembly completing when more of it is counted than missing. Competition: rivals
share a population but not its member; most support opens; a tie is held and none of the tied open.
