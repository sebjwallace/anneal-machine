// C175 · each.js (written after the run, disclosed): arm (c) repeated with each of lesson 1's six equal ways of working
// on its own, since "the first" of six was an arbitrary choice. Run: node each.js > each.txt
'use strict';
const src = require('fs').readFileSync(__dirname + '/lessons.js', 'utf8').split('const out = [')[0];
const mod = { exports: {} };
new Function('require', 'module', 'exports', 'process', src + ';module.exports={learn,withPieces,fromScratch,rng,digitsOf,say,test};')(require, mod, mod.exports, process);
const { learn, withPieces, fromScratch, rng, digitsOf, say, test } = mod.exports;
const r1 = rng(1751), add = [[digitsOf(r1, 3), digitsOf(r1, 3)], [digitsOf(r1, 4), digitsOf(r1, 2)]];
const r2 = rng(1752), times = [[digitsOf(r2, 3), digitsOf(r2, 1)], [digitsOf(r2, 4), digitsOf(r2, 1)]];
const L = learn('+', add, fromScratch);
const out = ['C175 · arm (c) with each of lesson 1\'s six on its own', '', '| lesson 1\'s way of working offered | tries | learned in lesson 2 | test |', '|---|---|---|---|'];
for (const X of L.kept) { const R = learn('×', times, (p, t) => withPieces(p, t, [X], true)); out.push(`| ${say(X)} | ${R.tries} | ${R.kept.map(say).join('; ') || 'nothing'} | ${R.kept.map((Y) => test('×', Y, rng(5151))).join(', ') || '-'} |`); }
console.log(out.join('\n'));
