// Shared live viewer for the columns track (from C04 on). The model runs in the page. Left: the columns (grouped by layer
// when the model has layers), each with its learnt field and its cells. Right: the flash, what explained it (columns by colour,
// episodes in purple, heat in red) and what is rebuilt; state; heat over the last 300 flashes AND from the start.
// Env: MODELS (files in models/, comma-separated, loaded in order), MODELCLASS, ARMSVAR, ARM, TITLE, SUB, PRICES, OUTDIR.
'use strict';
const fs = require('fs'), path = require('path');
const strip = (s) => s.replace(/<\/script/g, '<\\/script');
const E = process.env, MODELS = (E.MODELS || 'compress.js').split(','), MODELCLASS = E.MODELCLASS || 'Model', ARMSVAR = E.ARMSVAR || 'ARMS', ARM = E.ARM || '';
const TITLE = E.TITLE || 'Columns learning live', SUB = E.SUB || '', PRICES = E.PRICES ? E.PRICES.split(',') : null, OUTDIR = E.OUTDIR || process.cwd();
const cat = strip(fs.readFileSync(path.join(__dirname, '../world/catalogue.js'), 'utf8'));
const mods = MODELS.map((f) => `<script>${strip(fs.readFileSync(path.join(__dirname, '../models', f), 'utf8'))}</script>`).join('\n');
const FUNNEL = !!E.FUNNEL;   // adds funnel-shape controls (layers, top size, how much each layer keeps)
const shapeCtl = FUNNEL ? `<div class="bar"><b style="font-weight:600">Funnel shape</b>
  <label for="nl">Layers</label><input type="number" id="nl" min="1" max="16" value="5">
  <label for="top">Top layer</label><input type="number" id="top" min="2" max="400" value="100">
  <label for="shrink">Each layer keeps</label><select id="shrink">${[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((v) => `<option value="${v}"${v === 0.5 ? ' selected' : ''}>${Math.round(v * 100)}% of the one above</option>`).join('')}</select>
  <label for="colmode">Columns per layer</label><select id="colmode"><option value="grow">grow up to the size</option><option value="fixed">fixed from the start</option><option value="free">grow freely (no limit)</option></select>
  <span id="sizes" style="color:var(--muted)"></span><button id="apply">Apply and restart</button></div>` : '';
const PLASTIC = !!E.PLASTIC;  // adds plasticity controls (C05): layers of one size, plasticity spread from most to least plastic
const opts = (vals, def, fmt) => vals.map((v) => `<option value="${v}"${v === def ? ' selected' : ''}>${fmt ? fmt(v) : v}</option>`).join('');
const plasticCtl = PLASTIC ? `<div class="bar"><b style="font-weight:600">Layers</b>
  <label for="pnl">Layers</label><input type="number" id="pnl" min="1" max="12" value="5">
  <label for="psize">Columns each</label><input type="number" id="psize" min="2" max="300" value="50">
  <label for="pfast">Most plastic</label><select id="pfast">${opts([0.8, 0.4, 0.2, 0.1], 0.4)}</select>
  <label for="pslow">Least plastic</label><select id="pslow">${opts([0.2, 0.1, 0.05, 0.025, 0.01, 0.005], 0.025)}</select>
  <label for="pcol">Columns</label><select id="pcol"><option value="grow">grow up to the size</option><option value="fixed">fixed from the start</option></select>
  <label><input type="checkbox" id="pforget" checked> plastic layers forget sooner</label>
  <span id="plist" style="color:var(--muted)"></span><button id="papply">Apply and restart</button></div>` : '';
const COMBO = !!E.COMBO;  // C06: funnel shape AND plasticity together, with presets
const PRESETS = {
  'fast-slow': { label: 'Specific and fast → generic and slow (best in the runs)', arm: 'FP', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'focus', nmode: 'steady' },
  'slow-fast': { label: 'Specific and slow → generic and fast (the reverse)', arm: 'FP', nl: 5, top: 100, keep: 0.5, ptop: 0.025, pbot: 0.4, smode: 'focus', nmode: 'steady' },
  'one-speed': { label: 'The funnel at one speed (like C04)', arm: 'FP', nl: 5, top: 100, keep: 0.5, ptop: 0.2, pbot: 0.2, smode: 'focus', nmode: 'steady' },
  'stacked': { label: 'Stacked funnel, fast → slow (each layer reads the one above)', arm: 'FS', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'focus', nmode: 'steady' },
  'ten': { label: 'Ten layers, gentle funnel (keeps 70%), fast → slow', arm: 'FP', nl: 10, top: 100, keep: 0.7, ptop: 0.4, pbot: 0.01, smode: 'focus', nmode: 'steady' },
  'upside': { label: 'Upside down: narrow and fast on top, wide and slow below', arm: 'FP', nl: 5, top: 6, keep: 2, ptop: 0.4, pbot: 0.025, smode: 'focus', nmode: 'steady' },
  'plastic-only': { label: 'Plasticity only (C05): five layers of 50', arm: 'FP', nl: 5, top: 50, keep: 1, ptop: 0.4, pbot: 0.025, smode: 'focus', nmode: 'steady' },
  'waves': { label: 'Fast → slow with noise waves (heat and cool in cycles)', arm: 'FP', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'shuffled', nmode: 'wave', noise: 5, period: 1000 },
};
const AT_PRESETS = {
  'ad': { label: 'Attention, detail first (as good as looking at everything, ~45% less work)', arm: 'AD', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'shuffled', nmode: 'steady' },
  'fp': { label: 'No attention: every layer sees the whole picture (C06 best)', arm: 'FP', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'shuffled', nmode: 'steady' },
  'ag': { label: 'Attention, generic first (cheapest, but hides mistakes)', arm: 'AG', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'shuffled', nmode: 'steady' },
  'agl': { label: 'Attention, generic first, only misfitting columns loosen', arm: 'AGL', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'shuffled', nmode: 'steady' },
  'ad-ten': { label: 'Attention, detail first, ten gentle layers', arm: 'AD', nl: 10, top: 100, keep: 0.7, ptop: 0.4, pbot: 0.01, smode: 'shuffled', nmode: 'steady' },
  'ad-focus': { label: 'Attention, detail first, changing focus', arm: 'AD', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'focus', nmode: 'steady' },
  'ad-waves': { label: 'Attention, detail first, noise waves', arm: 'AD', nl: 5, top: 100, keep: 0.5, ptop: 0.4, pbot: 0.025, smode: 'shuffled', nmode: 'wave', noise: 5, period: 1000 },
};
if (E.PRESETSET === 'c07') { for (const k of Object.keys(PRESETS)) delete PRESETS[k]; Object.assign(PRESETS, AT_PRESETS); }
const FIRST_PRESET = Object.keys(PRESETS)[0];
const PL_VALS = [0.8, 0.4, 0.2, 0.1, 0.05, 0.025, 0.01, 0.005];
const STAGED = !!E.STAGED;   // C08: staged growth controls
const SNAP = !!E.SNAP;   // C14: snapshot columns
const snapCtl = SNAP ? `<div class="bar"><b style="font-weight:600">Snapshots</b>
  <label for="nth">A column takes the flash if at least</label><input type="range" id="nth" min="50" max="100" step="1" value="90"><b id="nthv">90%</b> similar; otherwise the flash becomes a new column
  <label for="nmeas">Similarity</label><select id="nmeas"><option value="overlap">overlap of on-pixels</option><option value="agree">agreement across all 25 pixels</option></select>
  <label for="nafter">After its snapshot a column</label><select id="nafter"><option value="stays">stays as captured</option><option value="averages">slowly averages what it wins</option></select>
  <button id="napply">Apply and restart</button></div>` : '';
