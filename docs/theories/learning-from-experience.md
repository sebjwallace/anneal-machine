# Learning from experience: carrying knowledge forward

A theory note, from a conversation between the owner and the assistant (27 November 2026), written after the
experiments C171 to C178. Unlike most notes here, **much of it has been tested**: each claim says which experiment
showed it and how far that goes, and what hasn't been tested is said plainly. It is about how the memory learns from
experience, keeps what it learns, and carries it forward: how one skill becomes the starting point for the next, so
that learning gets cheaper the more is known. It's written in the engine's own terms and in plain words, with long
arithmetic as the running example. The owner's points and the assistant's are kept apart and marked. The last section
records how the conversation moved, as a transcript.

Related: [schema and spatial memory](schema-and-spatial-memory.md) (frames, procedures and composition on both sides;
the starting point for this note), [content and spatial memory](content-and-spatial-memory.md), [categories from
context](categories-from-context.md) (abstraction as the recurring intersection), [candidate energy
rules](candidate-energy-rules.md) (heat-driven settling, spreading from the gap), [the tilting
landscape](the-tilting-landscape.md), [nothing breaks](nothing-breaks.md) (learning only adds structure), and the
[crutch register](../../experiments/crutch-register.md) (what is still given, experiment by experiment).

---

## 1. Where this came from

**The goal (agreed earlier).** The engine should learn procedures, such as long multiplication, from experience, using
its own dynamics only: completion, competition, binding, and the cooling of heat. It should form facts, frames,
procedures, hand-overs and anchors, and carry them out on new inputs of any size, with no controller and no code doing
its thinking. The way there is a ladder. First, examples with all the working shown. Then examples with some of the
working shown. Finally, questions with answers only. Every crutch on the way is declared and removed in turn, smallest
first.

**Where the work stood at the start.** By C170 the memory could carry out long multiplication whole, from one cue to
the final answer, with no code steering it while it ran. But every part of that had been written by hand: how each row
is worked, how one row hands over to the next, where each starts. The question became how much of it the memory could
learn, and how.

**The turn this note is about (the owner's).** Partway through, the work had made the second row of long
multiplication learnable, but only by blind search: my code listed about 137,000 possible ways of working, and the
memory judged them. The owner stopped and asked whether we were setting the memory up to fail:

> "It's very unlikely a human is able to pull off long multiplication as the very first thing it learns … You wouldn't
> expect a human to learn long multiplication without learning anything about mathematics before. It's very reasonable
> instead to have them learn the basics first and then build up their skills … Because as you learn, you reuse the parts
> that you previously learned."

And, on how the reuse should happen:

> "Pre-existing knowledge is already sort of broken down into chunks or sub-assemblies … assemblies are reusable and
> interchangeable … The question then is, how do you adapt what you've learned, and how do you bring in what you've
> previously learned into context of what you're learning now? And it should be good old-fashioned associative memory …
> the context you're in already brings about, through associative memory, the pieces that you already have. It's now
> just finding how they fit together. And that is typically done piece by piece, depending on where heat is. So heat
> guides you in trying to find the pieces that fit, and when they fit, it cools."

That's the theory this note sets out and reports on: **learning is cumulative**. What's learned comes up again by
association when the situation calls for it, and it's fitted to the new situation piece by piece, where the heat is.

---

## 2. The illustration the owner asked for: learning to drive

The owner asked for the problem to be put in terms of something mechanical other than arithmetic, and suggested
learning to drive. The assistant's illustration, which became the shared language for the rest of the work:

- **Judging is the easy part.** Did the car stay in the lane, stop at the line? Anyone can tell a good attempt from a bad
  one. In the memory this is agreement with a worked example: the working cools when it matches. The memory has had
  this since C171.
- **The instructor's demonstration** is the worked example. **Driving and checking yourself against it** is doing and
  checking (section 3.1).
- **What to try is the hard part.** Someone who has never driven faces an enormous number of possibilities at each
  moment: which pedal, how hard, how far to turn the wheel. Blind search tries every combination. It finds the answer
  eventually, but nobody learns like that.
- **People reuse what they know.** If you can ride a bike, you already understand steering, braking and leaning into a
  bend. If you've been go-karting, you know how pedals work. The pieces come up by themselves when you sit in a car,
  because the situation is like those. That's reuse by association (section 3.4).
- **People fix what's wrong right now.** The car drifts left, so you try a little right. If it helps you keep it, and
  then you deal with the next thing. You never consider everything at once. That's adapting toward the heat
  (section 3.5).
- **People recognise the situation.** A roundabout brings up the roundabout habit, and a junction the junction habit.
  That's context (section 3.6).
- **A choice that didn't matter can come to matter.** If you learned to steer a bike with whichever hand, that was fine
  on a bike. In a car with the gear stick on one side, it matters which hand does what. That's the trouble with equals
  (section 3.3).

---

## 3. What was found, principle by principle

Each principle is stated in the memory's terms, then the evidence, then how far it goes.

### 3.1 A worked example teaches only if its working is something to agree with

**The principle.** A worked example can be used in two ways. The memory can read the working off the page, or it can do
the problem itself, from a page showing only the question, and check its own writing against the worked answer. Only
the second teaches the order of things and what depends on what. A finished page shows everything at once, so it
doesn't say what had to come before what.

**The evidence.** In C171 the memory was learning how long multiplication's ways of working fit together. With the
working readable on the page, two orders fitted equally well ("second row, then adding" and "adding, then second row"),
because the adding could read a second row that was already written. With the working as a target, so that the memory
had to write the second row itself before the adding could read it, exactly one order worked, every time. C172 then used
the same principle to find the second row's whole way of working (what it holds, reads, writes, where carries go,
where it starts) from a question-only page.

