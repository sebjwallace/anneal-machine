# Units, flow and the states of a bond

> **Continued in [the tilting landscape](the-tilting-landscape.md),** which reverses "loops are persistence" (circulation is unresolved heat; completion is the sink), replaces latches with the slope of a landscape the units themselves tilt, and drops the bond state "latched".

A theory note, from an exchange between the owner and the assistant that went back to the owner's original wish, a
machine that teaches itself through curiosity and exploration, and read it as a problem of topology and flow. **Nothing
here has been tested.** It sets out a picture in which energy moves through a structure as a fixed budget of units,
gets stuck where the structure can't carry it, and grows new structure there. That picture turns out to fit most of
what the project already had, including composition, decomposition and learned computation.

Related: [heat as the source](heat-as-the-source.md) (the phantom, the lattice, heat spreading to a sink),
[nothing breaks](nothing-breaks.md), [assemblies first](assemblies-first.md),
[learned computation](learned-computation.md), [flow and heat](flow-and-heat.md),
[persistent assemblies](persistent-assemblies.md), the [language](../../language/README.md).

---

## 1. Growth where energy can't flow

**The owner's picture.** Members that aren't connected are drawn to each other, as if a force wanted to fill the void
between them. Picture a cluster of assemblies, overlapping a lot but not fully connected. It is low energy where it fits.
But it may have **holes**, and a hole can stop energy flowing round the cluster properly, as a broken river network makes
water crash and swirl until it finds a way through. So unsettled regions **grow**:

- **inwards**, making new routes to close a gap so energy can flow and settle;
- **outwards**, towards other clusters, pulled as though the two were drawn together, like lightning from source to sink,
  finding the path of least resistance. Or outwards into nothing, meandering.

Where energy already flows, there is no growth: it is settled there. Growth happens where things are chaotic, where
energy can't settle. Growth for its own sake isn't necessarily correct: a new connection may make things worse or better.

**The first keypress, again.** The owner hoped autonomy would fall out of this. Growth outwards from an unsettled region
happens to reach a key. The key fires, the world answers, a new assembly forms, and a connection is made. Nobody presses
anything.

**Measuring it.** The owner wants to see and measure the flow of energy through the topology: which members are hot, and
where hot members reach out to their neighbours.

**Cousins in nature (assistant).**
- **Slime mould** spreads as a network of tubes, exploring in all directions. Where two branches find food, the tubes
  between them thicken and the rest withdraw. It is known for finding efficient paths between food sources, and once
  reproduced a rough copy of the Tokyo rail network.
- **Lightning and river networks**: channels branch out from an imbalance until they connect, and then that path carries
  the flow.
- **A growing nerve fibre** has a tip that feels its way forward, following chemical trails to its target.

## 2. What the grid visuals showed

Two interactive visuals on a 2D lattice, pure topology, no assemblies:

- **Fill a hole; bridge two clusters; nothing to pull towards.** Hot points grow across a hole until heat is zero and
  growth stops by itself. Two tips grow from a hot source along a pull from a settled cluster; the first to arrive wins
  and the other lets go. With nothing to pull towards, one option is an even ripple outwards, which eventually reaches a
  key, but most of that growth is wasted.
- **Two holes, one settled, one unsettling.** Energy flows from one edge to the other through a band with a round hole,
  which flow passes around easily and stays cool, and a crack, which forces a long detour and traps heat. Growth bridges
  only the crack, and only partly: once enough routes are open, the rest causes no heat. **Holes aren't the problem.
  Only holes that block the flow get filled, and only as much as needed.**

Both were puppeteered to make them work: heat was "how much longer a route is than the straight line", with an
allowance of two extra steps the assistant chose. That number decides which holes are tolerable, and in the real design
something principled would have to set it.

**The open question from these visuals:** when a region is hot but there is nothing to be pulled towards, should it grow
evenly in every direction, or not grow until something gives it a direction? Unresolved.

## 3. The gap is not a hole in space

**The owner's correction.** Members live in high-dimensional space, so a gap may not be topological in the way the grid
draws it. A gap is where members **can't settle or complete into a coherent state, because connections or members are
missing**. The structure is unstable and can't fully settle.

**In the project's terms (assistant).** A gap is **completion that can't finish**: a gate pressed but unable to open
because a source it needs isn't there, or an assembly mostly present that can't bring back the rest. It is exactly
measurable, because every gate knows its count. A gate one short of opening is the clearest gap: almost complete, and
stuck. A gate with nothing arriving isn't a gap, just quiet. Without geometry, the other ideas translate:

- **Growth** supplies a missing source to a stuck gate.
- **The pull** between clusters is overlap, not distance: groups that share members already have a route between them.
- **Flow** is activity passing through gates that open.

## 4. How it fits the rest of the project

- **Assemblies are channels**: routes energy has learnt to take. Structure is what is left behind where the flow went.
  Completion is flow running through a channel. A stuck gate is a channel with a gap in it.
