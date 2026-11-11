// C01 viewer smoke test: run the page's scripts against a tiny fake DOM, flash a few times, click a tile, report errors.
'use strict';
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
function el(tag) { const e = { tag, children: [], className: '', textContent: '', _html: '', style: {}, value: '1',
  classList: { add(c) { e.className += ' ' + c; } }, appendChild(c) { e.children.push(c); return c; }, append(...c) { e.children.push(...c); },
  set innerHTML(v) { e._html = v; e.children = []; }, get innerHTML() { return e._html; } }; return e; }
const byId = new Map();
const document = { getElementById(id) { if (!byId.has(id)) byId.set(id, el('div')); return byId.get(id); }, createElement: el };
let intervals = 0;
const ctx = { document, setInterval: () => ++intervals, clearInterval: () => {}, console };
const run = new Function(...Object.keys(ctx), scripts.join('\n;\n') + '\n;return { P, select, flash, tiles };');
const api = run(...Object.values(ctx));
for (let i = 0; i < 50; i++) api.flash();
api.select(api.P.find((p) => p.name === 'row 0').id);
console.log('flashes ok; info:', document.getElementById('info').innerHTML.replace(/<[^>]+>/g, ''));
console.log('tiles:', api.tiles.length, ' clean grid cells:', document.getElementById('clean').children.length);
