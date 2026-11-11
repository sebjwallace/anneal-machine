// THE SCENE WORLD (a world to learn from, not part of the engine): shapes cut from the pattern catalogue, objects made of
// shapes in fixed arrangements, and scenes of 1-3 things (half of them copies of one thing), at random places.
'use strict';
const SW = (typeof globalThis !== 'undefined' && globalThis.WORLD_SIZE) || 12, SH = SW, SPX = SW * SH;
const P2 = (x, y) => x * 1000 + y;
function norm(pts) { if (!pts.length) return { pts: [], ox: 0, oy: 0, key: '' }; let mx = Infinity, my = Infinity; for (const [x, y] of pts) { if (x < mx) mx = x; if (y < my) my = y; }
  const q = pts.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); return { pts: q, ox: mx, oy: my, key: q.map(([x, y]) => x + ',' + y).join(';') }; }
class SceneWorld {
  constructor(cat) {
    const crop = (name) => norm(ptsOf25(cat.patterns.find((p) => p.name === name).bits)).pts;
    function ptsOf25(b) { const o = []; for (let i = 0; i < 25; i++) if (b[i]) o.push([i % 5, Math.floor(i / 5)]); return o; }
    this.shapes = { block: crop('block 0,0'), plus: crop('small plus 1,1'), corner: crop('corner tl'), box: crop('small box 0,0'), chevron: crop('chevron up'), bar: crop('row 0 left'), stick: crop('col 0 top'), diag: crop('short \\ upper') };
    const S = this.shapes, put = (list) => { const s = new Map(); for (const [nm, dx, dy] of list) for (const [x, y] of S[nm]) s.set(P2(x + dx, y + dy), [x + dx, y + dy]); return norm([...s.values()]).pts; };
    this.objects = { house: put([['chevron', 0, 0], ['box', 1, 2]]), flag: put([['stick', 0, 0], ['block', 1, 0]]), twins: put([['block', 0, 0], ['block', 3, 0]]) };
    this.heldObjects = { tower: put([['box', 0, 0], ['box', 0, 3]]), arrow: put([['chevron', 0, 0], ['stick', 2, 2]]) };
    this.things = [...Object.entries(this.shapes), ...Object.entries(this.objects)];
  }
  // place a list of things ([name, points]) at random free positions (a 1-pixel gap around each); things that don't fit are skipped
  place(r, list) {
    const x = new Uint8Array(SPX), taken = new Set(), names = [];
    for (const [nm, pts] of list) { let w = 0, h = 0; for (const [a, b] of pts) { w = Math.max(w, a + 1); h = Math.max(h, b + 1); }
      for (let tries = 0; tries < 60; tries++) { const ox = Math.floor(r() * (SW - w + 1)), oy = Math.floor(r() * (SH - h + 1)); let ok = true;
        for (let yy = oy - 1; yy <= oy + h && ok; yy++) for (let xx = ox - 1; xx <= ox + w; xx++) if (taken.has(P2(xx, yy))) { ok = false; break; }
        if (!ok) continue; for (let yy = oy; yy < oy + h; yy++) for (let xx = ox; xx < ox + w; xx++) taken.add(P2(xx, yy)); for (const [a, b] of pts) x[(oy + b) * SW + ox + a] = 1; names.push(nm); break; } }
    return { x, name: names.join(' + ') };
  }
  // half the scenes: 1-3 different things; the other half: 2-3 copies of one thing, sometimes with one more thing
  next(r, noise) { const pick = () => this.things[Math.floor(r() * this.things.length)], list = [];
    if (r() < 0.5) { for (let k = 1 + Math.floor(r() * 3); k > 0; k--) list.push(pick()); }
    else { const t = pick(); for (let k = 2 + Math.floor(r() * 2); k > 0; k--) list.push(t); if (r() < 0.5) list.push(pick()); }
    const s = this.place(r, list); if (noise) for (let i = 0; i < SPX; i++) if (r() < noise) s.x[i] ^= 1; return s; }
  // a scene with two copies of an object never seen in training (made of known shapes in a new arrangement)
  held(r) { const h = Object.entries(this.heldObjects), t = h[Math.floor(r() * h.length)]; return this.place(r, [t, t]); }
}
if (typeof module !== 'undefined') module.exports = { SceneWorld };
