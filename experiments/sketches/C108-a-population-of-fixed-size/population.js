// C108 · A population of fixed size. (Shared code copied from C107's local.js.)
// The same decision as C106 (keep a piece only if it pays), made four ways: by the global total (G), by each piece
// from its own uses and body (L, L+n), and by each piece the moment it first pays while the text streams in (S).
// Bookkeeping, not engine code: see hypothesis.md for what is a given.
//
// Run: node local.js           (as in out.txt)
//      node local.js steps     (also every step)

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

const SHOW_STEPS = process.argv.includes('steps');
const MAX_RUN = 30; // longest run S tallies at the tail, in symbols (a given, to keep it quick; no piece came near it)

// ---------------------------------------------------------------- memory and prices

const letters = (text) => [...text.replace(/ /g, '_')];
const isPiece = (s) => typeof s === 'number';

function newMemory(text) {
  return { A: new Set(letters(text)).size, pieces: [] }; // piece: { body, dead }
}
const live = (mem) => mem.pieces.map((_, i) => i).filter((i) => !mem.pieces[i].dead);
const naming = (mem, P) => (P > 1 ? Math.log2(P) / Math.log2(mem.A) : 0);
const useCost = (mem, P) => 1 + naming(mem, P); // the docs pricing

function expand(mem, s) {
  return isPiece(s) ? mem.pieces[s].body.map((t) => expand(mem, t)).join('') : s;
}
const showBody = (mem, body) => body.map((s) => (isPiece(s) ? `[${expand(mem, s)}]` : s)).join('');
const describe = (mem, seq) => seq.map((s) => (isPiece(s) ? `[${expand(mem, s)}]` : s)).join('');

// The global total, as in C106: every letter 1, every use 1 + naming, over the text and every live body.
function total(mem, stream) {
  const P = live(mem).length;
  let l = 0, u = 0;
  for (const seq of [stream, ...live(mem).map((i) => mem.pieces[i].body)])
    for (const s of seq) isPiece(s) ? u++ : l++;
  return l + u * useCost(mem, P);
}

// What a body costs, and what a piece saves, seen from the piece itself.
function bodyCost(mem, body, use) {
  return body.reduce((c, s) => c + (isPiece(s) ? use : 1), 0);
}
function ownSaving(mem, body, k, use) {
  const b = bodyCost(mem, body, use);
  return k * b - b - k * use;
}

// ---------------------------------------------------------------- shared moves

// Non-overlapping occurrences of run in seq, left to right.
function occurrences(seq, run) {
  const at = [];
  for (let i = 0; i + run.length <= seq.length; ) {
    if (run.every((s, j) => seq[i + j] === s)) { at.push(i); i += run.length; } else i++;
  }
  return at;
}
function replaceAll(seq, run, id) {
  const out = [];
  for (let i = 0; i < seq.length; ) {
    if (i + run.length <= seq.length && run.every((s, j) => seq[i + j] === s)) { out.push(id); i += run.length; }
    else out.push(seq[i++]);
  }
  return out;
}
function form(mem, stream, run) {
  const id = mem.pieces.length;
  mem.pieces.push({ body: run, dead: false });
  return { id, stream: replaceAll(stream, run, id) };
}
function unpack(mem, stream, id) {
  mem.pieces[id].dead = true;
  return stream.flatMap((s) => (s === id ? mem.pieces[id].body : [s]));
}
const usesOf = (mem, stream, id) =>
  stream.filter((s) => s === id).length +
  live(mem).reduce((n, j) => n + mem.pieces[j].body.filter((s) => s === id).length, 0);
const builtOn = (mem, id) => live(mem).some((j) => j !== id && mem.pieces[j].body.includes(id));

// Every run of 2+ symbols in the text with at least 2 non-overlapping occurrences: the tally (a given).
function candidates(stream) {
  const seen = new Map();
  for (let i = 0; i < stream.length; i++)
    for (let m = 2; i + m <= stream.length; m++) {
      const key = stream.slice(i, i + m).join('\u0001');
      if (!seen.has(key)) seen.set(key, stream.slice(i, i + m));
    }
  const out = [];
  for (const run of seen.values()) {
    const k = occurrences(stream, run).length;
    if (k >= 2) out.push({ run, k });
  }
  return out;
}

// ---------------------------------------------------------------- the four ways

