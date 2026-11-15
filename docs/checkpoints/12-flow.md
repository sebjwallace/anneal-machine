# 12 · (name to agree): flow and heat — binding, sinking, priming

*Covers one conversation and experiments C82–C91 (15 November 2026). The core (`src/`) gained only a heat meter
(`Moment.heat`); everything else lives in experiment copies, each in its own folder, with a hypothesis, a PREREG written
before the test seeds, findings and a list of its violations. The theory is
[flow and heat](../theories/flow-and-heat.md); the review of what could go into the core is
[D-02](../distillation/D-02-energy-and-bonds.md). Some of the ideas below were tested and some are still only
theory; each section says which.*

## In one paragraph
The day started with a practical worry: if "A" can be followed by "B", "C", "D" and so on, a word like "the" ends up
linked to every noun there is, and the links explode. Following that thread brought back the owner's oldest idea, from
before Anneal: intelligence as a **distributed web of fuzzy state machines**, which are not really state machines but
**states held as assemblies**, connected like a material. Cool, the material holds its shape and its states persist.
Heated, its bonds loosen, assemblies move and reconfigure, and as it cools they settle into a new shape that fits.
From that picture came a run of concrete ideas: "the" as a pointer to whatever is already standing, variables in
algebra as states that hold until rebound, bonds that form fast and melt fast. Then a run of experiments turned the
picture into rules. Heat was reduced to one idea in three shapes, with a meter for it in the core. The owner's
original premise, energy that flows and energy that can't, was finally written down. Fast, temporary bonds were put in
a fast volume working on top of a slow one, the owner's **poles and arms**. And the whole cycle ran as one machine,
the owner's **pot**: talk turns the surface, the deep warms where it turns, a new piece settles at the surface, and it
sinks into the deep only where it meets warm, welcoming ground. On cold ground it waits, and a piece that fits nowhere
evaporates. Along the way the experiments found real limits: the core's settling spreads to everything connected, the
energy rule at the level of cells is still missing, and a primed context can let a plausible wrong idea in.

## Why it matters
- **The loose picture became testable.** Rivers, factories, poles and arms, a pot, Tetris, two pieces of warm metal
  joining: each analogy was turned into a rule written in cells (a draft model, before any code) and measured against
  a baseline. Several held up, some didn't, and the failures were as informative as the successes.
- **Heat has one meaning now.** Every earlier use of the word (surprise, prediction breadth, cravings, trapped heat,
  curiosity, distance from a stasis) turned out to be one of three shapes of the same thing, where what is active and
  what is held disagree. The core reports all three on every moment.
- **Two kinds of bond, in two places.** The conflict that kept recurring (the rule that rebinds "x" cleanly also forgets
  "ABCD") went away when quick bonds and lasting ones were put in different volumes of the same machinery.
- **A first whole cycle of learning by fit.** New information is taken into lasting memory only when it connects the
  dots of what is already known and lands where the deep is primed, which kept out three quarters of the false links a
  learn-everything deep took in.
- **It names what is missing, precisely.** The energy rule belongs at the cut and the tie, not at capacity; settling
  needs locality; the machine can't yet tell "instead of" from "as well as"; and a snug fit has to count for more than a
  loose one.

## The journey (how one idea led to the next)
Most of this section is conversation, not experiment. It is kept because the reasoning is what makes the experiments
make sense, and because some of it is still untested theory worth coming back to.

1. **The explosion** (theory, untested). In transition memory a state primes its possible next states. "The" can be
   followed by almost any noun, so storing a transition to each one would mean thousands of links from one word, and a
   prediction so broad it says nothing. Today's core stores a transition on the receiving side (each next word's cells
   grow a segment listening to "the"), so storage grows with the number of different followers, and the real cost
   comes when "the" is active: every one of those segments fires.
2. **The hub** (theory, untested). If "the", "a" and "my" are each followed by the same thousand nouns, direct
   transitions cost three times a thousand; one shared assembly in the middle ("whatever comes after these") costs
   three plus a thousand. With m words before and n after, m times n becomes m plus n. That saving is what the prices
   measure, so an energy rule would favour the hub without being told. It is the cut (RM-8) moved into time: the shared
   part of all those transitions is "after the", held once. Words then group by the company they keep, without anyone
   defining "noun". It is also the frame of RM-10, "the ___", with a variable held open.
