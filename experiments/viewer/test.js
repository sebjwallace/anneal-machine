// Smoke test for a built viewer: node test.js <viewer.html> <arm,arm,...>. Runs the page against a fake DOM and canvas.
'use strict';
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8'), arms = process.argv[3].split(',');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const g2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
function el() { const e = { children: [], style: {}, value: '', textContent: '', clientWidth: 700, _h: '', appendChild(c) { e.children.push(c); return c; }, addEventListener() {},
  getContext: () => g2d, getBoundingClientRect: () => ({ left: 0, top: 0 }), set innerHTML(v) { e._h = v; }, get innerHTML() { return e._h; } }; return e; }
const present = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));   // only controls the page really has
const ids = new Map(), document = { getElementById(id) { if (!present.has(id)) return null; if (!ids.has(id)) { const e = el(); const DEF = { seed: '1', nl: process.env.NL || '5', top: '100', shrink: process.env.SHRINK || '0.5', nmode: process.env.NMODE || 'steady', period: '300', colmode: process.env.COLMODE || 'grow', pnl: '5', psize: '50', pfast: '0.4', pslow: '0.025', pcol: process.env.COLMODE || 'grow', smode: process.env.SMODE || 'shuffled', phase: '300', cnl: '5', ctop: '100', ckeep: '0.5', cptop: '0.4', cpbot: '0.025', ccol: 'grow' }; if (DEF[id]) e.value = DEF[id]; ids.set(id, e); } return ids.get(id); }, createElement: el };
const ctx = { document, window: { devicePixelRatio: 1, addEventListener() {} }, getComputedStyle: () => ({ getPropertyValue: () => '#000' }), setInterval: () => 1, clearInterval: () => {}, console, Math };
const api = new Function(...Object.keys(ctx), scripts.join('\n;\n') + '\n;return { get M() { return M; }, next, showHeld, reset, hist, loadPreset: typeof loadPreset !== "undefined" ? loadPreset : null, PRESETS: typeof PRESETS !== "undefined" ? PRESETS : {}, restTick: typeof restTick !== "undefined" ? restTick : null };')(...Object.values(ctx));
if (process.env.PRESETS && api.loadPreset) { for (const k of Object.keys(api.PRESETS)) { api.loadPreset(k); for (let i = 0; i < 600; i++) api.next(false); api.showHeld();
  console.log('preset', k.padEnd(13), 'ok: columns', api.M.cols.length, 'layers', api.M.layers.length, '| arm', api.M.arm, '|', document.getElementById('clist').textContent.slice(0, 90), '|', document.getElementById('trendnote').textContent); } process.exit(0); }
for (const arm of arms) { document.getElementById('arm').value = arm; api.reset();
  for (let i = 0; i < 1200; i++) api.next(i % 200 === 0); api.showHeld();
  if (api.restTick && api.M.restStep) { const e0 = api.M.energy(); for (let i = 0; i < 200; i++) api.restTick(); for (let i = 0; i < 100; i++) api.next(i % 50 === 0);
    console.log('  rest exercised: energy', e0, '->', api.M.energy(), '| parts', api.M.parts.length, '|', document.getElementById('fmsg') ? document.getElementById('fmsg').textContent : ''); }
  console.log(arm, 'ok: columns', api.M.cols.length, 'flashes in history', api.hist.length, '|', document.getElementById('trendnote').textContent, '|', document.getElementById('stats').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 150)); }
