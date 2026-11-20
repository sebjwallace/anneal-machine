# Explainable by design

A theory note, from a conversation between the owner and the assistant. It names the two halves of the project's
working method, **AMP** and **AMX**, and records why explainability is not a feature added to the machine but part of
its foundations. It also proposes the contract clauses that follow (CTR-1 GOL-5, OPZ-6, CON-20). **Nothing here has been
tested;** it describes a design commitment and what it should give.

Related: [understandable by design](understandable-by-design.md) (its companion: *what* the machine knows, not *why* it
did something), [assemblies first](assemblies-first.md), [nothing breaks](nothing-breaks.md),
[learned computation](learned-computation.md), the [language](../../language/README.md), the
[system contract](../contracts/system.md).

---

## 1. The two names

- **AMP, Associative Memory Programming.** The owner's name, from years ago, for the language: the notation for
  members, gates, assemblies, completion, competition, forming, loaded and stored. The interpreter that will run it is
  part of AMP. AMP is the machine and its language.
- **AMX, Associative Memory Examination.** Everything used to study the machine: to test it, probe it, trace it, debug
  it and explain it. "Examination" carries both meanings on purpose: an exam tests what has been learnt, and a medical
  examination looks inside to see what is going on and why. AMP is the machine; AMX is how we examine it.

"AMX" is spelt out the first time it appears in any document, since an X in software is often read as "experimental" or
"extended".

The name went through two earlier forms. The first was AMV (verification). It was dropped because "verification" usually
means formal proof, and this is measurement. The second, more broadly, was a lab, an inspector or an explorer. The owner
chose AMX because the kit is wider than tests: it is anything that lets us probe, discover, explain and test.

## 2. Why explainability is structural here

Most systems treat explainability as something added afterwards, and under pressure it is the first thing traded
away. Here that can't happen, for a plain reason: **we can't develop the machine without it.** Every experiment, every
decision about the theory and every bug depends on being able to see exactly why the machine did what it did. If AMP
stopped being explainable, the project would stop being able to move. So the property is guaranteed to be kept,
because the work depends on it.

From that, the owner draws wider benefits:

- **Trust.** A machine whose every answer can be traced is one whose answers can be checked.
- **Control and programming.** Since writing is bonding ([learned computation](learned-computation.md)), an assembly
  can be put in directly, and the record shows what was taught and what was learnt, side by side.
- **Security.** Anything odd happening inside, such as tampering or poisoned input, is discoverable, because every
  change has a recorded cause.
- **A better footing for a world with more AI in it.** The owner's framing is moving from black boxes to glass boxes.

## 3. Better than now, not perfect

The owner's point is comparative, not absolute. Today's deep-learning systems are largely black boxes. An answer is
spread across very many numbers, so explaining it means approximating after the fact, and that is partial and
expensive. They are also easier to exploit in ways that are hard to see. Explainability by design doesn't solve every
problem. **It puts us in a better position than where things stand now.**

The honest limits, so the claim isn't overstated:

- **Explaining one step is not explaining the whole.** "Why did 8 come on?" has an exact answer. A machine with
  millions of assemblies can still behave in ways no one can take in at once, because of how many simple parts
  interact. It is a glass box, not necessarily a simple one. At scale, tools are needed that summarise, and outside
  AMX's test worlds there is no grammar to name assemblies for us.
- **Explained is not the same as correct.** A perfect explanation of a wrongly learnt assembly is still wrong.
  Explainability lets a mistake be found; it doesn't prevent one.
- **Transparency cuts both ways.** The record makes tampering easy to trace, but a fully open system also shows an
  attacker exactly what to feed it.
- **Alignment.** Being able to inspect a system helps a great deal. But alignment is ultimately about what a system is
  trying to do, and AMP has no goals yet. The fair claim is a foundation that makes alignment more tractable, not a
  solution to it.

## 4. What an explanation is in AMP

Because everything is binary and made of sets, an explanation is not an interpretation. It is the whole story, read
off directly:

- **Why a member came on.** Its gate's guest list, what was active, the count, and the threshold:
  "8 came on because its gate lists 1 and 7, both were active: 2 of 2, threshold 2."
- **Why an assembly won.** Its count against its rival's: "A had 4, B had 3; most support wins."
- **Why nothing was filled in.** A tie, held; or too little arrived to open any gate.
- **Why something formed.** The gap it filled: the active members nothing accounted for, and the context it formed with.
- **Why an assembly is loaded or stored.** The votes it received, its rank against the room available, the floor, or
  the build-up that loaded it.

Bit operations make this cheap. The counts the machine computes to decide are themselves the explanation, so nothing
extra has to be worked out to explain a decision.

## 5. The record of changes

Since [nothing breaks](nothing-breaks.md) during learning and [assemblies are immutable](assemblies-first.md), the
machine's structure only ever grows by additions, and each addition can be logged with its cause. That log is the
machine's full history, kept like a ledger: what formed, when in the machine's own moments, and why. Loading and
storing are logged the same way, with the votes or build-up behind them.

