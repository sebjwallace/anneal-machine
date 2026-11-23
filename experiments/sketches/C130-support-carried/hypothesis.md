# C130 · Support carried: hypothesis

Distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), V1b: the choice between overlapping pieces.

## Why

C129 found the pieces through the engine's own bonds, with no index. But the choice between overlapping pieces was
still made in one of two ways. Either it was computed as the cheapest path through the sentence's completions
('settle'), which isn't the engine's rule. Or it was made by the engine's competition, once over the sentence
('compete'), which cost up to 5% in energy. Competition picks the piece that saves most where pieces overlap. A long
piece that saves a lot can beat two short ones that together save more.

## The change

Keep the engine's competition rule exactly: most support wins, a tie is held. Change only what support is and when
competition happens.

- **Support in the currency.** The engine's support is counted minus missing, a count of members. Here support is what
  a way of explaining the sentence saves against spelling every letter, in the same currency the energy rule uses
  (CTR-1 CON-2 one currency; CAP-6 thresholds from prices).
- **Competition as each letter arrives, with support carried.** At each moment the ways of explaining the sentence up
  to here compete. They are: the letter read loose, continuing what won the moment before; and each piece whose chain
  completes now, continuing what won at the moment it started. A way's support is the support of what it continues
  plus what it saves itself (a loose letter saves nothing). The winner is held in the state, as history (CAP-12), for
  later pieces to continue from. Only the completions ending now are touched (CON-18).
- When the sentence has arrived, the reading is the last winner and what it continued, back to the start: following
  links held in the state, not a search.

## Prediction

This reaches the cheapest description: each moment's winner is the cheapest way of explaining everything up to it, so
carry reads exactly as settle, apart from ties. Energy and every reading measure within 1% or 1 point of settle on
both books.

**Survives if** that holds. Then the choice no longer needs a calculation over the sentence, only the engine's
competition with support counted in the currency. Whether that change to support is acceptable is the owner's call.
