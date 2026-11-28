# Handoff · 2026-11-28 · learned computation

For the agent who picks this up next. The owner is moving the work into the AMP language (his separate repo,
`associative-memory-programming`), possibly in a different form. This note says where things stand, what to read, what
carries over, and how he works.

## Where things stand

Associative memory can run a whole procedure (long multiplication from one cue, with no controller) and can learn most
of what that needs from worked examples. It keeps what settles, chooses by competition, brings up earlier lessons by
association with what's in view, and adapts them where the heat is. The latest step formed abstraction from overlap:
hubs of shared relations among kept ways of working, used for completion, learned the hardest way of working (the
second row of long multiplication) in every seed. The stress test, the final adding, wasn't reached, because the
relations are held as exact offsets. The full story is in [checkpoint 14](../checkpoints/14-learned-computation.md) and
the ledger's era 9.

## Read first, in this order

1. [Checkpoint 14](../checkpoints/14-learned-computation.md): the whole arc, what held up, what didn't, what was given.
2. [Convergence and the map](../theories/convergence-and-the-map.md): the design agreed with the owner for learning
   from experience (structure over strength, one change at a time, every attempt forms structure, residue heat, no
   totals, basins), and the later exchanges on hubs and abstraction.
3. [Learning from experience](../theories/learning-from-experience.md): gradual learning and carrying knowledge forward.
4. [Schema and spatial memory](../theories/schema-and-spatial-memory.md): frames, procedures, hand-overs.
5. The [crutch register](../../experiments/crutch-register.md): every crutch, when it came in, what removed it.
6. The [contracts](../contracts/README.md): what the system and the practice must fulfil.

## What carries over to the language

The owner's idea is that learning should be composed from primitives on cell sets (overlaps, subsets and the like)
within the constraints of associative memory. Anything the JavaScript did outside that becomes either a primitive or
something visibly outside. Read C186's `memory.js` against that list:

- **In the memory already.** Completion, competition, binding on settling, copies counting, the view at the start, and
  the map (every attempt marked).
- **The code's rules reading the memory.** Which part gives way; which alternatives are tried and in what order;
  inclusion, judging a new best; completion through hubs by the most widely shared relation; and comparing pairs to
  form hubs.
- **The encoder.** Pages, padding, the working marked as a target.

The open questions (relations too exact, continuous comparing, pairs and local optima, the second volume, the ladder
beyond full working) are listed in checkpoint 14.

## How the owner works

- **Experiments.** Write the hypothesis before running, and disclose any lapse. Every experiment gets a folder with a
  hypothesis, findings, a README and its output, and the findings carry a ledger section. Declare every crutch and
  update the crutch register. Every loop that might not halt gets a step limit.
- **Commits and bundles.** Commit on `main` only when he asks. Bundle when he asks: squash everything since his last
  bundle into one commit, with a backup branch first. Keep times of day out of content (dates are fine).
- **Talking to him.** He's the guide, not in the experiments' internals. Talk through his theory, in plain words, and
  use the driving analogy rather than arithmetic details. Write voice-friendly prose (no bullets) when he's speaking.
  Give real pushback.
- **Words.** Never say "habit": speak of convergence and basins. Coin no terms without agreement, and flag working
  words. "Substrate" is agreed.
- **Sparring.** When he asks for a sparring session: short answers, each ending with a question back to calibrate.
  Once a solution is reached, return fully to methodical work.
- **Arithmetic.** It's the running example for learned computation in this repo. For the AMP language spec, use a
  domain-neutral example such as fruit.
