// Pools the per-seed outputs (seed-101.txt ... seed-105.txt) into means, line by line: every number on a line is
// averaged across the files. Run: node pool.js > out.txt
import fs from 'node:fs';
const files = fs.readdirSync('.').filter((f) => /^seed-\d+\.txt$/.test(f)).sort();
const texts = files.map((f) => fs.readFileSync(f, 'utf8').split('\n'));
const out = [`pooled over ${files.join(', ')}`];
texts[0].forEach((line, i) => {
  if (!/^quarter/.test(line)) { out.push(line.replace(/seeds \d+/, `seeds ${files.map((f) => f.match(/\d+/)[0]).join(',')}`)); return; }
  const nums = texts.map((t) => (t[i].match(/-?\d+(\.\d+)?/g) || []).map(Number));
  let k = 0;
  out.push(line.replace(/-?\d+(\.\d+)?/g, (m) => { const j = k++; if (j === 0) return m; const vals = nums.map((n) => n[j]); const mean = vals.reduce((a, b) => a + b, 0) / vals.length; return m.includes('.') ? mean.toFixed(m.split('.')[1].length) : Math.round(mean).toString(); }));
});
console.log(out.join('\n'));
