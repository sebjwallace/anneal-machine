import { Run } from './run.js';
import { VolumeDrawing } from './drawing.js';
import { Structure } from './structure.js';
import { tree } from './tree.js';
import { caption, summary, cellNote } from './narration.js';

const LABELS = 'ABCDEFGHIJKLMNOP'.split('');
const CELLS_PER_COLUMN = 4;
const BEAT = 1500;

// Examples to start from; the inputs box can be edited freely.
const EXAMPLES = [
  { name: 'Square: all the way up', inputs: 'ABEF CDGH IJMN KLOP ABEFIJMN CDGHKLOP ABCDEFGHIJKLMNOP ABEF' },
  { name: 'House and shed: the cut', inputs: 'ABCD ABEF AB ABC' },
  { name: 'Pairs into a whole', inputs: 'AB CD ABCD ABEF GH ABCDEFHG' },
  { name: 'The Z: junctions', inputs: 'ABCD DGJM MNOP ABCDDGJMMNOP ABCD' },
  { name: 'A sequence', inputs: 'ABCD DGJM MNOP' },
];

// Each layer of the drawing, with its switch. The swatch is the legend.
const LAYERS = [
  { key: 'activity', label: 'Activity', on: true, swatch: '<circle cx="9" cy="9" r="6" style="fill:var(--fit);stroke:var(--text);stroke-width:1.2"/>' },
  { key: 'segments', label: 'Segments', on: true, swatch: '<path d="M9 2 A7 7 0 0 1 9 16" style="fill:none;stroke:var(--seq);stroke-width:2.4"/><path d="M9 16 A7 7 0 0 1 9 2" style="fill:none;stroke:var(--part);stroke-width:2.4"/>' },
  { key: 'assemblies', label: 'Assemblies', on: true, swatch: '<rect x="1.5" y="4" width="15" height="10" rx="5" style="fill:#2A9D8F;fill-opacity:.15;stroke:#2A9D8F;stroke-width:1.3"/>' },
  { key: 'stored', label: 'All stored', on: false, swatch: '<rect x="1.5" y="4" width="15" height="10" rx="5" style="fill:none;stroke:var(--muted);stroke-width:1.2"/>' },
  { key: 'newLinks', label: 'New links', on: false, swatch: '<line x1="1" y1="9" x2="17" y2="9" style="stroke:var(--text);stroke-width:1.6"/>' },
  { key: 'partLinks', label: 'Assembly links', on: false, swatch: '<line x1="1" y1="9" x2="17" y2="9" style="stroke:var(--part);stroke-width:1.4"/>' },
  { key: 'seqLinks', label: 'Sequence links', on: false, swatch: '<line x1="1" y1="9" x2="17" y2="9" style="stroke:var(--seq);stroke-width:1.4;stroke-dasharray:3 2"/>' },
  { key: 'heat', label: 'Heat', on: true, swatch: '<circle cx="9" cy="9" r="6.5" style="fill:none;stroke:var(--heat);stroke-width:1.3;stroke-dasharray:2 2"/>' },
  { key: 'prediction', label: 'Prediction', on: true, swatch: '<circle cx="9" cy="9" r="6.5" style="fill:none;stroke:var(--seq);stroke-width:1.3;stroke-dasharray:3 2"/>' },
  { key: 'narration', label: 'Words', on: true, swatch: '<text x="9" y="13" text-anchor="middle" style="font-size:11px;fill:var(--text)">Aa</text>' },
];

const $ = (id) => document.getElementById(id);
const drawing = new VolumeDrawing($('volume'), LABELS);

const remembered = (() => { try { return JSON.parse(localStorage.getItem('volume-layers')) ?? {}; } catch { return {}; } })();
const layers = Object.fromEntries(LAYERS.map((layer) => [layer.key, remembered[layer.key] ?? layer.on]));

let run = null;
let t = 0;            // moments received
let reached = 0;      // the furthest moment visited, for the timeline
let focusCell = null; // the name of the cell under the pointer, or pinned
let focusNode = null; // the index of the structure node under the pointer, or pinned
let pinned = false;
let timer = null;

function parse(text) {
  const inputs = text.toUpperCase().split(/[\s,]+/).filter(Boolean);
  const bad = inputs.filter((input) => [...input].some((label) => !LABELS.includes(label)));
  return { inputs, bad };
}

function start() {
  const { inputs, bad } = parse($('sequence').value);
  $('error').textContent = bad.length ? `Not inputs here: ${bad.join(' ')} (letters A to P)` : '';
  if (bad.length || !inputs.length) return;
  run = new Run({ labels: LABELS, cellsPerColumn: CELLS_PER_COLUMN, inputs });
  t = 0;
  reached = 0;
  focusCell = focusNode = null;
  pinned = false;
  draw();
}

