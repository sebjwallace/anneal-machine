# Convergence and the map: how heat should pick what to change

A theory note, from a quick back-and-forth between the owner and the assistant (27 November 2026), held to calibrate on
one question after the experiment C181 failed. **Nothing here has been tested.** It settles, in the owner's terms, how the
substrate should decide what to change when a way of working doesn't fit the job in front of it, without the
experiment's code doing that thinking. It repeats some things from earlier notes on purpose, so that it reads whole in
the context it came from.

"Substrate" is the owner's word, adopted the same day, for the structure of associative memory: volumes of
interconnected cells, like a material. Associative memory is what holds the cells together, and heat is the energy
dynamics of that material. The owner's points and the assistant's are kept apart and marked. Section 7 records the
exchange as a transcript. The running illustration is learning to drive, as the owner asked, not the arithmetic of the
experiments.

Related: [structure over strength](structure-over-strength.md) (reinforcement as more structure, not stronger bonds),
[nothing breaks](nothing-breaks.md) (learning only adds structure), [the tilting landscape](the-tilting-landscape.md)
(basins, units as gravity, the landscape tilting with context), [learning from experience](learning-from-experience.md)
(the lessons this note builds on), [candidate energy rules](candidate-energy-rules.md) (the three rules and what the
fan-out found). Experiments that led here: C179, C180, C181.

---

## 1. Where this came from

**The problem.** When a learner meets something new, it brings up the nearest thing it already knows and adapts it. For
the experiments up to C180, the adapting was done by the code: it proposed small changes near where the work was
unfinished, tried them, kept what helped, and kept track of what it had tried. C180 put that in the shape of heat (heat
building up on whatever was to blame, reaching further the longer it stayed hot), but the code still held the heat and
the bookkeeping.

**C181 moved the heat into the substrate** as energy on its cells, moved by four simple rules: what's to blame heats up,
heat spreads to neighbours, the warmest alternative above a fixed bar takes over, and success drains the heat. **It
churned, and nothing was learned.** Several things changed at once on almost every attempt. Things with few
alternatives flipped first whether or not they were at fault. Heat piled up on the parts in place. And parts doing their
job were as easy to dislodge as useless ones, because the bar was a fixed number.

**The question put to the owner:** what makes a part in place hard to dislodge, and what lets only the right thing give
way?

---

## 2. What was settled, piece by piece

### 2.1 No strength: a part holds by convergence

**The assistant's first framing** was that a part that helps something cool should become harder to dislodge, like a
practised driving move that gets stronger with use. **The owner questioned the direction** at once, because of
[structure over strength](structure-over-strength.md): there's no strength in the substrate, only structure.

The assistant then offered strength as **copies**: each success forms the same assembly again, and more identical
assemblies win a competition. **The owner preferred something else:** how many different situations it has held in.
He's wary of averaging, the law of averages that's slow and leads back to ordinary machine learning, and would rather
the hold come from structure.

