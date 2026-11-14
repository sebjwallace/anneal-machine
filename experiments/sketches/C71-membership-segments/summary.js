// Merges run-<name>-a.txt (M 25-200) and run-<name>-b.txt (M 400) into tables. `node summary.js`
'use strict';
const fs = require('fs'), path = require('path'), dir = __dirname;
const runs = {};
for (const f of fs.readdirSync(dir).filter(f => /^run-.*-[ab]\.txt$/.test(f))) {
  const name = f.slice(4, -6), txt = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  const hdr = txt.find(l => l.startsWith('M (episode objects)')); if (!hdr) continue;
  const Ms = hdr.slice(58).trim().split(/\s+/).map(Number), r = (runs[name] = runs[name] || {});
  for (const l of txt) { if (l.length < 60 || l.startsWith('M (') || l.startsWith('sketch')) continue;
    const label = l.slice(0, 58).trim(), vals = l.slice(58).trim().split(/\s+/); if (vals.length !== Ms.length) continue;
    Ms.forEach((M, i) => { (r[label] = r[label] || {})[M] = parseFloat(vals[i]); }); } }
const MS = [25, 50, 100, 200, 400], CP = [2, 4, 8, 16];
const ARMS = [['sumfit', 'sum, fit-normalised'], ['sumraw', 'sum, raw'], ['seg16', 'segments 16'], ['segall', 'segments all'], ['seg16cast', 'segments 16 + cast'], ['segallcast', 'segments all + cast']];
const g = (name, label, M) => runs[name] && runs[name][label] ? runs[name][label][M] : undefined;
const f = (v) => v === undefined || Number.isNaN(v) ? '–' : String(v);
const table = (title, rows, cols) => { console.log('\n' + title); console.log('| ' + cols.join(' | ') + ' |'); console.log('|' + cols.map(() => '---').join('|') + '|'); for (const r of rows) console.log('| ' + r.join(' | ') + ' |'); };
// 1. strict episode recall and blends, by M, per arm x CPC
for (const [lab, t] of [['episode x -> Y: strict', 'strict episode recall'], ['episode x -> Y: blend', 'episode blends'], ['episode x -> Y: lenient', 'lenient episode recall']]) {
  const rows = []; for (const [a, an] of ARMS) for (const c of CP) rows.push([`${an}, ${c} cells`, ...MS.map(M => f(g(`${a}-c${c}`, lab, M)))]);
  table(`${t} (%, by M = episode objects)`, rows, ['arm, cells per column', ...MS.map(String)]); }
// 2. capacity
const cap = (name, lv) => { let c = 0; for (const M of MS) { const v = g(name, 'episode x -> Y: strict', M); if (v === undefined) return '–'; if (v >= lv) c = M; else break; } return c ? String(c) : '<25'; };
{ const rows = []; for (const [a, an] of ARMS) rows.push([an, ...CP.map(c => cap(`${a}-c${c}`, 75) + ' / ' + cap(`${a}-c${c}`, 50))]);
  table('capacity: largest M with strict episode recall >= 75% / >= 50%', rows, ['arm', ...CP.map(c => `${c} cells`)]); }
{ const rows = [['assembly cells shared by >1 word', ...CP.map(c => MS.map(M => f(g(`sumraw-c${c}`, 'assembly cells shared by >1 word', M))).join(' · '))]];
  table('sharing (%, M = 25 · 50 · 100 · 200 · 400)', rows, ['', ...CP.map(c => `${c} cells`)]); }
// 3. other measures at M = 100 and 400
const OTHER = ['fact c -> room: strict', 'kind: new container -> room', 'kind: new object -> container', 'kind: seen object -> container',
  'partial: x at 4 of 8 cells: strict', 'partial: x at 4 of 8 cells: lenient', 'partial: cue "x in" only: lenient',
  'split: both answers (blend of the two)', 'split: exactly one answer', 'split: neither answer', 'episode x -> Y: new cells'];
for (const M of [100, 400]) for (const c of CP) { const rows = OTHER.map(l => [l, ...ARMS.map(([a]) => f(g(`${a}-c${c}`, l, M)))]);
  table(`other measures, ${c} cells per column, M = ${M}`, rows, ['measure', ...ARMS.map(e => e[1])]); }
// 4. cost
{ const rows = []; for (const [a, an] of ARMS) for (const c of [2, 8]) {
    const seg = a.startsWith('seg');
    rows.push([`${an}, ${c} cells`, ...MS.map(M => seg ? `${f(g(`${a}-c${c}`, 'probe: segments checked per probe', M))} of ${f(g(`${a}-c${c}`, 'segments stored', M))}` : `${f(g(`${a}-c${c}`, 'probe: work per probe (link reads | segment index hits)', M))} reads`)]); }
  table('cost per probe: segments checked of stored (segments) | link reads (sum)', rows, ['arm', ...MS.map(String)]); }
// 5. secondary runs at CPC 8
{ const SEC = [['segall-c8', 'segments all, THETA 0.75'], ['segall-t0.6-c8', 'THETA 0.6'], ['segall-t0.7-c8', 'THETA 0.7'], ['segall-t0.8-c8', 'THETA 0.8'],
    ['seg16rare-c8', 'segments 16, rare sampling'], ['segall-noctx-c8', 'segments all, bag of words'], ['sumraw-noctx-c8', 'sum raw, bag of words'], ['sumraw-c8', 'sum raw']];
  const L = ['episode x -> Y: strict', 'episode x -> Y: blend', 'fact c -> room: strict', 'kind: new container -> room', 'kind: new object -> container', 'partial: x at 4 of 8 cells: strict', 'split: both answers (blend of the two)', 'probe: segments checked per probe', 'segments stored'];
  for (const M of [100, 400]) table(`secondary runs, 8 cells per column, M = ${M}`, L.map(l => [l, ...SEC.map(([n]) => f(g(n, l, M)))]), ['measure', ...SEC.map(e => e[1])]); }
