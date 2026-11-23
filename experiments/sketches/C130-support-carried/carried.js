// C130 · Support carried (D-03, V1b). C129's reading by bonds, choosing between completions three ways: the cheapest
// description computed ('settle', C129), the engine's competition once over the sentence ('compete', C129), and the
// engine's competition with support in the currency and carried from moment to moment ('carry').
//
// C129 · Reading by bonds (D-03, V1, V2 and V6). C128's learning, with reading done three ways: by the index of pieces
// (readBuffer, as C128), or by the chains' own bonds as letters arrive (readByBonds), choosing between overlapping
// completions either by the cheapest description of the whole buffer ('settle') or by the engine's competition
// ('compete'). With bonds, a hot stretch is seen again when one of this reading's own completions covers exactly it,
// not by looking its text up.
//
// C128 · No search limits (D-03 step 1, V7). C127's final learning (spelled pieces, credited once), run with and
// without the two limits on the search: the top 40 candidate partners, and recursion stopping at depth 30.
//
// C127 · Spelled pieces. C126 (seen again, cost as surprise, energy reported), with the audit's fixes:
// - SPELLED: only a state spelled by a chain is a piece (the engine's change), and everything the experiment does with
//   held patterns (partners, the energy rule's count, seen again, memory) uses the piece's spelled text and its chain;
//   a hot stretch is annealed by its chain, so a long one keeps its repeated letters.
// - ONCE: a hot stretch counted as seen again is credited as the piece instead of as its letters, not as both.
// See hypothesis.md.
//
// The books: gutenberg.zip from https://github.com/nltk/nltk_data (packages/corpora), unzipped.
// Run: node carried.js <folder with the .txt files> [book file] [members per letter] [refractory on|off]
//      (LIMIT=n in the environment uses only the book's first n sentences)

'use strict';
const fs = require('fs');
const path = require('path');
const { Memory, STATE } = require('./engine.js');

const DIR = process.argv[2];
const FILE = process.argv[3] || 'burgess-busterbrown.txt';
const SIZE = Number(process.argv[4] || 8);
const REFRACTORY = (process.argv[5] || 'off') === 'on';
if (!DIR && require.main === module) { console.error('usage: node carried.js <folder> [book] [members per letter] [refractory on|off]'); process.exit(1); }

const pct = (x) => (100 * x).toFixed(0) + '%';
const pad = (s, n) => (String(s).length >= n ? String(s) : String(s) + ' '.repeat(n - String(s).length));

