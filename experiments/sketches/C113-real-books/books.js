// C113 · Real books.
// The best mechanisms from C106 to C112, on public-domain books streamed once. See hypothesis.md.
//
// The books: gutenberg.zip from https://github.com/nltk/nltk_data (packages/corpora), unzipped.
// Run: node books.js <folder with the .txt files>          (as in out.txt)
//      node books.js <folder> quick                         (main settings only)

'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2];
const QUICK = process.argv.includes('quick');
if (!DIR) { console.error('usage: node books.js <folder with the gutenberg .txt files> [quick]'); process.exit(1); }

const BOOKS = [
  { name: 'Buster Brown', file: 'burgess-busterbrown.txt' },
  { name: 'Alice', file: 'carroll-alice.txt' },
  { name: 'Bryant', file: 'bryant-stories.txt' },
  { name: 'Emma (first 300,000)', file: 'austen-emma.txt', limit: 300000 },
];
const PREFIX = 40000;
const SIZES = QUICK ? [[4096, 4096]] : [[1024, 1024], [1024, 4096], [4096, 1024], [4096, 4096]];
const MAIN = [4096, 4096];

const clean = (t) => t.toLowerCase().replace(/[^a-z]+/g, ' ').trim().replace(/ /g, '_') + '_';
const pad = (s, n) => (String(s).length >= n ? String(s) : String(s) + ' '.repeat(n - String(s).length));
const pct = (x) => (100 * x).toFixed(0) + '%';
const isLetter = (c) => c !== undefined && c !== '_';

// ---------------------------------------------------------------- a set of pieces, indexed by their first two letters

class Index {
  constructor() { this.by = new Map(); }
  add(p) { const k = p.slice(0, 2); if (!this.by.has(k)) this.by.set(k, new Set()); this.by.get(k).add(p); }
  delete(p) { this.by.get(p.slice(0, 2))?.delete(p); }
  longestAt(s, i) {
    const set = this.by.get(s.slice(i, i + 2));
    let best = null;
    if (set) for (const p of set) if ((!best || p.length > best.length) && s.startsWith(p, i)) best = p;
    return best;
  }
  allAt(s, i) {
    const set = this.by.get(s.slice(i, i + 2));
    const out = [];
    if (set) for (const p of set) if (s.startsWith(p, i)) out.push(p);
    return out;
  }
}

// ---------------------------------------------------------------- streaming (C110 greedy; C112 compete and ways)

function stream(text, mode, T, N) {
  const A = new Set(text).size;
  const use = 1 + Math.log2(N) / Math.log2(A);
  const lasting = new Set(), lastIdx = new Index(), ways = new Map();
  const seen = new Map(), buckets = new Map(), tentIdx = new Index(); // the pool: text -> sightings; by sightings
  let full = false, nucleated = 0;
  const measureFrom = Math.floor(text.length * 0.9);
  const measured = [];
  const tenths = Array.from({ length: 10 }, () => ({ loose: 0, chars: 0 }));

  const bucket = (s) => { if (!buckets.has(s)) buckets.set(s, new Set()); return buckets.get(s); };
  const spell = (t) => {
    const c = new Array(t.length + 1).fill(0);
    for (let j = t.length - 1; j >= 0; j--) {
      c[j] = 1 + c[j + 1];
      for (const p of lastIdx.allAt(t, j)) c[j] = Math.min(c[j], use + c[j + p.length]);
    }
    return c[0];
  };
  const drop = (key) => { const s = seen.get(key); buckets.get(s).delete(key); seen.delete(key); if (s >= 2) tentIdx.delete(key); };
  const bump = (key) => {
    const s = seen.get(key);
    buckets.get(s).delete(key); bucket(s + 1).add(key); seen.set(key, s + 1);
    if (s + 1 === 2) tentIdx.add(key);
    const b = spell(key), k = s + 1;
    if (k * b > b + k * use + 1e-9) {
      if (lasting.size >= N) { full = true; return; }
      drop(key); lasting.add(key); lastIdx.add(key); ways.set(key, k); nucleated++;
    }
  };
  const touch = (key) => {
    if (lasting.has(key)) return;
    if (!seen.has(key)) {
      if (seen.size >= T) { for (let s = 1; ; s++) { const b = buckets.get(s); if (b && b.size) { drop(b.values().next().value); break; } } }
      seen.set(key, 0); bucket(0).add(key);
    }
    bump(key);
  };

  const waysOf = (p) => (lasting.has(p) ? ways.get(p) : seen.get(p) ?? 0);
  const supportOf = (p) => (mode === 'ways' ? waysOf(p) : p.length * 1e9 + waysOf(p));
  const wholeAt = (j) => {
    const a = lastIdx.longestAt(text, j), b = tentIdx.longestAt(text, j);
    return !a ? b : !b ? a : b.length > a.length ? b : a;
  };
  const heldTie = new Set();

  let prev = null;
  for (let i = 0; i < text.length; ) {
    let unit = text[i];
    if (mode === 'greedy') {
      const w = wholeAt(i);
      if (w) unit = w;
    } else {
      const memo = new Map(), sm = new Map();
      const whole = (j) => { if (!memo.has(j)) memo.set(j, wholeAt(j)); return memo.get(j); };
      const status = (j, depth = 0) => {
        if (sm.has(j)) return sm.get(j);
        const c = whole(j);
        if (!c) { sm.set(j, 'none'); return 'none'; }
        sm.set(j, 'wins');
        let out = 'wins';
        for (let k = j + 1; k < j + c.length; k++) {
          const r = whole(k);
          if (!r || k + r.length <= j + c.length) continue;
          if (supportOf(r) < supportOf(c)) continue;
          if (depth < 40 && status(k, depth + 1) === 'beaten') continue;
          if (supportOf(r) > supportOf(c)) { out = 'beaten'; break; }
          out = 'tie';
        }
        sm.set(j, out);
        return out;
      };
      const s = status(i);
      if (s === 'wins' && !heldTie.has(i)) unit = whole(i);
      if (s === 'tie') {
        const c = whole(i);
        for (let k = i + 1; k < i + c.length; k++) { const r = whole(k); if (r && supportOf(r) === supportOf(c) && k + r.length > i + c.length) heldTie.add(k); }
      }
      heldTie.delete(i);
    }
    const start = i;
    i += unit.length;
    if (start >= measureFrom) measured.push({ u: unit, at: start });
    const t = tenths[Math.min(9, Math.floor((10 * start) / text.length))];
    t.chars += unit.length;
    if (unit.length === 1) t.loose++;
    if (unit.length > 1) { if (seen.has(unit)) bump(unit); else if (lasting.has(unit)) ways.set(unit, ways.get(unit) + 1); }
    if (prev !== null) touch(prev + unit);
    prev = unit;
  }
  return { measured, measureFrom, tenths, lasting, full, nucleated, use };
}

