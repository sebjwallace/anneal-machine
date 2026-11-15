// C82 · Rebinding a variable. Two variables (x, y) and ten values (0-9), each an assembly over three columns of its own.
// Each is first seen alone once. Then, a thousand times, one variable is seen together with a new value ({x, 5}), which
// ties the two (RM-7). After each rebinding, each variable is seen alone, and we read which values it brings back.
// Arms: core (the engine as in src/, copied) and loosen (C82's one change: a joint that brings back what the input has
// replaced loosens by one segment per cell; see engine/volume.js).
// Given by hand: the inputs and their order; a blank moment before every input, so no transitions are learnt (context
// is the moment before only, and a blank leaves none). Four cells per column (fixed architecture).
// Conditions: values never shared (a variable is never given the value the other holds) and shared freely.
// Run: node run.js     (SEEDS=101,102,103,104,105 by default; SEEDS=1 is the development seed; N sets the rebinds)
import { Volume } from './engine/index.js';

const SEEDS = (process.env.SEEDS || '101,102,103,104,105').split(',').map(Number);
const N = +(process.env.N || 1000);
const VARS = ['x', 'y'], VALUES = [...'0123456789'];
const cols = (name) => [1, 2, 3].map((i) => `${name}${i}`);
const labels = [...VARS, ...VALUES].flatMap(cols);

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// a thing is brought back when every one of its columns has a brought cell
const broughtThings = (m, names) => names.filter((n) => cols(n).every((c) => [...m.brought].some((cell) => cell.column.label === c)));
const segments = (v) => { let present = 0, past = 0; for (const col of v.columns) for (const cell of col.cells) for (const s of cell.segments) { if (s.links.some((l) => l.cell)) past++; else present++; } return { present, past }; };

function run(seed, loosen, distinct) {
  const v = new Volume({ labels, cellsPerColumn: 4, seed, loosen });
  const r = rng(seed * 7 + 3);
  const see = (...names) => { v.receive([]); return v.receive(names.flatMap(cols)); };
  for (const n of [...VARS, ...VALUES]) see(n);
  const bound = {}, brokenByOther = {};
  const q = Math.floor(N / 4);
  const stats = [0, 1, 2, 3].map(() => ({ failsAfterShared: 0, probes: 0, exact: 0, brought: 0, other: 0, grownLinks: 0, loosened: 0, cuts: 0, refusedProbes: 0 }));
  const series = [];
  for (let i = 0; i < N; i++) {
    const st = stats[Math.min(3, Math.floor(i / q))];
    const name = VARS[Math.floor(r() * VARS.length)];
    const other = VARS.find((o) => o !== name);
    const choices = VALUES.filter((val) => val !== bound[name] && !(distinct && val === bound[other]));
    const val = choices[Math.floor(r() * choices.length)];
    const m = see(name, val);
    if (bound[other] === val) brokenByOther[other] = true; // the other variable held this value: its bond may be heated
    bound[name] = val;
    brokenByOther[name] = false;
    st.grownLinks += m.grown.reduce((a, s) => a + s.links.length, 0);
    st.loosened += m.loosened ? m.loosened.length : 0;
    st.cuts += m.cuts.length;
    for (const probe of VARS) {
      if (bound[probe] === undefined) continue;
      const p = see(probe);
      const vals = broughtThings(p, VALUES);
      st.probes++;
      st.brought += vals.length;
      if (vals.length === 1 && vals[0] === bound[probe]) st.exact++;
      else if (brokenByOther[probe]) st.failsAfterShared++;
      if (broughtThings(p, VARS.filter((o) => o !== probe)).length) st.other++;
      if (p.grown.length || p.cuts.length) st.refusedProbes++; // a probe that changed structure
    }
    if (i % 50 === 49 || i === N - 1) series.push(segments(v).present);
  }
  return { stats, series, final: segments(v) };
}

const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
const out = [];
for (const [arm, distinct] of [[false, true], [true, true], [false, false], [true, false]]) {
  const name = `${arm ? 'loosen' : 'core'}, values ${distinct ? 'never shared' : 'shared freely'}`;
  const agg = [0, 1, 2, 3].map(() => ({ failsAfterShared: 0, probes: 0, exact: 0, brought: 0, other: 0, grownLinks: 0, loosened: 0, cuts: 0, refusedProbes: 0 }));
  const finals = [], series = [];
  for (const seed of SEEDS) {
    const res = run(seed, arm, distinct);
    res.stats.forEach((s, i) => { for (const k in s) agg[i][k] += s[k]; });
    finals.push(res.final);
    series.push(res.series);
  }
  out.push(`== ${name} (seeds ${SEEDS.join(',')}, ${N} rebinds each) ==`);
  agg.forEach((s, i) => out.push(`quarter ${i + 1}: probe brings back exactly the current value ${pct(s.exact, s.probes)}%; values brought back per probe ${(s.brought / s.probes).toFixed(2)}; other variable brought back ${pct(s.other, s.probes)}%; links grown per rebind ${(s.grownLinks / (N / 4) / SEEDS.length).toFixed(1)}; joints loosened ${s.loosened}; cuts ${s.cuts}; probes that changed structure ${s.refusedProbes}; failed probes after the other variable took this one's value ${s.failsAfterShared} of ${s.probes - s.exact}`));
  const mean = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  out.push(`completing segments, every 50 rebinds (mean over seeds): ${series[0].map((_, j) => mean(series.map((sr) => sr[j]))).join(' ')}`);
  out.push(`final segments (mean): completing ${mean(finals.map((f) => f.present))}, predicting ${mean(finals.map((f) => f.past))}`);
  out.push('');
}
console.log(out.join('\n'));
