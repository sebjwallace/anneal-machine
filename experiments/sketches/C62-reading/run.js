// C62 · A READING WORLD WITH KNOWN RULES. The first text world, inside the Zorro circle: the branch engine (C56)
// unchanged, as the abstract region over items (o.atoms: each letter is a part of its own; what it reads is remembered
// as its letters placed in order). It reads a text made from a small known language through an 8-letter window.
// Question: does comparing what it has read find the WORDS as parts, with nobody telling it what a word is?
// GIVEN BY HAND (declared; results are not evidence for these):
//   G1 the language: 11 words, one sentence pattern (the rules are known so the result can be measured);
//   G2 where the eye lands: at a random place each look (it doesn't yet choose where to look);
//   G3 the window: 8 letters, one row;
//   G4 in one condition the spaces are kept, in the other removed (the words run together).
// DONE BY THE MACHINE: remembering what it reads (by energy), comparing at rest, and explaining new windows with what it
// learnt. Measured: the assemblies it keeps (are they words?), and how it cuts new text (do its cuts fall between
// words?), against a baseline cutting at random at the same rate.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const DET = ['the', 'a'], N = ['cat', 'dog', 'fox', 'hen'], V = ['sat', 'ran', 'hid'], P = ['on', 'by'];
const WORDS = [...DET, ...N, ...V, ...P];
const LETTERS = [...new Set(WORDS.join(''))].sort().concat([' ']);
globalThis.WORLD_VALUES = LETTERS.length + 2;
const E = require('../C56-integrated/engine/see.js');
const val = (ch) => LETTERS.indexOf(ch) + 2, chr = (v) => LETTERS[v - 2];
const pick = (r, a) => a[Math.floor(r() * a.length)];
function text(r, n, spaces) {   // n sentences: DET N V P DET N
  const words = []; for (let i = 0; i < n; i++) words.push(pick(r, DET), pick(r, N), pick(r, V), pick(r, P), pick(r, DET), pick(r, N));
  let s = '', starts = new Set([0]); for (const w of words) { if (s.length) { if (spaces) s += ' '; starts.add(s.length); } s += w; }
  return { s, starts };   // starts: where each word begins (the true cuts)
}
const window8 = (s, at) => { const x = new Uint8Array(64); for (let i = 0; i < 8; i++) x[i] = val(s[at + i]); return x; };
const asText = (m, u) => m.exp(u).filter((p) => p[1] === 0).sort((a, b) => a[0] - b[0]).map((p, i, a) => (i && p[0] > a[i - 1][0] + 1 ? '…' : '') + chr(p[2])).join('');
function run(spaces, looks, seed) {
  const r = rng(seed), T = text(r, 400, spaces), m = new E.Model('FL', { atoms: true }), t0 = Date.now();
  for (let t = 1; t <= looks; t++) { m.step(window8(T.s, Math.floor(r() * (T.s.length - 8)))); if (t % 50 === 0) m.rest(); } m.rest();
  const comps = m.units.filter((u) => u.layer > 1 && !u.loose && !u.kind).map((u) => asText(m, u)).filter((s, i, a) => a.indexOf(s) === i);
  const strip = (w) => w.trim();
  // whole words run together (with or without spaces between them)
  const seg = (t) => { const ok = [true]; for (let i = 1; i <= t.length; i++) { ok[i] = false; for (const w of WORDS) if (i >= w.length && ok[i - w.length] && t.slice(i - w.length, i) === w) ok[i] = true; } return ok[t.length]; };
  const kindOf = (c) => { const t = strip(c); if (c.includes('…')) return 'cross'; if (WORDS.includes(t)) return 'word';
    if (!t.includes(' ') && WORDS.some((w) => w.includes(t))) return 'part';
    if (t.includes(' ') ? t.split(' ').every((x) => WORDS.includes(x)) : seg(t)) return 'together'; return 'cross'; };
  const isWord = (w) => kindOf(w) === 'word', inWord = (w) => kindOf(w) === 'part', together = (w) => kindOf(w) === 'together';
  const wordsFound = WORDS.filter((w) => comps.some((c) => strip(c) === w));
  // cutting new text: explain fresh windows; a cut is between two letters claimed by different placements
  const r2 = rng(seed + 1), T2 = text(r2, 200, spaces); let tp = 0, fp = 0, fn = 0, cutsMade = 0, slots = 0, rtp = 0, rfp = 0, rfn = 0;
  const truthAt = (at, i) => (spaces ? T2.s[at + i] === ' ' || T2.s[at + i - 1] === ' ' : T2.starts.has(at + i));
  const examples = [];
  for (let k = 0; k < 150; k++) { const at = Math.floor(r2() * (T2.s.length - 8)), q = m.read(window8(T2.s, at)), owner = new Array(8).fill(-1);
    q.claims.forEach((c, ci) => { for (const [ux, uy] of m.exp(c.c)) { const x = ux + c.dx; if (uy + c.dy === 0 && x >= 0 && x < 8) owner[x] = ci; } });
    if (k < 4) { let ex = T2.s[at]; for (let i = 1; i < 8; i++) ex += (owner[i] !== owner[i - 1] || owner[i] === -1 ? '|' : '') + T2.s[at + i]; examples.push(ex.replace(/ /g, '_')); }
    for (let i = 1; i < 8; i++) { const cut = owner[i] !== owner[i - 1] || owner[i] === -1, truth = truthAt(at, i); slots++; if (cut) cutsMade++;
      if (cut && truth) tp++; else if (cut) fp++; else if (truth) fn++; } }
  const rate = cutsMade / slots, rr = rng(seed + 2);   // baseline: cut at random at the same rate
  for (let k = 0; k < 150; k++) { const at = Math.floor(r2() * (T2.s.length - 8)); for (let i = 1; i < 8; i++) { const cut = rr() < rate, truth = truthAt(at, i); if (cut && truth) rtp++; else if (cut) rfp++; else if (truth) rfn++; } }
  const f = (a, b, c) => { const p = a / (a + b || 1), rc = a / (a + c || 1); return { p, rc, f1: 2 * p * rc / (p + rc || 1) }; };
  return { secs: (Date.now() - t0) / 1000, comps, isWordN: comps.filter(isWord).length, inWordN: comps.filter(inWord).length, togetherN: comps.filter(together).length, wordsFound, cut: f(tp, fp, fn), base: f(rtp, rfp, rfn), rate, examples };
}
const ALL = (process.env.LOOKS || '150,400,1000').split(',').map(Number);
for (const LOOKS of ALL) for (const spaces of [true, false]) {
  const R = run(spaces, LOOKS, 62);
  console.log(`\n${spaces ? 'WITH SPACES' : 'NO SPACES (words run together)'} · ${LOOKS} looks · ${R.secs.toFixed(0)} s`);
  console.log(`  assemblies kept: ${R.comps.length} · exactly a word (spaces aside): ${R.isWordN} · part of a word, or a piece shared by words: ${R.inWordN} · whole words together: ${R.togetherN} · cutting through a word: ${R.comps.length - R.isWordN - R.inWordN - R.togetherN}`);
  console.log(`  words found as assemblies: ${R.wordsFound.length}/${WORDS.length} (${R.wordsFound.join(', ')})`);
  console.log(`  assemblies: ${R.comps.map((c) => JSON.stringify(c)).join(' ')}`);
  console.log(`  how it cuts new windows (| = a cut, _ = a space): ${R.examples.join('   ')}`);
  console.log(`  cutting new text: precision ${(R.cut.p * 100).toFixed(0)}%, recall ${(R.cut.rc * 100).toFixed(0)}%, F1 ${(R.cut.f1 * 100).toFixed(0)}% · random cuts at the same rate (${(R.rate * 100).toFixed(0)}%): F1 ${(R.base.f1 * 100).toFixed(0)}%`);
}
