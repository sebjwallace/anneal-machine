// C106 · The price decides the cut.
// A buffer is compared with itself; a piece is kept only if it makes the whole description cheaper.
// Bookkeeping over the whole buffer: breaks cells first on purpose (see hypothesis.md). Not engine code.
//
// Run: node anneal.js            (everything, as in out.txt)
//      node anneal.js steps      (also print every step)

'use strict';

const TEXTS = {
  'two sentences': 'the cat sat on the mat the dog sat on the log',
  reader:
    'the cat sat on the mat and the dog sat on the log the cat saw the dog and the dog saw the cat ' +
    'the cat ran to the dog and the dog ran to the cat then the cat and the dog sat on the mat ' +
    'the man saw the cat and the dog on the mat and the man sat on the log',
  prose:
    'early in the morning the river was still and grey and a thin mist hung over the water a woman walked ' +
    'along the bank with her dog stopping now and then to look at the birds on the far side she had come ' +
    'here every morning for years and she knew the sounds of the place the slow turn of the current the ' +
    'calls of the herons and the wind in the reeds today something was different the water was higher than ' +
    'she had ever seen it and the old wooden bridge was nearly under it she stood for a long time watching ' +
    'the river rise and wondering what it would bring',
};

const BUFFERS = [
  'the cat sat on the mat and the dog sat on the log the cat saw the dog and the dog saw the cat',
  'the cat ran to the dog and the dog ran to the cat',
  'then the cat and the dog sat on the mat',
  'the man saw the cat and the dog on the mat and the man sat on the log',
  'the zebra sat on the mat',
  'the zebra saw the zebra and the zebra ran',
];

const SHOW_STEPS = process.argv.includes('steps');

// ---------------------------------------------------------------- memory

// Symbols: letters are strings of one character ('_' for a space); pieces are numbers (their index).
function newMemory(alphabet) {
  return { alphabet: new Set(alphabet), pieces: [] }; // piece: { body: [symbols], dead: false, buffer }
}

const letters = (text) => [...text.replace(/ /g, '_')];
const isPiece = (s) => typeof s === 'number';
const livePieces = (mem) => mem.pieces.filter((p) => !p.dead).length;

function expand(mem, s) {
  return isPiece(s) ? mem.pieces[s].body.map((t) => expand(mem, t)).join('') : s;
}
function showBody(mem, body) {
  // letters run together; a piece shows as [its letters]
  return body.map((s) => (isPiece(s) ? `[${expand(mem, s)}]` : s)).join('');
}

// ---------------------------------------------------------------- energy

// Counts of letters and piece uses, over the description and the bodies that are priced.
function counts(seqs) {
  let l = 0, u = 0;
  for (const seq of seqs) for (const s of seq) isPiece(s) ? u++ : l++;
  return { l, u };
}

function priceOf(pricing, A, P) {
  // what one letter costs, and what one use of a piece costs, with P pieces
  if (pricing === 'docs') return { letter: 1, use: 1 + (P > 1 ? Math.log2(P) / Math.log2(A) : 0) };
  const name = Math.log2(A + P) / Math.log2(A);
  return { letter: name, use: name };
}

function energy(pricing, A, P, l, u) {
  const p = priceOf(pricing, A, P);
  return l * p.letter + u * p.use;
}

// ---------------------------------------------------------------- one anneal

