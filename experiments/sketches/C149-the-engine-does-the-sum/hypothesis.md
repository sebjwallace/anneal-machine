# C149 · The engine does the sum: hypothesis

The milestone the owner asked about: **does the machine perform arithmetic from associative memory?** Up to C148, the
engine held the facts, judged fit, moved, held the learned step and recalled it, but **the experiment's code carried
the step out**: it went to the places the step named, fed their digits into a fact, wrote the result into a grid, and
applied the step again. Here all of that becomes the engine's own dynamics. The experiment's code places the two
numbers into the space at the start and reads the answer out at the end. Between the two there is one call to the
engine, with a step limit as a safeguard (hitting it counts as failure).

## The circuit (all inside the engine)

- **The space is the engine's memory.** Each cell is an association between a place and its content: a gate from
  attending a place to "this place holds 7". Reading a place is completion: attend it, and its content comes on.
- **Writing is forming structure.** One fixed rule of the architecture, run by the engine every moment: when a write
  place and a value are on together, the place is bound to that content, unless the place already holds something
  (nothing is overwritten). The rule is declared; it runs inside every moment, with no code deciding when.
- **The learned step, bound in the circuit's form.** The step the memory learned (as C148: rule B, one step further,
  copies counting) is bound as structure: "+" brings on its parts (three read places, two write places, a move), and the
  parts hold each other on (a state).
- **A clock of six phases**, as fixed architecture (a chain that cycles): 1, the focus and each read part attend a place;
  2, its content comes on; 3, the content is routed into the read part's slot of the fact (gates); 4, the fact opens the
  units and tens, and the write places are picked; 5, the writes happen (the rule above); 6, the focus moves (C141's
  gate, keyed on the phase), and the clock goes back to 1. **The clock moves from phase 5 to 6 only if the fact
  completed**: when a column has nothing to read, no fact completes, the clock stops, the engine's state repeats, and
  the run ends by itself.
- **The facts in the direction of use:** three digits open the units and the tens (gates), so they come on for one
  moment and don't hold. *Different from C144*, where facts were states (which hold themselves on, and would carry one
  column's digits into the next).

## What the experiment's code does

**Before:** learn the step (C148's learning, unchanged); build the circuit and bind the learned step into it; write the
two numbers into the space as an encoder would, each with **one leading 0**, plus **a carry of 0** above the last column
(so the last column has a carry to read, and the leading column has digits to read). **Starting:** "+" and the focus on
the last column, once. **After:** attend each place on the answer row and read what comes on. **Nothing in between.**

## Arms

- **Learned:** each seed's learned step. 20 seeds; 40 sums per length, 4 to 8 digits, ending one column further right
  than training (as C142). A smoke test on two sums (47 + 58 and an 8-digit sum) was run while building the circuit.
- **No write rule** (a control): the same, with writing switched off. One seed's step, 40 sums per length.
- **The coincidence** (a control): C148's wrong step (reading the answer to the right instead of the carry), bound
  into the circuit. 40 sums per length.

## The ledger

**Given:** the encoder (writing the numbers, the leading 0s and the first carry of 0); the circuit's architecture (the
clock's phases, the attending, routing and write-place gates, the write rule, the facts as gates); binding the learned
step into the circuit (the experiment's code turning the learned step into gates); starting it; reading the answer out
(by attending the places, through the engine); the step limit (200 moments). And everything C148 gave for learning the
step. **The engine:** everything between starting and reading out, in one run: reading by completion, routing, the
facts, writing, holding the step and the focus, the clock, the moves, and stopping.

## Predictions (fixed before running)

1. **Learned:** 100% of sums exactly right at 4 to 8 digits, in every seed.
2. **Every run stops by itself** (the engine's state repeats), well inside the limit; the limit is never reached.
3. **Two writes per column worked** (a units digit and a carry), so 2 × (length + 1) writes per sum.
4. **No write rule:** no carry is ever written, so the second column has nothing in its carry place, its fact can't
   complete, and the run stops there: **0%** right, one units digit written at most... in fact none, since writing is
   off: nothing at all on the answer row.
5. **The coincidence:** almost always wrong on long sums (at most 10% right at 6 digits and above).
