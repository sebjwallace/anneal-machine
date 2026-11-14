// C78 · Decomposition by the cut. Cells, columns and segments only.
// A family: a house (wall X + roof R1) and a shed (the same wall X + roof R2); X, R1, R2 are sets of S random columns.
// 1. The house is stored whole on fresh cells (one random cell per column), each cell with one segment over the others.
// 2. The shed arrives: its columns light ALL their cells (nothing yet predicts which). Each segment counts its active
//    links; a cell's support = the most of one memory's cells active (active links + itself if active). The cells at the
//    top level of support are the memory that fits best (C74's shared level of inhibition; 'cut=all' takes every cell
//    with support >= 2 instead). The cut, read from the cells' states: F = lit and predicted (fits), P = predicted, not
//    lit, U = lit columns with no predicted cell (unexplained).
// 3. Decompose along the cut: F becomes its own assembly (same cells); P becomes its own assembly (same cells); the old
//    whole-house segments are removed; U gets fresh cells as an assembly; each whole is rebound by two sampled cells per
//    part (C76): house = F + P, shed = F + U.
// Recall afterwards, from one part (up to 20 rounds; a segment fires at 2 active links). read=plain, or read=whole:
// binding segments (grown to bind parts) may fire only at the top active share among binding segments firing in that
// round, so the composition with more of its binding active wins (competition between whole memories).
// Run: node run.js     (SEEDS=101,...,105 by default; SEEDS=1 is the development seed)
'use strict';
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const N = 100, S = 6, MS = (process.env.MS || '10,50,200').split(',').map(Number), CS = (process.env.CS || '16,64').split(',').map(Number);
const CUTS = (process.env.CUTS || 'top,all').split(','), READS = ['plain', 'whole'];
function net(C) { return { C, segs: [], idx: new Map(), dead: new Set() }; }
function addSeg(n, cell, syn, kind) { const id = n.segs.length; n.segs.push({ cell, syn, kind }); for (const u of syn) { if (!n.idx.has(u)) n.idx.set(u, []); n.idx.get(u).push(id); } return id; }
function assembly(n, cells, kind) { const ids = []; for (const c of cells) ids.push(addSeg(n, c, cells.filter((x) => x !== c), kind)); return ids; }
function counts(n, act) { const cnt = new Map(); for (const u of act) { const L = n.idx.get(u); if (!L) continue; for (const id of L) { if (n.dead.has(id)) continue; cnt.set(id, (cnt.get(id) || 0) + 1); } } return cnt; }
function family(r, C) { const cols = new Set(); while (cols.size < 3 * S) cols.add(Math.floor(r() * N)); const a = [...cols]; return { X: a.slice(0, S), R1: a.slice(S, 2 * S), R2: a.slice(2 * S) }; }
const cellIn = (C, col, r) => col * C + Math.floor(r() * C);
function cut(n, litCols, mode) { const C = n.C, act = new Set(); for (const col of litCols) for (let c = 0; c < C; c++) act.add(col * C + c);
  const cnt = counts(n, act), sup = new Map();
  for (const [id, k] of cnt) { const s = n.segs[id], v = k + (act.has(s.cell) ? 1 : 0); if (k >= 2 && !(sup.get(s.cell) >= v)) sup.set(s.cell, v); }
  let pred = [...sup.keys()]; if (mode === 'top' && pred.length) { const T = Math.max(...pred.map((c) => sup.get(c))); pred = pred.filter((c) => sup.get(c) === T); }
  const F = pred.filter((c) => act.has(c)), P = pred.filter((c) => !act.has(c)), fc = new Set(F.map((c) => Math.floor(c / C)));
  return { F, P, U: litCols.filter((col) => !fc.has(col)) }; }
function recall(n, cue, read) { const act = new Set(cue);
  for (let r = 0; r < 20; r++) { const cnt = counts(n, act); let firing = [...cnt].filter(([id, k]) => k >= 2);
    if (read === 'whole') { const bind = firing.filter(([id]) => n.segs[id].kind === 'bind'); if (bind.length) { const share = ([id, k]) => k / n.segs[id].syn.length, T = Math.max(...bind.map(share)); firing = firing.filter((e) => n.segs[e[0]].kind !== 'bind' || share(e) >= T - 1e-9); } }
    const add = [...new Set(firing.map(([id]) => n.segs[id].cell))].filter((c) => !act.has(c)); if (!add.length) break; add.forEach((c) => act.add(c)); }
  return act; }
