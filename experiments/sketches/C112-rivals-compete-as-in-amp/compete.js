// C112 · Rivals compete as in AMP. (Texts and measures copied from C110's hot.js.)
// No buffers. Text streams in a character at a time. Every unit read pairs with the one before it as a tentative
// piece in a small pool; a tentative piece nucleates into a lasting piece once it pays for itself; when the pool is
// full the least-seen tentative piece dissolves. Reading uses the longest lasting piece that fits. See hypothesis.md.
//
// Run: node hot.js          (as in out.txt)
//      node hot.js steps    (also every nucleation in every run)

'use strict';

const READER =
  'the cat sat on the mat and the dog sat on the log the cat saw the dog and the dog saw the cat ' +
  'the cat ran to the dog and the dog ran to the cat then the cat and the dog sat on the mat ' +
  'the man saw the cat and the dog on the mat and the man sat on the log ' +
  'the zebra sat on the mat the zebra saw the zebra and the zebra ran ';

// Written for the sketch.
const STORY =
  'the village stood at the edge of the forest where the river turned towards the sea every morning the ' +
  'baker opened his shop and the smell of bread drifted along the street the children walked to school ' +
  'past the old mill and the farmers drove their carts to the market in the square one winter the river ' +
  'froze for the first time in many years and the people of the village came out to look at the ice the ' +
  'children wanted to walk on it but their mothers told them to wait the baker said that his father had ' +
  'once crossed the frozen river to bring flour from the town on the other side and that the ice had held ' +
  'him all the way the old miller said that the ice was thin near the bank and thick in the middle and ' +
  'that nobody should walk on it until the cold had lasted for a week the children waited and every day ' +
  'they went down to the river to see if the ice was still there on the seventh day the miller walked out ' +
  'onto the ice with a long pole and tapped it as he went the ice held and the people cheered and soon the ' +
  'whole village was on the river the children slid and fell and laughed the farmers walked across to the ' +
  'other side and back again and the baker brought bread and hot tea for everyone that night the wind ' +
  'changed and the air grew warm and in the morning the river was moving again the ice was gone and the ' +
  'children stood on the bank and watched the water carry the last pieces of it towards the sea the miller ' +
  'said that the river would freeze again one day and the children asked him when and he said that nobody ' +
  'knew but that when it did they would be ready ';


const RUNS = [
  { name: 'reader', text: READER, passes: 3, sample: 'the zebra sat on the mat' },
  { name: 'story', text: STORY, passes: 2, sample: 'the baker opened his shop' },
];
const POOLS = [64, 256, 1024];
const POPULATIONS = [64, 256, 1024];
const MAIN = { T: 256, N: 256 };
const SHOW_STEPS = process.argv.includes('steps');
const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const prep = (text) => text.replace(/ /g, '_');

// ---------------------------------------------------------------- one run

