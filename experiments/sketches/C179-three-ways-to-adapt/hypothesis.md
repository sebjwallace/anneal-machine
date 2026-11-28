# C179 · Three ways to adapt (round one of the fan-out): hypothesis

Written before the full run. Only the reference arm was run first, as a smoke test: it reproduced C178 (258 runs, 200 of
200). Date: 2026-11-27.

## The question

The owner asked to fan out over the three candidate energy rules ([candidate energy
rules](../../../docs/theories/candidate-energy-rules.md)) rather than pick one, to learn their trade-offs, how they
complement each other, whether one is better, or whether there's another option. Round one copies each rule as a way of
choosing which change to try when the memory adapts what the start brought up. All of them are the code's in this round.
The winner, or the best combination, is to be built into the engine's dynamics in round two.

## The setup

- **The one memory of C178**, rebuilt fresh for every arm and replayed through its earlier lessons. The first lesson's
  search is cached across arms, which is deterministic, and its tries are still counted.
- **Two tasks:**
  1. **times one digit, from adding** (two worked examples);
  2. **the second row, from times one digit** (C178's four worked examples).
- Per worked example: recall, then the memory's offers, then adapting with the arm's rule, from the way of working that
  started the work.
- **The arms**, all moving parts only near the heat (writes to places still to be done; reads to places holding
  something), each part on its own:
  - **Greedy** (C177's rule, the reference): every change; keep the one that cools most; pairs if none helps.
  - **B, heat lowers the bar:** the nearest changes first (by how far the part moves), widening ring by ring until a
    change cools more. The winner is kept and the bar goes back up. Pairs, ring by ring, if no single change helps.
  - **C, spreading from the gap:** only the working's first places count, in the order the working is done (column by
    column from the start). A change is kept if it settles the working further along from the start. Up to three partial
    fits are kept side by side (ambiguity branches). Pairs for the best fit if no single change helps.
  - **A, a fixed budget flowing:** six units, each holding a way of working, each stepping to a random change near the
    heat, kept if no worse (so units drift on level ground). Units are never copied, and the first to settle wins. Five
    seeds. The randomness is declared: it's new here, and it's what lets units spread.
- **Tests:** 200 new of the task's kind from the start (recall), in the same memory.

## Predictions

1. **Times one digit:** every arm finds it in a few dozen runs at most. Only one change is needed (holding the bottom
   digit), and it's near.
2. **B on the second row:** about the same as greedy (200 to 300 runs), perhaps fewer. The second row's changes are
   mostly far, three to five rows, so B tries every near change first in each round. Risk: an early near change agrees by
   coincidence and leads it astray.
3. **C on the second row: stuck.** The first gap, the first column's answer, can't be filled by one or two changes from
   times one digit. It needs the answer moved down, the top read one over, and the carry read from where the second
   row's carry sits, all at once. Greedy gets round this because it rewards cooling anywhere, even out of order. So
   spreading strictly from the gap should fail here, and that would be its key trade-off.
4. **A on the second row:** succeeds in some seeds, with more runs than greedy and a wide spread. Some seeds may not
   settle within the budget (120 steps of six units).
5. **Tests:** whichever arms settle the right way of working get 200 of 200. An arm that settles only a coincidence
   gets fewer.

## The ledger

**Given in every arm:**
- the proposing (the code's, in a different form per arm);
- in arm A, the randomness;
- everything else as C178.

## Added after the first arms ran (written before the combination arm ran)

The first full run was stopped after spreading had been running over half an hour on the second row. A cap of 3,000
tries per worked example was added for every arm (reaching it counts as stuck), and spreading and flow were rerun. The
cap didn't bind: spreading stopped by itself at about 1,650 tries per example (stuck), and its first run was slow only
because runs slow down as the memory fills. Greedy and B were rerun with the cap for their details, and gave the same
numbers as the first run.

**The combination arm, A + B, a budget flowing toward the nearest changes:** as A, but each unit picks a change with a
chance that falls with how far the part moves (one over the distance squared), so near changes come up far more often.
Five seeds. Prediction: fewer stuck seeds than A, because units waste fewer steps on far changes. But the second row
needs far changes, so some seeds may still run out of steps, and the runs will be more than B's.
