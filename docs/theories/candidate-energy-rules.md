# Candidate energy rules

Three candidate rules for **how heat moves activity**, written up as hypotheses for the owner to choose between before
any is built. Each would replace the search that is still the experiment's in C142 and C143 (finding which step
explains a worked example) with something the engine itself does. **None has been tested.** The owner's standing
wish is not to pick the energy rule himself but to put options up and let experiments decide; this note is that list.

Related: [content and spatial memory](content-and-spatial-memory.md) (§13.8), [flow and heat](flow-and-heat.md),
[units, flow and the states of a bond](units-flow-and-bond-states.md), [the tilting
landscape](the-tilting-landscape.md), [heat as the source](heat-as-the-source.md), [nothing breaks](nothing-breaks.md).
Experiments: C139 to C143.

---

## 1. What any candidate has to do

**The job.** In a worked example of column addition, some cells are explained (the input digits, cool) and some are
not (the written answer and carries, hot). The memory has to find, by its own dynamics, the step that explains the hot
cells from the cool ones: which places to read relative to the focus, where the units and the carry are written, which
way the focus moves. Then bind it, so the next worked example is cooled by recall.

**What C143 taught, which every candidate must respect.** C143 steered the experiment's search by heat and found four
things the engine's version needs:

1. **Attention goes to heat, and only cool things explain hot ones.** This did most of the work: about 200 times less
   search.
2. **Rivals settle separately.** A partial settling belongs to one hypothesis, not to the space. When cooling was
   shared, a wrong explanation cooled the very cell that would have shown it wrong.
3. **An explanation is finished only when no heat is left.** Leftover heat rejects a hypothesis.
4. **Ambiguity branches.** Several ways to explain one hot cell become several hypotheses, held open, not merged.

**What stays given in every candidate, for now.** The single-digit facts (looked up); reading and writing a cell;
where the first heat is (the focus starts on the last digit); C141's gates for moving. The point of the candidates is
the search, not these.

**What any experiment on them must report.** Whether the step is learned, and in how many seeds; the test on longer sums
(as C142); how much work the dynamics did (moments run, members activated), against C142's and C143's checks; and,
plainly, what the engine did and what the experiment's code did.

---

## 2. Candidate A · A fixed budget of units flowing to the heat

**Where it comes from.** [Units, flow and the states of a bond](units-flow-and-bond-states.md) and [the tilting
landscape](the-tilting-landscape.md): energy as a fixed budget of units that move and never copy, falling into basins
and draining when they complete; what can't complete keeps cycling as heat.

**The rule.**
- Each hot cell is a sink: a basin that hasn't completed. The budget of units is spread over the open basins.
- Units at a hot cell flow out along the connections that exist from it: here, the relative places reachable through
  the gates (one move, two moves), so they arrive at nearby cells. A unit can only rest on a cool cell (only cool
  explains hot).
- Units arriving at a cool cell carry its content back towards the basin. When the contents carried back complete the
  hot cell (their sum's units digit is the hot digit), the basin drains: the units are released, the cell cools, and
  what carried them (which places, in which order) is bound.
- Units are never copied, so the number of hypotheses alive at once is bounded by the budget, and flooding is
  impossible by construction.

**How it meets C143's lessons.** Attention goes to heat because that is where the units fall. Rivals settle
separately if each group of units carrying one combination of places is its own hypothesis. Leftover heat is basins
still holding units. Ambiguity branches when units split between paths.

**What it predicts.** If the budget is large enough to cover the candidate places around a hot cell, the step is found
as C143 found it, with work proportional to the units moved. If the budget is too small, some seeds never find the
step (the right combination never gets units); too large and it degenerates into C142's exhaustive search.

**Risks.** The budget is a number someone chooses (a declared constant, not a strength on structure, but a knob). How
units "carry content back" needs care not to become bookkeeping in disguise: the content must travel by the engine's
own activity, not in the experiment's variables. It is the most faithful to the owner's flow picture and the most new
machinery.

---

## 3. Candidate B · Heat lowers the bar, competition picks

**Where it comes from.** The owner's earlier experiment in which heat building up lowered a population's sparsity
threshold like a piston, so activity flashed denser, more members and assemblies lit up, and the missing context could
be found; and the engine's competition, where more support outcompetes less.

**The rule.**
- While a cell stays hot, the bar for opening gates around it is lowered, a step at a time: first only places one move
  away can open, then two, and so on (a flash that widens with heat).
- Every combination that opens is a rival assembly: the read places, the write place, the move, held together as one
  partial fit. Rival assemblies each hold their own partial settling (lesson 2), and ambiguous ones simply all open
  (lesson 4).
- Competition, as the engine already does it, decides: an assembly that explains the hot cell with nothing of its own
  left unsupported outcompetes those that leave heat (lesson 3). The winner is bound and the bar goes back up.
- When nothing hot is left, the flash ends.

**How it meets C143's lessons.** Attention goes to heat because only hot cells lower the bar near them. The other three
lessons map onto rival assemblies and the existing competition directly.

**What it predicts.** The step is found within the first ring or two of places (it only needs places one move away),
so the flash stays small, close to C143's count. Seeds where two rivals explain the example equally (seed 7 in C143)
stay tied, and are held open until an example separates them.

**Risks.** "Explains the hot cell with nothing left unsupported" must be computed by the engine's own counting (support
from what is active), not by the experiment checking a sum. That means the facts would need to be in associative memory
(a completed fact assembly is what "explains" means), or the fit test stays given. Lowering the bar by steps is a
schedule, which could slide into puppeteering if the experiment decides when to widen. It **uses the most existing
engine machinery** (gates, thresholds, competition): the least new code.