function run(text, passes, T, N, support = 'length') {
  const stream = prep(text).repeat(passes);
  const A = new Set(stream).size;
  const use = 1 + Math.log2(N) / Math.log2(A);
  const lasting = new Set();
  const ways = new Map(); // ways in of lasting pieces: sightings, carried over and still counted
  const pool = new Map(); // text -> { seen, born }
  const nucleations = [];
  const passLength = stream.length / passes;
  const STRETCH = Math.round(passLength / 4);
  const timeline = [];
  let st = { letters: 0, chars: 0, units: 0, dissolved: 0, nucleated: 0, ties: 0, beaten: 0 };
  const measured = [];
  let clock = 0, full = false, prev = null;

  const spell = (t) => {
    const c = new Array(t.length + 1).fill(0);
    for (let j = t.length - 1; j >= 0; j--) {
      c[j] = 1 + c[j + 1];
      for (const p of lasting) if (p.length > 1 && t.startsWith(p, j)) c[j] = Math.min(c[j], use + c[j + p.length]);
    }
    return c[0];
  };
  const nucleate = (key, tent, at) => {
    const b = spell(key), k = tent.seen;
    if (!(k * b > b + k * use + 1e-9)) return;
    if (lasting.size >= N) { full = true; return; }
    lasting.add(key); ways.set(key, k); pool.delete(key);
    nucleations.push({ text: key, seen: k, at });
    st.nucleated++;
  };
  const touch = (key, at) => {
    if (lasting.has(key)) return;
    let tent = pool.get(key);
    if (!tent) {
      if (pool.size >= T) {
        let weakest = null;
        for (const [k, t] of pool) if (!weakest || t.seen < weakest[1].seen || (t.seen === weakest[1].seen && t.born < weakest[1].born)) weakest = [k, t];
        pool.delete(weakest[0]);
        st.dissolved++;
      }
      tent = { seen: 0, born: clock++ };
      pool.set(key, tent);
    }
    tent.seen++;
    nucleate(key, tent, at);
  };

  // the whole at a position: the longest lasting or tentative (seen twice) piece that matches there fully
  const waysOf = (p) => (lasting.has(p) ? ways.get(p) : pool.get(p)?.seen ?? 0);
  const supportOf = (p) => (support === 'length' ? p.length : support === 'ways' ? waysOf(p) : p.length * 1e6 + waysOf(p));
  const wholeAt = (j) => {
    let best = null;
    for (const p of lasting) if (p.length > 1 && stream.startsWith(p, j) && (!best || p.length > best.length)) best = p;
    for (const [p, t] of pool) if (t.seen >= 2 && stream.startsWith(p, j) && (!best || p.length > best.length)) best = p;
    return best;
  };

  for (let i = 0; i < stream.length; ) {
    // settle by competition: support is length (a full match); most support wins; ties are held; a rival is beaten
    // only by one with more support that wasn't itself beaten; parts are not rivals of their whole
    const memo = new Map();
    const whole = (j) => { if (!memo.has(j)) memo.set(j, wholeAt(j)); return memo.get(j); };
    const statusMemo = new Map();
    const status = (j) => { // 'wins' | 'beaten' | 'tie' | 'none'
      if (statusMemo.has(j)) return statusMemo.get(j);
      const c = whole(j);
      if (!c) { statusMemo.set(j, 'none'); return 'none'; }
      statusMemo.set(j, 'wins'); // provisional, guards recursion
      let out = 'wins';
      for (let k = j + 1; k < j + c.length; k++) {
        const r = whole(k);
        if (!r || k + r.length <= j + c.length) continue; // nothing there, or a part of c
        if (supportOf(r) < supportOf(c)) continue;
        const rs = status(k);
        if (rs === 'beaten') continue;
        if (supportOf(r) > supportOf(c)) { out = 'beaten'; break; }
        out = 'tie';
      }
      statusMemo.set(j, out);
      return out;
    };
    const s = status(i);
    let unit = stream[i];
    if (s === 'wins') unit = whole(i);
    else if (s === 'tie') st.ties++;
    else if (s === 'beaten') st.beaten++;
    // a rival that tied with something still holding, earlier, is held too: handled by the earlier piece's own reading
    if (unit.length > 1 && heldTie.has(i)) { unit = stream[i]; st.ties++; }
    if (s === 'tie') { // mark the tied rivals as held, so they don't win at their own start
      const c = whole(i);
      for (let k = i + 1; k < i + c.length; k++) { const r = whole(k); if (r && supportOf(r) === supportOf(c) && k + r.length > i + c.length) heldTie.add(k); }
    }
    const start = i;
    i += unit.length;
    if (start >= stream.length - passLength) measured.push({ u: unit, at: start - (stream.length - passLength) });
    st.chars += unit.length; st.units++;
    if (unit.length === 1) st.letters++;
    if (unit.length > 1 && pool.has(unit)) { const t = pool.get(unit); t.seen++; nucleate(unit, t, i); }
    else if (unit.length > 1 && lasting.has(unit)) ways.set(unit, ways.get(unit) + 1);
    if (prev !== null) touch(prev + unit, i);
    prev = unit;
    if (st.chars >= STRETCH || i >= stream.length) { timeline.push(st); st = { letters: 0, chars: 0, units: 0, dissolved: 0, nucleated: 0, ties: 0, beaten: 0 }; }
  }
  return { A, use, lasting, nucleations, timeline, measured, full, passLength };
}
const heldTie = new Set(); // reset per run below

function shiftedCopies(lasting) {
  const list = [...lasting];
  const set = new Set(list);
  const pairs = [];
  for (const p of list) for (const q of list)
    if (p !== q && p.length === q.length && p.length > 2 && p.slice(1) === q.slice(0, -1)) pairs.push(`${p}/${q}`);
  return pairs;
}
// ---------------------------------------------------------------- measures

