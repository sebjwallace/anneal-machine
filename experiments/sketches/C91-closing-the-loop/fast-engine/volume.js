import { Column } from './column.js';
import { Segment } from './segment.js';
import { Tally } from './tally.js';
import { Sampler } from './sampler.js';
import { Moment } from './moment.js';

// A volume: a number of columns of cells, and nothing else (previously "region", CTR-1 DEF-10). There is no list of
// assemblies anywhere: an assembly is only its cells' segments (RM-3; CTR-1 CON-19). What it keeps between inputs is
// the moment before, as cells (CAP-12).
//
// Receiving an input, one moment:
//   1. light (RM-1): a lit column with predicted cells lights them; one with none bursts (every cell lights)
//   2. settle the present (RM-4, RM-5): segments bring back the rest of what is active
//   3. compete in each lit column (RM-5): the most support wins, the present's before the past's; a tie is refused;
//      with no support, a fresh cell
//   4. learn (RM-1, RM-3, RM-7): a winner the winners before didn't predict learns them; winners that are not already
//      one memory are tied into one assembly
//   5. cut (RM-8): a memory partly seen, by an input with more of its own, is cut where it fits and where it doesn't
//
// There is one kind of thing, the assembly, and one way of growing it: tying (see #tie). A composition is an assembly
// whose cells already belong to smaller ones; composition and decomposition are what happen to assemblies.
//
// Growth and cutting are unconditional: the energy rule at the level of cells (RM-9) is not yet defined, so nothing is
// kept, dropped or cut because energy falls. A known gap (CON-1), left visible.

export class Volume {
  #columns;
  #sampler;
  #before = { active: new Set(), winners: [] };

  // labels: one per input, each the label of its column. cellsPerColumn: fixed architecture (RM-1; CON-3).
  // seed: for the sampler, so a run repeats exactly.
  // C82: loosen (an arm): when the cut's condition holds but what fits and what is brought back are already each held on
  // their own (a composition of the two), the joint between them is loosened instead of left alone: one segment that
  // spans the two is removed from each cell that has one. A joint tied once is then gone; one backed by more is not.
  #loosen;

  constructor({ labels, cellsPerColumn, seed = 1, loosen = false }) {
    this.#loosen = loosen;
    this.#columns = new Map(labels.map((label) => [label, new Column(label, cellsPerColumn)]));
    this.#sampler = new Sampler(seed);
  }

