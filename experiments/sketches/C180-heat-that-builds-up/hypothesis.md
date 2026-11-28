# C180 · Heat that builds up (round two, step one): hypothesis

**Written after the run, not before it.** That's a lapse, and it's disclosed. Nothing below is a prediction. It records the
question and the setup as they were when the run was made, so that the findings can be read against them.

## The question

C179 found heat lowering the bar the best of the candidate rules, but in C179 it was done in rounds: every change near
the heat, ring by ring, the best kept. Can it work as heat dynamics instead? One try at a time; heat building up on
the parts an attempt blames, while their work stays undone; the reach of the alternatives growing with the heat;
competition by heat less distance; the first change that cools more kept, and the heat reset.

## The setup

C179's harness, unchanged (one memory replayed through its earlier lessons; the same two lessons; tests from the
start), with one new arm (`heatRule` in `heat.js`):

- **Blame:**
  - a write whose writing didn't cool is hot (it landed on a full place, gave a wrong digit, or never wrote);
  - when a write gave a wrong digit on a place of the working, the heat spreads back to everything that fed it (the
    reads, the sign read, holding, the move);
  - where the work stopped, a read whose place was empty is hot.
- **Heat** on a part goes up by one each attempt that blames it, and resets to zero for every part when something cools
  more.
- **The bar:** a hot part's alternatives may reach as far as its heat. Writes move only to places of the working still
  to be done, and reads only to places holding something.
- **Competition:** heat less distance; ties by a fixed order of parts and places (declared). One try at a time. A
  change that doesn't cool more is marked tried and lost.
- **When nothing is let through,** heat builds without a try, until the reach is the whole frame. Then two of the twelve
  strongest alternatives are tried together (a fallback, declared).
- **Kept by the code, not the memory:** the heat levels, the tried marks, and the competition's ranking.
