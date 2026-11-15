import { origin, roleOf } from './roles.js';

// Draws a volume as a grid of columns, in layers that can each be turned off. The visual language of docs/visuals: a
// dot is a cell, colour is active, red is heat, a dashed ring is predicted, an outline round cells is an assembly and
// an outline round outlines is an assembly of assemblies. The grid is only a layout: columns know nothing of
// where they sit.

const SPACING = 100;
const MARGIN = 50;
const BOX = 84;
const OFFSET = 19;
const R = 8;
const RING = 12;

export const PALETTE = ['#D4537E', '#2A9D8F', '#E07A3F', '#7A9A2E', '#5B6FB5', '#B5539B', '#2E9AB0', '#9C6B3E'];
const COLOUR = { seq: 'var(--seq)', part: 'var(--part)' };
const css = (rules) => `style="${rules}"`;

// The convex hull of points (monotone chain).
function hull(points) {
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const half = (list) => list.reduce((h, q) => {
    while (h.length >= 2 && cross(h.at(-2), h.at(-1), q) <= 0) h.pop();
    h.push(q);
    return h;
  }, []);
  const lower = half(p);
  const upper = half([...p].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

export class VolumeDrawing {
  #svg;
  #position = new Map();

  constructor(svg, labels) {
    this.#svg = svg;
    const across = Math.ceil(Math.sqrt(labels.length));
    labels.forEach((label, i) => this.#position.set(label, {
      x: MARGIN + (i % across) * SPACING,
      y: MARGIN + Math.floor(i / across) * SPACING,
    }));
    const width = 2 * MARGIN + (across - 1) * SPACING;
    const height = Math.ceil(labels.length / across) * SPACING;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  // Where a cell sits: four to a column, two by two.
  place(cell) {
    const { x, y } = this.#position.get(cell.column.label);
    return { x: x + (cell.index % 2 ? OFFSET : -OFFSET), y: y + (cell.index > 1 ? OFFSET : -OFFSET) };
  }

  // layers: which layers are on. bands: [{ node, focus }] to outline. focus: the cell under the pointer.
  draw({ volume, moment, layers, bands, focus }) {
    const lit = new Set(moment?.lit ?? []);
    const uncovered = new Set(moment?.uncovered ?? []);
    const refused = new Set(moment?.refused ?? []);
    const winners = new Set(moment?.winners.values() ?? []);
    const active = moment?.active ?? new Set();
    const notThere = new Set([...(moment?.brought ?? []), ...(moment?.missing ?? [])]);
    const next = moment?.next ?? new Set();
    const fired = moment?.fired ?? new Set();
    const grown = new Set(moment?.grown ?? []);
    const dimmed = bands.some((band) => band.focus);

    let out = '';
    for (const column of volume.columns) {
      const { x, y } = this.#position.get(column.label);
      const on = layers.activity && lit.has(column);
      out += `<rect x="${x - BOX / 2}" y="${y - BOX / 2}" width="${BOX}" height="${BOX}" rx="10" ${css(
        `fill:var(--surface);fill-opacity:${on ? 1 : 0.35};stroke:var(${on ? '--strong' : '--quiet'});` +
        `stroke-width:${on ? 1.3 : 0.6};${on && refused.has(column) ? 'stroke-dasharray:4 3' : ''}`)}/>`;
    }

    // outlines: outermost first, so an assembly's outline sits round those of the assemblies it holds
    const order = [...bands].sort((a, b) => b.node.depth - a.node.depth);
    for (const { node, focus: isFocus, cut } of order) out += this.#band(node, isFocus, dimmed, cut);

    let links = '';
    let cells = '';
    for (const column of volume.columns) {
      for (const cell of column.cells) {
        const { x, y } = this.place(cell);
        const hot = uncovered.has(column);
        if (layers.activity && winners.has(cell)) {
          cells += `<circle cx="${x}" cy="${y}" r="${R}" ${css(`fill:var(${hot ? '--heat' : '--fit'});stroke:var(--text);stroke-width:1.3`)}/>`;
        } else if (layers.activity && active.has(cell)) {
          cells += `<circle cx="${x}" cy="${y}" r="${R}" ${css(`fill:var(${hot ? '--heat' : '--fit'});fill-opacity:.18;stroke:var(--quiet);stroke-width:.7`)}/>`;
        } else {
          cells += `<circle cx="${x}" cy="${y}" r="${R}" ${css('fill:var(--bg);stroke:var(--quiet);stroke-width:.7')}/>`;
        }
        if (layers.segments) cells += this.#arcs(cell, x, y, fired, grown);
        if (layers.heat && notThere.has(cell)) {
          cells += `<circle cx="${x}" cy="${y}" r="15" ${css('fill:none;stroke:var(--heat);stroke-width:1.3;stroke-dasharray:2 2')}/>`;
        }
        if (layers.prediction && next.has(cell)) {
          cells += `<circle cx="${x}" cy="${y}" r="${layers.heat && notThere.has(cell) ? 18 : 15}" ${css('fill:none;stroke:var(--seq);stroke-width:1.2;stroke-dasharray:3 2')}/>`;
        }
        if (focus === cell) cells += `<circle cx="${x}" cy="${y}" r="${R + 2}" ${css('fill:none;stroke:var(--text);stroke-width:2')}/>`;

        for (const segment of cell.segments) {
          const shown = focus === cell || (!dimmed && ((layers.newLinks && grown.has(segment)) || this.#allOf(segment, layers)));
          if (shown) links += this.#links(segment, focus === cell || grown.has(segment));
        }
      }
    }

    let labels = '';
    let targets = '';
    for (const column of volume.columns) {
      const { x, y } = this.#position.get(column.label);
      labels += `<text x="${x}" y="${y + 4}" text-anchor="middle" ${css(
        `font-size:11px;font-weight:600;fill:var(${lit.has(column) ? '--text' : '--muted'});pointer-events:none`)}>${column.label}</text>`;
      for (const cell of column.cells) {
        const { x: cx, y: cy } = this.place(cell);
        targets += `<circle data-cell="${cell.name}" cx="${cx}" cy="${cy}" r="14" ${css('fill:transparent;cursor:pointer')}><title>${cell.name}</title></circle>`;
      }
    }

    this.#svg.innerHTML = out + links + cells + labels + targets;
  }

  #allOf(segment, layers) {
    return roleOf(segment) === 'seq' ? layers.seqLinks : layers.partLinks;
  }

  // An outline round an assembly's cells, in its own colour, wider than the assemblies it holds. A shared assembly (an
  // abstraction) is drawn with a double edge; one just cut, dashed in red.
  #band(node, isFocus, dimmed, cut) {
    const pad = 13 + 7 * node.depth + (cut ? 5 : 0);
    const cloud = [...node.cells].flatMap((cell) => {
      const { x, y } = this.place(cell);
      return Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * 2 * Math.PI;
        return { x: x + pad * Math.cos(a), y: y + pad * Math.sin(a) };
      });
    });
    const d = `M${hull(cloud).map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')} Z`;
    const fade = dimmed && !isFocus ? 0.35 : 1;
    if (cut) {
      return `<path d="${d}" ${css(`fill:var(--heat);fill-opacity:${0.05 * fade};stroke:var(--heat);stroke-opacity:${0.9 * fade};` +
        `stroke-width:${isFocus ? 2.2 : 1.5};stroke-dasharray:3 3;stroke-linejoin:round`)}/>`;
    }
    const colour = PALETTE[node.colour % PALETTE.length];
    const edge = `<path d="${d}" ${css(`fill:${colour};fill-opacity:${(isFocus ? 0.2 : 0.12) * fade};stroke:${colour};` +
      `stroke-opacity:${0.9 * fade};stroke-width:${isFocus ? 2.2 : 1.3};stroke-linejoin:round`)}/>`;
    if (!node.shared) return edge;
    return `<path d="${d}" ${css(`fill:none;stroke:${colour};stroke-opacity:${0.5 * fade};stroke-width:5;stroke-linejoin:round`)}/>${edge}`;
  }

  // One arc per segment round the cell: bright when it fired this moment, thick when it grew this moment.
  #arcs(cell, cx, cy, fired, grown) {
    const segments = cell.segments;
    if (!segments.length) return '';
    const share = (2 * Math.PI) / segments.length;
    const gap = segments.length > 1 ? 0.35 : 0;
    return segments.map((segment, i) => {
      const style = css(`fill:none;stroke:${COLOUR[roleOf(segment)]};stroke-width:${grown.has(segment) ? 3.6 : 2.4};` +
        `stroke-opacity:${fired.has(segment) || grown.has(segment) ? 1 : 0.35}`);
      if (segments.length === 1) return `<circle cx="${cx}" cy="${cy}" r="${RING}" ${style}/>`;
      const a0 = -Math.PI / 2 + i * share + gap / 2;
      const a1 = -Math.PI / 2 + (i + 1) * share - gap / 2;
      const p = (a) => `${(cx + RING * Math.cos(a)).toFixed(2)} ${(cy + RING * Math.sin(a)).toFixed(2)}`;
      return `<path d="M${p(a0)} A${RING} ${RING} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}" ${style}/>`;
    }).join('');
  }

  // A segment's links, from each linked cell to the segment's cell, curved so links along a row stay apart.
  #links(segment, strong) {
    const to = this.place(segment.cell);
    const role = roleOf(segment);
    const dash = role === 'seq' ? 'stroke-dasharray:4 3;' : '';
    const bend = { seq: 0.22, part: 0.12 }[role];
    return segment.links.map((source) => {
      const from = this.place(origin(source));
      const qx = (from.x + to.x) / 2 - (to.y - from.y) * bend;
      const qy = (from.y + to.y) / 2 + (to.x - from.x) * bend;
      return `<path d="M${from.x} ${from.y} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${to.x} ${to.y}" ${css(
        `fill:none;stroke:${COLOUR[roleOf(segment)]};stroke-width:${strong ? 1.4 : 1};stroke-opacity:${strong ? 0.9 : 0.25};${dash}`)}/>`;
    }).join('');
  }
}