const SSTACK = !!E.SSTACK;   // C15: layered snapshots
const sstackCtl = SSTACK ? `<div class="bar"><b style="font-weight:600">Layers of snapshots</b>
  <label for="ql">Layers</label><input type="number" id="ql" min="1" max="10" value="5">
  <label for="qtop">Surface keeps if at least</label><input type="number" id="qtop" min="10" max="100" value="90">%
  <label for="qstep">each layer below</label><input type="number" id="qstep" min="0" max="50" value="10">% lower
  <label for="qmeas">Similarity</label><select id="qmeas"><option value="agree">agreement across all 25 pixels</option><option value="overlap">overlap of on-pixels</option></select>
  <label for="qafter">Columns after their snapshot</label><select id="qafter"><option value="deeper">surface stays, deeper ones average</option><option value="none">all stay as captured</option><option value="all">all average</option></select>
  <span id="qlist" style="color:var(--muted)"></span><button id="qapply">Apply and restart</button></div>` : '';
const FACTOR = !!E.FACTOR;   // C16: snapshot awake, factor at rest
const factorCtl = FACTOR ? `<div class="bar"><b style="font-weight:600">Awake and rest</b>
  <label for="fth">Awake: store a new memory unless the parts explain at least</label><input type="range" id="fth" min="50" max="100" step="1" value="90"><b id="fthv">90%</b>
  <button id="frest">Rest now (watch it factor)</button><button id="frestfast">Rest instantly</button>
  <label for="fauto">Rest automatically</label><select id="fauto">${[['0', 'never'], ['98', 'every 98 flashes'], ['500', 'every 500 flashes'], ['2000', 'every 2,000 flashes']].map(([v, l]) => `<option value="${v}"${v === (E.FAUTO || '0') ? ' selected' : ''}>${l}</option>`).join('')}</select>
  <span id="fmsg" style="color:var(--muted)"></span></div>` : '';
const DIAG = !!E.DIAG;       // C10: mark outcompeted columns and near-duplicates (visual aid only)
const colHint = DIAG ? '<span class="dg"><s style="border-color:#e08a1e"></s>keeps coming second (outcompeted) &nbsp;<s style="border-color:#8a4fd1"></s>≈ near-duplicate of a better column &nbsp;hover: its twin gets a solid outline</span>'
  : '<span>field on top · cells underneath · coloured border = explaining this flash · dark border = active in its layer</span>';
const stagedCtl = STAGED ? `<div class="bar"><b style="font-weight:600">Staged growth</b>
  <label for="sfirst">First layer</label><input type="number" id="sfirst" min="1" max="200" value="${E.SFIRST || 6}">
  <label for="sgrow">Each new layer</label><select id="sgrow">${opts([0.25, 0.5, 0.67, 1.5, 2, 3, 4], +(E.SGROW || 2), (v) => 'x' + v)}</select>
  <label for="smax">Up to</label><input type="number" id="smax" min="1" max="10" value="5"> layers
  <label for="srate">Learning speed</label><select id="srate">${opts([0.005, 0.01, 0.02, 0.05, 0.1, 0.2], +(E.SRATE || 0.02))}</select>
  <label for="supdate">Update</label><select id="supdate">${[['all', 'every pixel, by its difference'], ['hot', "scaled by the flash's heat"], ['weighted', 'by its surprise squared'], ['wrong', 'only pixels it got wrong'], ['wrongcool', 'wrong ones fast, right ones slowly']]
    .map(([v, l]) => `<option value="${v}"${v === (E.SUPDATE || 'all') ? ' selected' : ''}>${l}</option>`).join('')}</select>
  <label for="sstart">Columns start as</label><select id="sstart">${[['random', 'fully random (0 to 1)'], ['haze', 'faint haze (0 to 0.05)']].map(([v, l]) => `<option value="${v}"${v === (E.SSTART || 'haze') ? ' selected' : ''}>${l}</option>`).join('')}</select>
  <label for="srest">Restless idle columns, most jiggle per flash</label><input type="range" id="srest" min="0" max="0.1" step="0.005" value="${E.SREST || 0}"><b id="srestv">${E.SREST || 0}</b>
  <label for="ssettle">Settled when</label><select id="ssettle"><option value="0">heat stops falling</option>${[0.9, 0.8, 0.7, 0.6, 0.5].map((v) => `<option value="${v}">heat below ${v}</option>`).join('')}</select>
  <button id="sapply">Apply and restart</button></div>` : '';
const comboCtl = COMBO ? `<div class="bar"><b style="font-weight:600">Preset</b><select id="preset"><option value="">choose a preset…</option>${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${p.label}</option>`).join('')}</select>
  <span style="color:var(--muted)">loads the settings below and restarts; change anything afterwards</span></div>