---

## 4. Candidate C · Settling spreads out from the gap

**Where it comes from.** [Heat as the source](heat-as-the-source.md) (heat spreading back from the open thing along
bonds) and C143 itself, which is the closest relative.

**The rule.**
- An open place (a hot cell) is an incomplete assembly: a gap. Completion spreads out from the gap along the relative
  places, nearest first, one ring per moment.
- What the spreading reaches that is cool joins partial fits rooted at the gap; each partial fit is its own hypothesis
  (lesson 2), and branching happens wherever two cool cells could fill the same part (lesson 4).
- A partial fit that completes the gap cools it; it then carries on to the next heat it can reach (the move), and must
  reach and complete every hot cell it can, leaving none (lesson 3). The first fit to leave no heat is bound.

**How it meets C143's lessons.** It is C143's second rule ("each explanation keeps its own heat"), expressed as
spreading from gaps rather than as a search loop.

**What it predicts.** The same results and roughly the same work as C143 (hundreds of steps per worked example), because
it is C143's shape. Its value would be in being done by spreading activity rather than by the experiment's loop.

**Risks.** It is the least new: it risks being C143 with different names. And "one ring per moment" is a schedule in
the same way as B's lowering bar.

---

## 5. How the three differ, side by side

| | A · units flowing | B · bar lowered, competition picks | C · settling spreads from the gap |
|---|---|---|---|
| what moves | a fixed budget of units | how much can open around heat | completion, ring by ring |
| hypotheses are | groups of units on one path | rival assemblies | partial fits rooted at the gap |
| what decides | basins draining when complete | competition (more support wins) | the first fit to leave no heat |
| new machinery | most (units, carrying content) | least (thresholds, competition exist) | some (spreading, per-fit state) |
| closest to | the owner's flow picture | the owner's piston experiment, the engine | C143 |
| main risk | bookkeeping in disguise; a budget knob | the fit test staying given; a widening schedule | being C143 renamed |

## 6. The assistant's recommendation

**B first.** It uses the engine's own gates, thresholds and competition, so more of the work is genuinely the engine's,
and it tests something C143 didn't: whether **competition between rival assemblies** can do what C143's code did by
following each hypothesis separately. If B works, it also says what A needs (units would only have to replace the
lowering bar). If it fails on the fit test (the engine has no way to say a sum "explains" a digit without the facts in
memory), that points at putting the facts into associative memory as the next step, which is wanted anyway.

A is the most faithful to the owner's flow picture and could come second, once B has shown what the competition can
and can't do. C is mainly useful as a control: if B and A both fail, C shows whether the problem is the engine doing
the work or the shape of the work.

---

## 7. What round one of the fan-out found (C179, 27 November 2026)

At the owner's request, the three rules were explored side by side rather than one being picked. In
[C179](../../experiments/sketches/C179-three-ways-to-adapt/findings.md) each was copied as a way of choosing what to try
when the memory adapts a way of working it already knows: times one digit from adding, and the second row of long
multiplication from times one digit. All of them were still the code's. The point was to learn the trade-offs before
building one into the engine.

| rule | second row (runs) | second row right (200 new) |
|---|---|---|
| greedy (C177's rule, the reference) | 258 | 200 |
| **B · heat lowers the bar** (nearest first, widening until something cools more, the winner kept) | **226** | **200** |
| C · settling spreads from the gap (only progress from the start counts) | stuck on all four examples | 0 |
| A · a budget of units flowing (random steps near the heat, kept if no worse) | 266 to 1,131 in 3 of 5 seeds; 2 stuck | 200 in 3 seeds, 0 in 2 |
| A + B (the budget pulled toward the nearest) | 937 in 1 of 5 seeds; the rest stuck or wrong | 200 in 1 seed |

What it taught:

1. **Progress has to count wherever it shows up.** C failed because the first gap needed several parts to change at
   once. Pieces don't come right in the order the working is done.
2. **Start near, but keep widening.** B's widening is what lets it reach the far changes the second row needs. A pull
   that only prefers near (A + B) starves them.
3. **Keep the winner, reset the bar.** It's what makes greedy and B steady. A's drifting wastes steps.
4. **Randomness can avoid a trap.** A was the only rule that, in one seed, never learned the coincidence. But it was
   unreliable.

B is the one to build into the engine's dynamics (round two). The open risk named in section 3, that the fit test stays
given, still stands: agreement with the worked example is how cooling is judged.

**Round two, step one (C180).** B was restated as heat dynamics: heat builds up on the parts an attempt blames (writes
that didn't cool; then, from a wrong answer, the reads that fed it), the reach of alternatives grows with that heat,
competition goes by heat less distance, and one try is made at a time, the first that cools more being kept and the heat
reset. It learned the right second row (200 of 200) in 341 runs, never fooled by the coincidence, but it stuck twice
where two parts had to move at once. Heat is still kept by the code. The next step is heat as the memory's own
structure.

**Round two, step two (C181): heat in the substrate.** Heat was moved into the substrate (the owner's word, from 27
November, for the structure of associative memory) as energy on its cells. Four general rules moved it: blame and
unfilled places as sources; spreading, half kept and half shared with neighbours; the warmest alternative above a fixed
bar taking over and spending its heat; draining when more cools. **It churned, and nothing was learned.** Several parts
took over at once. Parts with few neighbours (the move) flipped first, whatever was to blame. Heat piled up on the parts
in place. And parts doing their job got no stronger. The energy rules need what the code's version held without saying
so: one change at a time, heat independent of how many neighbours a part has, each part's bar grown by the work it does,
and pulling only what's to blame.
