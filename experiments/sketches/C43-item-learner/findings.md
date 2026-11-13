# C43 · Findings (out-100.txt, out-300.txt, out-compare.txt; everything runs in under 5 s)

**The learner works on items with identity.** Episodes are held as states, recall from two of them works
(A + P → J filled in), A + J at a real fork is undecided, and a lone item recalls nothing. The PAIRED control is right:
two plain episodes, no kind, so no invented routes.

**Kinds with two slots do form by energy alone** in the bigger hubs (e.g. "? → J → ?" with starts E/A/F and ends S/R).
But never the whole "any start, any end" form. They come out as several partial kinds, and A + Q (never happened) is
never recalled.

**Why: the prices.** Energy of a 6 × 6 hub, against one hand-made kind covering everything:

| window | nothing stored | what was learnt | one kind "? → J → ?" |
|---|---|---|---|
| 100 | 300 | 288 | 309 |
| 300 | 900 | 781 | 853 |
| 1000 | 3000 | 2279 | 2755 |

The full kind is *more* expensive than what was learnt, and at window 100 more expensive than storing nothing. Each
use of a kind pays for naming which unit (in pc) **and** for naming each slot's version (log2 of the versions). Naming
one of 34 episodes costs about the same whichever way you do it, so the kind pays for naming twice. Under today's
prices (the engine's own, milestone 10), splitting into small kinds or storing episodes is always cheaper than the
general form. Merging kinds was offered every rest and never lowered energy.

**Result.** Learning over items with identity works and is fast, and two-slot kinds do form. Generalising to "any start,
any end" doesn't, because the price of using a kind counts the naming twice. Whether a kind's use should cost
log2(all its versions), not the unit name plus each slot's choice, is a pricing question for the owner. Nothing in the
core changed.
