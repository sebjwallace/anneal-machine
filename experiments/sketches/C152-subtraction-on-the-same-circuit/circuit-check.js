// C152 · check of the test circuit alone (written after the first seed, when the store gave nothing): the two steps the
// lanes settled on, bound together into one circuit by hand, bypassing the store. Does the circuit hold both procedures,
// or do they interfere through their shared parts? Run: node circuit-check.js
'use strict';
const { runSum, PLACES } = require('./circuit');
const P = (dr, dc) => PLACES.findIndex(([a, b]) => a === dr && b === dc);
const ADD = { reads: [P(-1, 0), P(-2, 0), P(-3, 0)], u: P(0, 0), k: P(-3, -1), mv: 0, fam: 'Σ' };
const SUB = { reads: [P(-2, 0), P(-1, 0), P(-3, 0)], u: P(0, 0), k: P(-3, -1), mv: 0, fam: 'Δ' };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const digitsOf = (rand, n) => { const d = [1 + Math.floor(rand() * 9)]; for (let i = 1; i < n; i++) d.push(Math.floor(rand() * 10)); return d; };
const value = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
const rand = rng(99), PER = 20;
for (const [label, steps] of [['"+" alone', { '+': ADD }], ['"−" alone', { '−': SUB }], ['both in one circuit', { '+': ADD, '−': SUB }]]) {
  const cells = [];
  for (const kind of Object.keys(steps)) for (const n of [4, 5, 6, 7, 8]) {
    let right = 0, halted = 0;
    for (let i = 0; i < PER; i++) {
      let top = digitsOf(rand, n), bottom = digitsOf(rand, n);
      if (kind === '−' && value(top) < value(bottom)) [top, bottom] = [bottom, top];
      const r = runSum(steps, kind, top, bottom, 10, 200);
      const w = r.answer.filter((x) => x !== null);
      if (w.length && value(w) === (kind === '+' ? value(top) + value(bottom) : value(top) - value(bottom))) right++;
      if (r.halted) halted++;
    }
    cells.push(`${kind} ${n} digits: ${right}/${PER} (stopped by itself ${halted})`);
  }
  console.log(`${label}: ${cells.join('; ')}`);
}
