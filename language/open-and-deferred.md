# Open and deferred

Everything parked or unresolved in the language, in one place.

## Deferred on purpose

These are known to be needed and have been set aside until there is more to go on.

- **Latches.** What a short-lived edge is, and how it behaves differently from a bond.
- **Learning hooks.** How learning attaches to the notation.
- **Kinds of threshold.** Whether gates need anything beyond counts and the logic-gate rules.
- **Local and parallel settling.** How settling happens in many places at once.
- **The second family of heat.** Mentioned, not yet described.

## Not yet pinned down

- **Memory's room, ranking and floor.** How much memory holds, how demand is ranked at each moment, where the floor sits.
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
- The gate limit declaration (`gate limit: 8`).

## Trade-offs, likely to be declared settings

- The storage policy: when disk runs out, what is archived or deleted first, and whether archiving or deleting is the default.
- Whether a stored rank is needed to stop flipping between memory and disk (placement only, never competition).

- How much small heat to chase now versus park.
- When to let heat go.
- How much room memory has, where the floor and loading threshold sit, and how fast build-up fades.

## Backlog

- Named assemblies, so an interpreter can report which completed.
- An interpreter that runs the notation.

## Dropped

- **Breaking.** Bonds are never removed ([nothing breaks](../docs/theories/nothing-breaks.md)). With it went the need to
  define "settled" and the "contact point" for breaking.