3. **"The" is a pointer** (theory, untested). The owner's correction: "the" doesn't predict a word, it points back into
   context. "A duck" brings something new in; "the duck" picks out something already there. So "the" should predict
   from what is still standing, a handful of things, not from everything that has ever followed it. With three
   candidates standing (a man, a duck, a cat), they tie, and the rule against breaking ties (CTR-1 CON-7) holds the
   choice open until the next word settles it.
4. **Fuzzy state machines** (the owner's oldest idea, partly tested). States are stable assemblies. They persist until
   something they are connected to forces them to change, and different states change at different speeds. What
   forces a change is heat: a state that no longer fits its neighbours reconfigures until the energy is lower and it
   fits again. Folded into the pointer: "the man", "the duck" and "the cat" haven't faded since they were read; they are
   still standing. Recent context is not a separate memory to search; it is whichever states are up. "The" arriving is
   a small misfit, an opening that wants filling, and the cheapest way to fill it is to fit it to a state already
   standing, which needs no new structure. "A" says build something new, which costs more. Fast states ("the", word by
   word) transition against slow ones (the duck, for a paragraph; the topic, slower still). Persistence itself is not
   yet built in the core, and is the main reason this stays partly untested.
5. **Arithmetic** (theory, untested). A variable is a persistent state: "x is 3" stands until "x = 5" forces it to
   change. Using a variable is like "the": "x" in "x + 2" points at whatever value stands for it. An operation like "+"
   is a fast state with two openings, settled when a result fits both. Learning every pair as a transition is the same
   explosion again, and would never stretch to numbers not seen. The cheap version reuses what is known: counting is a
   chain of transitions, so "+ 2" could push the standing number two steps along it. Carrying has a heat flavour: a
   digit pushed past "9" wraps to "0" and leaves a misfit it can't settle alone, so it passes the heat to its neighbour.
6. **Fast binding, like atoms** (tested, C82, C83). The core can already tie two assemblies cheaply (a handle of two
   cells from each) and can already remove a segment (the cut does). So binding "the" to the standing duck, or "x" to
   "5", is just a tie. What it lacks is unbinding driven by heat: like atoms in a hot metal, bonds should loosen when
   things don't fit, let the assemblies reconfigure, and settle again as it cools. Since segments carry no strength
   (CTR-1 CON-9), hardness has to be structural: a bond seen many times is backed by more segments.
7. **What heat is** (tested as a meter, C84). Going back through every use of the word in the project gave one idea:
   heat is where what is active and what is held disagree.
8. **The energy rule** (tested, C84, C85). Kept structure must pay its way; the core keeps everything. The first
   candidates for a rule at the level of cells were aimed at running out of cells, and the core never runs out.
9. **Flow and heat** (the owner's original premise, recorded). The river and the factory; essential and accidental
   energy; patches as heat baked into structure; the proper repair; bonds as what cooling leaves behind; the machine as
   an annealer of the world's heat. Its first test as rules (C85) worked where heat had a way out.
10. **The living topology.** Active assemblies are a medium that energy flows through, not downhill like a river but in
    and around, along whatever the dots and lines allow. Changes are absorbed or cascade. Dead ends and closed loops
    are where heat is trapped. Heat changes activity first (fast) and bonds second (slow).
11. **Two volumes, poles and arms** (tested, C86). The slow volume is the substrate, the poles: "cat", "man", "x", "5",
    settled over and over, never relearnt. The fast volume is the arms that turn on them and pin things together for
    now. The pot is the same from the side: hot and quick at the top, settled and slow at the bottom.
12. **Sinking and rising** (tested, C87). What fits sinks: "cats are mammals" connects dots already there (cats walk
    like humans, humans are mammals) and slots in like a Tetris piece. What conflicts ("cats fly") is held up by the
    heat between new and old. A rationale that makes the conflict go away may be a patch. What never settles should
    evaporate: the machine's version of the contemplative traditions' acceptance of a world that doesn't have to make
    sense.
13. **The aha, and lowering the bar** (tested, C88). Something settled at the surface makes the deep lower its bar, so
    activity spreads from the piece's two ends to find where it slots in; where they meet, the deep lights up.
14. **Priming by friction** (tested, C89, C90). Poles that turn at the surface rub in their sockets, and the warmth
    travels down them into the deep. The deep is warm where the surface has been busy, and only there. Related activity
    focuses the warmth; unrelated activity spreads it. A still-warm piece meeting a warm place bonds, like two pieces of
    metal being joined.
15. **The loop** (tested, C91). All of it in one cycle.

## How it works (the ideas that held up)
1. **Heat in three shapes** (C84; in the core). *Something there that nothing holds* (a lit column explained by
   nothing: the gap, the void). *Something held that isn't there* (a cell brought back or predicted in a column that
   isn't lit: a prediction not met, a patch, a dead end). *Something held twice* (two explanations of the same evidence,
   neither taken: a tie, CON-7). The core's moment now reports them as `heat.unheld`, `heat.unthere` and `heat.twice`.
   Read in the owner's topology: energy arriving with no line to carry it; a line leading nowhere; two routes for one
   flow.
2. **Loosening** (C82). When a whole is read as what fits (its cells that won) and what is brought back (the rest),
   and the input has a remainder of its own, the core cuts the whole (RM-8) unless the two pieces are already held on
   their own, in which case it does nothing. Loosening fills that gap: the **joint** (the segments holding the two
   pieces together) loses one segment per cell. "x" seen with "5" brings back "3"; the joint between "x" and "3" is
   what doesn't fit, so it loosens, and the new tie holds "x" to "5". The heat that drives it is read from the moment
   itself, with nothing set by hand.
3. **Hardening** (C83). A whole seen again is tied again from its parts, so its joint is backed by more segments, and
   loosening takes one at a time. Bonds seen once break at the first clash; bonds seen three or more times survive it.
   Hardness without a strength on any segment.
4. **Where growth really comes from** (C84). The core never stores a new input as new: any two of its columns wake an
   old memory (the bar of two), which claims the rest of itself, and the cut and the tie rebuild the input from
   fragments of the past. So "something there that nothing holds" falls to zero almost at once, which looks like
   understanding and isn't, and "something held that isn't there" never falls: the patched one-offs keep reaching for
   what never arrives. Growth comes from cutting and tying, not from running out of cells.
5. **The bill at the fit** (C85). A memory may explain an input only if it explains at least as many cells as it
   claims that aren't there (RM-9's two prices of 1). That fills the gap RM-6 names ("support stands in for saving").
   With it, a one-off is left unexplained, stored loose, and cleared when cells run short: its heat passes through
   instead of being patched into structure.
