// C121 · Local energy. (C118's heat.js, 'both'; the energy rule judged against the whole of memory, or against the neighbourhood of what is being learnt.)
// Utterances held whole and split only by comparison with what is held (anneal's shapes: the shared run, what varies
// before and after it). No chunking. See hypothesis.md.
//
// The books: gutenberg.zip from https://github.com/nltk/nltk_data (packages/corpora), unzipped.
// Run: node local.js <folder with the .txt files>

'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2];
if (!DIR) { console.error('usage: node local.js <folder>'); process.exit(1); }
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

function run(segs, spaces, N, R, HEAT, ENERGY, LOCAL = false, LEARN_UNTIL = Infinity) {
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
  let neighbourhood = null; // LOCAL: held patterns sharing a three-letter run with the whole being learnt from
  const pays = (t) => { // k · (b − link) > b
    if (!ENERGY) return true;
    if (pieces.has(t)) return true;
    let k = 0, link = use;
    if (LOCAL) {
      for (const p of neighbourhood) if (p.includes(t)) k++;
      link = 1 + Math.log2(Math.max(2, neighbourhood.size)) / Math.log2(A);
    } else {
      const g = t.length >= 3 ? tri.get(t.slice(0, 3)) : null;
      const pool = g ? g : pieces.keys();
      for (const p of pool) if (p.includes(t)) k++;
    }
    if (currentWhole.includes(t)) k++;
    return k * (t.length - link) > t.length + 1e-9;
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
    if (LOCAL) { neighbourhood = new Set(); for (const g of triOf(u)) for (const p of tri.get(g) || []) neighbourhood.add(p); }
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
  const measureFrom = LEARN_UNTIL === Infinity ? Math.floor(texts.length * 0.9) : LEARN_UNTIL;
  for (let k = 0; k < measureFrom; k++) {
    const u = texts[k];
    if (k < LEARN_UNTIL) learn(u, k);
    if (R && (k + 1) % R === 0) rest();
    // credit what reading would use, so storage keeps what is used (every 50 utterances, for speed)
    if (k % 50 === 0) { const idx = byFirst2(); for (const t of texts.slice(Math.max(0, k - 50), k + 1)) for (const p of read(t, idx)) if (p.length > 1) pieces.get(p).uses++; }
  }

  // measure: read the last tenth with what is held (learning still on, as it streams), with three readers
  const readers = { cheapest: read };
  const acc = {};
  const accBy = {};
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
      const reg = REGISTER[k] || 'all';
      if (!accBy[reg]) accBy[reg] = { cuts: 0, cutsAtWord: 0, boundaries: 0, found: 0, words: 0, whole: 0, pieceCount: 0, cleanPieces: 0, pieceLetters: 0, allLetters: 0, samples: [], used: new Map(), cost: 0 };
      const m = accBy[reg];
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
      m.cost += parts.reduce((a, p) => a + (p.length === 1 ? 1 : use), 0);
      if (m.samples.length < 6 && u.length > 30 && u.length < 90) m.samples.push(parts.map((p) => (p.length === 1 ? p : `[${p}]`)).join(''));
    }
    if (k < LEARN_UNTIL) { learn(u, k); if (R && (k + 1) % R === 0) rest(); }
  }
  const results = {};
  for (const [name, m] of Object.entries(accBy)) results[name] = { precision: m.cutsAtWord / m.cuts, recall: m.found / m.boundaries, whole: m.whole / m.words,
    clean: m.cleanPieces / m.pieceCount, coverage: m.pieceLetters / m.allLetters, perLetter: m.cost / m.allLetters, samples: m.samples, top: [...m.used].sort((a, b) => b[1] - a[1]).slice(0, 25) };
  return { results, chance: boundaryPositions / positions, formed, restFormed, held: pieces.size, rejected, heat: hotLetters.tenths.map((x) => x.all ? x.hot / x.all : 0), pieces };
}


// ---------------------------------------------------------------- C121: a majority register with a minority stretch
let REGISTER = [];
const buster = cutText(fs.readFileSync(path.join(DIR, 'burgess-busterbrown.txt'), 'latin1'), 'sentences');
const kjv = cutText(fs.readFileSync(path.join(DIR, 'bible-kjv.txt'), 'latin1'), 'sentences');
const learnSegs = [...buster.slice(0, 400), ...kjv.slice(0, 250), ...buster.slice(400, 900)];
const unseen = [...buster.slice(900), ...kjv.slice(250, 400)];
const segs = [...learnSegs, ...unseen];
REGISTER = [...learnSegs.map(() => 'learnt'), ...buster.slice(900).map(() => 'majority (Buster Brown)'), ...kjv.slice(250, 400).map(() => 'minority (King James)')];
const join = (ss) => ss.map((x) => x.w).join('');
const busterText = buster.slice(0, 900).map(join).join('|');
const minorityText = kjv.slice(0, 250).map(join).join('|');
const MARKERS = ['thee', 'thou', 'hath', 'unto', 'saith', 'shall', 'lord', 'said', 'god', 'waters', 'earth', 'begat'];
console.log(`learnt from: ${learnSegs.length} sentences (Buster Brown 1-400, King James 1-250, Buster Brown 401-900); unseen: ${buster.length - 900} Buster Brown, 150 King James`);
for (const LOCAL of [false, true]) {
  const t0 = Date.now();
  const r = run(segs, false, 16384, 0, true, true, LOCAL, learnSegs.length);
  console.log('\n' + '='.repeat(110) + `\n${LOCAL ? 'local energy' : 'global energy (C118)'}  (${((Date.now() - t0) / 1000).toFixed(0)} s; ${r.held} patterns held, ${r.formed} formed, ${r.rejected} not kept by the energy rule)\n` + '='.repeat(110));
  const held = [...r.pieces.keys()];
  const minorityOnly = held.filter((p) => minorityText.includes(p) && !busterText.includes(p));
  const majorityOnly = held.filter((p) => busterText.includes(p) && !minorityText.includes(p));
  console.log(`patterns found only in the minority stretch: ${minorityOnly.length}; only in the majority: ${majorityOnly.length}; in both: ${held.length - minorityOnly.length - majorityOnly.length}`);
  const short = minorityOnly.filter((p) => p.length <= 6).sort((a, b) => a.length - b.length).slice(0, 40);
  console.log(`  shortest minority-only patterns: ${short.join(' ')}`);
  for (const w of MARKERS) {
    const own = r.pieces.has(w);
    const inside = held.filter((p) => p !== w && p.includes(w)).length;
    console.log(`  ${pad(w, 7)} ${own ? 'held as a pattern' : 'not a pattern of its own'}; inside ${inside} other patterns`);
  }
  for (const [reg, m] of Object.entries(r.results)) {
    if (reg === 'learnt') continue;
    console.log(`  ${pad(reg, 26)} clean ${pad(pct(m.clean), 5)} coverage ${pad(pct(m.coverage), 5)} cost per letter ${m.perLetter.toFixed(3)} words whole ${pct(m.whole)}`);
    for (const smp of m.samples.slice(0, 3)) console.log(`      ${smp}`);
  }
}