// G: at rest; the move that lowers the global total most (as C106 main).
function restGlobal(mem, stream, log) {
  for (;;) {
    const e = total(mem, stream);
    let best = null;
    for (const { run, k } of candidates(stream)) {
      const trial = { ...mem, pieces: [...mem.pieces, { body: run, dead: false }] };
      const after = total(trial, replaceAll(stream, run, mem.pieces.length));
      if (after < e - 1e-9 && (!best || after < best.after)) best = { kind: 'form', run, k, after };
    }
    for (const id of live(mem)) {
      if (builtOn(mem, id)) continue;
      const trial = { ...mem, pieces: mem.pieces.map((p, i) => (i === id ? { ...p, dead: true } : p)) };
      const after = total(trial, stream.flatMap((s) => (s === id ? mem.pieces[id].body : [s])));
      if (after < e - 1e-9 && (!best || after < best.after)) best = { kind: 'unpack', id, after };
    }
    if (!best) return stream;
    if (best.kind === 'form') {
      const r = form(mem, stream, best.run);
      stream = r.stream;
      log.push(`  form   ${pad(expand(mem, r.id), 18)} used ${best.k}×   total ${fmt(e)} → ${fmt(best.after)}`);
    } else {
      log.push(`  unpack ${pad(expand(mem, best.id), 18)}            total ${fmt(e)} → ${fmt(best.after)}`);
      stream = unpack(mem, stream, best.id);
    }
  }
}

// L and L+n: at rest; each piece judges itself. A piece that no longer pays unpacks; otherwise the candidate whose
// own saving is biggest forms.
function restLocal(mem, stream, log, withNaming) {
  const use = (P) => (withNaming ? useCost(mem, P) : 1);
  for (;;) {
    const P = live(mem).length;
    const failing = live(mem).find(
      (id) => !builtOn(mem, id) && ownSaving(mem, mem.pieces[id].body, usesOf(mem, stream, id), use(P)) <= 1e-9,
    );
    if (failing !== undefined) {
      log.push(`  unpack ${pad(expand(mem, failing), 18)} (no longer pays for itself)`);
      stream = unpack(mem, stream, failing);
      continue;
    }
    let best = null;
    for (const { run, k } of candidates(stream)) {
      const s = ownSaving(mem, run, k, use(P + 1));
      if (s > 1e-9 && (!best || s > best.s)) best = { run, k, s };
    }
    if (!best) return stream;
    const r = form(mem, stream, best.run);
    stream = r.stream;
    log.push(`  form   ${pad(expand(mem, r.id), 18)} used ${best.k}×   its own saving ${fmt(best.s)}`);
  }
}

// S: streaming. A character at a time: read the tail with the pieces held, tally the runs ending at the tail, form
// the one that pays (the biggest saving among those that pay at this moment), then unpack any piece that stopped
// paying.
function streamLocal(mem, text, log) {
  let stream = [];
  let read = 0;
  for (const ch of letters(text)) {
    stream.push(ch);
    read++;
    // read the tail with what is held, in the order pieces formed, until nothing more applies
    for (let changed = true; changed; ) {
      changed = false;
      for (const id of live(mem)) {
        const body = mem.pieces[id].body;
        const at = stream.length - body.length;
        if (at >= 0 && body.every((s, j) => stream[at + j] === s)) {
          stream = [...stream.slice(0, at), id];
          changed = true;
        }
      }
    }
    const P = live(mem).length;
    let best = null;
    for (let m = 2; m <= Math.min(MAX_RUN, stream.length); m++) {
      const run = stream.slice(stream.length - m);
      const k = occurrences(stream, run).length;
      if (k < 2) continue;
      const s = ownSaving(mem, run, k, useCost(mem, P + 1));
      if (s > 1e-9 && (!best || s > best.s)) best = { run, k, s };
    }
    if (best) {
      const r = form(mem, stream, best.run);
      stream = r.stream;
      log.push(`  after ${pad(String(read) + ' characters', 15)} form ${pad(expand(mem, r.id), 18)} used ${best.k}× so far, its own saving ${fmt(best.s)}`);
    }
    for (let again = true; again; ) {
      again = false;
      const Pn = live(mem).length;
      for (const id of live(mem)) {
        if (builtOn(mem, id)) continue;
        if (ownSaving(mem, mem.pieces[id].body, usesOf(mem, stream, id), useCost(mem, Pn)) <= 1e-9) {
          log.push(`  unpack ${pad(expand(mem, id), 18)} (no longer pays for itself)`);
          stream = unpack(mem, stream, id);
          again = true;
          break;
        }
      }
    }
  }
  return stream;
}

// ---------------------------------------------------------------- measures

