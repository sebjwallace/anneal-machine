// C109: why the better cut never forms. Probes buffer 1 after both passes. Run: node why.js compete.js
const src = require('fs').readFileSync(process.argv[2], 'utf8').split('// ---------------------------------------------------------------- measures')[0];
eval("const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));" + src + `
const mem = newMemory(64);
for (const t of BUFFERS) readBuffer(mem, letters(t), []);
const text = letters(BUFFERS[0]);
const now = cheapest(mem, text, loaded(mem));
console.log('buffer 1 now costs', now.cost.toFixed(2), show(now.parts));
for (const run of ['sat_on_the_', '_sat_on_the_', '_the_cat', 'cat_sat_on_the_']) {
  const after = cheapest(mem, text, [...loaded(mem), {text: run}]);
  const body = bodyOf(mem, run);
  console.log(run.padEnd(16), 'reading with it', after.cost.toFixed(2), '+ body', body.cost.toFixed(2), '(', show(body.parts), ') =', (after.cost+body.cost).toFixed(2));
}`);
