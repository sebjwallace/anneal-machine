// an-columns · columns as 3D stacks of floors, side by side, a cube for each lit cell. Lines join a piece's cells up its
// column and a thing's assembly across columns. Drag to turn; a view cube to snap to a side; view settings underneath.
// A domain component of the Anneal sandbox (see manifest.md). CSS 3D transforms, no libraries: every cube, line, plate
// and column name is an element with data-ref / data-tags, so it takes part in highlighting like any other part.
(() => {
  if (customElements.get('an-columns')) return;
  const css = `
  an-columns { display: block; --an-s: 16px; --an-h: 460px; --an-grid: 0.6; --an-face: 0.5; }
  an-columns .anc-stage { position: relative; height: var(--an-h); perspective: 1400px; overflow: hidden; cursor: grab; outline: none; touch-action: none;
    background: var(--sb-surface); border: 1px solid var(--sb-border); border-radius: var(--sb-radius, 6px); }
  an-columns.ortho .anc-stage { perspective: none; }
  an-columns .anc-stage:focus-visible { box-shadow: 0 0 0 2px var(--sb-accent); }
  an-columns .anc-stage.drag { cursor: grabbing; }
  an-columns .anc-world { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; }
  an-columns .anc-world.snap, an-columns .anc-pivot.snap { transition: transform .45s ease; }
  an-columns .anc-floor { position: absolute; transform-style: preserve-3d; }
  an-columns .anc-plate { position: absolute; border: 1px solid color-mix(in srgb, var(--sb-muted) calc(var(--an-grid) * 100%), transparent);
    background-image: linear-gradient(color-mix(in srgb, var(--sb-muted) calc(var(--an-grid) * 55%), transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--sb-muted) calc(var(--an-grid) * 55%), transparent) 1px, transparent 1px);
    background-size: var(--an-s) var(--an-s); }
  an-columns .anc-plate.lit { border: 2px solid var(--sb-accent); background-color: color-mix(in srgb, var(--sb-accent) 12%, transparent); }
  an-columns .anc-mid { position: absolute; border: 1px dashed color-mix(in srgb, var(--sb-muted) calc(var(--an-grid) * 100%), transparent); box-sizing: border-box; }
  an-columns .anc-cube { position: absolute; transform-style: preserve-3d; cursor: pointer; transition: opacity .2s; }
  an-columns .anc-face { position: absolute; left: 0; top: 0; transform-origin: 0 0; box-sizing: border-box; border: 1.5px solid var(--c); background: color-mix(in srgb, var(--c) calc(var(--an-face) * 100%), transparent); }
  an-columns .anc-cube.fill .anc-face { border-style: dashed; background: color-mix(in srgb, var(--c) calc(var(--an-face) * 25%), transparent); }
  an-columns .anc-face.top { display: flex; align-items: center; justify-content: center; font: 600 10px var(--sb-font, sans-serif); color: #fff; }
  an-columns .anc-cube.fill .anc-face.top { color: var(--c); }
  an-columns .anc-cube.lit .anc-face { border-width: 2.5px; border-color: var(--sb-accent); background: color-mix(in srgb, var(--sb-accent) calc(var(--an-face) * 100%), transparent); color: #fff; }
  an-columns .anc-seg { position: absolute; left: 0; top: 0; transform-origin: 0 50%; transition: opacity .2s; }
  an-columns .anc-seg.edge { height: 1px; pointer-events: none; background: color-mix(in srgb, var(--sb-muted) calc(var(--an-grid) * 40%), transparent); }
  an-columns .anc-seg.up { height: 10px; margin-top: -5px; cursor: pointer; opacity: .55; background: linear-gradient(90deg, var(--ca), var(--cb)) center/100% 2px no-repeat; }
  an-columns .anc-seg.across { height: 10px; margin-top: -5px; cursor: pointer; opacity: .7; background: repeating-linear-gradient(90deg, var(--ca) 0 5px, transparent 5px 9px) center/100% 2px no-repeat; }
  an-columns .anc-seg.lit { opacity: 1; background: linear-gradient(90deg, var(--sb-accent), var(--sb-accent)) center/100% 3px no-repeat; }
  an-columns.sel .anc-cube:not(.keep) { opacity: .1; }
  an-columns.sel .anc-seg.up:not(.keep), an-columns.sel .anc-seg.across:not(.keep) { opacity: .05; }
  an-columns.sel .anc-seg.keep { opacity: 1; }
  an-columns.hl .anc-cube:not(.lit) { opacity: .28; }
  an-columns.hl .anc-seg.up:not(.lit), an-columns.hl .anc-seg.across:not(.lit) { opacity: .12; }
  an-columns.hl .anc-plate:not(.lit) { opacity: .5; }
  an-columns.no-up .anc-seg.up, an-columns.no-across .anc-seg.across, an-columns.no-edges .anc-seg.edge, an-columns.no-labels .anc-label { display: none; }
  an-columns .anc-label { position: absolute; white-space: nowrap; transform-origin: 0 0; font: 12px var(--sb-font, sans-serif); color: var(--sb-muted); pointer-events: none; }
  an-columns .anc-colname { position: absolute; white-space: nowrap; transform-origin: 50% 50%; font: 600 14px var(--sb-font, sans-serif); color: var(--sb-text); cursor: pointer; padding: 2px 6px; border-radius: var(--sb-radius, 6px); }
  an-columns .anc-colname:hover, an-columns .anc-colname.lit { color: var(--sb-accent); background: color-mix(in srgb, var(--sb-accent) 14%, transparent); }
  an-columns .anc-giz { position: absolute; right: 16px; top: 16px; width: 64px; height: 64px; z-index: 2; }
  an-columns .anc-pivot { position: absolute; left: 32px; top: 32px; width: 0; height: 0; transform-style: preserve-3d; }
  an-columns .anc-gface { position: absolute; left: 0; top: 0; width: 42px; height: 42px; transform-origin: 0 0; box-sizing: border-box; border: 1px solid var(--sb-border); background: var(--sb-surface-2, #eee);
    display: grid; grid-template-columns: 9px 1fr 9px; grid-template-rows: 9px 1fr 9px; }
  an-columns .anc-gz { cursor: pointer; display: flex; align-items: center; justify-content: center; font: 10px var(--sb-font, sans-serif); color: var(--sb-muted); user-select: none; overflow: hidden; }
  an-columns .anc-gz:hover { background: color-mix(in srgb, var(--sb-accent) 18%, transparent); color: var(--sb-accent); }
  an-columns .anc-tools { margin-top: 8px; font-size: 13px; color: var(--sb-muted); }
  an-columns .anc-tools summary { cursor: pointer; padding: 4px 2px; user-select: none; }
  an-columns .anc-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 14px 20px; padding: 12px 14px; margin-top: 6px; background: var(--sb-surface-2, #eee); border-radius: var(--sb-radius, 6px); }
  an-columns .anc-grp { display: flex; flex-direction: column; gap: 6px; }
  an-columns .anc-grp h4 { margin: 0; font-size: 11px; font-weight: 600; color: var(--sb-muted); }
  an-columns .anc-grp label { display: flex; gap: 8px; align-items: center; }
  an-columns .anc-grp input[type=range] { width: 100%; }
  an-columns .anc-grp button { font: inherit; padding: 2px 8px; border: 1px solid var(--sb-border); border-radius: 4px; background: var(--sb-surface); color: var(--sb-text); align-self: flex-start; }
  an-columns .anc-grp button.on { border-color: var(--sb-accent); color: var(--sb-accent); }`;
  const style = document.createElement('style'); style.dataset.anColumns = ''; style.textContent = css; document.head.append(style);
  const VIEW = { yaw: -22, pitch: 60 }, words = (s) => (s || '').split(/\s+/).filter(Boolean), TONE = (t) => (t ? `var(--sb-${t})` : 'var(--sb-accent)');

  class AnColumns extends HTMLElement {
    constructor() { super(); this._cols = []; this._floors = []; this._cells = []; this._view = { ...VIEW }; this._spread = 1; this._colGap = 1; this._layout = 'row'; this._hidden = new Set(); this._sel = null; }
    connectedCallback() {
      if (this._built) return; this._built = true; this.classList.add('ortho'); this.setAttribute('data-sb-announces', '');
      this.innerHTML = `<div class="anc-stage" tabindex="0" role="img" aria-label="Columns as stacks of floors"><div class="anc-world"></div><div class="anc-giz"><div class="anc-pivot"></div></div></div>
        <details class="anc-tools"><summary>View settings</summary><div class="anc-panel">
          <div class="anc-grp"><h4>Layout</h4><div><button data-l="row" class="on">Row</button> <button data-l="grid">Grid</button></div>
            <label><input type="checkbox" data-o="ortho" checked> Orthographic</label><button data-o="reset">Reset view</button></div>
          <div class="anc-grp anc-floors"><h4>Floors</h4></div>
          <div class="anc-grp"><h4>Lines and labels</h4>
            <label><input type="checkbox" data-o="up" checked> Up the column</label><label><input type="checkbox" data-o="across" checked> Across columns</label>
            <label><input type="checkbox" data-o="edges" checked> Column edges</label><label><input type="checkbox" data-o="labels" checked> Labels</label></div>
          <div class="anc-grp"><h4>Spacing and look</h4>
            <label>Floors <input type="range" data-o="spread" min="0.3" max="2" step="0.05" value="1"></label>
            <label>Columns <input type="range" data-o="cols" min="0.6" max="2.5" step="0.05" value="1"></label>
            <label>Grid <input type="range" data-o="grid" min="0" max="1" step="0.05" value="0.6"></label>
            <label>Faces <input type="range" data-o="face" min="0" max="1" step="0.05" value="0.5"></label></div>
        </div></details>`;
      this._stage = this.querySelector('.anc-stage'); this._world = this.querySelector('.anc-world'); this._pivot = this.querySelector('.anc-pivot');
      this._gizmo(); this._wire(); this._draw();
      this._onHl = (e) => this._light(e.detail || {}); document.addEventListener('sb-highlight', this._onHl);
    }
    disconnectedCallback() { document.removeEventListener('sb-highlight', this._onHl); }
    // columns: names in order · floors: [{ f, label }] · cells: [{ col, f, x, y, ref, tags, chain, group, filled, color, tone, text, title }]
    set columns(v) { this._cols = (v || []).slice(); if (this._built) this._draw(); }
    get columns() { return this._cols; }
    set floors(v) { this._floors = (v || []).slice().sort((a, b) => a.f - b.f); if (this._built) this._draw(); }
    get floors() { return this._floors; }
    set cells(v) { this._cells = (v || []).map((c, i) => ({ ...c, _id: i })); if (this._built) this._draw(); }
    get cells() { return this._cells; }
    set highlight(refs) { this._fixed = [...(refs || [])]; this._light({}); }
    get highlight() { return this._fixed || []; }
    get radius() { return +(this.getAttribute('radius') || 3); }

    _wire() {
      const st = this._stage; let drag = null;
      this._pivot.addEventListener('pointerdown', (e) => e.stopPropagation());
      this._pivot.addEventListener('click', (e) => { const z = e.target.closest('.anc-gz'); if (z) this._snap(this._from(z.dataset.d.split(',').map(Number))); });
      st.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, ...this._view, moved: false, target: e.target }; st.setPointerCapture(e.pointerId); st.classList.add('drag'); });
      st.addEventListener('pointermove', (e) => { if (!drag) { this._point(e.target); return; } if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) drag.moved = true; if (!drag.moved) return;
        this._view.yaw = drag.yaw - (e.clientX - drag.x) * 0.4; this._view.pitch = Math.max(-180, Math.min(180, drag.pitch + (e.clientY - drag.y) * 0.35)); this._turn(); });
      st.addEventListener('pointerup', () => { if (drag && !drag.moved) this._click(drag.target); drag = null; st.classList.remove('drag'); });
      st.addEventListener('pointercancel', () => { drag = null; st.classList.remove('drag'); });
      st.addEventListener('pointerleave', () => this._point(null));
      st.addEventListener('keydown', (e) => { if (e.key === 'Escape') { this._sel = null; this._applySel(); return; } const d = { ArrowLeft: [8, 0], ArrowRight: [-8, 0], ArrowUp: [0, -6], ArrowDown: [0, 6] }[e.key]; if (!d) return; e.preventDefault();
        this._view.yaw += d[0]; this._view.pitch = Math.max(-180, Math.min(180, this._view.pitch + d[1])); this._turn(); });
      const panel = this.querySelector('.anc-panel');
      panel.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.l) { this._layout = b.dataset.l; panel.querySelectorAll('[data-l]').forEach((x) => x.classList.toggle('on', x === b)); this._draw(); }
        if (b.dataset.o === 'reset') this._snap({ ...VIEW }); });
      panel.addEventListener('input', (e) => { const o = e.target.dataset.o, v = e.target.type === 'checkbox' ? e.target.checked : +e.target.value;
        if (e.target.dataset.floor != null) { v ? this._hidden.delete(e.target.dataset.floor) : this._hidden.add(e.target.dataset.floor); this._place(); return; }
        if (o === 'ortho') this.classList.toggle('ortho', v);
        if (o === 'up' || o === 'across' || o === 'edges' || o === 'labels') this.classList.toggle('no-' + o, !v);
        if (o === 'spread') { this._spread = v; this._place(); } if (o === 'cols') { this._colGap = v; this._place(); }
        if (o === 'grid') this.style.setProperty('--an-grid', v); if (o === 'face') this.style.setProperty('--an-face', v); });
    }
    _from(d) { const r = Math.hypot(d[0], d[1]); return { yaw: r < 1e-9 ? 0 : Math.atan2(d[0], d[1]) * 180 / Math.PI, pitch: Math.atan2(r, d[2]) * 180 / Math.PI }; }
    _snap(v) { const w = this._world, p = this._pivot; w.classList.add('snap'); p.classList.add('snap'); let y = v.yaw; while (y - this._view.yaw > 180) y -= 360; while (y - this._view.yaw < -180) y += 360;
      this._view = { pitch: v.pitch, yaw: y }; this._turn(); setTimeout(() => { w.classList.remove('snap'); p.classList.remove('snap'); }, 480); }
    _gizmo() { const a = 42, h = a / 2, F = { top: [[0, 0, 1], [1, 0, 0], [0, 1, 0]], bottom: [[0, 0, -1], [1, 0, 0], [0, -1, 0]], front: [[0, 1, 0], [1, 0, 0], [0, 0, -1]], back: [[0, -1, 0], [-1, 0, 0], [0, 0, -1]], right: [[1, 0, 0], [0, -1, 0], [0, 0, -1]], left: [[-1, 0, 0], [0, 1, 0], [0, 0, -1]] };
      for (const name in F) { const [n, u, v] = F[name], t = [0, 1, 2].map((i) => n[i] * h - u[i] * h - v[i] * h), f = document.createElement('div'); f.className = 'anc-gface';
        f.style.transform = `matrix3d(${u[0]},${u[1]},${u[2]},0,${v[0]},${v[1]},${v[2]},0,${n[0]},${n[1]},${n[2]},0,${t[0]},${t[1]},${t[2]},1)`;
        for (const j of [-1, 0, 1]) for (const i of [-1, 0, 1]) { const z = document.createElement('div'); z.className = 'anc-gz'; z.dataset.d = [0, 1, 2].map((k) => n[k] + i * u[k] + j * v[k]).join(','); if (!i && !j) z.textContent = name[0].toUpperCase() + name.slice(1); f.append(z); }
        this._pivot.append(f); } }
    _geom() { const s = parseFloat(getComputedStyle(this).getPropertyValue('--an-s')) || 16, R = this.radius, N = 2 * R + 1; return { s, R, N, H: s * 0.78, SPACE: N * s + 34 }; }
    _colXY(c) { const { SPACE } = this._geom(), i = this._cols.indexOf(c), sp = SPACE * this._colGap, n = this._cols.length; if (this._layout === 'row') return [(i - (n - 1) / 2) * sp, 0];
      const w = Math.ceil(Math.sqrt(n)), h = Math.ceil(n / w); return [((i % w) - (w - 1) / 2) * sp, (Math.floor(i / w) - (h - 1) / 2) * sp]; }
    _gap() { const { N, s, H } = this._geom(), p = VIEW.pitch * Math.PI / 180, y = VIEW.yaw * Math.PI / 180; return Math.min(240, ((Math.abs(Math.sin(y)) + Math.abs(Math.cos(y))) * N * s * Math.cos(p) + H) / Math.sin(p) + 18); }
    _draw() { const { s, R, N, H } = this._geom(), w = this._world, k = s * 0.84; w.innerHTML = '';
      this.querySelector('.anc-floors').innerHTML = '<h4>Floors</h4>' + this._floors.slice().reverse().map((fl) => `<label><input type="checkbox" data-floor="${fl.f}" ${this._hidden.has(String(fl.f)) ? '' : 'checked'}> ${fl.label || 'Floor ' + fl.f}</label>`).join('');
      for (const col of this._cols) for (const fl of this._floors) { const F = document.createElement('div'); F.className = 'anc-floor'; F.dataset.f = fl.f;
        const p = document.createElement('div'); p.className = 'anc-plate'; p.dataset.col = col; p.dataset.sbLights = ''; p.dataset.tags = ['f:' + fl.f, 'c:' + col, ...(fl.tags || [])].join(' '); if (fl.ref) p.dataset.ref = fl.ref; F.append(p);
        const m = document.createElement('div'); m.className = 'anc-mid'; m.dataset.col = col; F.append(m);
        for (const c of this._cells.filter((c) => c.col === col && c.f === fl.f && Math.abs(c.x) <= R && Math.abs(c.y) <= R)) { const el = document.createElement('div');
          el.className = 'anc-cube' + (c.filled ? ' fill' : ''); el.dataset.i = c._id; el.dataset.col = col; el.dataset.x = c.x; el.dataset.y = c.y; el.dataset.sbLights = '';
          if (c.ref) el.dataset.ref = c.ref; el.dataset.tags = ['f:' + c.f, 'c:' + col, ...(c.tags || [])].join(' '); if (c.title) el.title = c.title;
          Object.assign(el.style, { width: k + 'px', height: k + 'px' }); el.style.setProperty('--c', c.color || TONE(c.tone));
          for (const [tf, fw, fh, top] of [[`translateY(${k}px) rotateX(90deg)`, k, H], ['rotateX(90deg)', k, H], ['rotateY(-90deg)', H, k], [`translateX(${k}px) rotateY(-90deg)`, H, k], ['', k, k], [`translateZ(${H}px)`, k, k, 1]]) {
            const f = document.createElement('div'); f.className = 'anc-face' + (top ? ' top' : ''); Object.assign(f.style, { width: fw + 'px', height: fh + 'px', transform: tf }); if (top && c.text != null) f.textContent = c.text; el.append(f); }
          F.append(el); }
        if (fl.label && col === this._cols[0]) { const l = document.createElement('div'); l.className = 'anc-label'; l.textContent = fl.label; F.append(l); }
        w.append(F); }
      if (this._cols.length > 1 || this._cols[0]) for (const col of this._cols) { const n = document.createElement('div'); n.className = 'anc-colname'; n.textContent = col; n.dataset.col = col; n.dataset.tags = 'c:' + col; n.dataset.sbLights = ''; w.append(n); }
      this._place(); this._light(this._last || {}); }
    _pos(c) { const { s, H } = this._geom(), [cx, cy] = this._colXY(c.col); return [cx + c.x * s, cy + c.y * s, this._z(c.f) + H / 2]; }
    _seg(a, b, cls, ids, ca, cb) { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz), e = document.createElement('div');
      e.className = 'anc-seg ' + cls; e.dataset.ids = ids.join(' '); if (ca) { e.style.setProperty('--ca', ca); e.style.setProperty('--cb', cb || ca); }
      e.style.width = L + 'px'; e.style.transform = `translate3d(${a[0]}px,${a[1]}px,${a[2]}px) rotateZ(${Math.atan2(dy, dx) * 180 / Math.PI}deg) rotateY(${-Math.atan2(dz, Math.hypot(dx, dy)) * 180 / Math.PI}deg)`; this._world.append(e); }
    _place() { const { s, N } = this._geom(), k = s * 0.84, o = (s - k) / 2, gap = this._gap(), shown = this._floors.filter((fl) => !this._hidden.has(String(fl.f))), mid = (this._floors.length - 1) / 2;
      this._z = (f) => (this._floors.findIndex((x) => x.f === f) - mid) * gap * this._spread;
      const w = this._world, col = (el) => this._colXY(el.dataset.col);
      w.querySelectorAll('.anc-plate').forEach((p) => { const [x, y] = col(p); Object.assign(p.style, { width: N * s + 'px', height: N * s + 'px', left: x - N * s / 2 + 'px', top: y - N * s / 2 + 'px' }); });
      w.querySelectorAll('.anc-mid').forEach((m) => { const [x, y] = col(m); Object.assign(m.style, { width: s + 'px', height: s + 'px', left: x - s / 2 + 'px', top: y - s / 2 + 'px' }); });
      w.querySelectorAll('.anc-cube').forEach((e) => { const [x, y] = col(e); Object.assign(e.style, { left: x + e.dataset.x * s - s / 2 + o + 'px', top: y + e.dataset.y * s - s / 2 + o + 'px' }); });
      w.querySelectorAll('.anc-floor').forEach((F) => { F.style.display = this._hidden.has(F.dataset.f) ? 'none' : ''; F.style.transform = `translateZ(${this._z(+F.dataset.f)}px)`; });
      w.querySelectorAll('.anc-seg').forEach((e) => e.remove());
      if (shown.length) { const lo = this._z(shown[0].f), hi = this._z(shown[shown.length - 1].f), E = N * s / 2;
        if (shown.length > 1) for (const c of this._cols) { const [x, y] = this._colXY(c); for (const [a, b] of [[-E, -E], [E, -E], [E, E], [-E, E]]) this._seg([x + a, y + b, lo], [x + a, y + b, hi], 'edge', []); }
        const vis = this._cells.filter((c) => !this._hidden.has(String(c.f)) && this._cols.includes(c.col)), by = (key) => { const g = {}; for (const c of vis) if (key(c) != null) (g[key(c)] = g[key(c)] || []).push(c); return Object.values(g); };
        for (const q of by((c) => c.chain)) { q.sort((a, b) => a.f - b.f); for (let i = 0; i + 1 < q.length; i++) this._seg(this._pos(q[i]), this._pos(q[i + 1]), 'up', [q[i]._id, q[i + 1]._id], q[i].color || TONE(q[i].tone), q[i + 1].color || TONE(q[i + 1].tone)); }
        for (const g of by((c) => (c.group != null ? c.f + ':' + c.group : null))) { g.sort((a, b) => this._cols.indexOf(a.col) - this._cols.indexOf(b.col) || a.y - b.y || a.x - b.x); for (let i = 0; i + 1 < g.length; i++) this._seg(this._pos(g[i]), this._pos(g[i + 1]), 'across', [g[i]._id, g[i + 1]._id], g[i].color || TONE(g[i].tone)); } }
      this._applySel(); this._turn(); }
    _turn() { const { s, N, H } = this._geom(), v = this._view, tf = `rotateX(${v.pitch}deg) rotateZ(${v.yaw}deg)`, bb = `rotateZ(${-v.yaw}deg) rotateX(${-v.pitch}deg)`, y = v.yaw * Math.PI / 180, E = N * s / 2;
      this._world.style.transform = tf; this._pivot.style.transform = tf; if (!this._z) return;
      let best = [E, E], bx = -1e9; for (const [cx, cy] of [[-E, -E], [E, -E], [E, E], [-E, E]]) { const sx = cx * Math.cos(y) - cy * Math.sin(y); if (sx > bx + 1e-6) { bx = sx; best = [cx, cy]; } }
      let lc = this._cols[0], lx = -1e9; for (const c of this._cols) { const [cx, cy] = this._colXY(c), sx = cx * Math.cos(y) - cy * Math.sin(y); if (sx > lx) { lx = sx; lc = c; } }
      const [lcx, lcy] = lc != null ? this._colXY(lc) : [0, 0];
      this._world.querySelectorAll('.anc-label').forEach((l) => { l.style.left = lcx + best[0] + 'px'; l.style.top = lcy + best[1] + 'px'; l.style.transform = `${bb} translate(10px,-8px)`; });
      const top = Math.max(0, ...this._floors.filter((fl) => !this._hidden.has(String(fl.f))).map((fl) => this._z(fl.f))) + H + 26;
      this._world.querySelectorAll('.anc-colname').forEach((n) => { const [x, yy] = this._colXY(n.dataset.col); n.style.left = x + 'px'; n.style.top = yy + 'px'; n.style.transform = `translate3d(0,0,${top}px) ${bb} translate(-50%,-50%)`; }); }
    // pointing announces the ref and tags of what is under the pointer
    _point(t) { const el = t && t.closest ? t.closest('.anc-cube,.anc-colname,.anc-plate,.anc-seg.up,.anc-seg.across') : null; if (el === this._pointed) return; this._pointed = el;
      let detail = { ref: null };
      if (el && el.classList.contains('anc-seg')) { const cs = el.dataset.ids.split(' ').map((i) => this._cells[+i]); detail = { refs: cs.map((c) => c.ref).filter(Boolean), ref: cs[0] && cs[0].ref || null, tags: [] }; }
      else if (el) detail = { ref: el.dataset.ref || null, tags: words(el.dataset.tags).filter((t) => el.classList.contains('anc-colname') || !/^[fc]:/.test(t)) };
      if (el && el.classList.contains('anc-colname')) detail.tags = ['c:' + el.dataset.col];
      document.dispatchEvent(new CustomEvent('sb-highlight', { detail })); }
    // lights: cells whose ref is announced (or in refs, or fixed), or that carry an announced tag; plates and names by c:/f: tags
    _light(d) { this._last = d; const refs = new Set([...(d.refs || []), ...(d.ref ? [d.ref] : []), ...(this._fixed || [])]), tags = new Set(d.tags || []), w = this._world; if (!w) return;
      const lit = (el) => (el.dataset.ref && refs.has(el.dataset.ref)) || words(el.dataset.tags).some((t) => tags.has(t)); let any = false;
      w.querySelectorAll('.anc-cube').forEach((e) => { const on = lit(e); e.classList.toggle('lit', on); any = any || on; });
      const litIds = new Set([...w.querySelectorAll('.anc-cube.lit')].map((e) => e.dataset.i));
      w.querySelectorAll('.anc-seg.up,.anc-seg.across').forEach((e) => e.classList.toggle('lit', any && e.dataset.ids.split(' ').every((i) => litIds.has(i))));
      w.querySelectorAll('.anc-plate').forEach((p) => p.classList.toggle('lit', (p.dataset.ref && refs.has(p.dataset.ref)) || words(p.dataset.tags).some((t) => /^[fc]:/.test(t) && tags.has(t))));
      w.querySelectorAll('.anc-colname').forEach((n) => n.classList.toggle('lit', tags.has('c:' + n.dataset.col)));
      this.classList.toggle('hl', any); }
    // clicking keeps a cell and its neighbours (up and down its column, and its own assembly), a line, or a column; again to clear
    _click(t) { const el = t.closest('.anc-cube,.anc-seg.up,.anc-seg.across,.anc-colname'); let next = null;
      if (el && el.classList.contains('anc-cube')) next = { cell: +el.dataset.i }; else if (el && el.classList.contains('anc-colname')) next = { col: el.dataset.col }; else if (el) next = { seg: el };
      const same = next && this._sel && ((next.cell != null && this._sel.cell === next.cell) || (next.seg && this._sel.seg === next.seg) || (next.col && this._sel.col === next.col));
      this._sel = next && !same ? next : null; this._applySel(); }
    _applySel() { const S = this._sel, w = this._world; this.classList.toggle('sel', !!S); if (!w) return; let keep = new Set();
      if (S && S.cell != null) { const c = this._cells[S.cell]; keep = new Set(this._cells.filter((x) => x._id === c._id || (c.chain != null && x.chain === c.chain && Math.abs(x.f - c.f) === 1) || (c.group != null && x.f === c.f && x.group === c.group)).map((x) => x._id)); }
      else if (S && S.col) keep = new Set(this._cells.filter((x) => x.col === S.col).map((x) => x._id)); else if (S && S.seg) keep = new Set(S.seg.dataset.ids.split(' ').map(Number));
      w.querySelectorAll('.anc-cube').forEach((e) => e.classList.toggle('keep', keep.has(+e.dataset.i)));
      w.querySelectorAll('.anc-seg.up,.anc-seg.across').forEach((e) => { const ids = e.dataset.ids.split(' ').map(Number); e.classList.toggle('keep', !!S && (S.seg ? e === S.seg : S.col ? ids.every((i) => keep.has(i)) : ids.includes(S.cell))); }); }
  }
  customElements.define('an-columns', AnColumns);
})();
