# Heat as the source

A theory note, from a long exchange between the owner and the assistant that began with how an AMP machine should
meet its world and ended with a change of perspective: **heat is not only a symptom of energy that can't flow, it is
the source that drives everything, and what we are building is the medium it flows through.** **Nothing here has been
tested.** The note follows the order in which the ideas came, because each one was forced by a problem in the one
before.

Related: [explainable by design](explainable-by-design.md) (AMP and AMX), [assemblies first](assemblies-first.md),
[nothing breaks](nothing-breaks.md), [flow and heat](flow-and-heat.md) (poles, arms, priming),
[feelings as heat](feelings-as-heat.md) (curiosity as outward heat), the [language](../../language/README.md), the
[system contract](../contracts/system.md) (GOL-3, CON-7, CON-10, CON-13).

---

## 1. Engine and automaton

**AMP** is the language. The **engine** is what runs AMP. The **automaton** is the engine placed in a world, acting.
This keeps the distinction the project already had (the engine is the inner mechanism; the machine is the engine acting
in a world). "Automaton" is the owner's word: something that acts by its own nature. Singular *automaton*, plural
*automata*.

The owner's starting point: AMP automata learn unsupervised and **teach themselves**. You don't force-feed them training
data and you don't stream inputs into them. You place information in front of them, and they go to where the heat is.
Heat is where they learn, and what draws them to learn.

## 2. Don't stream; let it look

The usual AI habit is to stream input in, in an order we choose, and inspect the output or the inner state. The owner's
concern: that treats the automaton like any other model and skips the part that matters most, its ability to attend to
its own heat and to the heat in what it receives.

It also quietly breaks one of the project's rules. Choosing what it sees and when is shaping its learning by hand
([feelings as heat](feelings-as-heat.md) already says: curiosity instead of puppeteering). The contract's draft goal
GOL-3 (acts on its own heat) is pulled forward from the end to the start.

**A first picture for text.** AMX places a page of text in front of the automaton. The automaton has a small window it
can look through and move. What is hot in the window (something unexplained, a contest unsettled) holds it there or
draws it nearby. What is cool, it moves past. What was left hot, it can return to. AMX measures where it looked, for how
long, and whether its looking followed the heat.

**Proposed control (assistant).** Starting with navigation means two things can fail at once, the learning and the
looking. If it doesn't learn "cot", we wouldn't know which failed. So the first phases would also run the same page read
in a fixed order, as a control only. Comparing the two tests whether following its own heat actually helps.

## 3. The interface is a command line

**The owner's idea.** Instead of wiring outputs to buttons for moving around, the automaton has a command line. It
produces characters one at a time, and some sequences are commands: `MOV 10`, `MOV 1`, `MOV -1`. More commands can be
added later, such as a search like `grep`, and its interface to any tooling is a CLI.

**Why it matters.** It gives the automaton **one medium for everything: text in, text out.** Moving is language too, so
learning to navigate is part of learning language, and every tool added later is more vocabulary. A command and its
effect ("I typed this, and then the window moved") is a transition, which is exactly what transition memory holds.

## 4. How it could ever learn a command

**The odds problem.** With no teacher and no reward, the automaton would have to emit characters and notice that some of
them change what it sees. But "MOV 1" is five characters. Hitting it by chance among all five-character strings is
millions to one, and the project rules out searching large spaces.

**The assistant's first answer** was single-character commands (one key moves the window right, one left), which
babbling can find, with longer commands like "MOV 10" built later by composition.

**The owner's better answer: feedback, as any CLI gives.** Mistype a command and a real CLI answers with help. The
automaton types anything, and the CLI answers "MOV". It sees "MOV" and an assembly forms. Now the command is something it
has *seen*. Seeing "MOV" without having produced it leaves heat, and typing it is how that heat closes. If it types
"MOV" without a number, the answer is "number", and the same happens again. If copying from what it sees into what it
types keeps closing heat, copying can become a habit. **That is imitation coming out of heat, not taught.**

**A guard.** The help messages are written by us, so they must be fixed and generic, like any real CLI, and never tuned
to steer it. They are the world's honest answer, not a teacher picking the answer.

## 5. The echo

The automaton sees its own typing echoed back alongside the CLI's output, as anyone at a terminal does. The owner's
reason: the machine learns by comparison, and comparing what it types with what it sees is the natural thing to do.

