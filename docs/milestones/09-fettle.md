# 09 · Fettle: cleaning off what doesn't belong

## In one paragraph
Along the way, the experiments picked up crutches: fixed numbers, filters, and rules that someone (the assistant) wrote to patch failures. Fettling removed them. Each was either replaced by the engine's own rule (keep whatever makes the description cheapest) or simply removed. Then every milestone was re-run on the cleaned engine to prove nothing was lost. Several got better.

## Why it matters
- **Without this, the results could have been an illusion,** propped up by patches. Now every behaviour comes from the engine's principles, or is written down as a choice (see `docs/decisions/`).
- **The principle turned out stronger than the patches.** Several results improved once patches were replaced by the principle.

## How it works: what was replaced
| Crutch | Replaced by |
|---|---|
| Scraps of old memories kept as parts | Memories may hold loose pixels. A part that only one memory uses goes back to being loose pixels. At rest, old memories are re-described with what's known now. |
| Pulling apart only at the biggest overlap | Every shift is priced; the one that saves most is used. |
| "Try only the 12 strongest openings" when explaining | Every opening is tried (awake). |
| A search budget at rest | Every candidate change is tried. |
| "Keep 3 cells per child" in an assembly | An assembly is the smallest set of cells completion rebuilds the thing from. |
| Completion choosing between two equally good answers | If the evidence can't decide, it doesn't. |
| "Pair the nearest with the nearest" for things that moved | Not needed: changes are compared as whole sets. |
| "Exact memory beats shared change" and "apply a change once" | One rule: the most detailed fit wins, and where something happened counts as detail. The state carries a moment of history. |
| A separate copy of the explaining code for completion | Completing a picture is seeing, with hidden places. |

## What it showed
- **Seeing:** 13 parts (C20 kept 30), none unused, heat zero on new pictures, the cheapest description yet (1,191 vs 1,407), and all shapes and objects found.
- **Cells:** every result held. Assemblies got smaller (2 cells for a house instead of 4), and completion still rebuilds every thing from them.
- **Completion:** results held, with **no invented pixels** (previously up to 16).
- **Change:**
  - every world as good or better;
  - the bouncing stick without context went from 59% to 100% (history carries direction);
  - "one moving, one staying" became a genuine 100% (it was luck before).

## What to show people
- Before and after: the same tests, side by side.
- Each remaining choice, labelled as a choice (`docs/decisions/`).

## Limits and open questions
**What's still a choice:**
- 001 the quick search at rest (a compute limit);
- 002 the order in which rest tries changes;
- 003 the 90% threshold for remembering a picture;
- 004 one floor per level;
- 005 "seen most" as the last tie-break;
- 006 designed demonstrations in the tests.

**Also open:** forgetting. When many small things are scattered around, keeping every memory exactly makes coincidences between memories genuinely "worth" keeping.

## Where it lives
- Code: all of `src/engine/`. Tests: `src/test/`, with old results in `src/test/baseline/`.
- Experiment: C26. Findings: `experiments/findings/C26-clean.md`; `docs/architecture.md`.