**Where it landed (the owner's).** A part holds by **convergence** in the substrate's structure: the overlap of many
different assemblies built up over different situations. That overlap is the generalisation, an attractor basin. In
driving terms, a mirror check that has helped at a junction, at a roundabout and pulling out of a parking space has
three different pieces of structure behind it, one per situation. Gripping the wheel tightly, which never helped
anything, has none. The difference isn't a bigger number. It's more structure converging on one piece.

**The word "habit" is retired** (the owner's): it suggests something that strengthens by repetition. The terms to use are
convergence and basins.

### 2.2 One change at a time

**The owner:** it has to be one at a time. Change two things together and you can't tell which caused the effect.
Learning is making the association between a cause and its effect, so you try one cause and see its effect.

**The assistant's pushback:** sometimes two changes only work together. If a car pulls to one side and the only fix is
adjusting the steering and the tyre pressure together, either alone shows nothing, so changing one at a time never
shows an improvement.

**The owner's answer** was a question: did the learner find the pair by chance, or had they already connected the two?
Two cases followed:

- **If the two are already connected,** they're one piece of the substrate, so moving them is still one change. One at
  a time holds at the level of whole pieces.
- **If they've never been connected,** finding the pair needs a change that showed nothing to be kept for a while, until
  the second change shows it was worth it. Then the two are bound together as a new piece.

### 2.3 Three outcomes, not two

**The owner:** there are three states of affairs. A change makes things worse, makes no difference, or makes things
better. The middle one isn't a failure: it's **not yet known**, and it's held loosely rather than thrown away.

### 2.4 Not tracing back: what competition already does

**The assistant proposed** that credit should follow the path the activity actually took: when something cools, follow
back what produced it.

**The owner rejected this firmly.** Chaining or tracing backwards is the trap machine learning falls into: messy,
mechanical, not what this work is about. Assemblies are states that persist until they're outcompeted, so the question
should be asked in terms of competition. What is it, in the competition, that makes the neutral things get lost?

**The assistant's answer, in competition terms.** Every attempt starts afresh. A tried change only lasts as active state
during that attempt, and only structure survives between attempts. At present structure was formed only when things got
better, so a neutral change left nothing and was simply never kept. No tracing is needed to fix this. A change that makes
no difference stays in the current way of working until something outcompetes it. When things get better, the state
that wins carries everything that was in it, neutral changes included. When things get worse, that state loses to the
earlier, better one, which has more structure behind it, and the recent changes go down with it. **Whatever is in the
state when it wins or loses shares its fate.**

### 2.5 Every attempt forms structure: the map

**The owner, on hearing that failures formed no lasting structure:** "Absolutely. That's vital. Every failure should form
structure." His illustration was a maze. If you take a turn into a dead end and come back out, and then forget that path
every time, you'll keep repeating the same costly mistake. Learning isn't about successes and failures. It's mapping
things out. What's learned from a failure could be a success later, because success and failure are relative to a goal.
If the goal of the maze were to find its dead ends, the failures would be the successes, and a memory that kept them
would already have the answer. **Memory is agnostic to success and failure. Learning is constant.**

**The split that follows (agreed):**

- **The structure is the map.** It's goal-agnostic: everything tried and what happened, kept as structure. So dead ends
  aren't repeated (the code's "already tried" marks become something the substrate holds), and neutral changes stay on
  the map, ready to be combined later.
- **Heat is the goal.** It's goal-relative: what's unfinished now, for this goal, decides which parts of the map are
  pulled into play.

### 2.6 Heat tilts the landscape: there is no fixed bar

**The owner, returning to [the tilting landscape](the-tilting-landscape.md).** Basins are relative. Seen flat, the basins
of a maze sit at absolute depths, one always deeper than another. Tilt the maze, and their depths change relative to
each other, depending on the tilt. Heat is the tilt. It makes some basins more global than others, depending on where it
is. A basin that is immature, with little converged on it, can still be connected within the larger basin, and the tilt
decides whether it matters now. The owner also floated, explicitly as not yet fleshed out, heat as a form of attention:
basins that the heat doesn't reach aren't really attractors at all at that moment.

**The assistant's reading: this is what C181 got wrong.** C181 used a fixed bar, an alternative had to beat one set
number. Under the tilt there's no fixed bar:

- a part in a deep basin of convergence holds, even under some heat;
- a part in a shallow, immature basin near the trouble is tilted out first;
- when one basin becomes the deepest under the tilt, that single winner is the one change at a time.

So one change at a time falls out of the dynamics. It doesn't have to be a rule.

---

## 3. The design, as agreed

In one paragraph. Everything the learner tries leaves structure, a goal-agnostic map, so dead ends aren't repeated and
neutral changes are remembered. A part holds by convergence: the overlap of structure from the different situations,
places and pages where it was part of what worked. Heat, from the goal, comes from what's unfinished and tilts the
landscape near the trouble. The basin that ends up deepest under the tilt wins, which is one change at a time, and a
part with little converged on it gives way first. A change that makes no difference rides along in the current way of
working until something outcompetes it. When things get better, the winning state carries it. When things get worse,
it goes down with the losing state, and the earlier, better state, with more structure behind it, comes back.
Nothing traces backwards. It's competition over structure, tilted by heat.

---

## 4. How the design answers what went wrong in C181

| C181's failure | the design's answer |
|---|---|
| several parts took over at once | the deepest basin under the tilt wins, one at a time |
| parts with few alternatives flipped first, whether or not they were to blame | depth comes from convergence and tilt, not from how heat divides among neighbours |
| parts doing their job were as easy to dislodge as useless ones (a fixed bar) | a part holds by the structure converged on it; no fixed bar |
| neutral changes were lost; tried changes left nothing | every attempt forms structure (the map); neutral changes ride along in the state |
| the code's "already tried" marks | dead ends are on the map, held by the substrate |

---

## 5. Pushback and open questions (the assistant's)

- **Comparing basins is still comparing amounts of structure.** "Deepest under the tilt" has to be decided somehow. If
  it comes down to counting distinct converged assemblies and comparing counts, that's close to a number, even if
  every piece is binary structure. The owner's answer, relativity, says the comparison is made between basins in the
  moment, under the tilt, not against a fixed scale. How the engine's competition makes that comparison without a hidden
  score needs to be designed carefully, and shown in the experiment.
- **How far does a neutral change ride along?** If many neutral changes pile up before anything gets better, the winning
  state carries all of them, including ones that played no part. The map keeps every attempt, so later convergence
  should separate the pieces that recur in what works from the ones that rode along once. But that's untested.
- **Where does heat come from, without tracing back?** Heat comes from what's unfinished: the places of the work still
  to be done. It has to tilt toward the parts connected to that trouble in the substrate, through the structure that
  links them, without following a chain backwards. The difference between "connected to the trouble" and "traced back
  from the trouble" needs to be clear in the build, or the rejected idea creeps back in.
- **The map grows.** Every attempt adds structure. That fits [nothing breaks](nothing-breaks.md), but cost at scale, and
  which parts of the map go cold, are open.
- **What is the goal, in the substrate?** In the experiments the goal is the worked example's answer, marked by the
  encoder, which is where heat comes from. Higher up the ladder (answers only) the goal is thinner, and heat has less to
  go on.
- **Heat as attention** (the owner's idea, not yet worked out): basins that heat doesn't reach aren't attractors at that
  moment. If that holds, the tilt doesn't only reorder basins, it also decides which exist for the moment. That would
  make the substrate's search small by construction.

---

## 5a. Residue heat (the owner's, raised straight after the exchange)

**The owner's idea, held for years.** Heat is like pain or discomfort, and it becomes associated with the experience: the
assemblies active when the heat arose form an association with it. Remembering that experience brings some of the heat
back, whether it was physical pain, embarrassment, confusion or frustration. Heat leaves a residue, and that's what stops
you making the same mistake again.

**It's bound to context, not to the thing alone.** His example: walking, someone steps on a slimy rock, slips and is
hurt. The pain becomes associated with the slimy rock, but not so generally that every slimy rock brings caution back.
On a nature documentary it doesn't. Out hiking, boots on, with a slimy rock ahead and the foot heading toward it, the
caution comes back. **It's the object together with the context that's associated with the heat.** So a convergence
alone doesn't carry residue. The residue sits with the context in which the heat began.

**It's relative to the goal.** As with the maze, if slipping on slimy rocks paid a million pounds, the same experience
would be good. Principally, heat leaves an association with where it was generated, its source, wherever that was.

**The assistant's reading.** This gives a structural way for the substrate to avoid dead ends. A change tried in a
context that produced heat carries that heat's residue, bound with the context. When the same change comes up again in
the same context, the residue makes its basin shallow. In another context it carries nothing. It refines the map of
section 2.5: the map itself is goal-agnostic, but residue is bound with the goal and context that produced the heat, so
a different goal doesn't feel it.

**Pushback.** "What was active when the heat arose" can't be everything that was on: in a running way of working all
its parts are on all the time, so residue spread over everything would tell nothing apart. It has to be what was
*acting* in that moment: the write that landed wrongly, or the reads whose digits it wrote. The first experiment uses
C180's blame for this, bound as residue in context, and says so.

---

## 5b. Residue generalises by convergence, and a sparse sample keeps it loose (the owner's, after C182)

**Between too specific and too generic.** Residue heat is associated with the object in its context, but that context
needn't stay narrow. The owner's illustration, deliberately stretched: the first heat from a slimy rock comes from
slipping on one while hiking. Later, something goes wrong around a slimy rock on a nature documentary, and again in the
city. Each experience leaves its own structure, and what they have in common is the slimy rock creating heat. **So it
does generalise, through convergence, structure over strength again.** It starts out specific, and as more varied
experiences overlap on the same object creating heat, the object itself becomes the common denominator. It's a spectrum
from specific to general, moved along by how much structure converges.

**A sparse sample makes it loose from the start** (raised with the owner's caution that it might be wrong). A new
assembly is formed from a subset of the active sub-assemblies, not all of them. That sparsity makes it a little fuzzy:
specific enough to point at the object in its context, loose enough to bleed into similar contexts, and so able to
gather convergence and become more general as structure builds up.

**The assistant's reading.** This answers what C182 found. C182 bound residue to the whole worked example (too broad), and
the obvious fix, the whole exact situation, would be too narrow, since nothing would ever generalise. With a sparse
sample, each mark of residue binds the part at fault with a few elements of the situation it arose in (a couple of the
other parts in play, perhaps the page). A later attempt feels the residue only if its own situation contains that sample.
A part that hurt in one company is free in very different company. A part that keeps hurting across varied situations
gathers marks with different samples, until it's a slimy rock almost everywhere.

**Pushback.** A sparse sample can miss the element that actually mattered. If the change hurt because of one particular
other part, and the sample didn't include it, the residue bleeds into situations where that part is fixed, and still
bars the change wrongly. How often that happens depends on the sample's size, a knob. The owner's answer would be
convergence: one wrong bar is outweighed when the change is tried again elsewhere and works. In C182's rule a barred
change can't be tried again, so the rule has to allow that.

---

## 6. What this means for the next experiment

The design replaces C181's four rules:

- **every attempt forms structure,** recording what was tried, where, and what happened (worse, no change or better);
- **a part's hold is its convergence,** the distinct situations and places where it was part of what worked;
- **heat from what's unfinished tilts** the competition between the parts in place and their alternatives near the
  trouble, and **the single deepest basin wins**;
- **neutral changes ride along** in the state;
- **the earlier, better state returns** when things get worse.

The test is the same two lessons as C179 to C181, against C180 (heat kept by the code). It has to report plainly which
of these the engine does and which the code still does.

---

## 7. Transcript

A record of the back-and-forth, paraphrased except where quoted. The owner asked for short, direct answers, each with
a question back to check calibration, and for a return to the usual methodical way of working once a solution was
reached.

**The assistant:** heat in the substrate kept changing too many things at once, and couldn't tell a part doing its job
from one that isn't. Should a part that helps something cool become harder to dislodge? **The owner:** instinct says
yes, but structure over strength questions the direction.

**The assistant:** then not a bigger number but more structure, another identical copy each time it works. **The
owner:** what are copies? **The assistant:** the same assembly formed again; more identical assemblies win. Is that
allowed, or should the hold come from how many different situations it has worked in? **The owner:** the latter. He's
wary of averaging, which is slow and leads back to ordinary machine learning, and would rather it came from structure.
He asked whether, to get through the experiment, structure could come from various contexts rather than duplicates.

**The assistant:** yes. Every page is different, and within a page every place cooled is a different situation, so a
part's hold can come from distinct structure per page and per place. It's present or absent, not averaged. **The
owner:** asked for it again in driving terms. **The assistant:** a mirror check that helped at a junction, a roundabout
and a parking space has three separate traces, and a tight grip that never helped has none, so the heat moves the
tight grip first. **The owner:** "Yep, that's the way I see it."

**The assistant:** should only one change at a time be made? **The owner:** it has to be one at a time, or you can't
tell cause from effect. **The assistant:** but some changes only work in pairs. Should a change that shows nothing be
kept for a while? **The owner:** it depends on whether the pair was found by chance or already connected. **The
assistant:** connected pairs are one piece; unconnected ones need a no-change change kept on probation, then bound
together if it pays off.

**The owner:** there are three states of affairs: worse, no change, better. **The assistant:** agreed. Worse is undone,
better is kept, and no change is not yet known and held loosely. **The owner:** yes.

**The assistant:** what ends a loosely held change? If a later change makes things better, they're tied in together; if
something makes things worse, they're undone together. **The owner:** that feels like drifting back into statistical
learning, correlation by another name. Associative memory learns by knowing what contributed, and the structure is built
out so that what worked and what didn't is traceable in it, through repeated exposure, structure over statistics, with
energy flowing through the structure. **The assistant:** agreed that credit should come from the path the activity
actually took, not from what tends to co-occur. Pushback: tracing explains a success afterwards, but doesn't find one
that needs two changes together. **The owner:** "I don't think so". Chaining or tracing backwards is messy, mechanical,
what machine learning does. Assemblies are states that persist until outcompeted, so ask it in terms of competition:
what makes the neutral things get lost? **The assistant:** every attempt starts afresh, only structure survives, and
structure was formed only on success, so neutral changes left nothing. In competition, a neutral change can stay in the
current state until outcompeted, and win or lose with it, with no tracing.

**The owner:** is structure formed only on success? **The assistant:** in effect, yes: a failure leaves nothing that can
come up again, which clashes with nothing breaks. **The owner:** "Absolutely. That's vital. Every failure should form
structure," and the maze: forgetting dead ends means repeating them; success and failure are relative to a goal;
memory is agnostic; learning is constant. **The assistant:** so the structure is the goal-agnostic map, and heat is the
goal. **The owner:** "Yes, that's the way I see it."

**The assistant** summed up the design and asked if anything was missing. **The owner:** not the word "habit", which means
strength. Structure comes from the abstraction or overlap of many assemblies built up over different situations, a
convergence, an attractor basin. Heat as a kind of attention (not fleshed out). And the tilting maze: flat, the basins
sit at fixed depths; tilted, their depths become relative to the heat. Is that helpful or a rabbit hole? **The
assistant:** helpful. It's exactly what C181 got wrong, a fixed bar, and the deepest basin under the tilt gives one
change at a time without a rule. **The owner:** asked for it to be written up as a theory note, captured in the context
it came from, and for the next experiment.

---

## 8. What the first test found (C182)

Built with the map, residue heat and convergence as structure in the substrate, and a small fixed rule reading them
([C182](../../experiments/sketches/C182-convergence-and-the-map/findings.md)). **There was no churn:** one change at a
time, kept, ridden along or undone cleanly, and the simple lesson was learned in 12 runs. **But the harder lesson stuck
one step short every time.** The two changes it needed had each been tried early, in the wrong company, made things worse
then, and were marked with residue as dead ends for the whole worked example, so they were never tried again. The residue
was bound to too broad a context. By the owner's own slimy-rock principle it should be bound to the whole situation it
arose in, including the rest of the way of working at the time. A change that hurt in one company is then free to be
tried in another, which is also what makes a needed pair findable.

**The second test (C183).** Residue bound to the part at fault and a sparse random sample of its situation, felt only where
the sample is present and weighed against convergence (section 5b). The second row was learned right in 2 of 3 seeds,
in 154 and 196 runs, against never in C182, with no churn and no coincidence. In every seed the first two worked examples
still stuck: the two changes needed together each made things worse alone, and worse is undone. Success came on a later
example where one half showed an improvement by itself. **The open question is the pair:** how the substrate should hold
a change that made things worse only because its partner wasn't there yet.

---

## 9. Second exchange: pairs, totals and getting out of a basin (27 November 2026, after C183)

A second quick back-and-forth, held the same way: short answers, each checked with a question back.

**The problem as put.** Two changes help only together. Each alone makes things worse, and "worse" was being undone, so
the pair was never found. In driving terms, easing the clutch alone stalls, gas alone revs, and only together does the
car pull away.

**Representing an AND is native (the owner's).** His control panel: buttons with no sign of which are connected. If
pressing two together lights a lamp, the two buttons and the lamp become one assembly, an AND. Associative memory does
that by nature. **The assistant:** agreed. The difficulty isn't representing the pair, it's finding it under one change
at a time. When a single press does nothing, the rules already work: it rides along, the partner is pressed, and the
lamp lights. The stuck case is when a single press turns off a lamp that was on, which counts as worse and is undone
before the partner is pressed.

**It's not capacity, it's a mixed effect.** The owner asked whether it was sparsity (too few assemblies kept active) or
something like a tie between good and bad. The assistant: the latter. The change does something right and breaks
something else, and judging it by the overall amount cooled lets the break outweigh the good. **The owner: stay away
from totals. A total is averaging. Everything is context-dependent: structure over strength, over averaging, over
totalling.**

**No verdicts: the trouble becomes the next heat.** Each effect is its own event in its own context. A place cooled is
structure, and a place broken is heat at that place. The change isn't kept or undone by a score. The place it broke
becomes the new hot spot, pulling in the next change, which is often exactly the partner. In driving terms: easing the
clutch starts the car moving and makes the engine struggle, the struggle draws the foot to the gas, and the car pulls
away. The first change wasn't undone. Its trouble pointed at its partner.

**This is the local optimum (the owner's).** He named it as the classic hard problem: hill climbing gets stuck in local
optima, because getting out means first going uphill, away from the goal. A rule that penalises every uphill step never
gets out. The assistant: the rule "worse is undone" is pure hill climbing. The classic escape is annealing, accepting
some worse steps, mostly at random, more while hot. (The repository is named after it.) Here the uphill step isn't
random: it's taken because the trouble it causes points at the next move.

**Objective search and novelty search (the owner's).** He recalled Jeff Clune and Kenneth Stanley's novelty search, the
other end from objective search. Objective search gets stuck in local optima. Novelty search drops the objective and
only explores, so it can diverge without ever converging. The two have to be balanced. His picture of the hiker:
climbing a hill toward the goal, slipping on mud and slimy rocks. The basin below has already been tried, so it's full
of heat and pushes him out. The slimy rocks push him sideways, to where there's a staircase, and he climbs. Trying to go
back down only brings him back to heat, and heat rises. So **the basin fills with heat, and heat pushes you out of it**
until you tip over the rim and fall into the better basin. **The best so far isn't sacred:** sit in it long enough
without finishing, and it fills with heat like anywhere else.

**Lateral moves, like lightning (the owner's).** The learner can see the general way forward but can't go there
directly, so they move sideways. A driver who stalls might change down to first gear, which helps; add a touch of gas,
which helps; or press the window button, which does nothing for moving forward. All are lateral moves. Some ease the
trouble a little and so move the learner toward the goal, and others do nothing. It's like a lightning bolt through
matter, finding the path of least resistance, with heat as the guide pushing it on.

**The rule that follows (agreed):**
- a change that causes trouble is kept, not undone;
- the trouble it causes is where the next change goes;
- any local easing of heat is progress, with no totals;
- the stuck place already visited is full of heat on the map, so going back to it is unattractive;
- the best so far isn't a safe home.

**Left open (the owner):** whether a whole direction should be given up after repeated sideways failure, or whether heat
alone handles that.

**The third test (C184): nothing undone.** The rule from section 9 was built as stated: every change kept, its trouble
heating the parts acting there, no return to anything already tried. **It drifted:** the second row was learned in none of
three seeds, and times one digit in two of three. The trouble a change caused didn't reliably point at its partner. The
heat went back to the part just moved, which had no convergence yet. And with no way back, nothing held the learner near
the good place long enough. So neither extreme works: the best so far as a safe home (C183) sticks, and no way back
(C184) diverges. The owner's picture is the middle: **the basin fills with heat and pushes you out**, so you return to
the best so far unless its own heat has built up past where you are now. That's heat compared with heat, with no totals.

**The fourth test (C185): breadth from the trouble.** After a third short exchange (running off without returning was
depth-first; returning and trying only single changes was breadth-first one step deep; the balance is logical, not a
midpoint), the search was anchored at the best so far and widened breadth-first from the trouble: single changes nearest
first, then pairs. The best was replaced only by an attempt cooling every place it had and more, by inclusion, not a
total. **It neither churned nor drifted, and learned the second row in 1 of 3 seeds.** In the others, a coincidental step
carried the anchor into the wrong basin, four changes from the right way of working, beyond what pairs can reach. The
owner's picture suggests the fix: a full basin pushes you out back along the way you came. So keep the path as anchors,
and when the current basin is exhausted, back off a step and widen there.

---

## 10. Third exchange, and the fifth test: schema from overlap (27 to 28 November 2026)

**The owner's turn.** We'd slid into search-algorithm thinking (depth-first, breadth-first, rings), while associative
memory offers something else: completion. What's missing is generalised abstraction. Like "more load needs more push",
shared by cycling uphill, walking uphill, go-karting and the car, high-level pieces are fuzzy, so few need moving to find
a fit, and a click up there brings the specific pieces into place. Abstraction isn't layered: it comes from Sagan's
intercomparing, which synthesises, analyses and generates abstractions, and does so again on the abstractions, in any
direction. He first pictured a second volume doing this in the background. Then he asked whether the super-assemblies
already formed could be built on, with hubs over hubs at their overlaps. And he realised that **spatial memory comes
first: the schema is distilled from the overlap of many spatial experiences, and then becomes the hub that connects
them.** So search is completion, and the question is how pieces are connected.

**The assistant's pushback.** The pieces here are described by where they sit. Overlaps of positions can only say "this
stays here", not a relation like "more load, more push". So two kinds of hub were tried.

**The fifth test (C186).** Every pair of kept ways of working was compared, what they shared became a hub, and hubs were
compared in turn. **Hubs of shared relations** (how one part sits relative to another) were used for completion: when a
part moves, its related parts snap along by the most widely shared relation, tried as one change. **The second row was
learned in all three seeds** (287 to 355 runs, 200 of 200), against 1 of 3 without hubs. Hubs of shared positions were no
better than none. The first successful changes on a hard example were completions carrying three or four parts at once.
A coincidence was settled on the way and outgrown by the next example.

**The sixth test (C187): a stress test.** The owner asked how general these abstractions get. The next lesson in school
order, the final adding, is adding laid out differently: it reads two rows far apart and writes far below. **It wasn't
learned, with relation hubs or without** (0 of 200 in all six arm-seeds). The start rightly brought up adding, but five of
its parts had to move far, and almost no relations between parts were shared at the grain they're held: exact offsets.
Only the carry written one left of where it's read, and the sign written along, carried over. **The hubs are too
specific.** What adding and the final adding share is looser (the answer below what's read, the carry between, moving
left), which is the owner's point that sparse, fuzzy assemblies point at the right thing yet bleed into similar
situations. Next: relations held more loosely.
