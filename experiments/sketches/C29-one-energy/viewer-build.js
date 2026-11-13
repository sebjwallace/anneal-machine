// Builds viewer.html: the C29 viewer, with the plain engine and the one-energy model running in the page.
// Usage: node viewer-build.js  (writes viewer.html next to this file)
'use strict';
const fs = require('fs'), path = require('path');
const read = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8').replace(/<\/script/g, '<\\/script');
const wrap = (name, p) => `<script>(function(){var module={exports:{}};var exports=module.exports;\n${read(p)}\n;LIB[${JSON.stringify(name)}]=module.exports;})();</script>`;
const libs = ['<script>window.LIB={};globalThis.WORLD_SIZE=16;</script>', wrap('catalogue', '../../../src/worlds/catalogue.js'), wrap('world', 'world.js'),
  wrap('engine', '../../../src/engine/see.js'), wrap('c29', 'c29.js')].join('\n');
const html = fs.readFileSync(path.join(__dirname, 'viewer.template.html'), 'utf8').replace('<!--LIBS-->', () => libs);
fs.writeFileSync(path.join(__dirname, 'viewer.html'), html); console.log('viewer.html', html.length, 'bytes');