function sentences(raw) {
  return raw.split(/[.!?;:]+/).map((s) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').filter(Boolean)).filter((w) => w.length);
}

function run(utts, ENERGY, PRICING = 'surprise', FIX = true, SPELLED = true, ONCE = true, LIMITS = false, READ = 'index') {
  const texts = utts.map((ws) => ws.join(''));
  const mem = new Memory({ spelled: SPELLED });
  mem.setRefractoryPeriod(REFRACTORY);
  for (const l of 'abcdefghijklmnopqrstuvwxyz') mem.declarePopulation(l, SIZE);
  const A = 26;
  const link = PRICING === 'naming' ? Math.log2(16384) / Math.log2(A) : 1 + Math.log2(16384) / Math.log2(A);
  // cost as surprise: uses of each letter and piece, counted from the structure (+1 each, the usual smoothing)
  let seenAgain = 0;
  const uses = new Map();
  let total = 0;
  const useOnce = (t, n = 1) => { uses.set(t, (uses.get(t) || 0) + n); total += n; };
  const L = Math.log2(A);
  const surprise = (t) => Math.log2((total + uses.size + 1) / ((uses.get(t) || 0) + 1)) / L;
  const price = PRICING === 'surprise' ? surprise : link;

  // held states by their letters, for choosing a partner and for the energy rule's count
  const lettersOfA = new Map(); // assembly id -> letter string (states only)
  const tri = new Map(); // three-letter run -> Set(assembly id)
  let indexed = 0;
  const indexOne = (a) => {
      if (a.shape !== STATE || a.spelled === undefined || lettersOfA.has(a.id)) return;
      const s = a.spelled;
      lettersOfA.set(a.id, s);
      for (let i = 0; i + 3 <= s.length; i++) { const g = s.slice(i, i + 3); if (!tri.has(g)) tri.set(g, new Set()); tri.get(g).add(a.id); }
  };
  const indexNew = () => {
    for (; indexed < mem.assemblies.length; indexed++) {
      const a = mem.assemblies[indexed];
      if (a.shape === 2 && a.members.length >= 2) { const st = mem.byExact.get(STATE + ':' + [...new Set(a.members)].join(',')); if (st) indexOne(st); }
      if (a.shape !== STATE || a.spelled === undefined) continue;
      const s = a.spelled;
      lettersOfA.set(a.id, s);
      for (let i = 0; i + 3 <= s.length; i++) { const g = s.slice(i, i + 3); if (!tri.has(g)) tri.set(g, new Set()); tri.get(g).add(a.id); }
    }
  };
  const keep = ENERGY ? (letters) => {
    const t = letters.join('');
    let k = 0;
    if (FIX) {
      const seenTexts = new Set();
      if (t.length >= 3) { for (const id of tri.get(t.slice(0, 3)) || []) { const s = lettersOfA.get(id); if (s.includes(t)) seenTexts.add(s); } }
      else for (const s of lettersOfA.values()) if (s.includes(t)) seenTexts.add(s);
      k = seenTexts.size;
    } else if (t.length >= 3) { for (const id of tri.get(t.slice(0, 3)) || []) if (lettersOfA.get(id).includes(t)) k++; }
    else for (const s of lettersOfA.values()) if (s.includes(t)) k++;
    if (PRICING === 'surprise') {
      const spell = [...t].reduce((a, l) => a + surprise(l), 0);
      const pointer = Math.log2((total + uses.size + 1) / (k + 1)) / L;
      return k * spell > spell + k * pointer + 1e-9;
    }
    return k * (t.length - link) > t.length + 1e-9;
  } : null;

  // read: the whole buffer at once (readBuffer); units are the pieces read and the loose letters
  const read = (u) => {
    if (READ === 'index') { const { parts } = mem.readBuffer([...u], price); return { units: parts.map((p) => (typeof p === 'string' ? p : p.text)), completions: null }; }
    const { parts, completions } = mem.readByBonds([...u], price, READ);
    return { units: parts.map((p) => (typeof p === 'string' ? p : p.text)), completions };
  };

  const partnerFor = (members, exclude) => {
    const s = mem.lettersOf(members).join('');
    const score = new Map();
    for (let i = 0; i + 3 <= s.length; i++) for (const id of tri.get(s.slice(i, i + 3)) || []) if (!exclude.has(id)) score.set(id, (score.get(id) || 0) + 1);
    let best = null;
    for (const [id] of LIMITS ? [...score].sort((a, b) => b[1] - a[1]).slice(0, 40) : [...score]) {
      const r = Memory.longestSharedRun([mem.lettersOf(members), mem.lettersOf(mem.assemblies[id - 1].chain)]);
      if (r.length >= 2 && (!best || r.length > best.len)) best = { id, len: r.length };
    }
    return best;
  };
  const differentiate = (members, exclude, depth = 0) => {
    if (members.length < 2 || (LIMITS && depth > 30)) return;
    indexNew();
    const p = partnerFor(members, exclude);
    if (!p) return;
    const r = mem.anneal([members, mem.assemblies[p.id - 1].chain], keep);
    if (!r) return;
    const credit = (piece) => { if (piece && piece.members.length >= 2 && !piece.skipped) useOnce(mem.lettersOf(piece.members).join('')); };
    credit(r.part);
    for (const w of r.wholes) { credit(w.before); credit(w.after); }
    const w = r.wholes[0];
    differentiate(members.slice(0, w.at), exclude, depth + 1);
    differentiate(members.slice(w.at + w.length), exclude, depth + 1);
  };

  const hots = [];
  const learnFrom = (u, parts, completions) => {
    // hot stretches: runs of two or more loose letters, with where each starts
    let at = 0, run = '', from = 0;
    const hot = [];
    for (const p of parts) { if (p.length === 1) { if (!run) from = at; run += p; } else { if (run.length >= 2) hot.push([run, from]); run = ''; } at += p.length; }
    if (run.length >= 2) hot.push([run, from]);
    for (const [h, start] of hot) {
      hots.push(h);
      const held = completions ? completions.some((c) => c.start === start && c.end === start + h.length) : mem.spelledByText.has(h);
      if (FIX && held) {
        if (ONCE) for (const l of h) { uses.set(l, uses.get(l) - 1); total--; } // read as letters, now known as the piece
        useOnce(h); seenAgain++; continue;
      }
      const [s, t] = mem.declareWord([...h]);
      indexNew();
      differentiate(SPELLED ? t.members : s.members, new Set([s.id]));
    }
  };

  const measureFrom = Math.floor(texts.length * 0.9);
  const tenths = Array.from({ length: 10 }, () => ({ loose: 0, letters: 0 }));
  const t0 = Date.now();
  for (let k = 0; k < measureFrom; k++) {
    const u = texts[k];
    const { units, completions } = read(u);
    const t = tenths[Math.min(9, Math.floor((10 * k) / measureFrom))];
    t.letters += u.length;
    t.loose += units.filter((p) => p.length === 1).length;
    for (const p of units) useOnce(p);
    learnFrom(u, units, completions);
  }
  const learnTime = (Date.now() - t0) / 1000;

  // measure the unseen tenth: no learning
  let theCount = 0, theInPiece = 0, looseUnseen = 0, unseenCost = 0;
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
    // how each "the" is read: inside one piece, or with any of its letters loose
    {
      let a = 0; const cover = [];
      for (const p of units) { for (let q = 0; q < p.length; q++) cover.push(p.length > 1 ? a : -1); a += p.length; }
      let pos = 0;
      for (const w of utts[k]) { if (w === 'the') { theCount++; const s0 = cover[pos]; if (s0 >= 0 && cover[pos + 1] === s0 && cover[pos + 2] === s0) theInPiece++; } pos += w.length; }
      looseUnseen += units.filter((p) => p.length === 1).length;
      unseenCost += units.reduce((a, p) => a + (typeof price === 'function' ? price(p) : (p.length === 1 ? 1 : price)), 0);
    }
    if (samples.length < 8 && u.length > 30 && u.length < 90) samples.push(units.map((p) => (p.length === 1 ? p : `[${p}]`)).join(''));
  }
  run.last = { mem, read };
  // memory: each different held pattern at its cheapest description by the others and letters, or its letters
  const patterns = new Set();
  for (const a of mem.assemblies) if (a.shape === STATE && a.spelled !== undefined) patterns.add(a.spelled);
  // phantoms: held patterns that never occurred, letters not found in any hot stretch
  const hotText = hots.join('|');
  let phantoms = 0, phantomLetters = 0, patternLetters = 0;
  for (const t of patterns) { patternLetters += t.length; if (!hotText.includes(t)) { phantoms++; phantomLetters += t.length; } }
  const pidx = new Map();
  for (const t of patterns) { const k2 = t.slice(0, 2); if (!pidx.has(k2)) pidx.set(k2, []); pidx.get(k2).push(t); }
  const costOf = (t) => (typeof price === 'function' ? price(t) : (t.length === 1 ? 1 : price));
  let memoryCost = 0;
  for (const t of patterns) {
    const n = t.length, c = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) { c[i] = costOf(t[i]) + c[i + 1]; for (const p of pidx.get(t.slice(i, i + 2)) || []) if (p !== t && t.startsWith(p, i)) c[i] = Math.min(c[i], costOf(p) + c[i + p.length]); }
    memoryCost += c[0];
  }
  let states = 0; for (const a of mem.assemblies) if (a.shape === STATE && a.spelled !== undefined) states++;
  return { heldTies: mem.heldTies || 0, phantoms, phantomLetters, patternLetters, memoryCost, unseenCost, perLetter: unseenCost / letters, patterns: patterns.size, repeats: states - patterns.size, seenAgain, theInPiece: theInPiece / theCount, looseUnseen: looseUnseen / letters, theCost: PRICING === 'surprise' ? surprise('the') : link, clean: clean / pieces, coverage: pieceLetters / letters, whole: whole / words, precision: cutsAtWord / cuts, chance: boundaryPositions / positions,
    assemblies: mem.assemblies.length, tenths, learnTime, samples, top: [...used].sort((a, b) => b[1] - a[1]).slice(0, 30) };
}

