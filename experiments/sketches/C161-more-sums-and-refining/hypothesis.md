# C161 · More sums, and refining (a taste): hypothesis

Follows [C160](../C160-keeping-what-episodes-share/findings.md), a taste in which each frame was also bound with the
overlap of its new view and each earlier view. Right answers rose to 69 to 88%, but 10 to 30% of sums recalled
nothing, likely because some overlaps kept digits two sums shared by coincidence.

**Two questions, as a taste by agreement with the owner.** First, do coincidences wash out with more worked sums? The
sign repeats on every sum of its kind, a coincidence only now and then, so the clean abstractions should gather far more
support. Second, does the way overlaps form scale? Comparing each new sum with every earlier one grows the number of
overlaps roughly with the square of the sums seen, which goes against the efficiency principle and may make things
worse, since more coincidences means more competition. The alternative, **refining**, compares a new sum only with the
overlaps the frame already has (with its episodes only until it has one), so "+, 0 carried in, 5" meets a sum without
the 5 and narrows to "+, 0 carried in", which gains support rather than adding a new structure.

**Setup.** As C160, at 8, 24 and 48 worked sums per seed (cycling "+", "−", "×", long row), each with overlaps against
every earlier view ("episodes", as C160) or refined ("refine"). 4 seeds; 20 test sums of each kind. **Given, declared:**
as C160, plus, for refining, the binding rule keeping track of which of a frame's chains are overlaps it formed
(bookkeeping inside the fixed rule).

## Predictions (fixed before running)

1. **Episodes:** "nothing recalled" falls as sums grow, but the overlaps kept grow fast (hundreds by 48 sums), and the
   gain flattens or reverses.
2. **Refine:** few overlaps kept, settling on the clean ones (each sign with the 0 carried in), and "nothing recalled"
   falls further than for episodes, with all four kinds right nearly always by 48 sums.
3. Wrong frames stay rare in both.