<div class="bar"><b style="font-weight:600">Shape and speed</b>
  <label for="cnl">Layers</label><input type="number" id="cnl" min="1" max="16" value="5">
  <label for="ctop">Top layer</label><input type="number" id="ctop" min="2" max="400" value="100">
  <label for="ckeep">Each layer keeps</label><select id="ckeep">${opts([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2], 0.5, (v) => Math.round(v * 100) + '%')}</select>
  <label for="cptop">Plasticity at top</label><select id="cptop">${opts(PL_VALS, 0.4)}</select>
  <label for="cpbot">at bottom</label><select id="cpbot">${opts(PL_VALS, 0.025)}</select>
  <label for="ccol">Columns</label><select id="ccol"><option value="grow">grow up to the size</option><option value="fixed">fixed from the start</option></select>
  <label><input type="checkbox" id="cforget" checked> plastic layers forget sooner</label>
  <button id="capply">Apply and restart</button><div id="clist" style="color:var(--muted);flex-basis:100%"></div></div>` : '';
const priceCtl = PRICES ? `<label for="price">Price of structure</label><select id="price">${PRICES.map((p) => `<option value="${p}">${p}</option>`).join('')}</select>` : '';

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${TITLE}</title>
<style>
:root{--bg:#f7f6f2;--fg:#1d1d1b;--muted:#6f6e68;--ink:#1d1d1b;--empty:#e6e4dc;--heat:#d63c2f;--new:#2b78d9;--ep:#8a4fd1;--line:#dcdad2;--card:#fff;--cell:#b9b6aa;--on:#d9622b}
@media (prefers-color-scheme:dark){:root{--bg:#151514;--fg:#ecebe6;--muted:#9b9a93;--ink:#ecebe6;--empty:#2b2b28;--heat:#f0614f;--new:#5ea2f2;--ep:#b07cf0;--line:#34342f;--card:#1d1d1b;--cell:#55534c;--on:#f08a50}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1320px;margin:0 auto;padding:22px 18px 40px}
h1{font-size:20px;margin:0 0 2px}
.sub{color:var(--muted);margin:0 0 14px;max-width:100ch}
.bar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:14px}
.bar label{color:var(--muted)}
select,button,input[type=number]{font:inherit;font-size:13px;padding:5px 10px;border-radius:7px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}
button{cursor:pointer}button:hover{border-color:var(--muted)}
input[type=range]{width:110px;accent-color:var(--on)}
input[type=number]{width:62px}
.wrap{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:14px;align-items:start}
@media (max-width:880px){.wrap{grid-template-columns:1fr}}
.panel{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}
.ph{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;gap:8px}
.ph h2{font-size:13px;margin:0;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600}
.ph span{font-size:12px;color:var(--muted)}
#cv{display:block;width:100%}
.right{position:sticky;top:10px;display:flex;flex-direction:column;gap:14px}
.trio{display:flex;gap:12px}.trio>div{flex:1;min-width:0}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:2px}
.g i{display:block;aspect-ratio:1;background:var(--empty);border-radius:2px}
.cap{font-size:11.5px;color:var(--muted);margin-top:5px;line-height:1.3}
.name{font-size:15px;font-weight:600;margin-bottom:8px}
.stats{display:grid;grid-template-columns:1fr auto;gap:2px 10px;font-size:13px}
.stats span:nth-child(odd){color:var(--muted)}
.stats b{font-weight:600;font-variant-numeric:tabular-nums}
canvas.chart{width:100%;display:block;margin-top:6px}
.key{font-size:12px;color:var(--muted);line-height:1.7}
.key s{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px;text-decoration:none}
.dg{font-size:12px;color:var(--muted)}.dg s{display:inline-block;width:12px;height:10px;border:2px dashed;border-radius:2px;margin-right:4px;vertical-align:-1px;text-decoration:none}
#tip{position:fixed;pointer-events:none;background:var(--card);border:1px solid var(--line);border-radius:7px;padding:6px 9px;font-size:12px;display:none;box-shadow:0 4px 14px rgba(0,0,0,.12);z-index:5}
</style></head><body><main>
<h1>${TITLE.replace(' · ', ': ')}</h1>
<p class="sub">${SUB}</p>
<div class="bar">
  <label for="arm">Arm</label><select id="arm"></select>${priceCtl}
  <label for="speed">Speed</label><input type="range" id="speed" min="1" max="30" value="6"><span id="sv"></span>
  <button id="play">Pause</button><button id="step">Step</button><button id="ff">Skip 500</button><button id="ff5">Skip 5,000</button><button id="held">Show a held-out pattern</button>
  <label for="seed">Seed</label><input type="number" id="seed" value="1" min="1"><button id="reset">Restart</button>
</div>
<div class="bar"><b style="font-weight:600">Noise</b>
  <select id="nmode"><option value="steady">steady</option><option value="wave">wave</option></select>
  <label for="noise" id="nlabel">Level</label><input type="range" id="noise" min="0" max="20" value="${E.NOISE ?? 5}"><b id="nv">${E.NOISE ?? 5}%</b>
  <span id="wavectl" style="display:none"><label for="period">Wave length</label> <input type="range" id="period" min="50" max="5000" step="50" value="1000"> <b id="pv">1000 flashes</b></span>
  <span style="color:var(--muted)">now: <b id="nnow" style="color:var(--fg)">${(+(E.NOISE ?? 5)).toFixed(1)}%</b></span>
  <b style="font-weight:600;margin-left:12px">Stream</b><select id="smode"><option value="shuffled">shuffled</option><option value="focus">changing focus</option></select>
  <span id="focusctl" style="display:none"><label for="phase">each focus lasts</label> <input type="range" id="phase" min="50" max="3000" step="50" value="300"> <b id="phv">300 flashes</b> <span style="color:var(--muted)">(80% of flashes from 10 patterns)</span></span>
</div>
${shapeCtl}${plasticCtl}${comboCtl}${stagedCtl}${snapCtl}${sstackCtl}${factorCtl}
<div class="wrap">
  <div class="panel"><div class="ph"><h2>Columns</h2>${colHint}</div><canvas id="cv"></canvas></div>
  <div class="right">
    <div class="panel">
      <div class="ph"><h2>Input</h2><span id="tno"></span></div>
      <div class="name" id="pname"></div>
      <div class="trio">
        <div><div class="g" id="gin"></div><div class="cap">as flashed</div></div>
        <div><div class="g" id="gex"></div><div class="cap">explained</div></div>
        <div><div class="g" id="grc"></div><div class="cap">rebuilt</div></div>
      </div>
      <div class="key" style="margin-top:8px"><s style="background:var(--heat)"></s>left over (heat) &nbsp;<s style="background:var(--ep)"></s>from an episode &nbsp;<s style="box-shadow:inset 0 0 0 2px var(--new)"></s>new</div>
    </div>
    <div class="panel">
      <div class="ph"><h2>Heat</h2><span id="trendnote"></span></div>
      <div class="cap" style="margin-top:0">from the start (share left over or wrong; each bar averages a stretch of flashes). Blue line: noise, on a 0–20% scale</div>
      <canvas id="trend" class="chart" style="height:80px"></canvas>
      <div class="cap">last 300 flashes</div>
      <canvas id="spark" class="chart" style="height:40px"></canvas>
      <div id="lwrap" style="display:none"><div class="cap">each layer on its own, from the start (line colour = layer: <span id="lkey"></span>)</div><canvas id="ltrend" class="chart" style="height:80px"></canvas></div>
    </div>
    <div class="panel"><div class="ph"><h2>State</h2><span id="restflag"></span></div><div class="stats" id="stats"></div></div>
  </div>
</div>
<div id="tip"></div>
</main>
<script>${cat}</script>
${mods}
<script>
const ARMSX = ${ARMSVAR}, MC = ${MODELCLASS};
const PAT = CATALOGUE.patterns, HELD = PAT.filter((p) => p.family === 'bar triples'), TRAIN = PAT.filter((p) => p.family !== 'bar triples');
const PAL = ['#d9622b', '#2f8f6b', '#7b5bd6', '#c8a020', '#c2417d', '#3a8fc4', '#7a8a2a', '#a8572e', '#5c6ad1', '#2a9a9a'];
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const $ = (id) => document.getElementById(id);
for (const k of Object.keys(ARMSX)) { const o = document.createElement('option'); o.value = k; o.textContent = ARMSX[k].label; $('arm').appendChild(o); }
if ('${ARM}') $('arm').value = '${ARM}';
let M, R, order = [], oi = 0, timer = null, noise = ${(E.NOISE ?? 5) / 100}, speed = 6, last = null, waveT = 0; const spark = [], hist = [], nhist = [];
// noise: steady, or a wave rising from 0 to the peak and back over the wave length (in flashes)
function noiseNow() { if ($('nmode').value !== 'wave') return noise; const P = +$('period').value; return noise * (1 - Math.cos(2 * Math.PI * waveT / P)) / 2; }
function shapeSizes() { if (!document.getElementById('nl')) return null; const n = Math.max(1, Math.min(16, +$('nl').value || 5)), top = Math.max(2, +$('top').value || 100), k = +$('shrink').value;
  const s = []; for (let i = 0; i < n; i++) s.push(Math.max(1, Math.round(top * Math.pow(k, i)))); return s; }
function showSizes() { const s = shapeSizes(); if (s) $('sizes').textContent = 'sizes: ' + s.join(', ') + ' (' + s.reduce((a, b) => a + b, 0) + ' columns)'; }
function plasticList() { if (!document.getElementById('pnl')) return null; const n = Math.max(1, Math.min(12, +$('pnl').value || 5)), a = +$('pfast').value || 0.4, b = +$('pslow').value || 0.025;
  return Array.from({ length: n }, (_, i) => (n === 1 ? a : a * Math.pow(b / a, i / (n - 1)))); }
function showPlastic() { const p = plasticList(); if (p) $('plist').textContent = 'plasticity: ' + p.map((v) => v.toFixed(3)).join(', '); }
const lhist = []; let focus = [];
const PRESETS = ${JSON.stringify(COMBO ? PRESETS : {})};
function comboOpts() { if (!document.getElementById('cnl')) return null; const n = Math.max(1, Math.min(16, +$('cnl').value || 5)), top = Math.max(2, +$('ctop').value || 100), k = +$('ckeep').value || 0.5;
  const a = +$('cptop').value || 0.4, b = +$('cpbot').value || 0.025;
  return { sizes: Array.from({ length: n }, (_, i) => Math.max(1, Math.round(top * Math.pow(k, i)))), plastic: Array.from({ length: n }, (_, i) => (n === 1 ? a : a * Math.pow(b / a, i / (n - 1)))) }; }
function showCombo() { const c = comboOpts(); if (c) $('clist').textContent = 'sizes: ' + c.sizes.join(', ') + ' (' + c.sizes.reduce((x, y) => x + y, 0) + ' columns) · plasticity: ' + c.plastic.map((v) => v.toFixed(3)).join(', '); }
function loadPreset(k) { const p = PRESETS[k]; if (!p) return;
  if (ARMSX[p.arm]) $('arm').value = p.arm; $('cnl').value = p.nl; $('ctop').value = p.top; $('ckeep').value = String(p.keep); $('cptop').value = String(p.ptop); $('cpbot').value = String(p.pbot);
  $('smode').value = p.smode; $('smode').onchange(); $('nmode').value = p.nmode; $('nmode').onchange();
  if (p.noise !== undefined) { $('noise').value = p.noise; noise = p.noise / 100; $('nv').textContent = p.noise + '%'; }
  if (p.period) { $('period').value = p.period; $('pv').textContent = p.period + ' flashes'; }
  showCombo(); reset(); }
function reset() { const pe = document.getElementById('price'), opt = {}; if (pe) opt.price = +pe.value; const s = shapeSizes(); if (s) { opt.sizes = s; opt.columns = $('colmode').value || 'grow'; opt.seed = +$('seed').value || 1; }
  if (document.getElementById('fth')) opt.threshold = (+$('fth').value || 90) / 100;
  if (document.getElementById('ql')) { if (+$('ql').value) opt.layers = Math.max(1, Math.min(10, +$('ql').value)); if (+$('qtop').value) opt.top = +$('qtop').value / 100;
    if ($('qstep').value !== '') opt.step = +$('qstep').value / 100; if ($('qmeas').value) opt.measure = $('qmeas').value; if ($('qafter').value) opt.after = $('qafter').value; }
  if (document.getElementById('nth')) { opt.threshold = (+$('nth').value || 90) / 100; if ($('nmeas').value) opt.measure = $('nmeas').value; if ($('nafter').value) opt.after = $('nafter').value; }
  if (document.getElementById('sfirst')) { if (+$('sfirst').value) opt.first = Math.max(1, +$('sfirst').value); if (+$('sgrow').value) opt.growth = +$('sgrow').value; if (+$('smax').value) opt.maxLayers = Math.max(1, +$('smax').value);
    if (+$('srate').value) opt.rate = +$('srate').value; opt.level = +$('ssettle').value || 0; if ($('supdate').value) opt.update = $('supdate').value; opt.restless = +$('srest').value || 0; if ($('sstart').value) opt.start = $('sstart').value; opt.seed = +$('seed').value || 1; }
  const co = comboOpts(); if (co) { opt.sizes = co.sizes; opt.plastic = co.plastic; opt.forget = !!$('cforget').checked; opt.columns = $('ccol').value || 'grow'; opt.seed = +$('seed').value || 1; }
  const pl = plasticList(); if (pl) { opt.sizes = pl.map(() => Math.max(2, +$('psize').value || 50)); opt.plastic = pl; opt.forget = !!$('pforget').checked; opt.columns = $('pcol').value || 'grow'; opt.seed = +$('seed').value || 1; }
  M = new MC($('arm').value, opt); R = rng((+$('seed').value || 1) * 7919 + 13); order = []; oi = 0; spark.length = 0; hist.length = 0; nhist.length = 0; lhist.length = 0; waveT = 0; focus = []; last = null; next(); }
function nextId() {
  if ($('smode').value === 'focus') { const ph = +$('phase').value || 300;              // CHANGING FOCUS: a new group of 10 every ph flashes
    if (waveT % ph === 0 || !focus.length) { const pool = TRAIN.map((p) => p.id); focus = []; for (let k = 0; k < 10; k++) focus.push(pool.splice(Math.floor(R() * pool.length), 1)[0]); }
    if (R() < 0.8) return focus[Math.floor(R() * focus.length)]; }
  if (oi >= order.length) { order = TRAIN.map((p) => p.id); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } oi = 0; } return order[oi++]; }
function heatOf(out, x) { if (out.heatShare !== undefined) return out.heatShare; let on = 0; for (const v of x) on += v; return on ? (out.left.length + (out.misses || 0)) / on : 0; }
// C18: a bigger world when the model brings one (SW x SH, scenes from SceneWorld); otherwise the 5x5 catalogue
const GW = typeof SW !== 'undefined' ? SW : 5, GH = typeof SH !== 'undefined' ? SH : 5, GPX = GW * GH;
const WORLD = typeof SceneWorld !== 'undefined' ? new SceneWorld(CATALOGUE) : null;
function next(draw = true) { const nz = noiseNow(); let id = null, x, name = null;
  if (WORLD) { const s = WORLD.next(R, nz); x = s.x; name = s.name; } else { id = nextId(); x = noisy(PAT[id].bits, nz, R); }
  const out = M.step(x), h = heatOf(out, x); waveT++;
  spark.push(h); if (spark.length > 300) spark.shift(); hist.push(h); nhist.push(nz);
  if (out.per) { let on = 0; for (const v of x) on += v; out.per.forEach((q, i) => { (lhist[i] = lhist[i] || []).push(on ? (q.left.length + q.misses) / on : 0); }); }
  last = { id, name, x, out, held: false, nz };
  if (document.getElementById('fauto') && +$('fauto').value && M.t % +$('fauto').value === 0) { const n = M.rest(); $('fmsg').textContent = 'rested automatically at flash ' + M.t + ': ' + n + ' steps'; }
  if (draw) render(); }
// C16: rest, step by step (each step: the hottest pair is factored into overlap and differences)
let restTimer = null;
function restTick() { const a = M.restStep();
  if (!a) { clearInterval(restTimer); restTimer = null; $('fmsg').textContent = 'settled: nothing left that lowers energy (' + M.st.restSteps + ' rest steps so far)'; render(); return; }
  last = { rest: a, out: { claims: a.pieces.map((c) => ({ c })), left: [], misses: 0, cells: [], bornAll: [] } }; $('fmsg').textContent = 'resting… step ' + M.st.restSteps + ', energy ' + M.energy(); render(); }
function showHeld() { play(false);
  if (WORLD) { const s = WORLD.held(rng(Math.floor(Math.random() * 1e9))), q = M.read(s.x); last = { id: null, name: s.name, x: s.x, out: { ...q, born: null, rested: false }, held: true }; render(); return; }
  const p = HELD[Math.floor(Math.random() * HELD.length)], x = p.bits.slice(), q = M.read(x);
  last = { id: p.id, x, out: { ...q, born: null, rested: false }, held: true }; render(); }

// ---- the column canvas (grouped by layer when the model has layers)
let layout = [], hover = null, diag = null;
const DIAG_ON = ${DIAG};
function drawCols() {
  diag = DIAG_ON && M.diagnose ? M.diagnose() : null; const twinOfHover = diag && hover && diag.get(hover) ? diag.get(hover).twin : null;
  const idle = (i) => last && last.out.per && last.out.per[i] && last.out.per[i].skipped, rank = M.order ? M.order() : null;
  const groups = M.layers ? M.layers.map((L, i) => ({ title: 'layer ' + (i + 1) + ' · ' + L.cols.length + (M.o.columns === 'free' ? '' : ' of ' + L.n) + ' columns' + (M.o.plastic ? ' · plasticity ' + M.o.plastic[i].toFixed(3) : '')
    + (M.o.cascade && rank ? ' · looks ' + (rank.indexOf(i) + 1) + (rank.indexOf(i) === 0 ? 'st' : rank.indexOf(i) === 1 ? 'nd' : rank.indexOf(i) === 2 ? 'rd' : 'th') : '') + (idle(i) ? ' · idle (nothing hot left)' : '') + (M.soft && L.ema !== undefined ? (L.settled ? ' · settled' : ' · learning') + ' · heat ' + L.ema.toFixed(2) : '')
    + (L.threshold !== undefined ? ' · new column if nothing is ' + Math.round(100 * L.threshold) + '% similar' + (last && last.out.from === i ? ' · ANSWERING' : '') : ''), cols: L.cols })) : [{ title: null, cols: M.cols }];
  const total = groups.reduce((a, g) => a + g.cols.length, 0), small = total > 80;
  const FS = Math.max(2, Math.floor((small ? 25 : 35) / GW)), TW = small ? 33 : 46, GAP = small ? 5 : 8, CELL = small ? 3 : 4, CPR = small ? 9 : 9, CROWS = small ? 3 : 4, HEAD = 20;
  const cv = $('cv'), W = cv.clientWidth, dpr = window.devicePixelRatio || 1, per = Math.max(1, Math.floor((W + GAP) / (TW + GAP)));
  const TH = 4 + 5 * FS + 5 + CROWS * CELL + (small ? 3 : 14);
  let H = 0; for (const g of groups) H += (g.title ? HEAD : 0) + Math.max(1, Math.ceil(g.cols.length / per)) * (TH + GAP) + 4; H = Math.max(80, H);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; const g2 = cv.getContext('2d'); g2.setTransform(dpr, 0, 0, dpr, 0, 0); g2.clearRect(0, 0, W, H);
  const ink = css('--ink'), empty = css('--empty'), cellc = css('--cell'), nw = css('--new'), mut = css('--muted'), line = css('--line');
  const claim = new Map(), cellOn = new Map(), act = new Set(last && last.out.active ? last.out.active : []);
  if (last) { last.out.claims.forEach((q, k) => claim.set(q.c, PAL[k % PAL.length])); for (const z of last.out.cells || []) cellOn.set(z.cell, z.fresh); }
  const born = new Set(last ? (last.out.bornAll || (last.out.born ? [last.out.born] : [])) : []); layout = [];
  let y = 0;
  for (const grp of groups) {
    if (grp.title) { g2.fillStyle = mut; g2.font = '600 11px system-ui'; g2.fillText(grp.title.toUpperCase(), 0, y + 13); y += HEAD; }
    if (!grp.cols.length) { g2.fillStyle = mut; g2.font = '12px system-ui'; g2.fillText('no columns yet', 2, y + 14); }
    grp.cols.forEach((c, k) => {
      const x0 = (k % per) * (TW + GAP), y0 = y + Math.floor(k / per) * (TH + GAP), fx = x0 + (TW - 5 * FS) / 2, fy = y0 + 4; layout.push([x0, y0, TW, TH, c]);
      const col = claim.get(c), isAct = act.has(c), isNew = born.has(c);
      g2.strokeStyle = isNew ? nw : col || (isAct ? ink : line); g2.lineWidth = isNew || col || isAct ? 2 : 1; g2.strokeRect(x0 + .5, y0 + .5, TW - 1, TH - 1);
      if (diag) { const d = diag.get(c);                                    // C10 markers: dashed outlines inside the border
        if (d && d.outcompeted) { g2.save(); g2.setLineDash([3, 2]); g2.strokeStyle = '#e08a1e'; g2.lineWidth = 2; g2.strokeRect(x0 + 2.5, y0 + 2.5, TW - 5, TH - 5); g2.restore(); }
        if (d && d.duplicate) { g2.save(); g2.setLineDash([2, 2]); g2.strokeStyle = '#8a4fd1'; g2.lineWidth = 2; g2.strokeRect(x0 + 5, y0 + 5, TW - 10, TH - 10); g2.restore();
          g2.fillStyle = '#8a4fd1'; g2.font = '700 11px system-ui'; g2.fillText('≈', x0 + TW - 10, y0 + 11); }
        if (c === twinOfHover || c === hover) { g2.save(); g2.strokeStyle = '#8a4fd1'; g2.lineWidth = 3; g2.strokeRect(x0 + 1.5, y0 + 1.5, TW - 3, TH - 3); g2.restore(); } }
      for (let i = 0; i < GPX; i++) { const v = c.m[i], px = fx + (i % GW) * FS, py = fy + Math.floor(i / GW) * FS;
        g2.fillStyle = empty; g2.fillRect(px, py, FS - 1, FS - 1);
        if (M.soft) { if (v > 0.02) { g2.globalAlpha = Math.min(1, v); g2.fillStyle = col || ink; g2.fillRect(px, py, FS - 1, FS - 1); g2.globalAlpha = 1; } }   // soft: strength as shade
        else if (v > 0) { g2.globalAlpha = v >= K.CUT ? 1 : 0.25 + 0.5 * v; g2.fillStyle = col && v >= K.CUT ? col : ink; g2.fillRect(px, py, FS - 1, FS - 1); g2.globalAlpha = 1; } }
      const cy = fy + 5 * FS + 4, cs = c.cells, cap = CPR * CROWS, show = Math.min(cs.length, cs.length > cap ? cap - 1 : cap);
      for (let j = 0; j < show; j++) { const u = cs[j], px = fx + (j % CPR) * CELL, py = cy + Math.floor(j / CPR) * CELL;
        g2.fillStyle = cellOn.has(u) ? (cellOn.get(u) ? nw : col || ink) : cellc; g2.fillRect(px, py, CELL - 1, CELL - 1); }
      if (cs.length > show) { const px = fx + (show % CPR) * CELL, py = cy + Math.floor(show / CPR) * CELL; let a = null; for (const u of cs.slice(show)) if (cellOn.has(u)) a = u;
        g2.fillStyle = a ? (cellOn.get(a) ? nw : col || ink) : mut; g2.fillRect(px, py, CELL - 1, CELL - 1); }
      if (!small) { g2.fillStyle = mut; g2.font = '10px system-ui'; g2.textAlign = 'center';
        const lab = M.itemsUsing ? (c.layer > 1 ? (c.parts ? c.parts.size : c.place.length) + ' parts, ×' + M.itemsUsing(c) : M.st.composed !== undefined ? 'used ×' + M.itemsUsing(c) : 'in ' + M.itemsUsing(c) + ' memor' + (M.itemsUsing(c) === 1 ? 'y' : 'ies')) : cs.length + (cs.length === 1 ? ' cell' : ' cells');
        g2.fillText(lab, x0 + TW / 2, y0 + TH - 4); g2.textAlign = 'left'; }
    });
    y += Math.max(1, Math.ceil(grp.cols.length / per)) * (TH + GAP) + 4;
  }
}
$('cv').addEventListener('mousemove', (e) => { const r = $('cv').getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = $('tip');
  const hit = layout.find(([x0, y0, w, h]) => x >= x0 && x < x0 + w && y >= y0 && y < y0 + h);
  if (!hit) { t.style.display = 'none'; if (hover) { hover = null; drawCols(); } return; } const c = hit[4], px = [...c.m].filter((v) => v >= K.CUT).length;
  if (DIAG_ON && hover !== c) { hover = c; drawCols(); }
  const d = diag && diag.get(c), dtxt = d ? '<br>recently: ' + d.wins.toFixed(0) + ' wins · ' + d.seconds.toFixed(0) + ' second places (' + d.near.toFixed(0) + ' near ties)'
    + (d.outcompeted ? '<br><b style="color:#e08a1e">outcompeted</b>: second far more often than first' : '')
    + (d.twin ? '<br>closest in its layer: column ' + d.twin.id + ' (difference ' + d.dist.toFixed(2) + ')' + (d.duplicate ? ' · <b style="color:#8a4fd1">≈ near-duplicate</b>, the twin wins more' : '') : '') : '';
  t.innerHTML = 'column ' + c.id + (c.layer !== undefined ? ' (layer ' + (c.layer + 1) + ')' : '') + ' · ' + px + ' pixels<br>claimed ' + c.uses + ' times · ' + c.cells.length + ' cells<br>born at flash ' + c.born + ', last used ' + c.last + dtxt;
  t.style.display = 'block'; t.style.left = (e.clientX + 14) + 'px'; t.style.top = (e.clientY + 12) + 'px'; });
$('cv').addEventListener('mouseleave', () => { $('tip').style.display = 'none'; if (hover) { hover = null; drawCols(); } });

// ---- charts
function canvas2d(el, Hh) { const dpr = window.devicePixelRatio || 1, W = el.clientWidth; el.width = W * dpr; el.height = Hh * dpr; const g = el.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return [g, W]; }
function drawTrend() { const [g, W] = canvas2d($('trend'), 80), Hh = 80, heat = css('--heat'), mut = css('--muted'), line = css('--line');
  g.strokeStyle = line; g.lineWidth = 1; for (const v of [0.25, 0.5, 0.75]) { const yy = Math.round(Hh - v * (Hh - 4)) + .5; g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
  if (!hist.length) return; const bins = Math.min(hist.length, Math.floor(W / 2)), per = hist.length / bins, bw = W / bins; g.fillStyle = heat;
  for (let b = 0; b < bins; b++) { let s = 0, n = 0; for (let k = Math.floor(b * per); k < Math.floor((b + 1) * per); k++) { s += hist[k]; n++; } const v = n ? s / n : 0, h = Math.max(1, v * (Hh - 4));
    g.fillRect(b * bw, Hh - h, Math.max(1, bw - .3), h); }
  g.strokeStyle = css('--new'); g.lineWidth = 1.5; g.beginPath();                     // noise, on a 0–20% scale
  for (let b = 0; b < bins; b++) { let s = 0, n = 0; for (let k = Math.floor(b * per); k < Math.floor((b + 1) * per); k++) { s += nhist[k]; n++; } const v = n ? s / n : 0, yy = Hh - Math.min(1, v / 0.2) * (Hh - 4);
    if (b) g.lineTo(b * bw + bw / 2, yy); else g.moveTo(bw / 2, yy); } g.stroke();
  g.fillStyle = mut; g.font = '10px system-ui'; g.fillText('1', 2, 10); g.fillText(hist.length + ' flashes', W - 70, 10);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length), first = hist.slice(0, Math.min(200, hist.length)), lastN = hist.slice(-200);
  $('trendnote').textContent = 'first 200: ' + avg(first).toFixed(2) + ' · last 200: ' + avg(lastN).toFixed(2); }
function drawLayers() { if (!lhist.length) { $('lwrap').style.display = 'none'; return; } $('lwrap').style.display = '';
  const [g, W] = canvas2d($('ltrend'), 80), Hh = 80, n = lhist[0].length; if (!n) return; const bins = Math.min(n, Math.floor(W / 3)), per = n / bins, bw = W / bins;
  g.strokeStyle = css('--line'); g.lineWidth = 1; for (const v of [0.25, 0.5, 0.75]) { const yy = Math.round(Hh - v * (Hh - 4)) + .5; g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
  lhist.forEach((h, li) => { g.strokeStyle = PAL[li % PAL.length]; g.lineWidth = 1.5; g.beginPath();
    for (let b = 0; b < bins; b++) { let s = 0, c = 0; for (let k = Math.floor(b * per); k < Math.floor((b + 1) * per); k++) { s += h[k]; c++; } const yy = Hh - Math.min(1, c ? s / c : 0) * (Hh - 4);
      if (b) g.lineTo(b * bw + bw / 2, yy); else g.moveTo(bw / 2, yy); } g.stroke(); });
  $('lkey').innerHTML = lhist.map((_, i) => '<b style="color:' + PAL[i % PAL.length] + '">' + (i + 1) + '</b>').join(' '); }
function drawSpark() { const [g, W] = canvas2d($('spark'), 40), Hh = 40; g.fillStyle = css('--heat'); const bw = W / 300;
  spark.forEach((v, k) => { const h = Math.max(v > 0 ? 1 : 0, Math.min(1, v) * (Hh - 2)); g.fillRect(k * bw, Hh - h, Math.max(1, bw - .2), h); }); }

// ---- the right-hand side
function grid(el, paint) { el.innerHTML = ''; if (el.style) el.style.gridTemplateColumns = 'repeat(' + GW + ',1fr)'; for (let i = 0; i < GPX; i++) { const d = document.createElement('i'); paint(i, d); el.appendChild(d); } }
function render() {
  drawCols(); drawTrend(); drawSpark(); drawLayers(); if (!last) return;
  if (last.rest) { renderRest(); return; }
  const { id, x, out } = last, ink = css('--ink'), heat = css('--heat'), epc = css('--ep');
  $('pname').textContent = (last.held ? 'held out, first sight: ' : '') + '"' + (last.name || PAT[id].name) + '"';
  $('tno').textContent = last.held ? 'no learning' : 'flash ' + M.t;
  if (last.nz !== undefined) $('nnow').textContent = (100 * last.nz).toFixed(1) + '%';
  grid($('gin'), (i, d) => { if (x[i]) d.style.background = ink; });
  let owner = new Array(GPX).fill(-1), miss = new Array(GPX).fill(-1); const epm = out.ep && out.ep.episode ? out.ep.episode : 0;
  if (out.ownerPx) { owner = out.ownerPx; miss = out.missPx; }   // models that place units anywhere say which pixel each claim covers
  else out.claims.forEach((q, k) => { for (let i = 0; i < GPX; i++) if (q.c.m[i] >= K.CUT) { if (x[i] && owner[i] < 0) owner[i] = k; if (!x[i]) miss[i] = k; } });
  const left = new Set(out.left);
  grid($('gex'), (i, d) => { if (left.has(i)) d.style.background = heat; else if (owner[i] >= 0) d.style.background = PAL[owner[i] % PAL.length];
    else if (x[i] && (epm & (1 << i))) d.style.background = epc; else if (miss[i] >= 0) d.style.boxShadow = 'inset 0 0 0 2px ' + PAL[miss[i] % PAL.length];
    if (out.born && out.born.m && !out.ownerPx && out.born.m[i] >= K.CUT) d.style.boxShadow = 'inset 0 0 0 2px ' + css('--new'); });
  grid($('grc'), (i, d) => { let on = epm & (1 << i); if (out.ownerPx) on = out.recon[i]; else for (const q of out.claims) if (q.c.m[i] >= K.CUT) on = true; if (on) d.style.background = ink; });
  let onN = 0; for (const v of x) onN += v;
  const st = M.st, s = [['columns', M.cols.length], ['cells', M.cellCount()], ['parts in this flash', out.claims.length], ['left over now', out.left.length + ' px'], ['wrong now', (out.misses || 0) + ' px']];
  if (M.eps) s.push(['episodes stored', M.eps.length]);
  if (out.from !== undefined) s.push(['picture given by', 'layer ' + (out.from + 1)]);
  factorStats(s);
  { const caps = document.querySelectorAll ? document.querySelectorAll('.trio .cap') : []; if (caps.length === 3) { caps[0].textContent = 'as flashed'; caps[1].textContent = 'explained'; caps[2].textContent = 'rebuilt'; } }
  if (out.sim !== undefined) { s.push(['patterns in the catalogue (training)', TRAIN.length]); s.push(['best match similarity', out.sim < 0 ? '-' : Math.round(100 * out.sim) + '%' + (out.born ? ' → new column' : '')]); }
  if (diag) { let o = 0, d = 0; for (const v of diag.values()) { if (v.outcompeted) o++; if (v.duplicate) d++; } s.push(['outcompeted columns', o]); s.push(['near-duplicates', d]); }
  if (M.timeline) M.timeline.slice(-4).forEach((e) => s.push(['flash ' + e.t, e.event]));
  if (out.work !== undefined) { s.push(['work: columns checked', out.work]); if (out.per) s.push(['layers that looked', out.per.filter((q) => !q.skipped).length + ' of ' + out.per.length]); }
  if (out.per && onN) out.per.forEach((q, i) => s.push(['layer ' + (i + 1) + ' alone: heat', ((q.left.length + q.misses) / onN).toFixed(2)]));
  if (M.o && M.o.pay) s.push(['rest pressure', Math.round(100 * M.heat / K.PMAX) + '%']);
  const LBL = { rests: 'rests', grown: 'columns grown', retired: 'retired (unused)', removed: 'removed (didn\\'t pay)', recycled: 'taken over', absorbed: 'nearest moved (layer full)', reseeded: 'unused column reseeded' };
  for (const k of Object.keys(LBL)) if (st[k] !== undefined) s.push([LBL[k], st[k]]);
  $('stats').innerHTML = s.map(([a, b]) => '<span>' + a + '</span><b>' + b + '</b>').join('');
  $('restflag').textContent = out.rested ? 'just rested' : '';
}
function factorStats(s) { if (M.glance) { const q = M.glance(); s.push(['total energy (structure + flow)', q.E.toFixed(1)]); s.push(['structure / flow', q.structure.toFixed(1) + ' / ' + q.flow.toFixed(1)]); s.push(['price of a placement', q.pc.toFixed(2)]); s.push(['scenes in the flow (since last rest)', M.buf.length]); } else if (M.energy) s.push(['energy (pixels stored + parts used)', M.energy()]); if (M.energy) { s.push(['memories', M.items.length]); s.push(['pixels stored in parts', M.parts.reduce((a, p) => a + [...p.m].filter((v) => v).length, 0)]);
  s.push(['parts used by memories', M.links()]); s.push(['rest steps (factored / collapsed)', M.st.restSteps + ' (' + M.st.factored + ' / ' + M.st.collapsed + ')']);
  if (M.st.composed !== undefined) { s.push(['composites made', M.st.composed]); s.push(['layers', M.layers.length]); }
  if (M.st.dissolved !== undefined) { s.push(['dissolved / fused / dropped unused', M.st.dissolved + ' / ' + M.st.fused + ' / ' + M.st.dropped]); s.push(['rest moves tried / undone', M.tried + ' / ' + M.rejected]); } } }
function renderRest() { const a = last.rest, ink = css('--ink'), ov = PAL[0];
  const comp = a.type === 'compose', undo = a.type === 'dissolve' || a.type === 'fuse';
  $('pname').textContent = comp ? 'resting: a group used again and again becomes a composite' : a.type === 'dissolve' ? 'resting: a composite that no longer pays is folded back into its users' : a.type === 'fuse' ? 'resting: a composite that no longer pays becomes one plain part' : 'resting: the hottest pair, factored'; $('tno').textContent = 'saves ' + a.saving + ' energy';
  if (a.P === undefined) {   // C18: steps that carry units: show part A, part B (or A again, compared with itself shifted), and the result
    const pa = a.A ? a.A.m : null, pb = a.self ? (a.A ? a.A.m : null) : a.B ? a.B.m : null, res = a.made ? a.made.m : a.pieces[0] ? a.pieces[0].m : null;
    grid($('gin'), (i, d) => { if (pa && pa[i]) d.style.background = ink; if (comp && a.made && a.made.m[i]) d.style.background = ov; });
    grid($('gex'), (i, d) => { if (pb && pb[i]) d.style.background = ink; });
    grid($('grc'), (i, d) => { if (res && res[i]) d.style.background = ov; });
    const caps = document.querySelectorAll ? document.querySelectorAll('.trio .cap') : [];
    if (caps.length === 3) { if (comp) { caps[0].textContent = 'arrangement found again and again'; caps[1].textContent = ''; caps[2].textContent = 'now a composite'; }
      else if (undo) { caps[0].textContent = a.type === 'fuse' ? 'the composite, now one part' : 'the composite, now gone'; caps[1].textContent = ''; caps[2].textContent = a.type === 'fuse' ? 'the same pixels, stored plainly' : 'its users now hold its pieces'; }
      else { caps[0].textContent = 'part A, as it was'; caps[1].textContent = a.self ? 'part A again (compared with itself, shifted)' : 'part B, as it was'; caps[2].textContent = 'the shared piece, now a part (anywhere)'; } }
    const s = [['columns (units)', M.units.length]]; factorStats(s); $('stats').innerHTML = s.map(([p, q]) => '<span>' + p + '</span><b>' + q + '</b>').join(''); return; }
  const bit = (m, i) => (m & (1 << i)) !== 0;
  grid($('gin'), (i, d) => { if (bit(a.P, i)) d.style.background = bit(a.O, i) ? ov : ink; });
  grid($('gex'), (i, d) => { if (bit(a.Q, i)) d.style.background = bit(a.O, i) ? ov : ink; });
  grid($('grc'), (i, d) => { if (bit(a.O, i)) d.style.background = ov; });
  const caps = document.querySelectorAll ? document.querySelectorAll('.trio .cap') : [];
  if (caps.length === 3) { if (comp) { caps[0].textContent = 'a memory using the group (orange)'; caps[1].textContent = 'another one'; caps[2].textContent = 'the group, now a composite'; }
    else { caps[0].textContent = 'part A (orange: shared)'; caps[1].textContent = 'part B'; caps[2].textContent = 'their overlap, now a part'; } }
  const s = [['columns (parts)', M.parts.length]]; factorStats(s); $('stats').innerHTML = s.map(([p, q]) => '<span>' + p + '</span><b>' + q + '</b>').join(''); }
function play(on) { clearInterval(timer); timer = on ? setInterval(() => next(), 1000 / speed) : null; $('play').textContent = on ? 'Pause' : 'Play'; }
$('play').onclick = () => play(!timer);
$('step').onclick = () => { play(false); next(); };
$('ff').onclick = () => { for (let i = 0; i < 499; i++) next(false); next(); };
$('ff5').onclick = () => { for (let i = 0; i < 4999; i++) next(false); next(); };
if (document.getElementById('fth')) {
  $('fth').oninput = (e) => { $('fthv').textContent = e.target.value + '%'; if (M) M.o.threshold = e.target.value / 100; };
  $('frest').onclick = () => { play(false); clearInterval(restTimer); restTimer = setInterval(restTick, Math.max(60, 600 / speed)); };
  $('frestfast').onclick = () => { play(false); clearInterval(restTimer); restTimer = null; const n = M.rest(); $('fmsg').textContent = 'rested: ' + n + ' steps, now settled'; last = null; render(); };
  const playBtn = $('play').onclick; $('play').onclick = () => { clearInterval(restTimer); restTimer = null; playBtn(); }; }
if (document.getElementById('ql')) { const ql = () => { const n = +$('ql').value || 5, a = +$('qtop').value || 90, s = +$('qstep').value || 0;
    $('qlist').textContent = 'thresholds: ' + Array.from({ length: n }, (_, k) => Math.max(5, a - k * s) + '%').join(', '); };
  for (const id of ['ql', 'qtop', 'qstep']) $(id).oninput = ql; ql(); $('qapply').onclick = reset; $('qmeas').onchange = reset; $('qafter').onchange = reset; }
if (document.getElementById('nth')) { $('napply').onclick = reset; $('nmeas').onchange = reset; $('nafter').onchange = reset;
  $('nth').oninput = (e) => { $('nthv').textContent = e.target.value + '%'; if (M) M.o.threshold = e.target.value / 100; }; }   // threshold: live
if (document.getElementById('sfirst')) { $('sapply').onclick = reset; $('supdate').onchange = reset; $('sstart').onchange = reset;
  $('srest').oninput = (e) => { $('srestv').textContent = (+e.target.value).toFixed(3); if (M) M.o.restless = +e.target.value; }; }   // live, no restart
$('held').onclick = showHeld;
$('reset').onclick = reset; $('arm').onchange = reset; if (document.getElementById('price')) $('price').onchange = reset;
$('noise').oninput = (e) => { noise = e.target.value / 100; $('nv').textContent = e.target.value + '%'; };
$('nmode').onchange = () => { const w = $('nmode').value === 'wave'; $('wavectl').style.display = w ? '' : 'none'; $('nlabel').textContent = w ? 'Peak' : 'Level'; };
$('period').oninput = (e) => { $('pv').textContent = e.target.value + ' flashes'; };
$('smode').onchange = () => { $('focusctl').style.display = $('smode').value === 'focus' ? '' : 'none'; focus = []; };
$('phase').oninput = (e) => { $('phv').textContent = e.target.value + ' flashes'; };
if (document.getElementById('cnl')) { for (const id of ['cnl', 'ctop']) $(id).oninput = showCombo; for (const id of ['ckeep', 'cptop', 'cpbot']) $(id).onchange = showCombo;
  $('capply').onclick = reset; $('ccol').onchange = reset; $('cforget').onchange = reset; $('preset').onchange = () => loadPreset($('preset').value); showCombo(); }
if (document.getElementById('pnl')) { for (const id of ['pnl', 'psize']) $(id).oninput = showPlastic; for (const id of ['pfast', 'pslow']) $(id).onchange = showPlastic; $('papply').onclick = reset; $('pcol').onchange = reset; $('pforget').onchange = reset; showPlastic(); }
if (document.getElementById('nl')) { for (const id of ['nl', 'top', 'shrink']) $(id).oninput = showSizes; $('shrink').onchange = showSizes; $('colmode').onchange = reset; $('apply').onclick = reset; showSizes(); }
const sv = () => { $('sv').textContent = speed + '/s'; }; sv();
$('speed').oninput = (e) => { speed = +e.target.value; sv(); if (timer) play(true); };
window.addEventListener('resize', () => render());
if (document.getElementById('preset')) { $('preset').value = '${FIRST_PRESET}'; loadPreset('${FIRST_PRESET}'); } else reset(); play(true);
</script></body></html>`;
fs.writeFileSync(path.join(OUTDIR, 'viewer.html'), html);
console.log('wrote', path.join(OUTDIR, 'viewer.html'), (html.length / 1024).toFixed(1) + ' KB');