// A piece cuts inside a word if, at any of its places in the text, it starts or ends between two letters.
function cutsInsideWord(text, piece) {
  const t = text.replace(/ /g, '_');
  const isLetter = (c) => c !== undefined && c !== '_';
  for (let i = t.indexOf(piece); i !== -1; i = t.indexOf(piece, i + 1)) {
    const startInside = isLetter(t[i - 1]) && isLetter(piece[0]);
    const endInside = isLetter(t[i + piece.length]) && isLetter(piece[piece.length - 1]);
    if (startInside || endInside) return true;
  }
  return false;
}

const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const fmt = (x) => x.toFixed(1);


// ---------------------------------------------------------------- C108: a population of fixed size N

// As C107's L+n, but a use costs 1 + log2(N)/log2(alphabet) for every piece, fixed by the population; nothing forms
// once N pieces are held.
function restPopulation(mem, stream, log, N) {
  const use = 1 + Math.log2(N) / Math.log2(mem.A);
  let full = false;
  for (;;) {
    const failing = live(mem).find(
      (id) => !builtOn(mem, id) && ownSaving(mem, mem.pieces[id].body, usesOf(mem, stream, id), use) <= 1e-9,
    );
    if (failing !== undefined) {
      log.push(`  unpack ${pad(expand(mem, failing), 18)} (no longer pays for itself)`);
      stream = unpack(mem, stream, failing);
      continue;
    }
    let best = null;
    for (const { run, k } of candidates(stream)) {
      const s = ownSaving(mem, run, k, use);
      if (s > 1e-9 && (!best || s > best.s)) best = { run, k, s };
    }
    if (!best) return { stream, full };
    if (live(mem).length >= N) return { stream, full: true };
    const r = form(mem, stream, best.run);
    stream = r.stream;
    log.push(`  form   ${pad(expand(mem, r.id), 18)} used ${best.k}×   its own saving ${fmt(best.s)}`);
  }
}

const SIZES = [8, 12, 16, 24, 32, 64, 128, 256, 1024];
const summary = [];
for (const name of ['reader', 'prose']) {
  const text = TEXTS[name];
  console.log('\n' + '='.repeat(100) + `\n${name} (${text.length} characters, alphabet ${new Set(letters(text)).size})\n` + '='.repeat(100));
  const gMem = newMemory(text);
  const gStream = restGlobal(gMem, letters(text), []);
  const gPieces = live(gMem).map((id) => expand(gMem, id));
  const gTotal = total(gMem, gStream);
  console.log(`\nG: ${gPieces.length} pieces, total ${fmt(gTotal)}: ${gPieces.join('  ')}`);
  for (const N of SIZES) {
    const mem = newMemory(text);
    const log = [];
    const { stream, full } = restPopulation(mem, letters(text), log, N);
    const pieces = live(mem).map((id) => expand(mem, id));
    const same = pieces.filter((p) => gPieces.includes(p));
    const extra = pieces.filter((p) => !gPieces.includes(p));
    const missing = gPieces.filter((p) => !pieces.includes(p));
    const e = total(mem, stream);
    const use = 1 + Math.log2(N) / Math.log2(mem.A);
    summary.push({ name, N, n: pieces.length, same: same.length, gn: gPieces.length, extra: extra.length, e, gTotal, full,
      inside: pieces.filter((p) => cutsInsideWord(text, p)).length });
    console.log(`\n--- N = ${N} (a use costs ${use.toFixed(2)})${full ? ', population full' : ''}`);
    console.log(`${pieces.length} pieces; ${same.length} of G's ${gPieces.length}; total ${fmt(e)} (G ${fmt(gTotal)})`);
    console.log(`  missing G's: ${missing.join('  ') || '-'}`);
    console.log(`  extra:       ${extra.join('  ') || '-'}`);
    if (SHOW_STEPS) console.log(log.join('\n'));
  }
}
console.log('\n' + '='.repeat(100) + '\nsummary\n' + '='.repeat(100));
console.log(`${pad('text', 8)} ${pad('N', 6)} ${pad('pieces', 7)} ${pad("G's kept", 9)} ${pad('extra', 6)} ${pad('full', 5)} ${pad('total', 8)} ${pad('vs G', 7)} inside a word`);
for (const r of summary)
  console.log(`${pad(r.name, 8)} ${pad(String(r.N), 6)} ${pad(String(r.n), 7)} ${pad(`${r.same}/${r.gn}`, 9)} ${pad(String(r.extra), 6)} ${pad(r.full ? 'yes' : '', 5)} ${pad(fmt(r.e), 8)} ${pad((r.e / r.gTotal - 1 < 0.0005 ? '+0.0' : '+' + (100 * (r.e / r.gTotal - 1)).toFixed(1)) + '%', 7)} ${r.inside}`);
