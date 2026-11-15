# C82 · Rebinding a variable: hypothesis

Written 15 November 2026, from a conversation with the owner about "the", variables and heat. A variable is a state that
stands until something forces it to change: "x is 3" holds until "x = 5" arrives. Binding a variable to a value is a
tie (RM-7): cheap, a handle from each. Unbinding should be cheap too, and should happen because of heat: when "x" is
seen with "5", the old joint brings back "3", which the input has replaced. That joint is what doesn't fit, so it is
what should loosen.

The core can already do both halves (tie, and remove a segment, as the cut does), but nothing makes it unbind: every
tie is kept. So "x" alone ends up bringing back every value it has ever held.

**The change (one, in `engine/volume.js`):** where the cut's condition holds (a memory wholly read as what fits and what
is brought back, and the input has a remainder of its own) but the two pieces are already each held on their own (a
composition of them, which the core leaves alone), the joint between them loosens: each cell with a segment spanning the
two loses one such segment. A joint tied once is then gone. One backed by more segments is not (C83).

**Hypothesis:**
- with the change, "x" alone brings back only its current value, after any number of rebindings;
- structure stays flat: each rebinding ties one joint and loosens one, so nothing piles up;
- the core brings back everything it was ever bound to.

**A risk seen on the development seed:** the change is symmetric. A value can belong to several variables, a variable
holds one value, and nothing in the structure says which is which. When "y" is bound to the value "x" holds, that value
brings "x" back, and "x"'s joint is read as the one replaced. So the experiment has two conditions: values never shared
between the variables, and shared freely.

Predictions in [PREREG.txt](PREREG.txt).
