# an-assembly

One **thing** the engine knows, shown two ways at once: its cells in its pieces' columns (an `<an-columns>` inside) and the picture it stands for. Pointing at a part in either lights it in both.

A domain component of the Anneal sandbox; needs `components/an-columns/an-columns.js`.

## Usage

```html
<script src="components/an-columns/an-columns.js"></script>
<script src="components/an-assembly/an-assembly.js"></script>
<script src="data/assemblies.js"></script>
<an-assembly id="asm"></an-assembly>
<script>document.querySelector('#asm').data = window.ANNEAL_ASSEMBLIES;</script>
```

## Properties

| | Meaning |
|---|---|
| `data` | `{ prims: [{ id, name, pts }], things: { name: { id, name, layer, centre, size, subs: [{ id, name, layer, parent }], inst: [{ i, prim, pix, path, cells: [{ f, thing, x, y, kept }] }] } }, usedBy: { primId: [names] } }`: each piece instance, its pixels in the thing, the things it's inside (`path`), and its cells on every floor (`kept: false` = filled in by completion). |
| `thing` | The thing shown (a key of `data.things`). Defaults to the first. |

## Behaviour

- Pick a thing; **Focus** on a thing inside it (breadcrumbs): parts outside it fade, and offsets are measured from its centre.
- **Offsets**: a line from the focused thing's centre to each piece's centre, labelled with the piece's cell. **Kept or filled in**: dashed parts are the ones completion fills in. **Pull apart**: spreads the parts. **Play completion**: hides the filled-in parts, then brings them back.
- Under the columns, each piece and which other things use it.
- Parts announce `asm:<thing>#<i>` as their ref; the columns' cubes carry the same refs, so the two views light each other.
- `data/assemblies.js` is a snapshot of the engine's own output, not live yet.
