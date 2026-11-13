// C49 · GENERAL MEMORY ON ITS OWN (owner: if specific experiences have their own store, general memory needn't hold
// specific walks at all, and there's no trade-off between the two). Here general memory may hold only general shapes:
// things with at least one free place. Specific walks are not kept in it (they'd live in the store of experiences,
// C47). Same learner and prices as C43 otherwise. Moves: make a shape from two pictures that differ at some steps, widen
// a shape with a picture, merge two shapes, undo a shape. Question: what does it settle into now? The one broad shape
// "any start → J → any end", or several narrow ones (the pricing question), and what about the paired world, where
// "any start, any end" would be false?
'use strict';
const path = require('path');
const { Learner } = require(path.join(__dirname, '../C43-item-learner/items.js'));
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const { GeneralOnly } = require(path.join(__dirname, 'general.js'));
const run = (label, eps, WIN) => { const r = rng(49), counts = new Map(), keyed = new Map();
  for (let i = 0; i < WIN; i++) { const e = eps[Math.floor(r() * eps.length)], k = e.join(); if (!keyed.has(k)) keyed.set(k, new Map([[0, e[0]], [1, e[1]], [2, e[2]]])); counts.set(k, (counts.get(k) || 0) + 1); }
  const window = [...counts].map(([k, n]) => [keyed.get(k), n]), items = [...new Set(eps.flat())], L = new GeneralOnly(items, 3), t0 = Date.now(); L.rest(window);
  const E = L.energy(window), none = new GeneralOnly(items, 3).energy(window);
  const starts = [...new Set(eps.map((e) => e[0]))], ends = [...new Set(eps.map((e) => e[2]))], B = new GeneralOnly(items, 3); B.kinds = [{ id: 1, at: [['J', 1]], slots: [{ t: 0, fill: starts }, { t: 2, fill: ends }] }]; const broad = B.energy(window);
  const desc = L.kinds.map((K) => [...K.at.map(([s, t]) => [s, t]), ...K.slots.map((sl) => [sl.fill.join('/'), sl.t])].sort((a, b) => a[1] - b[1]).map(([s]) => s).join(' → '));
  console.log(`  ${label.padEnd(24)} ${String(WIN).padStart(5)} walks · ${((Date.now() - t0) / 1000).toFixed(1)} s · energy: settled ${E.E.toFixed(0)}, one broad shape ${broad.E.toFixed(0)}, nothing ${none.E.toFixed(0)}\n      settled into ${L.kinds.length ? desc.join('  |  ') : 'nothing'}`); };
const hub = (n) => { const S = 'ABCDEF'.slice(0, n).split(''), E = 'PQRSTU'.slice(0, n).split(''), out = []; for (const a of S) for (const b of E) if (!['AQ', 'BP'].includes(a + b)) out.push([a, 'J', b]); return out; };
for (const W of [100, 300, 1000]) { console.log(`\n${W} walks seen`); run('hub 4 x 4', hub(4), W); run('hub 6 x 6', hub(6), W); run('paired (A→J→P, G→J→O)', [['A', 'J', 'P'], ['G', 'J', 'O']], W); }
