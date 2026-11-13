# C29 · One energy across seeing and change: findings

## Result (100 episodes, 600 pictures, seed 1)

| version | kinds kept | different changes | seen variants: exact / overlap | never-seen: exact / overlap |
|---|---|---|---|---|
| plain engine | 0 | 12 | 47% / 92% | 0% / 72% |
| kinds, seeing-only energy (C28) | 0 | 8 | 43% / 94% | 0% / 72% |
| kinds, one energy | **3** | **6** | **100% / 100%** | 0% / **87%** |

The "staying put" baseline is 24% overlap on seen variants and 28% on never-seen ones. Each run takes about 20 seconds.

## What it shows
- **One energy makes kinds pay.** With seeing-only energy, kinds form and then dissolve, and none survive. Once change
  is in the same bill, three kinds are kept, one per base (2, 5 and 3 shared placements; 2, 3 and 3 fillers).
- **One change covers every variant.** A change is recorded against the kind, not the particular filler. Six changes
  replace twelve, and every seen variant is predicted exactly.
- **Never-seen variants are only partly handled.** The base moves correctly, which explains most of the overlap rise
  from 72% to 87%. The top piece is wrong, though. The frame kind has no "dots" filler, because dots were never seen on a
  frame and fillers are not shared across kinds. Energy has no reason to share them: sharing only pays if it predicts
  something not yet seen.

## Bugs fixed on the way
A kind could end up containing itself. This could happen through *widen*, when the kind already held the composite being
folded in, or through *make*, when one of the two composites held the other. The structure tidy then looped forever.
This was the "slow run": it was a hang. The fix refuses those moves (`contains(K, C)`, `contains(A, B)`, `contains(B, A)`)
in both `C28-kinds/kinds.js` and `c29.js`. With the fix, every version finishes in under 30 seconds.

## Open question for the owner
Should energy count **predictive value**? For example, should sharing a filler set across kinds be rewarded because it
covers combinations not yet seen, or should energy stay strictly about evidence? Never-seen exact prediction depends on
this answer.

## Status
This is an experiment only. If it is adopted, kinds and one energy would move into `src/` with tests and a milestone note.

## Correction (after C30)
The numbers above were affected by a flaw found in C30. The last rest of a run weighed structure against only the final 12 pictures and threw much of it away. That hurt the plain engine most. With the flow kept across rests, seeing alone predicts 90% of seen objects exactly (with the energy-based remembering of C30: 100%). One energy reaches 90–100% with fewer things and changes. One energy still makes the smaller description, but it is not the dramatic 47% → 100% reported above. See `docs/checkpoints/10-kinds.md` for the current numbers.