**How far it goes.** It was shown for composition (C171) and for a way of working (C172). Every later experiment uses
it. It closed a quieter leak in earlier learning, where ways of working had been reading carries from the worked page
instead of from their own writing.

### 3.2 Keep what did the work, when it works; repetition does the choosing

**The principle.** When a page settles, meaning all of its working has cooled, the memory keeps the way of working that
did the work. It keeps it as another copy of the link that brings it up. Nothing outside the memory decides what to keep.
On the next example, the memory first tries what it has kept. The right ways of working keep being right and gain
copies. The ones that were right by coincidence stop working and fall behind.

**The evidence.** In C173 one memory worked six worked examples and was then tested, without being rebuilt or copied.
The search on the first example had found six ways of working that settled it: three right, and three that held a digit
which happened to equal the one they should have held. On every later example only the right ones settled. In C178,
with four second-row examples, a coincidental way of working learned from the first example was beaten by the right one
by the fourth (3 copies against 1).

**A refinement found the hard way (C176).** *Keep only the way of working that did the work.* Something that drifts in
during a run and does nothing must not be linked to the success. In one run an idle passenger was kept along with the
real thing, and it later won where it shouldn't have. Binding now keeps only the frame that was on when the work
started.

**How far it goes.** It's shown in one memory, over a handful of examples, for ways of working started from the cue.

### 3.3 Equals tie for ever, and a choice that doesn't matter now can matter later

**The principle.** Repetition can't separate ways of working that are truly equal, because it reinforces them equally.
In C173 three equally right second-row ways of working, which differed only in which of three identical signs they read,
stayed tied for ever. So the memory brought up none of them, and used none. Breaking the tie once is enough: after that,
the winner keeps winning by repetition. But which equal is chosen can matter later.

**The evidence.** In C175, adding settled six equally right ways of working, one for each order of reading its three
digits, since adding treats all three alike. Times one digit doesn't: one digit is held, one is read, one is the carry.
Offered one at a time, only one of the six led on to times one digit. The other five led nowhere. An arbitrary
tie-break would have had a five-in-six chance of keeping a dead end. In C176, with one memory, the start brought up all
six as rivals and the memory tried them all, so the one that carries over was found whichever had been chosen for
adding.

