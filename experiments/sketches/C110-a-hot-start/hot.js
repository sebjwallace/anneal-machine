// C110 · A hot start.
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
  { name: 'reader', text: READER, passes: 3 },
  { name: 'story', text: STORY, passes: 2 },
];
const POOLS = [16, 64, 256, 1024];
const POPULATIONS = [64, 256, 1024];
const MAIN = { T: 256, N: 256 };
const SHOW_STEPS = process.argv.includes('steps');

const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const prep = (text) => text.replace(/ /g, '_');

// ---------------------------------------------------------------- one run

function run(text, passes, T, N, mode = 'hot') {
  const stream = prep(text).repeat(passes);
  const A = new Set(stream).size;
  const use = 1 + Math.log2(N) / Math.log2(A);
  const lasting = new Map(); // text -> { left, right, at }
  const byLength = []; // lasting texts, longest first, for reading
  const pool = new Map(); // pair text -> { left, right, seen, born }
  const nucleations = [];
  const passLength = stream.length / passes;
  const timeline = []; // per stretch: loose letters, units, dissolved
  const STRETCH = Math.round(passLength / 4);
  let stretch = { letters: 0, chars: 0, units: 0, dissolved: 0, nucleated: 0 };
  const measured = []; // units read on the last pass
  let prev = null;
  let clock = 0;
  let full = false;

  const costOf = (unit) => (unit.length === 1 ? 1 : use);
  // what spelling a text out costs with lasting pieces and letters, as cheaply as possible
  const spell = (t) => {
    const c = new Array(t.length + 1).fill(0);
    for (let j = t.length - 1; j >= 0; j--) {
      c[j] = 1 + c[j + 1];
      for (const p of byLength) if (p.length > 1 && t.startsWith(p, j)) c[j] = Math.min(c[j], use + c[j + p.length]);
    }
    return c[0];
  };
  // nucleate: k · b > b + k · use (cold: b is its two units; hot: b is the whole spelled out)
  const nucleate = (key, tent, start) => {
    const b = mode === 'hot' ? spell(key) : costOf(tent.left) + costOf(tent.right);
    const k = tent.seen;
    if (!(k * b > b + k * use + 1e-9)) return false;
    if (lasting.size >= N) { full = true; return false; }
    lasting.set(key, { left: tent.left, right: tent.right, at: start });
    byLength.push(key);
    byLength.sort((a, c) => c.length - a.length);
    pool.delete(key);
    nucleations.push({ text: key, left: tent.left, right: tent.right, seen: k, at: start + key.length });
    stretch.nucleated++;
    return true;
  };

  for (let i = 0; i < stream.length; ) {
    // read: the longest lasting piece that fits, else a letter
    let unit = stream[i];
    for (const t of byLength) if (stream.startsWith(t, i)) { unit = t; break; }
    if (mode === 'hot') {
      // tentative pieces met again take part in reading too
      for (const [t, tent] of pool) if (tent.seen >= 2 && t.length > unit.length && stream.startsWith(t, i)) unit = t;
      const tent = pool.get(unit);
      if (tent && unit.length > 1) {
        tent.seen++;
        nucleate(unit, tent, i);
      }
    }
    const start = i;
    i += unit.length;
    if (start >= stream.length - passLength) measured.push({ u: unit, at: start - (stream.length - passLength) });
    stretch.chars += unit.length;
    stretch.units++;
    if (unit.length === 1) stretch.letters++;

    // pair with the unit before, as a tentative piece
    if (prev !== null) {
      const key = prev + unit;
      if (!lasting.has(key)) {
        let tent = pool.get(key);
        if (!tent) {
          if (pool.size >= T) {
            let weakest = null;
            for (const [k, t] of pool) if (!weakest || t.seen < weakest[1].seen || (t.seen === weakest[1].seen && t.born < weakest[1].born)) weakest = [k, t];
            pool.delete(weakest[0]);
            stretch.dissolved++;
          }
          tent = { left: prev, right: unit, seen: 0, born: clock++ };
          pool.set(key, tent);
        }
        tent.seen++;
        nucleate(key, tent, start);
      }
    }
    prev = unit;
    if (stretch.chars >= STRETCH || i >= stream.length) {
      timeline.push(stretch);
      stretch = { letters: 0, chars: 0, units: 0, dissolved: 0, nucleated: 0 };
    }
  }
  return { stream, A, use, lasting, nucleations, timeline, measured, full, passLength };
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

function summarise(name, text, r) {
  const inside = cutsInMeasured(text, r.measured);
  const loose = r.measured.filter(({ u }) => u.length === 1).length;
  const pieceUnits = r.measured.length - loose;
  return { lasting: r.lasting.size, units: r.measured.length, loose, pieceUnits, inside, full: r.full,
    lettersLoose: loose, chars: prep(text).length };
}

// ---------------------------------------------------------------- report

console.log('first run, cold (tentative pieces grow only by becoming lasting):');
for (const { name, text, passes } of RUNS)
  for (const T of POOLS) for (const N of POPULATIONS) {
    const r = run(text, passes, T, N, 'cold');
    console.log(`  ${pad(name, 7)} T ${pad(String(T), 5)} N ${pad(String(N), 5)} lasting pieces ${r.lasting.size}`);
  }
console.log('\nsecond run, hot (tentative pieces met again take part in reading and grow): everything below');
for (const { name, text, passes } of RUNS) {
  console.log('\n' + '='.repeat(100) + `\n${name}: ${prep(text).length} characters, streamed ${passes} times; ` +
    `main run: pool ${MAIN.T}, population ${MAIN.N}\n` + '='.repeat(100));
  const r = run(text, passes, MAIN.T, MAIN.N);
  console.log(`alphabet ${r.A}; a use costs ${r.use.toFixed(2)}; ${r.lasting.size} lasting pieces${r.full ? ' (population full)' : ''}`);

  console.log('\nlasting pieces in the order they nucleated (built from, sightings, at character):');
  for (const n of r.nucleations)
    console.log(`  ${pad(n.text, 18)} ${pad(`${n.left} + ${n.right}`, 26)} seen ${pad(String(n.seen), 3)} at ${n.at}` +
      `${n.at > r.passLength ? `  (pass ${Math.floor(n.at / r.passLength) + 1})` : ''}`);

  console.log('\nhow hot, by stretch (a quarter of a pass each): share of units read as loose letters, tentative pieces dissolved, nucleated');
  r.timeline.forEach((s, j) =>
    console.log(`  ${pad(String(j + 1), 3)} loose ${pad((100 * s.letters / s.units).toFixed(0) + '%', 5)} ` +
      `chars per unit ${pad((s.chars / s.units).toFixed(2), 5)} dissolved ${pad(String(s.dissolved), 5)} nucleated ${s.nucleated}`));

  const inside = cutsInMeasured(text, r.measured);
  const loose = r.measured.filter(({ u }) => u.length === 1).length;
  console.log(`\nthe last pass as read (${r.measured.length} units; ${loose} loose letters; ${inside.length} pieces cutting inside a word):`);
  console.log('  ' + readingOf(r.measured));
  console.log(`  cutting inside a word: ${[...new Set(inside)].join('  ') || '-'}`);
  if (name === 'reader') console.log(`  the zebra sat on the mat: ${zebraReading(text, r.measured, 'the zebra sat on the mat')}`);
}

console.log('\n' + '='.repeat(100) + '\nsizes: pool T and population N\n' + '='.repeat(100));
for (const { name, text, passes } of RUNS) {
  console.log(`\n${name}`);
  console.log(`  ${pad('T', 6)} ${pad('N', 6)} ${pad('lasting', 8)} ${pad('units', 6)} ${pad('loose', 6)} ${pad('inside', 7)} zebra / sample`);
  for (const T of POOLS)
    for (const N of POPULATIONS) {
      const r = run(text, passes, T, N);
      const inside = cutsInMeasured(text, r.measured);
      const loose = r.measured.filter(({ u }) => u.length === 1).length;
      const sample = name === 'reader' ? zebraReading(text, r.measured, 'the zebra sat on the mat')
        : zebraReading(text, r.measured, 'the baker opened his shop');
      console.log(`  ${pad(String(T), 6)} ${pad(String(N), 6)} ${pad(String(r.lasting.size) + (r.full ? '*' : ''), 8)} ` +
        `${pad(String(r.measured.length), 6)} ${pad(String(loose), 6)} ${pad(String(inside.length), 7)} ${sample}`);
      if (SHOW_STEPS) console.log('    ' + r.nucleations.map((n) => n.text).join(' '));
    }
}
console.log('\n(* population full: something paid but there was no room)');
