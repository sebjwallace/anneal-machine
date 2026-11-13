// C33 SCALING CHECK: the engine as it is, on bigger pictures (WORLD_SIZE) and busier scenes (THINGS per scene).
// Env: WORLD_SIZE (default 32), THINGS (default 6), N (pictures, default 200), REST (rest every, default 98).
'use strict';
const path = require('path'), S = path.join(__dirname, '../../../src/');
globalThis.WORLD_SIZE = +(process.env.WORLD_SIZE || 32);
const { CATALOGUE, rng } = require(S + 'worlds/catalogue.js'), { SceneWorld } = require(S + 'worlds/scenes.js'), { Model } = require(process.env.ENGINE ? path.join(__dirname, process.env.ENGINE) : S + 'engine/see.js');
const W = new SceneWorld(CATALOGUE), THINGS = +(process.env.THINGS || 6), N = +(process.env.N || 200), REST = +(process.env.REST || 98), r = rng(4242), m = new Model('FL', process.env.REMEMBER ? { remember: isNaN(+process.env.REMEMBER) ? process.env.REMEMBER : +process.env.REMEMBER } : {});
let awake = 0, rest = 0, px = 0; const tick = () => process.hrtime.bigint(), ms = (a, b) => Number(b - a) / 1e6;
for (let t = 1; t <= N; t++) { const list = []; for (let k = 0; k < THINGS; k++) list.push(W.things[Math.floor(r() * W.things.length)]); const x = W.place(r, list).x; px += x.reduce((a, b) => a + b, 0);
  let a = tick(); m.step(x); awake += ms(a, tick()); if (t % REST === 0) { a = tick(); const n = m.rest(); rest += ms(a, tick()); console.log(`  rest at ${t}: ${n} moves, ${(rest / 1000).toFixed(1)} s so far`); } }
const a = tick(); m.rest(); rest += ms(a, tick());
const live = m.units.filter((u) => !u.loose);
console.log(`size ${globalThis.WORLD_SIZE} · ${THINGS} things/scene (${(px / N).toFixed(0)} px) · ${N} pictures: awake ${(awake / N).toFixed(0)} ms/picture, rest ${(rest / 1000).toFixed(1)} s total · units ${live.length}, memories ${m.items.length}, E ${m.measure().E.toFixed(0)}`);
