// C174 · Heat and pieces: C172's search recounted under two proposing rules from the owner's picture. Every run in the
// circuit is deterministic, so a candidate's stage-1 and stage-2 outcomes are C172's recorded ones; nothing is re-run.
//   heat first: the first write goes where the heat is (a place of the working still to be done, in reach of the start)
//   pieces: a part the first stage didn't place (the carry write, the move) is placed only by a relation it had, in a
//     known way of working (the first row), to a part already placed; hold or not as before
// Run: node recount.js > out.txt
'use strict';
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/c172-learn.js', 'utf8').split('const shard =')[0];
const mod = { exports: {} };
new Function('require', 'module', 'exports', 'process', src + ';module.exports={workedTarget,pageAtHandOver,stage1Candidates,EDGE,RELS};')(require, mod, mod.exports, { env: {} });
const { workedTarget, pageAtHandOver, stage1Candidates, EDGE } = mod.exports;
const { NP, PLACES, at } = require('./circuit');
const { H, S, rng, digitsOf } = require('./teacher');
const rand = rng(1720);
const [top, mult] = [digitsOf(rand, 3), digitsOf(rand, 2)];
const { given, target } = workedTarget(top, mult);
const pg = pageAtHandOver(given);
const key1 = (X) => `${X.rel}|${X.reads.join('.')}|${X.s}|${X.u}`;
const parts = [0, 1].map((i) => JSON.parse(fs.readFileSync(`stage-${i}.json`, 'utf8')));
const keep1 = new Set(parts.flatMap((p) => p.keep1).map(key1));
const settledAll = parts.flatMap((p) => p.settled);
const key2 = (X) => `${key1(X)}|${X.hold}|${X.k}|${X.mv}`;
const settledSet = new Set(settledAll.map(key2));
const all = stage1Candidates(given, 2);
// heat: a place of the second row's working (the target) that is still empty when the second frame starts
const hot = (X) => { const rc = at(EDGE + X.rel, X.u); return rc && target.has(rc.join(',')) && !pg.has(rc.join(',')); };
// the known way of working's relations: for each pair of its parts, the offset between their places
const off = (a, b) => [PLACES[b][0] - PLACES[a][0], PLACES[b][1] - PLACES[a][1]];
const hp = { A: H.reads[0], B: H.reads[1], K: H.reads[2], s: H.s, u: H.u, k: H.k };
const kFrom = (X) => { // carry-write places reachable by a known relation from a placed part
  const placed = { A: X.reads[0], B: X.reads[1], K: X.reads[2], s: X.s, u: X.u }, out = new Set();
  for (const [n, p] of Object.entries(placed)) { const [dr, dc] = off(hp[n], hp.k); const q = PLACES.findIndex(([a, b]) => a === PLACES[p][0] + dr && b === PLACES[p][1] + dc); if (q >= 0 && q !== X.u) out.add(q); }
  return [...out];
};
const rows = [];
const arm = (label, s1, stage2) => {
  const kept = s1.filter((X) => keep1.has(key1(X)));
  let tried2 = 0; const found = [];
  for (const X of kept) for (const Y of stage2(X)) { tried2++; if (settledSet.has(key2(Y))) found.push(Y); }
  const right = found.filter((Y) => Y.reads[0] === S.reads[0]).length;
  rows.push(`| ${label} | ${s1.length.toLocaleString()} | ${kept.length} | ${tried2.toLocaleString()} | ${(s1.length + tried2).toLocaleString()} | ${found.length} (${right} right, ${found.length - right} coincidences) |`);
};
const every = (X) => { const o = []; for (const hold of [0, undefined]) for (let k = 0; k < NP; k++) for (let mv = 0; mv < 2; mv++) if (k !== X.u) o.push({ ...X, hold, k, mv }); return o; };
const byPieces = (X) => { const o = []; for (const hold of [0, undefined]) for (const k of kFrom(X)) o.push({ ...X, hold, k, mv: H.mv }); return o; };
arm('blind (C172)', all, every);
arm('heat first', all.filter(hot), every);
arm('heat first, then pieces', all.filter(hot), byPieces);
console.log(['C174 · Heat and pieces: C172\'s search recounted (no new runs)', '', `Worked example ${top.join('')} × ${mult.join('')}; reads within two rows of the focus, as C172.`, '',
  '| proposing | stage 1 tries | kept | stage 2 tries | total tries | settled the page |', '|---|---|---|---|---|---|', ...rows].join('\n'));
