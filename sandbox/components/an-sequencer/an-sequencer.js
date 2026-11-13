// an-sequencer · a design pad for column experiments. Set up a grid of columns (rows × columns, cells per column),
// then design a sequence: per time step, which columns are active (all their cells, or chosen cells), and which are
// held on across every step. Paint by dragging; a timeline of steps with thumbnails; play it back. Emits the design
// so a page (or the engine) can run it. A domain component of the Anneal sandbox (see manifest.md).
(() => {
  if (customElements.get('an-sequencer')) return;
  const css = `
  an-sequencer { display: block; font-size: 13px; color: var(--sb-text); }
  an-sequencer .seq-bar { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; margin-bottom: 10px; color: var(--sb-muted); }
  an-sequencer .seq-bar label { display: inline-flex; gap: 5px; align-items: center; }
  an-sequencer input[type=number] { width: 48px; font: inherit; padding: 2px 4px; border: 1px solid var(--sb-border); border-radius: 4px; background: var(--sb-surface); color: var(--sb-text); }
  an-sequencer button { font: inherit; font-size: 12px; padding: 3px 9px; border: 1px solid var(--sb-border); border-radius: 4px; background: var(--sb-surface); color: var(--sb-text); cursor: pointer; }
  an-sequencer button:hover { border-color: var(--sb-muted); }
  an-sequencer button.on { border-color: var(--sb-accent); color: var(--sb-accent); background: color-mix(in srgb, var(--sb-accent) 12%, transparent); }
  an-sequencer .seq-tools { display: inline-flex; gap: 0; } an-sequencer .seq-tools button { border-radius: 0; margin-left: -1px; } an-sequencer .seq-tools button:first-child { border-radius: 4px 0 0 4px; } an-sequencer .seq-tools button:last-child { border-radius: 0 4px 4px 0; }
  an-sequencer .seq-main { display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 14px; align-items: start; }
  @media (max-width: 760px) { an-sequencer .seq-main { grid-template-columns: minmax(0, 1fr); } }
  an-sequencer .seq-pad { border: 1px solid var(--sb-border); border-radius: var(--sb-radius, 6px); background: var(--sb-surface); padding: 12px; overflow: auto; touch-action: none; user-select: none; }
  an-sequencer .seq-grid { display: grid; gap: 6px; width: max-content; margin: 0 auto; }
  an-sequencer .seq-lab { font: 11px var(--sb-font, sans-serif); color: var(--sb-muted); display: flex; align-items: center; justify-content: center; }
  an-sequencer .seq-col { position: relative; width: var(--seq-c, 46px); height: var(--seq-c, 46px); border: 1.5px solid color-mix(in srgb, var(--sb-muted) 55%, transparent); border-radius: 8px;
    display: grid; gap: 3px; padding: 5px; box-sizing: border-box; cursor: pointer; background: var(--sb-surface); transition: background .12s, border-color .12s; }
  an-sequencer .seq-col:hover { border-color: var(--sb-accent); }
  an-sequencer .seq-col.ghost { background: color-mix(in srgb, var(--sb-muted) 14%, transparent); }
  an-sequencer .seq-col.on { border-color: var(--sb-accent); background: color-mix(in srgb, var(--sb-accent) 18%, transparent); }
  an-sequencer .seq-col.held { border-color: var(--sb-accent); border-style: double; border-width: 4px; padding: 3px; }
  an-sequencer .seq-col.lit { box-shadow: 0 0 0 2px var(--sb-accent); }
  an-sequencer .seq-cell { border-radius: 50%; border: 1px solid color-mix(in srgb, var(--sb-muted) 60%, transparent); background: transparent; }
  an-sequencer .seq-cell.on { background: var(--sb-accent); border-color: var(--sb-accent); }
  an-sequencer .seq-cell.ghost { background: color-mix(in srgb, var(--sb-muted) 45%, transparent); }
  an-sequencer .seq-col .seq-pin { position: absolute; top: -7px; right: -7px; width: 14px; height: 14px; border-radius: 50%; background: var(--sb-accent); color: #fff; font: 700 9px/14px var(--sb-font, sans-serif); text-align: center; }
  an-sequencer .seq-side { display: flex; flex-direction: column; gap: 8px; color: var(--sb-muted); }
  an-sequencer .seq-side .seq-now { font-size: 15px; color: var(--sb-text); font-weight: 600; }
  an-sequencer .seq-side ul { margin: 0; padding-left: 16px; } an-sequencer .seq-side li { margin: 2px 0; }
  an-sequencer .seq-time { margin-top: 12px; border: 1px solid var(--sb-border); border-radius: var(--sb-radius, 6px); background: var(--sb-surface); padding: 10px; }
  an-sequencer .seq-ctrl { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; color: var(--sb-muted); }
  an-sequencer .seq-strip { display: flex; gap: 6px; overflow-x: auto; padding: 4px 2px 6px; }
  an-sequencer .seq-step { flex: none; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px; border: 1.5px solid var(--sb-border); border-radius: 6px; cursor: pointer; background: var(--sb-surface); }
  an-sequencer .seq-step.cur { border-color: var(--sb-accent); background: color-mix(in srgb, var(--sb-accent) 10%, transparent); }
  an-sequencer .seq-step span { font-size: 11px; color: var(--sb-muted); }
  an-sequencer .seq-step svg { display: block; }
  an-sequencer details { margin-top: 8px; color: var(--sb-muted); } an-sequencer textarea { width: 100%; min-height: 110px; font: 11px var(--sb-mono, monospace); margin-top: 6px; box-sizing: border-box; border: 1px solid var(--sb-border); border-radius: 4px; background: var(--sb-surface); color: var(--sb-text); }`;
  const style = document.createElement('style'); style.dataset.anSequencer = ''; style.textContent = css; document.head.append(style);
  const ROWS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  class AnSequencer extends HTMLElement {
    constructor() { super(); this._rows = 8; this._cols = 8; this._cells = 4; this._steps = [new Map()]; this._held = new Map(); this._t = 0; this._tool = 'paint'; this._ghost = true; this._timer = null; this._speed = 600; }
    connectedCallback() {
      if (this._built) return; this._built = true; this.setAttribute('data-sb-announces', '');
      for (const a of ['rows', 'cols', 'cells']) if (this.hasAttribute(a)) this['_' + a] = Math.max(1, +this.getAttribute(a));
      this.innerHTML = `<div class="seq-bar">
          <label>Rows <input type="number" data-k="rows" min="1" max="26" value="${this._rows}"></label>
          <label>Columns <input type="number" data-k="cols" min="1" max="32" value="${this._cols}"></label>
          <label>Cells per column <input type="number" data-k="cells" min="1" max="16" value="${this._cells}"></label>
          <span class="seq-tools"><button data-tool="paint" class="on" title="Click or drag: column on or off at this step">Paint columns</button><button data-tool="cells" title="Click a cell: just that cell on or off at this step">Pick cells</button><button data-tool="hold" title="Click or drag: hold a column on at every step">Hold</button></span>
          <label><input type="checkbox" data-k="ghost" checked> Show the step before</label>
        </div>
        <div class="seq-main"><div class="seq-pad"><div class="seq-grid"></div></div><div class="seq-side"></div></div>
        <div class="seq-time"><div class="seq-ctrl">
            <button data-a="prev" title="Previous step (←)">◀</button><button data-a="play">Play</button><button data-a="next" title="Next step (→)">▶</button>
            <label>Speed <input type="range" data-k="speed" min="150" max="1500" step="50" value="600" style="width:80px; direction: rtl"></label>
            <span style="flex:1"></span>
            <button data-a="add" title="Add an empty step at the end">+ Step</button><button data-a="dup" title="Copy this step after it">Copy step</button><button data-a="del">Delete step</button><button data-a="clear">Clear step</button><button data-a="reset">Clear all</button>
          </div><div class="seq-strip"></div></div>
        <details><summary>The design as JSON (copy it, or paste one and press Load)</summary><textarea spellcheck="false"></textarea><div style="margin-top:6px"><button data-a="copy">Copy</button> <button data-a="load">Load</button></div></details>`;
      this._grid = this.querySelector('.seq-grid'); this._strip = this.querySelector('.seq-strip'); this._side = this.querySelector('.seq-side'); this._json = this.querySelector('textarea');
      this.querySelector('.seq-bar').addEventListener('input', (e) => { const k = e.target.dataset.k; if (!k) return; if (k === 'ghost') { this._ghost = e.target.checked; this._drawPad(); return; }
        const v = Math.max(+e.target.min || 1, Math.min(+e.target.max || 99, +e.target.value || 1)); this['_' + k] = v; this._trim(); this._changed(); });
      this.querySelector('.seq-tools').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; this._tool = b.dataset.tool; this.querySelectorAll('.seq-tools button').forEach((x) => x.classList.toggle('on', x === b)); });
      this.querySelector('.seq-time').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) this._act(b.dataset.a); const s = e.target.closest('.seq-step'); if (s) this.step = +s.dataset.t; });
      this.querySelector('.seq-time').addEventListener('input', (e) => { if (e.target.dataset.k === 'speed') { this._speed = +e.target.value; if (this._timer) { this._stop(); this._play(); } } });
      this.querySelector('details').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b) return; if (b.dataset.a === 'copy') { this._json.select(); try { navigator.clipboard.writeText(this._json.value); } catch (_) {} } if (b.dataset.a === 'load') { try { this.design = JSON.parse(this._json.value); } catch (err) { this._json.value = 'Not valid JSON: ' + err.message; } } });
      this.tabIndex = 0; this.addEventListener('keydown', (e) => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') { this.step = Math.min(this._steps.length - 1, this._t + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { this.step = Math.max(0, this._t - 1); e.preventDefault(); } if (e.key === ' ') { this._act('play'); e.preventDefault(); } });
      this._wirePad(); this._onHl = (e) => this._light(e.detail || {}); document.addEventListener('sb-highlight', this._onHl);
      this._changed();
    }
    disconnectedCallback() { this._stop(); document.removeEventListener('sb-highlight', this._onHl); }

    // ---- the design: { rows, cols, cells, held: [{ col, cells }], steps: [[{ col, cells }]] }; col like "A1"; cells "all" or [indexes]
    get design() { const out = (m) => [...m].map(([c, v]) => ({ col: this._name(c), cells: v === 'all' ? 'all' : [...v].sort((a, b) => a - b) })).sort((a, b) => this._idx(a.col) - this._idx(b.col));
      return { rows: this._rows, cols: this._cols, cells: this._cells, held: out(this._held), steps: this._steps.map(out) }; }
    set design(d) { this._stop(); this._rows = d.rows || 8; this._cols = d.cols || 8; this._cells = d.cells || 4; const inp = (k) => this.querySelector(`[data-k="${k}"]`); if (inp('rows')) { inp('rows').value = this._rows; inp('cols').value = this._cols; inp('cells').value = this._cells; }
      const into = (list) => new Map((list || []).map((e) => [this._idx(e.col), e.cells === 'all' ? 'all' : new Set(e.cells)]).filter(([i]) => i >= 0));
      this._held = into(d.held); this._steps = (d.steps && d.steps.length ? d.steps : [[]]).map(into); this._t = 0; this._trim(); this._changed(); }
    get step() { return this._t; }
    set step(t) { this._t = Math.max(0, Math.min(this._steps.length - 1, t)); this._drawPad(); this._drawStrip(); this._emitStep(); }
    // what is active at step t: held columns plus that step's, as [{ col, cells: [indexes] }]
    activeAt(t) { const m = new Map(); for (const src of [this._held, this._steps[t] || new Map()]) for (const [c, v] of src) { const all = [...Array(this._cells).keys()], prev = m.get(c) || new Set(); for (const k of v === 'all' ? all : v) prev.add(k); m.set(c, prev); }
      return [...m].map(([c, s]) => ({ col: this._name(c), cells: [...s].sort((a, b) => a - b) })).sort((a, b) => this._idx(a.col) - this._idx(b.col)); }
    get length() { return this._steps.length; }

    _name(i) { return ROWS[Math.floor(i / this._cols)] + ((i % this._cols) + 1); }
    _idx(n) { const r = ROWS.indexOf(String(n)[0]), c = parseInt(String(n).slice(1), 10) - 1; return r < 0 || r >= this._rows || !(c >= 0 && c < this._cols) ? -1 : r * this._cols + c; }
    _trim() { const n = this._rows * this._cols, keep = (m) => { for (const [c, v] of [...m]) { if (c >= n) { m.delete(c); continue; } if (v !== 'all') { for (const k of [...v]) if (k >= this._cells) v.delete(k); if (!v.size) m.delete(c); } } }; keep(this._held); this._steps.forEach(keep); }
    _changed() { this._drawPad(); this._drawStrip(); this._json.value = JSON.stringify(this.design); this.dispatchEvent(new CustomEvent('an-sequence-change', { detail: this.design, bubbles: true })); this._emitStep(); }
    _emitStep() { this.dispatchEvent(new CustomEvent('an-step', { detail: { t: this._t, active: this.activeAt(this._t) }, bubbles: true })); }
    _state(m, c) { return m.get(c); }
    _cellOn(m, c, k) { const v = m.get(c); return v === 'all' || (v && v.has(k)); }

    _wirePad() { let paint = null;
      const target = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest('.seq-col') && this.contains(el) ? el : null; };
      const apply = (el) => { const col = el.closest('.seq-col'), c = +col.dataset.c, cell = el.closest('.seq-cell'), m = this._tool === 'hold' ? this._held : this._steps[this._t];
        if (this._tool === 'cells' && cell) { const k = +cell.dataset.k, v = m.get(c); let s = v === 'all' ? new Set([...Array(this._cells).keys()]) : new Set(v || []);
          if (paint.mode === null) paint.mode = !s.has(k); paint.mode ? s.add(k) : s.delete(k); s.size === this._cells ? m.set(c, 'all') : s.size ? m.set(c, s) : m.delete(c); return; }
        if (paint.mode === null) paint.mode = !m.has(c); paint.mode ? m.set(c, 'all') : m.delete(c); };
      this._grid.addEventListener('pointerdown', (e) => { const el = e.target.closest('.seq-col'); if (!el) return; e.preventDefault(); this._stop(); paint = { mode: null, seen: new Set() }; paint.seen.add(e.target); apply(e.target); this._drawPad(); this._drawStrip(); });
      this._grid.addEventListener('pointermove', (e) => { const el = target(e); if (paint && el) { const key = el.closest('.seq-cell') && this._tool === 'cells' ? el.closest('.seq-cell') : el.closest('.seq-col'); if (!paint.seen.has(key)) { paint.seen.add(key); apply(el); this._drawPad(); this._drawStrip(); } }
        const col = el && el.closest('.seq-col'); const ref = col ? 'col-' + this._name(+col.dataset.c) : null; if (ref !== this._pointed) { this._pointed = ref; document.dispatchEvent(new CustomEvent('sb-highlight', { detail: { ref } })); } });
      window.addEventListener('pointerup', () => { if (paint) { paint = null; this._changed(); } });
      this._grid.addEventListener('pointerleave', () => { if (!paint) { this._pointed = null; document.dispatchEvent(new CustomEvent('sb-highlight', { detail: { ref: null } })); } }); }
    _cellsLayout() { const k = this._cells, w = Math.ceil(Math.sqrt(k)); return { w, h: Math.ceil(k / w) }; }
    _drawPad() { if (!this._grid) return; const { w, h } = this._cellsLayout(), cur = this._steps[this._t] || new Map(), prev = this._ghost && this._t > 0 ? this._steps[this._t - 1] : null;
      this._grid.style.gridTemplateColumns = `18px repeat(${this._cols}, var(--seq-c, 46px))`;
      let html = '<div></div>' + [...Array(this._cols).keys()].map((c) => `<div class="seq-lab">${c + 1}</div>`).join('');
      for (let r = 0; r < this._rows; r++) { html += `<div class="seq-lab">${ROWS[r]}</div>`;
        for (let c = 0; c < this._cols; c++) { const i = r * this._cols + c, held = this._held.has(i), on = cur.has(i) || held, ghost = !on && prev && prev.has(i);
          html += `<div class="seq-col${on ? ' on' : ''}${held ? ' held' : ''}${ghost ? ' ghost' : ''}" data-c="${i}" data-ref="col-${this._name(i)}" data-tags="row:${ROWS[r]} n:${c + 1}" data-sb-lights title="${this._name(i)}${held ? ' · held' : ''}" style="grid-template-columns:repeat(${w},1fr);grid-template-rows:repeat(${h},1fr)">`;
          for (let k = 0; k < this._cells; k++) { const lit = this._cellOn(cur, i, k) || this._cellOn(this._held, i, k), g = !lit && prev && this._cellOn(prev, i, k); html += `<div class="seq-cell${lit ? ' on' : ''}${g ? ' ghost' : ''}" data-k="${k}"></div>`; }
          html += (held ? '<span class="seq-pin" title="held at every step">H</span>' : '') + '</div>'; } }
      this._grid.innerHTML = html;
      const act = this.activeAt(this._t), heldN = this._held.size;
      this._side.innerHTML = `<div class="seq-now">Step ${this._t + 1} of ${this._steps.length}</div><div>${act.length} column${act.length === 1 ? '' : 's'} active${heldN ? ` (${heldN} held)` : ''}.</div>`
        + `<div style="font-size:12px">${this._tool === 'paint' ? 'Click or drag to turn columns on or off at this step.' : this._tool === 'cells' ? 'Click or drag over cells to choose just those cells at this step.' : 'Click or drag to hold columns on at every step.'}</div>`;
      this._light(this._last || {}); }
    _thumb(t) { const s = 5, m = this._steps[t]; let svg = `<svg width="${this._cols * s}" height="${this._rows * s}">`;
      for (let i = 0; i < this._rows * this._cols; i++) { const on = m.has(i), held = this._held.has(i); svg += `<rect x="${(i % this._cols) * s + 0.5}" y="${Math.floor(i / this._cols) * s + 0.5}" width="${s - 1}" height="${s - 1}" fill="${on ? 'var(--sb-accent)' : held ? 'color-mix(in srgb, var(--sb-accent) 45%, transparent)' : 'color-mix(in srgb, var(--sb-muted) 18%, transparent)'}"/>`; }
      return svg + '</svg>'; }
    _drawStrip() { if (!this._strip) return; this._strip.innerHTML = this._steps.map((_, t) => `<div class="seq-step${t === this._t ? ' cur' : ''}" data-t="${t}">${this._thumb(t)}<span>${t + 1}</span></div>`).join('');
      const cur = this._strip.querySelector('.cur'); if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      const pb = this.querySelector('[data-a="play"]'); if (pb) pb.textContent = this._timer ? 'Pause' : 'Play'; }
    _act(a) { const S = this._steps, t = this._t, copy = (m) => new Map([...m].map(([c, v]) => [c, v === 'all' ? 'all' : new Set(v)]));
      if (a === 'prev') this.step = t - 1; if (a === 'next') this.step = t + 1;
      if (a === 'play') { this._timer ? this._stop() : this._play(); this._drawStrip(); return; }
      if (a === 'add') { S.push(new Map()); this._t = S.length - 1; } if (a === 'dup') { S.splice(t + 1, 0, copy(S[t])); this._t = t + 1; }
      if (a === 'del') { if (S.length > 1) S.splice(t, 1); else S[0] = new Map(); this._t = Math.min(t, S.length - 1); }
      if (a === 'clear') S[t] = new Map(); if (a === 'reset') { this._steps = [new Map()]; this._held = new Map(); this._t = 0; }
      if (['add', 'dup', 'del', 'clear', 'reset'].includes(a)) this._changed(); }
    _play() { this._timer = setInterval(() => { this.step = (this._t + 1) % this._steps.length; }, this._speed); }
    _stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; this._drawStrip(); } }
    _light(d) { this._last = d; if (!this._grid) return; const ref = d.ref, refs = new Set([...(d.refs || []), ...(ref ? [ref] : [])]);
      this._grid.querySelectorAll('.seq-col').forEach((el) => el.classList.toggle('lit', refs.has(el.dataset.ref))); }
  }
  customElements.define('an-sequencer', AnSequencer);
})();