So structure never changes silently. Any assembly can be asked: when did you form, from what gap, and how have you
moved between memory and disk since?

## 6. What this asks of the interpreter

AMX shapes AMP. The interpreter should be built to show its workings, not to hide them:

- **It speaks its own notation.** Each moment, it writes out what happened in AMP, for example
  `{1, 7} => {1, 7, +8, +13}`. Reading a run is reading the language. There is no separate log format to learn.
- **It keeps the record of changes**, each entry with its cause.
- **It answers "why"** for any member that came on, any assembly that won or lost, anything formed, loaded or stored,
  in the terms of §4.
- **It is fast in the same terms it explains in.** Gates as rows of bits and counts done many at a time, as planned for
  the Go interpreter, mean that the speed and the explanation come from the same operations.

## 7. What AMX holds

- **Test worlds.** Made-up languages generated from grammars we write, so the right answer is known for every sentence:
  the real units, slots and meanings. The machine never sees the grammar, only raw text, so it is a fair learning
  problem with answers that can be marked. Phased to follow the theory, each phase a milestone with its predictions
  written in advance:
  1. words from letters;
  2. words with noise ("cxt");
  3. the same letters in different contexts ("cat" and "cot");
  4. slots and values ("x = 5");
  5. sequences across time (this needs latches);
  6. simple learned computation ("x − y");
  7. nesting, where it starts to look like code and maths.
- **Scoring the output.** Completion and prediction on sentences never seen, especially new combinations of familiar
  parts, since getting seen sentences right only shows memory.
- **Scoring the structure.** Because AMX knows the real units, each formed assembly can be compared with them by overlap
  (the set words: how much of one is in the other) and labelled for reporting: "this assembly is the word 'cot', 4 of 4
  members". This tells us *why* something succeeded or failed, not just whether. It also fulfils the backlog item on
  named assemblies.
- **Counting exposures.** Quick learning is a goal (CTR-1 OPZ-1), so how many examples it took matters as much as
  whether it got there.
- **Real text, from time to time,** so the made-up worlds can't teach tricks that only work in them.
- **Tracing, debugging and the "why" questions** of §4–§5, available on any run.

## 8. Rules that keep AMX honest

- **AMX never feeds back into the machine.** Its grammars, answers and labels are for reporting only. If they reached
  the engine, we would be teaching it the answer and calling it learning.
- **Write the generator, the predictions and the scoring before running, and don't tune them afterwards.** Otherwise
  the world quietly gets designed around what the machine already does. That is the puppeteering risk, and decision 006
  (designed demonstrations) already records it as a known trap.
- **A failed prediction is reported as a failure.** An interpreter we write ourselves can easily just confirm what we
  imagined. Predictions fixed in advance are the guard.

## 9. A vision: engineering with associative memory

This section is the owner's projection into the future. It is a vision, not a claim, and it is recorded because it
says what all of this is for.

**Why people trust ordinary machines.** Systems built from hardware and software are, for the most part, engineered:
designed to be deterministic and controlled, with known limits and a finite structure. People don't fear them, because
their capabilities and constraints can be understood. That isn't always true. Interacting parts can still produce
uncertainty, through complexity alone. But we have lived with that kind of technology for decades and learnt to engineer
around it.

**Why AI is different today.** Many people are wary of artificial intelligence because they don't understand it: they
can't see its constraints or its capabilities. With today's systems the uncertainty compounds. Unpredictable systems
interacting with each other in unpredictable ways can spiral.

**The owner's example: a robot tending a coral reef.** Imagine a robot doing marine science, attending to a coral reef
or another endangered habitat, where the work is delicate. A traditional robot is largely trusted: its circuits are
designed, its code is written by hand, its behaviour is deterministic, and its limits are built in. A deep-learning
model can be limited and trained to behave in a particular way, but that is usually narrow intelligence. If the work
needs a more broadly intelligent system, such as surveying, judging and adapting, then that intelligence is exactly what
you would want to be controlled, limited and, in effect, **programmed and engineered**.

**What AMP offers.** A way to design systems with associative memory: intelligence that is built and examined rather
than trained and hoped about. It stops feeling like runaway, unpredictable AI and starts feeling like a new way of
programming, and **potentially a new engineering discipline.** With AMX you could see the machine's structure for
real, set requirements, and show, to a degree, that they are met. It doesn't remove all unpredictability. It goes a
long way towards a system that does what we expect without nasty surprises.

**Against brute force.** The owner's phrase, half in jest. Today's training isn't literally brute force, it is search
and averaging over huge amounts of data. But beside what AMP is trying to be, it feels like it. That is why this
project stays away from averaging and from searching large spaces: it wants intelligence that is engineered, not
extracted.

