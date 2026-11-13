// an-assembly · one thing the engine knows, two ways at once: its cells in its pieces' columns (an <an-columns> inside)
// and the picture it stands for. Focus on any thing inside it (breadcrumbs); show each piece's offset from its own centre;
// show which pieces' cells were kept and which completion fills in; pull the parts apart; play completion. Pointing at a
// part here or in the columns lights it in both. A domain component of the Anneal sandbox (see manifest.md); needs
// components/an-columns/an-columns.js.
(() => {
  if (customElements.get('an-assembly')) return;
  const css = `
  an-assembly { display: block; }
  an-assembly .ana-top { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 10px; font-size: 13px; color: var(--sb-muted); }
  an-assembly button { font: inherit; font-size: 12px; padding: 2px 9px; border: 1px solid var(--sb-border); border-radius: 4px; background: var(--sb-surface); color: var(--sb-text); cursor: pointer; }
  an-assembly button.on { border-color: var(--sb-accent); color: var(--sb-accent); background: color-mix(in srgb, var(--sb-accent) 12%, transparent); }
  an-assembly .ana-two { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 12px; }
  @media (max-width: 680px) { an-assembly .ana-two { grid-template-columns: minmax(0, 1fr); } }
  an-assembly .ana-card { border: 1px solid var(--sb-border); border-radius: var(--sb-radius, 6px); padding: 10px; background: var(--sb-surface); }
  an-assembly .ana-cap { font-size: 12px; color: var(--sb-muted); margin-bottom: 6px; }
  an-assembly .ana-crumbs { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; margin-bottom: 6px; font-size: 12px; color: var(--sb-muted); }
  an-assembly .ana-pic svg { display: block; margin: 0 auto; max-width: 100%; }
  an-assembly .ana-px { transition: opacity .25s; cursor: pointer; }
  an-assembly .ana-tools { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; font-size: 12px; color: var(--sb-muted); margin-top: 6px; }
  an-assembly .ana-tools label { display: inline-flex; gap: 5px; align-items: center; }
  an-assembly .ana-list { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--sb-muted); margin-top: 6px; }
  an-assembly .ana-list div { display: flex; gap: 6px; align-items: center; padding: 1px 4px; border-radius: 4px; cursor: pointer; }
  an-assembly .ana-list div.lit { background: var(--sb-surface-2, #eee); color: var(--sb-text); }
  an-assembly .ana-list i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
  an-assembly .ana-info { font-size: 12px; color: var(--sb-muted); min-height: 34px; margin-top: 6px; }
  an-assembly an-columns { --an-s: 14px; --an-h: 320px; }`;
  const style = document.createElement('style'); style.dataset.anAssembly = ''; style.textContent = css; document.head.append(style);
  const PAL = ['#7F77DD', '#1D9E75', '#D85A30', '#378ADD', '#D4537E', '#BA7517'], colour = (i) => PAL[i % PAL.length];
  const mini = (pts) => { const w = Math.max(...pts.map((p) => p[0])) + 1, h = Math.max(...pts.map((p) => p[1])) + 1, s = 4; return `<svg width="${w * s}" height="${h * s}">${pts.map(([x, y]) => `<rect x="${x * s}" y="${y * s}" width="${s - 0.5}" height="${s - 0.5}" fill="currentColor"/>`).join('')}</svg>`; };

  class AnAssembly extends HTMLElement {
    constructor() { super(); this._data = null; this._name = null; this._hl = null; this._off = false; this._kept = false; this._exp = 0; this._playing = false; }
    connectedCallback() {
      if (this._built) return; this._built = true; this.setAttribute('data-sb-announces', '');
      this.innerHTML = `<div class="ana-top"><span>Show:</span><span class="ana-pick"></span></div>
        <div class="ana-two">
          <div class="ana-card"><div class="ana-cap">Its cells, in its pieces' columns</div><an-columns radius="2"></an-columns><div class="ana-list ana-cols"></div></div>
          <div class="ana-card"><div class="ana-cap">What it stands for</div><div class="ana-crumbs"></div><div class="ana-pic"></div>
            <div class="ana-tools"><label><input type="checkbox" data-t="off"> Offsets</label><label><input type="checkbox" data-t="kept"> Kept or filled in</label>
              <label>Pull apart <input type="range" data-t="exp" min="0" max="1" step="0.05" value="0" style="width:70px"></label><button data-t="play">Play completion</button></div>
            <div class="ana-list ana-parts"></div><div class="ana-info"></div></div>
        </div>`;
      this._cols = this.querySelector('an-columns');
      this.querySelector('.ana-pick').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) this.thing = b.dataset.t; });
      this.querySelector('.ana-crumbs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { this._focus = +b.dataset.f; this._drawPic(); } });
      for (const sel of ['.ana-pic', '.ana-parts']) { const el = this.querySelector(sel);
        el.addEventListener('pointerover', (e) => { const d = e.target.closest('[data-i]'); this._announce(d ? +d.dataset.i : null); });
        el.addEventListener('pointerleave', () => this._announce(null)); }
      this.querySelector('.ana-tools').addEventListener('input', (e) => { const t = e.target.dataset.t; if (t === 'off') this._off = e.target.checked; if (t === 'kept') this._kept = e.target.checked; if (t === 'exp') this._exp = +e.target.value; this._drawPic(); });
      this.querySelector('[data-t="play"]').addEventListener('click', () => { this._playing = true; this._kept = true; this.querySelector('[data-t="kept"]').checked = true; this._drawPic(); setTimeout(() => { this._playing = false; this._drawPic(); }, 900); });
      this._onHl = (e) => { const r = (e.detail || {}).ref, m = r && r.match(/^asm:(.+)#(\d+)$/); const i = m && m[1] === this._name ? +m[2] : null; if (i !== this._hl) { this._hl = i; this._drawPic(); this._info(); } };
      document.addEventListener('sb-highlight', this._onHl);
      if (this._data) this._render();
    }
    disconnectedCallback() { document.removeEventListener('sb-highlight', this._onHl); }
    // data: { prims: [{ id, name, pts }], things: { name: { id, name, layer, centre, size, subs: [{ id, name, layer, parent }], inst: [{ i, prim, pix, path, cells: [{ f, thing, x, y, kept }] }] } }, usedBy: { primId: [names] } }
    set data(v) { this._data = v; if (!this._name || !(v && v.things[this._name])) this._name = v ? Object.keys(v.things)[0] : null; if (this._built) this._render(); }
    get data() { return this._data; }
    set thing(name) { this._name = name; this._hl = null; if (this._built && this._data) this._render(); }
    get thing() { return this._name; }

    get _T() { return this._data.things[this._name]; }
    _pname(id) { return this._data.prims.find((p) => p.id === id).name; }
    _sub(id) { return this._T.subs.find((s) => s.id === id); }
    _ref(i) { return `asm:${this._name}#${i}`; }
    _announce(i) { document.dispatchEvent(new CustomEvent('sb-highlight', { detail: { ref: i == null ? null : this._ref(i) } })); }
    _render() { const T = this._T; this._focus = T.id;
      this.querySelector('.ana-pick').innerHTML = Object.keys(this._data.things).map((n) => `<button data-t="${n}" class="${n === this._name ? 'on' : ''}">${n}</button>`).join(' ');
      const prims = [...new Set(T.inst.map((s) => s.prim))];
      this._cols.columns = prims.map((p) => this._pname(p));
      this._cols.floors = [...Array(T.layer).keys()].map((f) => ({ f, label: 'floor ' + f }));
      this._cols.cells = T.inst.flatMap((s) => s.cells.map((c) => ({ col: this._pname(s.prim), f: c.f, x: c.x, y: c.y, ref: this._ref(s.i), chain: 'i' + s.i, group: c.f ? c.thing : null, filled: c.f > 0 && c.kept === false, color: colour(s.i),
        title: `${this._pname(s.prim)} · floor ${c.f}${c.f ? ' · inside the ' + this._sub(c.thing).name + (c.kept === false ? ' (filled in by completion)' : ' (kept)') : ' · where'}` })));
      this.querySelector('.ana-cols').innerHTML = prims.map((p) => `<div>${mini(this._data.prims.find((x) => x.id === p).pts)}<span>${this._pname(p)}</span><span>· also in ${(this._data.usedBy[p] || []).filter((n) => n !== T.name).join(', ') || 'nothing else'}</span></div>`).join('');
      this._drawPic(); this._info(); }
    _drawPic() { if (!this._data) return; const T = this._T, P = 30, [w, h] = T.size, [tcx, tcy] = T.centre, ff = this._sub(this._focus).layer - 1, spread = this._exp * 0.9, hl = this._hl;
      const under = (st) => st.path.includes(this._focus), ctr = (st) => { const xs = st.pix.map((p) => p[0]), ys = st.pix.map((p) => p[1]); return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]; };
      const shift = (st) => { const [cx, cy] = ctr(st); return [(cx - tcx) * spread, (cy - tcy) * spread]; }, ex = Math.ceil(spread * Math.max(w, h) / 2) + 1, X = (x) => (x + ex) * P, Y = (y) => (y + ex) * P;
      let s = `<svg width="${(w + 2 * ex) * P}" height="${(h + 2 * ex) * P}">`;
      for (let y = -ex; y < h + ex; y++) for (let x = -ex; x < w + ex; x++) s += `<rect x="${X(x) + 0.5}" y="${Y(y) + 0.5}" width="${P - 1}" height="${P - 1}" fill="none" stroke="var(--sb-border)" stroke-width="0.5"/>`;
      for (const st of T.inst) { const [dx, dy] = shift(st), kc = st.cells.find((c) => c.f === ff), kept = !this._kept || !kc || kc.kept !== false, hide = this._playing && kc && kc.kept === false;
        const op = hide ? 0 : hl != null && hl !== st.i ? 0.25 : under(st) ? 1 : 0.18;
        s += `<g class="ana-px" data-i="${st.i}" data-ref="${this._ref(st.i)}" style="opacity:${op}">` + st.pix.map(([x, y]) => (kept ? `<rect x="${X(x + dx) + 2}" y="${Y(y + dy) + 2}" width="${P - 4}" height="${P - 4}" rx="3" fill="${colour(st.i)}"/>`
          : `<rect x="${X(x + dx) + 3}" y="${Y(y + dy) + 3}" width="${P - 6}" height="${P - 6}" rx="3" fill="${colour(st.i)}" fill-opacity=".18" stroke="${colour(st.i)}" stroke-width="1.5" stroke-dasharray="4 3"/>`)).join('') + '</g>'; }
      // offsets: from the centre of the thing in focus (each sub-thing's own centre) to each of its pieces' centres
      const pcen = (id) => { const p = this._data.prims.find((x) => x.id === id).pts; return [Math.floor(Math.max(...p.map((q) => q[0])) / 2), Math.floor(Math.max(...p.map((q) => q[1])) / 2)]; }, anchors = new Map();
      if (this._off) for (const st of T.inst) { if (!under(st)) continue; const c = st.cells.find((q) => q.f === ff); if (!c) continue;
        const ox = Math.min(...st.pix.map((p) => p[0])), oy = Math.min(...st.pix.map((p) => p[1])), [pcx, pcy] = pcen(st.prim), [dx, dy] = shift(st), px = X(ox + pcx + dx) + P / 2, py = Y(oy + pcy + dy) + P / 2, ax = ox + pcx - c.x, ay = oy + pcy - c.y, k = ax + ',' + ay;
        if (!anchors.has(k)) anchors.set(k, [X(ax + (ax - tcx) * spread) + P / 2, Y(ay + (ay - tcy) * spread) + P / 2]); const [mx, my] = anchors.get(k);
        s += `<line x1="${mx}" y1="${my}" x2="${px}" y2="${py}" stroke="var(--sb-text)" stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="3" fill="var(--sb-text)"/>`
          + `<text x="${px + (px >= mx ? 6 : -6)}" y="${py + (py > my ? 14 : -6)}" text-anchor="${px >= mx ? 'start' : 'end'}" font-size="11" fill="var(--sb-text)" style="paint-order:stroke;stroke:var(--sb-surface);stroke-width:3px">${c.x},${c.y}</text>`; }
      if (!anchors.size) anchors.set('t', [X(tcx) + P / 2, Y(tcy) + P / 2]);
      for (const [mx, my] of anchors.values()) s += `<text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="16" fill="var(--sb-text)" style="paint-order:stroke;stroke:var(--sb-surface);stroke-width:3px">+</text>`;
      this.querySelector('.ana-pic').innerHTML = s + '</svg>';
      this.querySelector('.ana-parts').innerHTML = T.inst.map((st) => `<div data-i="${st.i}" class="${hl === st.i ? 'lit' : ''}"><i style="background:${colour(st.i)}"></i>${this._pname(st.prim)}<span>· in ${st.path.map((id) => this._sub(id).name).join(' › ')}</span></div>`).join('');
      this.querySelector('.ana-crumbs').innerHTML = 'Focus: ' + T.subs.slice().sort((a, b) => b.layer - a.layer).map((x, j) => `${j ? '›' : ''}<button data-f="${x.id}" class="${x.id === this._focus ? 'on' : ''}">${x.name}</button>`).join(''); }
    _info() { const st = this._hl != null ? this._T.inst.find((s) => s.i === this._hl) : null;
      this.querySelector('.ana-info').innerHTML = st ? `<b>${this._pname(st.prim)}</b>, inside ${st.path.map((id) => this._sub(id).name).join(' › ')}. Its cells: ${st.cells.slice().sort((a, b) => a.f - b.f).map((c) => `floor ${c.f} at ${c.x},${c.y}${c.f && c.kept === false ? ' (filled in)' : ''}`).join(' · ')}.` : 'Point at a part, here or in the columns.'; }
  }
  customElements.define('an-assembly', AnAssembly);
})();
