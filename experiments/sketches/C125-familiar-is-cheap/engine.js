// C125 · The engine copy from C123, with readBuffer able to price each piece and each letter separately (`price`), so
// that a familiar piece can be cheaper to use than an unfamiliar one.
//
// C123 · The engine copy from C122, changed as the owner asked: it can read a whole buffer at once.
//
// C122 · A JavaScript copy of the AMP engine (amp/engine on main), for experiments.
//
// It follows the Go engine's model and rules: populations of members numbered across all populations; assemblies of
// two shapes (a state: a set of members; a transition: a chain); members chosen for a new assembly in order, round
// and round each population; invoke one moment at a time, with state gates (counted part bigger than missing part),
// transition gates (the step before counted), input that a gate expects turning on only the expected members and
// unexpected input turning on all ready members, and competition (rivals by alternatives; most support wins, ties
// held, a rival beaten only by one with more support that wasn't itself beaten); the refractory period as a setting;
// and anneal (the longest shared run, what varies before and after it, each whole composed again; reuse first).
//
// It is checked against the Go engine with check/ (same scenarios, same output, moment by moment).
//
// The change in C123 (the solution from C106 to C121, put into the engine):
// - readBuffer(letters): reads a whole buffer at once, not one letter a moment. It describes the buffer as cheaply as
//   the held states allow: each held state of two or more members is a piece, matched by its letters; a letter costs
//   1, a use of a piece costs `use`; on a tie the longer piece. What no piece covers is read as loose letters: that is
//   heat. The pieces read are made active (their members), so what follows can carry on from them. Invoke is still
//   there, unchanged, and still matches the Go engine.
// - Indexes for speed (states by their letters, assemblies by their exact members), so that anneal's reuse looks up
//   instead of scanning. They don't change what anneal forms.
//
// Departures from the Go engine, all deliberate:
// - No names, refusals or errors: the experiment calls it correctly, and assemblies are referred to by number.
// - No budget, save/open, inspect or set operations (not needed here).
// - Anneal takes member sequences directly instead of assembly names (the Go engine takes names and looks up their
//   members, partMembers). It also takes an optional `keep(letters)` check, used by the experiment for the energy
//   rule; with no check it forms exactly what the Go engine forms.
// - Speed: assemblies are indexed by member, and alternatives are kept up to date as transitions form, instead of
//   being rebuilt every moment. This doesn't change what any moment does.

'use strict';

const STATE = 1, TRANSITION = 2;

class Memory {
  constructor() {
    this.populations = []; // { name, size, first }
    this.byName = new Map();
    this.members = 0; // members across every population
    this.memberPop = []; // member index -> population
    this.assemblies = []; // { id, shape, members: [index] }; #n is assemblies[n-1]
    this.byMember = []; // member index -> assembly indices containing it (each once)
    this.next = new Map(); // population name -> next member to hand out, from 0
    this.assembled = new Uint8Array(0);
    this.moment = 0;
    this.active = new Set();
    this.refractory = new Set();
    this.refractoryPeriod = false;
    // alternatives, kept up to date from every transition (as the Go engine's alternatives() would compute them)
    this.follows = new Map(); // member -> Set(member)
    this.leadsInto = new Map();
    this.places = new Map(); // member -> Set("before|after")
    this.statesByLetters = new Map(); // letters key -> [state] in the order formed (C123, for speed)
    this.byExact = new Map(); // shape + members key -> assembly (C123, for speed)
    this.pieceIndex = new Map(); // first two letters -> [{ text, a }] states of 2+ members, for readBuffer (C123)
  }

  declarePopulation(name, size) {
    const p = { name, size, first: this.members };
    this.populations.push(p);
    this.byName.set(name, p);
    for (let i = 0; i < size; i++) { this.memberPop.push(p); this.byMember.push([]); }
    this.members += size;
    const grown = new Uint8Array(this.members);
    grown.set(this.assembled);
    this.assembled = grown;
    return p;
  }
  population(name) { return this.byName.get(name); }
  popOf(m) { return this.memberPop[m]; }
  label(m) { const p = this.memberPop[m]; return `${p.name}{${m - p.first + 1}}`; }

