# Schema and spatial memory: composition on both sides

A theory note, from a conversation between the owner and the assistant (26 November 2026). **Nothing new here has been
tested.** It sets out the next step for learned computation: how procedures are composed out of procedures, and the
realisation that composition (sub-assemblies, assemblies, super-assemblies) belongs on **both** sides of memory, the side
that holds what things are and the side that holds where they are, and straddles the two. It is written in the
engine's terms, on purpose without the details of any experiment, so that it says what the experiments are trying to
show rather than how they happen to be built. The owner's points and the assistant's are kept apart and marked, and
the last section records the conversation as a transcript.

Related: [content and spatial memory](content-and-spatial-memory.md) (where the two sides were first worked out, and
the long transcript of the experiments since), [procedures from states and
transitions](procedures-from-states-and-transitions.md) (frames, the frame of the whole, switching, subroutines),
[learned computation](learned-computation.md), [categories from context](categories-from-context.md) (abstraction as the
recurring intersection), [the tilting landscape](the-tilting-landscape.md) (held context as tilt), [flow and
heat](flow-and-heat.md) (fast on slow). Experiments that led here: C137 to C164.

---

## 1. Where this came from

**The path so far (the owner's summary, with the assistant's).** The learned-computation work started from the idea in
[content and spatial memory](content-and-spatial-memory.md): memory addressed both by what something is like and by
where it is. At first the "where" was absolute, a grid of coordinates. The experiments soon showed that what matters is
**relative** place: where something is in relation to something else, in relation to a focus. A thing is bound to a
place, but the place only means anything relative to the things around it. The owner's picture is that this is one
substrate seen from two sides, much as classes and instances are one program seen two ways: one side says what kinds of
thing there are and how they relate, the other says where particular things are and how they are arranged.

