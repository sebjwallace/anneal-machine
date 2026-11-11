// C03 viewer smoke test: run the page against a fake DOM and canvas for every arm and price.
'use strict';
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const g2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
function el() { const e = { children: [], style: {}, value: '', textContent: '', clientWidth: 700, _h: '', appendChild(c) { e.children.push(c); return c; }, addEventListener() {},
  getContext: () => g2d, getBoundingClientRect: () => ({ left: 0, top: 0 }), set innerHTML(v) { e._h = v; }, get innerHTML() { return e._h; } }; return e; }
const ids = new Map(), document = { getElementById(id) { if (!ids.has(id)) { const e = el(); if (id === 'seed' || id === 'price') e.value = '1'; ids.set(id, e); } return ids.get(id); }, createElement: el };
const ctx = { document, window: { devicePixelRatio: 1, addEventListener() {} }, getComputedStyle: () => ({ getPropertyValue: () => '#000' }), setInterval: () => 1, clearInterval: () => {}, console, Math };
const api = new Function(...Object.keys(ctx), scripts.join('\n;\n') + '\n;return { get M() { return M; }, next, showHeld, reset };')(...Object.values(ctx));
for (const arm of ['R', 'G', 'GP', 'GEP']) for (const price of ['1', '2']) { document.getElementById('arm').value = arm; document.getElementById('price').value = price; api.reset();
  for (let i = 0; i < 1500; i++) api.next(i % 100 === 0); api.showHeld();
  console.log(arm, 'price', price, 'ok: columns', api.M.cols.length, '|', document.getElementById('stats').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 120)); }
