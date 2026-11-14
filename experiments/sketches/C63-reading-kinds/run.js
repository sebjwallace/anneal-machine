// C63 · WORDS AS WHAT FILLS THE SLOTS. Same world, engine and givens as C62 (G1-G4 there; nothing new given). C62 found
// that energy keeps whatever recurs, so whole words lose out. A word varies independently of its neighbours; in the
// engine's terms that is a kind: one form with a slot. The branch engine already forms kinds over items. Question:
// do the words stand out as what fills the slots, and do the slots group them by the part they play (nouns after
// "the", and so on)? Nothing in the engine is changed; this reads what C62's runs already kept.
'use strict';
const path = require('path');
globalThis.WORLD_SIZE = 8;
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const CLASS = { the: 'det', a: 'det', cat: 'noun', dog: 'noun', fox: 'noun', hen: 'noun', sat: 'verb', ran: 'verb', hid: 'verb', on: 'prep', by: 'prep' };
const WORDS = Object.keys(CLASS), DET = ['the', 'a'], N = ['cat', 'dog', 'fox', 'hen'], V = ['sat', 'ran', 'hid'], P = ['on', 'by'];
const LETTERS = [...new Set(WORDS.join(''))].sort().concat([' ']);
globalThis.WORLD_VALUES = LETTERS.length + 2;
const E = require('../C56-integrated/engine/see.js');
const val = (ch) => LETTERS.indexOf(ch) + 2, chr = (v) => LETTERS[v - 2], pick = (r, a) => a[Math.floor(r() * a.length)];
function run(spaces, looks, seed) {
  const r = rng(seed), ws = []; for (let i = 0; i < 400; i++) ws.push(pick(r, DET), pick(r, N), pick(r, V), pick(r, P), pick(r, DET), pick(r, N));
  const s = ws.join(spaces ? ' ' : ''), m = new E.Model('FL', { atoms: true });
  const str = (u) => { const pts = m.exp(u).filter((p) => p[1] === 0).sort((a, b) => a[0] - b[0]); return pts.map((p, i) => (i && p[0] > pts[i - 1][0] + 1 ? '…' : '') + chr(p[2])).join(''); };
  for (let t = 1; t <= looks; t++) { const at = Math.floor(r() * (s.length - 8)), x = new Uint8Array(64); for (let i = 0; i < 8; i++) x[i] = val(s[at + i]); m.step(x); if (t % 50 === 0) m.rest(); } m.rest();
  const kinds = m.units.filter((u) => u.kind).map((K) => ({ base: K.place.map((p) => str(p.u).trim()).join(' '), slots: (K.slots || [K.slot]).map((sl) => sl.set.fillers.map((f) => str(f.u))) }));
  const fillers = kinds.flatMap((k) => k.slots.flat());
  const wholeWord = (f) => WORDS.includes(f.trim()) && !f.includes('…');
  // a slot is "one part of speech" when every filler is a whole word of the same class
  const slotsAll = kinds.flatMap((k) => k.slots), pure = slotsAll.filter((sl) => sl.every(wholeWord) && new Set(sl.map((f) => CLASS[f.trim()])).size === 1);
  const wordsAsFillers = WORDS.filter((w) => fillers.some((f) => f.trim() === w));
  const wordsAsParts = WORDS.filter((w) => m.units.some((u) => u.layer > 1 && !u.kind && !u.loose && str(u).trim() === w));
  return { kinds, fillers: fillers.length, wordFillers: fillers.filter(wholeWord).length, slots: slotsAll.length, pure: pure.length, wordsAsFillers, wordsAsParts, either: WORDS.filter((w) => wordsAsFillers.includes(w) || wordsAsParts.includes(w)) };
}
const out = {};
for (const looks of (process.env.LOOKS || '150,400,1000').split(',').map(Number)) for (const spaces of [true, false]) {
  const R = run(spaces, looks, 62), key = `${spaces ? 'spaces' : 'nospaces'}-${looks}`; out[key] = R;
  console.log(`\n${spaces ? 'WITH SPACES' : 'NO SPACES'} · ${looks} looks · ${R.kinds.length} kinds`);
  for (const k of R.kinds) console.log(`  ${JSON.stringify(k.base)} + slot${k.slots.length > 1 ? 's' : ''} ${k.slots.map((sl) => '[' + sl.map((f) => JSON.stringify(f)).join(' ') + ']').join(' ')}`);
  console.log(`  fillers that are whole words: ${R.wordFillers}/${R.fillers} · slots holding one part of speech only: ${R.pure}/${R.slots}`);
  console.log(`  words found: as fillers ${R.wordsAsFillers.length}/11 (${R.wordsAsFillers.join(', ')}) · as parts (C62) ${R.wordsAsParts.length}/11 · either ${R.either.length}/11`);
}
require('fs').writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(out, null, 1));
