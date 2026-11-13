// C35 CAPACITY: store more and more random things over the same few columns, then recall each from part of it.
// Things: 4 pieces each, drawn from P primitives, at random places in a 5 x 5 frame (a world of plain symbols, run through the
// engine's own cells and completion code). Cue: 2 of a thing's cells (C = 3 with CUE=3). Count exact recalls, wrong recalls
// (cells that aren't the thing's) and nothing recalled, for pooled cells, segments, and segments with competition.
'use strict';
const path = require('path');
const { makeSymbolWorld } = require(path.join(__dirname, '../../../sandbox/symbols.js'));
const { Codes } = require(path.join(__dirname, '../../../src/engine/cells.js'));
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const { Segments } = require('./segments.js');
const P = +(process.env.P || 6), CUE = +(process.env.CUE || 2), key = (c) => c.col.id + '|' + c.x + ',' + c.y;
console.log(`${P} primitive columns, things of 4 pieces in a 5x5 frame, recalled from ${CUE} of their cells`);
for (const K of (process.env.KS || "5,20,50,100,200").split(",").map(Number)) {
  const r = rng(7 + K), w = makeSymbolWorld({ size: 15 }), names = [...Array(P).keys()].map((i) => 'p' + i); names.forEach((n) => w.prim(n));
  const keys = new Set();
  for (let k = 0; w.units.length < P + K && k < K * 50; k++) { const parts = [], used = new Set();
    while (parts.length < 4) { const x = Math.floor(r() * 5), y = Math.floor(r() * 5); if (used.has(x + ',' + y)) continue; used.add(x + ',' + y); parts.push([names[Math.floor(r() * P)], x, y]); }
    const mx = Math.min(...parts.map((p) => p[1])), my = Math.min(...parts.map((p) => p[2])), norm = parts.map(([n, x, y]) => [n, x - mx, y - my]), kk = norm.map((p) => p.join()).sort().join(';');
    if (keys.has(kk)) continue; keys.add(kk); w.thing('t' + k, norm); }
  const C = new Codes(w), things = w.units.filter((u) => u.layer > 1), modes = ['pooled', 'segments', 'compete'], R = Object.fromEntries(modes.map((m) => [m, [0, 0, 0]]));
  for (const t of things.slice(0, +(process.env.SAMPLE || 1e9))) { const whole = C.whole(t), pick = whole.slice().sort(() => r() - 0.5).slice(0, CUE), want = new Set(whole.map(key));
    for (const md of modes) { const out = new Segments(w, C, md).settle(pick), have = out.cells.map(key);
      const wrong = have.filter((k) => !want.has(k)).length, got = [...want].every((k) => have.includes(k));
      if (got && !wrong) R[md][0]++; else if (wrong) R[md][1]++; else R[md][2]++; } }
  const n = Math.min(things.length, +(process.env.SAMPLE || 1e9)), f = (a) => `${String(Math.round(100 * a[0] / n)).padStart(3)}% exact, ${String(Math.round(100 * a[1] / n)).padStart(3)}% wrong, ${String(Math.round(100 * a[2] / n)).padStart(3)}% nothing`;
  console.log(`  ${String(n).padStart(3)} things stored · pooled: ${f(R.pooled)} · segments: ${f(R.segments)} · with competition: ${f(R.compete)}`);
}