6. **Two volumes, the fast one fed by the slow one's winners** (C86; rule in its `model.md`). Both are the core's
   machinery; the fast one has loosening on. The fast volume has one column per cell of the slow volume, so its
   assemblies are over slow cells and it relearns nothing: a tie between "x" and "5" there links handles on two slow
   memories. Each kind of knowledge survives in its own volume.
7. **Sinking by fit** (C87). A link the fast volume has settled is tested in the slow one: settling from each of its
   ends, do they reach something in common? If so the slow structure already connects them, the link only fills a gap,
   and it sinks (the slow volume learns it by its own tie). If not, it evaporates from the fast volume.
8. **Lowering the bar** (C88). The core settles in rounds, each letting in the candidates with the most support, until
   nothing new joins. Let through one round at a time from each end of a link, the bar starts high (no spreading) and
   drops one round per step. The step at which the two fronts first share a cell is how far it had to drop; what they
   share then is the size of the aha. This gives the deep locality.
9. **Warmth** (C89, C90). The deep's winners during recent surface moments stay active as warm cells. Three rules make
   warmth behave as the picture says, and each was found because the code first disagreed with the model:
   - warmth never wakes anything by itself: a segment fires only if something not warm touches it;
   - once the front reaches a warm cell, that cell joins the front, and activity flows through warm ground;
   - the piece itself is never warm ground.
