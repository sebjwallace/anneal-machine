# C146 · Several at once: hypothesis

While designing candidate B (heat lowering the bar, rival hypotheses competing), a blocker showed up before any code
was written. To judge a hypothesis such as "read these three cells", the engine has to take the digits in those cells
and put them into the three slots of a fact (first digit, second digit, carry). For B, many rival hypotheses would be
open at once, each routing different cells into **the same** slots, because each fact's slots are the same cells
everywhere. Their digits would pour into the same slots in the same moment and blur together. That is the instances
problem that runs through the project ("A B B B C", several values held at once, super-assemblies with relative
position), now blocking B. The owner chose to tackle instances first.

## The question

**Can several copies of the same facts be live at once, each fed by a different hypothesis, each judged by the engine,
without blurring into one another?**

## The idea, from the owner's own notes

A settled thing in the deep, taken as one, **expands at the surface into several copies**, so several bindings can
stand at once ("x = 9, x = 5, t = 3"). Here: **lanes**. A lane is a copy of the facts' five slots and of the 1,000
facts, formed beforehand (declared: forming copies on demand is not under test). A hypothesis is given a lane.

**Routing by the engine.** Each lane has **selector** cells: "this lane reads place p into the first-digit slot", and
so on for each place and slot, and one for the written units digit. The contents of the 12 places around the focus are
**content** cells ("place p holds 7"). Routing is done by gates (C141's shape): {this lane's selector for p into the
first slot, place p holds 7} opens "7" in this lane's first slot. So the experiment only switches on a hypothesis's
selectors in its lane. Which digits reach which slots is the engine's.

**The protocol (C145's, with routing in front).** Moment 1: the contents of the 12 places and each lane's three read
selectors arrive. Moment 2: the routing gates fill each lane's slots; the written digit and each lane's units selector
arrive. Moment 3: each lane's fact completes, and the written digit is routed into each lane's units slot. Moment 4:
competition (rivals from place, C145). **A lane judges its hypothesis to fit if the written digit is still on in its
units slot.**

## Arms

- **One shared set of slots (no lanes).** Every hypothesis's selectors route into the same slots and the same facts:
  the situation that blocked B.
- **Lanes, company from everything.** C145's rule exactly: two members compete if they have never been in an assembly
  together but share company, counting every assembly, gates included.
- **Lanes, company from states only.** The same rule, but counting company only in states (the facts), not in the
  routing gates (declared variant).

**Why the variant.** Each lane's slots are fed by gates that share the same content cells ("place p holds 7" feeds
"7" in every lane). By C145's rule, "7" in lane 1 and "7" in lane 2 have never been together but share that company, so
they become rivals, and the lanes would compete with each other before anything is judged. Counting company only in
the facts keeps the lanes' slots apart. Which of the two is right is part of what is being tested.

## Trials

Each trial takes a real column from a worked example (two- and three-digit sums as in C142), and gives each of K lanes a
hypothesis: a random set of three read places around the focus (as C142), and, in half the trials, the true one in a
random lane. K is 2, 4 or 8 (the shared arm takes the same hypotheses into its one set of slots). 1,000 trials per K
per arm. **Truth** for each hypothesis: its three digits add up to the written units digit.

**Measured:** for each hypothesis, whether the engine's judgement (its lane keeps the written digit) matches the truth.
In the shared arm, there is only one judgement for all of them: the written digit kept or not.

## The ledger

**Given:** the lanes (copies formed beforehand); the content cells for the places around the focus; switching on a
hypothesis's selectors in its lane; the order of the protocol; reading the result at moment 4 (a state that repeats
counts as held, as C145). **The engine:** routing the digits into slots (gates); completing the facts; competition and
rivals from place; judging.

## Predictions (fixed before running)

1. **Shared slots:** judgements are wrong much of the time: with several hypotheses' digits in one set of slots, the
   result matches the truth for well under 90% of hypotheses at K = 4 and 8.
2. **Lanes, company from everything:** the lanes interfere. Same digits in different lanes become rivals, so lanes
   compete before judging. Agreement with the truth is clearly below 100% (under 95%) at K = 4 and 8.
3. **Lanes, company from states only:** every judgement matches the truth, at every K: **100%**.

If 3 holds, the facts can be live in several copies at once, each fed and judged by the engine, which is what rule B
needs. If 2 holds too, C145's rule needs refining: company should come from what things are, not from how they are
routed.