**A better name (the owner's).** "Content memory" undersells the first side. What it holds is the **schema**: the kinds,
the facts that relate them, the ways of working. **Schema memory** and **spatial memory** are the two sides from here on.
("Content addressing", meaning finding something by what it is like, is still the right name for one way of reaching
into memory.)

**What prompted this note.** The experiments got single procedures working well: a constant way of working applied over
any input, with values carried between steps. They then reached for something bigger, procedures handed over to other
procedures depending on context, and got stuck. The owner recognised the shape of the problem: **procedures within
procedures**, a hierarchy, which in this theory is composition, and composition is done with super-assemblies.

## 2. The owner's principle: procedures compose like everything else

Procedures have a lot in common and they also vary. Through composition, decomposition and abstraction, they can be
composed out of one another, just as anything else in memory is. That composability is also what lets them **switch
between each other** depending on context.

The **frame** is what makes it possible. A frame is a hierarchy of assemblies: sub-assemblies composed by a
super-assembly. The super-assembly doesn't take all of each sub-assembly. It takes **a subsample** of its cells and forms
those, in aggregate, as the super-assembly. That **sparsity is a good thing**: a sparse connection worked better than a
dense one in the owner's experiments. A super-assembly can then be part of another super-assembly, and so on up, to a
"supermassive" super-assembly.

**Static and dynamic.** Composing assemblies out of assemblies gives a static structure. What makes it dynamic is that
everything is connected, so depending on context, **completion brings on different combinations** of the interconnected
assemblies, switching back and forth. Structure built out of structure, all of it composable, and **recomposable on the
fly**.

**Emergence.** Super-assemblies should form by themselves, because they are abstractions: the overlaps between things,
the parts that stay stable and consistent. Those overlaps are the frames, and frames allow composition.

**In the owner's analogy:** if a single procedure is an instance with a method, the next step is several classes whose
methods are interconnected into a larger procedure. That is composition.

**And the new realisation:** the owner had only ever thought of composition on the schema side. It belongs on the
spatial side too, and ultimately it spans and straddles both, because they are one thing seen from two angles.

## 3. The structure (the assistant's account, in the engine's terms)

**Two kinds of assembly.** Schema memory's assemblies are kinds, and its associations are facts ("this with that gives
this") and ways of working. Spatial memory's assemblies are places and, more usefully, **relations between places**:
above, beside, the next one along, relative to a focus.

**Binding the two.** An instance is a schema assembly bound to a place, a temporary pairing in the spirit of the owner's
latches. A workspace (a page, a scene) is a set of such bindings. Memory can be entered from either side.
**Spatially:** what is at this place? That is completion from a place to its content. **By content:** where is the thing
like this? That is completion from content to a place. Spatial addressing reads, and content addressing finds.

**A frame spans both sides.** A step of a procedure is neither purely schema nor purely spatial. It is a super-assembly
composed of:
- **relative places**: where to look and where to write, relative to the focus;
- **schema relations**: which associations to apply to what is found there;
- **what is held**: values that must stay on because the space can't keep them for the procedure;
- **a move**: where the focus goes next.

That super-assembly is the **constant**. The **variables** are whatever is bound at its places at the moment it runs.

**A procedure is a super-assembly of frames.** Frames are chained by transitions. The procedure holds a sparse sample
of each of its frames and of the hand-overs between them, so it is light and doesn't swallow its parts. Procedures share
frames, so they overlap and interweave. Procedures of procedures repeat the same rule upward.

**Spatial super-assemblies (the assistant, following the owner's realisation).** Relations between places compose too.
Compose "the next one along" and you get a run of places, a line. Compose lines and you get a block, a region. Larger
spatial structures follow: "this line", "where this line starts", "where the next line begins". These are
super-assemblies on the spatial side, **layouts**, schemas of *where*. Until now the focus has only moved by single
relative steps, and every place has been relative to the focus. A move to a place picked out by a larger spatial
structure, rather than by one step from where you are, is a **jump**. There are then two kinds of jump. **Content
addressing** goes to where a thing is. **A spatial super-assembly** goes to a region's start, its end, or the next region.

**The two composed together.** A frame at a higher level binds a schema super-assembly to a spatial one: *this
procedure, over this region*. Composition happens on both sides at once. Schema-side composition gives the procedure of
procedures. Spatial-side composition gives the scopes those procedures work within and jump between.

## 4. The dynamics

**Running a step is completion.** The focus is somewhere. The frame's relative places complete into whatever is bound
there. That content completes through the schema's associations. The result is bound into a place, which changes the
workspace, and the change is the next moment's context. Nothing outside the memory steps it along.

**Choosing a frame is completion and competition.** What is in view, plus what is held, plus where the procedure has
got to, completes into the frame that fits this moment. Rival frames compete, and the one with more support wins.

**A procedure biases, it doesn't direct.** A procedure super-assembly, while held, **tilts the landscape**: it primes its
own frames and their hand-overs, so the right one is easier to complete into. It is held context, not a controller.
**If it ever acts like a central program counter, a CPU has been rebuilt out of assemblies**, and what makes this
different is lost.

**Hand-overs happen on arrivals.** A frame reaches its end, for example nothing left where it reads. That ending is an
**arrival**, an event, and the arrival is what lets the next frame win, within the procedure that's held. (This is the
"arrivals, not held states" point from [procedures from states and
transitions](procedures-from-states-and-transitions.md) §5, and it is needed here.)

**Fast on slow.** Frames turn over quickly. Procedures persist as anchors. Higher procedures change more slowly still.

## 5. Learning

**Heat** is what is unexplained. A completion that explains it, so that nothing is left hot, **settles** and is bound.
**Repetition** adds structure to what recurs. **The overlap of many episodes is the abstraction**: what stays the same
across experiences is the frame, and what varies is its content. That overlap is the super-assembly forming. The owner's
sparse subsample fits this: a super-assembly holding only part of each piece leans on what is consistent rather than on
what is incidental. (The last point is the assistant's speculation, not yet seen in an experiment.)

**What the experiments have already shown about this, in principle.** Remembering a way of working together with
everything that was in view when it worked lets context choose it, and when context chooses, it almost never chooses
wrongly. But binding every memory to its whole situation makes every memory unique, so repetition can no longer pool
identical memories and winnow variants down to one. Competition can pass on what tied memories agree on, which is
abstraction happening at the moment of recall. These point the same way as the owner's principle: **a way of working
should be one thing that repetition strengthens, with the situations that call for it composed above it**, not a copy
of it per situation.

## 6. What the experiments are trying to show

In these terms, five claims, in order:

1. **A constant frame with variable contents generalises.** The memory runs a method, not a lookup of remembered
   cases. *Shown.*
2. **Values are carried between steps,** by binding them into space ahead of the focus, or by holding them when space
   can't. *Shown.*
3. **Several frames live in one memory, with context choosing and hand-overs between them.** *Half shown:* context
   chooses right when it chooses, but often can't, and there is no procedure super-assembly yet to hand over with.
4. **All of it is learned from experience,** by cooling heat, with structure from repetition and overlap. *Partly:* the
   experiment's code still proposes what to try for anything new, and composition hasn't been learned at all.
5. **The running is the memory's own dynamics, with no controller.** *Shown for a single procedure.* Not yet for
   hand-overs or jumps (both still done by hand).

## 7. Pushback (the assistant's)

- **Not every switch needs a super-assembly.** Sometimes what looks like two procedures is one frame with an
  alternative that context selects: a polymorphic method, not two classes. The experiments met exactly this once.
  Composition and alternatives are both just assemblies, so the theory covers both. Let the evidence say which is which.
- **A bias, not a boss.** The procedure super-assembly must stay held context that tilts completion. The test of that is
  that a strong enough context can pull the memory out of a procedure part way, the "switching halfway" of the earlier
  note, without anything telling it to.
- **Emergence is the real question.** A super-assembly written by hand shows whether the representation can work.
  Whether the memory forms it by itself decides whether this is learned computation or a well-designed program written
  in assemblies.
- **The crutches have grown.** The experiments currently give more than they should (proposing candidates, marking
  heat, the start and restarts, the facts, the fixed layout). Each new step should leave at least as many crutches out
  as it puts in. They are listed in the [crutch register](../../experiments/crutch-register.md).

## 8. Open questions

- What forms a procedure super-assembly: the overlap of episodes, as for frames, or something about the arrivals that
  join frames in sequence?
- Does the sparse subsample, which worked for composing patterns, also keep composed procedures from swallowing their
  frames?
- What is an arrival in this engine: a frame's completion, its failure to find anything, its end state, or all of these?
- Are spatial super-assemblies formed from experience as layouts, or do they come from the regularity of movement itself
  (a line being what repeated "next one along" traces out)?
- How do the two jumps relate? Is a spatial jump content addressing on spatial assemblies?
- Where do held values live once procedures nest? Each level needs its own, within the population's budget.

## 9. The way forward: one thing at a time

**The owner's instruction:** this is a bigger idea, so take it in small, controlled steps and prove one thing at a time.
In that spirit, the order the assistant suggests:

1. **A hand-over on an arrival, written by hand.** Two frames, held by a procedure super-assembly. When the first frame
   reaches its end, the second takes over, with nothing outside the memory saying so. No learning, no jumps.
2. **A spatial super-assembly and a jump, by hand.** A frame that moves the focus to a place picked out by a larger
   spatial structure ("where this line starts") rather than by a single step.
3. **The two together, by hand.** A procedure of procedures running end to end with its hand-overs and jumps.
4. **Then learning, one piece at a time:** the procedure super-assembly from episodes, then the spatial ones, each with
   the crutches it replaces named.

Each step gets a hypothesis before it runs and a ledger of what is given.

## 10. Transcript

**The owner** stepped back and summarised where things were: associative memory doing procedures by relative spatial
memory, with assemblies bound into space; spatial memory as the counterpart to schema memory, like instances to classes;
largely successful, except that multiple steps of a procedure have to switch context, which worked for simpler
procedures and got fuzzier for bigger ones. **The assistant** agreed largely, with two corrections. The spatial side had
held up, and the first thing the space couldn't do was keep a value along a whole run, so holding came in as a third
thing. And the difficulty isn't space failing to hold things together, but having several procedures in one memory and
switching between them.

**The owner** connected this to a theory note of his: procedures within procedures as a hierarchy, composed like
anything else; the frame as super-assemblies over sparse subsamples of sub-assemblies; static composition made dynamic
by completion switching between interconnected assemblies; super-assemblies emerging as abstractions; and asked whether
composing procedures by super-assemblies is what's needed. **The assistant** read
[procedures from states and transitions](procedures-from-states-and-transitions.md) and agreed: the note already says a
procedure is frames chained by transitions with a super-assembly as the frame of the whole, switching by competition, and
the experiments had built only the bottom layer. It flagged emergence as the hard part, arrivals as a mechanic that bites
here, and real building to do. It suggested writing the composition by hand first, as that note's own first test says.

**The owner** asked for a principled answer before any building, in associative memory's terms alone and without the
details of any experiment: the structure, the dynamics, schema and spatial memory and how they interconnect, how
super-assemblies work, and what the experiments are trying to show. **The assistant** gave the account in sections 3 to
7: two kinds of assembly bound into instances; frames as super-assemblies spanning both sides; procedures as
super-assemblies that bias rather than direct, handing over on arrivals; **spatial super-assemblies as layouts, giving a
second kind of jump**; learning as heat, repetition and overlap; the five claims; and pushback.

**The owner** took up the spatial super-assembly as new: he had only thought of composition on the schema side, and now
sees it spans and straddles both, the two being one thing from different angles. He proposed **schema memory** as a
better name than content memory, asked for this note, and asked for the next experiment to be small and careful, one
thing proved at a time, because this is a new path.

**After the note was written,** the owner asked for the first step. **C165** (a hand-over on an arrival, all by hand)
found that a held procedure hands over from one way of working to the next when the first runs out, in every case.
With no procedure held, nothing followed. With the hand-over keyed without a sample of the first frame, the second
frame's own ending re-triggered it, giving a loop. The procedure never let go once the work was done, which leaves
letting go open.

**Then,** asked by the owner to sort out risky crutches before going on, **C166** replaced the one trick in the
hand-over (code noticing an absence) with competition: "nothing found" is the default alternative after a step,
standing only when no found digit backs carrying on. Results were identical. A [crutch register](../../experiments/crutch-register.md)
now lists every crutch in this line of work.

**C167** (by hand) added a jump and letting go. A cue binds the place where a procedure starts into the procedure, so a
way of working can jump straight back there. The procedure lets go by competition when its last way of working ends.
Both worked every time. A second sum in the same memory exposed that the bound place is permanent: the jump went to
every place the procedure had ever started. Things bound for one run of a procedure need to be temporary, latches
rather than bonds, and the engine has none yet.

**C168** made the start place a latch: held activity, kept only while the procedure is held, on wiring that is the same
for every place. Two sums ran straight on in one memory with nothing reset between them. With the latch, both were
right every time. With a bond, or with the latch but no letting go, the second jump went to both starts. Lasting
wiring and temporary held markers are both needed, and the temporary one only works because the procedure lets go.

**C169** put the pieces together, by hand, for both rows of a long multiplication from one cue: the first row, a
hand-over on its end, a jump to one column left of the start latch (an anchor plus a relation, the smallest spatial
composition), the second row, and letting go. 200 of 200 had both rows right and in place, and went quiet. The
experiment no longer moves the focus to the second row. Jumping to the start itself gave no second rows.

**C170** ran a complete long multiplication from one cue to its final answer inside the memory, all by hand: the first
row, a jump to one left of the start, the second row, a jump back to the start, adding the rows, and letting go. All
200 final sums were right. It was the first whole multi-pass procedure, made of composed procedures, to run on the
engine's own completion and competition. Nothing in it is learned yet.

**C171** learned the composition (which way of working follows which, and where it starts) from worked examples, judged
by the memory's own settling. With the working readable on the page, two orders settled, because a finished page doesn't
show order. With the working held as a target to agree with (do it yourself, check against the solution), exactly one
settled, from a single example, and it did every new long multiplication right. **A worked example teaches only if its
working is something to agree with, not something to read.**

**C172** brought that principle to a way of working itself. The second row's way of working (what it holds, what it reads, where
it writes, where its carries go, which way it moves, where it starts) was searched for on a page showing only the question,
with both rows' working as the target. After two worked examples, three were left, all the right way of working,
differing only in which of three equivalent sign places it reads. Each did every new second row right. Two things came
out. One worked example wasn't enough: a way of working has many parts, and some got the first example right by
coincidence. And equals tie: the memory could tell right from wrong, but had nothing to choose among equals, so nothing
was bound. The search took about 137,000 runs, and it's the code's. The open questions are about choosing and
proposing, not judging.

**C173** let one memory do the keeping and the choosing. It worked six worked examples, kept what settled (binding a
copy on settling), recalled by competition at the hand-over with copies counting, and was tested, never rebuilt or
copied. A kept way of working is a frame cell over a shared vocabulary of parts: which parts it brings on is what
makes it this way of working. Repetition removed the coincidences, because right answers keep being right. But it
couldn't separate true equals, since repetition reinforces equals equally, and the three right ways of working stayed
tied for ever, so recall brought on nothing. With a declared tie-break (the first formed wins), one won once and then
kept winning by repetition alone. **A tie among equals only needs breaking once. After that, repetition keeps the
choice.**

**C174 and C175** turned to gradual learning, at the owner's direction: learn the basics first and reuse their pieces.
Recounting C172's search under "write where the heat is, then place parts by relations a known way of working had"
cut it ninefold with the same result (C174). In two lessons (C175), times one digit took 1,112 tries from scratch, 180
with all of adding's pieces offered, and 2 with the right one of adding's ways of working. **But adding had settled six
equal ways of working, and only one of them carries over.** Adding can't tell which read is the carry, and times one
digit needs to know. A choice that didn't matter in one lesson matters in the next. So breaking ties among equals early is
risky for later reuse, and keeping the equals is the safe course, at a cost.

**C176** removed the code's carrying of pieces between lessons. One memory went through both lessons. In lesson 2, the
start brought up what lesson 1 had kept by association (they share the start, not the view). None of it fitted as it
was, so the ones that got furthest were changed one part at a time, which is still the code's, and one became times one
digit. Lesson 2 took 12 runs, against 1,112 from scratch. Afterwards, what's in view at the start keeps the two lessons
apart. One lesson learned in the wiring: **keep only the way of working that did the work**. Something that drifts in
and does nothing mustn't be linked to the success.

**C177** took the step to a lesson that looks different. The same memory, after adding and times one digit, met second
rows of long multiplication. The start brought up times one digit, which wrote on top of the first row and cooled
nothing. It was adapted under the owner's heat principle: a write moves only toward a place still to be done, a read only
toward something there to read, each part on its own, and a change is kept if more of the working cools. In 412 runs, against 136,922
for blind search, it became the second-row way of working, and did every new second row right. Two worked examples were
needed, because the first taught a coincidence. **Starting from what's known and moving toward the heat makes learning
something new cheap.** What remains: the memory can't tell from the sign alone when a page calls for the second row, and
the adapting is still the code's rule, though now a small, local one.

**C178** gave the memory more to see at the start: what's at each place in reach (a digit, a sign or nothing), kept with
the way of working that did the work, so that the best-matching view brings it up. One memory then chose rightly among
adding, times one digit and the second row, 200 of 200 each from the start. Seeing more also made learning cheaper,
because the nearest earlier result became the starting point for adapting. The second row took 258 runs instead of 412,
and repetition sorted out a coincidence. **Context is what lets learning accumulate: without it, what's learned can't be
used when it's needed, and the nearest thing known can't be found to start from.**

See also [learning from experience](learning-from-experience.md), written after C171 to C178: how what is learned is kept, brought up by association and adapted toward the heat in later lessons.