**What the echo solves.** Everything it types comes back as something it sees, so all comparing happens on the seeing
side: the "MOV" in a help message against the "M" it just typed. What is left is the link from pressing a key to the
letter that appears. Babbling teaches that: each press is followed by a letter in the echo ("I pressed this, then 'M'
appeared"), a transition that forms from a few examples. Because assemblies complete from any part, it also works
backwards: wanting to see "M" brings back the press that makes it. With a few dozen keys, not millions of strings,
babbling covers them quickly. Nothing is built in for copying. It learns its own hands, as an infant does.

The assistant had suggested wiring seen and typed characters to share members so copying would come for free. With the
echo, that isn't needed for *learning* the link. It came back later as one option for *starting* to act (§9, §12).

## 6. From nothing to something

**The owner's question.** Boot a fresh automaton. Nothing on the screen, nothing done, blank. How does it get from there
to running a command that shows it anything? Usually there is something there at the beginning to latch onto and react
to. Here there is nothing.

**The difficulty.** With nothing on the screen, nothing is unexplained, so by the usual definition there is no heat. A
blank automaton in a blank world would be perfectly cool and would sit there for ever.

**Options raised and set aside.**
- **A set point that makes silence hot** (the contract allows declared set points, CON-10). The owner rejected it: we
  can't define such a set point honestly, and it would be a hack.
- **Background noise to get it jiggling and babbling.** The owner rejected it too. It makes testing harder by adding
  uncertainty, it pushes towards search, which isn't deterministic, and it is an easy way out that hides the answer to
  the hard question.
- **Energy arriving every moment** (assistant). Each moment the machine runs, energy arrives. With no structure it has
  nowhere to flow, so by the project's own definition it is heat. The owner's touchstone here was the idea that structure
  on Earth formed because energy from the sun flows in and back out. That is Harold Morowitz's thesis that "the energy
  that flows through a system acts to organize that system". His mechanism, the cycling theorem, is that steady flow from
  a source to a sink through limited matter forces cycles to form, because the same matter must keep coming back round
  to carry more energy. Those cycles are the first structure. The limit, noted at the time: it shows that flow forces
  cycles to exist, not how anything as rich as life or language is built.

**A tie that won't go away.** A blank automaton has no reason to press one key rather than another, so every key ties.
The contract says don't guess (CON-7): take neither. Applied strictly, a blank automaton never acts. CON-13 points the
way out: only more evidence, from looking or acting, can settle a true tie. But how the first key is chosen still has to
be stated.

## 7. The dark room

**The owner's thought experiment.** Seed the automaton with random assemblies and start it. Its output would be garbage.
The echo doesn't fit its structure, so energy can't flow. It might gradually change its output to reduce that heat and
converge on a pattern. At the extreme, it would print one character for ever, or nothing at all, because that is
perfectly regular and perfectly cool.

**This is a known problem.** Theories where a brain's only drive is to reduce surprise run into it, and it is called the
dark-room problem: the surest way to have no surprises is to sit still in a dark room for ever. **A drive that only cools
can't start anything or keep anything going.** Something has to keep bringing heat in.

**The owner's answer is his own premise.** Heat comes from the outside world, and the automaton exists to cool it there.
So heat has to be introduced, and the automaton acts until it has cooled it, like a thermostat that stops once the room
reaches its set point. In his words, it is like an open question: a gap, a space of heat, only resolved when it is
answered, and the structure fills in the gap where the question opened it.

**The line to hold (assistant).** The line between "the world has heat in it" and "we reward it for the right answer"
is thin. **There must be no separate reward signal**, no score from outside. The automaton only ever perceives its
world, and its heat is the misfit it perceives there. It knows a gap is closed because the world now looks complete to
it, not because anything says "well done". Otherwise it is ordinary reinforcement learning under another name.

## 8. The phantom assembly

**The owner's idea.** Represent the problem as an assembly the automaton can't reach. A phantom: like a word on the page
that has been rubbed out. It is there, you can feel it, but you can't read it. An itch you can't yet scratch.

Concretely, with columns: each letter is a population, and "CAT" is encoded as one member in each of the "C", "A" and
"T" populations. That assembly is placed in the automaton. Normally the only way those members become active is input
driving those populations, and the automaton has never seen "CAT" in this session. **Nothing connects to it, nothing
explains it, and that is heat.**

**Why it is principled.** It is structured, not noise, so it is deterministic and AMX can examine it. It is exactly what
the contract means by a set point that comes from outside and is declared (CON-10), expressed as structure rather than
as a number.

## 9. The route from the itch to the hands

**The problem (assistant).** With only the pieces so far, the phantom's heat has nowhere to go. Its members can only be
explained by input in their columns. Input only arrives through the echo, and the echo only happens if it types. There
is no path from the itch to the hands.

**One option: keys in the letter's own column.** If the key that types "C" is a member of the "C" population, heat in
that column reaches it: the phantom's "C" is hot, the warmth presses the "C" key, "C" appears in the echo, the echo
drives the "C" population, and part of the itch is scratched. Deterministic, with no noise. Two catches: it may be too
easy (the phantom more or less types itself out), and "C", "A" and "T" tie unless the phantom also holds the order,
which brings in time and latches.

## 10. Completion, latches and the static frame

**The owner stepped back to first principles.** The machine is associative memory and completion. What doesn't complete
is in a high-energy state: energy can't flow between the parts. It is like taking assemblies, breaking them apart and
throwing them up in the air so they land in disorder. Left to themselves they should reorganise until they fit and
energy can flow again. **The name of the game is completion.**

**How the reorganising works, in his picture.** Think of a Hopfield network: it settles into valleys that its learnt
connections already made. Here there is a difference:

- **Bonds are the static frame.** They don't change while settling. That is the constraint.
- **Latches are free.** They form and let go on top of the bonds, reconfiguring until the energy can drop.
- **The latches that lowered the energy become bonds**, because they are the very things that resolved it.
- **The phantom is structure too**, so the settling has to fit it. Typing "C" lowers the energy a little, "A" lowers it
  more, "T" completes it, and the latches that got it there remain as bonds.

**What this settles.** Latches had been deferred in the language, with no agreed meaning. Here they get one: the fast,
reconfigurable part that settling happens in, over the slow frame of bonds. It is the poles and arms of
[flow and heat](flow-and-heat.md) with a job. It also fits [nothing breaks](nothing-breaks.md): latches letting go was
never breaking, because latches were never permanent. Bonds are only ever added.

## 11. Seed, not noise

**A distinction the assistant drew.** Noise is a jiggle added every moment, never the same twice. A random **seed** is a
fixed starting state, a particular arrangement generated once from a number. Run it again with the same number and you
get the same run, step for step. It is deterministic, replayable and traceable, like shuffling a deck once and writing
the order down. Results would be checked across several seeds so that none rests on luck.

**The owner's objection.** A seeded start is deterministic, but if the reconfiguring itself is random, the run isn't. And
a pathway is needed: energy can't flow until there is a path from source to sink. He was close to conceding that it would
have to be random jiggling, since otherwise no connection from source to sink could be found.

**The assistant's guard against search.** If latches try arrangement after arrangement until one lowers the energy,
that is a search. To stay within the project's principles, each latch needs a local reason to form where it does, so
that the reconfiguring follows the heat rather than trying things.

## 12. Heat flows back from the phantom

**The owner's turn.** What if the phantom works backwards? Like a compass pointing to it, or a magnet: anything connected
to the phantom takes on its heat, anything connected to that takes it on too, and so on, until the heat spreads out and
reaches the end points, which could be the actions. **Heat as dispersal:** trapped heat is an imbalance, and the only way
to balance is to disperse. It forges its way through, building out like a snowflake from its seed until it makes
connections.

**And the direction flips.** Before, the inputs were the source and the automaton had to reach the phantom. Now **the
phantom is the source, like the sun**: heat flows out from it into the medium, structure forms along the way, and it
drains at a sink. **Pressing a key is the sink**, because what the key puts into the world comes back through the echo
and fulfils the phantom. The loop is closed: phantom, through structure, to a key, out into the world, back through the
echo, to the phantom. That is Morowitz's cycle between source and sink, and the path that carried the flow is the one
that becomes bonds.

**Is it still search?** The owner said yes, but not random. The assistant agreed and pointed to a well-established method
in robotics path planning. A wave starts at the goal and spreads outwards one step at a time, and every place it reaches
records which way it came from. When the wave reaches where the robot is, the robot follows it back, downhill, to the
goal. Nothing is random, the first path found is the shortest, and some versions literally model it as heat spreading
from the goal. **Systematic, the same every run, and traceable by AMX.**

**The catch.** Heat can only spread through connections that already exist. In a completely blank machine there are
none, so the wave has nowhere to go. There must be a medium. And when the wave reaches two keys at exactly the same
distance, that is a tie, which still needs a simple declared rule.

## 13. The medium: a lattice

The alternatives considered for what heat spreads through before anything is learnt:

1. **A seeded random medium**: small random assemblies from a fixed seed. Replayable and unbiased, but arbitrary.
2. **A regular built-in medium**: every member joined to a few neighbours in a fixed, regular pattern, a lattice, like
   the fixed local wiring the cortex has before learning. No randomness, fully explainable, allowed as fixed
   architecture (CON-3). The cost: its shape decides which paths are short, so it can bias what is learnt first.
3. **Everything connected to everything**: trivial paths, nothing to find or learn, and dense, which breaks sparse
   computation (CON-18). Ruled out.
4. **Heat grows its own medium**: latches reach out from hot members like roots. But in a blank machine nothing
   distinguishes one member from another, so the rule for where to reach is either random (jiggling again) or a fixed
   order (option 2 in disguise).
5. **The world as the medium**: keys in their letter's column (§9). Direct and deterministic, possibly too easy. Worth
   keeping as the simplest first test: if the loop can't close there, nothing harder will.
6. **Don't start blank**: begin from structure an earlier automaton built. Useful later, but it only pushes the question
   back to the first one.

**The owner chose the lattice.** He had already been picturing one, and it is cleaner than randomness.

## 14. Heat as the source; the machine as the medium

**The owner's reflection.** The project keeps changing perspective: cells first to assemblies first, input and output to
heat driving everything. It suggests that heat is not always a symptom of trapped energy. **Heat is the source of energy.
It is the fuel.** It now seems strange to call it an automaton: the actor feels like the heat, and what we are building is
the medium.

**Reconciling it with the contract (assistant).** In physics, heat doesn't move because of heat itself. It moves because
of a difference: hot here, cool there. The imbalance drives the flow. So both readings hold, at different moments:

- **Trapped heat** is an imbalance that hasn't yet found a path: the symptom, as the contract defines heat (DEF-2,
  energy a better description could remove).
