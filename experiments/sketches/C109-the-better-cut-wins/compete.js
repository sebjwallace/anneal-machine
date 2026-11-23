// C109 · The better cut wins.
// Buffers read in turn. Reading takes the cheapest description the loaded pieces allow (rivals compete); anneal adds
// pieces beside old ones when they make this buffer cheaper; the least chosen pieces go to stored when the population
// is full. Nothing is edited. Bookkeeping over one buffer at a time: see hypothesis.md for the givens.
//
// Run: node compete.js          (as in out.txt)
//      node compete.js steps    (also every piece formed, stored and brought back)

'use strict';

const BUFFERS = [
  'the cat sat on the mat and the dog sat on the log the cat saw the dog and the dog saw the cat',
  'the cat ran to the dog and the dog ran to the cat',
  'then the cat and the dog sat on the mat',
  'the man saw the cat and the dog on the mat and the man sat on the log',
  'the zebra sat on the mat',
  'the zebra saw the zebra and the zebra ran',
];
const PASSES = 2;
const SIZES = [8, 16, 64];
const MAX_RUN = 30; // longest candidate, in letters (a given, to keep it quick)
const C106_WHOLE = ['_the_', '_and_the_dog_', 'sat_on_the_', '_the_cat', '_the_dog_and_the_dog_', 'ran_to', '_the_ma'];
const SHOW_STEPS = process.argv.includes('steps');

const letters = (text) => text.replace(/ /g, '_');
const ALPHABET = new Set(BUFFERS.join(' ').replace(/ /g, '_')).size;

// ---------------------------------------------------------------- memory

// piece: { text (its letters), body (pieces and letters it was built from, as text), loaded, chosen, formedAt }
function newMemory(N) {
  return { N, use: 1 + Math.log2(N) / Math.log2(ALPHABET), pieces: [], clock: 0 };
}
const loaded = (mem) => mem.pieces.filter((p) => p.loaded);

// The cheapest description of text with the given pieces: letters cost 1, a use costs mem.use. On a tie, the longer
// piece. Returns { cost, parts } where a part is a letter or a piece.
function cheapest(mem, text, pieces) {
  const n = text.length;
  const cost = new Array(n + 1).fill(Infinity);
  const how = new Array(n + 1).fill(null);
  cost[n] = 0;
  for (let i = n - 1; i >= 0; i--) {
    cost[i] = 1 + cost[i + 1];
    how[i] = null;
    for (const p of pieces) {
      const m = p.text.length;
      if (i + m > n || text.startsWith(p.text, i) === false) continue;
      const c = mem.use + cost[i + m];
      if (c < cost[i] - 1e-9 || (Math.abs(c - cost[i]) < 1e-9 && m > (how[i]?.text.length ?? 1))) {
        cost[i] = c;
        how[i] = p;
      }
    }
  }
  const parts = [];
  for (let i = 0; i < n; ) {
    if (how[i]) { parts.push(how[i]); i += how[i].text.length; } else parts.push(text[i++]);
  }
  return { cost: cost[0], parts };
}

const show = (parts) => parts.map((p) => (typeof p === 'string' ? p : `[${p.text}]`)).join('');

// What storing a piece costs: its body, described as cheaply as the loaded pieces allow.
function bodyOf(mem, text) {
  return cheapest(mem, text, loaded(mem));
}

// ---------------------------------------------------------------- one buffer

function readBuffer(mem, text, log) {
  // 2. anneal: add pieces beside old ones while that makes this buffer's description cheaper
  for (;;) {
    const now = cheapest(mem, text, loaded(mem));
    const have = new Set(loaded(mem).map((p) => p.text));
    const seen = new Set();
    let best = null;
    for (let i = 0; i < text.length; i++) {
      for (let m = 2; m <= MAX_RUN && i + m <= text.length; m++) {
        const run = text.slice(i, i + m);
        if (seen.has(run) || have.has(run)) continue;
        seen.add(run);
        let k = 0;
        for (let j = text.indexOf(run); j !== -1; j = text.indexOf(run, j + run.length)) k++;
        if (k < 2) continue;
        const stored = mem.pieces.find((p) => !p.loaded && p.text === run);
        const trial = { text: run };
        const after = cheapest(mem, text, [...loaded(mem), trial]).cost;
        const body = stored ? 0 : bodyOf(mem, run).cost;
        const total = after + body;
        if (total < now.cost - 1e-9 && (!best || total < best.total)) best = { run, total, stored, body };
      }
    }
    if (!best) break;
    if (best.stored) {
      best.stored.loaded = true;
      log.push(`    bring back ${best.run}`);
    } else {
      const body = bodyOf(mem, best.run);
      mem.pieces.push({ text: best.run, body: show(body.parts), loaded: true, chosen: 0, formedAt: mem.clock++ });
      log.push(`    form   ${pad(best.run, 22)} built as ${show(body.parts)}`);
    }
  }
  // 1. read: the cheapest description; count what reading chose
  const read = cheapest(mem, text, loaded(mem));
  for (const p of read.parts) if (typeof p !== 'string') p.chosen++;
  // 3. make room
  while (loaded(mem).length > mem.N) {
    const least = loaded(mem).sort((a, b) => a.chosen - b.chosen || a.formedAt - b.formedAt)[0];
    least.loaded = false;
    log.push(`    store  ${pad(least.text, 22)} (chosen ${least.chosen}×)`);
  }
  return read;
}

