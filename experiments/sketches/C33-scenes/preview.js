// C33 preview: a few scenes as ASCII, a determinism check, and stats over 600 scenes.  node preview.js [W]
'use strict';
const { rng } = require('../../../src/worlds/catalogue.js');
const { scene, stream } = require('./world.js');
const W = Number(process.argv[2]) || 32;
const show = (s) => { const lines = []; for (let y = 0; y < W; y++) { let l = ''; for (let x = 0; x < W; x++) l += s.x[y * W + x] ? '#' : '.'; lines.push(l); }
  const px = s.x.reduce((a, b) => a + b, 0);
  console.log(`${s.type.toUpperCase()}  ${px} px  ` + s.objects.map((o) => `${o.name}@${o.x},${o.y}`).join(' ')); console.log(lines.join('\n') + '\n'); };
const r = rng(7);
for (const t of ['forest', 'city']) for (let i = 0; i < 3; i++) show(scene(r, t, W));

// determinism: same seed, same scenes
const a = stream(rng(42), 50, W), b = stream(rng(42), 50, W);
const same = a.every((s, i) => s.type === b[i].type && s.x.every((v, j) => v === b[i].x[j]));
console.log('deterministic (seed 42, 50 scenes):', same ? 'yes' : 'NO'); if (!same) process.exitCode = 1;

// no two objects touch: check every object's box, grown by 1, against the others
const touch = (s) => { const SZ = require('./world.js').SIZE; const o = s.objects;
  for (let i = 0; i < o.length; i++) for (let j = i + 1; j < o.length; j++) { const [w1, h1] = SZ[o[i].name], [w2, h2] = SZ[o[j].name];
    if (o[i].x - 1 < o[j].x + w2 && o[j].x < o[i].x + w1 + 1 && o[i].y - 1 < o[j].y + h2 && o[j].y < o[i].y + h1 + 1) return true; } return false; };

const all = stream(rng(1), 600, W), st = {};
for (const s of all) { const q = st[s.type] || (st[s.type] = { n: 0, px: 0, obj: 0, min: 1e9, max: 0, names: {}, touching: 0 });
  const px = s.x.reduce((x, y) => x + y, 0); q.n++; q.px += px; q.obj += s.objects.length; q.min = Math.min(q.min, px); q.max = Math.max(q.max, px);
  if (touch(s)) q.touching++; for (const o of s.objects) q.names[o.name] = (q.names[o.name] || 0) + 1; }
console.log(`stats over 600 scenes at W=${W}:`);
for (const [t, q] of Object.entries(st)) console.log(`  ${t.padEnd(6)} n=${q.n}  pixels mean ${(q.px / q.n).toFixed(1)} (min ${q.min}, max ${q.max})  objects mean ${(q.obj / q.n).toFixed(1)}  touching ${q.touching}  per scene: ` +
  Object.entries(q.names).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${(v / q.n).toFixed(2)}`).join(', '));