const out = {};
for (const cmode of CUTS) for (const C of CS) for (const M of MS) for (const seed of SEEDS) {
  const r = rng(seed * 7919 + M * 13 + C), n = net(C), fams = [];
  for (let f = 0; f < M; f++) { const fam = family(r, C), cells = {}; for (const col of [...fam.X, ...fam.R1]) cells[col] = cellIn(C, col, r);
    const houseCells = [...fam.X, ...fam.R1].map((c) => cells[c]); const ids = assembly(n, houseCells, 'part');
    const k = cut(n, [...fam.X, ...fam.R2], cmode), colOf = (c) => Math.floor(c / C);
    const Fc = new Set(k.F.map(colOf)), Pc = new Set(k.P.map(colOf)), same = (A, B) => A.size === B.length && B.every((x) => A.has(x));
    const ok = { F: same(Fc, fam.X), P: same(Pc, fam.R1), U: same(new Set(k.U), fam.R2) };
    const rec = { fam, ok, F: k.F, P: k.P }; fams.push(rec);
    if (k.F.length >= 2 && k.P.length >= 2) {   // the cut is made only if both sides can hold an assembly
      ids.forEach((id) => n.dead.add(id)); assembly(n, k.F, 'part'); assembly(n, k.P, 'part');
      const U = k.U.map((col) => cellIn(C, col, r)); if (U.length >= 2) assembly(n, U, 'part');
      assembly(n, [k.F[0], k.F[1], k.P[0], k.P[1]], 'bind'); if (U.length >= 2 && k.F.length >= 4) assembly(n, [k.F[k.F.length - 2], k.F[k.F.length - 1], U[0], U[1]], 'bind');
      rec.U = U; rec.cutMade = true;
      rec.links = k.F.length * (k.F.length - 1) + k.P.length * (k.P.length - 1) + U.length * (U.length - 1) + 24; }
    else { rec.cutMade = false; rec.links = 2 * (2 * S) * (2 * S - 1); } }
  for (const read of READS) { const key = `${cmode}|${C}|${M}|${read}`; const o = out[key] || (out[key] = { n: 0, cutF: 0, cutP: 0, cutU: 0, made: 0, links: 0, h: 0, hClean: 0, hSib: 0, s: 0, sClean: 0, sSib: 0, wBoth: 0, wOne: 0, wNone: 0 });
    for (const rec of fams) { o.n++; o.cutF += rec.ok.F; o.cutP += rec.ok.P; o.cutU += rec.ok.U; o.links += rec.links; if (!rec.cutMade) continue; o.made++;
      const house = new Set([...rec.F, ...rec.P]), shed = new Set([...rec.F, ...rec.U]);
      const A = recall(n, rec.P, read), hAll = [...house].every((c) => A.has(c)), hSib = rec.U.some((c) => A.has(c)), hOther = [...A].filter((c) => !house.has(c)).length;
      o.h += hAll; o.hSib += hSib; o.hClean += hAll && hOther === 0;
      const B = recall(n, rec.U, read), sAll = [...shed].every((c) => B.has(c)), sSib = rec.P.some((c) => B.has(c)), sOther = [...B].filter((c) => !shed.has(c)).length;
      o.s += sAll; o.sSib += sSib; o.sClean += sAll && sOther === 0;
      const W = recall(n, rec.F, read), wp = rec.P.every((c) => W.has(c)), wu = rec.U.every((c) => W.has(c)); if (wp && wu) o.wBoth++; else if (wp || wu) o.wOne++; else o.wNone++; } } }
const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
console.log(`C78 · decomposition by the cut   ${N} columns, parts of ${S} columns   seeds ${SEEDS.join(',')}\n`);
for (const cmode of CUTS) for (const C of CS) { console.log(`cut=${cmode}   ${C} cells per column`);
  for (const M of MS) { const o = out[`${cmode}|${C}|${M}|plain`], w = out[`${cmode}|${C}|${M}|whole`];
    console.log(`  M=${String(M).padEnd(4)} cut right: wall ${pc(o.cutF, o.n)} roof ${pc(o.cutP, o.n)} new roof ${pc(o.cutU, o.n)}  made ${pc(o.made, o.n)}  links ${Math.round(o.links / o.n)} (whole: ${2 * 2 * S * (2 * S - 1)})`);
    for (const [nm, x] of [['plain', o], ['whole', w]]) console.log(`      read=${nm.padEnd(6)} from house roof: house ${pc(x.h, x.made)} clean ${pc(x.hClean, x.made)} shed roof too ${pc(x.hSib, x.made)}   from shed roof: shed ${pc(x.s, x.made)} clean ${pc(x.sClean, x.made)} house roof too ${pc(x.sSib, x.made)}   from wall: both ${pc(x.wBoth, x.made)} one ${pc(x.wOne, x.made)} none ${pc(x.wNone, x.made)}`); }
  console.log(''); }
