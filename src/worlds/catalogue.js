// CATALOGUE (C01): about 100 designed 5x5 black-and-white patterns, in families with deliberate shared parts, plus the
// noisy presentation stream. A pattern is 25 bits, row by row (cell r,c is bit r*5+c). Families, shapes and parts are for
// the scorer and the viewer only: the machine never sees them. Runs in Node (require) and in the browser (inlined).
'use strict';
const N = 5, SIZE = N * N;

// ---- building blocks: everything is drawn from bars, corners, boxes and blocks, so shapes share parts on purpose
const blank = () => new Uint8Array(SIZE);
const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
function cells(list) { const p = blank(); for (const [r, c] of list) if (r >= 0 && r < N && c >= 0 && c < N) p[r * N + c] = 1; return p; }
function or(...ps) { const p = blank(); for (const q of ps) for (let i = 0; i < SIZE; i++) if (q[i]) p[i] = 1; return p; }
function rows(...lines) { const p = blank(); lines.forEach((l, r) => [...l].forEach((ch, c) => { if (ch === '#') p[r * N + c] = 1; })); return p; }
const hbar = (r, c0 = 0, c1 = N - 1) => cells(range(c0, c1).map((c) => [r, c]));
const vbar = (c, r0 = 0, r1 = N - 1) => cells(range(r0, r1).map((r) => [r, c]));
// an L of two arms inside the size x size box whose top-left is (r, c); which = 'tl' | 'tr' | 'bl' | 'br' names its corner
function corner(r, c, size, which) { const e = size - 1, top = which[0] === 't', left = which[1] === 'l';
  return or(hbar(top ? r : r + e, c, c + e), vbar(left ? c : c + e, r, r + e)); }
function frame(r, c, size) { const e = size - 1; return or(hbar(r, c, c + e), hbar(r + e, c, c + e), vbar(c, r, r + e), vbar(c + e, r, r + e)); }
function block(r, c, size) { const l = []; for (const i of range(0, size - 1)) for (const j of range(0, size - 1)) l.push([r + i, c + j]); return cells(l); }
const plus = (r, c, arm) => or(hbar(r, c - arm, c + arm), vbar(c, r - arm, r + arm));
// a quarter turn clockwise: (r, c) goes to (c, N-1-r)
function rot(p) { const q = blank(); for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (p[r * N + c]) q[c * N + (N - 1 - r)] = 1; return q; }