- **The moment there is a path**, the same imbalance is the source that drives energy through it.

The phantom is an imbalance placed in the medium. The lattice is where the flow can go. Structure is what is left behind
where the flow went. When the imbalance is resolved, the flow stops. The contract's definition still stands; what is
new is seeing heat as what drives everything, not only what is wrong.

**The name stays.** It isn't a little agent inside with intentions, choosing. It is a medium that acts because
imbalances drive flow through it: closer to a river than to a person. But a river still acts on its world, carving its
bed, and an automaton has always meant something that acts by its nature, not by choice. So "automaton" still fits,
perhaps better than before.

## 15. What a first test could look like

Not designed yet, but the pieces are now concrete enough to sketch:

- **Medium:** a lattice of members, including the letter populations and the keys.
- **Imbalance:** a phantom assembly, such as "CAT".
- **World:** a screen that echoes what is typed. No reward signal and no score.
- **Mechanism:** heat spreads from the phantom through the lattice. Where it reaches a key, the key is pressed. The echo
  drives the letter populations. Latches on the path that lowered the energy become bonds.

**Predictions to fix in advance:**
- "C", "A" and "T" are typed, each lowering the phantom's heat, and the automaton then stops: no dark room, and no
  endless typing either.
- The latches along the path that carried the flow become bonds, and nothing else does.
- Two runs from the same start are identical, step for step.
- A second, different phantom reuses what the first built (the key-to-letter links) and is reached faster.

**What could fool us:** a lattice shaped so the answer is trivially short; a tie rule that quietly does the work; and the
phantom typing itself out with nothing learnt that transfers. The second phantom is the guard against the last.

## 16. Open questions

1. **The tie.** When heat reaches several keys equally, which is pressed? A declared rule is needed. Does order in the
   phantom (which needs time and latches) remove most ties?
2. **Where latches may form.** The local reason that keeps reconfiguring from being a search. The candidate so far:
   latches form only along the paths heat is spreading through, or between members hot at the same moment.
3. **The lattice.** Its shape and neighbourhood size, and how much it biases what is learnt first.
4. **How heat spreads in AMP.** Is spreading a kind of pressing (gates partly met), a new kind of edge, or what latches
   carry? It needs words and notation the owner agrees.
5. **Reaching beyond the easy case.** From typing a phantom word to reaching a phantom that can only be met indirectly,
   such as by typing "MOV" to bring the right text into view.
6. **Self-directed looking.** How the window and its movement fit this picture, and the fixed-walk control of §2.
7. **The contract.** Heat as both symptom and source may deserve a sentence in DEF-2, and the phantom as a form of
   declared set point in CON-10. Both are for the owner to decide.
