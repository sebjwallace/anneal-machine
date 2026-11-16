import { Column } from './column.js';
import { Was } from './cell.js';
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
  #pick; // C96 sketch: what picks the cell in a lit column ('present', as the core, or 'context')
  #ages = new Map(); // C95 sketch, priced arm only: moments each warm cell has been held (declared: a number per cell)
  #hold; // C94 sketch: how warmth goes ('moment' or 'held')
  #perWhole; // C93 sketch: a handle on each whole within a part
  #brought; // C93 sketch: brought-back cells count as evidence in competition
  #warmth; // C92 sketch: whether the warm layer is on
  #warm = new Set(); // C92 sketch: what was brought back the moment before, held below the surface for one moment

  // labels: one per input, each the label of its column. cellsPerColumn: fixed architecture (RM-1; CON-3).
  // seed: for the sampler, so a run repeats exactly.
  constructor({ labels, cellsPerColumn, seed = 1, warmth = process.env.C93_WARM === '1', brought = process.env.C93_BROUGHT === '1', perWhole = process.env.C93_PERWHOLE === '1', hold = process.env.C94_HOLD ?? 'moment', pick = process.env.C96_PICK ?? 'present' }) {
    this.#pick = pick;
    this.#hold = hold;
    this.#perWhole = perWhole;
    this.#warmth = warmth;
    this.#brought = brought;
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
    const warm = this.#warm;
    const settled = this.#settle(lighted, seen, warm);
    const present = new Tally(settled, { seen, warm, brought: this.#brought });
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
    const hadContext = this.#before.active.size > 0; // C96 sketch: was anything active the moment before?
    for (const column of lit) {
      const candidates = column.cells.filter((cell) => active.has(cell));
      // C96 sketch, pick 'context': the column is identity, the cell is context (C79). Where there is context, the
      // moment before picks the cell: the most-predicted cell wins; a column nothing predicted is a new context, and
      // gets a fresh cell. Only where there was no context at all does the present pick, as in the core.
      if (this.#pick === 'context' && hadContext) {
        const byPast = Volume.#strongest(candidates, expected);
        if (byPast.length === 1) { winners.set(column, byPast); continue; }
        if (byPast.length > 1) { refused.push(column); continue; }
        winners.set(column, [column.fresh()]);
        uncovered.push(column);
        continue;
      }
      // C97 sketch, pick 'hybrid': one rule for both jobs. Predicted cells win, as with context. A column nothing
      // predicted (a new context) reuses the cell the present picks, by fit, unless that cell already holds a context of
      // its own (a segment wired to the moment before); then it gets a fresh cell. So a cell is shared by identity until
      // it has been given a place, and a place is never overwritten.
      if (this.#pick === 'hybrid' && hadContext) {
        const byPast = Volume.#strongest(candidates, expected);
        if (byPast.length === 1) { winners.set(column, byPast); continue; }
        if (byPast.length > 1) { refused.push(column); continue; }
        const whole = candidates.filter((cell) => present.firingOn(cell)
          .some((segment) => present.share(segment) === 1 && segment.links.every(seen)));
        const fits = whole.length ? whole : Volume.#strongest(candidates, present);
        const placed = (cell) => cell.segments.some((segment) => segment.links[0] instanceof Was);
        if (fits.length === 1 && !placed(fits[0])) { winners.set(column, fits); recognised.push(column); continue; }
        if (fits.length > 1) { refused.push(column); continue; }
        winners.set(column, [column.fresh()]);
        uncovered.push(column);
        continue;
      }
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
    const isWinner = new Set(won);
    for (const memory of Volume.#groups([...settled].filter((cell) => present.firingOn(cell).length), present)) {
      const fit = memory.filter((cell) => isWinner.has(cell));
      const rest = memory.filter((cell) => brought.has(cell));
      const beyond = lit.filter((column) => !fit.some((cell) => cell.column === column));
      if (fit.length + rest.length < memory.length) continue;
      if (fit.length < Segment.BAR || rest.length < Segment.BAR || beyond.length < Segment.BAR) continue;
      const held = (piece) => piece.every((cell) => present.firingOn(cell).some((s) => s.links.every((l) => piece.includes(l))));
      // C93 sketch (perWhole): what is brought back can be several wholes glued to the fit (CD and EF, both on AB). Read
      // as one, the cut ties them into one false assembly (CDEF). So split the remainder into its own wholes, the same
      // grouping read over the remainder alone, and cut the fit from each.
      const rests = this.#perWhole ? Volume.#groups(rest, present) : [rest];
      let fitTied = false;
      for (const piece of rests) {
        if (piece.length < Segment.BAR) continue;
        if (held(fit) && held(piece)) continue;
        const inMemory = new Set([...fit, ...piece]);
        const spans = (s) => s.links.every((l) => inMemory.has(l))
          && [s.cell, ...s.links].some((c) => fit.includes(c)) && [s.cell, ...s.links].some((c) => piece.includes(c));
        const removed = [...inMemory].flatMap((cell) => present.firingOn(cell).filter(spans));
        removed.forEach((segment) => segment.cell.prune(segment));
        const pieces = [];
        if (!fitTied && !(this.#perWhole && held(fit))) { pieces.push(this.#tie(fit.map((cell) => [cell]))); fitTied = true; }
        if (!(this.#perWhole && held(piece))) pieces.push(this.#tie(piece.map((cell) => [cell])));
        const rebound = this.#tie([fit, piece]); // the old whole, as what fits and its remainder (RM-7)
        assemblies.push(...pieces, rebound);
        cuts.push({ fit, rest: piece, removed, pieces, rebound });
      }
    }
    const grown = [...learnt, ...assemblies.flatMap((assembly) => assembly.segments)];

    // the present becomes the moment before: what was seen, never what was brought back (CON-8)
    this.#before = { active, winners: won };
    // C94/C95 sketch: how warmth goes.
    //   moment:   it lasts one moment (C92, C93).
    //   held:     it stays until something changes it (C94): a warm cell is let go when its column is lit (it surfaced,
    //             or something else filled its place), or when the present reached one of its segments and still didn't
    //             bring it back (touched and not taken). What the present never reached stays warm.
    //   anchored: held, but the endings live and die with their constant: when a moment opens a new frame (brings back
    //             something not already warm), the old warmth is let go with its constant.
    //   priced:   held, but a warm cell is a claim not there, costing 1 a moment (RM-9); it may stay only while what
    //             it has cost is less than the whole it would bring back (the members of its largest segment).
    //   column:   held, but a column holds one warm cell at a time: a newly warm cell takes its column's place.
    if (!this.#warmth) this.#warm = new Set();
    else if (this.#hold === 'moment') this.#warm = new Set(brought);
    else {
      let kept = [...warm].filter((cell) => !isLit.has(cell.column) && !settled.has(cell)
        && !cell.segments.some((segment) => present.lit(segment) > 0));
      if (this.#hold === 'anchored' && [...brought].some((cell) => !warm.has(cell))) kept = [];
      if (this.#hold === 'column') {
        const taken = new Set([...brought].map((cell) => cell.column));
        kept = kept.filter((cell) => !taken.has(cell.column));
      }
      if (this.#hold === 'priced') {
        const size = (cell) => Math.max(0, ...cell.segments.map((segment) => segment.links.length + 1));
        const aged = new Map();
        for (const cell of kept) {
          const age = (this.#ages.get(cell) ?? 0) + 1;
          if (age < size(cell)) aged.set(cell, age);
        }
        for (const cell of brought) aged.set(cell, 0);
        this.#ages = aged;
        kept = [...aged.keys()].filter((cell) => !brought.has(cell));
      }
      this.#warm = new Set([...kept, ...brought]);
    }

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
      fired: new Set([...expected.firing(), ...present.firing()]),
      grown,
      next: this.anticipated(),
      warm,
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
    if (!this.#perWhole) return this.#oneHandle(part);
    // C93 sketch: a part read from the winners can be several wholes glued at a shared piece (ABCD and ABEF, at AB).
    // One handle wakes only the whole its segment belongs to, so the others are known only through the shared piece.
    // So: take a handle, see what it brings back within the part (completion, with competition), and while some cell of
    // the part is still not brought back, take a handle from that cell too.
    const covered = new Set();
    const handles = [];
    for (const cell of part) {
      if (covered.has(cell)) continue;
      const partners = part.filter((other) => cell.segments.some((s) => s.holds(other)));
      if (!partners.length) { handles.push(cell); covered.add(cell); continue; }
      const pair = [cell, ...this.#sampler.pick(partners, 1)];
      handles.push(...pair);
      for (const woken of Volume.#wakes(pair, part)) covered.add(woken);
    }
    return [...new Set(handles)];
  }

  // C93 sketch: what a handle brings back within a part: completion from the pair, through firing segments (with
  // competition, every active cell counting as evidence), until nothing new joins.
  static #wakes(pair, part) {
    const inPart = new Set(part);
    const active = new Set(pair);
    for (;;) {
      const fresh = [...new Tally(active).cells()].filter((c) => inPart.has(c) && !active.has(c));
      if (!fresh.length) return active;
      fresh.forEach((c) => active.add(c));
    }
  }

  #oneHandle(part) {
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
  #settle(cue, seen, warm) {
    const active = new Set(cue);
    for (;;) {
      const tally = new Tally(active, { seen, warm, brought: this.#brought });
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
