# C61 · Looking for lost keys · findings

A fringe sketch, **not the engine**: the recall rule and the engine's pricing written out directly, with the branch's
store of experiences for memory. 300 days; each day the keys are somewhere in a 5-room house (kitchen 50 %, hallway 25 %,
lounge 15 %, bedroom 8 %, garage 2 %); each search's episode (want rising to keys found) is kept as an experience.

| Run | Found | Looks per search | Revisits |
|---|---|---|---|
| HELD: the machine holds its own looks for the episode | 250/250 | 2.06 | **0** |
| NO-HOLD control: looks not held | 126/250 | 25.3 | 6,076 (stuck looking in the kitchen) |
| MARKED control: we mark the wrong rooms seen (puppeteering) | 250/250 | **1.00** | 0 |
| For comparison: looking in order of the true odds | | 1.87 | |

## What it shows (only about M1-M4, the machine's part)
- **No revisits, with no list of visited rooms and no negative association.** "Kitchen, no keys" is never stored. The
  kitchen candidate loses because it claims keys in a room the machine has now seen empty, which costs; claims about
  rooms not looked at are free. Without holding its own looks (NO-HOLD), the same machine looks in the kitchen forever:
  the held episode is what does the work.
- **Nothing negative is left behind.** When the keys are found, the hold lets go. The next day the first look is the
  kitchen again: an empty kitchen yesterday is no ban today.
- **A never-before place is found when nothing known fits** (the garage, first time: kitchen → hallway → bedroom → lounge
  → garage), and the episode is kept, so later the garage is a candidate. But see G5: how it reached the garage was given.

## What it does NOT show (given by hand: G1-G5 in run.js)
- **The search order** (usual places first, 2.06 looks against 1.87 for the true odds) comes from G4, a rule we gave:
  among equally cheap candidates, the room more kept memories point to, then the most recent. Not evidence.
- **Looking somewhere new when nothing fits** is G5 (house order). No curiosity mechanism yet.
- **Perception is perfect** (G2), and the want's rise is given (G3).
- **The engine's own pricing was not run.** M3 is the engine's rule (a misfit costs 1, hidden is free) written out by
  hand. In this sketch it behaves like a visited list; the difference is where it lives (the held state of what was
  seen, priced, gone when the want is satisfied), not what it does here. Running it through the engine's read with the
  hidden places built from its own looks is the real test.

## The puppet control, as a warning
Marking the wrong rooms as seen by hand gives a "perfect" searcher: 1.00 looks, better than the true odds allow. That
is what puppeteering looks like in a result: too good, and proving nothing about searching.
