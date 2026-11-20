# amp

The engine and interpreter for AMP. See [the brief](../docs/brief.md) and [the walkthrough](../language/walkthrough.md).

```
go run ./cmd/amp                     the REPL (or pipe lines in)
go run ./cmd/amp walkthrough.json    the REPL, opening a saved snapshot first
go test ./...                        the engine tests, the snapshot tests and the transcripts
```

**Keys.** At a terminal, lines edit as in a shell: ← → move, ↑ ↓ go through earlier lines (kept between sessions in
`~/.amp_history`), Ctrl-R searches them, Ctrl-A / Ctrl-E jump to the start / end. `exit`, Ctrl-C or Ctrl-D quits.
Line editing comes from [liner](https://github.com/peterh/liner).

**Saving.** `save walkthrough.json` writes what the memory holds to a JSON snapshot; `open walkthrough.json` replaces
the memory with it. A snapshot holds declarations (and later assemblies), not what is active, so an opened memory
starts with nothing on. The file name is the rest of the line.

| Package | What it is |
|---|---|
| `engine` | the memory (populations and communities so far) and the operations on it (invoke so far; resolve to come) |
| `interpreter` | reads a line of AMP, carries it out on the engine, prints the result back in AMP |
| `snapshot` | saves the memory to a JSON file and opens it again, rebuilding it through the engine's own rules |
| `cmd/amp` | the REPL |

**Transcripts.** Each file in `interpreter/testdata` is a REPL session on a fresh engine. A line starting `amp> ` is
typed, and the lines after it are what must print back, exactly. A new walkthrough step starts as a transcript.

**Built so far:** walkthrough step 1, populations and communities; step 2, `invoke` (one moment per comma, braces
for together) and `inspect`; and assemblies written by hand, as in step 9: `cat = <c, a, t> ; c -> a -> t`. Each
population hands out its members in order and goes round again once all are used; everything on one line shares
members; `inspect cat` shows them. Step 4: invoke runs the gates, with every bond acting one moment later, members
active, refractory or ready, and a state completing when more of it is counted than missing. Not yet: competition.