  setRefractoryPeriod(on) { this.refractoryPeriod = on; if (!on) this.refractory = new Set(); }
  reset() { this.active = new Set(); this.refractory = new Set(); }

  // A word, as the interpreter declares one: name = <x, y, z> ; x -> y -> z. Both outlines share members, chosen in
  // order round each population; a population written twice takes two members.
  declareWord(letters) {
    const times = new Map();
    const needed = new Map();
    const order = [];
    for (const l of letters) { const t = (times.get(l) || 0) + 1; times.set(l, t); if (!needed.has(l)) order.push(l); needed.set(l, Math.max(needed.get(l) || 0, t)); }
    const chosen = new Map();
    for (const l of order) {
      const p = this.byName.get(l);
      const list = [];
      for (let k = 0; k < needed.get(l); k++) { const n = this.next.get(l) || 0; list.push(p.first + n); this.next.set(l, (n + 1) % p.size); }
      chosen.set(l, list);
    }
    const take = () => { const used = new Map(); return (l) => { const k = used.get(l) || 0; used.set(l, k + 1); return chosen.get(l)[k]; }; };
    const a = take(), b = take();
    const stateMembers = [];
    for (const l of letters) { const m = a(l); if (!stateMembers.includes(m)) stateMembers.push(m); }
    const chain = letters.map((l) => b(l));
    const s = this.form(STATE, stateMembers);
    const t = this.form(TRANSITION, chain);
    return [s, t];
  }

