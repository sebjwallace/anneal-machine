# C139 · Attention learnt by heat

The owner's idea: registers that only hold activity, and the memory learning where to point attention among them,
driven by heat. Three operators ("−", "+", "×"), each with a hidden convention about which registers it reads. From
worked examples, an open answer is heat; a search finds which registers fit; at the fit, the operator and the attention
are bound; next time the engine recalls the attention from the operator alone.

"−" was learnt in every seed from one to three examples. "+" and "×" never were, because a commutative operator always
fits two orders and the rule only bound a unique fit. After the first run (declared), ties were held open across
examples; then all three were learnt from one to four examples, with no wrong answer in any seed. In two seeds an
early wrong binding of "×" was never outcompeted, because repeated bindings form separate chains that don't compete.
The learning decisions are the experiment's rules, not the engine; the findings set out exactly what did what.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `engine.js` (C138's copy, unchanged) · `attention.js` (the world, the arms, the ledger marked in the code as GIVEN
  and ENGINE). Run: `node attention.js > out.txt`.