// Anneal one buffer. `stream` is the buffer as it stands (letters and older pieces). Pieces formed by earlier
// buffers are a sunk cost: they are counted in P (naming) but their bodies are not priced again here.
function anneal(mem, stream, { pricing = 'docs', rewrite = false, buffer = 0, log = [] } = {}) {
  const A = mem.alphabet.size;
  const own = () => mem.pieces.map((p, i) => i).filter((i) => !mem.pieces[i].dead && mem.pieces[i].buffer === buffer);
  // sequences priced: the description, and this buffer's piece bodies
  const priced = () => [stream, ...own().map((i) => mem.pieces[i].body)];
  // sequences a new piece may be cut from: the description, plus this buffer's bodies if rewriting is allowed
  const cuttable = () => (rewrite ? priced() : [stream]);

  const total = () => {
    const { l, u } = counts(priced());
    return energy(pricing, A, livePieces(mem), l, u);
  };

  let e = total();
  const start = e;
  for (;;) {
    let best = null;

    // form: every run of 2+ symbols that occurs at least twice, non-overlapping, in what may be cut
    const seen = new Map(); // key -> { run, where: [[seqIndex, pos]] }
    const seqs = cuttable();
    seqs.forEach((seq, si) => {
      for (let i = 0; i < seq.length; i++) {
        for (let m = 2; i + m <= seq.length; m++) {
          const run = seq.slice(i, i + m);
          const key = run.map(String).join('\u0001');
          let entry = seen.get(key);
          if (!entry) seen.set(key, (entry = { run, where: [] }));
          entry.where.push([si, i]);
        }
      }
    });
    const base = counts(priced());
    const P = livePieces(mem);
    for (const { run, where } of seen.values()) {
      if (where.length < 2) continue;
      // non-overlapping, left to right, per sequence
      let k = 0;
      const lastEnd = new Map();
      for (const [si, pos] of where) {
        if (pos >= (lastEnd.get(si) ?? 0)) { k++; lastEnd.set(si, pos + run.length); }
      }
      if (k < 2) continue;
      const rl = run.filter((s) => !isPiece(s)).length, ru = run.length - rl;
      // each occurrence: its symbols leave, one use arrives; the body is stored once
      const l = base.l - k * rl + rl;
      const u = base.u - k * ru + k + ru;
      const after = energy(pricing, A, P + 1, l, u);
      if (after < e - 1e-9 && (!best || after < best.after)) best = { kind: 'form', run, k, after };
    }

    // unpack: a piece of this buffer that no other live piece is built from goes back into the description
    for (const i of own()) {
      const usedInBody = mem.pieces.some((p, j) => j !== i && !p.dead && p.body.includes(i));
      if (usedInBody) continue;
      const k = stream.filter((s) => s === i).length;
      const body = mem.pieces[i].body;
      const bl = body.filter((s) => !isPiece(s)).length, bu = body.length - bl;
      const l = base.l + k * bl - bl;
      const u = base.u - k + k * bu - bu;
      const after = energy(pricing, A, P - 1, l, u);
      if (after < e - 1e-9 && (!best || after < best.after)) best = { kind: 'unpack', piece: i, k, after };
    }

    if (!best) break;

    if (best.kind === 'form') {
      const id = mem.pieces.length;
      mem.pieces.push({ body: best.run, dead: false, buffer });
      const replaceIn = (seq) => {
        const out = [];
        for (let i = 0; i < seq.length; ) {
          if (best.run.every((s, j) => seq[i + j] === s)) { out.push(id); i += best.run.length; }
          else out.push(seq[i++]);
        }
        return out;
      };
      stream = replaceIn(stream);
      if (rewrite) for (const i of own()) if (i !== id) mem.pieces[i].body = replaceIn(mem.pieces[i].body);
      log.push(`  form   #${id} ${pad(expand(mem, id), 16)} as ${pad(showBody(mem, best.run), 22)} used ${best.k}×   energy ${fmt(e)} → ${fmt(best.after)}`);
    } else {
      const i = best.piece;
      stream = stream.flatMap((s) => (s === i ? mem.pieces[i].body : [s]));
      mem.pieces[i].dead = true;
      log.push(`  unpack #${i} ${pad(expand(mem, i), 16)} (was used ${best.k}×)                    energy ${fmt(e)} → ${fmt(best.after)}`);
    }
    e = total();
  }
  return { stream, start, end: e, log };
}