  form(shape, members) {
    const a = { id: this.assemblies.length + 1, shape, members: members.slice() };
    this.assemblies.push(a);
    const ek = shape + ':' + members.join(',');
    if (!this.byExact.has(ek)) this.byExact.set(ek, a);
    if (shape === STATE) {
      const lk = this.lettersOf(members).join(',');
      if (!this.statesByLetters.has(lk)) this.statesByLetters.set(lk, []);
      this.statesByLetters.get(lk).push(a);
      if (members.length >= 2) {
        const text = this.lettersOf(members).join('');
        const k2 = text.slice(0, 2);
        if (!this.pieceIndex.has(k2)) this.pieceIndex.set(k2, []);
        const list = this.pieceIndex.get(k2);
        if (!list.some((x) => x.text === text)) list.push({ text, a });
      }
    }
    const idx = this.assemblies.length - 1;
    const seen = new Set();
    for (const m of members) { this.assembled[m] = 1; if (!seen.has(m)) { seen.add(m); this.byMember[m].push(idx); } }
    if (shape === TRANSITION) {
      const note = (rel, x, y) => { if (!rel.has(x)) rel.set(x, new Set()); rel.get(x).add(y); };
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        let before = '', after = '';
        if (i > 0) { before = this.popOf(members[i - 1]).name; note(this.follows, m, members[i - 1]); note(this.leadsInto, members[i - 1], m); }
        if (i < members.length - 1) after = this.popOf(members[i + 1]).name;
        if (!this.places.has(m)) this.places.set(m, new Set());
        this.places.get(m).add(before + '|' + after);
      }
    }
    return a;
  }

  // ---------------------------------------------------------------- invoke

  isReady(m) { return !(this.refractoryPeriod && this.active.has(m)); }
  refractoryAfter() { return this.refractoryPeriod ? this.active : new Set(); }

  between(x, y) {
    if (this.memberPop[x] === this.memberPop[y]) return false;
    const share = (A, B) => { if (!A || !B) return false; const [s, l] = A.size < B.size ? [A, B] : [B, A]; for (const v of s) if (l.has(v)) return true; return false; };
    return share(this.follows.get(x), this.follows.get(y)) || share(this.leadsInto.get(x), this.leadsInto.get(y)) || share(this.places.get(x), this.places.get(y));
  }
  differInAlternatives(a, b) {
    const inB = new Set(b), inA = new Set(a);
    for (const x of a) {
      if (inB.has(x)) continue;
      for (const y of b) if (!inA.has(y) && this.between(x, y)) return true;
    }
    return false;
  }
  areRivals(o1, o2) {
    return this.differInAlternatives(o1.a.members, o2.a.members) || this.differInAlternatives(o1.bringsOn, o2.bringsOn);
  }

  wouldOpen(a, counted) {
    let c = 0;
    for (const m of a.members) if (counted.has(m)) c++;
    const o = { a, counted: c, support: c - (a.members.length - c), gates: new Map() };
    if (a.shape === STATE) {
      if (o.support > 0) for (const m of a.members) if (this.isReady(m)) o.gates.set(m, { a, counted: c });
    } else {
      for (let i = 1; i < a.members.length; i++) {
        const from = a.members[i - 1], to = a.members[i];
        if (counted.has(from) && this.isReady(to)) o.gates.set(to, { a, from });
      }
    }
    if (o.gates.size) { o.bringsOn = []; for (const m of a.members) if (o.gates.has(m) && !o.bringsOn.includes(m)) o.bringsOn.push(m); }
    return o;
  }

  openGates(counted) {
    // assemblies that could open: those with a counted member, in the order formed
    const touched = new Set();
    for (const m of counted) for (const i of this.byMember[m]) touched.add(i);
    const openings = [];
    for (const i of [...touched].sort((x, y) => x - y)) {
      const o = this.wouldOpen(this.assemblies[i], counted);
      if (o.gates.size) openings.push(o);
    }
    const { outcomes, competitions } = this.compete(openings);
    const gates = new Map();
    openings.forEach((o, i) => {
      if (outcomes[i] !== 'won') return;
      for (const m of o.a.members) if (o.gates.has(m)) {
        if (!gates.has(m)) gates.set(m, []);
        const list = gates.get(m);
        if (!list.includes(o.gates.get(m))) list.push(o.gates.get(m));
      }
    });
    return { gates, competitions };
  }

  compete(openings) {
    const n = openings.length;
    const order = [...Array(n).keys()].sort((i, j) => openings[j].support - openings[i].support || i - j);
    const outcomes = new Array(n);
    const rivalMemo = new Map();
    const rivals = (i, j) => {
      const k = i < j ? i * n + j : j * n + i;
      if (!rivalMemo.has(k)) rivalMemo.set(k, this.areRivals(openings[i], openings[j]));
      return rivalMemo.get(k);
    };
    for (let start = 0; start < n; ) {
      let level = start;
      while (level < n && openings[order[level]].support === openings[order[start]].support) level++;
      for (const i of order.slice(start, level)) {
        outcomes[i] = 'won';
        for (const j of order.slice(0, start)) if (outcomes[j] !== 'lost' && rivals(i, j)) { outcomes[i] = 'lost'; break; }
      }
      for (const i of order.slice(start, level)) for (const j of order.slice(start, level))
        if (i !== j && outcomes[i] !== 'lost' && outcomes[j] !== 'lost' && rivals(i, j)) outcomes[i] = 'held';
      start = level;
    }
    // groups of rivals, for reporting (as the Go engine's rivalGroups)
    const group = new Array(n).fill(-1);
    const competitions = [];
    for (let s = 0; s < n; s++) {
      if (group[s] >= 0) continue;
      const members = [s];
      group[s] = competitions.length;
      for (let k = 0; k < members.length; k++) for (let j = 0; j < n; j++)
        if (group[j] < 0 && rivals(members[k], j)) { group[j] = competitions.length; members.push(j); }
      members.sort((x, y) => x - y);
      competitions.push(members);
    }
    return { outcomes, competitions: competitions.filter((g) => g.length >= 2).map((g) => g.map((i) => ({ id: openings[i].a.id, counted: openings[i].counted, outcome: outcomes[i] }))) };
  }

  upcoming(input) {
    const counted = new Set([...this.active, ...this.refractory]);
    const { gates, competitions } = this.openGates(counted);
    const next = { input, active: new Set(), arrived: new Set(), unexpected: new Set(), gates, competitions };
    for (const p of input) {
      const arriving = [];
      for (let m = p.first; m < p.first + p.size; m++) if (gates.has(m)) arriving.push(m);
      if (!arriving.length) {
        next.unexpected.add(p.name);
        for (let m = p.first; m < p.first + p.size; m++) if (this.isReady(m)) arriving.push(m);
      }
      for (const m of arriving) { next.active.add(m); next.arrived.add(m); }
    }
    for (const m of gates.keys()) next.active.add(m);
    return next;
  }

  step(next) {
    this.moment++;
    this.refractory = this.refractoryAfter();
    this.active = next.active;
    const moment = { number: this.moment, input: next.input.map((p) => p.name), active: [], refractory: [], unexplained: [], competitions: next.competitions, unexpected: [...next.unexpected] };
    const sorted = [...this.active].sort((a, b) => a - b);
    for (const m of sorted) moment.active.push({ m, arrived: next.arrived.has(m), gates: next.gates.get(m) || [] });
    moment.refractory = [...this.refractory].sort((a, b) => a - b);
    for (const p of this.populations) {
      let any = false, assembled = false;
      for (let m = p.first; m < p.first + p.size; m++) if (this.active.has(m)) { any = true; if (this.assembled[m]) assembled = true; }
      if (any && !assembled) moment.unexplained.push(p.name);
    }
    return moment;
  }

  key(active, refractory) { return [...active].sort((a, b) => a - b).join(',') + '|' + [...refractory].sort((a, b) => a - b).join(','); }

  // sequence: an array of moments, each an array of population names arriving together
  invoke(sequence, { maxMoments = Infinity } = {}) {
    const inputs = sequence.map((names) => names.map((n) => this.byName.get(n)));
    const moments = [];
    const seen = new Map();
    const record = (mo) => { moments.push(mo); seen.set(this.key(this.active, this.refractory), mo.number); };
    for (const input of inputs) record(this.step(this.upcoming(input)));
    let repeatsEvery = 0;
    for (let extra = 0; extra < maxMoments; extra++) {
      const next = this.upcoming([]);
      if (next.active.size === 0 && this.refractoryAfter().size === 0) {
        if (next.competitions.length) record(this.step(next));
        break;
      }
      const first = seen.get(this.key(next.active, this.refractoryAfter()));
      if (first !== undefined) { repeatsEvery = this.moment + 1 - first; break; }
      record(this.step(next));
    }
    return { moments, repeatsEvery };
  }

  // ---------------------------------------------------------------- anneal

  lettersOf(members) { return members.map((m) => this.memberPop[m].name); }

  sameLetters(members) {
    const list = this.statesByLetters.get(this.lettersOf(members).join(','));
    if (!list) return null;
    const exact = this.byExact.get(STATE + ':' + members.join(','));
    return exact || list[0];
  }
  reuseOrFormExactly(shape, members) {
    const a = this.byExact.get(shape + ':' + members.join(','));
    if (a) return { a, reused: true };
    return { a: this.form(shape, members), reused: false };
  }

  // ---------------------------------------------------------------- readBuffer (C123)

  // letters: the buffer, as population names. use: what one use of a piece costs, in letters. Returns the parts in
  // order: { text, a } for a piece read with held state a, or a single letter (a string) read loose.
  // use: a number (every piece costs the same, letters cost 1, as in C123), or a function price(text) giving what
  // reading a letter (a one-letter text) or a piece costs (C125).
  readBuffer(letters, use) {
    const u = letters.join('');
    const priced = typeof use === 'function';
    const n = u.length, c = new Array(n + 1).fill(0), how = new Array(n + 1).fill(null);
    for (let i = n - 1; i >= 0; i--) {
      c[i] = (priced ? use(u[i]) : 1) + c[i + 1];
      for (const p of this.pieceIndex.get(u.slice(i, i + 2)) || []) if (u.startsWith(p.text, i)) {
        const v = (priced ? use(p.text) : use) + c[i + p.text.length];
        if (v < c[i] - 1e-9 || (Math.abs(v - c[i]) < 1e-9 && p.text.length > (how[i]?.text.length ?? 1))) { c[i] = v; how[i] = p; }
      }
    }
    const parts = [];
    for (let i = 0; i < n; ) { if (how[i]) { parts.push(how[i]); i += how[i].text.length; } else parts.push(u[i++]); }
    // what was read is active: the members of the pieces read
    this.active = new Set();
    for (const p of parts) if (typeof p !== 'string') for (const m of p.a.members) this.active.add(m);
    this.refractory = new Set();
    return { parts, cost: c[0] };
  }
  // keep(letters) is the experiment's energy check; when it says no for a piece the memory doesn't already hold,
  // nothing is formed for it (piece.skipped).
  reuseOrForm(members, keep) {
    if (members.length === 0) return { members: [], assemblies: [] };
    if (members.length === 1) return { members: members.slice(), assemblies: [] };
    const existing = this.sameLetters(members);
    if (existing) {
      const t = this.reuseOrFormExactly(TRANSITION, existing.members);
      return { members: existing.members.slice(), assemblies: [{ a: existing, reused: true }, t] };
    }
    if (keep && !keep(this.lettersOf(members))) return { members: members.slice(), assemblies: [], skipped: true };
    return { members: members.slice(), assemblies: [{ a: this.form(STATE, members), reused: false }, { a: this.form(TRANSITION, members), reused: false }] };
  }
  composeFrom(pieces) {
    const elements = [];
    for (const piece of pieces) {
      if (!piece.members.length) continue;
      elements.push(piece.members.length === 1 ? { exact: piece.members } : { part: piece.members });
    }
    const state = [];
    for (const e of elements) {
      const taken = e.exact ? e.exact : e.part.slice(0, Math.floor(e.part.length / 2) + 1);
      for (const m of taken) if (!state.includes(m)) state.push(m);
    }
    const out = { members: state, assemblies: [this.reuseOrFormExactly(STATE, state)] };
    const chains = [];
    let chain = [];
    const finish = () => { if (chain.length >= 2) chains.push(chain); chain = []; };
    for (const e of elements) {
      if (e.exact) { chain.push(...e.exact); continue; }
      chain.push(e.part[0]); finish(); chain = [e.part[e.part.length - 1]];
    }
    finish();
    for (const c of chains) out.assemblies.push(this.reuseOrFormExactly(TRANSITION, c));
    return out;
  }
  static longestSharedRun(seqs) {
    const first = seqs[0];
    for (let size = first.length; size > 0; size--) for (let from = 0; from + size <= first.length; from++) {
      const run = first.slice(from, from + size).join(',');
      if (seqs.slice(1).every((o) => Memory.indexOfRun(o, run) >= 0)) return { start: from, length: size };
    }
    return { start: 0, length: 0 };
  }
  static indexOfRun(letters, runKey) {
    const run = runKey.split(',');
    for (let at = 0; at + run.length <= letters.length; at++) { let ok = true; for (let k = 0; k < run.length; k++) if (letters[at + k] !== run[k]) { ok = false; break; } if (ok) return at; }
    return -1;
  }
  // wholes: member sequences. Returns what the Go engine's Anneal returns (pieces), or null when they share fewer than
  // two letters in a row.
  anneal(wholes, keep = null) {
    const seqs = wholes.map((w) => this.lettersOf(w));
    const { start, length } = Memory.longestSharedRun(seqs);
    if (length < 2) return null;
    const shared = wholes[0].slice(start, start + length);
    const letters = seqs[0].slice(start, start + length).join(',');
    const result = { shared: seqs[0].slice(start, start + length), part: this.reuseOrForm(shared, keep), wholes: [] };
    wholes.forEach((w, i) => {
      const at = Memory.indexOfRun(seqs[i], letters);
      const formed = { before: this.reuseOrForm(w.slice(0, at), keep), after: this.reuseOrForm(w.slice(at + length), keep), at, length };
      const parts = [formed.before, result.part, formed.after];
      if ((formed.before.members.length || formed.after.members.length) && !parts.some((p) => p.skipped)) formed.composed = this.composeFrom(parts);
      result.wholes.push(formed);
    });
    return result;
  }
}

module.exports = { Memory, STATE, TRANSITION };
