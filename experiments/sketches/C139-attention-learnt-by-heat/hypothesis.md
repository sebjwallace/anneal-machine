# C139 · Attention learnt by heat: hypothesis

From the owner's idea, talked through after C138: registers that only hold activity (the bonds live in the shared
memory), and the memory learning **where to point attention** among them, driven by heat. An open question is heat;
the memory looks around its registers until something fits; when it fits, the heat cools into structure, and what is
kept is the attention that made it fit. Next time, that attention is recalled straight away, with no looking. The
registers and their contents are never learnt; only the attention is.

The owner's warning, which shapes everything below: this is very easy to fake. A great deal has to be hand-coded, so
the experiment has to say exactly what is given to support it and what it is trying to show the engine doing.

## What is being tested

**Can the memory learn an arithmetic procedure as attention (which registers to read, in which order), from a few
worked examples, by binding what was active at the moment an open question was answered, and then recall and run that
procedure through the engine's own dynamics on problems it has never seen?**

## The world

Three registers hold one number each (0 to 9). Each problem is one operator and its registers. The operator's
convention, which the memory is never told, says which registers are its operands and in which order:

| operator | answer | the register not used |
|---|---|---|
| "−" | register 1 − register 2 | register 3 (holds a number that has nothing to do with it) |
| "+" | register 3 + register 1 | register 2 |
| "×" | register 1 × register 3 | register 2 |

"−" and "×" both start by reading register 1, so the procedures share a first step. That checks they don't bleed into
each other.

**Training:** worked examples. The registers are filled, the operator arrives, and so does its answer: "−" with "7" "4"
"2" in the registers and the answer "3". The answer arriving with nothing to explain it is the heat. Ten per operator,
mixed in random order, values random.

**Test:** the same, but the answer is "?". 100 problems per operator, each with an operand pair never seen with that
operator in training. Nothing can be checked; the memory has to produce the answer.

Twenty seeds.

## Three arms and two controls

- **Learn (the arm under test).** For each worked example: first, the operator is given to the engine alone, and
  whatever attention it recalls is followed. If the registers read give the answer that arrived, the heat is cooled by
  recall and nothing is searched or learnt. Otherwise the memory searches: it reads every ordered pair of registers and
  checks each against the answer. If exactly one pair fits, the heat cools: the operator and the attention, in the order
  it happened, are bound into memory (the engine's own `declareWord`: a state and a transition). If more than one pair
  fits by coincidence, the tie is held (CON-10): nothing is learnt from that example and its heat stays open.
- **Shuffled conventions (a control).** As learn, but each training example uses a random pair of registers, so there
  is no procedure to find. A memory that learns only what is really there should end up unsure (holding ties, or
  answering rarely), not confidently wrong.
- **Memorise (a control).** Each worked example is stored as an instance: the operator with all three register values,
  and the answer. At test, an answer is given only if the very same instance was seen.
- **No learning (a control).** Search only. At test there is no answer to check against, so it cannot answer.

## What is given, and what is the engine (the ledger)

**Given, to support the experiment (crutches, all declared):**
- **The registers.** Three, declared. Their contents are written by the experiment (standing for an encoder). Attending
  to a register yields its number: the reading of a register is given, not done by the engine.
- **The arithmetic facts.** Looked up directly (5 − 3 is 2). They stand for memorised facts, which the theory notes
  accept as memorised; they are not under test.
- **The search.** Its order (every ordered pair, in a fixed order), and that it reads every pair so it can tell a fit
  from a tie.
- **The fit test.** A fit is the looked-up result being the answer that arrived. Standing for completion meeting the
  open answer; done here by comparison in the experiment.
- **The heat rule.** Learn only at the moment of cooling, only from an unambiguous fit, and nothing from a tie. This is
  the owner's idea, written as the experiment's rule, and is the hypothesis, not a given fact about the engine.

**The engine (C138's copy, unchanged):**
- **Storing the procedure:** `declareWord([operator, attention to the first register, attention to the second])`,
  which forms a state and a chain over members chosen as the engine chooses them.
- **Recalling and running it:** `invoke` with only the operator as input. The attention that comes on at each moment
  comes from the engine's transition gates and competition. Nothing else picks the registers at test.

**What the result can and can't show.** Generalising to new numbers is **given by the registers**, not learnt: the
attention never mentions a number, so if the right attention is recalled, any numbers in those registers give the right
answer. That is the point of indirection, and it is a property of the declared architecture. So 100% on unseen numbers
is close to guaranteed **if** the procedure is learnt and recalled, and must not be read as the engine generalising.
What the experiment can show is narrower and honest:
1. that binding at the moment of cooling picks up the right procedure from few examples, without being misled by
   coincidental fits;
2. that the engine alone, from the operator, recalls and runs it, with procedures that share a step kept apart;
3. that heat falls: search stops once recall cools the question;
4. that with no procedure to find, it does not become confidently wrong.

## Predictions (fixed before running)

1. **Learn:** each operator's procedure is learnt from its first worked example with a unique fit. Some first examples
   are coincidental ties and are skipped, so learning usually takes 1 or 2 examples and never more than 5, in every seed.
2. **Learn:** test accuracy 100% on unseen operand pairs, every operator, every seed (given 1, by indirection, as above).
3. **Learn:** after an operator's procedure is learnt, every later worked example of it is cooled by recall, with no
   search.
4. **Learn:** "−" and "×" share their first step and never cross: "−" never reads register 3, "×" never reads register
   2.
5. **Memorise:** test accuracy 0% (an unseen pair can't match a stored instance).
6. **No learning:** 0% (it can't answer at all).
7. **Shuffled:** several procedures learnt per operator. At test the engine brings up several attentions at once,
   which is read as no answer. It gives an answer in under half of test problems, and fewer than 20% of all test
   problems are answered wrongly.

If 1, 3 and 4 hold, heat-driven binding of attention works in the simplest case, and the engine can store and run what
it learnt. If 7 fails (confidently wrong under shuffling), binding at the moment of fit learns from coincidence too
readily, and the heat rule needs more than "one pair fits".
