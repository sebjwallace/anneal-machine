// C120 · Prime patterns. (Learning is C118's heat.js, 'both'; then rest decomposes and composes the held patterns, scored by energy.)
// Utterances held whole and split only by comparison with what is held (anneal's shapes: the shared run, what varies
// before and after it). No chunking. See hypothesis.md.
//
// The books: gutenberg.zip from https://github.com/nltk/nltk_data (packages/corpora), unzipped.
// Run: node prime.js <folder with the .txt files>

'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2];
if (!DIR) { console.error('usage: node prime.js <folder>'); process.exit(1); }
const BOOKS = [
  { name: 'Buster Brown', file: 'burgess-busterbrown.txt' },
  { name: 'Alice', file: 'carroll-alice.txt' },
];
const SIZES = [16384];
const RESTS = [0];
const CUTS = ['sentences', 'fixed'];
const SWITCHES = [[false, false], [true, false], [false, true], [true, true]]; // [heat, energy]
const COMPARE_AT_MOST = 40; // pieces compared per step: those sharing the most three-letter runs (a given, for speed)

const pad = (s, n) => (String(s).length >= n ? String(s) : String(s) + ' '.repeat(n - String(s).length));
const pct = (x) => (100 * x).toFixed(0) + '%';

// stretches: each a list of word segments { w, partial }
let seed = 12345;
const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
function cutText(raw, how) {
  if (how === 'sentences') return utterances(raw).map((ws) => ws.map((w) => ({ w, partial: false })));
  seed = 12345;
  const words = raw.toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').filter(Boolean);
  const out = [];
  let cur = [], room = how === 'fixed' ? 60 : 30 + Math.floor(rand() * 121);
  for (const word of words) {
    let w = word, partial = false;
    while (w.length > 0) {
      if (w.length <= room) { cur.push({ w, partial }); room -= w.length; w = ''; }
      else { cur.push({ w: w.slice(0, room), partial: true }); w = w.slice(room); partial = true; room = 0; }
      if (room === 0) { out.push(cur); cur = []; room = how === 'fixed' ? 60 : 30 + Math.floor(rand() * 121); }
    }
  }
  if (cur.length) out.push(cur);
  return out;
}
// utterances: cut where sentences end; each a list of words
function utterances(raw) {
  return raw.split(/[.!?;:]+/)
    .map((s) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').filter(Boolean))
    .filter((w) => w.length > 0);
}

// longest common run of letters between a and b: { len, i (in a), j (in b) }
function longestShared(a, b) {
  let best = { len: 0, i: 0, j: 0 };
  const prev = new Array(b.length + 1).fill(0), cur = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0;
      if (cur[j] > best.len) best = { len: cur[j], i: i - cur[j], j: j - cur[j] };
    }
    for (let j = 0; j <= b.length; j++) { prev[j] = cur[j]; cur[j] = 0; }
  }
  return best;
}

