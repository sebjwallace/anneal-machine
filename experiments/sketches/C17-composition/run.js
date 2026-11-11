// C17: decompose, then compose, at rest. Units per layer, energy, how many units a flash needs, which layers explain it.
'use strict';
const path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, popc, maskOf } = require(path.join(__dirname, '../../models/compose.js'));
const P = CATALOGUE.patterns, PX = 25, ids = P.filter((p) => p.family !== 'bar triples').map((p) => p.id), held = P.filter((p) => p.family === 'bar triples').map((p) => p.id);
const ink = (b) => b.reduce((a, x) => a + x, 0), ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
const art = (m) => { const r = []; for (let y = 0; y < 5; y++) { let s = ''; for (let x = 0; x < 5; x++) s += m & (1 << (y * 5 + x)) ? '#' : '.'; r.push(s); } return r; };
const known = new Set(P.map((p) => p.bits.join(''))), pairs = [];
{ const r = rng(77), small = ids.filter((i) => ink(P[i].bits) <= 6); let tries = 0;
  while (pairs.length < 24 && tries++ < 5000) { const a = small[Math.floor(r() * small.length)], b = small[Math.floor(r() * small.length)]; if (a === b) continue;
    const u = P[a].bits.map((v, i) => v | P[b].bits[i]); let ov = 0; for (let i = 0; i < PX; i++) ov += P[a].bits[i] & P[b].bits[i];
    const k = u.join(''); if (ov <= 1 && !known.has(k)) { known.add(k); pairs.push(Uint8Array.from(u)); } } }
function report(m, label) {
  const hs = (q, b) => (q.left.length + q.misses) / ink(b); let units = 0, heat = 0; const byLayer = {};
  for (const id of ids) { const q = m.read(P[id].bits); units += q.claims.length; heat += hs(q, P[id].bits); for (const { c } of q.claims) byLayer[c.layer] = (byLayer[c.layer] || 0) + 1; }
  const tot = Object.values(byLayer).reduce((a, b) => a + b, 0);
  const hh = held.reduce((a, id) => a + hs(m.read(P[id].bits), P[id].bits), 0) / held.length, np = pairs.reduce((a, b) => a + hs(m.read(b), b), 0) / pairs.length;
  const npu = pairs.reduce((a, b) => a + m.read(b).claims.length, 0) / pairs.length;
  console.log(`  ${label}: units per layer ${m.layers.map((L) => L.cols.length).join(' / ')} · energy ${m.energy()} (pixels ${m.parts.reduce((a, p) => a + popc(p.mask), 0)}, links ${m.links()})`);
  console.log(`     a training pattern needs ${(units / ids.length).toFixed(2)} units (by layer: ${Object.keys(byLayer).sort().map((k) => `L${k} ${Math.round(100 * byLayer[k] / tot)}%`).join(', ')}) · heat ${(heat / ids.length).toFixed(2)} · held-out ${hh.toFixed(2)} · new pairs ${np.toFixed(2)} using ${npu.toFixed(2)} units`);
}
for (const noise of [0, 0.05]) {
  console.log(`\n== pattern noise ${noise * 100}%`);
  const r = rng(7919 + 13), m = new Model('CO', {});
  for (let p = 0; p < (noise ? 2 : 1); p++) { const ord = ids.slice(); for (let i = ord.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; } for (const id of ord) m.step(noisy(P[id].bits, noise, r)); }
  report(m, 'awake only      ');
  let t0 = Date.now(), s1 = 0; while (m.phase === 'decompose' && m.restStep()) s1++; report(m, `decomposed (${s1} steps, ${Date.now() - t0} ms)`);
  t0 = Date.now(); const s2 = m.rest(); report(m, `composed (${s2} steps, ${Date.now() - t0} ms)`);
  if (!noise) { const comps = m.units.filter((u) => u.layer > 1).sort((a, b) => b.layer - a.layer || m.itemsUsing(b) - m.itemsUsing(a));
    console.log(`\n  composites (layer · used by · picture · made of):`);
    for (const c of comps.slice(0, 14)) console.log(`   L${c.layer} · ${m.itemsUsing(c)} · [${art(c.mask).join('/')}] = ${[...c.parts].map((k) => `L${k.layer}[${art(k.mask).join('/')}]`).join(' + ')}`);
    const name = (it) => (P.find((p) => maskOf(p.bits) === it.mask) || { name: '?' }).name;
    console.log('\n  some memories now:'); for (const nm of ['E', 'F', 'frame', 'small box 1,1', 'big L tl', 'T top', 'C', 'U']) { const it = m.items.find((q) => name(q) === nm); if (it) console.log(`   "${nm}" = ${[...it.parts].map((k) => `L${k.layer}[${art(k.mask).join('/')}]`).join(' + ')}`); } }
}
