# Procedures from states and transitions

A theory note, from a conversation between the owner and the assistant. **Nothing here has been tested.** It sets out
how AMP could hold **procedures**, or algorithms, and not only patterns: frames chained by transitions, values held and
overwritten, loops, counting, and routines nested inside routines. It also says how those procedures stay **flexible**,
switching, mixing and resuming, using only what the language already has. The owner's frames came from exactly this
problem, years ago: trying to work out how procedures and algorithms could live in an associative memory.

Related: the [language](../../language/README.md) ([walkthrough](../../language/walkthrough.md) steps 4–6: states and
transitions, alternatives and keys, member definitions), [learned computation](learned-computation.md),
[categories from context](categories-from-context.md), [the tilting landscape](the-tilting-landscape.md)
(holding, the primed layer), [flow and heat](flow-and-heat.md) (fast on slow).

---

## 1. Patterns and procedures

So far the language has mostly described **patterns**: a word, a category, a frame with alternatives. A procedure is
different. It is a **method**, a way of doing something that works on any input, not only the examples it was learnt
from. Long addition with carrying is a small algorithm. Cooking is a larger one: ingredients, mixing, things done at
particular times, actions taken when something reaches a particular state.

Some things **have to be memorised**, and that is fine. As a child you learn by heart that one number follows another,
and you learn the addition facts and the multiplication facts. Once they are down, you can do many calculations you never
memorised, because what you learn next is mostly how to **stack** those facts. Memorised facts plus a method of chaining
them is arithmetic.

## 2. Frames, procedures and the frame of the whole

