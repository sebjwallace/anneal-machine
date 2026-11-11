// C16: snapshot while awake, factor at rest. Energy, parts and composition before and after rest; first-sight tests.
'use strict';
const path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, popc, maskOf } = require(path.join(__dirname, '../../models/factor.js'));
const P = CATALOGUE.patterns, PX = 25, ids = P.filter((p) => p.family !== 'bar triples').map((p) => p.id), held = P.filter((p) => p.family === 'bar triples').map((p) => p.id);
const ink = (b) => b.reduce((a, x) => a + x, 0), ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
const art = (m) => { const r = []; for (let y = 0; y < 5; y++) { let s = ''; for (let x = 0; x < 5; x++) s += m & (1 << (y * 5 + x)) ? '#' : '.'; r.push(s); } return r; };
const known = new Set(P.map((p) => p.bits.join(''))), pairs = [];
{ const r = rng(77), small = ids.filter((i) => ink(P[i].bits) <= 6); let tries = 0;
  while (pairs.length < 24 && tries++ < 5000) { const a = small[Math.floor(r() * small.length)], b = small[Math.floor(r() * small.length)]; if (a === b) continue;
    const u = P[a].bits.map((v, i) => v | P[b].bits[i]); let ov = 0; for (let i = 0; i < PX; i++) ov += P[a].bits[i] & P[b].bits[i];
    const k = u.join(''); if (ov <= 1 && !known.has(k)) { known.add(k); pairs.push(Uint8Array.from(u)); } } }
function drop(b, r) { const y = b.slice(); for (let i = 0; i < PX; i++) if (y[i] && r() < 0.3) y[i] = 0; return y; }
function tests(m, label) {
  const hs = (q, b) => (q.left.length + q.misses) / ink(b), e = rng(999);
  const tr = ids.reduce((a, id) => a + hs(m.read(P[id].bits), P[id].bits), 0) / ids.length;
  const hh = held.reduce((a, id) => a + hs(m.read(P[id].bits), P[id].bits), 0) / held.length;
  const np = pairs.reduce((a, b) => a + hs(m.read(b), b), 0) / pairs.length;
  let miss = 0, nz = 0, c = 0; for (const id of ids) for (let v = 0; v < 3; v++) { miss += ham(m.read(drop(P[id].bits, e)).recon, P[id].bits); nz += ham(m.read(noisy(P[id].bits, 0.15, e)).recon, P[id].bits); c++; }
  const ppi = m.items.reduce((a, it) => a + it.parts.size, 0) / Math.max(1, m.items.length);
  console.log(`  ${label}: ${m.parts.length} parts, ${m.parts.reduce((a, p) => a + popc(p.mask), 0)} pixels stored, ${m.links()} links, energy ${m.energy()} · parts per memory ${ppi.toFixed(1)}`);
  console.log(`     heat: training ${tr.toFixed(2)} · held-out triples ${hh.toFixed(2)} · new overlaid pairs ${np.toFixed(2)} · missing 30% error ${(miss / c).toFixed(2)} · 15% noise error ${(nz / c).toFixed(2)}`);
}
for (const noise of [0, 0.05]) {
  console.log(`\n== pattern noise ${noise * 100}% (awake: ${noise ? 2 : 1} pass${noise ? 'es' : ''} over the 98 patterns, threshold 90%)`);
  const r = rng(7919 + 13), m = new Model('FA', {});
  for (let p = 0; p < (noise ? 2 : 1); p++) { const ord = ids.slice(); for (let i = ord.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; } for (const id of ord) m.step(noisy(P[id].bits, noise, r)); }
  tests(m, 'before rest'); const t0 = Date.now(), steps = m.rest(); console.log(`  rest: ${steps} steps (${m.st.factored} factorings, ${m.st.collapsed} collapses) in ${Date.now() - t0} ms`);
  tests(m, 'after rest ');
  let again = 0; for (const id of ids) { const b = m.step(P[id].bits).born; if (b) again++; } console.log(`  awake again, one clean pass: ${again} new snapshots needed`);
  if (!noise) {
    const parts = [...m.parts].sort((a, b) => m.itemsUsing(b) - m.itemsUsing(a) || popc(b.mask) - popc(a.mask));
    console.log(`\n  parts, most used first (number under each = memories using it):`);
    for (let i = 0; i < parts.length; i += 16) { const g = parts.slice(i, i + 16), A = g.map((p) => art(p.mask)); for (let y = 0; y < 5; y++) console.log('  ' + A.map((a) => a[y]).join('  ')); console.log('  ' + g.map((p) => String(m.itemsUsing(p)).padEnd(5)).join('  ') + '\n'); }
    const name = (it) => P.find((p) => maskOf(p.bits) === it.mask).name;
    console.log('  some memories as compositions:');
    for (const nm of ['plus', 'T top', 'frame', 'E', 'H', 'U', 'small box 1,1', 'X', 'row 1 + col 3', 'big L tl', 'corner tl', 'row 0']) {
      const it = m.items.find((q) => name(q) === nm); if (!it) continue; console.log(`    "${nm}" = ${[...it.parts].map((p) => `[${art(p.mask).join('/')}]`).join(' + ')}`); }
  }
}
