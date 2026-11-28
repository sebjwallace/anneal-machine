// C187 · build check (before the hypothesis): a hand-written final-adding way of working (as C170's adding frame, with the
// family read from the '+' under the first column and written along), kept in the memory, settles final-adding pages and
// gets the sum right
'use strict';
const M = require('./memory');
const { finalAddLesson, finalAddRight } = require('./pages');
const { PLACES } = require('./circuit');
const P_ = (a, b) => PLACES.findIndex(([x, y]) => x === a && y === b);
const mem = M.buildMemory({ tieFirstFormed: true });
const F = { reads: [P_(0, 0), P_(3, 0), P_(4, 0)], s: P_(1, 0), u: P_(5, 0), k: P_(4, -1), w: P_(1, -1), mv: 0 };
const fr = M.keepFrameNoLink(mem, F);
const r = M.rng(8); let set = 0, ok = 0;
for (let i = 0; i < 10; i++) { const top = M.digitsOf(r, 2 + (i % 4)), m = M.digitsOf(r, 2); const { page, target } = finalAddLesson(top, m); if (M.runPage(mem, '+', page, target, fr, 10).log.settled) set++; if (finalAddRight(top, m, M.runPage(mem, '+', page, null, fr, 10).content)) ok++; }
console.log(`hand-written final adding: settled ${set}/10, sum right ${ok}/10`);
