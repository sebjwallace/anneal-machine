# The two operations

AMP has two root operations. Everything else the engine does is an effect of one of them.

**Renamed (the owner): resolve is now anneal.** The operation that forms structure from what invoke couldn't complete
takes the project's own name: heat (incompletion) becomes structure, and the memory cools into a cheaper description.
Older notes say "resolve" and `RSLV`; the mnemonic is now `ANNL`.

| Operation | What it does | Its effects |
|---|---|---|
| **invoke** | Reads. Given what is active, it lets gates open, repeatedly, until nothing new opens. It never changes structure. | completion, competition, fitting |
| **anneal** | Learns. Given an incompletion, or a set of stored assemblies, it adds structure so that the incompletion goes away. It only ever adds. | forming, in four shapes: plain forming, composition, abstraction, decomposition; and outward bonds for sequence |

The owner's framing: reading is the principal operation. Give an input; if it completes, the completion is the answer.
If it can't complete, the engine doesn't know, and that is where it learns, from inside or by looking outward.

## invoke

`invoke` either **completes** or leaves an **incompletion**, and it reports how far: completion is graded, how much of
an assembly is active (`complete 3 of 3`, `1 of 3`). As things get bigger, there will rarely be all or nothing.

- **Completion**: the gates that could open have opened, and what was active has brought back the rest of what it
  belongs to. The completed part is the answer. Invoking "hello" after "hello there" has formed brings back "there".
- **Incompletion**: something is left that nothing accounts for. That leftover is **heat**. It is the set difference
  `active − accounted` from [heat and learning](heat-and-learning.md), and invoke produces it for free, as its own
  remainder.

Underneath, invoke is one check, made by every gate: **how much of my guest list is active, and is it enough?** In set
words, `|guests ∩ active|` against the gate's threshold. Completion is that check repeated until nothing changes.
Competition is the same check when several members are after one place and only the best-supported gets it. Fitting is
the same overlap measured between two whole sets. See [invoke](invoke.md).

## anneal

`anneal` takes something to work on and adds structure. It is given one of two things:

- **the incompletion an invoke just left**: learning from the world as it happens;
- **a set of stored assemblies to compare**: finding what they share after the fact, more like sleep.

What it forms depends on the kind of incompletion. See [anneal](anneal.md). Every change it makes is kept only if
energy falls (CTR-1 CON-1), and is written to the record of changes with its cause (CTR-1 CON-20, draft).

Annealing doesn't settle a tie. When two answers are equally supported, more structure won't settle it, only more evidence will,
so the tie is held (CTR-1 CON-7).

## Composing the operations

The two are kept separate so they can be run in any order. That order is a **policy**, and it is declared per run:

- **invoke only**: no learning. For examining what the engine already knows.
- **invoke, then anneal what was left**: learning from the world as it happens.
- **anneal inside the invocation loop**: learning mid-answer.
- **anneal on its own, over stored assemblies**: quiet-time comparison.

**The anneal loops inside one invocation are the online learning.** Slow at first, because almost nothing is predicted
and almost every moment anneals; faster as it learns, because more is predicted and fewer moments need annealing.

**For reading text, the policy is anneal inside the loop** (walkthrough step 8): every moment, acting only where
there is heat, taking in what is currently held as context.

The policy is a declared setting, never picked quietly to make a test pass. The record of changes notes which policy
was running, so every new structure can be traced to the operation that formed it.

**Notation so far** ([walkthrough](walkthrough.md), [instructions](instructions.md)): `invoke {c, a, t}` for together, `invoke c, a, t` for one after
another, `anneal` for the last incompletion, `inspect c` to see inside a population.

*Provisional:* the notation for declaring a policy, and whether `anneal` must always name what it works on.
