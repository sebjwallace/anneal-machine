// Sketch 37, part 1: exceptions. Learnt inhibition (cell-level NOT) from the automaton's own failed predictions.
// A context ("white bird") drives property cells through positive links; the properties then happen (or not).
// MODE: pos      positive links only, summed drive
//       posmean  positive links only, drive averaged over context tokens (exceptions by out-voting)
//       not      positive links + learnt inhibition (gated by own failed prediction), summed drive   [the mechanism]
//       ungated  positive links + inhibition grown whenever X is absent with C active (no prediction gate: learns from the answer)
// BETA: balance strength (Vogels-style homeostatic term on existing inhibitory links). SEEDS. NOISE (property dropout).
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const K = 4, ETAP = 0.1, ETAI = 0.1, RHO0 = 0.5, TH = 0.5, NEV = +(process.env.NEV ?? 4500), T1 = 1500, T2 = 3000, PROBE = 150;
const MODE = process.env.MODE || 'not', BETA = +(process.env.BETA ?? 0), NOISE = +(process.env.NOISE ?? 0.05);
const SEEDS = (process.env.SEEDS ?? '41,42,43,44,45,46,47,48,49,50').split(',').map(Number);
const INH = MODE === 'not' || MODE === 'ungated';
// ---- world (the automaton sees token lists only) ----
const MODS = ['white', 'black', 'brown', 'grey', 'small', 'big'];
const PROPS = { bird: ['flies', 'sings'], dog: ['barks', 'runs'], fish: ['swims'] };
// ostrich: exception from the start. penguin: exception arriving late (first seen at T1, rule already hard). chick: exception until T2, then flies.
const exProps = (m, n) => m === 'ostrich' ? ['sings', 'runs'] : m === 'penguin' ? ['sings', 'swims'] : m === 'chick' ? (n < T2 ? ['sings'] : ['flies', 'sings']) : null;
function world(seed) { const r = rng(seed * 13 + 5), ev = [];
  for (let n = 0; n < NEV; n++) { const u = r(), kind = u < 0.5 ? 'bird' : u < 0.75 ? 'dog' : 'fish';
    const pool = kind === 'bird' ? [...MODS, 'ostrich', 'chick', ...(n >= T1 ? ['penguin'] : [])] : MODS, m = pool[(r() * pool.length) | 0];
    const props = (exProps(m, n) || PROPS[kind]).filter(() => r() >= NOISE); ev.push({ ctx: [m, kind], props }); }
  return ev; }
// ---- automaton ----
function makeNet() { return { cells: {}, n: 0, Wp: new Map(), Wi: new Map(), known: [], st: { changed: 0 } }; }
const cellsOf = (net, t) => net.cells[t] || (net.cells[t] = Array.from({ length: K }, () => { net.known.push(net.n); return net.n++; }));
const g = (M, a, x) => M.get(a)?.get(x) || 0;
function sw(net, M, a, x, v) { let m = M.get(a); if (!m) M.set(a, m = new Map()); if (Math.abs((m.get(x) || 0) - v) > 1e-6) net.st.changed++; if (v <= 1e-6) m.delete(x); else m.set(x, v); }
// prediction for every known cell outside the context: exc = summed positive input, inh = summed inhibitory input (per token: /K)
function predict(net, ctx) { const A = ctx.flatMap(t => cellsOf(net, t)), inA = new Set(A), exc = new Map(), inh = new Map();
  for (const a of A) { const m = net.Wp.get(a); if (m) for (const [x, w] of m) if (!inA.has(x)) exc.set(x, (exc.get(x) || 0) + w / K);
    const mi = net.Wi.get(a); if (mi) for (const [x, w] of mi) if (!inA.has(x)) inh.set(x, (inh.get(x) || 0) + w / K); }
  const div = MODE === 'posmean' ? ctx.length : 1, P = new Map();
  for (const x of new Set([...exc.keys(), ...inh.keys()])) P.set(x, { e: (exc.get(x) || 0) / div, p: Math.min(1, Math.max(0, ((exc.get(x) || 0) - (INH ? inh.get(x) || 0 : 0)) / div)) });
  return { A, inA, P }; }
const tokPred = (net, P, t) => net.cells[t] ? net.cells[t].reduce((s, x) => s + (P.get(x)?.p || 0), 0) / K : 0;
function step(net, ev) { net.st.changed = 0; const { A, inA, P } = predict(net, ev.ctx), act = new Set(ev.props.flatMap(t => cellsOf(net, t)));
  let made = 0;
  if (MODE === 'not') for (const [x, { e, p }] of P) { const y = act.has(x) ? 1 : 0, err = p - y;          // misfit at x: own prediction minus what happened
    if (err > 1e-9) for (const a of A) { if (!g(net.Wi, a, x)) made++; sw(net, net.Wi, a, x, g(net.Wi, a, x) + ETAI * err); }   // predicted, didn't happen: C -| X grows
    else if (err < -1e-9) for (const a of A) { const w = g(net.Wi, a, x); if (w) sw(net, net.Wi, a, x, Math.max(0, w + ETAI * err)); } // happened, under-predicted: C -| X weakens
    if (BETA && e > 0) { const on = p >= TH ? 1 : 0; for (const a of A) { const w = g(net.Wi, a, x); if (!w && on) made++; sw(net, net.Wi, a, x, Math.max(0, w + BETA * (on - RHO0))); } } } // balance: every potential C -| X onto a driven cell moves to keep x active about RHO0 of the time
  if (MODE === 'ungated') for (const x of net.known) { if (inA.has(x)) continue; const y = act.has(x) ? 1 : 0;
    for (const a of A) { const w = g(net.Wi, a, x); if (!y) { if (!w) made++; sw(net, net.Wi, a, x, w + ETAI * (1 - w)); } else if (w) sw(net, net.Wi, a, x, w * (1 - ETAI)); } }
  // positive links: instar (a active: w -> w + eta (post - w)), i.e. P(x | a). Only touches links that exist or whose target happened.
  for (const a of A) { const m = net.Wp.get(a) || new Map(); for (const x of new Set([...m.keys(), ...act])) if (!inA.has(x)) sw(net, net.Wp, a, x, g(net.Wp, a, x) + ETAP * ((act.has(x) ? 1 : 0) - g(net.Wp, a, x))); }
  return { made, changed: net.st.changed }; }
