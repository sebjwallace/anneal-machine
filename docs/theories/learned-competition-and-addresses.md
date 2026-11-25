# Learned competition and computation across addresses (side notes)

Side notes from the same conversation as [content and spatial memory](content-and-spatial-memory.md). Worth keeping,
not centre stage. Two ideas of the owner's, with the assistant's pushback: **competition spaces learned rather than
global**, and **computation learned over addresses rather than values**. Partly sketched in C137 to C139; otherwise
untested. Running example: arithmetic.

Related: [learned computation](learned-computation.md), [procedures from states and
transitions](procedures-from-states-and-transitions.md), [learnt logic](learnt-logic.md) (inhibition learnt from wrong
predictions), [categories from context](categories-from-context.md).

---

## 1. What the sketches found, briefly

- **C137.** A filler never seen in a frame was carried from one state to the next when transitions were learned **only
  on what changed** (the fixed part), the filler was **held** (a state lasts until a rival takes its place, C101), and
  what a transition left **let go**. No bond between the filler and the frame was needed: the frame moved around what
  stayed. Learning whole states instead bonded every filler into the transitions and jammed in a tie. But the filler
  could not be **replaced**: it had no rivals, because the engine finds rivals only through transitions.
- **C138.** Stored moments of trained fillers held the frame in place (a pile-up). Either storing no fillers in the
  moments, or a transition closing the state it leaves, fixed it, and the frame chained over three steps.
- **C139.** With declared registers, attention (which registers to read, in which order) was learned from a few worked
  examples by binding what was active when an open answer fitted, and the engine recalled and ran it from the operator
  alone. A commutative operator could not be learned until an open question was held open across examples. Repeated
  correct bindings did **not** outcompete one early wrong one: each binding was a separate chain, and the chains didn't
  compete. The learning decisions were the experiment's rules, not the engine.

## 2. Learned competition spaces

**The owner's starting point.** Competition in the engine is a stand-in for inhibitory neurons in the cortex, done by
sorting and filtering in code because there was no need to model inhibition directly. Assemblies are the excitatory
side: members reinforcing each other. If inhibition were brought into learning, competition would no longer be global:
**competition spaces could be learned.**

**A correction (the assistant).** Competition in the engine is not purely global already: two things are rivals only
if they share alternatives (they have followed the same thing, led into the same thing, or stood in the same place in a
chain). So competition spaces are already learned, indirectly, from transitions, by a rule written in code. The idea is
to make that rivalry its own learned structure, which would replace a hand-written rule rather than add a mechanism
(PRN-1).

**The owner's simpler version: attraction and repulsion.** What stays the same, invariant together, does not compete;
it **reinforces**. With respect to that constant part, what varies **competes**. So within the structure of arithmetic,
the pieces that agree connect and chain, like charges that attract and fit; the pieces that can occupy the same spot
repel, and compete to fit there. The values that go between operators are the example: only one can fit, and they
fight. Types form by attraction: the digits 0 to 9 overlap heavily because they are related, and because they are
drawn together they compete when only one can be true. Things can be attracted while being repelled, and how they move
around under both forces self-organises into something stable. The owner likes this picture and is open about not
knowing whether it is useful or only attractive.

**Why it matters: fast learning.** With competition known only from exact places seen, every operator would have to be
seen with every number before they competed properly. That is not how people learn; generalisation goes far beyond it
(the owner points to arithmetic-like operations on words: king, queen, man, woman).

**Where to place the competition (the assistant's pushback).**
- **Overlap alone must not cause competition.** "3" and "5" are both numbers, but "3 + 5" and "35" need both active at
  once. Relatedness gives the attraction; **the place gives the competition**. After "x =" there is room for one value,
  so the numbers fight there.
- **The cut already finds the places.** Comparing "2 + 5", "3 + 4" and "7 + 1", anneal's cut finds the constant ("+")
  and what varies (before and after it). Today only the constant is kept as structure. The other half of what the cut
  found, the things that varied at the same place, could become that place's rivals: learned inhibition as a
  by-product of comparison, not a new rule.
- **Rivals tied to the type, not to what was seen.** "x = 3" is held and "8" arrives; "8" has never come after "x =",
  but it is a number. If the place's rivals are "numbers" (bonded to the number abstraction, not to individual numbers),
  "8" displaces "3" at once. If they are only the numbers seen there, nothing displaces "3". This is the question that
  decides whether the idea generalises.
- **Bindings compete, not values.** If "3" and "5" inhibited each other everywhere, "x = 3, y = 5" could not be held at
  once. What should compete is "x with 3" against "x with 5": same place, different values.
- **No graded competition.** "More variance, more competition" would be a strength under another name (CON-6). The
  binary form: a place has a set of rivals or it doesn't; more variance means a bigger set.
- **Inhibition dynamics are twitchy.** Systems with both kinds of force can oscillate or silence each other; that
  would need watching. They are also how energy-based memories such as Hopfield networks settle, which fits heat: a
  value fighting for a place it doesn't fit is a misfit.

**What it could unify.** Competition spaces, types, overwriting a variable, and rejecting what contradicts what is
known (the machine that always says yes) could all be one mechanism.

## 3. Computation across addresses

**The owner's idea (an old one, recalled).** Imagine a number of registers (his placeholder word; he does not want it
used as a term) that hold **only activity**: the bonds live in the shared memory, and each register holds one stable
assembly at a time. Which registers are read and written is chosen by cells in another register, and that selection is
itself an assembly, so it is learned. The memory learns to manage its own memory and its own computation, the way a
computer's code and data are both just data. He wondered whether this makes the frames question go away, by seeing the
bigger picture: associative memory with the capability to learn to compute, moving things in and out and doing mappings.

