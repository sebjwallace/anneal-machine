# Cells engine

A fresh engine built from the [reference models](../../docs/reference-models/README.md), on its own (CTR-2 CAP-1: a
branch, kept apart from the core until it has earned a place). A region is columns of cells and segments, nothing else:
there is no list of assemblies (CTR-1 CON-19). An index from each cell to the segments it feeds keeps work to what is
active (CON-18).

| file | what |
|---|---|
| `region.js` | `Region`: columns and cells (RM-1); segments firing at two, labelled by what they do (`seq` predicts the next input from what came before; `word`, `part`, `bind` complete what is active now; since C81) (RM-2); assemblies stored as segments (RM-3); reading a stream with the column as identity and the cell as context, learning from winners (RM-1, C79); completion with one shared level of support (RM-4, RM-5); binding a sample (RM-7). |
| `test.js` | `node test.js`: the engine's own tests. |

**Not built yet:** fitting by cells (RM-6), the cut (RM-8), prices in links (RM-9).

**Against the contracts today (audit, 14 November 2026):**
1. **No energy rule (CTR-1 CON-1, CON-2).** Segments are grown whenever a column bursts or learns from winners, and are
   never kept or dropped because energy falls. This is the engine's largest gap, and the cause of the cell creep seen
   in C79.
2. **A count per cell.** `used` (segments grown on each cell) chooses the least-used cell. It is derived from structure,
   not a strength or activation, but it is a number kept per cell (CON-9: declared).
3. **One global level of inhibition** in `settle`, not local (RM-5, open).
4. **Settings:** cells per column C and context K are chosen (fixed architecture, CON-3), not derived.
5. **Segment kinds** (`seq`, `word`, `part`, `bind`) are labels local to each segment, not lists, but they are a design
   choice (RM-2).
6. **What is not in the engine yet,** and so has been done in experiments' code: boundaries and letting go,
   recognising a stored word, finding shared cells (C81). Moving these in, driven by the region's own state, is the
   next step.
7. **Clean:** no list of assemblies; work only through the index; the column is identity and the cell context; the bar
   of two from the prices.

**Experiments using it:** C80 (reading text from characters), C81 (levels from letters: words, parts, sentences; two regions).