// ---------------------------------------------------------------- measures

function cutsInsideWord(piece, texts) {
  const isLetter = (c) => c !== undefined && c !== '_';
  for (const t of texts)
    for (let i = t.indexOf(piece); i !== -1; i = t.indexOf(piece, i + 1)) {
      if ((isLetter(t[i - 1]) && isLetter(piece[0])) || (isLetter(t[i + piece.length]) && isLetter(piece.at(-1)))) return true;
    }
  return false;
}

const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));

const texts = BUFFERS.map(letters);
const summary = [];
for (const N of SIZES) {
  const mem = newMemory(N);
  console.log('\n' + '='.repeat(100) + `\nN = ${N} (a use costs ${mem.use.toFixed(2)})\n` + '='.repeat(100));
  let stores = 0, bringBacks = 0;
  const lastReads = [];
  for (let pass = 1; pass <= PASSES; pass++) {
    console.log(`\npass ${pass}`);
    texts.forEach((text, b) => {
      const log = [];
      const read = readBuffer(mem, text, log);
      stores += log.filter((l) => l.includes('store')).length;
      bringBacks += log.filter((l) => l.includes('bring back')).length;
      console.log(`  buffer ${b + 1}: ${show(read.parts)}`);
      if (SHOW_STEPS || pass === 1) for (const l of log) console.log(l);
      else if (log.length) console.log(`    (${log.length} change(s): ${log.map((l) => l.trim()).join('; ')})`);
      if (pass === PASSES) lastReads.push(read);
    });
  }
  const usedLast = new Map();
  for (const r of lastReads) for (const p of r.parts) if (typeof p !== 'string') usedLast.set(p.text, (usedLast.get(p.text) ?? 0) + 1);
  const inside = [...usedLast.keys()].filter((p) => cutsInsideWord(p, texts));
  console.log(`\npieces at the end: ${loaded(mem).length} loaded, ${mem.pieces.length - loaded(mem).length} stored; ` +
    `${stores} stored and ${bringBacks} brought back along the way`);
  console.log('loaded (chosen in all, used on the last pass):');
  for (const p of loaded(mem).sort((a, b) => b.chosen - a.chosen))
    console.log(`  ${pad(p.text, 24)} chosen ${pad(String(p.chosen), 3)} last pass ${pad(String(usedLast.get(p.text) ?? 0), 3)} built as ${p.body}${C106_WHOLE.includes(p.text) ? '   (C106 whole-text piece)' : ''}`);
  const stored = mem.pieces.filter((p) => !p.loaded);
  if (stored.length) console.log('stored: ' + stored.map((p) => `${p.text} (${p.chosen})`).join('  '));
  console.log(`used on the last pass and cutting inside a word: ${inside.join('  ') || '-'}`);
  summary.push({ N, loadedN: loaded(mem).length, storedN: stored.length, stores, bringBacks, usedN: usedLast.size,
    inside: inside.length, zebra: show(lastReads[4].parts),
    c106: [...usedLast.keys()].filter((p) => C106_WHOLE.includes(p)).length });
}

console.log('\n' + '='.repeat(100) + '\nsummary\n' + '='.repeat(100));
for (const s of summary) {
  console.log(`N = ${pad(String(s.N), 3)} loaded ${pad(String(s.loadedN), 3)} stored ${pad(String(s.storedN), 3)} ` +
    `(stored ${s.stores}×, brought back ${s.bringBacks}×); last pass uses ${s.usedN} pieces, ${s.c106} of them C106's ` +
    `whole-text pieces, ${s.inside} cutting inside a word`);
  console.log(`         zebra on the last pass: ${s.zebra}`);
}
