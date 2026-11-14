// C80 · Reading from letters: first steps, one region. Characters are the input cells (one column per character); words
// are never given. Short sentences from a small vocabulary are read once, as one stream, and the region learns as it
// reads (the cells engine, experiments/cells-engine). Questions: does it learn to predict the next letter inside words,
// and does its surprise (a whole column lighting: nothing predicted that letter) mark where words begin?
// Arms: cells (C = 32 cells per column) and one cell per letter (C = 1). Spaces in the stream, or not (SPACES=1|0).
// Measured online, before each letter is read: whether the letter was predicted (right), predicted alone (sharp), and
// whether it burst, and how many letters were predicted (the breadth: cells predicted that won't all light, the second
// kind of heat); separately for letters inside words and the first letter of each word; first and last quarter.
// Boundaries: a word is guessed to begin where the breadth peaks (higher than the letter before, at least the letter
// after; no threshold); and, for comparison, where a burst happens.
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
'use strict';
const path = require('path');
const { Region } = require(path.join(__dirname, '../../cells-engine/region.js'));
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number), NSENT = +(process.env.NSENT || 400);
const SUBJ = ['cat', 'car', 'cart', 'dog', 'doll', 'bird', 'boat', 'girl'], VERB = ['sees', 'eats', 'likes', 'pulls', 'finds', 'holds'], OBJ = ['fish', 'fig', 'milk', 'mill', 'seed', 'stone', 'string', 'rope', 'bell', 'ball'];
function stream(seed, spaces) { const r = rng(seed * 13 + 5), pick = (a) => a[Math.floor(r() * a.length)], chars = [], start = [];
  for (let i = 0; i < NSENT; i++) for (const w of [pick(SUBJ), pick(VERB), pick(OBJ)]) { for (let k = 0; k < w.length; k++) { chars.push(w[k]); start.push(k === 0); } if (spaces) { chars.push(' '); start.push(false); } }
  return { chars, start }; }
const res = {};
for (const SP of [1, 0]) for (const [arm, C] of [['cells', 32], ['one cell per letter', 1]]) for (const seed of SEEDS) {
  const { chars, start } = stream(seed, SP), R = new Region({ C, context: 2 }), n = chars.length, q = Math.floor(n / 4);
  const key = `${SP}|${arm}`, o = res[key] || (res[key] = { early: z(), late: z(), cells: 0, segs: 0, workEarly: 0, workLate: 0, runs: 0 }); o.runs++;
  function z() { return { inN: 0, inRight: 0, inSharp: 0, inBurst: 0, inBreadth: 0, stN: 0, stBurst: 0, stBreadth: 0, guess: 0, guessRight: 0, starts: 0, found: 0, pk: 0, pkRight: 0, pkFound: 0, spN: 0, spRight: 0 }; }
  const breadth = [];
  for (let i = 0; i < n; i++) { const pred = new Set([...R.predicted().keys()].map((c) => R.symOf(c))), ch = chars[i], w0 = R.work;
    breadth.push(pred.size); const out = R.step(ch); const ph = i < q ? o.early : i >= n - q ? o.late : null;
    if (i < q) o.workEarly += R.work - w0; if (i >= n - q) o.workLate += R.work - w0;
    if (!ph) continue;
    if (ch === ' ') { ph.spN++; if (pred.has(' ')) ph.spRight++; continue; }
    if (start[i]) { ph.stN++; ph.stBreadth += pred.size; if (out.burst) ph.stBurst++; }
    else { ph.inN++; ph.inBreadth += pred.size; if (pred.has(ch)) ph.inRight++; if (pred.has(ch) && pred.size === 1) ph.inSharp++; if (out.burst) ph.inBurst++; }
    if (!SP) { if (out.burst) { ph.guess++; if (start[i]) ph.guessRight++; } if (start[i]) { ph.starts++; if (out.burst) ph.found++; } } }
  { const letters = []; for (let i = 0; i < n; i++) if (chars[i] !== ' ') letters.push(i);   // peaks over letters only (spaces skipped)
    for (let k = 1; k < letters.length - 1; k++) { const i = letters[k], ph = i < q ? o.early : i >= n - q ? o.late : null; if (!ph) continue;
      const b = breadth[i], peak = b > breadth[letters[k - 1]] && b >= breadth[letters[k + 1]];
      if (peak) { ph.pk++; if (start[i]) ph.pkRight++; } if (start[i] && peak) ph.pkFound++; } }
  o.cells += R.used.size; o.segs += R.segs.length; o.n = n; }
const pc = (a, b) => (b ? Math.round(100 * a / b) : 0) + '%';
console.log(`C80 · reading from letters, one region   ${NSENT} sentences read once (about ${res['1|cells'].n} characters with spaces)   seeds ${SEEDS.join(',')}\n`);
for (const SP of [1, 0]) { console.log(SP ? 'WITH SPACES' : 'WITHOUT SPACES');
  for (const arm of ['cells', 'one cell per letter']) { const o = res[`${SP}|${arm}`]; console.log(`  ${arm}`);
    for (const [nm, ph] of [['first quarter', o.early], ['last quarter ', o.late]]) {
      let line = `    ${nm}  inside words: right ${pc(ph.inRight, ph.inN).padStart(4)} sharp ${pc(ph.inSharp, ph.inN).padStart(4)} surprise ${pc(ph.inBurst, ph.inN).padStart(4)}   first letters: surprise ${pc(ph.stBurst, ph.stN).padStart(4)}`;
      line += `\n                   letters predicted: inside ${(ph.inBreadth / ph.inN).toFixed(1)}, at first letters ${(ph.stBreadth / ph.stN).toFixed(1)}   boundaries where the breadth peaks: precision ${pc(ph.pkRight, ph.pk).padStart(4)} recall ${pc(ph.pkFound, ph.stN).padStart(4)}`;
      if (SP) line += `   space predicted ${pc(ph.spRight, ph.spN).padStart(4)}`; else line += `   from surprise: precision ${pc(ph.guessRight, ph.guess).padStart(4)} recall ${pc(ph.found, ph.starts).padStart(4)}`;
      console.log(line); }
    console.log(`    cells used ${Math.round(o.cells / o.runs)}, segments ${Math.round(o.segs / o.runs)}, segment checks per letter: first quarter ${Math.round(o.workEarly / o.runs / Math.floor(o.n / 4))}, last quarter ${Math.round(o.workLate / o.runs / Math.floor(o.n / 4))}`); } console.log(''); }
