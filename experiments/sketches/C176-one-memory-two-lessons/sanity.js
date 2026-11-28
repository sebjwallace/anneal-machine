// C176 · build check (before the hypothesis): hand-written adding (seen with +) and times one digit (seen with ×) kept
// in the one memory; the start's recall picks by the view; offering a frame with the cue makes it win
'use strict';
const { buildMemory, keepFrame, runPage, lesson, right, rng, digitsOf } = require('./learn');
const { PLACES } = require('./circuit');
const P_ = (a, b) => PLACES.findIndex(([x, y]) => x === a && y === b);
const ADD = { reads: [P_(-1, 0), P_(-2, 0), P_(-3, 0)], s: P_(1, 0), u: P_(0, 0), k: P_(-3, -1), w: P_(1, -1), mv: 0 };
const TIM = { ...ADD, hold: 0 };
let t = Date.now();
const mem = buildMemory({ tieFirstFormed: false });
console.log('build', Date.now() - t, 'ms', mem.m.assemblies.length, 'assemblies');
keepFrame(mem, ADD, '+'); keepFrame(mem, TIM, '×');
for (const kind of ['+', '×']) {
  const r = rng(3); let ok = 0, set = 0; const on = new Map(); t = Date.now();
  for (let i = 0; i < 20; i++) {
    const top = digitsOf(r, 2 + i % 4), bot = digitsOf(r, kind === '+' ? 1 + i % 4 : 1);
    const { page, target } = lesson(kind, top, bot);
    if (right(kind, top, bot, runPage(mem, kind, page, null, null).content)) ok++;
    const w = runPage(mem, kind, page, target, null); if (w.log.settled) set++; const k = [...w.log.frOn].join('+'); on.set(k, (on.get(k) || 0) + 1);
  }
  console.log(kind, 'right', ok, '/20; worked examples settled', set, '/20; recalled', [...on], ((Date.now() - t) / 40).toFixed(0), 'ms a run');
}
const { page, target } = lesson('×', [5, 3, 1], [9]);
const o = runPage(mem, '×', page, target, 'Fr0');
console.log('offering the adding frame on a times page: on', [...o.log.frOn], 'settled', o.log.settled, 'cooled', o.log.cooled.size);
