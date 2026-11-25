# C139 · Attention learnt by heat: findings

Run: `node attention.js > out.txt` (a few seconds; every arm's first seed is shown example by example in
[out.txt](out.txt); `DIAG=1 node attention.js` also prints the seeds that didn't reach 100%). Read
[the hypothesis](hypothesis.md) first, especially its ledger of what is given. Engine: C138's copy, unchanged.

## In short

**The first run found a flaw in the heat rule, not in the engine.** "−" was learnt in every seed from one to three
worked examples, recalled by the engine from the operator alone, and answered every unseen problem. But "+" and "×"
were **never learnt, in any seed**. Both are commutative: register 3 + register 1 always equals register 1 + register 3,
so at least two orders always fit, every worked example is a tie, and the rule "bind only a unique fit" never binds. I
didn't foresee this.

**One change after the first run, declared:** a tie is held open across examples, and settled when one candidate is
left, or when a whole new example fails to tell the candidates apart. With that, all three operators were learnt from
one to four worked examples, and **no wrong answer was given in any seed**. "×" was answered in 18 of 20 seeds; in the
other two it gave no answer, because of a second finding (below) that is about the engine.

**Honestly, about who did the learning:** the decisions that made this work (when to bind, what counts as a fit, how
ties are held and settled) are **the experiment's rules**, not the engine's dynamics. The engine stored each procedure
and ran it from the operator alone, kept procedures that share a step apart, and failed in one revealing way. The
answers to new numbers come from the registers, as the hypothesis said they would, not from the engine generalising.

## Results

| arm | operator | right | wrong | no answer | seeds at 100% | learnt at example (min / median / max) | procedures bound (mean) |
|---|---|---|---|---|---|---|---|
| learn | − | **100%** | 0% | 0% | 20 of 20 | 1 / 1 / 3 | 1.0 |
| learn | + | 0% | 0% | 100% | 0 of 20 | never | 0 |
| learn | × | 0% | 0% | 100% | 0 of 20 | never | 0 |
| shuffled | − | 0.6% | 9.4% | 90% | 0 of 20 | 1 / 1 / 5 | 6.1 |
| shuffled | + and × | 0% | 0% | 100% | 0 of 20 | never | 0 |
| memorise | all | 0% | 0% | 100% | 0 of 20 | - | - |
| no learning | all | 0% | 0% | 100% | 0 of 20 | - | - |
| *after the first run:* learn, ties held open | − | **100%** | 0% | 0% | 20 of 20 | 1 / 1 / 2 | 1.0 |
| | + | **100%** | 0% | 0% | 20 of 20 | 2 / 2 / 3 | 1.0 |
| | × | **90%** | **0%** | 10% | 18 of 20 | 2 / 2 / 4 | 1.4 |
| *after the first run:* shuffled, ties held open | − | 0.3% | 4.7% | 95% | 0 of 20 | 1 / 1 / 5 | 6.5 |
| | + | 12.8% | **27.2%** | 60% | 2 of 20 | 2 / 3 / 10 | 1.9 |
| | × | 17.2% | 7.8% | 75% | 3 of 20 | 2 / 3 / 5 | 2.1 |

Test problems all use an operand pair never seen with that operator in training; 100 per operator per seed, 20 seeds.

**Heat falling (learn, ties held open):** the first worked example of an operator always needs a search (12 reads).
From the third onwards almost all are cooled by recall (2 reads): 469 of the 485 worked examples after a procedure was
bound needed no search. The 16 that did all come from the two "×" seeds below. In the first-run learn arm, "−" went from
search to recall in every seed: 171 of 171 later examples cooled by recall.

## What it shows

### 1. A commutative operator can't be learnt from "the one thing that fits"

Every worked example of "+" or "×" is a tie between two orders, both correct. Treating that as "don't know, learn
nothing" (CON-10, don't guess) is right for a real tie but wrong here, because the two candidates never disagree. The
evidence can never settle the order, since the order makes no difference (CON-4). The fix that worked holds the
candidates open, keeps only those that fit every new example, and settles when a whole example fails to separate them.
That is still the experiment's rule, and it is a better account of what the heat rule should be: **the open question
stays open across examples, and what survives every example is what is kept.** It is close to the cut: what stays the
same across examples is kept, and what varied falls away.

### 2. The engine can't let repeated evidence outcompete an early mistake

This is the most important result about the engine itself. In two seeds the first two "×" examples both contained a 0,
and 0 times anything is 0, so four candidates fitted both, the rule settled on the wrong one, and the engine bound "×":
read register 1, then register 2. Every later example showed the right procedure (register 1, then register 3), and it
was bound again each time. But the engine never recovered:

- each binding forms a **new, separate chain** on fresh members (that is how `declareWord` chooses members), so the
  repeats don't add support to one procedure; they sit beside each other;
- the chains start from different members of "×", so they **aren't rivals**, and nothing competes: from "×" alone, the
  engine brings on register 1 twice, then registers 2 and 3 together. That is read as no answer, every time.

So the principle "being wrong is more structure, and the right structure outcompetes it" didn't happen here. The right
procedure had more structure (four chains against one) and still didn't win, because repeated structure doesn't count
as support when it is never in competition with the old. The failure was safe (no answer, not a wrong answer), but it
is exactly the sort of thing that has to work for learning on the job.

### 3. What the engine did do

- **Stored a procedure and ran it from a cue.** At test, "−" alone brings on attention to register 1, then register 2,
  through the engine's transition gates, and nothing else picks the registers.
- **Kept procedures with a shared first step apart.** "−" and "×" both start with register 1. They never crossed: in
  every seed, "−" never read register 3, and "×", once learnt cleanly, never read register 2. That's because each
  procedure starts on its own members (the engine's member choice), not because anything checked.
- **Cooled heat by recall.** Once a procedure was bound, recall answered the next worked example without searching.

### 4. Controls

**Memorise** got nothing right on unseen pairs: storing instances doesn't generalise, as expected. **No learning** can't
answer at all: without the answer to check against, search has nothing to fit. Both show the answers in the learn arms
come from the recalled attention plus the registers, not from anything left over from training.

**Shuffled** (first run) mostly gives no answer (90% for "−"), and is wrong 9.4% of the time: it learns about six
different procedures for "−", which the engine brings on together and so can't use. Under the held-open rule, shuffled
"+" is **wrong 27% of the time**: when the evidence is noise, two examples in a row can fail to separate candidates by
chance, the rule settles, and it answers confidently from a procedure that was never there. **The held-open rule is
more credulous than the first one.** It fixes commutative operators and pays for it on noise.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | each operator learnt from its first unique fit, usually 1 or 2 examples, never more than 5 | **Fails for "+" and "×"**: never learnt (commutative, always a tie). Holds for "−": 1 / 1 / 3. |
| 2 | 100% on unseen pairs, every operator, every seed | **Holds for "−" only**; "+" and "×" give no answer. |
| 3 | after learning, every later worked example cooled by recall | **Holds:** 171 of 171. |
| 4 | "−" and "×" never cross | **Holds for "−"** (never read register 3); "×" was never learnt in this arm. |
| 5 | memorise 0% | **Holds.** |
| 6 | no learning 0% | **Holds.** |
| 7 | shuffled: answers under half, wrong under 20% | **Holds:** answers 10%, wrong 9.4% ("−"; "+" and "×" never learnt). |

The arms "ties held open" were added after the first run, so they have no prior predictions. They are reported as
exploration, not as confirmed.

## The ledger, after the run

**What did the learning: the experiment's rules.** The search (every ordered pair, in a fixed order), the fit test (the
looked-up result is the answer that arrived), and the heat rule (bind at cooling; hold ties; after the first run, hold
them open across examples and settle) decided every binding. None of them is the engine.

**What the engine did:** store each binding as a state and a chain, recall it from the operator alone, and keep
procedures apart by their members. It also failed to let repeated correct bindings outcompete a wrong one.

**What was given and not learnt:** the registers, their contents, reading a register, and the arithmetic facts.
Generalising to new numbers is a property of the registers (indirection), and is not evidence of learning.

**So the honest summary:** the loop the owner described (open question, look around, fit, cool, bind the attention,
recall next time) works end to end and learns procedures from very few examples, **with the loop itself written by
hand.** For it to be the engine learning, the looking around and the noticing of a fit have to be done by the engine's
own completion and competition under heat, and binding has to be the engine's own anneal.

## What it suggests next

1. **Repeated structure as support (the engine finding).** A binding that is formed again should add to the existing
   procedure, or the copies should compete with the one-off, so that the procedure seen most often wins. This is the
   most important gap, because it decides whether the memory can recover from an early mistake on the job. It could be
   tested on its own: bind a wrong procedure once, the right one several times, and ask what the engine recalls.
2. **Holding an open question across examples** is closer to the owner's heat picture than deciding per example, but
   it settled on noise too easily. Deciding when a held question is settled is open.
3. **Moving the loop into the engine,** one part at a time, starting with the fit test: completion of the recalled
   attention and the facts meeting the answer that arrived, rather than the experiment comparing numbers.