10. **Sinking only on warm ground** (C91). A new link settled at the surface sinks if its fronts meet and the meeting
    touches warm ground; meeting only on cold ground, it stays up; never meeting, it evaporates.

## What it showed (the numbers worth remembering)
| Result | Where |
|---|---|
| Rebinding "x" 1,000 times: exactly its current value 100% with loosening, 0% in the core (which brings back all ten values); structure flat (44 segments); 91% when the two variables share values (the rule is symmetric) | C82 |
| With loosening alone, "ABCD" built from "AB" and "CD" is forgotten when "ABEF" arrives ("ABC" brings back "EF"); all 16 core tests still pass, none checking that case | C82 |
| Hardening: a bond seen once breaks at the first clash, seen 3+ times survives (100%), twice 3 of 5 seeds; "ABCD" seen twice survives "ABEF"; but a bond is heated once, not worn down, and every repetition costs about four segments | C83 |
| No candidate energy rule ever cleared a cell; "unheld" heat 0.00 within a quarter; core structure +40% from cuts and ties; with noise on the objects' columns, half of any object brought back all 60 other columns | C84 |
| The bill at the fit, with one-offs on their own columns: structure flat (about 520 segments, core 394 → 549), "unthere" heat about 1 cell per moment against 26, objects exact 100%; without clearing, structure 9–13 times the core's; with shared columns, objects exact only 20–27%; five core tests fail (recall from a small cue) | C85 |
| Two volumes: "x" from the fast one 100%, "ABC" → "D" from the slow one 100% (one volume: 0%/100% or 100%/53%); read together, as one machine, they disagree (53% for "ABCD") | C86 |
| Sinking by fit agreed with connectedness in 20 of 20 tests; kept "cat flies" out; but settling spreads to the whole connected world (7 things from "cat"), so "cat mammal" and "fish mammal" were known already, without learning | C87 |
| Lowering the bar: at the meeting each end has lit about 1 thing, against 8 settling to the end; "cat mammal" never meets later than "fish mammal" (5 of 5), but meets on more in only 3 of 5 | C88 |
| Priming: a matching context brings the meeting sooner where there is room, or bigger; other contexts change nothing; priming never makes an unconnected link meet | C89 |
| Warm meets warm, predicted first on fresh seeds: after a walking context "cat mammal" and "cow mammal" met on 9 cells (all of "walks") against about 4, in 10 of 10 seeds each; swimmers after swimming bigger or sooner in 8 and 9 of 10 | C90 |
| The loop, every seed alike: "cat mammal" sinks after talk of walking, waits after other talk; "cat flies" evaporates; false links taken in: 5 of 20 (warm), 10 of 20 (any meeting), 20 of 20 (learn everything); "fish mammal" sinks after talk of swimming | C91 |

## What didn't work (don't redo these without a new idea)
- **Pruning by capacity** (C84, the squeeze, its yardstick). The core never runs short of cells, because it rebuilds
  every novel input from old fragments. A rule that waits for a full column never acts.
- **Fading on its own** (C84). Losing a link for every claim not met cut the chaining by two-thirds but frayed the
  objects and tripled growth: the core re-patched what faded, at once.
- **Expecting heat to wear a bond down** (C83). After the first clash, the new whole wins by share (RM-5), so the old
  one is never brought back and never heated again: whatever survives the first clash is kept for good.
- **Reading each question from the volume that answers it well** (C86, first version). That was the experimenter
  choosing, not the machine. Read together, the two volumes disagree. Lesson APT-9.
- **Lowering the bar evenly from cold** (C88). It gives locality, but not a graded fit; priming was needed.

## What was given by hand (how much to trust it)
Every experiment lists its violations; across them, the same few givens recur, and none of the claims above rests on
them beyond what is said:
- **Blanks before every input,** so no transitions are learnt (they would grow with every moment and were not the
  question). Persistence of states, which the pointer and fuzzy-state-machine ideas need, is not built.
- **The worlds are tiny and hand-built.** In C91 every seed gave the same fates, because the fates follow from the
  shape of the world, not from chance. The results say what the rules do there, not how they scale.