// ---- the catalogue. shape = the same shape wherever it sits (a shifted copy shares its shape); parts = the bars a
// composition was built from (for the composition tests later). An exact duplicate is dropped and reported.
function build() {
  const out = [], seen = new Map(), dropped = [];
  const add = (family, name, bits, shape = name, parts = null) => {
    const key = bits.join('');
    if (seen.has(key)) { dropped.push({ name, family, sameAs: seen.get(key) }); return; }
    seen.set(key, name); out.push({ id: out.length, name, family, shape, parts, bits });
  };
  const dDown = cells(range(0, 4).map((i) => [i, i])), dUp = cells(range(0, 4).map((i) => [i, 4 - i]));

  for (const r of range(0, 4)) add('bars', `row ${r}`, hbar(r), 'row');
  for (const c of range(0, 4)) add('bars', `col ${c}`, vbar(c), 'col');

  add('diagonals', 'diag \\', dDown);
  add('diagonals', 'diag /', dUp);
  add('diagonals', 'short \\ upper', cells(range(0, 3).map((i) => [i, i + 1])), 'short \\');
  add('diagonals', 'short \\ lower', cells(range(0, 3).map((i) => [i + 1, i])), 'short \\');
  add('diagonals', 'short / upper', cells(range(0, 3).map((i) => [i, 3 - i])), 'short /');
  add('diagonals', 'short / lower', cells(range(0, 3).map((i) => [i + 1, 4 - i])), 'short /');

  for (const r of [0, 2, 4]) for (const [c0, side] of [[0, 'left'], [2, 'right']]) add('half bars', `row ${r} ${side}`, hbar(r, c0, c0 + 2), 'half row');
  for (const c of [0, 2, 4]) for (const [r0, side] of [[0, 'top'], [2, 'bottom']]) add('half bars', `col ${c} ${side}`, vbar(c, r0, r0 + 2), 'half col');

  for (const w of ['tl', 'tr', 'bl', 'br']) {
    add('corners', `corner ${w}`, corner(w[0] === 't' ? 0 : 2, w[1] === 'l' ? 0 : 2, 3, w), `corner ${w}`);
    add('corners', `corner ${w} centre`, corner(1, 1, 3, w), `corner ${w}`);           // the same corner, shifted inwards
  }
  for (const w of ['tl', 'tr', 'bl', 'br']) add('big Ls', `big L ${w}`, corner(0, 0, 5, w));

  add('Ts', 'T top', or(hbar(0), vbar(2)), 'T top', ['row 0', 'col 2']);
  add('Ts', 'T bottom', or(hbar(4), vbar(2)), 'T bottom', ['row 4', 'col 2']);
  add('Ts', 'T left', or(vbar(0), hbar(2)), 'T left', ['col 0', 'row 2']);
  add('Ts', 'T right', or(vbar(4), hbar(2)), 'T right', ['col 4', 'row 2']);
  add('Ts', 'small T', or(hbar(0, 1, 3), vbar(2, 0, 2)), 'small T');
  add('Ts', 'small T lower', or(hbar(1, 1, 3), vbar(2, 1, 3)), 'small T');             // shifted down one

  add('crosses', 'plus', plus(2, 2, 2), 'plus', ['row 2', 'col 2']);
  for (const [r, c] of [[2, 2], [1, 1], [1, 3], [3, 1], [3, 3]]) add('crosses', `small plus ${r},${c}`, plus(r, c, 1), 'small plus');
  add('crosses', 'X', or(dDown, dUp), 'X', ['diag \\', 'diag /']);

  add('boxes', 'frame', frame(0, 0, 5), 'frame', ['row 0', 'row 4', 'col 0', 'col 4']);
  for (const [r, c] of [[0, 0], [0, 2], [2, 0], [2, 2], [1, 1]]) add('boxes', `small box ${r},${c}`, frame(r, c, 3), 'small box');

  for (const [r, c] of [[0, 0], [0, 3], [3, 0], [3, 3], [1, 1], [2, 2]]) add('blocks', `block ${r},${c}`, block(r, c, 2), 'block');
  add('blocks', 'big block', block(1, 1, 3));

  add('letters', 'C', rows('.####', '#....', '#....', '#....', '.####'));
  add('letters', 'U', rows('#...#', '#...#', '#...#', '#...#', '#####'), 'U', ['col 0', 'col 4', 'row 4']);
  add('letters', 'H', rows('#...#', '#...#', '#####', '#...#', '#...#'), 'H', ['col 0', 'col 4', 'row 2']);
  add('letters', 'E', rows('#####', '#....', '#####', '#....', '#####'), 'E', ['row 0', 'row 2', 'row 4', 'col 0']);
  add('letters', 'F', rows('#####', '#....', '#####', '#....', '#....'), 'F', ['row 0', 'row 2', 'col 0']);
  add('letters', 'Z', rows('#####', '...#.', '..#..', '.#...', '#####'));
  add('letters', 'S', rows('.####', '#....', '.###.', '....#', '####.'));
  add('letters', 'P', rows('####.', '#...#', '####.', '#....', '#....'));

  add('brackets', '[', rows('###..', '#....', '#....', '#....', '###..'));
  add('brackets', ']', rows('..###', '....#', '....#', '....#', '..###'));

  const up = rows('..#..', '.#.#.', '#...#', '.....', '.....');
  add('chevrons', 'chevron up', up); add('chevrons', 'chevron right', rot(up));
  add('chevrons', 'chevron down', rot(rot(up))); add('chevrons', 'chevron left', rot(rot(rot(up))));

  const step = rows('#....', '##...', '.##..', '..##.', '...##');
  add('steps', 'steps \\', step); add('steps', 'steps /', rot(step));

  // the "bars problem": shapes that are nothing but bars laid over each other
  for (const [r, c] of [[1, 1], [1, 3], [3, 1], [3, 3], [0, 1], [4, 3], [1, 0], [3, 4]])
    add('bar pairs', `row ${r} + col ${c}`, or(hbar(r), vbar(c)), 'row + col', [`row ${r}`, `col ${c}`]);
  for (const [a, b] of [[0, 2], [1, 3], [2, 4], [0, 4]]) add('bar pairs', `rows ${a} + ${b}`, or(hbar(a), hbar(b)), 'two rows', [`row ${a}`, `row ${b}`]);
  for (const [a, b] of [[0, 2], [1, 3], [2, 4], [0, 4]]) add('bar pairs', `cols ${a} + ${b}`, or(vbar(a), vbar(b)), 'two cols', [`col ${a}`, `col ${b}`]);
  const bar = ([k, i]) => (k === 'row' ? hbar(i) : vbar(i));
  for (const t of [[['row', 1], ['col', 1], ['col', 3]], [['row', 3], ['col', 1], ['col', 3]], [['row', 1], ['row', 3], ['col', 2]],
    [['row', 1], ['row', 3], ['col', 1]], [['row', 0], ['row', 4], ['col', 2]], [['col', 0], ['col', 4], ['row', 1]]]) {
    const names = t.map(([k, i]) => `${k} ${i}`);
    add('bar triples', names.join(' + '), or(...t.map(bar)), 'three bars', names);
  }
  return { patterns: out, dropped };
}

// ---- the stream: patterns in random order (each pass a fresh shuffle, so all are seen equally often), each flash flipping
// every cell independently with chance `noise` (5% flips about 1.25 of 25 cells). `noise` may be a number or a function
// (the viewer's slider). Seeded, so a run can be repeated exactly.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function noisy(bits, p, r) { const q = bits.slice(); for (let i = 0; i < SIZE; i++) if (r() < p) q[i] ^= 1; return q; }
function* stream(patterns, { seed = 1, noise = 0.05 } = {}) {
  const r = rng(seed), order = patterns.map((_, i) => i);
  for (let t = 0; ;) {
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    for (const id of order) { const p = typeof noise === 'function' ? noise() : noise; yield { t: t++, id, clean: patterns[id].bits, bits: noisy(patterns[id].bits, p, r) }; }
  }
}

const CATALOGUE = build();
if (typeof module !== 'undefined') module.exports = { N, SIZE, CATALOGUE, build, stream, noisy, rng };
