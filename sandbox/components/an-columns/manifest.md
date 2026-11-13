# an-columns

**Columns** side by side, each a 3D stack of **floors**, with a cube for each lit cell. Lines join a piece's cells up its column (solid) and a thing's cells across columns (dashed). Replaces the first single-column `an-column`.

A domain component of the Anneal sandbox. CSS 3D only, no libraries: every cube, line, plate and column name is an element with `data-ref` / `data-tags`, so it takes part in highlighting like any other part.

## Usage

```html
<script src="components/an-columns/an-columns.js"></script>
<an-columns id="cols" radius="3"></an-columns>
```

```js
const el = document.querySelector('#cols');
el.columns = ['A', 'B', 'C'];
el.floors = [{ f: 0, label: 'floor 0 · where' }, { f: 1, label: 'floor 1 · hat' }];
el.cells = [
  { col: 'A', f: 0, x: -1, y: 1, chain: 'a1', tone: 'accent', ref: 'hat-where' },
  { col: 'A', f: 1, x: -1, y: 0, chain: 'a1', group: 'hat', color: '#7F77DD', ref: 'hat-A', tags: ['hat'] },
];
```

## Properties and attributes

| | Meaning |
|---|---|
| `columns` | Column names, in order. |
| `floors` | `[{ f, label, ref, tags }]`. A floor's `ref` lights its plates. |
| `cells` | `[{ col, f, x, y, ref, tags, chain, group, filled, color, tone, text, title }]`. `x`, `y`: offset from the floor's middle (−radius…radius). Cells with the same `chain` are joined up the column, floor to floor; cells on one floor with the same `group` are joined across columns. `filled`: drawn dashed (filled in by completion). `color` any CSS colour, or `tone` a theme token name. `text` on the cube's top. |
| `radius` (attribute) | Cells from the middle to an edge. Default 3. |
| `highlight` | Refs to keep lit. |
| `--an-s`, `--an-h` (CSS) | Cell size (16px) and stage height (460px). |

## Behaviour

- Drag or arrow keys to turn; the cube in the corner snaps to a face, edge or corner. Orthographic by default.
- View settings (collapsed): row or grid layout, orthographic, which floors, which lines, labels, floor and column spacing, grid and face strength, reset.
- **Pointing** at a cube announces its ref and tags (`sb-highlight`); at a line, the refs of both ends; at a column name, `c:<name>`. **Announced** refs and tags light cubes (others dim), and lines whose ends are both lit; `c:` and `f:` tags light plates and names.
- **Clicking** a cube keeps it and its neighbours (up and down its chain, and its group on that floor); a line, its two ends; a column name, the whole column. Click again or Escape to clear.
