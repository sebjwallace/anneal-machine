// C178 · The memory module: C177's, with a fuller view at the start (marked C178): what's at each place within reach of
// the start (a digit, a sign, or nothing), kept with the way of working as one assembly whose support grows with how much
// of the view matches. (C177's header follows.)
// C177 · The memory module: C176's learn.js, with three changes for C177 (marked C177): sheets and frame cells hold
// themselves while a run lasts (instead of through the procedure), so that thousands of them don't slow every moment; a
// run can start at any column; more sheets and frame cells. (C176's header follows.)
// C176 · One memory, two lessons. Read hypothesis.md first.
//
// One memory goes through lesson 1 (adding with carrying) and then lesson 2 (times one digit), keeps what settles, and
// is tested on both, without being rebuilt and with nothing carried between lessons by the code. A kept way of working
// is a frame cell over a shared vocabulary of parts (C173), linked to the start and to what was in view at the start
// (the sign under the first column). In a new lesson, the start brings up what the memory has kept by association: the
// lesson-1 ways of working come up as rivals (they share the start, not the view). If none of them settles the page as
// it is, the one or ones that got furthest (cooled the most of the working) are varied one part at a time (the code's,
// declared: a smaller crutch than reading pieces off and carrying them over).
// Run: node learn.js > out.txt

'use strict';

const fs = require('fs');
const { Memory, GATE, TRANSITION, STATE } = require('./engine');
const { PLACES, NP, MOVES, ROWS, COLS, at } = require('./circuit');

// C175's lesson pages and its search from scratch (for the very first worked example only, as C173 reused C172's)
const c175 = (() => {
  const src = fs.readFileSync(__dirname + '/c175-lessons.js', 'utf8').split('const out = [')[0];
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', 'process', src + ';module.exports={lesson,right,fromScratch,rng,digitsOf,say,fact,MEANS};')(require, mod, mod.exports, process);
  return mod.exports;
})();
const { lesson, right, fromScratch, rng, digitsOf, say, fact, MEANS } = c175;

const EDGE = 10, LIMIT = 300, SHEETS = 6000, FRAMES = 6000; // C177: more of each
const PHASES = ['Φ1', 'Φ2', 'Φ3', 'Φ4', 'Φ5', 'Φ6'];
const SLOT = ['A', 'B', 'K'];
const KINDS = ['HA', 'RA', 'RB', 'RK', 'RS', 'WU', 'WK', 'WS'];
const SYMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '×'];
const VIEWS = ['+', '×'];
const partsOf = (f) => [...f.reads.map((p, i) => `X:${f.hold === i ? 'H' : 'R'}${SLOT[i]}${p}`), `X:RS${f.s}`, `X:WU${f.u}`, `X:WK${f.k}`,
  ...(f.w !== undefined ? [`X:WS${f.w}`] : []), `X:GO${MOVES[f.mv]}`];