module.exports = { run, sentences };
if (require.main === module) {
const utts = sentences(fs.readFileSync(path.join(DIR, FILE), 'latin1')).slice(0, Number(process.env.LIMIT || Infinity));
console.log(`${FILE}: ${utts.length} sentences; ${SIZE} members per letter; cost as surprise; learnt on nine tenths, read on the last tenth; energy rule on`);
const configs = [
  ['bonds, choosing by the cheapest description computed (settle, C129)', 'settle'],
  ['bonds, choosing by the engine\'s competition once (compete, C129)', 'compete'],
  ['bonds, choosing by competition with support carried (carry)', 'carry'],
];
for (const [label, READ] of configs) {
  const r = run(utts, true, 'surprise', true, true, true, false, READ);
  console.log(`\n--- ${label}  (learning ${r.learnTime.toFixed(0)} s; ${r.assemblies} assemblies${READ === 'carry' ? `; ${r.heldTies} ties held` : ''})`);
  console.log(`  ${r.phantoms} held patterns never occurred (${r.phantomLetters} of ${r.patternLetters} letters held)`);
  console.log(`  energy ${(r.memoryCost + r.unseenCost).toFixed(0)} = memory ${r.memoryCost.toFixed(0)} + unseen ${r.unseenCost.toFixed(0)}; unseen costs ${r.perLetter.toFixed(3)} per letter`);
  console.log(`  ${r.patterns} different patterns held; ${r.repeats} stored states repeat letters already held; ${r.seenAgain} hot stretches counted as seen again`);
  console.log(`  "the" read inside a piece ${pct(r.theInPiece)}; letters read loose in the unseen tenth ${pct(r.looseUnseen)}`);
  console.log(`  clean ${pct(r.clean)}  coverage ${pct(r.coverage)}  words whole ${pct(r.whole)}  cuts at a word boundary ${pct(r.precision)} (chance ${pct(r.chance)})`);
  console.log(`  loose letters by tenth while learning: ${r.tenths.map((t) => pct(t.loose / t.letters)).join(' ')}`);
  console.log(`  most read units: ${r.top.slice(0, 30).map(([p, n]) => `${p}(${n})`).join(' ')}`);
  for (const smp of r.samples.slice(0, 5)) console.log(`  reads: ${smp}`);
}
}
