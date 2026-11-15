import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Volume, Segment, Tally } from '../engine/index.js';

const LABELS = 'ABCDEFGHIJKLMNOP'.split('');
const volume = () => new Volume({ labels: LABELS, cellsPerColumn: 4, loosen: process.env.LOOSEN === '1' });
const names = (cells) => [...cells].map((cell) => cell.name).sort();
const store = (cells) => cells.forEach((cell) => cell.grow(cells.filter((other) => other !== cell)));
const structure = (m) => m.assemblies.length + m.cuts.length; // what was tied or cut
const tiedCells = (assembly) => names(assembly.segments.map((s) => s.cell));

test('a segment fires when two of its memory\'s cells are active, its own cell included', () => {
  const v = volume();
  const [a, b, c] = ['A', 'B', 'C'].map((label) => v.column(label).cells[0]);
  const segment = c.grow([a, b]);
  assert.equal(new Tally([a]).fires(segment), false);
  assert.equal(new Tally([a, b]).fires(segment), true);
  assert.equal(new Tally([a, c]).fires(segment), true);
  // wired to what a and b were a moment ago, a segment predicts: the present never reaches it, the past always does
  const sequence = c.grow([a.was, b.was]);
  assert.equal(new Tally([a, b, c]).fires(sequence), false);
  assert.equal(new Tally([a.was, b.was]).fires(sequence), true);
});

test('a pair is recognised when both its cells are seen, and never completed from one', () => {
  const v = volume();
  v.receive([...'AB']);
  const both = v.receive([...'AB']);
  assert.deepEqual(both.recognised.map((column) => column.label), ['A', 'B']);
  assert.equal(structure(both), 0);
  const one = v.receive([...'A']);
  assert.equal(one.brought.size, 0);
});

test('a whole made of known pairs is composed from them, not stored again (AB CD ABCD ABEF GH ABCDEFHG)', () => {
  const v = volume();
  const moments = ['AB', 'CD', 'ABCD', 'ABEF', 'GH', 'ABCDEFHG'].map((input) => v.receive([...input]));
  assert.deepEqual(names(moments[2].winners.values()), ['A0', 'B0', 'C0', 'D0']);
  assert.equal(moments[2].uncovered.length, 0);
  assert.equal(moments[2].parts.length, 2);
  assert.deepEqual(names(moments[3].winners.values()), ['A0', 'B0', 'E0', 'F0']);
  assert.deepEqual(names(moments[5].winners.values()), ['A0', 'B0', 'C0', 'D0', 'E0', 'F0', 'G0', 'H0']);
  assert.equal(moments[5].uncovered.length, 0);
  // the whole is tied from handles on the parts it is made of, nothing taken whole
  assert.ok(moments[5].assemblies.every((a) => a.parts.every((part) => part.length >= 2)));
});

test('half a stored assembly brings back the rest, predicted and not seen', () => {
  const v = volume();
  v.receive([...'ABCD']);
  const m = v.receive([...'AB']);
  assert.deepEqual(names(m.brought), ['C0', 'D0']);
  assert.deepEqual(m.recognised.map((column) => column.label), ['A', 'B']);
  assert.equal(structure(m), 0);
});

test('a cue that fits two memories equally brings back neither (CON-7)', () => {
  const v = volume();
  const [a, b] = ['A', 'B'].map((label) => v.column(label).cells[0]);
  const [c0, c1] = v.column('C').cells;
  store([a, b, c0]);
  store([a, b, c1]);
  const m = v.receive([...'AB']);
  assert.deepEqual(names(m.brought), []);
});

test('a failed prediction is heat, and what is seen outranks what was expected (PRN-5)', () => {
  const v = volume();
  for (const input of ['ABCD', 'DGJM', 'MNOP', 'ABCD']) v.receive([...input]);
  const m = v.receive([...'MNOP']);
  // ABCD predicted DGJM; M lights DGJM's cell M0, but MNOP's own assembly brings back M1, and the present wins
  assert.deepEqual(names(m.winners.values()), ['M1', 'N0', 'O0', 'P0']);
  assert.deepEqual(names(m.missing), ['D1', 'G0', 'J0']);
  assert.equal(m.uncovered.length, 0);
});

