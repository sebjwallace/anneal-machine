// C81 · Levels from letters: does composition and abstraction emerge above letters-in-context?
// The cells engine (experiments/cells-engine) reads the C80 stream (no spaces). Arms:
//   none   context is never let go (C80): a word's cells depend on what came before it.
//   heat   where the breadth of prediction peaks (more letters predicted than for the previous letter, and at least as
//          many as it would predict next: the region looks one letter ahead, without learning), it takes it that a word
//          begins and lets go of the old context: it reads the word from a fixed boundary context (two
//          boundary cells, so the first letter has two links), so the same word can get the same cells.
//   two    two regions, the same engine: region 1 reads the letters and never lets go (its heat marks where words
//          begin); region 2 reads the same letters and lets go wherever region 1's heat says a word begins.
//          Words, parts and sentences are held in region 2.
//   truth  region 2 lets go at the true word starts (a ceiling, not a mechanism).
// Levels, all from cells (no list of words is consulted by the machine; the measuring code does use the truth):
//   words     the winner cells between two boundaries are a run. A run whose cells already carry a word segment over
//             exactly the rest of the run is recognised (it recurred); otherwise it is stored as an assembly (kind 'word').
//   parts     when a new run's cells already carry segments of other words (shared cells), and two or more in a row are
//             shared, the shared run is stored as a part (kind 'part'): an abstraction, held on the same cells.
//   sentences each sentence's three runs are bound by two cells from each (kind 'bind'), once.
// Run: node run.js     (SEEDS=101..105 by default; SEEDS=1 is the development seed)
'use strict';
const path = require('path');
const { Region } = require(path.join(__dirname, '../../cells-engine/region.js'));
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number), NSENT = +(process.env.NSENT || 400);
const SUBJ = ['cat', 'car', 'cart', 'dog', 'doll', 'bird', 'boat', 'girl'], VERB = ['sees', 'eats', 'likes', 'pulls', 'finds', 'holds'], OBJ = ['fish', 'fig', 'milk', 'mill', 'seed', 'stone', 'string', 'rope', 'bell', 'ball'];
const ALL = [...SUBJ, ...VERB, ...OBJ];
function stream(seed) { const r = rng(seed * 13 + 5), pick = (a) => a[Math.floor(r() * a.length)], chars = [], start = [], word = [], sent = [];
  for (let i = 0; i < NSENT; i++) { const ws = [pick(SUBJ), pick(VERB), pick(OBJ)]; ws.forEach((w, j) => { for (let k = 0; k < w.length; k++) { chars.push(w[k]); start.push(k === 0); word.push(w); sent.push(i * 3 + j); } }); }
  return { chars, start, word, sent }; }
