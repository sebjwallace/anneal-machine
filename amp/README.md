# amp

The engine and interpreter for AMP. See [the brief](../docs/brief.md) and [the walkthrough](../language/walkthrough.md).

```
go run ./cmd/amp        the REPL (or pipe lines in)
go test ./...           the engine tests and the transcripts
```

| Package | What it is |
|---|---|
| `engine` | the memory: populations and communities so far, with the operations on them still to come |
| `interpreter` | reads a line of AMP, carries it out on the engine, prints the result back in AMP |
| `cmd/amp` | the REPL |

**Transcripts.** Each file in `interpreter/testdata` is a REPL session on a fresh engine. A line starting `amp> ` is
typed, and the lines after it are what must print back, exactly. A new walkthrough step starts as a transcript.

**Built so far:** walkthrough step 1, populations and communities.
