# C36 · Findings

**Visual region.** From 400 object pictures it learnt exactly the five objects. Reading 300 whole scenes (no learning)
it recognised 100% of the objects and left no pixel unexplained. So, given known objects, busy scenes are easy to *read*;
C33's stall was about *learning* from them.

**Abstract region, learning (goal 1, 2: met).** From 200 scenes it learnt 14 things. They include city patterns
(a tree or two, a run of houses, a car or two, all as one thing) and forest patterns (a long run of trees with a cabin).
Unseen scenes are read with about one placement each (forest 1.2, city 1.1); 49 of 50 cities and 28 of 50 forests were
read with one thing covering several rows (23 of those forests had a cabin; forests without one are just a tree run).

**Recall (goal 3: partly met).**
- Four houses → a city: 2 trees, 4 houses, 2 cars. Two cars → the same city. Six houses → a bigger city. Three houses
  and a car, trees hidden → 1 tree filled in.
- Ten trees → just ten trees (forests without a cabin are common, so nothing more is asserted).
- One tree, one car, a person, a cabin → nothing.

**Why a cabin recalls nothing.** Hidden places cost nothing but earn nothing either: a placement must be paid for by
what is visible. In this input every item is one pixel, so one cabin is one pixel of evidence and can't pay for a
placement. Two or more items can. That is the engine's rule working, not a bug, but it means the abstract input has
lost the *weight* of the evidence: in the visual region a cabin is 20 pixels. "One telling item recalls the scene"
needs either items that carry more weight, or a rule for recall that differs from seeing. Not decided; nothing changed.

**Ambiguity.** The single tree is undecided, as hoped, but for the weight reason above rather than a tie.

**Result.** The engine works unchanged on abstract input and learns scene types; recall works from two or more items.