test('ABCD, DGJM, MNOP: learnt on the first pass, settled by the second', () => {
  const v = volume();
  const inputs = ['ABCD', 'DGJM', 'MNOP'];
  const moments = [];
  for (let pass = 0; pass < 3; pass++) for (const input of inputs) moments.push(v.receive([...input]));
  const grown = moments.map((m) => m.grown.length);

  // pass 1: every input bursts, is explained by nothing, and becomes an assembly; from the second on, it also learns
  // what came before
  for (const m of moments.slice(0, 3)) assert.equal(m.uncovered.length, 4);
  assert.deepEqual(grown.slice(0, 3), [4, 8, 8]);

  // D and M take different cells in different contexts (RM-1)
  assert.deepEqual(names(moments[0].winners.values()), ['A0', 'B0', 'C0', 'D0']);
  assert.deepEqual(names(moments[1].winners.values()), ['D1', 'G0', 'J0', 'M0']);
  assert.deepEqual(names(moments[2].winners.values()), ['M1', 'N0', 'O0', 'P0']);

  // pass 2: ABCD is not predicted after MNOP, so it bursts, but its own assembly recognises it; it learns only what
  // came before it
  assert.equal(moments[3].bursts.length, 4);
  assert.equal(moments[3].recognised.length, 4);
  assert.equal(moments[3].uncovered.length, 0);
  assert.equal(structure(moments[3]), 0);
  assert.equal(moments[3].learnt.length, 4);
  assert.deepEqual(names(moments[3].next), ['D1', 'G0', 'J0', 'M0']);

  // from then on, each input is predicted by the one before and nothing grows
  assert.deepEqual(grown.slice(4), [0, 0, 0, 0, 0]);
  for (const m of moments.slice(6)) assert.equal(m.bursts.length, 0);
});

test('each cell of an assembly samples 2⌈ln n⌉ of the others, between the bar and all of them', () => {
  assert.deepEqual([2, 3, 4, 6, 12, 96].map((n) => Segment.sampleSize(n)), [1, 2, 3, 4, 6, 10]);
});

test('composition (RM-7): the Z ties a handle of two cells from each part, then one part brings back the rest', () => {
  const v = volume();
  const inputs = ['ABCD', 'DGJM', 'MNOP', 'ABCDDGJMMNOP'];
  const moments = [];
  for (let pass = 0; pass < 2; pass++) for (const input of inputs) moments.push(v.receive([...input]));

  const z = moments[3];
  assert.equal(z.parts.length, 3);
  assert.equal(z.assemblies.length, 1);
  const tied = z.assemblies[0].segments;
  assert.equal(tied.length, 6);
  for (const part of z.parts) {
    const handle = tied.filter((s) => part.includes(s.cell)).map((s) => s.cell);
    assert.equal(handle.length, 2);
    assert.ok(handle[0].segments.some((s) => s.holds(handle[1])) || handle[1].segments.some((s) => s.holds(handle[0])));
  }
  for (const s of tied) assert.equal(s.links.length, Segment.sampleSize(6));

  // the Z again: one part, nothing grows
  assert.equal(moments[7].parts.length, 1);
  assert.equal(moments[7].grown.length, 0);

  // ABCD alone brings back the other parts: predicted, not seen
  for (const name of ['G0', 'J0', 'N0', 'O0', 'P0']) assert.ok(names(moments[4].brought).includes(name), name);
});

test('the cut (RM-8): a whole partly seen by something with its own remainder is cut where it fits', () => {
  const v = volume();
  v.receive([...'ABCD']);
  const m = v.receive([...'ABEF']);
  assert.equal(m.cuts.length, 1);
  const [cut] = m.cuts;
  assert.deepEqual(names(cut.fit), ['A0', 'B0']);
  assert.deepEqual(names(cut.rest), ['C0', 'D0']);
  assert.equal(cut.removed.length, 4); // the whole's old segments, one on each of its cells
  for (const segment of cut.removed) assert.ok(!segment.cell.segments.includes(segment));
  // the shared part stays on the same cells: it and the remainder become assemblies, the old whole is retied as
  // fit + rest, and the input is tied as fit + its own cells
  assert.deepEqual(cut.pieces.map(tiedCells), [['A0', 'B0'], ['C0', 'D0']]);
  assert.deepEqual(tiedCells(cut.rebound), ['A0', 'B0', 'C0', 'D0']);
  assert.ok(m.assemblies.some((a) => tiedCells(a).join() === 'A0,B0,E0,F0'));
  // both wholes are recognised afterwards, with no more structure grown or cut (only what follows what is learnt)
  for (const input of ['ABCD', 'ABEF']) {
    const again = v.receive([...input]);
    assert.equal(again.uncovered.length, 0);
    assert.equal(structure(again), 0, input);
  }
});

