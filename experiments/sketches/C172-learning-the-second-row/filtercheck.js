// C172 · The filter check: a random sample of 300 candidates the code's filter doesn't propose (reads of empty places,
// sign reads of places without a sign, units writes to filled places), run through stage 1. All should fail.
// Run: node filtercheck.js > filtercheck.txt
'use strict';
process.env.REPORT = 'skip';
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/learn.js', 'utf8').split('const shard =')[0];
const mod = { exports: {} };
new Function('require', 'module', 'exports', 'process', src + ';module.exports={runOn,workedTarget,pageAtHandOver,ring,EDGE,LIMIT,RELS};')(require, mod, mod.exports, process);
const { runOn, workedTarget, pageAtHandOver, ring, EDGE, LIMIT, RELS } = mod.exports;
const { NP, at } = require('./circuit');
const { S, rng, digitsOf } = require('./teacher');
const rand = rng(1720);
const [top, mult] = [digitsOf(rand, 3), digitsOf(rand, 2)];
const { given, target } = workedTarget(top, mult);
const pg = pageAtHandOver(given);
const h2 = runOn({ ...S, name: 'X', rel: -1 }, given, target, LIMIT).log.h2At;
const L1 = runOn({ ...S, name: 'X', rel: -1 }, given, target, LIMIT).log.h2At + 12;
const pick = rng(99), any = (n) => Math.floor(pick() * n);
// C172: 100 of each kind (the first check's sample was nearly all empty reads)
let tried = 0, passed = 0, why = { empty: 0, nosign: 0, filled: 0 }, passedBy = { empty: 0, nosign: 0, filled: 0 };
while (tried < 300) {
  const rel = RELS[any(RELS.length)], c0 = EDGE + rel;
  const near = [...Array(NP).keys()].filter((p) => ring(p) <= 2);
  const reads = [near[any(near.length)], near[any(near.length)], near[any(near.length)]];
  if (new Set(reads).size < 3) continue;
  const s = any(NP), u = any(NP);
  const get = (p) => { const rc = at(c0, p); return rc ? pg.get(rc.join(',')) : null; };
  const emptyRead = reads.some((p) => typeof get(p) !== 'number'), noSign = get(s) !== '×', filled = get(u) !== undefined;
  // exactly one kind of filtered-out part, so each kind is tested on its own
  if ((emptyRead + noSign + filled) !== 1) continue;
  const kind = emptyRead ? 'empty' : noSign ? 'nosign' : 'filled';
  if (why[kind] >= 100) continue;
  tried++; why[kind]++;
  const X = { name: 'X', reads, hold: 0, s, u, rel };
  const r = runOn(X, given, target, L1);
  const rc = at(c0, u);
  // C172 fix (after the first check): count only a cooling after the hand-over; the first check counted places the first
  // row had already cooled (writes onto filled first-row places), which says nothing about the candidate
  if (rc && r.log.coolAt.has(rc.join(',')) && r.log.coolAt.get(rc.join(',')) > h2) { passed++; passedBy[kind]++; }
}
console.log(`C172 · filter check: ${tried} filtered-out candidates run through stage 1 (${why.empty} with a read of an empty place, ${why.nosign} with a sign read of a place without a sign, ${why.filled} with a units write to a filled place); passed stage 1: ${passed} (by kind: ${JSON.stringify(passedBy)})`);