// ---------------------------------------------------------------- G: the global rule at rest (C108 with a fixed price)

function global(text, N) {
  const A = new Set(text).size;
  const use = 1 + Math.log2(N) / Math.log2(A);
  const pieces = []; // bodies: arrays of symbols (letters or piece numbers)
  let s = [...text];
  const cost = (sym) => (typeof sym === 'number' ? use : 1);
  const len = (sym) => (typeof sym === 'number' ? pieces[sym].len : 1);
  for (;;) {
    const counts = new Map();
    for (let i = 0; i < s.length; i++) {
      let letters = 0;
      for (let m = 1; m <= 8 && i + m <= s.length; m++) {
        letters += len(s[i + m - 1]);
        if (letters > 16) break;
        if (m < 2) continue;
        const key = s.slice(i, i + m).join(',');
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    // rank by an upper bound (overlapping count), then check the best exactly (non-overlapping)
    const ranked = [];
    for (const [key, n] of counts) {
      if (n < 2) continue;
      const run = key.split(',').map((x) => (/^\d+$/.test(x) ? Number(x) : x));
      const b = run.reduce((a, x) => a + cost(x), 0);
      const up = n * b - b - n * use;
      if (up > 0) ranked.push({ run, b, up });
    }
    ranked.sort((a, c) => c.up - a.up);
    let best = null;
    for (const cand of ranked.slice(0, 200)) {
      if (best && cand.up <= best.saving) break;
      let k = 0;
      for (let i = 0; i + cand.run.length <= s.length; ) {
        if (cand.run.every((x, j) => s[i + j] === x)) { k++; i += cand.run.length; } else i++;
      }
      const saving = k * cand.b - cand.b - k * use;
      if (saving > 1e-9 && (!best || saving > best.saving)) best = { ...cand, saving };
    }
    if (!best || pieces.length >= N) break;
    const id = pieces.length;
    pieces.push({ body: best.run, len: best.run.reduce((a, x) => a + len(x), 0) });
    const out = [];
    for (let i = 0; i < s.length; ) {
      if (i + best.run.length <= s.length && best.run.every((x, j) => s[i + j] === x)) { out.push(id); i += best.run.length; } else out.push(s[i++]);
    }
    s = out;
  }
  const expand = (sym) => (typeof sym === 'number' ? pieces[sym].body.map(expand).join('') : sym);
  const measureFrom = Math.floor(text.length * 0.9);
  const measured = [];
  let at = 0;
  for (const sym of s) { const u = expand(sym); if (at >= measureFrom) measured.push({ u, at }); at += u.length; }
  return { measured, measureFrom, lasting: new Set(pieces.map((p, i) => expand(i))), full: pieces.length >= N };
}

// ---------------------------------------------------------------- measures

function measure(text, r) {
  const units = r.measured;
  const multi = units.filter(({ u }) => u.length > 1);
  const inside = multi.filter(({ u, at }) => (isLetter(text[at - 1]) && isLetter(u[0])) || (isLetter(text[at + u.length]) && isLetter(u.at(-1))));
  const loose = units.filter(({ u }) => u.length === 1 && u !== '_').length;
  const letters = units.reduce((a, { u }) => a + [...u].filter((c) => c !== '_').length, 0);
  // unit boundaries, for words read whole
  const starts = new Map();
  for (const x of units) starts.set(x.at, x);
  let words = 0, whole = 0, clean = 0;
  // words in the measured part
  let i = r.measureFrom;
  while (i < text.length && text[i] !== '_') i++;
  // units covering each position
  const cover = new Map();
  for (const x of units) for (let p = x.at; p < x.at + x.u.length; p++) cover.set(p, x);
  for (; i < text.length; ) {
    while (i < text.length && text[i] === '_') i++;
    const ws = i;
    while (i < text.length && text[i] !== '_') i++;
    const we = i;
    if (we <= ws || we >= text.length) continue;
    words++;
    const a = cover.get(ws), b = cover.get(we - 1);
    if (a && a === b) {
      const s0 = a.at, e0 = a.at + a.u.length;
      const startClean = s0 === 0 || text[s0 - 1] === '_' || text[s0] === '_';
      const endClean = e0 >= text.length || text[e0] === '_' || text[e0 - 1] === '_';
      const edgesClean = startClean && endClean;
      const onlyThis = s0 >= ws - 1 && e0 <= we + 1;
      if (onlyThis) whole++;
      if (edgesClean) clean++;
    }
  }
  // boundary precision: of the cuts made between units, the share that fall at a word gap (next to a space);
  // chance: the share of all positions in the measured part that are next to a space
  let cuts = 0, atGap = 0, positions = 0, gapPositions = 0;
  for (let j = 1; j < units.length; j++) {
    const p = units[j].at;
    cuts++;
    if (text[p - 1] === '_' || text[p] === '_') atGap++;
  }
  for (let p = r.measureFrom + 1; p < text.length; p++) { positions++; if (text[p - 1] === '_' || text[p] === '_') gapPositions++; }
  const counts = new Map();
  for (const { u } of multi) counts.set(u, (counts.get(u) || 0) + 1);
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 30);
  return { words, whole: whole / words, clean: clean / words, inside: multi.length ? inside.length / multi.length : 0,
    loose: loose / letters, top, pieces: r.lasting.size, full: r.full, precision: atGap / cuts, chance: gapPositions / positions };
}

const sample = (text, r, from, n = 300) =>
  r.measured.filter(({ at }) => at >= from && at < from + n).map(({ u }) => (u.length === 1 ? u : `[${u}]`)).join('');

function line(label, m) {
  return `  ${pad(label, 34)} words whole ${pad(pct(m.whole), 5)} inside a clean piece ${pad(pct(m.clean), 5)} ` +
    `pieces cutting inside a word ${pad(pct(m.inside), 5)} cuts at a word gap ${pad(pct(m.precision), 5)} (chance ${pct(m.chance)}) letters loose ${pad(pct(m.loose), 5)} lasting ${m.pieces}${m.full ? ' (full)' : ''}`;
}

// ---------------------------------------------------------------- report

const MODES = [['greedy', 'greedy (C110)'], ['compete', 'compete, length then ways (C112)'], ['ways', 'ways in (C112)']];
const books = BOOKS.map((b) => {
  let t = clean(fs.readFileSync(path.join(DIR, b.file), 'latin1'));
  if (b.limit) t = t.slice(0, b.limit);
  return { ...b, text: t };
});

console.log('='.repeat(110) + `\nlike for like: the first ${PREFIX} characters, measured on their last tenth; population ${MAIN[1]}\n` + '='.repeat(110));
for (const b of books.slice(0, 2)) {
  const t = b.text.slice(0, PREFIX);
  console.log(`\n${b.name}`);
  const t0 = Date.now();
  const g = global(t, MAIN[1]);
  const mg = measure(t, g);
  console.log(line('G, global at rest (C108)', mg) + `   (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  for (const [mode, label] of MODES) console.log(line(label, measure(t, stream(t, mode, MAIN[0], MAIN[1]))));
  console.log(`  G reads: ${sample(t, g, g.measureFrom + 200)}`);
  console.log(`  G's most used: ${mg.top.map(([u, n]) => `${u}(${n})`).join(' ')}`);
}

console.log('\n' + '='.repeat(110) + '\nwhole books, streamed once, measured on the last tenth\n' + '='.repeat(110));
for (const b of books) {
  console.log(`\n${b.name}: ${b.text.length} characters`);
  for (const [mode, label] of MODES) {
    for (const [T, N] of SIZES) {
      const r = stream(b.text, mode, T, N);
      const m = measure(b.text, r);
      console.log(line(`${label}, T ${T} N ${N}`, m));
      if (T === MAIN[0] && N === MAIN[1]) {
        console.log(`    loose letters by tenth: ${r.tenths.map((x) => pct(x.loose / x.chars)).join(' ')}`);
        console.log(`    reads: ${sample(b.text, r, r.measureFrom + 200)}`);
        console.log(`    most used: ${m.top.map(([u, n]) => `${u}(${n})`).join(' ')}`);
      }
    }
  }
}
