// C123 · The engine reads a buffer. As C122, but the engine reads each buffer whole (readBuffer, the change made to
// the engine copy), not one letter a moment. See hypothesis.md.
//
// The books: gutenberg.zip from https://github.com/nltk/nltk_data (packages/corpora), unzipped.
// Run: node buffer.js <folder with the .txt files> [book file] [members per letter] [refractory on|off]
//      (LIMIT=n in the environment uses only the book's first n sentences)

'use strict';
const fs = require('fs');
const path = require('path');
const { Memory, STATE } = require('./engine.js');

const DIR = process.argv[2];
const FILE = process.argv[3] || 'burgess-busterbrown.txt';
const SIZE = Number(process.argv[4] || 8);
const REFRACTORY = (process.argv[5] || 'off') === 'on';
if (!DIR && require.main === module) { console.error('usage: node buffer.js <folder> [book] [members per letter] [refractory on|off]'); process.exit(1); }

const pct = (x) => (100 * x).toFixed(0) + '%';
const pad = (s, n) => (String(s).length >= n ? String(s) : String(s) + ' '.repeat(n - String(s).length));

function sentences(raw) {
  return raw.split(/[.!?;:]+/).map((s) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').filter(Boolean)).filter((w) => w.length);
}

function run(utts, ENERGY) {
  const texts = utts.map((ws) => ws.join(''));
  const mem = new Memory();
  mem.setRefractoryPeriod(REFRACTORY);
  for (const l of 'abcdefghijklmnopqrstuvwxyz') mem.declarePopulation(l, SIZE);
  const A = 26;
  const link = 1 + Math.log2(16384) / Math.log2(A);

  // held states by their letters, for choosing a partner and for the energy rule's count
  const lettersOfA = new Map(); // assembly id -> letter string (states only)
  const tri = new Map(); // three-letter run -> Set(assembly id)
  let indexed = 0;
  const indexNew = () => {
    for (; indexed < mem.assemblies.length; indexed++) {
      const a = mem.assemblies[indexed];
      if (a.shape !== STATE || a.members.length < 2) continue;
      const s = mem.lettersOf(a.members).join('');
      lettersOfA.set(a.id, s);
      for (let i = 0; i + 3 <= s.length; i++) { const g = s.slice(i, i + 3); if (!tri.has(g)) tri.set(g, new Set()); tri.get(g).add(a.id); }
    }
  };
  const keep = ENERGY ? (letters) => {
    const t = letters.join('');
    let k = 0;
    if (t.length >= 3) { for (const id of tri.get(t.slice(0, 3)) || []) if (lettersOfA.get(id).includes(t)) k++; }
    else for (const s of lettersOfA.values()) if (s.includes(t)) k++;
    return k * (t.length - link) > t.length + 1e-9;
  } : null;

  // read: the whole buffer at once (readBuffer); units are the pieces read and the loose letters
  const read = (u) => {
    const { parts } = mem.readBuffer([...u], link);
    return { units: parts.map((p) => (typeof p === 'string' ? p : p.text)) };
  };

  const partnerFor = (members, exclude) => {
    const s = mem.lettersOf(members).join('');
    const score = new Map();
    for (let i = 0; i + 3 <= s.length; i++) for (const id of tri.get(s.slice(i, i + 3)) || []) if (!exclude.has(id)) score.set(id, (score.get(id) || 0) + 1);
    let best = null;
    for (const [id] of [...score].sort((a, b) => b[1] - a[1]).slice(0, 40)) {
      const r = Memory.longestSharedRun([mem.lettersOf(members), mem.lettersOf(mem.assemblies[id - 1].members)]);
      if (r.length >= 2 && (!best || r.length > best.len)) best = { id, len: r.length };
    }
    return best;
  };
  const differentiate = (members, exclude, depth = 0) => {
    if (members.length < 2 || depth > 30) return;
    indexNew();
    const p = partnerFor(members, exclude);
    if (!p) return;
    const r = mem.anneal([members, mem.assemblies[p.id - 1].members], keep);
    if (!r) return;
    const w = r.wholes[0];
    differentiate(members.slice(0, w.at), exclude, depth + 1);
    differentiate(members.slice(w.at + w.length), exclude, depth + 1);
  };

  const learnFrom = (u, parts) => {
    // hot stretches: runs of two or more loose letters
    let at = 0, run = '';
    const hot = [];
    for (const p of parts) { if (p.length === 1) run += p; else { if (run.length >= 2) hot.push(run); run = ''; } at += p.length; }
    if (run.length >= 2) hot.push(run);
    for (const h of hot) {
      const [s] = mem.declareWord([...h]);
      indexNew();
      differentiate(s.members, new Set([s.id]));
    }
  };

  const measureFrom = Math.floor(texts.length * 0.9);
  const tenths = Array.from({ length: 10 }, () => ({ loose: 0, letters: 0 }));
  const t0 = Date.now();
  for (let k = 0; k < measureFrom; k++) {
    const u = texts[k];
    const { units } = read(u);
    const t = tenths[Math.min(9, Math.floor((10 * k) / measureFrom))];
    t.letters += u.length;
    t.loose += units.filter((p) => p.length === 1).length;
    learnFrom(u, units);
  }
  const learnTime = (Date.now() - t0) / 1000;

  // measure the unseen tenth: no learning
  let cuts = 0, cutsAtWord = 0, positions = 0, boundaryPositions = 0, words = 0, whole = 0, pieces = 0, clean = 0, pieceLetters = 0, letters = 0;
  const used = new Map();
  const samples = [];
  for (let k = measureFrom; k < texts.length; k++) {
    const u = texts[k];
    const { units } = read(u);
    const wb = new Set();
    let at = 0;
    for (let w = 0; w < utts[k].length - 1; w++) { at += utts[k][w].length; wb.add(at); }
    for (let p = 1; p < u.length; p++) { positions++; if (wb.has(p)) boundaryPositions++; }
    at = 0;
    const starts = new Map();
    for (let j = 0; j < units.length; j++) {
      const p = units[j];
      starts.set(at, p);
      if (j > 0) { cuts++; if (wb.has(at)) cutsAtWord++; }
      if (p.length > 1) { pieces++; pieceLetters += p.length; if (wb.has(at) && wb.has(at + p.length)) clean++; used.set(p, (used.get(p) || 0) + 1); }
      at += p.length;
    }
    letters += u.length;
    at = 0;
    for (const w of utts[k]) { words++; if (starts.get(at) === w) whole++; at += w.length; }
    if (samples.length < 8 && u.length > 30 && u.length < 90) samples.push(units.map((p) => (p.length === 1 ? p : `[${p}]`)).join(''));
  }
  run.last = { mem, read };
  return { clean: clean / pieces, coverage: pieceLetters / letters, whole: whole / words, precision: cutsAtWord / cuts, chance: boundaryPositions / positions,
    assemblies: mem.assemblies.length, tenths, learnTime, samples, top: [...used].sort((a, b) => b[1] - a[1]).slice(0, 30) };
}

module.exports = { run, sentences };
if (require.main === module) {
const utts = sentences(fs.readFileSync(path.join(DIR, FILE), 'latin1')).slice(0, Number(process.env.LIMIT || Infinity));
console.log(`${FILE}: ${utts.length} sentences; ${SIZE} members per letter; refractory ${REFRACTORY ? 'on' : 'off'}; learnt on nine tenths, read on the last tenth`);
for (const ENERGY of [true, false]) {
  const r = run(utts, ENERGY);
  console.log(`\n--- ${ENERGY ? 'with the energy rule' : 'without the energy rule (anneal forms everything, as on main)'}  (learning ${r.learnTime.toFixed(0)} s; ${r.assemblies} assemblies)`);
  console.log(`  clean ${pct(r.clean)}  coverage ${pct(r.coverage)}  words whole ${pct(r.whole)}  cuts at a word boundary ${pct(r.precision)} (chance ${pct(r.chance)})`);
  console.log(`  loose letters by tenth while learning: ${r.tenths.map((t) => pct(t.loose / t.letters)).join(' ')}`);
  console.log(`  most read units: ${r.top.map(([p, n]) => `${p}(${n})`).join(' ')}`);
  for (const s of r.samples) console.log(`  reads: ${s}`);
}
}
