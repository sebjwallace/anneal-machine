// C22: completion. Learns with C20 (as C20's run), cells as C21, then: 1) damaged pictures, 2) recall from a few cells.
'use strict';
const path = require('path');
const { CATALOGUE, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, SceneWorld, SW, SH } = require(path.join(__dirname, '../../models/flow.js'));
const { Codes } = require(path.join(__dirname, '../../models/codes.js'));
const { Completer } = require(path.join(__dirname, '../../models/complete.js'));
const W = new SceneWorld(CATALOGUE), SEED = +(process.env.SEED || 4242), r = rng(SEED), m = new Model('FL', {});
for (let t = 1; t <= 600; t++) { m.step(W.next(r, 0).x); if (t % 98 === 0) m.rest(); } m.rest();
const C = new Codes(m, {}), K = new Completer(m, C), N = +(process.env.N || 300), PX = SW * SH, AX = Math.floor((SW - 1) / 2), AY = Math.floor((SH - 1) / 2);
const pct = (a, b) => (b ? (100 * a / b).toFixed(0) + '%' : '-');
console.log(`C22 · learnt with C20 (seed ${SEED}): ${m.parts.length} primitive columns, ${m.units.length - m.parts.length} assemblies. ${N} scenes per test.\n`);

// ---- 1a. one known thing at a time, with a random rectangle hidden over part of it; told where, or not told (empty)
{ const e = rng(11), bins = [[0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1.01]], R = { told: bins.map(() => [0, 0, 0]), not: bins.map(() => [0, 0, 0]) };
  for (let k = 0; k < 4 * N; k++) { const [nm, pts] = W.things[Math.floor(e() * W.things.length)], s = W.place(e, [[nm, pts]]).x, on = []; for (let i = 0; i < PX; i++) if (s[i]) on.push(i);
    const c = on[Math.floor(e() * on.length)], w = 2 + Math.floor(e() * 3), h = 2 + Math.floor(e() * 3), x0 = Math.max(0, (c % SW) - Math.floor(e() * w)), y0 = Math.max(0, Math.floor(c / SW) - Math.floor(e() * h));
    const hid = new Uint8Array(PX), x = s.slice(); let gone = 0; for (let y = y0; y < Math.min(SH, y0 + h); y++) for (let xx = x0; xx < Math.min(SW, x0 + w); xx++) { hid[y * SW + xx] = 1; if (x[y * SW + xx]) gone++; x[y * SW + xx] = 0; }
    const bi = bins.findIndex(([lo, hi]) => gone / on.length >= lo && gone / on.length < hi);
    for (const [mode, hh] of [['told', hid], ['not', new Uint8Array(PX)]]) { const q = K.best(x, hh); let exact = true, back = 0; for (let i = 0; i < PX; i++) { if (q.recon[i] !== s[i]) exact = false; if (s[i] && !x[i] && q.recon[i]) back++; }
      const A = R[mode][bi]; A[0]++; if (exact) A[1]++; A[2] += gone ? back / gone : 1; } }
  console.log('1a. one known thing, a rectangle hidden over part of it. Share of the thing hidden → picture restored exactly (and hidden pixels filled back):');
  for (const [mode, A] of Object.entries(R)) console.log('    ' + (mode === 'told' ? 'told where   ' : 'not told     ') + bins.map(([lo, hi], i) => `${Math.round(lo * 100)}-${Math.min(100, Math.round(hi * 100))}%: ${pct(A[i][1], A[i][0])} (${pct(A[i][2], A[i][0])})`).join('   ')); }

// ---- 1b. pixels removed at random (not told)
for (const drop of [0.2, 0.4]) { const e = rng(12); let rem = 0, back = 0, extra = 0, off = 0, heat = 0;
  for (let k = 0; k < N; k++) { const s = W.next(e, 0).x, x = s.slice(); for (let i = 0; i < PX; i++) if (s[i] && e() < drop) x[i] = 0;
    const q = K.best(x, new Uint8Array(PX)); for (let i = 0; i < PX; i++) { if (s[i] && !x[i]) { rem++; if (q.recon[i]) back++; } if (!s[i]) { off++; if (q.recon[i]) extra++; } } heat += q.on ? (q.left + q.wrong) / q.on : 0; }
  console.log(`1b. ${drop * 100}% of the pixels removed (not told): removed pixels filled back ${pct(back, rem)}; pixels drawn that were never there: ${extra} (${(100 * extra / off).toFixed(2)}% of empty pixels); heat (prediction against what is seen) ${(heat / N).toFixed(2)}`); }
