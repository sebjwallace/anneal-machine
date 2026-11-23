// C115 · Rest. (C114's differentiate.js with a rest phase: held pieces compared with each other.)
// Utterances held whole and split only by comparison with what is held (anneal's shapes: the shared run, what varies
// before and after it). No chunking. See hypothesis.md.
//
// The books: gutenberg.zip from https://github.com/nltk/nltk_data (packages/corpora), unzipped.
// Run: node rest.js <folder with the .txt files>

'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2];
if (!DIR) { console.error('usage: node rest.js <folder>'); process.exit(1); }
const BOOKS = [
  { name: 'Buster Brown', file: 'burgess-busterbrown.txt' },
  { name: 'Alice', file: 'carroll-alice.txt' },
];
const SIZES = [16384];
const RESTS = [0, 100, 400]; // rest after every R utterances; 0: no rest (C114)
const COMPARE_AT_MOST = 40; // pieces compared per step: those sharing the most three-letter runs (a given, for speed)

const pad = (s, n) => (String(s).length >= n ? String(s) : String(s) + ' '.repeat(n - String(s).length));
const pct = (x) => (100 * x).toFixed(0) + '%';

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

function run(utts, spaces, N, R) {
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
  const add = (t) => {
    if (t.length < 2 || pieces.has(t)) return;
    if (pieces.size >= N) { // store away the least used (the oldest on a tie)
      let worst = null;
      for (const [k, v] of pieces) if (!worst || v.uses < worst[1].uses || (v.uses === worst[1].uses && v.born < worst[1].born)) worst = [k, v];
      pieces.delete(worst[0]);
      for (const g of triOf(worst[0])) tri.get(g)?.delete(worst[0]);
      storedAway++;
    }
    pieces.set(t, { uses: 0, born: clock++ });
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
    add(shared);
    add(p.slice(0, s.j)); add(p.slice(s.j + s.len));
    const before = u.slice(0, s.i), after = u.slice(s.i + s.len);
    add(before); add(after);
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

  const measureFrom = Math.floor(texts.length * 0.9);
  for (let k = 0; k < measureFrom; k++) {
    const u = texts[k];
    differentiate(u);
    add(u); // the utterance itself, stored whole
    if (R && (k + 1) % R === 0) rest();
    // credit what reading would use, so storage keeps what is used (every 50 utterances, for speed)
    if (k % 50 === 0) { const idx = byFirst2(); for (const t of texts.slice(Math.max(0, k - 50), k + 1)) for (const p of read(t, idx)) if (p.length > 1) pieces.get(p).uses++; }
  }

  // measure: read the last tenth with what is held (learning still on, as it streams)
  let cuts = 0, cutsAtWord = 0, boundaries = 0, found = 0, words = 0, whole = 0, positions = 0, boundaryPositions = 0;
  const used = new Map();
  const samples = [];
  let pieceCount = 0, cleanPieces = 0, pieceLetters = 0, allLetters = 0;
  for (let k = measureFrom; k < texts.length; k++) {
    const u = texts[k];
    const idx = byFirst2();
    const parts = read(u, idx);
    // true word boundaries, as positions between letters in u
    const wb = new Set();
    let at = 0;
    for (let w = 0; w < utts[k].length - 1; w++) { at += utts[k][w].length; if (spaces) { wb.add(at); wb.add(at + 1); at += 1; } else wb.add(at); }
    // cuts made
    const cutSet = new Set();
    at = 0;
    for (let j = 0; j < parts.length - 1; j++) { at += parts[j].length; cutSet.add(at); }
    for (const c of cutSet) { cuts++; if (wb.has(c)) cutsAtWord++; }
    const realGaps = utts[k].length - 1;
    boundaries += realGaps;
    // a gap is found if there is a cut at it (with spaces: at either side of the space)
    at = 0;
    for (let w = 0; w < realGaps; w++) { at += utts[k][w].length; if (cutSet.has(at) || (spaces && cutSet.has(at + 1))) found++; if (spaces) at += 1; }
    for (let p = 1; p < u.length; p++) { positions++; if (wb.has(p)) boundaryPositions++; }
    // words read whole
    at = 0;
    const starts = new Map(); let a2 = 0;
    for (const p of parts) { starts.set(a2, p); a2 += p.length; }
    for (const w of utts[k]) {
      words++;
      const s = at, e = at + w.length;
      const p = starts.get(s) ?? (spaces ? starts.get(s - 1) : undefined);
      if (p) {
        const ps = starts.has(s) && starts.get(s) === p ? s : s - 1;
        const pe = ps + p.length;
        if (pe === e || (spaces && pe === e + 1)) whole++;
      }
      at = e + (spaces ? 1 : 0);
    }
    for (const p of parts) if (p.length > 1) used.set(p, (used.get(p) || 0) + 1);
    // pieces: both edges at a word boundary (or the utterance's own start or end); with spaces, next to a space counts
    const edgeOk = (pos) => pos === 0 || pos === u.length || wb.has(pos);
    let a3 = 0;
    for (const p of parts) {
      if (p.length > 1) { pieceCount++; pieceLetters += p.length; if (edgeOk(a3) && edgeOk(a3 + p.length)) cleanPieces++; }
      a3 += p.length;
    }
    allLetters += u.length;
    if (samples.length < 6 && u.length > 30 && u.length < 90) samples.push(parts.map((p) => (p.length === 1 ? p : `[${p}]`)).join(''));
    differentiate(u); add(u);
    if (R && (k + 1) % R === 0) rest();
  }
  const top = [...used].sort((a, b) => b[1] - a[1]).slice(0, 30);
  return { precision: cutsAtWord / cuts, chance: boundaryPositions / positions, recall: found / boundaries, whole: whole / words,
    formed, restFormed, storedAway, held: pieces.size, top, samples, order, clean: cleanPieces / pieceCount, coverage: pieceLetters / allLetters };
}

for (const b of BOOKS) {
  const utts = utterances(fs.readFileSync(path.join(DIR, b.file), 'latin1'));
  console.log('\n' + '='.repeat(110) + `\n${b.name}: ${utts.length} utterances\n` + '='.repeat(110));
  for (const spaces of [false, true]) for (const N of SIZES) for (const R of RESTS) {
    const t0 = Date.now();
    const r = run(utts, spaces, N, R);
    console.log(`\n${spaces ? 'with spaces' : 'without spaces'}, N ${N}, ${R ? 'rest every ' + R : 'no rest (C114)'}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    console.log(`  cuts at a word boundary ${pct(r.precision)} (chance ${pct(r.chance)}); word boundaries found ${pct(r.recall)}; words read whole ${pct(r.whole)}`);
    console.log(`  pieces read with both edges at word boundaries ${pct(r.clean)}; text covered by pieces ${pct(r.coverage)}`);
    console.log(`  pieces formed ${r.formed} (${r.restFormed} at rest), stored away ${r.storedAway}, held ${r.held}`);
    console.log(`  first pieces formed: ${r.order.slice(0, 25).join('  ')}`);
    console.log(`  most used: ${r.top.map(([p, n]) => `${p}(${n})`).join(' ')}`);
    for (const s of r.samples) console.log(`  reads: ${s}`);
  }
}
