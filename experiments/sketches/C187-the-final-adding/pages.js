// C179 · the second-row lesson pages (C177's, unchanged)
'use strict';
const teacher = require('./teacher');
const EDGE = 10;
// GIVEN, the encoder: a second-row lesson. The page as C170 gives it (top padded with two 0s, the multiplier, carries-in,
// the placeholder, the sign) with the first row already done (its answer, carries and signs, written by the teacher);
// the target is the second row and its carries
function secondRowLesson(top, mult) {
  const t = teacher.build('start');
  const given = new Map();
  const T = [0, 0, ...top];
  T.forEach((d, j) => given.set(`1,${EDGE - T.length + 1 + j}`, d));
  mult.forEach((d, j) => given.set(`2,${EDGE - 1 + j}`, d));
  given.set('0,' + EDGE, 0); given.set(`5,${EDGE - 1}`, 0); given.set('7,' + EDGE, 0); given.set('6,' + EDGE, 0); given.set('4,' + EDGE, '×');
  for (const [k, x] of given) { const [r, c] = k.split(',').map(Number); t.write(r, c, x); }
  t.m.reset(); t.m.moment = 0;
  t.m.invoke([['=', 'F' + EDGE]], { maxMoments: 900 });
  const page = new Map(given), target = new Map();
  for (const [k, x] of t.content) {
    const r = +k.split(',')[0];
    if (given.has(k)) continue;
    if ([0, 3, 4].includes(r)) page.set(k, x);
    if ([5, 6].includes(r)) target.set(k, x);
  }
  return { page, target };
}
const secondRowRight = (top, mult, content) => {
  let s = ''; for (let c = 0; c < 12; c++) { if (c === EDGE) continue; const x = content.get(`6,${c}`); if (typeof x === 'number') s += x; }
  const v = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
  return s !== '' && Number(s) === v(top) * mult[0];
};
// C187 · GIVEN, the encoder: a final-adding lesson (adding the two rows). The page is the question with both rows already
// done (the first row, its carries; the second row, its carries, the placeholder), written by the teacher (C170's
// procedure); the first row's signs are left off and a '+' is put under the first column instead, as on paper before the
// sum; the 0 carried in for the sum is given. The target is the sum and its carries.
function finalAddLesson(top, mult) {
  const t = teacher.build('start');
  const given = new Map();
  const T = [0, 0, ...top];
  T.forEach((d, j) => given.set(`1,${EDGE - T.length + 1 + j}`, d));
  mult.forEach((d, j) => given.set(`2,${EDGE - 1 + j}`, d));
  given.set('0,' + EDGE, 0); given.set(`5,${EDGE - 1}`, 0); given.set('7,' + EDGE, 0); given.set('6,' + EDGE, 0); given.set('4,' + EDGE, '×');
  for (const [k, x] of given) { const [r, c] = k.split(',').map(Number); t.write(r, c, x); }
  t.m.reset(); t.m.moment = 0;
  t.m.invoke([['=', 'F' + EDGE]], { maxMoments: 900 });
  const page = new Map(), target = new Map();
  for (const [k, x] of t.content) {
    const r = +k.split(',')[0];
    if (r === 4) continue; // the first row's signs left off
    if ([0, 1, 2, 3, 5, 6].includes(r)) page.set(k, x);
    else if (k === '7,' + EDGE) page.set(k, x); // the 0 carried in
    else if ([7, 8].includes(r)) target.set(k, x);
  }
  page.set('4,' + EDGE, '+');
  return { page, target };
}
const finalAddRight = (top, mult, content) => {
  let s = ''; for (let c = 0; c < 12; c++) { const x = content.get(`8,${c}`); if (typeof x === 'number') s += x; }
  const v = (ds) => ds.reduce((t, d) => t * 10 + d, 0);
  return s !== '' && Number(s) === v(top) * v(mult);
};
module.exports = { secondRowLesson, secondRowRight, finalAddLesson, finalAddRight };
