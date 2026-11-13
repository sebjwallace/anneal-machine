# an-sequencer

A design pad for column experiments. Set up a grid of **columns** (rows × columns, cells per column), then design a **sequence**: for each time step, which columns are active (all their cells, or chosen cells), and which are **held** on at every step. A timeline of steps with thumbnails; play it back.

A domain component of the Anneal sandbox. Nothing runs on it by itself: it holds the design and tells the page what is active at each step, so experiments (transition memory, completion, …) can be wired to it.

## Usage

```html
<script src="components/an-sequencer/an-sequencer.js"></script>
<an-sequencer id="seq" rows="8" cols="8" cells="4"></an-sequencer>
<script>
  seq.addEventListener('an-step', (e) => console.log(e.detail.t, e.detail.active));
</script>
```

## Attributes, properties, methods, events

| | Meaning |
|---|---|
| `rows`, `cols`, `cells` (attributes) | Starting size. Default 8 × 8, 4 cells per column. Also editable in its bar. |
| `design` | `{ rows, cols, cells, held: [{ col, cells }], steps: [[{ col, cells }]] }`. `col` like `"A1"` (row letter, column number); `cells` is `"all"` or a list of cell indexes. Set it to load a design. |
| `step` | The current step (from 0). Set it to go there. |
| `length` | Number of steps. |
| `activeAt(t)` | What's active at step t, held columns included: `[{ col, cells: [indexes] }]`. |
| `an-sequence-change` (event) | Fired when the design changes; `detail` is the design. |
| `an-step` (event) | Fired when the current step changes (selecting, playing); `detail` is `{ t, active }`. |

## Behaviour

- **Tools:** *Paint columns* (click or drag: a column on or off at this step), *Pick cells* (click or drag over cells: just those cells), *Hold* (click or drag: a column on at every step, shown with a double border and an H).
- **Show the step before:** columns and cells active at the previous step are shown faintly.
- **Beside the pad:** the step number and how many columns are active (held ones counted).
- **Timeline:** previous, play/pause (space), next (arrow keys), speed; add a step, copy this step after it, delete, clear this step, clear all. Each step has a thumbnail; click one to go there.
- **JSON:** the design as JSON, to copy, or paste one and Load.
- Columns carry `data-ref="col-A1"` and tags `row:A n:1`, announce when pointed at, and light when their ref is announced.
