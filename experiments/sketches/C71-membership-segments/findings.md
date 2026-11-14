# Findings 08: segments as assembly membership

*Findings from sketch 38, November 2026. Tests [hypothesis 06](hypothesis.md).*

## What was tested

Each cell gets one segment per assembly it belongs to. The segment fires when enough of that assembly's other members are active (a soft AND per assembly, ORed across assemblies). This was compared with summed links, in finding 02's sentence world, with cells per column swept from 2 to 16 so that cells go from heavily shared to rarely shared.

Five fresh test seeds, settings fixed in advance. Three design changes were made on a development seed before freezing:
- word order and role units were added, because a plain bag of words confused "the c is in" between two roles;
- raw summed links were used as the fair baseline, because fit-normalised sums scored 0%;
- a "whole set" segment version was added, keeping every co-active unit rather than a sample of 16.

## Results

Strict episode recall, with blends in brackets, at 400 stored episodes:

| cells per column | summed links | segments (16 sampled) | **segments (whole set)** |
|---|---|---|---|
| 2 | 0 (71% blends) | 0 (100) | **68 (18)** |
| 4 | 18 (37) | 0 (100) | **85 (6)** |
| 8 | 86 (3) | 0 (100) | 94 (2) |
| 16 | 94 (5) | 0 (100) | 92 (5) |

| prediction | verdict |
|---|---|
| 1. No blending from shared cells | **Holds** when cells are heavily shared (2–4 per column) |
| 2. More assemblies in the same cells | **Holds**: at 4 cells per column, 400 episodes against under 25 for summed links |
| 3a. Completes from a partial cue | **Fails**: 0% with half a cue, against 81–86% for summed links |
| 3b. A split cue completes neither | Holds, but summed links don't blend there either |
| 4. Kind still transfers | **Fails**: 0% |
| 5. Cheap via an index | **Fails**: about 98% of segments are checked on every probe |

## What held

1. **Membership segments keep shared cells from blending.** With 2–4 cells per column, where summed links collapse into blends, whole-set segments still recall 68–85% of episodes.
2. **Capacity comes from combinations.** At 4 cells per column, segments held 400 episodes; summed links fell below 75% recall before 25. When cells are plentiful (8–16 per column), the two are equal.

## What didn't

- **A sample isn't enough.** The hypothesis's own version, a segment of 16 sampled synapses, blended almost every time. Only segments that keep the whole co-active set worked.
- **No completion from a partial cue, and no generalisation by kind.** A whole-set segment with a strict threshold is essentially an exact template: it recognises the assembly it was made from and nothing else. Lowering the threshold to 0.6 restores partial completion (61–64%), but brings blending back on split cues.
- **Not cheap.** Almost every segment is checked on every probe, and nearly every cell grows a segment for every new sentence.
- **Not like for like.** Whole-set segments store many more synapses than summed links store links. A summed version with matched storage wasn't tried.
- **Segments have no strength.** A repeated fact grows one segment, not a stronger one, so frequency is invisible.
- **Noisy at 2 cells per column** (per-seed recall 24–93%), with small fact and held-out sets.

## Conclusions

1. **Hypothesis 06 is partly supported.** Membership segments do what was hoped for *specificity*: no blends and much higher capacity when cells are shared. They fail on everything that needs *tolerance*: partial cues, kind transfer and cheapness.
2. **Segments and summed links sit at opposite ends.** Segments are sharp: exact, separate, episodic. Summed links are tolerant: completing, generalising, semantic. This is the same split as earlier in the project between episodic and semantic memory, and between cells and columns. It suggests a cell needs **both**:
   - summed links for completion and kind;
   - segments to keep shared cells from blending specific memories.

   Neither replaces the other.
3. **The original framing (one segment per assembly, a sampled soft AND) needs work.** It may need a segment that grows from a sample but adds synapses as the assembly recurs, so it tightens with experience. Or it may need a strength that grows with repetition, which would tie it to permanence.
4. **For the distillation:** membership segments are not the simplifying single mechanism hoped for. They are a specificity layer worth keeping only where cells are scarce.

## Reproduce

```
cd sketches/38-membership-segments && ./runall.sh     # 35–80 s per run; see NOTE.md, PREREG.txt and summary.txt
```
