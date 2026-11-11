// C02 runner: every experiment side by side, 5 seeds each. Prints a table and writes results.json and gallery.txt.
'use strict';
const fs = require('fs'), path = require('path');
const { CATALOGUE, noisy, rng } = require(path.join(__dirname, '../../world/catalogue.js'));
const { Model, K } = require(path.join(__dirname, '../../models/explain.js'));
const P = CATALOGUE.patterns, PX = 25;
const held = P.filter((p) => p.family === 'bar triples').map((p) => p.id);
const trainIds = P.filter((p) => p.family !== 'bar triples').map((p) => p.id);
const PARTS = new Set(['bars', 'half bars', 'blocks', 'corners', 'diagonals']);
const partIds = trainIds.filter((i) => PARTS.has(P[i].family)), wholeIds = trainIds.filter((i) => !PARTS.has(P[i].family));
const PASSES = 20, SEEDS = [1, 2, 3, 4, 5], EVAL_NOISE = 0.05;

const EXPS = [
  { group: 'mechanism', name: 'A grow only', arm: 'A', noise: 0.05 },
  { group: 'mechanism', name: 'B grow + split', arm: 'B', noise: 0.05 },
  { group: 'mechanism', name: 'C grow + split + confirm', arm: 'C', noise: 0.05 },
  { group: 'mechanism', name: 'D grow+split+confirm+join', arm: 'D', noise: 0.05 },
  { group: 'noise', name: 'B noise 0%', arm: 'B', noise: 0 },
  { group: 'noise', name: 'B noise 15%', arm: 'B', noise: 0.15 },
  { group: 'noise', name: 'D noise 0%', arm: 'D', noise: 0 },
  { group: 'noise', name: 'D noise 15%', arm: 'D', noise: 0.15 },
  { group: 'order', name: 'B parts first', arm: 'B', noise: 0.05, first: partIds },
  { group: 'order', name: 'B wholes first', arm: 'B', noise: 0.05, first: wholeIds },
];

function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function train(m, ids, passes, noise, r) { for (let p = 0; p < passes; p++) for (const id of shuffle(ids.slice(), r)) m.step(noisy(P[id].bits, noise, r)); }
const ink = (b) => b.reduce((a, x) => a + x, 0);
const ham = (a, b) => { let d = 0; for (let i = 0; i < PX; i++) d += a[i] !== b[i]; return d; };
const jac = (A, B) => { if (!A.size && !B.size) return 1; let n = 0; for (const x of A) if (B.has(x)) n++; return n / (A.size + B.size - n); };
const pix = (b) => new Set([...b].map((v, i) => (v ? i : -1)).filter((i) => i >= 0));
function pearson(xs, ys) { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sx += (xs[i] - mx) ** 2; sy += (ys[i] - my) ** 2; } return sxy / Math.sqrt(sx * sy); }

function evaluate(m, r) {
  const clean = new Map(); for (const id of [...trainIds, ...held]) clean.set(id, m.read(P[id].bits));
  const codeOf = (q) => new Set(q.claims.map((c) => c.c.id)), cellsOf = (q) => q.cells.map((c) => c.cell.id).sort((a, b) => a - b).join();
  const E = {}; const tr = trainIds.map((id) => clean.get(id));
  E.cols = m.cols.length; E.size = m.cols.reduce((a, c) => a + [...c.m].filter((v) => v >= K.CUT).length, 0) / Math.max(1, m.cols.length);
  E.cells = m.cellCount();
  E.leftover = tr.reduce((a, q, k) => a + q.left.length / ink(P[trainIds[k]].bits), 0) / tr.length;
  E.err = tr.reduce((a, q, k) => a + ham(q.recon, P[trainIds[k]].bits), 0) / tr.length;
  E.distinct = new Set(tr.map((q) => [...codeOf(q)].sort((a, b) => a - b).join())).size;
  E.parts = tr.reduce((a, q) => a + q.claims.length, 0) / tr.length;
  const usedBy = new Map(); for (const q of tr) for (const c of q.claims) usedBy.set(c.c.id, (usedBy.get(c.c.id) || 0) + 1);
  E.reuse = usedBy.size ? [...usedBy.values()].reduce((a, b) => a + b, 0) / usedBy.size : 0; E.unused = m.cols.length - usedBy.size;
  let st = 0, nerr = 0, cst = 0, n = 0;
  for (const id of trainIds) { const q0 = clean.get(id), c0 = codeOf(q0), k0 = cellsOf(q0);
    for (let v = 0; v < 10; v++) { const q = m.read(noisy(P[id].bits, EVAL_NOISE, r)); st += jac(codeOf(q), c0); nerr += ham(q.recon, P[id].bits); cst += cellsOf(q) === k0 && k0 !== '' ? 1 : 0; n++; } }
  E.stable = st / n; E.noisyErr = nerr / n; E.cellStable = cst / n;
  E.cellDistinct = new Set(tr.map((q) => cellsOf(q))).size;
  const xs = [], ys = []; for (let a = 0; a < trainIds.length; a++) for (let b = a + 1; b < trainIds.length; b++) {
    xs.push(jac(pix(P[trainIds[a]].bits), pix(P[trainIds[b]].bits))); ys.push(jac(codeOf(tr[a]), codeOf(tr[b]))); }
  E.similar = pearson(xs, ys);
  const h = held.map((id) => clean.get(id));
  E.heldLeft = h.reduce((a, q, k) => a + q.left.length / ink(P[held[k]].bits), 0) / h.length;
  E.heldErr = h.reduce((a, q, k) => a + ham(q.recon, P[held[k]].bits), 0) / h.length;
  E.heldParts = h.reduce((a, q) => a + q.claims.length, 0) / h.length;
  return E;
}

