# Structure over strength

A theory note, from a conversation between the owner and the assistant. **Untested.** It records the owner's view that
reinforcement in the machine is not a bond getting stronger but a memory getting more connected: more structure around
it, every edge still simply there or not. And that structure gives more than strength alone would.

Related: [learned computation](learned-computation.md) (the language of members, bonds and gates this note uses),
[flow and heat](flow-and-heat.md) (heat as a misfit; the deep growing like coral from what fits),
[persistent assemblies](persistent-assemblies.md), [learnt logic](learnt-logic.md).

---

## 1. The claim

In most neural models, learning changes **strengths**: a connection carries a number, and each experience nudges it up or
down. Something learnt often has strong connections; something met once has weak ones.

In this machine an edge exists or it doesn't. There is no number on it. So "reinforced" has to mean something else, and
the owner's answer is: **a memory is reinforced by more structure connecting to it.** Not a stronger bond, but more bonds,
from more things that fit with it. Everything stays binary; what grows is how much is joined to what.

## 2. The owner's example: a new town

- **First visit.** Much is new. Attention goes to what surprises most, and assemblies form around those things.
- **Second visit.** The first surprises are remembered; they no longer surprise. Attention moves to what is still
  surprising, though less so, and new assemblies form there. Those new things are connected to what was noticed before:
  they fit with it.
- **Every visit after.** The same again: new structure comes in, and it interconnects with what was there.

The things first noticed are not changed. They become **reinforced because new context is built around them and bonded to
them.** Each visit adds ways into them. That is reinforcement with no strength anywhere: more connections.

## 3. What structure gives that strength doesn't

- **Robustness for free.** A memory reached by many routes survives losing any one of them: if heat breaks one bond,
  completion still reaches the memory by others. A memory met once hangs on a few bonds and is easily lost. So "hard to
  break" is not a property set on a bond (the owner considered such hardening once and stepped back from it); it is how
  much the surrounding structure holds a thing in place.
- **More ways to recall.** Each connection is a further cue that can bring the memory back. A strong single connection is
  still only one way in.
- **Meaning, not just a mark.** A strength says only "this happened often". Connections say what it happened *with*: which
  other things it fits, and how. Structure carries context; strength throws it away.
- **Speed.** With yes-or-no edges and yes-or-no activity, everything is set operations: a gate is checked by an AND and a
  count of bits, and forming or breaking a bond is setting or clearing one bit. No arithmetic on decimal weights. What
  weights would have carried is carried by structure instead, which costs memory rather than computation: usually the
  better trade on a CPU (with sparsity keeping small how much structure is touched at a time).

## 4. How it fits Hebb and heat

Hebb's rule, read through Sagan: what fires together wires together (synthesis, composition); what fires apart wires apart
(analysis, the cut); what survives both is the abstraction. In a binary machine:

- **Nothing needs strengthening where things already fit.** A bond that is there and carries activity is simply used; there
  is no heat, so nothing changes. Learning happens only where there is heat.
- **Heat has two faces, calling for opposite changes.** A *gap* (something active that nothing holds: new, not wrong)
  calls for forming. A *misfit* (bonded members firing apart: a gate pressed but not opening, rivals forced together)
  calls for breaking, or a cut.
- **Reinforcement is forming around what is already cool.** On later visits the first surprises are held and cool; forming
  moves to the next layer of surprise and attaches there. So learning grows outward from what is settled, which is the
  coral picture of the flow-and-heat note: the deep grows from what sinks down and fits.

## 5. The cost: entrenchment

Structure protects what is wrong as well as what is right. A mistake that has been richly connected is as hard to undo as a
truth: each bond that heat breaks is patched by everything around it, through completion. This is very human (it is how a
belief entrenches), but it means correcting a well-connected mistake may need heat across many bonds at once, not one.
How heat spreads through a well-connected memory, and whether that is enough to reconfigure it, is open.

## 6. Open questions and what would test it

1. **Robustness.** Build one memory met once and one connected through several later "visits"; break a bond in each; does
   the connected one still complete and the other not, with no per-bond property anywhere?
2. **Outward growth.** Over repeated visits to the same small world, does forming move from the first surprises to what is
   newly surprising, attached to what is already held, rather than re-forming the same things?
3. **Entrenchment.** Plant a wrong pairing, connect it richly, then show the world contradicting it: how much heat, spread
   how widely, does it take to undo, and does it come back?
4. **Bounds.** Without strengths, what keeps structure from growing without end? The answer this note implies is the
   learning rules themselves (form only at gaps), and pruning what never carries activity; both are still open.