**Learned by heat (the owner).** An open question is heat. The memory looks around its registers until something
fits; when it does, everything falls into place, the heat cools into structure, and what is kept is the attention that
made it fit: which registers to select and where attention goes. The registers and their contents stay as they are;
**only the attention changes.**

**Why it matters (the assistant).** A procedure learned over addresses rather than values generalises by indirection,
the way a CPU adds numbers it has never added: "for '−', read the first register and then the second" applies to any
values. Arithmetic facts are still memorised; the procedure that moves values around is what generalises.

**Pushback (the assistant).**
- **Learning the control is the whole problem.** Neural Turing Machines learned a controller over a memory, but needed
  gradient descent to do it (CON-12 rules that out). Heat and competition are the only candidates here.
- **Heat says where, not what to try.** Trying every combination of registers grows quickly (CON-2). Completion should
  narrow it: an operator is associated with numbers, so attention is drawn to registers holding numbers.
- **The shape must be bound, not the instance.** Binding "x − y with these values" memorises one case; the comparison
  across solved problems has to cut away the values and keep the attention.
- **"It fits" can fool it.** A wrong configuration that happens to complete will cool and be learned (C139's zeros).
- **Frames don't go away; they move** from values to addresses, which is a better place for them: addresses are few
  and reused, values endless.
- **Variable names may already be addresses.** "x" bound to 5 is a register: an address with a temporary binding to a
  value, found by content. In [content and spatial memory](content-and-spatial-memory.md), registers become places on
  the grid and attention becomes where the automaton looks.
- **Prior art to borrow from:** Soar, which searches when stuck and stores the result as a shortcut so the same impasse
  is never searched again (the owner's loop, in practice); O'Reilly and Frank's model of learned gating of
  working-memory slots.

**For AMP:** registers and selection can be declared openly (CAP-13), so AMP can use them by hand now; whether memory
learns its own control is a question for this repository.

## 4. Open, from the sketches

1. **Repeated structure as support.** A binding formed again should add to the existing one, or the copies should
   compete with the one-off, so the procedure seen most often wins (C139). Without that, an early mistake is never
   outcompeted.
2. **Holding an open question across examples** fixed commutative operators but settled on noise too easily (C139).
   When a held question counts as settled is open.
3. **Rivals for a filler that has never been in a frame** (C137): from its type, as in §2, or not at all.
4. **Moving the loop into the engine,** one part at a time, starting with the fit test.

## 5. Several heads

A side note, from later in the same conversation; see [content and spatial memory, §13](content-and-spatial-memory.md#13-how-the-thinking-moved-on-a-transcript)
for the full chain of reasoning around it. **Not to be taken too seriously yet** (the owner): there are more fundamental
problems to deal with first.

**The owner.** When input is placed into space rather than streamed, there needn't be one attention. There could be
several, which he called **heads**, after the head of a Turing machine that moves along the tape reading and writing.
One head deals with a patch of heat; another reads new input, finds more heat, and another goes there to resolve it;
others work elsewhere on separate but complementary things. They attract and repel each other in balance. Many Turing
machines working in concert, but with content addressable memory, which Turing didn't have: they can jump by meaning,
not only walk.

**The assistant.** The Turing comparison is fair: the head with only its local state, moving over a tape, is exactly
this; what is added is jumping by content and having many heads. Close prior art to borrow from: blackboard systems
and Copycat (see §13.1 of the main note). The risks: coordination (two heads writing in one spot, all crowding the
hottest patch) can turn into a scheduler, which is bookkeeping. The cleanest version: a head is only an active assembly
bound to a place, its number limited by how much can be active at once, kept apart by ordinary competition.

**Where it went.** The owner then took the idea further: the automaton is not a head, or many heads, inside the
substrate, but the substrate itself, a material with energy moving through it ([§13.3 of the main
note](content-and-spatial-memory.md#133-how-does-it-move-between-content-and-space-perhaps-it-doesnt-learn-to)). In that
picture "heads" are only a way of describing where energy is concentrated at a moment, not things in their own right.