function buildMemory({ tieFirstFormed }) {
  const m = new Memory();
  m.poolCopies = true; m.tieFirstFormed = tieFirstFormed;
  m.placeRivals = true; m.companyFrom = 'states'; // C178: frames kept with views they share are rivals (C145, C146)
  const pops = ['=', 'Go', 'P', 'Settled', 'Stalled', ...PHASES, 'Σ', 'Π', 'S+', 'S×', 'X:Pick', 'X:Pick2', 'X:Pick3', 'X:GO←', 'X:GO→'];
  for (const v of VIEWS) pops.push('V' + v);
  for (let p = 0; p < NP; p++) for (const x of ['d', ...VIEWS]) pops.push(`See${p}=${x}`); // C178
  for (let c = 0; c < COLS; c++) pops.push('F' + c);
  for (let d = 0; d < 10; d++) pops.push('X:Hv' + d);
  for (let p = 0; p < NP; p++) for (const k of KINDS) pops.push(`X:${k}${p}`);
  for (let i = 0; i < FRAMES; i++) pops.push('Fr' + i);
  for (let i = 0; i < SHEETS; i++) pops.push('Sheet' + i);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    pops.push(`Att${r}_${c}`, `WPU${r}_${c}`, `WPK${r}_${c}`, `WPS${r}_${c}`, `Cool${r}_${c}`);
    for (const x of SYMS) pops.push(`X${r}_${c}=${x}`);
    for (let d = 0; d < 10; d++) pops.push(`Tgt${r}_${c}=${d}`);
  }
  for (let d = 0; d < 10; d++) pops.push('A' + d, 'B' + d, 'K' + d, 'U' + d, 'T' + d);
  for (const n of new Set(pops)) m.declarePopulation(n, 1);
  const id = (n) => { const p = m.population(n); if (!p) throw new Error('no population ' + n); return p.first; };
  const gate = (keys, t) => m.form(GATE, [...keys.map(id), id(t)]);

  // the start: the cue brings on the procedure and, a moment later (while the start's recall brings on a kept frame),
  // the clock and the pick-up
  gate(['='], 'P'); gate(['P'], 'P'); gate(['='], 'Go'); gate(['Go'], 'Φ1'); gate(['Go'], 'X:Pick');
  for (let p = 0; p < NP; p++) for (const k of KINDS) for (const ph of PHASES) gate([`X:${k}${p}`, ph], `X:${k}${p}`);
  for (const g of MOVES) for (const ph of PHASES) gate([`X:GO${g}`, ph], `X:GO${g}`);
  gate(['X:Pick'], 'X:Pick2'); gate(['X:Pick2'], 'X:Pick3');
  for (let d = 0; d < 10; d++) { for (const ph of PHASES) gate([`X:Hv${d}`, ph], `X:Hv${d}`); for (let p = 0; p < NP; p++) gate(['Φ3', `X:Hv${d}`, `X:HA${p}`], 'A' + d); }
  gate(['Φ1'], 'Φ2'); gate(['Φ2'], 'Φ3'); gate(['Φ3'], 'Φ4'); gate(['Φ4'], 'Φ5');
  for (let d = 0; d < 10; d++) gate(['Φ5', 'U' + d], 'Φ6');
  gate(['Φ6'], 'Φ1');
  m.form(TRANSITION, [id('Φ5'), id('Φ6')]); m.form(TRANSITION, [id('Φ5'), id('Stalled')]); gate(['Φ5'], 'Stalled');
  for (let c = 0; c < COLS; c++) {
    for (const ph of PHASES.slice(0, 5)) gate(['F' + c, ph], 'F' + c);
    gate(['F' + c, '='], 'F' + c); gate(['F' + c, 'Go'], 'F' + c);
    if (c - 1 >= 0) gate(['Φ6', 'F' + c, 'X:GO←'], 'F' + (c - 1));
    if (c + 1 < COLS) gate(['Φ6', 'F' + c, 'X:GO→'], 'F' + (c + 1));
  }
  // the shared vocabulary of parts, wired in advance at every place (C173, with the sign write and both signs)
  for (let c = 0; c < COLS; c++) for (let p = 0; p < NP; p++) {
    const rc = at(c, p); if (!rc) continue;
    const [r, cc] = rc, nm = (x) => `X:${x}${p}`;
    gate(['X:Pick', 'F' + c, nm('HA')], `Att${r}_${cc}`);
    for (let d = 0; d < 10; d++) { gate(['X:Pick3', 'F' + c, nm('HA'), `X${r}_${cc}=${d}`], 'A' + d); gate(['X:Pick3', 'F' + c, nm('HA'), `X${r}_${cc}=${d}`], `X:Hv${d}`); }
    for (const k of ['RA', 'RB', 'RK']) { gate(['Φ1', 'F' + c, nm(k)], `Att${r}_${cc}`); for (let d = 0; d < 10; d++) gate(['Φ3', 'F' + c, nm(k), `X${r}_${cc}=${d}`], k[1] + d); }
    gate(['Φ1', 'F' + c, nm('RS')], `Att${r}_${cc}`);
    for (const g of VIEWS) { gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=${g}`], MEANS[g]); gate(['Φ3', 'F' + c, nm('RS'), `X${r}_${cc}=${g}`], 'S' + g); }
    gate(['Φ4', 'F' + c, nm('WU')], `WPU${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WU')], `Att${r}_${cc}`);
    gate(['Φ4', 'F' + c, nm('WK')], `WPK${r}_${cc}`); gate(['Φ3', 'F' + c, nm('WK')], `Att${r}_${cc}`);
    gate(['Φ4', 'F' + c, nm('WS')], `WPS${r}_${cc}`);
  }
  for (const g of VIEWS) gate(['S' + g, 'Φ4'], 'S' + g);
  for (const fam of ['Σ', 'Π']) for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let k = 0; k < 10; k++) {
    const f = fact(fam, a, b, k);
    gate([fam, 'A' + a, 'B' + b, 'K' + k], 'U' + f.u); gate([fam, 'A' + a, 'B' + b, 'K' + k], 'T' + f.t);
  }
  // agreement wired in advance; the target given as held activity (C173)
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    for (let d = 0; d < 10; d++) {
      gate([`WPU${r}_${c}`, 'U' + d, `Tgt${r}_${c}=${d}`], `Cool${r}_${c}`); gate([`WPK${r}_${c}`, 'T' + d, `Tgt${r}_${c}=${d}`], `Cool${r}_${c}`);
      gate([`Tgt${r}_${c}=${d}`, 'P'], `Tgt${r}_${c}=${d}`); gate([`Tgt${r}_${c}=${d}`, '='], `Tgt${r}_${c}=${d}`);
    }
    for (const ph of [...PHASES, 'P']) gate([`Cool${r}_${c}`, ph], `Cool${r}_${c}`);
  }
  for (let i = 0; i < SHEETS; i++) gate([`Sheet${i}`], `Sheet${i}`); // C177: held by itself while the run lasts

  const mem = { m, gate, id, frames: [], sheet: 0 };
  let wasSettled = false, run = null;
  // binding on settling (C173): the kept frame that is on gets another copy of its link from the start and the view
  m.bindRules = [(mm) => {
    const on = new Set([...mm.active].map((x) => mm.popOf(x).name));
    for (const n of on) {
      let mt = /^WPU(\d+)_(\d+)$/.exec(n);
      if (mt) for (let d = 0; d < 10; d++) if (on.has('U' + d)) run.write(+mt[1], +mt[2], d);
      mt = /^WPK(\d+)_(\d+)$/.exec(n);
      if (mt) for (let t = 0; t < 10; t++) if (on.has('T' + t)) run.write(+mt[1], +mt[2], t);
      mt = /^WPS(\d+)_(\d+)$/.exec(n);
      if (mt) for (const g of VIEWS) if (on.has('S' + g)) run.write(+mt[1], +mt[2], g);
      mt = /^Cool(\d+)_(\d+)$/.exec(n);
      if (mt) run.log.cooled.add(`${mt[1]},${mt[2]}`);
    }
    const s = on.has('Settled');
    if (s && !wasSettled) {
      run.log.settled = true;
      // C176 fix (after the first run): only the frame that was on when the work started (with Go) is bound; a frame
      // that drifted in later, doing nothing, was bound too in the first run
      const fr = [...on].filter((n) => /^Fr\d+$/.test(n) && run.log.startFr.has(n));
      for (const f of fr) { link(mem, f, run.view); seenWith(mem, f, run.seen); }
      run.log.bound = fr;
    }
    wasSettled = s;
    for (const f of [...on].filter((n) => /^Fr\d+$/.test(n))) run.log.frOn.add(f);
    if (on.has('Go')) for (const f of [...on].filter((n) => /^Fr\d+$/.test(n))) run.log.startFr.add(f);
  }];
  mem.startRun = (view, seen) => { wasSettled = false; run = { view, seen, log: { settled: false, bound: [], frOn: new Set(), startFr: new Set(), cooled: new Set() } }; return run; };
  return mem;
}
// the link from the start and the view to a frame: start -> view -> frame, as one chain (support from both)
const link = (mem, fr, view) => mem.m.form(TRANSITION, [mem.id('='), mem.id('V' + view), mem.id(fr)]);
// C178: the fuller view, kept with the frame: one assembly of everything seen at the start and the frame. Its support is
// what of it is seen now, less what isn't, so the frame kept with the best-matching view wins
const seenWith = (mem, fr, seen) => { if (seen && seen.length) mem.m.form(STATE, [...seen.map(mem.id), mem.id(fr)]); };
// GIVEN, the encoder: what's in view at the start, at each place within reach: a digit, a sign, or nothing
function viewOf(page, start) {
  const out = [];
  for (let p = 0; p < NP; p++) { const rc = at(start, p); if (!rc) continue; const x = page.get(rc.join(',')); if (x === undefined) continue; out.push(`See${p}=${typeof x === 'number' ? 'd' : x}`); }
  return out;
}
function keepFrame(mem, X, view, seen) {
  const { gate } = mem;
  if (mem.frames.length >= FRAMES) throw new Error('out of frame cells');
  const fr = 'Fr' + mem.frames.length;
  for (const p of partsOf(X)) gate([fr, 'Go'], p);
  gate([fr], fr); // C177: held by itself while the run lasts
  link(mem, fr, view); // one copy
  seenWith(mem, fr, seen); // C178
  mem.frames.push({ fr, X, view });
  return fr;
}
// one run: a fresh sheet; the view (the sign under the first column, the encoder's "what's in view") with the cue;
// the target, if a worked example; a frame given with the cue, if trying an offer
function runPage(mem, kind, page, target, offer, start = EDGE) { // C177: start column
  const { m, gate, id } = mem;
  if (mem.sheet >= SHEETS) throw new Error('out of sheets');
  const sheet = 'Sheet' + mem.sheet++;
  const content = new Map();
  const seen = viewOf(page, start); // C178
  const run = mem.startRun(kind, seen);
  run.write = (r, c, x) => { const key = r + ',' + c; if (content.has(key)) return false; content.set(key, x); gate([`Att${r}_${c}`, sheet], `X${r}_${c}=${x}`); return true; };
  for (const [k, x] of page) { const [r, c] = k.split(',').map(Number); run.write(r, c, x); }
  // C177: when an offer is tried, the view isn't given with the cue, so nothing kept is recalled strongly enough to start
  // working alongside it (found in C177's build check: a recalled frame ran together with the one being tried)
  const cue = ['=', 'F' + start, sheet, ...(offer ? [] : ['V' + kind, ...seen])]; // C178: and the fuller view
  if (target) {
    for (const [k, d] of target) { const [r, c] = k.split(','); cue.push(`Tgt${r}_${c}=${d}`); }
    gate([sheet, ...[...target.keys()].map((k) => { const [r, c] = k.split(','); return `Cool${r}_${c}`; })], 'Settled');
  }
  if (offer) cue.push(offer);
  m.reset(); m.moment = 0;
  const res = m.invoke([cue], { maxMoments: LIMIT }); // ENGINE: everything after the cue
  const rivals = new Set();
  for (const mo of res.moments.slice(0, 3)) for (const comp of mo.competitions || []) for (const o of comp) {
    const a = m.assemblies[o.id - 1];
    if (a.shape === TRANSITION && a.members[0] === id('=')) rivals.add(m.popOf(a.members[a.members.length - 1]).name);
  }
  if (!rivals.size) for (const f of run.log.frOn) rivals.add(f);
  return { content, log: run.log, rivals: [...rivals] };
}
const copiesOf = (mem, fr) => mem.m.assemblies.filter((a) => a.shape === TRANSITION && a.members[0] === mem.id('=') && a.members[2] === mem.id(fr)).length;

