// C64 · PERSISTENT ASSEMBLIES WHILE READING (theory: docs/theories/persistent-assemblies.md). Same world, engine and
// learning as C62 (400 random looks, rest every 50; G1-G4 there). Then it reads new text in order, the eye stepping on
// a few letters at a time, two ways:
//   FRESH: every window explained from scratch (today's engine).
//   PERSIST: what it settled into stays. Each placement from the last window is carried forward (shifted by the step).
//     It stays while every letter of it that is still in view matches what is seen (letters that slid out of view are
//     out of view, not wrong). If any letter doesn't match, it is a misfit and is dropped, and that part of the window
//     is settled afresh. Only the letters nothing persisting explains are explained anew.
// GIVEN BY HAND (in addition to C62's G1-G4): G5 the eye steps on in order by a fixed step (2 or 4 letters).
// The persistence rule is the mechanism under test (M), written here, not in the engine.
// CONTROL: SPLIT reads the old letters and the new letters of each window separately, from scratch, so it has the
// same seam as PERSIST without carrying anything over: if cuts improve only because of the seam, SPLIT shows it.
// Measured: letters explained afresh per look (work), time, letters left unexplained (heat), and how its cuts fall
// against the true word boundaries.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const DET = ['the', 'a'], N = ['cat', 'dog', 'fox', 'hen'], V = ['sat', 'ran', 'hid'], P = ['on', 'by'];
const WORDS = [...DET, ...N, ...V, ...P], LETTERS = [...new Set(WORDS.join(''))].sort().concat([' ']);
globalThis.WORLD_VALUES = LETTERS.length + 2;
const E = require('../C56-integrated/engine/see.js');
const val = (ch) => LETTERS.indexOf(ch) + 2, pick = (r, a) => a[Math.floor(r() * a.length)];
const text = (r, n, spaces) => { const ws = []; for (let i = 0; i < n; i++) ws.push(pick(r, DET), pick(r, N), pick(r, V), pick(r, P), pick(r, DET), pick(r, N));
  let s = '', starts = new Set([0]); for (const w of ws) { if (s.length) { if (spaces) s += ' '; starts.add(s.length); } s += w; } return { s, starts }; };
const win = (s, at) => { const x = new Uint8Array(64); for (let i = 0; i < 8; i++) x[i] = val(s[at + i]); return x; };
function learn(spaces) { const r = rng(62), T = text(r, 400, spaces), m = new E.Model('FL', { atoms: true });
  for (let t = 1; t <= 400; t++) { m.step(win(T.s, Math.floor(r() * (T.s.length - 8)))); if (t % 50 === 0) m.rest(); } m.rest(); return m; }
function read(m, spaces, mode, step) {
  const T = text(rng(64), 200, spaces), truthAt = (at, i) => (spaces ? T.s[at + i] === ' ' || T.s[at + i - 1] === ' ' : T.starts.has(at + i));
  let fresh = 0, left = 0, tp = 0, fp = 0, fn = 0, dropped = 0, kept = 0, looks = 0, prev = []; const t0 = process.hrtime.bigint();
  for (let at = 0; at + 8 <= Math.min(T.s.length, 8 + step * 300); at += step) {
    const x = win(T.s, at), owner = new Array(8).fill(-1); let claims = [];
    if (mode === 'persist') {
      for (const c of prev) { const dx = c.dx - step, cells = m.exp(c.c).map(([ux, uy, uv]) => [ux + dx, uy + c.dy, uv]).filter(([px, py]) => py === 0 && px >= 0 && px < 8);
        if (!cells.length) continue;   // slid out of view
        if (cells.every(([px, , pv]) => x[px] === (pv || 1)) && cells.every(([px]) => owner[px] === -1)) { const id = claims.length; claims.push({ ...c, dx }); for (const [px] of cells) owner[px] = id; kept++; }
        else dropped++; }   // a misfit: let go, and settle that part afresh
      const x2 = x.slice(); for (let i = 0; i < 8; i++) if (owner[i] !== -1) x2[i] = 0;
      fresh += x2.filter((v, i) => i < 8 && v).length;
      const q = m.read(x2); left += q.left.length;
      for (const c of q.claims) { const id = claims.length; claims.push(c); for (const [ux, uy] of m.exp(c.c)) { const px = ux + c.dx; if (uy + c.dy === 0 && px >= 0 && px < 8 && owner[px] === -1) owner[px] = id; } }
    } else if (mode === 'split') {   // CONTROL: the same seam as PERSIST (old letters | new letters), nothing carried over
      fresh += 8; let id0 = 0;
      for (const part of [[0, 8 - step], [8 - step, 8]]) { const xp = x.slice(); for (let i = 0; i < 8; i++) if (i < part[0] || i >= part[1]) xp[i] = 0;
        const q = m.read(xp); left += q.left.length;
        for (const c of q.claims) { const id = id0++; claims.push(c); for (const [ux, uy] of m.exp(c.c)) { const px = ux + c.dx; if (uy + c.dy === 0 && px >= part[0] && px < part[1]) owner[px] = id; } } }
    } else {
      fresh += 8; const q = m.read(x); left += q.left.length; claims = q.claims;
      claims.forEach((c, id) => { for (const [ux, uy] of m.exp(c.c)) { const px = ux + c.dx; if (uy + c.dy === 0 && px >= 0 && px < 8) owner[px] = id; } });
    }
    for (let i = 1; i < 8; i++) { const cut = owner[i] !== owner[i - 1] || owner[i] === -1, truth = truthAt(at, i); if (cut && truth) tp++; else if (cut) fp++; else if (truth) fn++; }
    prev = claims; looks++;
  }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6, p = tp / (tp + fp || 1), rc = tp / (tp + fn || 1);
  return { looks, freshPer: fresh / looks, msPer: ms / looks, leftPer: left / looks, f1: 2 * p * rc / (p + rc || 1), p, rc, kept, dropped };
}
for (const spaces of [true, false]) { const m = learn(spaces);
  console.log(`\n${spaces ? 'WITH SPACES' : 'NO SPACES'}`);
  for (const step of [2, 4]) for (const mode of ['fresh', 'split', 'persist']) { const R = read(m, spaces, mode, step);
    console.log(`  step ${step} · ${mode.padEnd(7)} · letters explained afresh per look ${R.freshPer.toFixed(1)}/8 · ${R.msPer.toFixed(1)} ms per look · left unexplained ${R.leftPer.toFixed(2)} · cuts F1 ${(R.f1 * 100).toFixed(0)}% (precision ${(R.p * 100).toFixed(0)}%, recall ${(R.rc * 100).toFixed(0)}%)${mode === 'persist' ? ` · placements kept ${R.kept}, let go on a misfit ${R.dropped}` : ''}`); } }