// The outlines to draw: what is present in the moment (or everything stored), and the node in focus with all it holds.
function bands(structure, moment) {
  const show = (node) => layers.assemblies
    && (structure.justCut(node) || (!node.cut && (layers.stored || structure.presence(node, moment))));
  const focused = new Set();
  const hold = (node) => { focused.add(node); node.children.forEach(hold); };
  if (focusNode !== null && structure.nodes[focusNode]) hold(structure.nodes[focusNode]);
  return structure.nodes
    .filter((node) => focused.has(node) || show(node))
    .map((node) => ({ node, focus: focused.has(node), cut: structure.justCut(node) }));
}

function draw() {
  const { volume, moments } = run.at(t);
  const moment = moments.at(-1);
  const structure = new Structure(moments, LABELS);
  const cell = focusCell && volume.column(focusCell[0]).cells[Number(focusCell.slice(1))];
  drawing.draw({ volume, moment, layers, bands: bands(structure, moment), focus: cell });
  $('tree').innerHTML = tree(structure, moment, structure.nodes[focusNode]);
  $('summary').innerHTML = summary(moment, t ? run.input(t - 1) : '');
  $('caption').textContent = caption(moment);
  $('caption').hidden = !layers.narration;
  $('focus').innerHTML = cellNote(cell);
  $('position').textContent = t ? `t${t} · pass ${run.pass(t - 1)}` : 't0';
  $('play').textContent = timer ? 'Pause' : 'Play';
  $('layers').innerHTML = LAYERS.map((layer) =>
    `<button class="layer${layers[layer.key] ? ' on' : ''}" data-layer="${layer.key}"><svg width="18" height="18">${layer.swatch}</svg>${layer.label}</button>`).join('');
  timeline(run.at(reached).moments);
}

function timeline(moments) {
  $('timeline').innerHTML = moments.map((m, i) => {
    const heat = m.uncovered.length + m.brought.size + m.missing.length;
    return `<button class="chip${i + 1 === t ? ' on' : ''}" data-t="${i + 1}" title="t${i + 1}">`
      + `<span class="chip-input">${run.input(i)}</span>`
      + `<span class="chip-grown${m.grown.length ? '' : ' zero'}">+${m.grown.length}</span>`
      + `<span class="chip-heat${heat ? '' : ' zero'}">${heat}</span></button>`;
  }).join('');
}

function go(to) {
  t = Math.max(0, to);
  reached = Math.max(reached, t);
  draw();
}

function play() {
  if (timer) { clearInterval(timer); timer = null; }
  else timer = setInterval(() => go(t + 1), BEAT);
  draw();
}

$('next').onclick = () => go(t + 1);
$('back').onclick = () => go(t - 1);
$('play').onclick = play;
$('reset').onclick = () => { if (timer) play(); start(); };
$('sequence').onchange = () => { if (timer) play(); start(); };
$('example').innerHTML = EXAMPLES.map((example, i) => `<option value="${i}">${example.name}</option>`).join('');
$('example').onchange = () => {
  $('sequence').value = EXAMPLES[Number($('example').value)].inputs;
  if (timer) play();
  start();
};
$('timeline').onclick = (event) => {
  const chip = event.target.closest('[data-t]');
  if (chip) go(Number(chip.dataset.t));
};
$('layers').onclick = (event) => {
  const button = event.target.closest('[data-layer]');
  if (!button) return;
  layers[button.dataset.layer] = !layers[button.dataset.layer];
  try { localStorage.setItem('volume-layers', JSON.stringify(layers)); } catch { /* a convenience only */ }
  draw();
};
document.addEventListener('keydown', (event) => {
  if (event.target.tagName === 'INPUT') return;
  if (event.key === 'ArrowRight') go(t + 1);
  if (event.key === 'ArrowLeft') go(t - 1);
  if (event.key === ' ') { event.preventDefault(); play(); }
});

// Pointing: a cell shows its segments and links; a row of the structure outlines that node and everything it holds.
// A click pins either; a second click on it lets go.
function point(kind, value) {
  if (pinned) return;
  const [cell, node] = kind === 'cell' ? [value, null] : [null, value];
  if (cell !== focusCell || node !== focusNode) { focusCell = cell; focusNode = node; draw(); }
}
function pin(kind, value) {
  const current = kind === 'cell' ? focusCell : focusNode;
  pinned = value !== null && !(pinned && value === current);
  focusCell = kind === 'cell' ? value : null;
  focusNode = kind === 'node' ? value : null;
  draw();
}
const cellAt = (event) => event.target.closest?.('[data-cell]')?.dataset.cell ?? null;
const nodeAt = (event) => {
  const index = event.target.closest?.('[data-node]')?.dataset.node;
  return index === undefined ? null : Number(index);
};
$('volume').addEventListener('mouseover', (event) => point('cell', cellAt(event)));
$('volume').addEventListener('mouseleave', () => point('cell', null));
$('volume').addEventListener('click', (event) => pin('cell', cellAt(event)));
$('tree').addEventListener('mouseover', (event) => point('node', nodeAt(event)));
$('tree').addEventListener('mouseleave', () => point('node', null));
$('tree').addEventListener('click', (event) => pin('node', nodeAt(event)));

start();