let FREEZE = true; // C120: memory is not changed by the unseen tenth
function run(segs, spaces, N, R, HEAT, ENERGY) {
  const utts = segs.map((ss) => ss.map((x) => x.w));
  const join = (words) => (spaces ? words.join('_') : words.join(''));
  const texts = utts.map(join);
  const A = new Set(texts.join('')).size;
  const use = 1 + Math.log2(N) / Math.log2(A);
  const pieces = new Map(); // text -> { uses, born }
  const tri = new Map(); // three-letter run -> Set of pieces
  let clock = 0, formed = 0, storedAway = 0, restFormed = 0;
  let sinceRest = [];
  const order = []; // first pieces formed, to see coarse before fine
  const triOf = (t) => { const s = new Set(); for (let i = 0; i + 3 <= t.length; i++) s.add(t.slice(i, i + 3)); return s; };
  let totalWays = 0, rejected = 0;
  let currentWhole = '';
  const pays = (t) => { // k · (b − use) > b, k: held pieces containing t, plus the whole being learnt from
    if (!ENERGY) return true;
    if (pieces.has(t)) return true;
    let k = 0;
    const g = t.length >= 3 ? tri.get(t.slice(0, 3)) : null;
    const pool = g ? g : pieces.keys();
    for (const p of pool) if (p.includes(t)) k++;
    if (currentWhole.includes(t)) k++;
    return k * (t.length - use) > t.length + 1e-9;
  };
  const derive = (t) => { if (t.length < 2) return; if (pays(t)) add(t); else rejected++; };
  const add = (t) => {
    if (t.length < 2) return;
    if (pieces.has(t)) { pieces.get(t).ways++; totalWays++; return; }
    if (pieces.size >= N) { // store away the least used (the oldest on a tie)
      let worst = null;
      for (const [k, v] of pieces) if (!worst || v.uses < worst[1].uses || (v.uses === worst[1].uses && v.born < worst[1].born)) worst = [k, v];
      pieces.delete(worst[0]);
      for (const g of triOf(worst[0])) tri.get(g)?.delete(worst[0]);
      storedAway++;
    }
    pieces.set(t, { uses: 0, born: clock++, ways: 1 }); totalWays++;
    for (const g of triOf(t)) { if (!tri.has(g)) tri.set(g, new Set()); tri.get(g).add(t); }
    formed++;
    sinceRest.push(t);
    if (order.length < 40) order.push(t);
  };
  const candidates = (u, self = null) => {
    const score = new Map();
    for (const g of triOf(u)) for (const p of tri.get(g) || []) if (p !== self) score.set(p, (score.get(p) || 0) + 1);
    return [...score].sort((a, b) => b[1] - a[1]).slice(0, COMPARE_AT_MOST).map(([p]) => p);
  };
  const differentiate = (u, depth = 0, self = null) => {
    if (u.length < 2 || depth > 30) return;
    let best = null;
    for (const p of candidates(u, self)) {
      const s = longestShared(u, p);
      if (s.len >= 2 && (!best || s.len > best.s.len)) best = { p, s };
    }
    if (!best) return;
    const { p, s } = best;
    const shared = u.slice(s.i, s.i + s.len);
    derive(shared);
    derive(p.slice(0, s.j)); derive(p.slice(s.j + s.len));
    const before = u.slice(0, s.i), after = u.slice(s.i + s.len);
    derive(before); derive(after);
    differentiate(before, depth + 1);
    differentiate(after, depth + 1);
  };
  // rest: each piece formed since the last rest is compared with the other held pieces
  const rest = () => {
    const batch = sinceRest; sinceRest = [];
    const before = formed;
    for (const p of batch) if (pieces.has(p)) differentiate(p, 0, p);
    sinceRest = []; // what rest forms is compared at the next rest only if formed by input
    restFormed += formed - before;
  };

  // cheapest description with the pieces held (letters cost 1, a use costs `use`)
  const byFirst2 = () => { const m = new Map(); for (const p of pieces.keys()) { const k = p.slice(0, 2); if (!m.has(k)) m.set(k, []); m.get(k).push(p); } return m; };
  const readNamed = (u, idx) => { // cheapest, with naming by ways in
    const n = u.length, c = new Array(n + 1).fill(0), how = new Array(n + 1).fill(null);
    const L = Math.log2(A);
    for (let i = n - 1; i >= 0; i--) {
      c[i] = 1 + c[i + 1];
      for (const p of idx.get(u.slice(i, i + 2)) || []) if (u.startsWith(p, i)) {
        const v = 1 + Math.log2(totalWays / pieces.get(p).ways) / L + c[i + p.length];
        if (v < c[i] - 1e-9 || (Math.abs(v - c[i]) < 1e-9 && p.length > (how[i]?.length ?? 1))) { c[i] = v; how[i] = p; }
      }
    }
    const parts = [];
    for (let i = 0; i < n; ) { if (how[i]) { parts.push(how[i]); i += how[i].length; } else parts.push(u[i++]); }
    return parts;
  };
  const readSupport = (u, idx) => { // AMP's rule: most support (ways in) wins, ties held, parts are not rivals
    const cands = [];
    for (let i = 0; i < u.length - 1; i++) for (const p of idx.get(u.slice(i, i + 2)) || []) if (u.startsWith(p, i)) cands.push({ p, s: i, e: i + p.length, w: pieces.get(p).ways, state: null });
    const rivals = (a, b) => a.s < b.e && b.s < a.e && !(a.s <= b.s && b.e <= a.e) && !(b.s <= a.s && a.e <= b.e);
    cands.sort((a, b) => b.w - a.w);
    for (let k = 0; k < cands.length; ) {
      // the group of equal support
      let j = k; while (j < cands.length && cands[j].w === cands[k].w) j++;
      const group = cands.slice(k, j).filter((c) => !c.state);
      for (const c of group) {
        const tied = group.some((d) => d !== c && !d.state && rivals(c, d));
        c.pending = tied ? 'tie' : 'win';
      }
      for (const c of group) {
        c.state = c.pending === 'win' ? 'won' : 'held';
        if (c.state === 'won') for (const d of cands) if (!d.state && rivals(c, d)) d.state = 'beaten';
      }
      // a held tie blocks its rivals of lower support too (nothing below can take those letters)
      for (const c of group) if (c.state === 'held') for (const d of cands) if (!d.state && rivals(c, d)) d.state = 'beaten';
      k = j;
    }
    // the reading: outermost winners, the rest loose letters
    const won = cands.filter((c) => c.state === 'won').sort((a, b) => a.s - b.s || b.e - a.e);
    const parts = [];
    let at = 0;
    for (const c of won) {
      if (c.s < at) continue; // inside a winner already read (a part)
      while (at < c.s) parts.push(u[at++]);
      parts.push(c.p); at = c.e;
    }
    while (at < u.length) parts.push(u[at++]);
    return parts;
  };
  const read = (u, idx) => {
    const n = u.length, c = new Array(n + 1).fill(0), how = new Array(n + 1).fill(null);
    for (let i = n - 1; i >= 0; i--) {
      c[i] = 1 + c[i + 1];
      for (const p of idx.get(u.slice(i, i + 2)) || []) if (u.startsWith(p, i)) {
        const v = use + c[i + p.length];
        if (v < c[i] - 1e-9 || (Math.abs(v - c[i]) < 1e-9 && p.length > (how[i]?.length ?? 1))) { c[i] = v; how[i] = p; }
      }
    }
    const parts = [];
    for (let i = 0; i < n; ) { if (how[i]) { parts.push(how[i]); i += how[i].length; } else parts.push(u[i++]); }
    return parts;
  };


  // learn from a whole: with heat, only what reading leaves loose (runs of 2+ loose letters) is compared and stored
  const hotLetters = { tenths: Array.from({ length: 10 }, () => ({ hot: 0, all: 0 })) };
  const learn = (u, k) => {
    currentWhole = u;
    let hot = [];
    if (HEAT) {
      const parts = read(u, byFirst2());
      let run = '';
      for (const p of parts) { if (p.length === 1) run += p; else { if (run.length >= 2) hot.push(run); run = ''; } }
      if (run.length >= 2) hot.push(run);
    } else hot = [u];
    const t = hotLetters.tenths[Math.min(9, Math.floor(10 * k / texts.length))];
    t.all += u.length;
    t.hot += hot.reduce((a, h) => a + h.length, 0);
    for (const h of hot) { differentiate(h); currentWhole = u; add(h); }
  };
  const measureFrom = Math.floor(texts.length * 0.9);
  for (let k = 0; k < measureFrom; k++) {
    const u = texts[k];
    learn(u, k);
    if (R && (k + 1) % R === 0) rest();
    // credit what reading would use, so storage keeps what is used (every 50 utterances, for speed)
    if (k % 50 === 0) { const idx = byFirst2(); for (const t of texts.slice(Math.max(0, k - 50), k + 1)) for (const p of read(t, idx)) if (p.length > 1) pieces.get(p).uses++; }
  }

  // measure: read the last tenth with what is held (learning still on, as it streams), with three readers
  const readers = { cheapest: read };
  const acc = {};
  for (const name of Object.keys(readers)) acc[name] = { cuts: 0, cutsAtWord: 0, boundaries: 0, found: 0, words: 0, whole: 0, pieceCount: 0, cleanPieces: 0, pieceLetters: 0, allLetters: 0, samples: [], used: new Map() };
  let positions = 0, boundaryPositions = 0;
  for (let k = measureFrom; k < texts.length; k++) {
    const u = texts[k];
    const idx = byFirst2();
    const wb = new Set();
    let at = 0;
    for (let w = 0; w < utts[k].length - 1; w++) { at += utts[k][w].length; if (spaces) { wb.add(at); wb.add(at + 1); at += 1; } else wb.add(at); }
    for (let p = 1; p < u.length; p++) { positions++; if (wb.has(p)) boundaryPositions++; }
    for (const [name, reader] of Object.entries(readers)) {
      const m = acc[name];
      const parts = reader(u, idx);
      const cutSet = new Set();
      at = 0;
      for (let j = 0; j < parts.length - 1; j++) { at += parts[j].length; cutSet.add(at); }
      for (const c of cutSet) { m.cuts++; if (wb.has(c)) m.cutsAtWord++; }
      const realGaps = utts[k].length - 1;
      m.boundaries += realGaps;
      at = 0;
      for (let w = 0; w < realGaps; w++) { at += utts[k][w].length; if (cutSet.has(at) || (spaces && cutSet.has(at + 1))) m.found++; if (spaces) at += 1; }
      const starts = new Map(); let a2 = 0;
      for (const p of parts) { starts.set(a2, p); a2 += p.length; }
      at = 0;
      for (const [wi, w] of utts[k].entries()) {
        if (segs[k][wi].partial) { at += w.length + (spaces ? 1 : 0); continue; }
        m.words++;
        const s0 = at, e = at + w.length;
        const p = starts.get(s0) ?? (spaces ? starts.get(s0 - 1) : undefined);
        if (p) { const ps = starts.has(s0) && starts.get(s0) === p ? s0 : s0 - 1; const pe = ps + p.length; if (pe === e || (spaces && pe === e + 1)) m.whole++; }
        at = e + (spaces ? 1 : 0);
      }
      const edgeOk = (pos) => wb.has(pos); // strict: stretch edges don't count
      let a3 = 0;
      for (const p of parts) {
        if (p.length > 1) { m.pieceCount++; m.pieceLetters += p.length; if (edgeOk(a3) && edgeOk(a3 + p.length)) m.cleanPieces++; m.used.set(p, (m.used.get(p) || 0) + 1); }
        a3 += p.length;
      }
      m.allLetters += u.length;
      if (m.samples.length < 6 && u.length > 30 && u.length < 90) m.samples.push(parts.map((p) => (p.length === 1 ? p : `[${p}]`)).join(''));
    }
    if (!FREEZE) { learn(u, k); if (R && (k + 1) % R === 0) rest(); }
  }
  const results = {};
  for (const [name, m] of Object.entries(acc)) results[name] = { precision: m.cutsAtWord / m.cuts, recall: m.found / m.boundaries, whole: m.whole / m.words,
    clean: m.cleanPieces / m.pieceCount, coverage: m.pieceLetters / m.allLetters, samples: m.samples, top: [...m.used].sort((a, b) => b[1] - a[1]).slice(0, 25) };
  return { results, chance: boundaryPositions / positions, formed, restFormed, held: pieces.size, rejected, heat: hotLetters.tenths.map((x) => x.all ? x.hot / x.all : 0), pieces, texts, measureFrom, A };
}