// ---- probes (no learning) ----
const has = (net, ctx, t) => tokPred(net, predict(net, ctx).P, t) >= TH;
function probe(net, n) { const o = {}, f = (k, v) => { o[k] = v; };
  const birds = MODS.map(m => [m, 'bird']), non = MODS.flatMap(m => [[m, 'dog'], [m, 'fish']]);
  f('rule: regular birds -> "flies"', birds.filter(c => has(net, c, 'flies')).length / birds.length);
  f('rule: novel "green bird" -> "flies"', +has(net, ['green', 'bird'], 'flies'));
  f('rule: dogs/fish -> "flies" (false)', non.filter(c => has(net, c, 'flies')).length / non.length);
  f('rule: regular birds -> "sings"', birds.filter(c => has(net, c, 'sings')).length / birds.length);
  f('ostrich: NOT "flies"', +!has(net, ['ostrich', 'bird'], 'flies')); f('ostrich: "runs"', +has(net, ['ostrich', 'bird'], 'runs'));
  if (n >= T1) { f('penguin: NOT "flies"', +!has(net, ['penguin', 'bird'], 'flies')); f('penguin: "swims"', +has(net, ['penguin', 'bird'], 'swims')); }
  f('chick: "flies" (wanted: no before T2, yes after)', +has(net, ['chick', 'bird'], 'flies'));
  { let ok = 0, tot = 0; const vocab = ['flies', 'sings', 'barks', 'runs', 'swims'];
    const ctxs = [...MODS.flatMap(m => ['bird', 'dog', 'fish'].map(k => [m, k, PROPS[k]])), ['ostrich', 'bird', exProps('ostrich', n)], ['chick', 'bird', exProps('chick', n)], ...(n >= T1 ? [['penguin', 'bird', exProps('penguin', n)]] : [])];
    for (const [m, k, pr] of ctxs) { const P = predict(net, [m, k]).P; for (const t of vocab) { tot++; ok += +((tokPred(net, P, t) >= TH) === pr.includes(t)); } }
    f('all contexts x properties correct', ok / tot); }
  let tw = 0, nl = 0; for (const m of net.Wi.values()) for (const w of m.values()) { tw += w; nl++; } f('inhibitory links', nl); f('inhibitory weight (total)', tw);
  return o; }
// ---- run ----
const tab = {}, fin = {}, lat = {}, addf = (k, v) => { (fin[k] = fin[k] || []).push(v); };
for (const seed of SEEDS) { const net = makeNet(), ev = world(seed); let cost = 0, made = 0, pen = 0, penOK = null, chk = 0, chkOK = null;
  for (let n = 0; n < NEV; n++) { const x = ev[n], r = step(net, x); cost += r.changed; made += r.made;
    if (x.ctx[0] === 'penguin') { pen++; if (penOK === null && !has(net, ['penguin', 'bird'], 'flies')) penOK = pen; }   // penguin occurrences until honoured
    if (x.ctx[0] === 'chick' && n >= T2) { chk++; if (chkOK === null && has(net, ['chick', 'bird'], 'flies')) chkOK = chk; } // chick occurrences after T2 until it flies again
    if ((n + 1) % PROBE === 0) { const o = probe(net, n); for (const [k, v] of Object.entries(o)) { const a = tab[k] = tab[k] || []; const b = (n + 1) / PROBE - 1; a[b] = (a[b] || 0) + v / SEEDS.length; } }
    if (n + 1 === T1 || n + 1 === T2 || n + 1 === NEV) for (const [k, v] of Object.entries(probe(net, n))) addf(`${k} @${n + 1}`, v); }
  addf('penguin occurrences until honoured (cap = never)', penOK ?? 99); addf('chick occurrences after T2 until "flies" again (99 = never)', chkOK ?? 99);
  addf('links changed per event', cost / NEV); addf('inhibitory links created per event', made / NEV); }
console.log(`part 1 exceptions  MODE=${MODE} BETA=${BETA} NOISE=${NOISE} seeds=${SEEDS} events/seed=${NEV} (T1=${T1} penguin arrives, T2=${T2} chick starts flying)`);
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
for (const [k, a] of Object.entries(fin).sort()) console.log(k.padEnd(70), mean(a).toFixed(3), k.includes('until') ? `[${a.join(' ')}]` : '');
console.log(`\nover time (probe every ${PROBE} events, mean over seeds)`);
for (const [k, a] of Object.entries(tab)) console.log(k.padEnd(50), Array.from(a, v => v === undefined ? '  - ' : (v >= 10 ? v.toFixed(0) : v.toFixed(2)).padStart(4)).join(' '));
