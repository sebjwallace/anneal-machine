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
they keep going round its repeating moments, so a state can be watched reverberating. With the input empty, space
pauses and plays, ← → pause and step, Home / End jump to the first / last. Each population is a row of its members, ● active, ◐ refractory, · ready; each state shows
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
| `engine` | the memory (populations and communities so far) and the operations on it (invoke so far; resolve to come) |
| `interpreter` | reads a line of AMP, carries it out on the engine, prints the result back in AMP |
| `snapshot` | saves the memory to a JSON file and opens it again, rebuilding it through the engine's own rules |
| `cmd/amp` | the REPL |
| `cmd/amt` | AMT, the terminal interface ([Bubble Tea](https://github.com/charmbracelet/bubbletea)) |

**Transcripts.** Each file in `interpreter/testdata` is a REPL session on a fresh engine. A line starting `amp> ` is
typed, and the lines after it are what must print back, exactly. A new walkthrough step starts as a transcript.

**The refractory period** is a setting, off by default: `refractory on` / `refractory off` (`refractory` shows it).
It is saved in snapshots, and AMT shows it in its title line. The transcripts written for walkthrough step 4 onwards
turn it on in their first line.

**Built so far:** walkthrough step 1, populations and communities (several populations at once:
`a, b, c = population 8`); step 2, `invoke` (one moment per comma, braces
for together) and `inspect`; and assemblies written by hand, as in step 9: `cat = <c, a, t> ; c -> a -> t`, or
for short `cat = <c -> a -> t>`. Each
population hands out its members in order and goes round again once all are used; everything on one line shares
members; `inspect cat` shows them. Step 4: invoke runs the gates, with every bond acting one moment later, members
active, refractory or ready, and a state completing when more of it is counted than missing. Competition: rivals
share a population but not its member; most support opens; a tie is held and none of the tied open.