// variation (the code's, declared): one part of a way of working changed at a time; first the kind of the first read
// (read or hold), then each part moved to another place in reach. The filter as C172 and C175 (reads of places with a
// digit, a sign read of a place with a sign, writes to empty places), on the page as given.
function variations(X, page, level) {
  const get = (p) => { const rc = at(EDGE, p); return rc ? page.get(rc.join(',')) : null; };
  const ok = (Y) => at(EDGE, Y.u) && Y.reads.every((p) => typeof get(p) === 'number') && VIEWS.includes(get(Y.s)) && get(Y.u) === undefined && new Set(Y.reads).size === 3 && Y.k !== Y.u;
  const out = [];
  if (level === 1) out.push({ ...X, hold: X.hold === 0 ? undefined : 0 });
  else for (const part of ['A', 'B', 'K', 's', 'u', 'k', 'w']) for (let q = 0; q < NP; q++) {
    if (!at(EDGE, q)) continue;
    const Y = { ...X, reads: [...X.reads] };
    if (part === 'A') Y.reads[0] = q; else if (part === 'B') Y.reads[1] = q; else if (part === 'K') Y.reads[2] = q; else Y[part] = q;
    if (JSON.stringify(Y) !== JSON.stringify(X)) out.push(Y);
  }
  return out.filter(ok);
}

