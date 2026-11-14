// C76 · Composition by binding a sample. Cells only: no list of assemblies is consulted when recalling.
// World: N columns of C cells. A part is P cells, one in each of P random columns, on a random cell of that column. A
// composition is 3 parts. Each part's cells hold one segment each over the part's other cells (a part completes itself).
// A composition is bound by a sample: K active cells from each part grow one new segment each, over the other sampled
// cells (K = 'all': every cell of the composition, over all the others). A segment fires at 2 or more active links (the
// bar from the prices); a cell is active if any of its segments fires (an OR of ANDs). Recall: light one whole part,
// settle up to 6 rounds. Compete: 'none', or 'column' (where a column has several cells newly firing, the one with most
// support wins; a tie refuses the column).
// Run: node run.js     (SEEDS=101,102,103,104,105 by default; SEEDS=1 is the development seed)
'use strict';
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const N = +(process.env.N || 100), P = +(process.env.P || 4), MS = (process.env.MS || '10,50,200,500').split(',').map(Number);
const CS = (process.env.CS || '4,16').split(',').map(Number), KS = ['1', '2', '3', 'all'], COMPETE = (process.env.COMPETE || 'none,column').split(',');
function build(seed, M, C) { const r = rng(seed * 7919 + M * 31 + C);
  const parts = []; for (let i = 0; i < 3 * M; i++) { const cols = new Set(); while (cols.size < P) cols.add(Math.floor(r() * N)); parts.push([...cols].map((c) => c * C + Math.floor(r() * C))); }
  const comps = []; for (let m = 0; m < M; m++) comps.push([parts[3 * m], parts[3 * m + 1], parts[3 * m + 2]]);
  return { parts, comps, r }; }
function store(w, K, C) { const segs = new Map(); const add = (cell, syn) => { if (!segs.has(cell)) segs.set(cell, []); segs.get(cell).push(syn); }; let links = 0, bindLinks = 0;
  for (const p of w.parts) for (const c of p) { const syn = p.filter((x) => x !== c); add(c, syn); links += syn.length; }
  for (const comp of w.comps) { const all = comp.flat(); const smp = K === 'all' ? all : comp.flatMap((p) => p.slice(0, +K));
    for (const c of smp) { const syn = smp.filter((x) => x !== c); add(c, syn); bindLinks += syn.length; } }
  const idx = new Map(); for (const [cell, L] of segs) L.forEach((syn, j) => { for (const u of syn) { if (!idx.has(u)) idx.set(u, []); idx.get(u).push([cell, j]); } });
  return { segs, idx, links, bindLinks }; }
function recall(S, cue, C, compete) { const act = new Set(cue); let work = 0;
  for (let r = 0; r < 6; r++) { const cnt = new Map(); for (const u of act) { const L = S.idx.get(u); if (!L) continue; work += L.length; for (const [cell, j] of L) { if (act.has(cell)) continue; const k = cell + ':' + j; cnt.set(k, (cnt.get(k) || 0) + 1); } }
    const sup = new Map(); for (const [k, n] of cnt) if (n >= 2) { const cell = +k.split(':')[0]; if (!(sup.get(cell) >= n)) sup.set(cell, n); }
    let fire = [...sup.keys()];
    if (compete === 'column') { const best = new Map(); for (const cell of fire) { const col = Math.floor(cell / C), v = sup.get(cell), b = best.get(col); if (!b || v > b.v) best.set(col, { cell, v, tie: false }); else if (v === b.v) b.tie = true; }
      fire = [...best.values()].filter((b) => !b.tie).map((b) => b.cell); }
    if (!fire.length) break; fire.forEach((c) => act.add(c)); }
  return { act, work }; }
const res = {};
for (const C of CS) for (const M of MS) for (const seed of SEEDS) { const w = build(seed, M, C);
  for (const K of KS) { const S = store(w, K, C);
    for (const cmp of COMPETE) { const key = `${C}|${M}|${K}|${cmp}`; const o = res[key] || (res[key] = { n: 0, full: 0, clean: 0, intr: 0, recallFrac: 0, work: 0, bind: 0, links: 0, seeds: 0 }); o.bind += S.bindLinks; o.links += S.links; o.seeds++;
      const pr = rng(seed * 101 + M), T = Math.min(M, 60);
      for (let t = 0; t < T; t++) { const m = Math.floor(pr() * M), comp = w.comps[m], cue = comp[Math.floor(pr() * 3)], target = new Set(comp.flat());
        const { act, work } = recall(S, cue, C, cmp); let got = 0, intr = 0; for (const c of act) { if (target.has(c)) got++; else intr++; }
        o.n++; o.recallFrac += got / target.size; if (got === target.size) o.full++; if (got === target.size && !intr) o.clean++; o.intr += intr; o.work += work; } } } }
console.log(`C76 · composition by binding a sample   ${N} columns, parts of ${P} cells, compositions of 3 parts   seeds ${SEEDS.join(',')}`);
console.log('Recall from one whole part. full = the whole composition back; clean = full and no other cell; intrusions = other cells per recall.\n');
for (const cmp of COMPETE) for (const C of CS) { console.log(`compete=${cmp}   ${C} cells per column`);
  console.log('  ' + 'bind per part'.padEnd(14) + MS.map((M) => `M=${M}`.padStart(34)).join(''));
  for (const K of KS) { let line = '  ' + K.padEnd(14);
    for (const M of MS) { const o = res[`${C}|${M}|${K}|${cmp}`]; line += `${Math.round(100 * o.full / o.n)}% / ${Math.round(100 * o.clean / o.n)}% / ${(o.intr / o.n).toFixed(1)}`.padStart(34); } console.log(line); }
  let line = '  ' + 'binding links'.padEnd(14); for (const M of MS) line += KS.map((K) => Math.round(res[`${C}|${M}|${K}|${cmp}`].bind / res[`${C}|${M}|${K}|${cmp}`].seeds / M)).join(' / ').padStart(26); console.log(line + '   (per composition: K = 1 / 2 / 3 / all)');
  line = '  ' + 'work'.padEnd(14); for (const M of MS) line += KS.map((K) => Math.round(res[`${C}|${M}|${K}|${cmp}`].work / res[`${C}|${M}|${K}|${cmp}`].n)).join(' / ').padStart(26); console.log(line + '   (segment checks per recall)\n'); }