test('recall is not a cut: part of a memory alone brings back the rest and changes nothing', () => {
  const v = volume();
  v.receive([...'ABCD']);
  const m = v.receive([...'AB']);
  assert.equal(m.cuts.length, 0);
  assert.equal(structure(m), 0);
});

test('wholes compete (RM-5): each whole brings back only itself; a shared part alone, both; more of one, that one', () => {
  const v = volume();
  v.receive([...'ABCD']);
  v.receive([...'ABEF']); // the cut: AB shared by AB + CD and AB + EF
  assert.deepEqual(names(v.receive([...'ABCD']).brought), []);
  assert.deepEqual(names(v.receive([...'ABEF']).brought), []);
  assert.deepEqual(names(v.receive([...'AB']).brought), ['C0', 'D0', 'E0', 'F0']); // a tie: both held (RM-10, open)
  assert.deepEqual(names(v.receive([...'ABC']).brought), ['D0']);
});

test('a part with no whole of its own brings back the composition it is in, through the nested wholes', () => {
  const v = volume();
  for (const input of ['AB', 'CD', 'ABCD', 'ABEF', 'GH', 'ABCDEFHG']) v.receive([...input]);
  assert.deepEqual(names(v.receive([...'GH']).brought), ['A0', 'B0', 'C0', 'D0', 'E0', 'F0']);
});

test('junctions: where two wholly seen memories meet in one column, both cells win, and any part brings back the Z', () => {
  const v = volume();
  const moments = ['ABCD', 'DGJM', 'MNOP', 'ABCDDGJMMNOP', 'ABCD', 'DGJM', 'MNOP'].map((input) => v.receive([...input]));
  const z = moments[3];
  assert.equal(z.refused.length, 0);
  for (const name of ['D0', 'D1', 'M0', 'M1']) assert.ok(names(z.winners).includes(name), name);
  // each part alone brings back the rest of the Z: in unlit columns, brought back; in the junctions, active
  const zCells = ['A0', 'B0', 'C0', 'D0', 'D1', 'G0', 'J0', 'M0', 'M1', 'N0', 'O0', 'P0'];
  for (const m of moments.slice(4)) {
    const back = names([...m.brought, ...m.active]);
    for (const name of zCells) assert.ok(back.includes(name), `${m.input.join('')}: ${name}`);
  }
});

test('a large assembly, its links sampled, comes back whole from half of itself, whatever the sample', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const v = new Volume({ labels: LABELS, cellsPerColumn: 4, loosen: process.env.LOOSEN === '1', seed });
    v.receive([...'ABCDEFGHIJKL']);
    assert.equal(v.receive([...'ABCDEF']).brought.size, 6, `seed ${seed}`);
  }
});

test('the square: quarters, halves, the whole, each level tied by handles; any quarter brings back the whole', () => {
  const quarters = ['ABEF', 'CDGH', 'IJMN', 'KLOP'];
  for (let seed = 1; seed <= 20; seed++) {
    for (const quarter of quarters) {
      const v = new Volume({ labels: LABELS, cellsPerColumn: 4, loosen: process.env.LOOSEN === '1', seed });
      for (const input of [...quarters, 'ABEFIJMN', 'CDGHKLOP']) v.receive([...input]);
      const whole = v.receive([...'ABCDEFGHIJKLMNOP']);
      assert.equal(whole.assemblies.length, 1);
      assert.equal(whole.assemblies[0].segments.length, 4); // a handle on each half: the whole costs what its parts number
      assert.equal(v.receive([...quarter]).brought.size, 12, `seed ${seed}, ${quarter}`);
    }
  }
});
