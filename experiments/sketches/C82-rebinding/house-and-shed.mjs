// C82 check: AB, CD, ABCD, then ABEF; then ABC, ABE and AB alone (each after a blank). Core against loosen. Run: node house-and-shed.mjs
import { Volume } from './engine/index.js';
for (const loosen of [false, true]) {
  const v = new Volume({ labels: [...'ABCDEFGH'], cellsPerColumn: 4, loosen });
  for (const i of ['AB','CD','ABCD']) v.receive([...i]);
  const m = v.receive([...'ABEF']);
  const probe = (s) => { v.receive([]); return [...v.receive([...s]).brought].map(c=>c.name).sort().join(''); };
  console.log(loosen ? 'loosen' : 'core', 'loosened at ABEF:', m.loosened?.length ?? 0, '| ABC ->', probe('ABC'), '| ABE ->', probe('ABE'), '| AB ->', probe('AB'));
}
