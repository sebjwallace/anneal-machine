// Builds docs/ledger/ledger.md from records.js: the entries in order, then the indexes back (experiments) and
// forward (contract clauses), the open entries, and clauses nothing has touched. Run: node docs/ledger/build.js
'use strict';
const fs = require('fs'), path = require('path');
const { LEDGER } = require('./records.js');
const root = path.join(__dirname, '../..');
const ERAS = { 1: 'The first models: growing, averaging, layers', 2: 'Compare, don\'t average; one currency; cells', 3: 'Kinds, one energy, limits', 4: 'Joining, checking, regions (the branch)', 5: 'Theories and heat', 6: 'Text worlds', 7: 'The core rebuilt from cells' };
const KIND = { PRB: 'Problem', QST: 'Question', HYP: 'Hypothesis', INC: 'Incident', THY: 'Theory', PRO: 'Promotion', SOL: 'Solution', OUT: 'Outcome', CLM: 'Claim', DEC: 'Decision', PAT: 'Pattern', APT: 'Anti-pattern', TRD: 'Trade-off' };
const kindOf = (code) => KIND[code.split('-')[0]];
// experiment folders, so every C-code links to its folder
const sk = fs.readdirSync(path.join(root, 'experiments/sketches')), folder = {};
for (const d of sk) { const c = d.split('-')[0]; (folder[c] = folder[c] || []).push(d); }
const exLink = (c) => (folder[c] ? folder[c].map((d) => `[${c}](../../experiments/sketches/${d}/)`).join(' ') : c);
// contract clauses, read from the contracts
const clauses = {};
for (const [ctr, file] of [['CTR-1', 'system.md'], ['CTR-2', 'practice.md']]) {
  const t = fs.readFileSync(path.join(root, 'docs/contracts', file), 'utf8'), sheet = t.slice(0, t.indexOf('## Details'));
  for (const m of sheet.matchAll(/\*\*((?:DEF|GOL|OPZ|CON|CAP|PRN)-\d+)([^*]*)\*\*\s*([^\n]*)/g)) clauses[`${ctr} ${m[1]}`] = (m[2].trim() ? m[2].trim().replace(/:$/, '') + ': ' : '') + m[3].replace(/\*\([^)]*\)\*\s*/g, '').replace(/\*[^*]*\*$/, '').trim().slice(0, 90);
}
const out = [];
out.push('# Ledger', '', '*Built from `records.js` by `build.js`: edit the records, then rebuild. Never edit this file by hand.*', '');
out.push('The story of how the system came to be: each entry is an arc that opens with a gap (a problem, question, hypothesis, incident, theory or promotion), names the experiments that worked on it and what was given by hand, closes with a resolution or stays open, and says what it did to the [contracts](../contracts/README.md). It points back to the experiments and forward to the contract clauses. See the [README](README.md) for the kinds and codes.', '');
const bad = [];
let era = 0;
for (const e of LEDGER) {
  if (e.era !== era) { era = e.era; out.push(`## ${era} · ${ERAS[era]}`, ''); }
  out.push(`### ${e.code} · ${kindOf(e.code)}: ${e.open}`, '');
  out.push(`- **Heat:** ${e.heat}`);
  if (e.exps.length) out.push(`- **Experiments:** ${e.exps.map(exLink).join(', ')}`);
  if (e.given) out.push(`- **Given by hand:** ${e.given}`);
  out.push(e.close ? `- **Closed by ${e.close.code} · ${kindOf(e.close.code)}${e.close.verdict ? ` (${e.close.verdict})` : ''}:** ${e.close.text}` : '- **Still open.**');
  for (const l of e.lessons) out.push(`- **${l.code} · ${kindOf(l.code)}:** ${l.text}`);
  out.push(`- **Contract:** ${e.contract.map(([c, eff]) => { if (!clauses[c]) bad.push(`${e.code} → ${c}`); return `${eff} ${c}`; }).join('; ')}`);
  out.push(`- **Lesson:** ${e.lesson}`, '');
}
// back: experiments
out.push('## Index back: experiments', '', '| Experiment | Entries |', '|---|---|');
const byEx = {}; for (const e of LEDGER) for (const c of e.exps) (byEx[c] = byEx[c] || []).push(e.code);
const allEx = Object.keys(folder).sort((a, b) => +a.slice(1) - +b.slice(1));
for (const c of allEx) out.push(`| ${exLink(c)} | ${(byEx[c] || ['—']).join(', ')} |`);
out.push('');
// forward: contract clauses
out.push('## Index forward: contract clauses', '', 'What shaped each clause. A clause with no entries hasn\'t been tested or argued for yet.', '', '| Clause | | Entries |', '|---|---|---|');
const byCl = {}; for (const e of LEDGER) for (const [c, eff] of e.contract) (byCl[c] = byCl[c] || []).push(`${e.code} (${eff})`);
for (const c of Object.keys(clauses)) out.push(`| ${c} | ${clauses[c]} | ${(byCl[c] || ['—']).join(', ')} |`);
out.push('');
out.push('## Open', '', ...LEDGER.filter((e) => !e.close).map((e) => `- ${e.code} · ${kindOf(e.code)}: ${e.open}`), '');
fs.writeFileSync(path.join(__dirname, 'ledger.md'), out.join('\n'));
const untouched = Object.keys(clauses).filter((c) => !byCl[c]);
console.log(`${LEDGER.length} entries; ${Object.keys(clauses).length} clauses, ${untouched.length} untouched: ${untouched.join(', ')}`);
if (bad.length) { console.log('UNKNOWN CLAUSES: ' + bad.join(', ')); process.exitCode = 1; }
const missing = [...new Set(LEDGER.flatMap((e) => e.exps))].filter((c) => !folder[c]); if (missing.length) { console.log('NO FOLDER: ' + missing.join(', ')); process.exitCode = 1; }