**Harder, not softer.** The owner describes deep learning, language models included, as soft AI: everything rests on
numeric weights and biases, continuous values that are nudged a little at a time. AMP is binary at its core. A member
is on or off, a bond is there or not, and nothing holds a continuous value, which is also why it suits an ordinary
CPU. The owner's sense is that this makes the engine feel more mechanical, closer to engineering and programming than
to the smooth, fuzzy feel of people or language models. He doesn't take this as given. Binary parts can produce smooth
behaviour, as computers do when they show a film with smooth colour and movement, and language models themselves run on
binary machines. The dynamics are built on bits, but they need not be all-or-nothing. So the claim is about how the
engine learns and represents, not a promise about how it will feel to use.

**Comparing, not averaging.** The second reason for the mechanical feel is that AMP does no averaging. Averaging is
smooth and slow: many examples, each moving the numbers a little. AMP learns by comparing, in the everyday sense that
covers both what is the same and what differs. In the language those are intersection (∩, what is shared) and
symmetric difference (△, what differs), as described in [resolve](../../language/resolve.md). One comparison can form
a new assembly, which is where the hope of fast learning comes from (CTR-1 OPZ-1). It is also why each step has a cause
that can be stated: the comparison *is* the reason.

**What kind of intelligence this might be.** The owner's hope is that it turns out different from both human and
language-model intelligence: tighter and less flexible, and good for engineering, programming, planning and solving
real problems, rather than for open artistic invention. Being somewhat constrained, and not overly capable, may be the
property we want, because a technology you can inspect, trust and correct is worth more than one that is more capable
but opaque.

The assistant's pushback, recorded so the hope isn't taken as a result:

- **The feel is untested.** Everything designed so far is text and procedures, and none of it has run. The mechanical
  impression may say more about what we've chosen to design than about the engine.
- **Planning is close to imagination.** To plan, the engine must try combinations it has never actually seen: put this
  part into that frame and check whether the whole holds together. That is recombination, which is much of what
  creativity in engineering is. What AMP lacks is soft blending, "a bit like this, a bit like that": alternatives
  compete and one wins. The fair expectation is inventive the way a good engineer is, by recombining known parts under
  constraints, not the way an artist is.
- **Constraint has a cost.** Messy, half-familiar input is where soft systems cope and rigid ones can stall. That
  brittleness is a thing to test for early, not assume away.

**Seeing its workings in words.** If assemblies carry names, given by an agent through AMX by invoking them and each
backed by its evidence, AMT can show a run in plain words: what is held, what is being associated, which states and
transitions are active, and how a procedure such as arithmetic is being worked out. The owner sees this as one of the
most striking things the design allows. The catch is that the words are our labels laid over what the engine does,
not the engine thinking in English. Most assemblies may never get a clean name, and a wrong name makes a wrong run look
sensible, so the readout must show what is unnamed as plainly as what is named.

**In the project's own terms.** Uncertain systems raise heat. AMP is a way to lower it, by reducing uncertainty.

**The honest catches,** so the vision stays credible:

- **A machine that learns online keeps changing.** Engineered trust needs a way to bound that: for example, declaring
  which regions may form new structure and which are fixed, and showing it in the record (CON-20). How to state such
  limits in AMP is open.
- **"To a degree" matters.** AMX gives evidence: tests, traces and the record of changes. That is far more than a black
  box allows, but it isn't proof. Delicate work like the reef would still need the kind of testing and certification
  any safety-critical system gets.
- **It must be earned.** This only becomes a discipline if AMP actually works on hard worlds. Until then, it is the
  reason for the work, not a result of it.

## 10. In the contract

Proposed for CTR-1, each marked draft until the owner signs:

- **GOL-5 · Explains itself** *(goal)*: for anything it does (a member coming on, an assembly winning, something
  forming, loading or being stored), it can give the exact reason in its own terms.
- **OPZ-6 · Explanations** *(optimization)*: make those explanations as short and readable as possible, from one gate
  to the whole machine, at any scale.
- **CON-20 · Nothing happens without a recorded cause** *(constraint, hard)*: every change to structure, and every
  activation, has a cause that can be stated in AMP. No state without a reason.

The constraint and the optimization are not the inverse of each other. **The constraint guarantees that an explanation
exists, and a test can check it. The optimization is about whether a person can actually use it.** The owner's sense
of a "soft constraint" is captured by the optimization. If explanations exist but are unreadable, trust and progress
degrade, and that is a direction to push, not a line to hold.

## 11. Open questions

1. **Explaining at scale.** What do summaries of a large machine look like when there is no grammar to name things?
2. **The cost of the record.** The record of changes grows with everything formed. How much of it is kept, and does it
   follow the same storage policy as cold structure?
3. **Explaining time.** Once latches and sequences exist, how is "why did this happen now" stated in AMP?
4. **Where the goal and optimization sit in priority** among the others in CTR-1.
5. **Bounding learning.** How a designer states, in AMP, what a machine may learn and what it must not change, so that
   engineered limits hold while it keeps learning.
