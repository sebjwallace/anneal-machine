# Open and deferred

Everything parked or unresolved in the language, in one place.

## Deferred on purpose

These are known to be needed and have been set aside until there is more to go on.

- **Negation.** An explicit "not", only when an AMX world shows a failure that competition alone can't fix.
- **Kinds of threshold.** Whether gates need anything beyond counts and the logic-gate rules.
- **Local and parallel settling.** How settling happens in many places at once.
- **The second family of heat.** Mentioned, not yet described.

## Not yet pinned down

- **The exact cost resolve weighs.** Heat is incompletion, counted as missing, unexplained and unsettled
  ([heat and learning](heat-and-learning.md)). Resolve prefers the most complete explanation with the least added. How
  "least added" is counted (bonds, members, assemblies) is still to be written down.
- **What forms from an incompletion, exactly.** Over which members, and which of what is held comes along.
- **How the engine chooses a member** inside a population when something forms.
- **Extending a chain mid-sequence.** Assemblies are immutable, so a chain formed part-way through a word can't be
  extended: a longer chain forms beside it, or forming waits until the sequence settles.
- **Addressing a single gate** (proposed `barks{2}#4`, see [instructions](instructions.md)).
- **A population's budget.** How many members a population allows at once: a fixed number, or a share of its size.
- **Timing.** Whether every bond acts one moment later (proposed), and how long completion takes to settle.
- **The form of `resolve`.** On its own meaning the last incompletion, or always naming what it works on (`resolve last`,
  `resolve #1, #2`).
- **Inside a population.** How the engine chooses a member for an assembly. (Settled: unexpected input turns all
  members on until one is chosen; walkthrough step 2.)
- **Arrivals versus held states.** Whether transitions act on what arrives (change) rather than on what is held, so a
  count advances once per tick ([procedures](../docs/theories/procedures-from-states-and-transitions.md) §5).
- **Returning from a reused subroutine** to the right caller, and **letting go** of a loop that never exits.
- **Repeats in sequences.** How held context disambiguates what follows a repeated element ("banana").
- **RAM's room, ranking and floor.** How much RAM holds, how demand is ranked at each moment, where the floor sits.
- **The build-up on stored assemblies.** A word for it, and the settings: loading threshold and how fast it fades.
- **Forming always new.** How many assemblies that produces, and what a new assembly contains when it reinforces an old one.
- **The gate limit.** What size, and what new assembly forms when a full gate's member needs to take part in something new.
- **Fitting.** How much counts as "most", and whether fitting is a threshold or a comparison between candidates.
- **Recalled members and forming.** Whether `+` members may take part in forming new bonds.

## Provisional notation

These have meaning agreed but the exact notation not yet agreed.

- `/` for sparsity (`{…} / P`).
- Where a gate rule name sits (`{a, b} all -> c`).
- The verb statement `forms …`.
- The notation for declaring a policy.
- The instruction mnemonics as a whole ([instructions](instructions.md)).
- The gate limit declaration (`gate limit: 8`).

## Standing rules

- **No counts on bonds.** If counts were ever used to compress, a count only summarises distinct structures that
  already exist, each with its own origin, and is never incremented by repetition.

## Trade-offs, likely to be declared settings

- The policy: which order invoke and resolve run in, per run.
- The storage policy: when disk runs out, what is archived or deleted first, and whether archiving or deleting is the default.
- Whether a stored rank is needed to stop flipping between RAM and disk (placement only, never competition).

- How much small heat to chase now versus park.
- When to let heat go.
- How much room RAM has, where the floor and loading threshold sit, and how fast build-up fades.

## Backlog

- Named assemblies, so an interpreter can report which completed.
- An interpreter that runs the notation.

## Dropped

- **Breaking.** Bonds are never removed ([nothing breaks](../docs/theories/nothing-breaks.md)). With it went the need to
  define "settled" and the "contact point" for breaking.
- **Latches** as a separate kind of edge (`~>`). Holding is done by inward loops and routing by the shape of the structure;
  withdrawn until a need appears.