// one worked example, in the one memory
function workExample(mem, kind, top, bottom, tally) {
  const { page, target } = lesson(kind, top, bottom);
  const r = runPage(mem, kind, page, target, null); tally.runs++;
  if (r.log.settled) return `recalled ${r.log.bound.join(', ')}, settled`;
  if (!mem.frames.length) {
    const found = fromScratch(page, target); tally.runs += found.tries; tally.search += found.tries;
    const kept = found.settled.map((X) => keepFrame(mem, X, kind, viewOf(page, EDGE)));
    return `nothing kept: the code's search (${found.tries.toLocaleString()} tries) settled ${found.settled.length}, kept as ${kept.join(', ')}`;
  }
  // the memory's offers: every kept frame its start brought up as rivals
  const tried = [];
  for (const f of r.rivals) { const o = runPage(mem, kind, page, target, f); tally.runs++; tried.push({ f, settled: o.log.settled, cooled: o.log.cooled.size }); }
  const ok = tried.filter((t) => t.settled).map((t) => t.f);
  if (ok.length) return `recall ${r.log.frOn.size ? 'brought on ' + [...r.log.frOn].join(', ') + ', not settled' : 'tied'}; offers ${r.rivals.join(', ')}; settled: ${ok.join(', ')}`;
  // none settles: vary the one or ones that got furthest, one part at a time (kind first, then place); keep what settles
  const best = Math.max(...tried.map((t) => t.cooled));
  const furthest = tried.filter((t) => t.cooled === best).map((t) => mem.frames.find((x) => x.fr === t.f));
  for (const level of [1, 2]) {
    const kept = [];
    for (const F of furthest) for (const Y of variations(F.X, page, level)) {
      tally.runs++; tally.varied++;
      const fr = 'probe';
      // a variation is tried as a new frame cell in the memory, offered with the cue; kept only if it settles
      const probe = keepFrameTrial(mem, Y);
      const o = runPage(mem, kind, page, target, probe.fr);
      if (o.log.settled) kept.push(probe.fr); else probe.discard();
    }
    if (kept.length) return `recall ${r.log.frOn.size ? 'brought on ' + [...r.log.frOn].join(', ') : 'tied'}; offers ${r.rivals.join(', ')} settled none (furthest: ${furthest.map((x) => x.fr).join(', ')}, ${best} places cooled); varied ${level === 1 ? 'the first read (hold or read)' : 'one part\'s place'}: kept ${kept.join(', ')}`;
  }
  return 'nothing settled';
}
// a trial frame: formed in the memory only if it settles (the trial's wiring is formed in a scratch copy of the frame
// cell's links: forming is permanent in this engine, so a trial that fails takes its frame cell out of use)
function keepFrameTrial(mem, Y) {
  const before = mem.frames.length;
  const fr = keepFrameNoLink(mem, Y);
  return { fr, discard: () => { mem.frames[before].dead = true; } };
}
function keepFrameNoLink(mem, X) {
  const { gate } = mem;
  if (mem.frames.length >= FRAMES) throw new Error('out of frame cells');
  const fr = 'Fr' + mem.frames.length;
  for (const p of partsOf(X)) gate([fr, 'Go'], p);
  gate([fr], fr); // C177: held by itself while the run lasts
  mem.frames.push({ fr, X, view: null });
  return fr;
}

