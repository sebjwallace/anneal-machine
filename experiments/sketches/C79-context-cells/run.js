// C79 · Which cell: Numenta's scheme in a text world, on cells and segments.
// Each word has a column of C cells (the column is the word's identity; given by hand, as in every text sketch so far).
// A sentence is read word by word. Context = the active cells of the previous two words (the bar of two needs two). A segment fires at
// 2 or more active links (RM-2). For each word:
//   predicted = cells in its column with a firing segment
//   if any: those become active (context has chosen the cell)
//   else: the whole column lights (all its cells active), and one cell learns this context: the least-used cell
//         (least) or a random one (random). (Numenta also prefers a cell whose segment nearly matches; with a bar of two,
//         'nearly' is one link, which the shared first cell always gives, so it is left out: declared.)
//   the learning cell grows a segment over the context's winner cells. A cell predicted only through cells lit by a
//   burst (not by the previous words' winner cells) also learns: it grows a segment over the winners (Numenta: learn
//   from winners), so a new context is not lost in the union a burst wakes.
// The first word of a sentence has no context: it always uses cell 0 (declared).
// Arms: identity (C = 1: one cell per word, the old way), least (C = 16), random (C = 16).
// World: "the S V the O"; O depends on S and V together (each (S, V) pair has its own object), so "V the" alone is
// ambiguous. Each sentence is seen REPS times (default 1). One subject (the newcomer) is seen only in "the S runs".
// Tests: after "the S V the", the predicted columns: right (contains O), sharp (only O); and for the newcomer in a seen
// frame ("the newcomer V the"), whether it predicts any object V takes (generalising through the column).
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
'use strict';
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number), REPS = +(process.env.REPS || 1);
const NS = +(process.env.NS || 8), NV = +(process.env.NV || 4), NO = +(process.env.NO || 10);
function world(seed) { const r = rng(seed * 31 + 7), S = [...Array(NS)].map((_, i) => 's' + i), V = [...Array(NV)].map((_, i) => 'v' + i), O = [...Array(NO)].map((_, i) => 'o' + i);
  const obj = {}; for (const s of S) for (const v of V) obj[s + '|' + v] = O[Math.floor(r() * NO)];
  const sents = []; for (const s of S) for (const v of V) sents.push(['the', s, v, 'the', obj[s + '|' + v]]);
  sents.push(['the', 'new', 'runs']);
  for (let i = sents.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [sents[i], sents[j]] = [sents[j], sents[i]]; }
  return { S, V, O, obj, sents }; }
function model(C, mode, r) {
  const col = new Map(), segs = [], idx = new Map(), used = new Map(); let ncol = 0;
  const colOf = (w) => { if (!col.has(w)) col.set(w, ncol++); return col.get(w); };
  const cells = (w) => { const b = colOf(w) * C; return [...Array(C)].map((_, i) => b + i); };
  const grow = (cell, syn) => { const id = segs.length; segs.push({ cell, syn }); for (const u of syn) { if (!idx.has(u)) idx.set(u, []); idx.get(u).push(id); } used.set(cell, (used.get(cell) || 0) + 1); };
  const count = (act) => { const cnt = new Map(); for (const u of act) for (const id of idx.get(u) || []) cnt.set(id, (cnt.get(id) || 0) + 1); return cnt; };
  function step(word, ctxAll, ctxWin, learn, first) {
    const cs = cells(word); if (first) return { act: [cs[0]], win: [cs[0]], burst: false };
    const cnt = count(ctxAll), best = new Map(); for (const [id, k] of cnt) { const c = segs[id].cell; if (cs.includes(c)) best.set(c, Math.max(best.get(c) || 0, k)); }
    const pred = cs.filter((c) => (best.get(c) || 0) >= 2);
    if (pred.length) {   // predicted. Learn this context if the prediction came only through cells lit by a burst (Numenta: learn from winners)
      const cw = count(ctxWin), byWin = cs.filter((c) => [...cw].some(([id, k]) => k >= 2 && segs[id].cell === c));
      if (learn && !byWin.length && ctxWin.length) { const lc = pred.reduce((a, b) => ((used.get(a) || 0) <= (used.get(b) || 0) ? a : b)); grow(lc, ctxWin.slice()); return { act: pred, win: [lc], burst: false }; }
      return { act: pred, win: byWin.length ? byWin : pred, burst: false }; }
    const lc = mode === 'random' ? cs[Math.floor(r() * C)] : cs.reduce((a, b) => ((used.get(a) || 0) <= (used.get(b) || 0) ? a : b));
    if (learn && ctxWin.length) grow(lc, ctxWin.slice());
    return { act: cs, win: [lc], burst: true }; }
  function read(sent, learn) { const pos = [];
    for (let i = 0; i < sent.length; i++) { const ctx = pos.slice(-2); pos.push(step(sent[i], ctx.flatMap((p) => p.act), ctx.flatMap((p) => p.win), learn, i === 0)); }
    const ctx = pos.slice(-2); return { all: ctx.flatMap((p) => p.act), win: ctx.flatMap((p) => p.win) }; }
  function predict(prefix) { const { all } = read(prefix, false); const cnt = count(all), out = new Set(); for (const [id, k] of cnt) if (k >= 2) { const c = segs[id].cell; for (const [w, b] of col) if (Math.floor(c / C) === b) out.add(w); } return out; }
  return { read, predict, segs, used, col }; }
const ARMS = [['identity', 1, 'least'], ['least', 16, 'least'], ['random', 16, 'random']], res = {};
for (const [name, C, mode] of ARMS) for (const seed of SEEDS) { const w = world(seed), r = rng(seed * 97 + 3), m = model(C, mode, r);
  for (let k = 0; k < REPS; k++) for (const s of w.sents) m.read(s, true);
  const o = res[name] || (res[name] = { n: 0, right: 0, sharp: 0, nn: 0, newAny: 0, newOnly: 0, size: 0, cells: 0, segs: 0, runs: 0 }); o.runs++; o.cells += m.used.size; o.segs += m.segs.length;
  for (const s of w.S) for (const v of w.V) { const p = m.predict(['the', s, v, 'the']), want = w.obj[s + '|' + v]; p.delete('the'); o.n++; if (p.has(want)) o.right++; if (p.has(want) && p.size === 1) o.sharp++; o.size += p.size; }
  for (const v of w.V) { const p = m.predict(['the', 'new', v, 'the']); p.delete('the'); const valid = new Set(w.S.map((s) => w.obj[s + '|' + v])); o.nn++; if ([...p].some((x) => valid.has(x))) o.newAny++; if (p.size && [...p].every((x) => valid.has(x))) o.newOnly++; } }
console.log(`C79 · which cell: Numenta's scheme in a text world   ${NS} subjects, ${NV} verbs, ${NO} objects; each sentence seen ${REPS}x   seeds ${SEEDS.join(',')}\n`);
console.log('arm        last word right   sharp (only it)   words predicted   newcomer: any valid / only valid   cells used   segments');
for (const [name] of ARMS) { const o = res[name]; console.log(`${name.padEnd(10)} ${(Math.round(100 * o.right / o.n) + '%').padStart(15)} ${(Math.round(100 * o.sharp / o.n) + '%').padStart(17)} ${(o.size / o.n).toFixed(1).padStart(17)} ${(Math.round(100 * o.newAny / o.nn) + '% / ' + Math.round(100 * o.newOnly / o.nn) + '%').padStart(34)} ${String(Math.round(o.cells / o.runs)).padStart(12)} ${String(Math.round(o.segs / o.runs)).padStart(10)}`); }