**A frame** (the owner's original meaning) is like a chassis. A structure holds still, the invariant part, and parts
can be swapped in and out within a domain: different wheels, a different engine. In AMP that is an assembly with
alternatives. The chassis is the shared part, and the swappable parts are the alternatives at a step, constrained to a
domain such as a learnt category ([categories from context](categories-from-context.md)). A frame is a state with
variation inside it.

**A procedure** is frames **chained by transitions**. The frame pivots a little at each step as it walks through
states and transitions.

**The frame of the whole.** The entirety of a procedure's states and transitions has a higher-order frame binding them
together, which the owner once called the *framework*. In AMP it is a **super-assembly** whose members include the step
frames. Naming a procedure ("this recipe") brings it into play, and it guides and structures every step.

**Flexibility.**
- **Switching** halfway through is a state shift into another known procedure: competition handing over from one
  super-assembly to another.
- **Overlap.** Procedures that share steps share those frames, so they overlap and interweave like any other assemblies.
- **Mixing and resuming** fall out of the same mechanism. A program switches when told to. Here, switching comes from
  competition among what is relevant now.

It is all assemblies.

## 3. Reading and writing values: a population as a register

**Why computers can run algorithms.** A state machine that can read and write memory: hold a value somewhere, read it,
and overwrite it. The owner's latches were invented for exactly this, a temporary binding.

**What the engine already has (assistant).** A population with room for **one** member works as that somewhere:

| Computer | Engine |
|---|---|
| holding a value | the value's member stays on, because it reverberates |
| reading it | the held member acts as a **key** for the next step ("add the stock & onions soft") |
| writing it | a new value **outcompetes** the old one for the population's one place |

So **variable binding comes from holding plus competition**, with no new kind of edge. That is where latches went.
Writing a value changes what is active, not the structure, so it fits [nothing breaks](nothing-breaks.md). The value can
still be a domain, a range of alternatives.

## 4. Loops

**The owner's model: state machines that loop.** Some states transition around each other. The only way out is if
another state allows one of them to transition out of the loop.

**In AMP (assistant):**

```
stir -> look -> (stir & thin | pour & thick)
```

Stirring leads to looking. Looking leads to two alternatives competing: back to stirring if what it sees is thin, on to
pouring if it is thick. Each time round, **the world supplies the key**. There is no counter and no decision to stop: the
loop ends when the world changes and the other alternative wins. The back-edge is an ordinary outward bond to an earlier
step, the exit is ordinary competition, and the condition is ordinary input.

**A loop that never exits**, because the world never changes, would go round for ever. Something must let it go: the
"letting go" of the earlier notes, still unbuilt.

## 5. Counting

**The owner's account.** Counting is states and transitions, probably the simplest possible example: one is a state, it
transitions to two, to three, to four. The question is *when* to count up. That is part of the procedure: you only move
from one to two if something else is pushing at the gate. When it arrives, you count up. Numbers are their own
abstraction, an assembly in their own domain, so the count is **a held state within a domain**. Reaching ten is just
another condition, and when it is met you move on to the next state, which could be a subroutine.

```
one -> two & tick
two -> three & tick
...
nine -> ten & tick
ten -> next-step
```

**A subtlety for building it (assistant): arrivals, not states.** If "tick" were held (reverberating like other states),
`two -> three & tick` would stay open and the count would run away: three, four, five, all on one tick. **The count must
move once per arrival of a tick, not once per moment a tick is on.** The engine has to tell what *arrives* from what is
*held*, and only arrivals advance a count. Electronics has the same distinction between triggering on a level and on a
change. Transitions probably need to act on change. Open, and needed before procedures can run.

## 6. Routines, subroutines and nesting

**The owner's point.** Composition over states and transitions already gives **routines, subroutines and
super-routines**: different words for the same thing. Subroutines are **reusable**, as much in memory ends up being, and
what is reusable is composable. **The more you learn, the faster you can learn**, because each reusable piece is one less
thing to learn next time.

**Nesting is composition too.** Sub-assemblies sit within the held, higher-order context of the routines above them.

**Different paces at different depths.** The higher-order frames are **anchors that persist**. Lower-level subroutines
move fast, and higher ones change rarely, so states move at different rates depending on how deeply they are nested. This
is the project's "fast on slow" again, applied to routines. Brains show something similar. Studies of how people process
stories and speech found a hierarchy of timescales: early areas track fast changes like sounds and words, while higher
areas integrate over sentences and whole narratives and change slowly.

**The limit (the owner):** the size of a population and its sparsity. The bigger the populations, the more can be held
at once, so the deeper the nesting can go. Like human working memory, it is a natural limit, not a flaw.

## 7. Returning from a subroutine

**Holding the caller (assistant).** When a routine calls a subroutine, the caller's place must be held so it can carry on
afterwards. One nested call is one held place, and several need several. Each population's budget limits how many can be
held at once, which is the limit above.

**The owner's alternative: a managerial routine.** You can be fully focused within a subroutine and have completely
forgotten which routine you are in. When the subroutine reaches its end state, a separate routine, used for tasks like
this, **recalls** which routine you were in and brings it back into attention, and the subroutine falls away. This trades
holding for association: no stack, and no depth limit from holding.

**The catch (assistant).** A subroutine reused by many callers is associated with all of them at its end, so association
alone can't say which caller to return to this time. Something has to tip it: some trace of the current caller that is
still faintly present, such as primed but not held, or among what was most recently active. So the likely answer is a mix.
**The caller needn't be fully held, but it must leave a faint mark that competition can use when the subroutine ends.**
The primed layer is suited to that.

**The owner's conclusion:** there are many ways to tackle this, and they are all the same language used in different
ways. No new mechanism is needed. That the core can be used in so many ways is a good sign that it is general.

## 8. Learning procedures by acting

**The owner's point.** Procedures have to be learnt by **acting**, not only from examples: the engine acts, the world
responds, and the response is part of what it learns from. You learn to cook by cooking.

**The open question.** Everything above says the language can *represent* procedures. Whether resolve, from acting and
from worked examples, forms the super-assembly with a register-like population for the variant part (the carry, the
count), rather than memorising each case, is the systematic-generalisation question. It is hard for every kind of
learner, including today's neural networks. The concrete test: **after examples, does it treat the variant parts as
values in a register, or as part of the pattern?**

## 9. Potential, honestly

**What is strong.** Composable states and transitions, with held context as anchors, keys as conditions, competition for
switching and reuse through shared assemblies, are enough to describe large procedures. They are flexible in a way
ordinary programs aren't, and every switch has a count behind it, so they stay explainable.

**What is unknown:**
- **learning**: forming these structures by acting and reading, with variant parts becoming values (§8);
- **dynamics at scale**: crosstalk, flip-flopping between rival procedures, and the budget filling up;
- **mechanics still to settle**: arrivals versus held states (§5), returning to the right caller (§7), letting a loop go
  (§4), and the four open decisions for resolve.

## 10. The first test: write one by hand

Before any learning, **write a small procedure by hand in the REPL** and step through it. For example, a counting loop
that hands off to a next step, or a toy recipe with a world-keyed loop and a switch to another recipe. If it runs as
described, the representation holds up, and the attempt will settle triggering (§5) and returning (§7) along the way. Only
then ask whether the engine can learn the same thing itself. That separates "can it work" from "can it learn it", which
is exactly where the uncertainty lies.

**Predictions to fix before running:**
1. The count advances exactly once per tick, and stops and hands off at ten.
2. The world-keyed loop repeats while its key holds, and exits on the first moment the other alternative wins.
3. Switching recipes mid-way leaves the shared steps' state intact, and the new recipe continues from them.
4. Returning from a reused subroutine goes to the caller that called it, across at least two callers.
5. Every switch, entry and exit appears in the log with its cause.