**How far it goes.** The tie-break used so far ("the first formed wins") is a declared crutch. Keeping the equals and
trying them when needed is the safe course, at a cost. How the engine itself should settle among equals is open
(section 6).

### 3.4 What was learned comes up by association in a new situation

**The principle (the owner's).** The new situation brings up what's already known, by association. What's kept is
linked to the situation it was learned in. A new situation that shares some of that brings it up as a candidate. If it
doesn't fit as it is, it's the starting point for adapting.

**The evidence.** In C175 the reuse was done by my code: it read pieces off adding's ways of working and offered only
candidates those pieces allowed. Times one digit took 180 tries instead of 1,112. In C176 that crutch was removed. One
memory went through both lessons. On the first times page, the start brought up the adding ways of working, because
they share the start, though not the sign. None worked as it was. Four got the first column right and then stopped. The
nearest were changed one part at a time, and one became times one digit: hold the bottom digit instead of reading it
each column. Lesson 2 took 12 runs, with nothing carried over by code.

**How far it goes.** Those two lessons look almost the same on paper, so one change was enough. That's why C177 was the
real test (section 3.5).

### 3.5 Adapt toward the heat, piece by piece; keep what cools more

**The principle (the owner's).** Fitting is piece by piece, where the heat is. The places of the working still to be
done are hot. A part that writes is pulled toward a place that still needs writing. A part that reads goes only to a
place with something there to read. Each part moves on its own: nothing is grouped together because the answer needs it.
A change is kept if more of the working cools. If no single change helps, two changes together are tried.

**The evidence.** In C177 the memory had learned adding and times one digit, and then met the second row of long
multiplication. That's five parts away from anything it knew: the answer three rows lower, the carries in a different
row, the top read one place over. Blind search had needed 136,922 tries for it (C172). The start brought up times one
digit, which wrote on top of the first row and cooled nothing. Adapting it toward the heat went like this. The answer
moved down. The carry write moved to the carry row. The top read moved one place over. Finally, the answer and the
carry read moved together. Then the page settled. The second row took **412 runs** in all, and the learned way of
working got 200 of 200 new second rows right. It's the same as the one once written by hand.

**A caution that came true.** The first worked example taught a coincidence: a way of working that read the carry from
the wrong place, which happened to give the right carries on that page. The second example caught it. **One example can
mislead. Two are the minimum.**

**How far it goes.** The adapting rule is still the code's. It's now small and local, but the code proposes the changes
and the memory judges them. Heat marks where the work is, and heat is still marked by the encoder (it knows the worked
example's places).

### 3.6 Context is what lets learning accumulate

**The principle.** A memory that holds several ways of working has to recognise which one the page in front of it calls
for. Without that, what it has learned can't be used when it's needed, and the nearest known thing can't be found to
start from.

**The evidence.** In C177 all the memory noticed at the start was the sign. A first row and a second row both start
under "×", so on second-row pages it brought up times one digit every time, and got 0 of 200 second rows right from the
start, though it could do them. In C178 the memory saw what's at each place within reach of the start (a digit, a sign
or nothing) and kept that view with the way of working. The best-matching view brings it up. In one memory, adding,
times one digit and second rows were all 200 of 200 from the start, each kind of page bringing up its own way of
working. It also made learning cheaper. On the second example the start brought up the memory's own rough first
attempt at a second row, because its view matched best, rather than times one digit. That attempt was one change from
right, so adapting took 43 runs instead of 208. The second row took 258 runs over four examples.

**How far it goes.** The view is still handed in by the encoder, as the kind of thing at each place. The memory doesn't
yet look for itself, and it ignores which digit is where.

---

## 4. Learning gets cheaper: the numbers

The owner's claim was that the more is learned, the faster later learning becomes, because what's learned is reused.
In the experiments so far:

| skill | how it was learned | tries |
|---|---|---|
| the second row | blind search, nothing known (C172) | 136,922 |
| the second row | blind search recounted with heat first and pieces of the first row (C174) | 15,646 |
| times one digit | from scratch (C175) | 1,112 |
| times one digit | with adding's pieces, carried over by code (C175) | 180 |
| times one digit | in one memory that had learned adding, by association and one change (C176) | 12 |
| the second row | in one memory that knew adding and times one digit, adapted toward the heat (C177) | 412 |
| the second row | the same, seeing more at the start (C178) | 258 |

Tries are whole runs of the memory on a page. The first lesson of all (adding, 2,052 tries) is still learned by the
code's search from scratch. Nothing comes before it.

---

## 5. What is still given

Declared in full in the [crutch register](../../experiments/crutch-register.md). In plain terms:

- **The adapting is the code's.** It proposes small changes toward the heat, keeps the ones that cool more, and breaks
  ties in a fixed order. The memory judges every change. The proposing is the next crutch to remove (section 7).
- **Heat and the view are marked by the encoder.** The encoder knows which places of the worked example are the working
  to match. It also hands in what's in view at the start, as a digit, a sign or nothing at each place.
- **The first lesson is found by the code's search.** It's cheap, because the page is small, but it's still a search.
- **The page is set up by the encoder,** with padding zeros, zero carries at the start of each row, the second row's
  placeholder, and a fresh sheet for each problem.
- **The facts are given** (the times tables and adding facts), as are the signs' meanings.
- **The order of lessons** is the usual school order, fixed before looking at what later skills need. It's a syllabus,
  and a crutch, declared.
- **For the second row, the start and the hand-over are given** (they were learned separately in C171, in another
  memory).
- **A tie-break** ("the first formed wins") is used where equals must be settled.
- **The vocabulary of parts** (every kind of part at every place in reach) and the frame cells are made in advance.
  They're general and don't grow per task. But the frame cells used for failed attempts stay behind, unused.

---

## 6. Pushback and open questions

**The assistant's pushback, kept as the owner asked.**

- **The lessons so far are kind to reuse.** Adding and times one digit look alike on paper. The second row was harder,
  but it was still "the same thing, lower down and one over". A lesson that shares less with anything known is where
  reuse would really be tested.
- **The heat restriction may be doing a lot of the work.** Writes move only to places of the working still to be done,
  and the encoder knows those places from the worked example. Without marked heat, as at the top of the ladder (answers
  only), the adapting would have far more to try. How much of the saving survives there is unknown.
- **The curriculum can smuggle the answer in.** If lessons are chosen by looking at what a later skill needs, the answer
  is in the syllabus. The safeguard so far is the usual school order, fixed in advance. It should stay fixed in advance.
- **Two examples can still mislead.** Coincidences fell away with repetition here, but pages with small numbers or many
  zeros make coincidences more likely.
- **Failed attempts leave structure behind.** Each change tried is a new frame cell. Those that fail stay unlinked and
  are never brought up, but they accumulate. That fits [nothing breaks](nothing-breaks.md) (learning only adds), but
  the cost at scale isn't known.

**Open questions.**

1. **How should the engine itself settle among equals?** A tie only needs breaking once, and anything that gives one
   equal a single extra copy would do. One candidate is stopping at the first offer that works instead of trying them
   all. But section 3.3 says an early choice can block later reuse, so maybe the equals should be kept and the choice
   made late.
2. **How do the pieces get pulled toward the heat by the dynamics, not by a rule?** This is the next experiment
   (section 7).
3. **What should the memory see at the start, and how should it look?** At present the encoder hands in the view.
4. **How far down do the pieces go?** So far a piece is a whole way of working, adapted part by part. The owner's
   picture is sub-assemblies at every scale, reusable and interchangeable. The experiments haven't yet reused a piece
   smaller than a way of working, carried from one into another.
5. **Where do the first lesson and the facts come from?**

---

## 7. The way forward

In the order agreed with the owner, each step one thing at a time:

1. **The adapting becomes the engine's own.** Round one of a fan-out over the three candidate energy rules (C179) found
   heat lowering the bar the cheapest and steadiest, spreading from the gap stuck, and a random budget unreliable. See
   [candidate energy rules](candidate-energy-rules.md), section 7. Round two builds it into the dynamics: where the working is still to be done
   draws the writes, and what's there to read draws the reads, with competition and cooling deciding, not the code
   listing changes.
2. **Long multiplication end to end in one memory, in school order:** the first row, the hand-over, the second row and
   the final adding, each standing on the last.
3. **The encoder's help on the page:** the padding, the zero carries and the placeholder. This changes the ways of
   working, so it's cheaper once adapting is the engine's.
4. **Up the ladder:** partial working, then answers only, which means the heat is no longer marked by the encoder.

---

## 8. Transcript: how the conversation moved

A record of how the thinking moved on 27 November 2026. It's paraphrased except where quoted, and the owner's words
and the assistant's are kept apart.

**The second row found, and the question of what was really achieved.** After C172 the owner asked, in plain terms,
what had been achieved. The assistant: the second row was no longer written by hand. The engine had judged its way to
it, but from options the code listed, "like a multiple-choice test where I wrote the choices". The owner asked whether
that was the final goal, surprised at the pace. The assistant corrected the impression: many crutches remained (the
proposing, the choosing, the encoder's help, the facts), and the work was on the first rung of the ladder.

**The order of crutches.** The owner asked which crutches to tackle first, and whether removing one would help with
others. The assistant argued that choosing (keeping what works) came first, because proposing depends on the memory
holding what it knows. That became C173. Then came proposing, because the others (the encoder's help) change the ways of
working, and re-finding them would be cheap only once proposing was no longer blind.

**Variation looked hopeless.** The assistant's first plan for proposing was to vary what the memory knows. A desk check
showed the second row was five parts away from the first row, and that varying parts freely would mean billions of
options. The owner said this was something his theory hadn't yet thought through, and asked for an illustration outside
arithmetic. That's where the driving picture came from (section 2).

**The owner's picture.** Pre-existing knowledge is in chunks, sub-assemblies all the way down, reusable and
interchangeable. The context brings them up by association. They're fitted piece by piece where the heat is, and they
cool when they fit. He first suggested a phase of arbitrary play to harvest sub-assemblies. The assistant pushed back:
arbitrary play harvests arbitrary pieces, and designed play risks putting in exactly what's needed. The owner agreed,
set play aside as inefficient for now, and proposed gradual learning instead: basics first, each skill built from the
last. He also suggested the experiments had been set up to fail by asking for long multiplication first.

**Two lessons, then one memory.** C175 showed reuse cutting tries, with the code carrying pieces over. The owner asked
what was being carried: were assemblies being copied in? The assistant: no, the code read how a way of working's parts
sit relative to each other and suggested only matching candidates, "an instructor saying put your hands where they were
on the handlebars". The owner: "We don't want this crutch to carry on any further … it was there to test the first
thing … now we need to remove the crutch that allowed that proof to happen, so that we can prove the other piece, which
is that learning is then transferable." That became C176.

**A lesson that looks different.** For C177 the assistant warned that deciding which parts move together would be a
way of slipping the answer in, so each part had to be pulled by the heat on its own. It worked, in 412 runs. The owner
then asked for the context problem to be tackled, which became C178.

**This note.** The owner asked for the theory of learning from previous experience, carrying knowledge forward and
reusing it to be written up, which is this document.

---

## Postscript (28 November 2026): the adapting, after C179 to C186

Making the adapting the substrate's own went through several designs, each recorded in [convergence and the
map](convergence-and-the-map.md):
- energy that churned (C181);
- structure with competition, one change at a time, stuck one step short (C182);
- residue with a sparse sample, 2 of 3 (C183);
- nothing undone, which drifted (C184);
- anchored, widening breadth-first, trapped by a coincidence (C185).

What worked best was the owner's idea that **the schema emerges from the overlap of experiences** (C186). Hubs of shared
relations over the kept ways of working, used for completion, learned the second row in all three seeds. Reuse of
knowledge, the theme of this note, turned out to need abstraction from overlap, not only the nearest specific experience.
