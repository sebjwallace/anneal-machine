// C43 · run: episodes "start → J → end" in a HUB (every start with every end, a few held out) of growing size, and the
// PAIRED control (A always on to P, G always on to O). Window of 100 episodes, as the engine's flow window.
// Then recall: two items shown, the other step hidden.
'use strict';
const path = require('path');
const { Learner } = require(path.join(__dirname, 'items.js'));
const { rng } = require(path.join(__dirname, '../../../src/worlds/catalogue.js'));
const WIN = +(process.env.WIN || 100), LOG = !!process.env.LOG;
const pic = (a, b, c) => new Map([[0, a], [1, b], [2, c]].filter(([, s]) => s));
// recall uses the engine's completion rule for items (complete.js): a thing (or a kind's version) comes back if two or
// more cued items fall inside it; most cues first, then fewest filled; equal best that differ → neither
const show = (L, p, hid) => { const ex = L.explainers().map((e) => ({ ...e, takes: e.at.filter(([s, t]) => p.get(t) === s).length, wrong: e.at.filter(([s, t]) => p.has(t) && p.get(t) !== s).length }))
    .filter((e) => e.takes >= 2 && !e.wrong).sort((a, b) => b.takes - a.takes || a.at.length - b.at.length);
  if (!ex.length) return 'nothing'; const k = (e) => e.at.map(([s, t]) => s + t).sort().join();
  if (ex.some((e) => e.takes === ex[0].takes && e.at.length === ex[0].at.length && k(e) !== k(ex[0]))) return 'undecided (two fit equally)';
  const r = ex[0], at = new Map(); for (const [s, t] of r.at) at.set(t, s); const tag = r.version && !L.__seen.has(r.at.map(([s, t]) => s + t).sort().join()) ? '   (never happened: made by the kind)' : ''; return [0, 1, 2].map((t) => (at.get(t) || '·') + (hid.has(t) && at.get(t) ? '*' : '')).join(' → ') + tag; };
function world(nS, nE, held) { const starts = 'ABCDEF'.slice(0, nS).split(''), ends = 'PQRSTU'.slice(0, nE).split(''), eps = [];
  for (const a of starts) for (const b of ends) if (!held.has(a + b)) eps.push([a, 'J', b]); return { starts, ends, eps }; }
function run(label, eps, tests, items) { const r = rng(43), counts = new Map(), keyed = new Map();
  for (let i = 0; i < WIN; i++) { const e = eps[Math.floor(r() * eps.length)], k = e.join(); if (!keyed.has(k)) keyed.set(k, pic(...e)); counts.set(k, (counts.get(k) || 0) + 1); }
  const window = [...counts].map(([k, n]) => [keyed.get(k), n]), L = new Learner(items, 3), t0 = Date.now(); L.__seen = new Set(window.map(([p]) => [...p].map(([t, s]) => s + t).sort().join()));
  if (LOG) console.log(label); L.rest(window, LOG); const E = L.energy(window);
  const kinds = L.kinds.map((k) => `[${k.at.map(([s, t]) => `${s}@${t + 1}`).join(' ')}] slots ${k.slots.map((sl) => `@${sl.t + 1}: ${sl.fill.join('/')}`).join(', ')}`);
  console.log(`\n${label}: ${eps.length} different episodes · ${((Date.now() - t0) / 1000).toFixed(1)} s · energy ${E.E.toFixed(0)} (structure ${E.st.toFixed(0)}, flow ${E.fl.toFixed(0)})`);
  console.log(`  holds ${L.things.length} plain episode${L.things.length === 1 ? '' : 's'}${kinds.length ? ' and kind ' + kinds.join('; ') : ', no kinds'}`);
  for (const [lab, p, hid] of tests) console.log(`  ${lab.padEnd(30)} ${show(L, p, new Set(hid))}`); return L; }
for (const [nS, nE] of [[2, 2], [3, 3], [4, 4], [6, 6]]) { const held = new Set(['AQ', 'BP']), W0 = world(nS, nE, held);
  run(`HUB ${nS} starts × ${nE} ends (A→J→Q and B→J→P held out)`, W0.eps, [
    ['A + Q (never happened)', pic('A', null, 'Q'), [1]], ['A + P (happened)', pic('A', null, 'P'), [1]], ['A + J (where next?)', pic('A', 'J', null), [2]], ['A alone', pic('A', null, null), [1, 2]]],
  ['J', ...W0.starts, ...W0.ends]); }
run('PAIRED (A→J→P and G→J→O only)', [['A', 'J', 'P'], ['G', 'J', 'O']], [
  ['A + O (never happened)', pic('A', null, 'O'), [1]], ['A + P (happened)', pic('A', null, 'P'), [1]], ['A + J (where next?)', pic('A', 'J', null), [2]], ['A alone', pic('A', null, null), [1, 2]]], ['A', 'G', 'J', 'P', 'O']);
