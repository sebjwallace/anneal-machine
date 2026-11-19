# Assemblies first

A theory note, from the question-and-answer exchange that followed [nothing breaks](nothing-breaks.md). **Nothing here
has been tested.** It records a second pivot. Until now the project has treated members (earlier, cells) as the main
things, with bonds hanging off them. This note makes **assemblies the first-class citizens**. Members become pivot
points that assemblies join through. That change is what lets "nothing breaks" hold up: bonds and assemblies are both
immutable, mistakes are contained in assemblies of their own, and memory stays clean without deleting anything during
learning.

Related: [nothing breaks](nothing-breaks.md) (bonds never break; warm and cold by demand),
[structure over strength](structure-over-strength.md), [how heat restructures](how-heat-restructures.md), the
[language](../../language/README.md).

---

## 1. The problem that led here

After agreeing that bonds never break, the owner raised a cost. If "cat" was bonded to "baby" at the very beginning (an
old mistake), then "baby" will always point to "cat". That pointer is wasted memory, since it no longer serves any
purpose. A busy member can end up with thousands of outgoing bonds, a good share of them old, wrong, redundant and
irrelevant. **It is the outgoing connections that carry the cost.**

The owner then asked whether members should be the first-class citizens at all, or whether assemblies should be,
with gates and members as the pivot points that assemblies join through.

## 2. Where a bond is stored decides everything

A bond has two ends: the member it comes from, and the gate it goes into. The question is which end keeps the record.

- **Sending end.** Every member keeps a list of everything it points to. "baby" carries a list that grows each time it
  turns up somewhere new, with no limit, and every stale bond on it stays in memory for as long as "baby" is in use,
  which is always.
- **Receiving end.** Each gate keeps a short list of the members that feed it, and gates have a limit (say eight). A
  guest list for a party, at most eight names. "baby" carries no list. It appears on many guest lists, but each list is
  short and belongs to the assembly that owns the gate.

**How the machine finds what "baby" feeds without a list on "baby".** Each warm gate checks its own guest list against
what is active now: how many of my eight are here, and is it at least two? That is the cheap bit-and-count check. The
work at each moment depends on how many warm gates there are, not on how many bonds "baby" has collected.

**The payoff.** The stale bond from "baby" to "cat" sits on a guest list inside an assembly. When that assembly goes
cold and moves to disk, the bond goes with it and costs no memory. **The cost of a stale bond follows the assembly
that lost, not the member that is busy.**

The assistant drew this as an interactive visual: one view with members keeping the list ("baby"'s list grows without
limit, and the bond to "cat" stays in memory even when "cat" is on disk), one with gates keeping the list ("baby" has no
list, each assembly has eight slots, and sending "cat" to disk takes its bond with it).

## 3. Assemblies first, members as pivot points

**The owner's reading.** If assemblies are the first-class citizens, members become pivot points. The member "cat"
(the letter) is used by many assemblies: "cat" among the animals, "cat" in the old nursery mistake, and so on. Each is
its own assembly with its own gates. The old mistaken assembly is **decoupled from the member**. If it loses enough
contests, or the others always outcompete it, it sinks to disk. The good "cat" assemblies stay warm. Nothing about the
member changes.

So:

- An **assembly** owns its gates, holds its bonds on its gates' guest lists, and moves between warm and cold as one
  whole.
- A **member** is little more than a name that assemblies refer to: a pivot point where assemblies meet.

## 4. The two conditions that make immutability work

The owner asked whether this means his theory (bonds need not be deleted; bonds are immutable) works out. The answer
was yes, on two conditions.

1. **Bonds are stored with the gate that receives them**, inside an assembly. A stale bond belongs to the assembly it
   was formed in, and leaves memory when that assembly sinks.
2. **Assemblies are immutable too.** Learning never adds a bond into an existing assembly's gate. It always forms a new
   assembly beside it.

