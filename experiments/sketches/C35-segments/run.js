// C35 RUN: the four ways to settle, on the world the engine learnt (src/test/world.js), with the completion test's cues.
//  A. keep 25 / 50 / 75% of a scene's "where" cells (as the engine test, section 2), plus a check against today's completion.
//  B. the same with 50% kept, but some kept cells knocked one step out of place.
'use strict';
const path = require('path'), S = path.join(__dirname, '../../../src/');
const { rng } = require(S + 'worlds/catalogue.js'), { SW, SH } = require(S + 'engine/see.js');
const { Codes } = require(S + 'engine/cells.js'), { load, World } = require(S + 'test/world.js'), { Segments } = require('./segments.js');
const m = load(), C = new Codes(m), W = World(), N = +(process.env.N || 300), PX = SW * SH, AX = Math.floor((SW - 1) / 2), AY = Math.floor((SH - 1) / 2);
const MODES = ['pooled', 'segments', 'compete', 'tolerant'], seg = Object.fromEntries(MODES.map((k) => [k, new Segments(m, C, k)]));
const pix = (cells) => { const out = new Uint8Array(PX); for (const [x, y] of C.draw(cells)) { const a = x + AX, b = y + AY; if (a >= 0 && b >= 0 && a < SW && b < SH) out[b * SW + a] = 1; } return out; };
const key = (c) => c.col.id + '|' + c.x + ',' + c.y, pct = (a, b) => (b ? (100 * a / b).toFixed(0) + '%' : '-');
function test(keep, jitter, seed) {
  const e = rng(seed), R = Object.fromEntries([...MODES, 'engine'].map((k) => [k, { whole: 0, things: 0, extra: 0, ms: 0 }])); let same = 0, scenes = 0;
  for (let k = 0; k < N; k++) { const s = W.next(e, 0).x, enc = C.encode(s); if (!enc.where.length) continue; scenes++;
    let cue = enc.where.filter(() => e() < keep); if (!cue.length) cue = [enc.where[0]];
    if (jitter) cue = cue.map((c) => { if (e() >= jitter) return c; const d = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]][Math.floor(e() * 8)]; return { ...c, x: c.x + d[0], y: c.y + d[1] }; });
    const outs = {}; for (const md of MODES) { const t = Date.now(); outs[md] = seg[md].settle(cue); R[md].ms += Date.now() - t; }
    const t0 = Date.now(); outs.engine = C.K.settle(cue); R.engine.ms += Date.now() - t0;
    const ks = (o) => o.cells.map(key).sort().join(' '); if (ks(outs.compete) === ks(outs.engine)) same++;
    for (const [md, o] of Object.entries(outs)) { const have = new Set(o.cells.map(key)), p = pix(o.cells);
      for (const t of enc.things) { R[md].things++; if (t.where.every((c) => have.has(key(c)))) R[md].whole++; }
      for (let i = 0; i < PX; i++) if (!s[i] && p[i]) R[md].extra++; } }
  console.log(`\n${jitter ? `keep ${keep * 100}%, ${jitter * 100}% of kept cells one step out of place` : `keep ${keep * 100}% of the "where" cells`} (${scenes} scenes)` + (jitter ? '' : ` · segments-with-competition identical to today's completion in ${pct(same, scenes)} of scenes`));
  for (const md of ['engine', ...MODES]) { const r = R[md]; console.log(`  ${md.padEnd(9)} things wholly back ${pct(r.whole, r.things).padStart(4)} · pixels drawn that weren't there ${String(r.extra).padStart(5)} · ${(r.ms / scenes).toFixed(1)} ms/scene`); }
}
for (const keep of [0.25, 0.5, 0.75]) test(keep, 0, 13);
for (const j of [0.25, 0.5]) test(0.5, j, 14);