const truePrefix = (a, b) => { let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k; };
const res = {};
for (const arm of ['none', 'heat', 'two', 'truth']) for (const seed of SEEDS) {
  const { chars, start, word, sent } = stream(seed), R = new Region({ C: 32, context: 2 }), D = arm === 'two' ? new Region({ C: 32, context: 2 }) : R, n = chars.length, half = Math.floor(n / 2);
  const B = R.cellsOf('#boundary'), letGo = () => { R.past = [{ act: [B[0]], win: [B[0]], burst: false }, { act: [B[1]], win: [B[1]], burst: false }]; };
  const o = res[arm] || (res[arm] = { runs: 0, pure: 0, recog: 0, tokensLate: 0, recogLate: 0, stored: 0, parts: 0, partsTrue: 0, partsSeen: new Set(), chains: 0, types: 0, bounds: 0, boundsRight: 0, starts: 0, found: 0, sentences: 0, bindRecall: 0, bindTried: 0, seeds: 0 }); o.seeds++;
  let prevB = 0, run = [], runIdx = [], runs = [], kindSeen = new Map();   // kindSeen: only for measuring (cells of each true word type)
  const close = (i) => { if (!run.length) return; const cells = run.slice(), letters = runIdx.map((k) => chars[k]).join(''), w0 = word[runIdx[0]];
      const pure = runIdx.every((k) => word[k] === w0 && sent[k] === sent[runIdx[0]]) && start[runIdx[0]] && letters === w0;
      o.runs++; if (pure) o.pure++;
      // recognised? every cell carries a word segment over exactly the rest of the run
      const key = (a) => [...a].sort((x, y) => x - y).join(',');
      const want = (c) => key(cells.filter((x) => x !== c));
      const recog = cells.length >= 2 && cells.every((c) => R.segs.some((s) => s.cell === c && s.kind === 'word' && key(s.syn) === want(c)));
      if (runIdx[0] >= half) { o.tokensLate++; if (recog && pure) o.recogLate++; }
      if (recog) o.recog++;
      else if (cells.length >= 2) {
        // parts: shared cells (already carrying another word's segment), two or more in a row
        const shared = cells.map((c) => R.segs.some((s) => s.cell === c && s.kind === 'word'));
        let k = 0; while (k < cells.length) { if (!shared[k]) { k++; continue; } let e = k; while (e < cells.length && shared[e]) e++;
          if (e - k >= 2) { const pc = cells.slice(k, e), pk = key(pc); if (!o.partsSeen.has(seed + ':' + arm + ':' + pk)) { o.partsSeen.add(seed + ':' + arm + ':' + pk); R.store(pc, 'part'); o.parts++;
            const lp = runIdx.slice(k, e).map((q) => chars[q]).join(''), atStart = start[runIdx[k]];
            if (atStart && ALL.filter((v) => v.startsWith(lp)).length >= 2) o.partsTrue++; else if (ALL.includes(lp) && atStart) o.partsWord = (o.partsWord || 0) + 1; } }
          k = e; }
        R.store(cells, 'word'); o.stored++; }
      if (pure && runIdx[0] >= half) { const ks = kindSeen.get(w0) || new Set(); ks.add(key(cells)); kindSeen.set(w0, ks); }
      runs.push({ cells, sent: Math.floor(sent[runIdx[0]] / 3), pure }); run = []; runIdx = []; };
  let lastBreadth = 0;
  for (let i = 0; i < n; i++) {
    const pred = new Set([...D.predicted().keys()].map((c) => D.symOf(c))), b = pred.size;
    let boundary = false;
    let bNext = 0; if (arm !== 'truth') { const saved = D.past.slice(); D.step(chars[i], false); bNext = new Set([...D.predicted().keys()].map((c) => D.symOf(c))).size; D.past = saved; }   // look one letter ahead, without learning
    const peak = i > 0 && b > lastBreadth && b >= bNext;
    if (arm === 'heat' || arm === 'two') boundary = peak;
    if (arm === 'truth') boundary = start[i];
    if (arm === 'none') boundary = peak;   // the same guess, but context is not let go
    if (i >= half) { if (boundary) { o.bounds++; if (start[i]) o.boundsRight++; } if (start[i]) { o.starts++; if (boundary) o.found++; } }
    if (boundary) { close(i); if (arm !== 'none') letGo(); }
    if (D !== R) D.step(chars[i]);
    const out = R.step(chars[i]); run.push(out.win[0]); runIdx.push(i); lastBreadth = b; }
  close(n);
  for (const [, ks] of kindSeen) { o.types++; o.chains += ks.size; }
  // sentences: bind each sentence's three runs once (two cells from each), when all three runs are pure
  const bySent = new Map(); for (const r of runs) { if (!bySent.has(r.sent)) bySent.set(r.sent, []); bySent.get(r.sent).push(r); }
  const bound = []; for (const [s, rs] of bySent) if (rs.length === 3 && rs.every((r) => r.pure && r.cells.length >= 2)) { R.bind(rs.map((r) => r.cells)); bound.push(rs); }
  o.sentences += bound.length;
  // recall: from the subject's and verb's cells, does the object come back (and no other object)?
  const objCells = new Map(); for (const rs of bound) objCells.set(rs, new Set(rs[2].cells));
  for (const rs of bound.slice(-60)) { const cue = [...rs[0].cells, ...rs[1].cells], back = R.settle(cue); o.bindTried++; if ([...objCells.get(rs)].every((c) => back.has(c))) o.bindRecall++; } }
const pc = (a, b) => (b ? Math.round(100 * a / b) : 0) + '%';
console.log(`C81 · levels from letters   ${NSENT} sentences, no spaces, read once   seeds ${SEEDS.join(',')}\n`);
console.log('arm    boundaries (2nd half): precision / recall   runs that are exactly one word   word assemblies: stored / recognised   words recognised (2nd half)   cell chains per word   shared parts: stored / shared beginnings / whole words   sentences bound   object recalled from subject + verb');
for (const arm of ['none', 'heat', 'two', 'truth']) { const o = res[arm], s = o.seeds;
  console.log(`${arm.padEnd(6)} ${(pc(o.boundsRight, o.bounds) + ' / ' + pc(o.found, o.starts)).padStart(40)} ${pc(o.pure, o.runs).padStart(32)} ${(Math.round(o.stored / s) + ' / ' + Math.round(o.recog / s)).padStart(38)} ${pc(o.recogLate, o.tokensLate).padStart(29)} ${(o.chains / Math.max(1, o.types)).toFixed(1).padStart(22)} ${(Math.round(o.parts / s) + ' / ' + pc(o.partsTrue, o.parts) + ' / ' + pc(o.partsWord || 0, o.parts)).padStart(55)} ${String(Math.round(o.sentences / s)).padStart(17)} ${pc(o.bindRecall, o.bindTried).padStart(37)}`); }