**Why the second matters.** If the misreading in the mixed scene (a cat and a baby in a cot) could slip "baby" into the
gate of the good "cat" assembly, the one that wins the animal scenes, that stale bond would stay warm for ever and keep
pushing "cat" into nursery contests. If the misreading can only form a new assembly of its own, the mistake is
isolated: a separate thing that loses, sinks and takes its bonds with it. The good "cat" is never touched.

**It fits structure over strength.** Reinforcing an old memory is forming a new assembly that connects to it, not
editing the old one.

**It removes the stick problem.** The owner had pictured breaking as a stick bent until it snaps where stress is
greatest, and asked whether the stressed part of a losing assembly could be found and broken out. The stressed bonds
could be identified (in the losing assembly's gate, the sources that were active when it lost), but they don't need
finding. **They all live in the assembly that keeps losing, so the whole losing assembly goes cold.** There is nothing
to snap.

## 5. Rank, and where a number is allowed

**The owner's thought.** If an old assembly sinks because it lost many battles, that seems to need a number on the
assembly. He was content with that, because to him it is a rank, not a weight.

**The assistant's answer.** It isn't forced. What is in memory can be worked out fresh at each moment: count the votes
from what is active now, rank them, keep the top within the room available, and drop anything below the floor. An
assembly that keeps losing never makes the cut while its old contexts are around. It sinks because it isn't wanted now,
not because something remembers that it lost.

A stored number is needed only if history should count ("it has lost many battles"). One real reason to want it:
without any memory of the past, something could flip between memory and disk every moment.

**Where the line is.** A number that only decides **where an assembly lives** (memory or disk) is bookkeeping, a rank.
A number also used **in competition** (a higher rank wins more easily) is a weight stored on the assembly instead of
the bond: whatever has won finds it easier to win again. The owner treated the flipping as a technical edge case rather
than part of the theory.

## 6. Deletion comes back, but only as a storage policy

**The owner's point.** The one remaining open question is disk size, and it depends on policy. If something has been
cold for long enough, it can be archived or deleted. For example: if the disk space allocated to the engine runs out,
the coldest structure is deleted or archived.

**So bonds do get destroyed, just not in the way first thought.**

- **Not during learning.** Heat never frees or snaps a bond. Learning only adds new assemblies.
- **Only as housekeeping.** Structure so cold and forgotten that it is taking space it will never repay can be archived
  or removed, whole assemblies at a time, by a storage policy that sits outside learning.

Forgetting therefore happens in two steps with different causes. **Going cold** is the machine's own dynamics: losing
to more wanted structure. **Being deleted** is a policy about storage: what to do when room runs out.

## 7. What changes in the picture

| Before | Now |
|---|---|
| Members (cells) are the main things; bonds hang off them | Assemblies are the main things; members are pivot points |
| A member keeps its outgoing bonds | A gate keeps its incoming bonds, at most eight |
| Learning may add bonds to existing structure | Learning only forms new assemblies; bonds and assemblies are immutable |
| A mistake is a bond that must be broken | A mistake is an assembly that loses and goes cold |
| Forgetting is breaking | Forgetting is going cold; deletion is a storage policy for the coldest |

## 8. Open questions and what would test it

1. **The core test.** Build the mixed "cot"/"cat" scenes. Never remove anything during learning. Does "cat" stop winning
   in nursery scenes while still winning in animal scenes, and does memory stay bounded?
2. **Reaching cold structure.** Ordinary cues only find warm gates. Can a cold assembly ever be brought back, and how:
   a deliberate search of disk when heat can't be cooled by what is warm? Without it, "hard to reach" becomes "gone".
3. **Forming always new.** If every learning step forms a new assembly, how many assemblies does a run produce, and is
   that affordable? What exactly does the new assembly contain when it reinforces an old one?
4. **The gate limit.** What size works, and is a fixed limit right for every gate?
5. **Flipping.** Does present-moment demand alone flip things in and out too often? If a stored rank is added, it must
   only decide where things live, never who wins.
6. **The storage policy.** When disk runs out, what goes first, and is archiving (recoverable) or deleting (not) the
   default?