- **Composition is the bridge.** Connecting two settled assemblies so energy runs between them makes one larger whole:
  the union plus the bonds that join it, as the language already defines composition.
- **Decomposition is the trunk.** In a river network, many streams join a shared trunk. If the same structure carries
  flow for many different sources, it is the shared part, the abstraction, formed as its own assembly and used by many.
  The tributaries are the parts that vary. No cutting: this matches "nothing breaks" and "forming always makes a new
  assembly".
- **Competition**: rival channels for the same flow; most support wins; ties are held.
- **Loaded and stored**: what carries flow stays loaded; what doesn't drifts to disk.
- **Explainability**: flow through a gate is a count.

## 5. The bar of two

**The tension.** Gates open on at least two active sources. A channel drawn as a single chain can't carry anything,
because each gate only ever sees one source. That fits filling a gap (a gate one short needs one more), but it breaks
growing outwards into empty space, where one reaching connection gives the next gate only one source.

**The owner's answer.** The bar of two isn't a hard rule. It is left over from an old experiment, and the threshold could
be adaptive.

**Why it was there (assistant).** With a threshold of one, any single source opens a gate, activity spreads along every
connection and the machine floods, with everything bringing back everything (the false wakes in the segments visual).
Two is the smallest number that asks for agreement: a gate opens because things concur.

**What "adaptive" may mean.** A threshold that drifts up and down with experience is a number tuned by learning: strength
coming back. A threshold set by the gate's own structure when it forms is not, for example **a majority of its
sources** (two of three, five of eight). Nothing is tuned afterwards.

## 6. Persistent states, and flooding then draining

**The owner's original vision returns.** Years ago he pictured state machines that hold their state. When one changes,
the connected ones either stay stable, because they fit the flow, or change state so the flow can pass. This picture is
the same idea made coherent, in one currency.

**Flooding and draining (owner).** When there is high heat, lower the sparsity threshold, so the structure briefly
becomes denser and things that were too sparse to connect can. When they connect and the energy settles, raise it again
so it is sparse once more. Like water flooding a river network, carving new channels, then draining.

**This is annealing itself (assistant).** Heating metal makes it loose, so new arrangements become possible; cooling
locks in what formed. The machine's name may fit after all, for a different reason than first thought. It is also not
strength: the threshold follows the heat now, a count, not a learnt value stored on a gate. Two conditions noted: the
loosening must be **local** to where the heat is, or the whole machine floods; and whatever carried flow during the flood
must be kept before it drains, or it flips back and forth.

The owner chose not to dwell on the mechanics of flooding yet, and stepped back to the larger picture.

## 7. The minimal layers

**The owner's framing.**
1. **Topology, flow, heat.** Nodes and edges. Flow is energy moving from node to node along an edge. Heat is energy
   building up where it can't flow. Simple enough to simulate on its own.
2. **Growth.** Where heat rises, new edges grow: from two hot places drawn together, from several towards each other, or
   outwards. If energy can then flow, the heat drops.

**Additions (assistant).** A third layer later: **gates**, where energy passes a node only when enough arrives from the
right directions, which brings in assemblies, completion and logic. And layer 1 needs **sources and sinks**, places
where energy enters and leaves. Without a way out, energy builds up everywhere regardless of the topology's shape.

## 8. Energy is a budget of units that move

**The danger of cascades (owner).** Assemblies that complete hold each other on, a steady state. If two are joined by an
intermediary assembly, a further input into that junction can be enough to open it, and now all four are active. That is
composition, the same shape as an operator tying in and waiting. But each newly active assembly can tip the next, and the
chain reaction lights everything: flooding. Brains face this: runaway activity is roughly what a seizure is.

**Three guards (assistant).** Competition (rivals suppress each other) and sparsity (only so much may be on) are versions
the project already has. The third is more principled. **If energy is a quantity that moves, being active costs energy.**
A fixed amount coming in can only keep so much structure lit. Flooding becomes impossible by construction, not prevented
by a rule. The brain runs on a fixed energy budget too. Competition then follows as a consequence: assemblies compete for
limited energy.

**The owner's conclusion.** Flow must be **passed on, not accumulated**. If it accumulates, it floods; if it is passed
from member to member, it travels, and only a fixed number of things can travel. So energy is a fixed budget of
**units** that move from member to member. A unit is never in two places and never copies. The owner chose the word
"unit", as a unit of energy within the budget.

## 9. Loops, routing and latches

**Loops are persistence.** In a fixed structure, units that can't leave go round in loops. A loop that keeps going is a
steady state, and that is what a settled assembly is in this picture: energy circulating round it, holding it on. It is
Morowitz's cycle again ([heat as the source](heat-as-the-source.md)). Inputs bring units in and actions let them out, so
the budget can change.