module.exports = { viewOf, buildMemory, keepFrame, keepFrameNoLink, runPage, lesson, right, rng, digitsOf, say, workExample, copiesOf, partsOf };
if (require.main === module) {
const r1 = rng(1751), add = [[digitsOf(r1, 3), digitsOf(r1, 3)], [digitsOf(r1, 4), digitsOf(r1, 2)]];
const r2 = rng(1752), times = [[digitsOf(r2, 3), digitsOf(r2, 1)], [digitsOf(r2, 4), digitsOf(r2, 1)]];
const out = ['C176 · One memory, two lessons', '', `Lesson 1 (adding): ${add.map(([a, b]) => a.join('') + ' + ' + b.join('')).join(', then ')}. Lesson 2 (times one digit): ${times.map(([a, b]) => a.join('') + ' × ' + b.join('')).join(', then ')}. C175's examples.`, ''];
const t0 = Date.now();
for (const [arm, tff] of [['no tie-break', false], ['tie-break: the first formed wins (a declared crutch)', true]]) {
  const mem = buildMemory({ tieFirstFormed: tff });
  out.push(`== ${arm}`, '', '| worked example | how it was settled | runs |', '|---|---|---|');
  const totals = {};
  for (const [kind, exs] of [['+', add], ['×', times]]) {
    const tally = { runs: 0, search: 0, varied: 0 };
    for (const [top, bottom] of exs) { const before = tally.runs; const how = workExample(mem, kind, top, bottom, tally); out.push(`| ${top.join('')} ${kind} ${bottom.join('')} | ${how} | ${(tally.runs - before).toLocaleString()} |`); }
    totals[kind] = tally;
    process.stderr.write(`${arm}: lesson ${kind} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  out.push('', `Lesson 2 in all: ${totals['×'].runs} runs (${totals['×'].varied} of them variations). For comparison (C175): from scratch 1,112; with the code carrying lesson 1's pieces over, 180.`, '');
  out.push('Frames:', ...mem.frames.filter((f) => !f.dead).map((f) => `  ${f.fr} (${f.view ? `kept, seen with ${f.view}` : 'kept from a variation'}; ${copiesOf(mem, f.fr)} copies of its link): ${say(f.X)}`), '');
  out.push('| test (200 new of each, the same memory) | right | what the start brought on |', '|---|---|---|');
  for (const kind of ['+', '×']) {
    const tr = rng(kind === '+' ? 5150 : 5151);
    let ok = 0; const on = new Map();
    for (let i = 0; i < 200; i++) {
      const top = digitsOf(tr, 2 + (i % 4)), bottom = kind === '+' ? digitsOf(tr, 1 + (i % 4)) : digitsOf(tr, 1);
      const { page } = lesson(kind, top, bottom);
      const r = runPage(mem, kind, page, null, null);
      if (right(kind, top, bottom, r.content)) ok++;
      const k = [...r.log.frOn].join('+') || 'nothing'; on.set(k, (on.get(k) || 0) + 1);
    }
    out.push(`| ${kind === '+' ? 'adding' : 'times one digit'} | ${ok} of 200 | ${[...on].map(([k, n]) => `${k} ${n}`).join(', ')} |`);
  }
  out.push('');
  process.stderr.write(`${arm}: tested (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}
console.log(out.join('\n'));
}
