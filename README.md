# Anneal machine

> *The brain does much more than just recollect. It intercompares, it synthesizes, it analyzes, it generates abstractions.*
>
> Carl Sagan, *Cosmos*, episode 11, "The Persistence of Memory" (1980)

**A machine that learns by heating and settling: structure forms where it lowers energy, and cools into memory.**

**New here? Read [`docs/state.md`](docs/state.md) first:** where everything stands, what works, what doesn't, and why.

## The idea, plainly
Anneal learns from what it sees with one rule: **keep whatever makes the whole description cheapest.**
- A picture it can't explain is heat. To cool it, the machine stores what it saw, then at rest compares memories with each other: what they share becomes a part, recurring arrangements of parts become bigger things, and anything that doesn't pay its way is taken apart again.
- Everything is priced in one currency taken from the world (a pixel, a placement), so there are no hand-set weights.
- No backpropagation, no optimiser, no training set: it learns online, from nothing, on a CPU.

So far, from pictures alone, it can:
- learn shapes and objects;
- recognise them anywhere and in any number;
- hold them as sparse cells (assemblies);
- rebuild a whole thing from part of it;
- learn how things change from one moment to the next, and apply a change it learnt in one place to places it has never seen;
- hold one form with a piece that varies (kinds), so one change covers every version.

Not yet: busy scenes, and whole scenes as one memory (see `docs/state.md`).

## The language
The main line is now **the language**, in [`language/`](language/README.md): a notation for the machine (members, edges and gates, assemblies, completion, competition, and how heat forms and breaks structure), precise enough that an interpreter could one day run it. For now it is markdown only. The old core code (`src/`) has been retired; see [decision 010](docs/decisions/010-language-replaces-core.md).

## Layout
```
language/     the main line: the notation for the machine
experiments/  experiments, kept as they were, code copies and all
sandbox/      a user-facing workbench built on the retired core (no longer runs as is)
docs/         principles, theories, decisions, research, ideas, backlog
```

## Status
Early research, in the open. What's solid and what's still a choice is written down in `docs/`.

## Licence
- Code: Apache 2.0 (`LICENSE`).
- Writing in `docs/` and the READMEs: CC BY 4.0 (`LICENSE-docs`).
