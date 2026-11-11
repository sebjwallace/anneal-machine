// C02 viewer smoke test: run the page's scripts against a fake DOM and canvas; step, skip, show a held-out pattern, switch arms.
'use strict';
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const g2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
function el(tag) { const e = { tag, children: [], style: {}, value: '', textContent: '', clientWidth: 700, width: 0, height: 0, _h: '',
  appendChild(c) { e.children.push(c); return c; }, addEventListener() {}, getContext: () => g2d, getBoundingClientRect: () => ({ left: 0, top: 0 }),
  set innerHTML(v) { e._h = v; e.children = []; }, get innerHTML() { return e._h; } }; return e; }
const ids = new Map(), document = { getElementById(id) { if (!ids.has(id)) { const e = el('div'); if (id === 'seed') e.value = '1'; ids.set(id, e); } return ids.get(id); },
  createElement: el, documentElement: {} };
const ctx = { document, window: { devicePixelRatio: 1, addEventListener() {} }, getComputedStyle: () => ({ getPropertyValue: () => '#000' }),
  setInterval: () => 1, clearInterval: () => {}, console, Math };
const api = new Function(...Object.keys(ctx), scripts.join('\n;\n') + '\n;return { get M() { return M; }, next, showHeld, reset };')(...Object.values(ctx));
for (const arm of ['A', 'B', 'C', 'D']) { document.getElementById('arm').value = arm; api.reset();
  for (let i = 0; i < 700; i++) api.next(i % 50 === 0); api.showHeld();
  console.log(arm, 'ok: columns', api.M.cols.length, 'cells', api.M.cellCount(), 'rests', api.M.st.rests, '| stats:', document.getElementById('stats').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 90)); }