// ---------------------------------------------------------------- C120: rest decomposes and composes

function decomposeAndScore(held, test, A, link) {
  // held: Set of pattern texts. Returns energy before and after, and the primes.
  const index = (set) => { const m = new Map(); for (const p of set) { const k = p.slice(0, 2); if (!m.has(k)) m.set(k, []); m.get(k).push(p); } return m; };
  const describe = (t, idx, self = null) => { // cheapest description of t by held patterns (not itself) and letters
    const n = t.length, c = new Array(n + 1).fill(0), how = new Array(n + 1).fill(null);
    for (let i = n - 1; i >= 0; i--) {
      c[i] = 1 + c[i + 1];
      for (const p of idx.get(t.slice(i, i + 2)) || []) if (p !== self && t.startsWith(p, i)) {
        const v = link + c[i + p.length];
        if (v < c[i] - 1e-9) { c[i] = v; how[i] = p; }
      }
    }
    const parts = [];
    for (let i = 0; i < n; ) { if (how[i]) { parts.push(how[i]); i += how[i].length; } else parts.push(t[i++]); }
    return { cost: c[0], parts };
  };
  const energyOf = (set) => {
    const idx = index(set);
    let memory = 0, primes = 0;
    const stored = new Map();
    for (const p of set) {
      const d = describe(p, idx, p);
      const flat = p.length;
      if (d.cost < flat - 1e-9) { memory += d.cost; stored.set(p, d.parts); } else { memory += flat; primes++; stored.set(p, null); }
    }
    let unseen = 0, covered = 0, letters = 0;
    const used = new Map();
    for (const u of test) {
      const d = describe(u, idx);
      unseen += d.cost; letters += u.length;
      for (const p of d.parts) if (p.length > 1) { covered += p.length; used.set(p, (used.get(p) || 0) + 1); }
    }
    return { memory, unseen, total: memory + unseen, primes, count: set.size, coverage: covered / letters, stored, used };
  };
  const before = energyOf(held);
  // rest: try every split of every held pattern. A half not held is a candidate part. Parts are added one at a time,
  // the one that lowers the cost of memory most first, its saving worked out exactly (every pattern containing it is
  // re-described with it, and the part itself is paid for); stop when no part lowers it. (The first version added all
  // parts that passed the energy rule at once, which counted the same savings many times over: see out-batch-rest.txt.)
  const set = new Set(held);
  let idx = index(set);
  const storage = new Map();
  for (const p of set) storage.set(p, Math.min(p.length, describe(p, idx, p).cost));
  const containing = new Map(); // candidate -> patterns containing it
  const cands = new Set();
  for (const p of set) for (let i = 2; i <= p.length - 2; i++) { const a = p.slice(0, i), b = p.slice(i); if (!set.has(a)) cands.add(a); if (!set.has(b)) cands.add(b); }
  const byBigram = new Map();
  for (const p of set) for (let i = 0; i + 2 <= p.length; i++) { const g = p.slice(i, i + 2); if (!byBigram.has(g)) byBigram.set(g, new Set()); byBigram.get(g).add(p); }
  for (const x of cands) { const c = []; for (const p of byBigram.get(x.slice(0, 2)) || []) if (p !== x && p.includes(x)) c.push(p); containing.set(x, c); }
  const withExtra = (extra) => { const m = new Map(idx); const k = extra.slice(0, 2); m.set(k, [...(m.get(k) || []), extra]); return m; };
  const gainOf = (x) => {
    const cs = containing.get(x);
    if (!cs.length || x.length <= link) return -1;
    const ix = withExtra(x);
    let g = 0;
    for (const p of cs) g += storage.get(p) - Math.min(p.length, describe(p, ix, p).cost);
    return g - Math.min(x.length, describe(x, idx).cost);
  };
  let heap = [...cands].map((x) => ({ x, g: gainOf(x) })).filter((e) => e.g > 0).sort((a, b) => b.g - a.g);
  let added = 0, rounds = 0;
  while (heap.length) {
    rounds++;
    const top = heap.shift();
    const g = gainOf(top.x);
    if (heap.length && g < heap[0].g - 1e-9) { if (g > 0) { top.g = g; let i = 0; while (i < heap.length && heap[i].g > g) i++; heap.splice(i, 0, top); } continue; }
    if (g <= 1e-9) continue;
    set.add(top.x); added++;
    idx = index(set);
    storage.set(top.x, Math.min(top.x.length, describe(top.x, idx, top.x).cost));
    for (const p of containing.get(top.x)) storage.set(p, Math.min(p.length, describe(p, idx, p).cost));
    // the new part's own halves become candidates
    for (let i = 2; i <= top.x.length - 2; i++) for (const y of [top.x.slice(0, i), top.x.slice(i)]) if (!set.has(y) && !containing.has(y)) {
      const c = []; for (const p of set) if (p !== y && p.includes(y)) c.push(p); containing.set(y, c);
      const gy = gainOf(y); if (gy > 0) { let j = 0; while (j < heap.length && heap[j].g > gy) j++; heap.splice(j, 0, { x: y, g: gy }); }
    }
    for (const p of set) if (p !== top.x && top.x.includes(p) === false && p.includes(top.x)) { /* containing lists of other candidates are not updated with new parts: a given */ }
  }
  const after = energyOf(set);
  return { before, after, added, rounds };
}