function art(c) { const rows = []; for (let r = 0; r < 5; r++) { let s = ''; for (let k = 0; k < 5; k++) s += c.m[r * 5 + k] >= K.CUT ? '#' : '.'; rows.push(s); } return rows; }
function gallery(m, title) { const cs = [...m.cols].sort((a, b) => b.uses - a.uses); let out = `\n== ${title}: ${cs.length} columns (most used first; under each: cells)\n`;
  for (let i = 0; i < cs.length; i += 14) { const g = cs.slice(i, i + 14), A = g.map(art);
    for (let r = 0; r < 5; r++) out += A.map((a) => a[r]).join('  ') + '\n'; out += g.map((c) => String(c.cells.length).padEnd(5)).join('  ') + '\n\n'; }
  return out; }

const results = [], keys = ['cols', 'size', 'cells', 'leftover', 'err', 'distinct', 'parts', 'reuse', 'unused', 'stable', 'noisyErr', 'cellStable', 'cellDistinct', 'similar', 'heldLeft', 'heldErr', 'heldParts', 'ms'];
let gal = '';
for (const X of EXPS) { const runs = [];
  for (const seed of SEEDS) { const r = rng(seed * 7919 + 13), m = new Model(X.arm), t0 = Date.now();
    if (X.first) train(m, X.first, 5, X.noise, r); train(m, trainIds, X.first ? PASSES - 5 : PASSES, X.noise, r);
    const ms = Date.now() - t0, E = evaluate(m, rng(seed + 999)); E.ms = ms; E.st = m.st; runs.push(E);
    if (seed === 1) gal += gallery(m, X.name); }
  const mean = {}; for (const k of keys) mean[k] = runs.reduce((a, E) => a + E[k], 0) / runs.length;
  const rg = {}; for (const k of keys) rg[k] = [Math.min(...runs.map((E) => E[k])), Math.max(...runs.map((E) => E[k]))];
  results.push({ ...X, first: X.first ? X.first.length : 0, mean, range: rg, st: runs.map((E) => E.st) });
}
const f = (v, d = 2) => (typeof v === 'number' ? v.toFixed(d) : v);
console.log(`trained on ${trainIds.length} patterns x ${PASSES} passes (${trainIds.length * PASSES} flashes); held out ${held.length} bar triples; seeds ${SEEDS.join(',')}; means`);
console.log(['experiment'.padEnd(26), 'cols', 'size', 'cells', 'left', 'err', 'dist', 'parts', 'reuse', 'stab', 'nErr', 'cStab', 'cDist', 'simil', 'hLeft', 'hErr', 'hPrt', 'ms'].join(' '));
for (const R of results) { const M = R.mean; console.log([R.name.padEnd(26), f(M.cols, 0).padStart(4), f(M.size, 1).padStart(4), f(M.cells, 0).padStart(5), f(M.leftover).padStart(4), f(M.err).padStart(4),
  f(M.distinct, 0).padStart(4), f(M.parts, 1).padStart(5), f(M.reuse, 1).padStart(5), f(M.stable).padStart(4), f(M.noisyErr).padStart(4), f(M.cellStable).padStart(5), f(M.cellDistinct, 0).padStart(5),
  f(M.similar).padStart(5), f(M.heldLeft).padStart(5), f(M.heldErr).padStart(4), f(M.heldParts, 1).padStart(4), f(M.ms, 0).padStart(5)].join(' ')); }
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 1));
fs.writeFileSync(path.join(__dirname, 'gallery.txt'), gal);
console.log('wrote results.json and gallery.txt');