**But a fixed structure with units flowing through it isn't computing (owner).** What allows state transitions is the
**latch**. On a member, as well as its bonds to other members, a latch points the direction of the flow: like a traffic
officer at a junction, or the points on a railway, it says which bond the energy takes. **Gates stop flow; latches route
it.**

**How latches move (owner).** Where the energy settled. When an assembly settles, its latches point the way the assembly
fell into place. If neighbouring assemblies change, the flow arriving at a junction changes, latches there may switch,
and the dynamics of all of them change until they land in a new flow state together. A change elsewhere can propagate
through the assemblies along the way, or they may stay stable.

**It can compute (assistant).** In the early 1980s, Edward Fredkin and Tommaso Toffoli showed that idealised billiard
balls moving through a fixed arrangement of walls, colliding and redirected, can compute anything an ordinary computer
can, never creating or destroying a ball. This is called **conservative logic**: computation in the routing. Conserved
units, a fixed structure and switches that steer them is a design known to be capable in principle.

## 10. One kind of bond, in different states

The word "latch" had meant two things: a temporary connection that becomes a bond if it lowers energy, and a switch that
routes flow. **The owner's answer: they are all bonds, in different states.** A passive bond is just structure. An active
bond is the latch: routing flow. A fresh bond, just made by growth, is a candidate: it may disrupt the flow or let it
settle, and only in the second case does it become a settled bond.

**Two questions, not one list (assistant).** Whether a bond has earned its place, and what it is doing right now:

| Has it earned its place? | | What is it doing now? | |
|---|---|---|---|
| **candidate** | newly grown, on trial; it lets go if it doesn't help | **latched** | carrying flow; the flow is routed through it |
| **settled** | it carried flow and stays | **idle** | structure, not in use right now |
| | | **strained** | flow arriving and pushing, but the gate at the far end won't open |

- A candidate that fails **lets go**, which isn't breaking: it was never permanent. "Nothing breaks" holds for settled
  bonds.
- A candidate can only prove itself by carrying flow, so it can be latched too.
- **Strained** fell out of the discussion: neither idle (energy presses on it) nor latched (nothing gets through). It is
  exactly where heat builds up, the stick bending before it snaps, and **where growth starts**.
- "Primed" is not used for any of these: in the language it means a gate pressed but not open.
- A bond whose assembly is stored isn't in play, but that is the assembly's state; its bonds go with it.

The owner accepted these words for now: **candidate, settled, latched, idle, strained**. "Latched" keeps the old word and
gives it its clearest meaning. It also works as a verb ("the flow latched through 4 → 7").

A third visual showed them on a lattice. Two settled assemblies as loops with units circulating. Input brings three units
up a branch. They are stuck at E because G's gate needs two sources and gets one, so E → G is strained. Candidate bonds
grow towards the other assembly, carry the flow (latched, still on trial), then settle. The budget is unchanged at the
end, and nothing is removed. The routes were scripted for clarity, not derived from rules.

## 11. This may be learned computation

How the pieces line up with the "x = 5", "x − y" example from [learned computation](learned-computation.md):

- **Writing is growth.** Input that doesn't fit leaves units stuck. The heat grows bonds until they flow, and the
  association is now structure.
- **Holding is circulation.** "x is 5" is held because units go round a settled assembly.
- **An operator ties in and waits**: a junction gate needing units from two directions.
- **Reading is flow.** When "x" arrives later, its units travel the routes that were built, and latches send them on
  towards "5".
- **The answer is where the units end up.**

Computation as routing, the conservative-logic idea, with the routes learnt rather than designed.

**Units only enter through inputs (assistant).** Units could be placed anywhere, but outside tests they shouldn't be:
choosing where they go steers the computation by hand. In the principled version, something arriving from the world
brings energy with it, and energy leaves through actions. The budget and where it sits are decided by the world and the
automaton.

**The real test is reuse.** Learning isn't finding a way through once. It is that when the same thing arrives again,
units flow straight through with no heat and no growth. And something partly similar reuses the shared trunk and grows
only the difference. If instead every input grows its own fresh path, it is an elaborate way of memorising.

## 12. Open questions

1. **Direction with nothing to pull towards**: grow evenly, or wait?
2. **Where a latch points.** "Where the energy settled" needs a local rule. One candidate is that a latch points
   towards the neighbour from which the pull of a way out is strongest. Whether that pull can be local, rather than
   global knowledge in disguise, is the question.
3. **Thresholds.** A majority of a gate's sources, set when it forms? And the flood-and-drain loosening under heat: how
   local, and how kept from flipping?
4. **What is a unit in a gate?** How many units must arrive, from how many directions, for a gate to pass them on, and
   does it pass on as many as arrive?
5. **Bringing back assemblies.** Completion used to be activity copying to every member of an assembly. With conserved
   units, a whole assembly lit needs enough units for all its members. How completion reads in units, and whether
   circulation alone gives it, is open.
6. **Words for the language.** Unit, flow and the bond states need notation the owner agrees.