- **Gating the slow volume** (C86 "slow set", C87, C89–C91): its learning is undone from outside except when a link
  sinks. How a volume gates its own learning is open (QST-17).
- **The meeting test is the experiment's** (C87–C91): two fronts settled separately, round by round, and compared. The
  deep does not hold both ends or notice the meeting itself.
- **Contexts and episodes, and where warmth ends** (C89–C91): warmth lasts the whole context, then goes; it doesn't fade.
- **A declared reading** (C83): a whole's parts read from each cell's first segment.
- **Measurements** are always read by the experiment from the moments' reports; the volume never reads them.

## What to show people
- The heat meter: a moment's three shapes of heat, as cells, on the core's viewer.
- "x" rebound a thousand times, in the core (bringing back everything) and with loosening (one value, flat structure).
- The pot: two volumes side by side, the surface churning, the deep lit only where the poles turn; a piece dropping,
  meeting warm ground and bonding, against "cat flies" evaporating. (Not yet drawn; a visual in `docs/visuals/` would
  carry the owner's picture best.)
- The aha: two fronts spreading round by round from "cat" and "mammal", meeting on "walks", with and without a
  walking context.

## Limits and open questions
- **The energy rule at the level of cells** (RM-9, PRB-16) is still the largest gap. C85's bill at the fit is the
  strongest lead, but it forbids recall from a small cue (QST-16: in a stream, "not there" can't yet be told from "not
  seen yet"), so it stays out of the core by the owner's decision (D-02).
- **"Instead of" against "as well as."** Structurally, "x = 5" replacing "x = 3" looks the same as "cat mammal" joining
  "cat walks", and the same as "ABEF" beside "ABCD". The machine can't yet tell a variable, which holds one value, from a
  thing that holds many (QST-15).
- **Settling has no locality of its own.** It spreads to everything connected (C87). Lowering the bar round by round
  gave locality (C88), but that is the experiment letting rounds through, not the deep.
- **Snug against loose.** On warm ground a far fit counts the same as a near one: "fish mammal" sank after talk of
  swimming (C91). The graded fit seen in C88 and C90 (how soon, and on how much, the fronts meet) should feed the
  sinking rule, without a hand-set threshold.
- **Pieces that wait.** "Stayed up" is the right fate on cold ground, but nothing yet holds a piece at the surface
  until its ground warms.
- **The new needs another way in.** "Bird walks" is true but connected to nothing known, so it can never sink by fit.
  Repetition, or evidence from the world, has to be able to bring it down.
- **How slow and fast meet** (QST-17): read together, two volumes disagree; disagreement between them should itself be
  heat, settled like any other. Priming is the first part of an answer.
- **Fading warmth, persistence, and the fast depth.** Warmth should fade as poles stop turning; standing states should
  persist until displaced; and heat should move activity before it moves bonds. None is built.
- **Untested theory from the journey:** the hub (m × n to m + n), "the" as a pointer to standing states, arithmetic by
  pushing a number along the counting chain, carrying as heat passed on.
- **The core is to be rebuilt, not patched.** The owner's plan: write a new set of reference models from what holds up,
  then build a fresh core from them.

## Where it lives
- **Experiments:** `experiments/sketches/C82-rebinding` to `C91-closing-the-loop`, each with `hypothesis.md`,
  `PREREG.txt`, `findings.md`, `README.md`, its run script and output, and (from C86) a `model.md` written before the
  code.
- **Theory:** [flow and heat](../theories/flow-and-heat.md), the owner's premise and every analogy above, woven into
  one piece.
- **Core:** `src/engine/moment.js` (`Moment.heat`) and its test in `src/test/volume.test.js`; RM-6 describes the third
  shape of heat.
- **Review:** [D-02](../distillation/D-02-energy-and-bonds.md), what from C82–C85 could go into the core and why most
  of it didn't.
- **Ledger:** HYP-32 to HYP-41, with QST-15, QST-16, QST-17, PRB-16, PRO-7, DEC-9.
- **Backlog:** the next experiments (snug against loose, pieces that wait, the new needs another way in).
- **Words agreed for now** (glossary): joint, loosen, harden, and variable in its arithmetic sense.
