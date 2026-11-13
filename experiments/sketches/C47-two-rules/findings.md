# C47 · Findings (out-small.txt, out-grid.txt, out-grid5.txt)

5 × 5 grid park, the biggest test (real new routes trusted / wrongly doubted · made-up routes caught / missed):

| days | general shapes | ONE RULE | TWO RULES |
|---|---|---|---|
| 300 | 8 walks, 0 kinds | 10 / 0 · 0 / 0 | 10 / 0 · 0 / 0 |
| 1000 | 10 walks, 14 kinds | **0 / 6** · 31 / 0 | **6 / 0** · 31 / 0 |
| 3000 | 12 walks, 25 kinds | **1 / 9** · 38 / 0 | **8 / 2** · 38 / 0 |

**Both catch every made-up road.** A made-up road has a step no one ever took, so it's unbacked either way.

**Only two rules keeps trusting real new routes.** As experience grows, the energy rule folds specific walks into
general shapes, so under one rule the steps of real routes lose their backing too, and real routes get doubted
(9 of 10 by 3,000 days). With a store of walks under its own rule, 8 of 10 are trusted. The small parks show the same
in miniature (one rule doubts 1 real route at each stage; two rules none).

**Made-up roads grow with experience.** In the 5 × 5 park, 38 made-up routes against 10 real ones by 3,000 days:
general shapes get more generous the more they see, so the check matters more, not less, over time.

**Result.** One store under the energy rule can catch the lies but ends up doubting the truth. Keeping experiences
under their own rule (keep at once, refresh when seen again, fade when unseen) is what lets new combinations of lived
steps be trusted. Where it lives (separate region or the same columns) wasn't tested; the rule is what mattered.
Engine unchanged. Slow part: the 5 × 5 learning (5 minutes for all four stages).