console.log('');

// ---- 2. recall from some of a scene's floor-0 cells
const pix = (cells) => { const out = new Uint8Array(PX); for (const [x, y] of C.draw(cells)) { const a = x + AX, b = y + AY; if (a >= 0 && b >= 0 && a < SW && b < SH) out[b * SW + a] = 1; } return out; };
for (const keep of [0.25, 0.5, 0.75]) { const e = rng(13); let tot = 0, cueGot = 0, setGot = 0, extra = 0, cells = 0, cueN = 0, whole = 0, thingsN = 0, rounds = 0, multi = 0;
  for (let k = 0; k < N; k++) { const s = W.next(e, 0).x, enc = C.encode(s); if (!enc.where.length) continue; let cue = enc.where.filter(() => e() < keep); if (!cue.length) cue = [enc.where[0]];
    const out = K.settle(cue), a = pix(cue), b = pix(out.cells); for (let i = 0; i < PX; i++) { if (s[i]) { tot++; if (a[i]) cueGot++; if (b[i]) setGot++; } else if (b[i]) extra++; }
    cells += enc.where.length; cueN += cue.length; rounds += out.rounds.length; if (out.rounds.length > 1) multi++;
    for (const t of enc.things) { thingsN++; const want = new Set(t.where.map((c) => c.col.id + '|' + c.x + ',' + c.y)), have = new Set(out.cells.map((c) => c.col.id + '|' + c.x + ',' + c.y)); if ([...want].every((z) => have.has(z))) whole++; } }
  console.log(`2. keeping ${keep * 100}% of the "where" cells (${(cueN / N).toFixed(1)} of ${(cells / N).toFixed(1)} per scene): pixels from the cue alone ${pct(cueGot, tot)} → after settling ${pct(setGot, tot)}; things wholly back ${pct(whole, thingsN)}; pixels drawn that weren't there ${extra}; rounds ${(rounds / N).toFixed(2)} on average (${multi} scenes needed more than one)`); }

// ---- examples: two houses, recalled from a few cells (one cell from the roof and one from the box, or two from the box only)
{ const x = new Uint8Array(PX); for (const [ox, oy] of [[1, 3], [7, 3]]) for (const [a, b] of W.objects.house) x[(oy + b) * SW + ox + a] = 1;
  const enc = C.encode(x), parts = (t) => { const kids = t.unit.place; const roof = kids.find((k) => C.prims(k.u).length === 1) || kids[0], box = kids.find((k) => k !== roof);
    const roofP = new Set(C.prims(roof.u, roof.dx + t.dx, roof.dy + t.dy).map(([p, a, b]) => p.id + '@' + a + ',' + b)); return { roof: t.where.filter((c, i) => roofP.has(C.prims(t.unit, t.dx, t.dy)[i][0].id + '@' + C.prims(t.unit, t.dx, t.dy)[i][1] + ',' + C.prims(t.unit, t.dx, t.dy)[i][2])), box: t.where.filter((c, i) => !roofP.has(C.prims(t.unit, t.dx, t.dy)[i][0].id + '@' + C.prims(t.unit, t.dx, t.dy)[i][1] + ',' + C.prims(t.unit, t.dx, t.dy)[i][2])) }; };
  const ps = enc.things.map(parts);
  for (const [label, cue] of [['one cell from each roof and one from each box', ps.flatMap((p) => [p.roof[0], p.box[0]])], ['two cells from each box only', ps.flatMap((p) => p.box.slice(0, 2))], ['one cell from each house', ps.flatMap((p) => [p.box[0]])]]) {
    const out = K.settle(cue.filter(Boolean)), p = pix(out.cells); let ok = 0, all = 0, ex = 0; for (let i = 0; i < PX; i++) { if (x[i]) { all++; if (p[i]) ok++; } else if (p[i]) ex++; }
    console.log(`\nexample, two houses, ${label} (${cue.length} cells): found ${out.found.map((f) => f.u.layer === Math.max(...m.units.map((z) => z.layer)) ? 'a house' : 'a ' + C.prims(f.u).length + '-part thing').join(', ') || 'nothing'} in ${out.rounds.length} round(s); picture back ${pct(ok, all)}, extra pixels ${ex}`); } }