const isLetter = (c) => c !== undefined && c !== '_';
// A unit read cuts inside a word if, where it was read, it starts or ends between two letters.
function cutsInMeasured(text, units) {
  const t = prep(text);
  const inside = [];
  for (const { u, at } of units) {
    if (u.length > 1 && ((isLetter(t[at - 1]) && isLetter(u[0])) || (isLetter(t[at + u.length]) && isLetter(u.at(-1)))))
      inside.push(u);
  }
  return inside;
}

function readingOf(units) {
  return units.map(({ u }) => (u.length === 1 ? u : `[${u}]`)).join('');
}

function zebraReading(text, units, sentence) {
  const t = prep(text);
  const target = prep(sentence);
  const from = t.indexOf(target);
  return readingOf(units.filter(({ u, at }) => at + u.length > from && at < from + target.length));
}


const runFresh = (...a) => { heldTie.clear(); return run(...a); };
const SUPPORTS = [['length', 'support is length (first run)'], ['ways', 'support is ways in'], ['length+ways', 'support is length, then ways in']];

for (const [support, label] of SUPPORTS) for (const { name, text, passes, sample } of RUNS) {
  const r = runFresh(text, passes, MAIN.T, MAIN.N, support);
  console.log('\n' + '='.repeat(100) + `\n${label} · ${name}: streamed ${passes} times; pool ${MAIN.T}, population ${MAIN.N}; a use costs ${r.use.toFixed(2)}\n` + '='.repeat(100));
  console.log(`${r.lasting.size} lasting pieces${r.full ? ' (population full)' : ''}, in the order they nucleated (sightings @ character):`);
  console.log('  ' + r.nucleations.map((n) => `${n.text}(${n.seen}@${n.at})`).join('  '));
  const sh = shiftedCopies(r.lasting);
  console.log(`shifted copies: ${sh.length}${sh.length ? ': ' + sh.join('  ') : ''}`);
  console.log('how hot, by stretch (a quarter of a pass): loose letters, ties held, beaten, dissolved, nucleated');
  r.timeline.forEach((s, j) => console.log(`  ${pad(String(j + 1), 3)} loose ${pad((100 * s.letters / s.units).toFixed(0) + '%', 5)} ties ${pad(String(s.ties), 4)} beaten ${pad(String(s.beaten), 4)} dissolved ${pad(String(s.dissolved), 5)} nucleated ${s.nucleated}`));
  const ins = cutsInMeasured(text, r.measured);
  const loose = r.measured.filter(({ u }) => u.length === 1).length;
  console.log(`the last pass as read (${r.measured.length} units, ${loose} loose letters, ${ins.length} cutting inside a word):`);
  console.log('  ' + readingOf(r.measured));
  console.log(`  cutting inside a word: ${[...new Set(ins)].join('  ') || '-'}`);
  console.log(`  "${sample}": ${zebraReading(text, r.measured, sample)}`);
}

console.log('\n' + '='.repeat(100) + '\nsizes\n' + '='.repeat(100));
for (const [support, label] of SUPPORTS.slice(1)) for (const { name, text, passes, sample } of RUNS) {
  console.log(`\n${label} · ${name}`);
  console.log(`  ${pad('T', 6)} ${pad('N', 6)} ${pad('lasting', 8)} ${pad('shifted', 8)} ${pad('units', 6)} ${pad('loose', 6)} ${pad('inside', 7)} sample`);
  for (const T of POOLS) for (const N of POPULATIONS) {
    const r = runFresh(text, passes, T, N, support);
    const ins = cutsInMeasured(text, r.measured);
    const loose = r.measured.filter(({ u }) => u.length === 1).length;
    console.log(`  ${pad(String(T), 6)} ${pad(String(N), 6)} ${pad(r.lasting.size + (r.full ? '*' : ''), 8)} ${pad(String(shiftedCopies(r.lasting).length), 8)} ${pad(String(r.measured.length), 6)} ${pad(String(loose), 6)} ${pad(String(ins.length), 7)} ${zebraReading(text, r.measured, sample)}`);
    if (SHOW_STEPS) console.log('    ' + [...r.lasting].join(' '));
  }
}
console.log('\n(* population full)');
