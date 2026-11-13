# Journal

What changed in this sandbox, and why: one entry per change, newest first, only ever added to. Each entry is a version. See `lib/sandkit/practices/journal.md`.

## 0.5.0 · 2026-11-13 · Added

**Changed:** A new page, **Workbench** (`workbench.html`), with a new domain component, `<an-sequencer>` (`components/an-sequencer/`): a schematic grid of columns you set up yourself (rows, columns, cells per column), and a timeline of steps. At each step you paint which columns are on (drag to paint), or pick single cells; **Hold** keeps a column on at every step. The step before shows faintly. Each step has a thumbnail; play it back or step through with the arrow keys. The whole design can be copied or loaded as JSON.

**Why:** The owner wants to set up columns and design sequences of column activations by hand, to run experiments (transition memory and others) himself.
**Parts:** built by hand as a domain component; nothing in Sandkit designs sequences. A separate component from `<an-columns>`, which shows what the engine holds; this one is for designing input.
**Open:**
- Nothing runs on it yet: wire the engine to it (feed each step's active columns to transition memory or completion, and show what the engine predicts or recalls next to the design).
- Cells within a column are equal for now (no floors).

## 0.4.0 · 2026-11-13 · Added

**Changed:** Two domain components, both from drafts the owner settled earlier:
- `<an-columns>` (`components/an-columns/`) replaces `<an-column>`: several columns side by side, lines up each column and across columns, a view cube, orthographic by default, row or grid layout, a collapsed settings panel (floors, lines, labels, spacing, grid and face strength), highlighting by ref and tags with the rest dimmed, and click to keep a cell's neighbours. Chapter 2 uses it for the single column in "A column is a stack of grids" and for **all** the lamp's columns in "Floor 2".
- `<an-assembly>` (`components/an-assembly/`): one thing seen two ways at once, its cells in its pieces' columns (an `<an-columns>` inside) and its picture, linked by pointing. Focus on a thing inside it, offsets from each thing's own centre, kept or filled in, pull apart, play completion, and which other things share each piece. New stage 8, "Looking inside a thing"; "So far" is now 9.

**Why:** The owner asked for both to be brought into the sandbox as domain components.
**Parts:** `<an-assembly>` composes `<an-columns>` rather than drawing its own columns. Its data, `data/assemblies.js`, is a snapshot of the engine's own output from an earlier session, not live yet.
**Open:**
- Drive `<an-assembly>` from the engine live (regenerate the data in `model.js`), and make "play completion" step through real completion rounds.
- Chosen tags (`sb-tag-focus`) still aren't supported.

## 0.3.0 · 2026-11-12 · Added

**Changed:** A first domain component, `<an-column>` (`components/an-column/`): one column as a 3D stack of floors, with a cube for each lit cell. You can drag to turn it, and its view settings cover empty cells, labels, one floor or all, the spread between floors, and resetting the view. It's used twice in chapter 2:
- in "A column is a stack of grids", replacing the flat drawing; the dotted words "Floor 0", "Floor 1" and "Floor 2" light their floors;
- in "Floor 2: things made of things", showing A's column for the lamp, with dotted words for the hat's A, the cup's A, where they are, and the lamp's assembly.

**Why:** The owner asked for a reusable 3D column, with cubes as cells, to turn around, with view settings, taking part in highlighting.
**Parts:** CSS 3D transforms rather than WebGL. There's no library or build step, every cube is an element (so it carries `data-ref` and `data-tags`, and highlighting, comments and locating reach it), and colours come from the theme tokens. A canvas's parts can't be pointed at.
**Open:**
- Chosen tags (`sb-tag-focus`) aren't supported yet.
- Clicking a cube does nothing yet.
- It may be general enough for Sandkit (a "3D cell stack"): worth a mention in the handover.

## 0.2.1 · 2026-11-12 · Changed

**Changed:** Chapter 2 gets a new stage, "A column is a stack of grids (floors)", before anything relies on the word. It has a drawing of one column as a tower of three floors, says what each floor's offsets are measured from, and adds a definition. The next stages are now named after their floors (floor 0, floor 1, floor 2), and every small grid in the column drawings is labelled with its floor.
**Why:** The owner read "floor" without it ever being introduced, and had to guess. A term must be introduced before it is used.
**Parts:** the tower drawing is by hand (SVG), like the other column drawings.

## 0.2.0 · 2026-11-12 · Added

**Changed:** Chapter 2, columns and assemblies (`columns.html`), as a notebook of seven stages:
1. the smallest pieces;
2. a column's cells are positions;
3. things as pieces at offsets from their own centre;
4. an assembly as the smallest cue that brings a thing back;
5. completion;
6. things made of things;
7. so far.

**Why:** The owner wants the principles from first principles, independent of any kind of input, so there are no pictures. Plain symbols (A–E) stand for any primitive.
**Parts:**
- the model → the engine's own `cells.js` and `complete.js`, run unchanged on a world of symbols (`symbols.js`: hat, cup and arch share A and B; the lamp is a hat above a cup);
- sections → `sb-notebook`;
- definitions → `sb-callout`;
- the field of symbols and the columns as stacks of floors → drawn by hand (SVG). `sb-grid` colours cells but can't write a symbol in them, and a column needs several small grids stacked as floors. **Candidates:** a "symbol field" component, and a "column with floors" component.
**Open:** In the lamp's columns, floor 1 shows the hat's and the cup's cells together (both are level-2 things). Whether that should be one floor per level or a shared floor is decision 004, the owner's call.

## 0.1.0 · 2026-11-12 · Added

**Changed:** First iteration: chapter 1, the basics, as one notebook of five sections. The model is the real engine, loaded from `../src/`.
**Why:** The owner wants to catch up on how the engine works before steering it further, starting with the foundations: one rule, one currency, seeing, rest.
**Parts:**
- sections → `sb-notebook`;
- definitions → `sb-callout`;
- pictures coloured by the part that explains each pixel → `sb-grid`;
- the bill and counts → `sb-stat`;
- small drawings of learnt parts → by hand (`partCanvas`): `sb-grid` carries a legend and is sized for a whole picture, too heavy for a gallery of tiny shapes. **Candidate:** a "shape swatch" component;
- the move log → by hand (a plain list), since `sb-log` wasn't needed for a few lines;
- the model → the Anneal engine (`../src/engine/see.js`), not a Sandkit mechanism: it is the subject itself.
**Open:** Single-file export won't carry `../src/` (the engine lives outside the sandbox). The chapter plan waits for the owner.