// Apply the pieces already held, in the order they were formed (a stand-in for invoke, stated as a given).
function applyHeld(mem, stream) {
  mem.pieces.forEach((p, id) => {
    if (p.dead) return;
    const out = [];
    for (let i = 0; i < stream.length; ) {
      if (p.body.every((s, j) => stream[i + j] === s)) { out.push(id); i += p.body.length; }
      else out.push(stream[i++]);
    }
    stream = out;
  });
  return stream;
}

// ---------------------------------------------------------------- report

const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const fmt = (x) => x.toFixed(1);

function describe(mem, stream) {
  return stream.map((s) => (isPiece(s) ? `[${expand(mem, s)}]` : s)).join('');
}

function piecesTable(mem, stream, buffer) {
  const rows = [];
  mem.pieces.forEach((p, id) => {
    if (p.dead || (buffer !== undefined && p.buffer !== buffer)) return;
    const inStream = stream.filter((s) => s === id).length;
    const inBodies = mem.pieces.filter((q) => !q.dead && q.body.includes(id)).length;
    rows.push(`  #${pad(String(id), 3)} ${pad(expand(mem, id), 18)} built as ${pad(showBody(mem, p.body), 24)} used ${inStream} in the text, in ${inBodies} piece(s)`);
  });
  return rows.join('\n');
}

function runText(name, text, opts) {
  const mem = newMemory(letters(text));
  const stream = letters(text);
  const r = anneal(mem, stream, opts);
  const live = mem.pieces.filter((p) => !p.dead);
  const loose = r.stream.filter((s) => !isPiece(s)).length;
  return { mem, r, live, loose, length: stream.length };
}

function section(title) {
  console.log('\n' + '='.repeat(100) + '\n' + title + '\n' + '='.repeat(100));
}

// 1-3: one buffer, empty memory, four settings
const SETTINGS = [
  { label: 'docs pricing, pieces never edited (main)', pricing: 'docs', rewrite: false },
  { label: 'names pricing, pieces never edited', pricing: 'names', rewrite: false },
  { label: 'docs pricing, older pieces rewritten', pricing: 'docs', rewrite: true },
  { label: 'names pricing, older pieces rewritten', pricing: 'names', rewrite: true },
];

for (const [name, text] of Object.entries(TEXTS)) {
  section(`${name}: "${text.length > 90 ? text.slice(0, 90) + '…' : text}" (${text.length} characters, alphabet ${new Set(letters(text)).size})`);
  for (const s of SETTINGS) {
    const log = [];
    const { mem, r, live, loose, length } = runText(name, text, { ...s, log });
    console.log(`\n--- ${s.label}`);
    console.log(`energy ${fmt(r.start)} → ${fmt(r.end)}; ${live.length} pieces; ${loose} of ${length} letters left loose`);
    if (SHOW_STEPS || s === SETTINGS[0]) console.log('steps, in order:\n' + log.join('\n'));
    console.log('pieces:\n' + piecesTable(mem, r.stream));
    console.log('the buffer as described:\n  ' + describe(mem, r.stream));
  }
}

// 4: buffers in turn, memory carrying the pieces
section('buffers in turn: the reader in four buffers, then a new word once, then three times');
for (const s of SETTINGS.slice(0, 2)) {
  console.log(`\n--- ${s.label}`);
  const mem = newMemory(letters(BUFFERS.join(' ')));
  BUFFERS.forEach((text, b) => {
    const held = applyHeld(mem, letters(text));
    const log = [];
    const r = anneal(mem, held, { ...s, buffer: b, log });
    const formed = mem.pieces.filter((p) => !p.dead && p.buffer === b).length;
    console.log(`\nbuffer ${b + 1}: "${text}"`);
    console.log(`  read with what is held:  ${describe(mem, held)}`);
    console.log(`  formed ${formed} piece(s); energy ${fmt(r.start)} → ${fmt(r.end)}`);
    if (formed) console.log(piecesTable(mem, r.stream, b));
    console.log(`  described:               ${describe(mem, r.stream)}`);
  });
}