const LINKS = [2.3, 3.2, 4.0];
for (const b of BOOKS) {
  const raw = fs.readFileSync(path.join(DIR, b.file), 'latin1');
  console.log('\n' + '='.repeat(110) + `\n${b.name}, no spaces, sentences; learnt as C118 "both" on nine tenths\n` + '='.repeat(110));
  const segs = cutText(raw, 'sentences');
  const r = run(segs, false, 16384, 0, true, true);
  const held = new Set(r.pieces.keys());
  const test = r.texts.slice(r.measureFrom);
  console.log(`held patterns ${held.size}; unseen tenth: ${test.length} sentences, ${test.reduce((a, t) => a + t.length, 0)} letters`);
  for (const link of LINKS) {
    const t0 = Date.now();
    const { before, after, added } = decomposeAndScore(held, test, r.A, link);
    console.log(`\n--- link costs ${link} letters  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    console.log(`  before rest: energy ${before.total.toFixed(0)} = memory ${before.memory.toFixed(0)} + unseen ${before.unseen.toFixed(0)}; ${before.count} patterns, ${before.primes} prime; unseen covered ${pct(before.coverage)}`);
    console.log(`  after rest:  energy ${after.total.toFixed(0)} = memory ${after.memory.toFixed(0)} + unseen ${after.unseen.toFixed(0)}; ${after.count} patterns (${added} new parts), ${after.primes} prime; unseen covered ${pct(after.coverage)}`);
    const st = after.stored;
    const show = (p) => (st.get(p) ? `${p} = ${st.get(p).map((x) => (x.length === 1 ? x : `[${x}]`)).join('')}` : `${p} (prime)`);
    for (const w of ['atter', 'hatter', 'matter', 'thehatter', 'saidthe', 'esaid', 'ing', 'the', 'nothing']) if (st.has(w)) console.log(`    ${show(w)}`); else console.log(`    ${w}: not held`);
    const primesUsed = [...after.used].filter(([p]) => st.get(p) === null).sort((a, c) => c[1] - a[1]).slice(0, 30);
    console.log(`  most used primes in the unseen tenth: ${primesUsed.map(([p, n]) => `${p}(${n})`).join(' ')}`);
    const compUsed = [...after.used].filter(([p]) => st.get(p)).sort((a, c) => c[1] - a[1]).slice(0, 12);
    console.log(`  most used composites: ${compUsed.map(([p]) => show(p)).join('   ')}`);
    const lens = [...st].filter(([, v]) => v === null).map(([p]) => p.length);
    const hist = {}; for (const l of lens) hist[Math.min(l, 12)] = (hist[Math.min(l, 12)] || 0) + 1;
    console.log(`  primes by length (12 = 12 or more): ${Object.entries(hist).map(([l, n]) => `${l}:${n}`).join(' ')}`);
  }
}
