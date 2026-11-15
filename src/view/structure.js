// The viewer's reading of the volume's structure. The volume holds only segments; there is no list of assemblies in
// it (CTR-1 CON-19). Each moment reports what it tied and what it cut, and the viewer, which replays every moment,
// reads from those reports:
//   an assembly     what one tie made: its own cells, and the assemblies whose handles it tied (its children)
//   shared          an assembly with two or more parents: a part of several wholes, on the same cells (the abstraction,
//                   RM-8)
//   cut             an assembly whose segments the cut removed (RM-8); from then on it is its retying
// This is a reading for whoever watches, nothing the volume uses.

// Ties made only of cells nothing explained first, so that a tie in the same moment (the cut's retying) can stand on
// them.
const onlyCells = (tie) => Number(tie.parts.every((part) => part.length === 1));

export class Node {
  constructor({ cells, segments, born, children }) {
    this.segments = segments;    // the segments that grew as this assembly
    this.born = born;            // the moment it grew in (1-based)
    this.children = children;    // the assemblies it was tied from
    this.parents = [];
    this.cells = new Set([...cells, ...children.flatMap((child) => [...child.cells])]);
    this.cut = null;             // the moment it was cut in, if it was
    this.replacement = null;     // what it became: the retying of what fit and what was left
    this.label = '';
    this.colour = 0;
    this.depth = children.length ? 1 + Math.max(...children.map((child) => child.depth)) : 0;
  }

  get shared() { return this.parents.length >= 2; }
}

export class Structure {
  #nodes = [];
  #now;

  constructor(moments, labels) {
    this.#now = moments.length;
    moments.forEach((moment, i) => {
      const t = i + 1;
      const cutNodes = moment.cuts.map((cut) => {
        const removed = new Set(cut.removed);
        return this.#nodes.find((node) => !node.cut && node.segments.some((s) => removed.has(s)));
      });
      cutNodes.forEach((node) => { if (node) node.cut = t; });
      for (const { parts, segments } of [...moment.assemblies].sort((a, b) => onlyCells(b) - onlyCells(a))) {
        const cells = parts.filter((part) => part.length === 1).flat();
        const children = [...new Set(parts.filter((part) => part.length > 1).flatMap((part) => this.#outermost(part)))];
        const node = new Node({ cells, segments, born: t, children });
        children.forEach((child) => child.parents.push(node));
        this.#nodes.push(node);
      }
      moment.cuts.forEach((cut, k) => {
        const node = cutNodes[k];
        if (!node) return;
        node.replacement = this.#nodes.find((other) => other.segments === cut.rebound.segments);
        for (const parent of node.parents) {
          parent.children = parent.children.map((child) => (child === node ? node.replacement : child));
          node.replacement.parents.push(parent);
        }
      });
    });
    this.#name(labels);
  }

  get nodes() { return this.#nodes; }

  // What to show now: everything not cut, and what was cut in this moment.
  get roots() {
    return this.#nodes.filter((node) => (!node.cut && !node.parents.length) || node.cut === this.#now);
  }

  justCut(node) { return node.cut === this.#now; }

  // The assemblies a part is made of: the outermost ones, not cut, lying wholly within it. A part that is only a piece
  // of an assembly (some of its cells seen) is read as that assembly: the outermost ones touching it.
  #outermost(group) {
    const cells = new Set(group);
    const alive = this.#nodes.filter((node) => !node.cut);
    const within = alive.filter((node) => [...node.cells].every((cell) => cells.has(cell)));
    const candidates = within.length ? within : alive.filter((node) => group.some((cell) => node.cells.has(cell)));
    const inside = (node, outer) => outer.children.some((child) => child === node || inside(node, child));
    return candidates.filter((node) => !candidates.some((outer) => outer !== node && inside(node, outer)));
  }

  // Every assembly is named by its columns. A name already taken by one still standing is primed (GH, GH′): the same
  // inputs held twice.
  #name(labels) {
    const order = (cells) => [...new Set([...cells].map((cell) => cell.column.label))]
      .sort((a, b) => labels.indexOf(a) - labels.indexOf(b)).join('');
    const taken = new Map();
    this.#nodes.forEach((node, i) => {
      const base = order(node.cells);
      const standing = (taken.get(base) ?? []).filter((other) => !other.cut || other.cut > node.born);
      node.label = base + '′'.repeat(standing.length);
      taken.set(base, [...(taken.get(base) ?? []), node]);
      node.colour = i;
    });
  }

  // How present an assembly is in a moment: 'seen' if its cells all won, 'recalled' if some were brought back (into
  // any column, lit or not) and the rest won, 'partial' if only some of either, or null.
  presence(node, moment) {
    if (!moment) return null;
    const won = new Set(moment.winners.values());
    const cells = [...node.cells];
    const nWon = cells.filter((cell) => won.has(cell)).length;
    const nBack = cells.filter((cell) => !won.has(cell) && (moment.brought.has(cell) || moment.active.has(cell))).length;
    if (nWon === cells.length) return 'seen';
    if (nWon + nBack === cells.length) return 'recalled';
    if (nWon + nBack >= 2) return 'partial';
    return null;
  }
}
