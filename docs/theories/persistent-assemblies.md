# Persistent assemblies: held states that stay until something changes them

A theory note, from conversation (14 November 2026). Not yet tested. Related: [regulators and heat](regulators-and-heat.md),
the system contract's CON-18 (sparse, event-driven computation) and CAP-15 (held states as other regions' activity).

## The claim
Once a region has settled, the assemblies it settled into **stay active**. They are not recomputed with every new input;
they persist, and change only when something arrives that doesn't fit them. Those persisting assemblies are the held
states: the context, the want, where you are in a sentence or a walk. They can last a long time, and they aren't tied to
one region: anywhere something settles, what it settled into can persist.

## Why it fits
- **Event-driven (CON-18).** Work happens only where new input conflicts with what persists. Everything that still fits
  costs nothing.
- **Holding without puppeteering (CAP-15).** A held context is no longer given by hand; it is what the system settled
  into earlier, still active.
- **The one rule.** Persisting is free while it explains what arrives; a misfit against it is heat, and settling resolves
  it, by re-settling only where the misfit is.

## How it differs from today's engine
Today each picture is explained from scratch. The only thing carried from one moment to the next is the "was" cells (one
step back) and any context we give it. Persistence would carry the settled assemblies themselves forward.

## Letting go falls out of the rule (the owner's)
A persisting assembly doesn't need a rule for when to let go. As the world moves on, an assembly that no longer fits the
assemblies around it is a misfit within the wider whole, so heat builds around it, and the ordinary settling
reconfigures it: into a variant of itself, or another assembly that fits. Stable assemblies can sit anywhere in the
system; when things move, the ones that stop fitting heat up and re-settle, and the ones that still fit stay as they
are. Nothing new is needed: it is the theory folding back on itself.

The one condition: what persists must stay inside the bill. Its fit against what arrives has to be priced like any
other claim; if persisting assemblies were exempt, a stale one would never heat up, and its misfit would be masked
(CON-6).

## What to watch
- **Stale states.** Covered by the rule above, provided persistence stays priced. Never a timer.
- **Don't guess (CON-7).** Persistence mustn't turn a tie into a decision just because one option was active earlier.

## A first experiment
In the reading world (C62, C63): as the eye moves along, what it recognised persists, and each new window is explained
given what persists, re-settling only where something doesn't fit. Measured: how much work is saved, and whether the
persisting context cuts words more cleanly than reading each window from scratch.