  get columns() { return [...this.#columns.values()]; }

  column(label) {
    const column = this.#columns.get(label);
    if (!column) throw new Error(`no column ${label}`);
    return column;
  }

  // Cells the moment before predicts for the next input.
  anticipated() {
    return new Tally(Volume.#was(this.#before.active)).cells();
  }

  // Receives one input: the labels of the inputs that are on.
  receive(labels) {
    const input = [...new Set(labels)];
    const lit = input.map((label) => this.column(label));
    const isLit = new Set(lit);

    // 1. light (RM-1)
    const expected = new Tally(Volume.#was(this.#before.active));
    const anticipated = expected.cells();
    const lighted = new Set();
    const bursts = [];
    for (const column of lit) {
      const predicted = column.cells.filter((cell) => anticipated.has(cell));
      if (predicted.length) predicted.forEach((cell) => lighted.add(cell));
      else {
        bursts.push(column);
        column.cells.forEach((cell) => lighted.add(cell));
      }
    }

    // 2. settle the present (RM-4, RM-5)
    const seen = (cell) => isLit.has(cell.column);
    const settled = this.#settle(lighted, seen);
    const present = new Tally(settled, { seen });
    const active = new Set([...settled].filter((cell) => isLit.has(cell.column)));
    const brought = new Set([...settled].filter((cell) => !isLit.has(cell.column)));

    // 3. compete in each lit column (RM-5). A cell whose memory is wholly seen is right, whatever else is: where two
    //    memories meet in one column (a junction), both cells win, since taking one does not rule the other out. Else
    //    what the present's assemblies say is weighed first, and what the moment before predicted only where the
    //    present says nothing: what is seen outranks what was expected (PRN-5). The two are never compared on one
    //    scale, since they are evidence for different memories (CON-9).
    const winners = new Map(); // lit column -> the cells that won it
    const refused = [];
    const recognised = [];
    const uncovered = [];
    for (const column of lit) {
      const candidates = column.cells.filter((cell) => active.has(cell));
      const whole = candidates.filter((cell) => present.firingOn(cell)
        .some((segment) => present.share(segment) === 1 && segment.links.every(seen)));
      if (whole.length) {
        winners.set(column, whole);
        recognised.push(column);
        continue;
      }
      let tally = present;
      let best = Volume.#strongest(candidates, present);
      if (!best.length) {
        tally = expected;
        best = Volume.#strongest(candidates, expected);
      }
      if (!best.length) {
        winners.set(column, [column.fresh()]); // nothing explains this input: a fresh cell (RM-1)
        uncovered.push(column);
      } else if (best.length > 1) {
        refused.push(column); // a tie is refused, not broken by order (CON-7)
      } else {
        winners.set(column, best);
        if (tally === present) recognised.push(column);
      }
    }

    const won = [...winners.values()].flat();

    // 4. learn (unconditional until RM-9)
    const learnt = [];
    const assemblies = [];
    const context = this.#before.winners;
    if (context.length) {
      const fromWinners = new Tally(Volume.#was(context));
      for (const winner of won) {
        if (fromWinners.support(winner) === 0) learnt.push(winner.grow(Volume.#was(context)));
      }
    }
    // the winners, grouped by what holds them together; a winner nothing explains is a group of its own. More than
    // one group: they are not yet one memory, so they are tied into one.
    const parts = Volume.#groups(won, present);
    if (parts.length >= 2) assemblies.push(this.#tie(parts));

    // 5. the cut (RM-8). The memories present are read from the cells: the active cells grouped through their firing
    //    assembly segments. A memory is cut when it is wholly read as what fits (its cells that won) and what is
    //    predicted but not there (its cells brought back), each can hold an assembly, and the input has its own
    //    remainder beyond it that can too: something else that shares the part, as the shed shares the house's wall.
    //    A memory with a cell that neither won nor was brought back (a tie, or a loss) is not clear, and is not cut; nor
    //    is one whose fit and remainder are already each held by segments of their own (a composition of them): the
    //    cut is what makes them so. Only the segments spanning both are removed: they are what held the whole as one.
    const cuts = [];
    const loosened = []; // C82
    const isWinner = new Set(won);
    for (const memory of Volume.#groups([...settled].filter((cell) => present.firingOn(cell).length), present)) {
      const fit = memory.filter((cell) => isWinner.has(cell));
      const rest = memory.filter((cell) => brought.has(cell));
      const beyond = lit.filter((column) => !fit.some((cell) => cell.column === column));
      if (fit.length + rest.length < memory.length) continue;
      if (fit.length < Segment.BAR || rest.length < Segment.BAR || beyond.length < Segment.BAR) continue;
      const held = (piece) => piece.every((cell) => present.firingOn(cell).some((s) => s.links.every((l) => piece.includes(l))));
      const inMemory = new Set(memory);
      const spans = (s) => s.links.every((l) => inMemory.has(l))
        && [s.cell, ...s.links].some((c) => fit.includes(c)) && [s.cell, ...s.links].some((c) => rest.includes(c));
      if (held(fit) && held(rest)) {
        if (!this.#loosen) continue;
        // C82: the joint is heated (it brings back what the input has replaced), so it loosens by one segment per cell
        const removed = memory.flatMap((cell) => present.firingOn(cell).filter(spans).slice(-1));
        removed.forEach((segment) => segment.cell.prune(segment));
        if (removed.length) loosened.push({ fit, rest, removed });
        continue;
      }
      const removed = memory.flatMap((cell) => present.firingOn(cell).filter(spans));
      removed.forEach((segment) => segment.cell.prune(segment));
      const pieces = [this.#tie(fit.map((cell) => [cell])), this.#tie(rest.map((cell) => [cell]))];
      const rebound = this.#tie([fit, rest]); // the old whole, as what fits and its remainder (RM-7)
      assemblies.push(...pieces, rebound);
      cuts.push({ fit, rest, removed, pieces, rebound });
    }
    const grown = [...learnt, ...assemblies.flatMap((assembly) => assembly.segments)];

    // the present becomes the moment before: what was seen, never what was brought back (CON-8)
    this.#before = { active, winners: won };

    return new Moment({
      input,
      lit,
      anticipated,
      bursts,
      active,
      brought,
      missing: [...anticipated].filter((cell) => !isLit.has(cell.column)),
      winners: new Set(won),
      refused,
      recognised,
      uncovered,
      parts,
      learnt,
      assemblies,
      cuts,
      loosened,
      fired: new Set([...expected.firing(), ...present.firing()]),
      grown,
      next: this.anticipated(),
    });
  }

  // Ties parts into one assembly (RM-3, RM-7): a handle from each part, and each cell of the handles grows one segment
  // over a sample of the others (Segment.sampleSize). Parts of one cell give that cell, so cells nothing explains are
  // all taken: a new assembly. Larger parts give two cells each, so a composition costs what its parts number, not
  // what they hold.
  #tie(parts) {
    const sample = parts.flatMap((part) => this.#handle(part));
    const size = Segment.sampleSize(sample.length);
    const segments = sample.map((cell) => cell.grow(this.#sampler.pick(sample.filter((other) => other !== cell), size)));
    return { parts, segments };
  }

  // A handle on a part: two of its cells that one of its segments ties together, so that the two, coming back, wake
  // the part (the bar of two). Two cells merely drawn from a part can fall in different pieces of it, one in each, and
  // wake neither. A part of one cell is its own handle.
  #handle(part) {
    if (part.length < Segment.BAR) return part;
    const tied = part.filter((cell) => cell.segments.some((s) => part.some((other) => s.holds(other))));
    const [cell] = this.#sampler.pick(tied, 1);
    const partners = part.filter((other) => cell.segments.some((s) => s.holds(other)));
    return [cell, ...this.#sampler.pick(partners, 1)];
  }

  // What cells were, a moment later: the sources a segment wired to the moment before listens to.
  static #was(cells) { return [...cells].map((cell) => cell.was); }

  // Groups cells by what they belong to, read from segments: two cells are in one group when one's firing segment
  // holds a link from the other, and groups join through any such link. Used for the parts among the winners (RM-7)
  // and the memories present (RM-8). The work follows what is active: only these cells are read.
  static #groups(cells, tally) {
    const part = new Map(cells.map((cell) => [cell, new Set([cell])]));
    for (const a of cells) {
      for (const b of cells) {
        if (a === b || part.get(a) === part.get(b) || !tally.together(a, b)) continue;
        const joined = new Set([...part.get(a), ...part.get(b)]);
        for (const cell of joined) part.set(cell, joined);
      }
    }
    return [...new Set(part.values())].map((set) => [...set]);
  }

  // The candidates at the top level of support in one tally, or none if none has any.
  static #strongest(candidates, tally) {
    const top = Math.max(0, ...candidates.map((cell) => tally.support(cell)));
    return top ? candidates.filter((cell) => tally.support(cell) === top) : [];
  }

  // Waking and completion (RM-4) with competition through one shared level of support (RM-5): round by round, the
  // candidates at the top level join, except rivals, until nothing new joins. Rivals are two cells of different
  // memories in one column, woken by the same evidence: alternatives, of which neither is taken (CON-7). Two woken by
  // different evidence can both be right, as where two memories meet in one column (a junction), and both join. The level is one over all candidates,
  // so it is global, not local (RM-5, open). It ends by itself: what is active only grows, and cells are finite.
  #settle(cue, seen) {
    const active = new Set(cue);
    for (;;) {
      const tally = new Tally(active, { seen });
      const candidates = [...tally.cells()].filter((cell) => !active.has(cell));
      if (!candidates.length) break;
      const top = Math.max(...candidates.map((cell) => tally.support(cell)));
      const atTop = candidates.filter((cell) => tally.support(cell) === top);
      const evidence = (cell) => new Set(tally.firingOn(cell).flatMap((s) => s.links.filter((l) => active.has(l))));
      const rivals = (a, b) => a.column === b.column && !tally.together(a, b)
        && [...evidence(a)].some((cell) => evidence(b).has(cell));
      const joining = atTop.filter((cell) => !atTop.some((other) => other !== cell && rivals(cell, other)));
      if (!joining.length) break;
      joining.forEach((cell) => active.add(cell));
    }
    return active;
  }
}
