// C111 · Dense when hot.
// As C110's hot run, but reading is dense: every unit that fits at a position is met, and every two met units that sit
// next to each other make a tentative pair. The measured reading is the cheapest description with lasting pieces.
// Variant 'where-hot': positions inside a lasting piece of the settled reading start no units. See hypothesis.md.
//
// Run: node dense.js          (as in out.txt)

'use strict';

const READER =
  'the cat sat on the mat and the dog sat on the log the cat saw the dog and the dog saw the cat ' +
  'the cat ran to the dog and the dog ran to the cat then the cat and the dog sat on the mat ' +
  'the man saw the cat and the dog on the mat and the man sat on the log ' +
  'the zebra sat on the mat the zebra saw the zebra and the zebra ran ';

// Written for C110.
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
const POOLS = [256, 1024, 4096];
const POPULATIONS = [64, 256, 1024];
const MODES = ['everywhere', 'where-hot'];
const MAIN = { T: 1024, N: 256 };

const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const prep = (text) => text.replace(/ /g, '_');
const isLetter = (c) => c !== undefined && c !== '_';

function run(text, passes, T, N, mode) {
  const stream = prep(text).repeat(passes);
  const A = new Set(stream).size;
  const use = 1 + Math.log2(N) / Math.log2(A);
  const lasting = []; // texts
  const lastingSet = new Set();
  const pool = new Map(); // text -> { seen, born, last }
  const nucleations = [];
  let clock = 0, full = false;
  const passLength = stream.length / passes;
  const STRETCH = Math.round(passLength / 4);
  const timeline = [];
  let st = { dissolved: 0, nucleated: 0, pairs: 0 };

  const cheapest = (t) => { // with lasting pieces only: { cost, parts }
    const n = t.length, c = new Array(n + 1).fill(0), how = new Array(n + 1).fill(null);
    for (let j = n - 1; j >= 0; j--) {
      c[j] = 1 + c[j + 1]; how[j] = null;
      for (const p of lasting) if (t.startsWith(p, j)) {
        const v = use + c[j + p.length];
        if (v < c[j] - 1e-9 || (Math.abs(v - c[j]) < 1e-9 && p.length > (how[j]?.length ?? 1))) { c[j] = v; how[j] = p; }
      }
    }
    const parts = [];
    for (let j = 0; j < n; ) { if (how[j]) { parts.push({ u: how[j], at: j }); j += how[j].length; } else parts.push({ u: t[j], at: j++ }); }
    return { cost: c[0], parts };
  };
  const spell = (t) => cheapest(t).cost;

  const touch = (key) => {
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
    const b = spell(key), k = tent.seen;
    if (k * b > b + k * use + 1e-9) {
      if (lasting.length >= N) { full = true; return; }
      lasting.push(key); lastingSet.add(key); pool.delete(key);
      nucleations.push({ text: key, seen: k, at: currentAt });
      st.nucleated++;
    }
  };

  // ends[i]: units met that end at position i
  const ends = new Map();
  let currentAt = 0;
  // where-hot: positions covered inside a lasting piece of the settled reading (computed a window at a time)
  let quietUntil = -1;
  for (let i = 0; i < stream.length; i++) {
    currentAt = i;
    let starts = [];
    const quiet = mode === 'where-hot' && i < quietUntil;
    if (!quiet) {
      starts.push(stream[i]);
      for (const p of lasting) if (p.length > 1 && stream.startsWith(p, i)) starts.push(p);
      for (const [p, t] of pool) if (t.seen >= 2 && !lastingSet.has(p) && stream.startsWith(p, i)) starts.push(p);
      starts = [...new Set(starts)];
      if (mode === 'where-hot') {
        // the settled reading at this point: the longest lasting piece that starts here makes its inside quiet
        let longest = 0;
        for (const p of lasting) if (stream.startsWith(p, i)) longest = Math.max(longest, p.length);
        if (longest > 1) quietUntil = i + longest;
      }
    }
    // meeting a tentative piece is a sighting
    for (const u of starts) if (u.length > 1 && pool.has(u)) touch(u);
    // pairs: units ending here with units starting here; one sighting per different text at this position
    const before = ends.get(i) || [];
    const formed = new Set();
    for (const v of before) for (const u of starts) {
      const key = v + u;
      if (formed.has(key) || lastingSet.has(key)) continue;
      formed.add(key);
    }
    for (const key of formed) { touch(key); st.pairs++; }
    for (const u of starts) {
      const e = i + u.length;
      if (!ends.has(e)) ends.set(e, []);
      ends.get(e).push(u);
    }
    // in where-hot mode, a quiet stretch still ends with its lasting piece, so it can pair onward
    ends.delete(i);
    if ((i + 1) % STRETCH === 0 || i === stream.length - 1) {
      const from = Math.max(0, i + 1 - STRETCH);
      const r = cheapest(stream.slice(from, i + 1));
      st.loose = r.parts.filter((p) => p.u.length === 1).length / r.parts.length;
      timeline.push(st);
      st = { dissolved: 0, nucleated: 0, pairs: 0 };
    }
  }
  const last = cheapest(prep(text));
  return { A, use, lasting, nucleations, timeline, last, full, passLength };
}

function inside(text, parts) {
  const t = prep(text);
  return parts.filter(({ u, at }) => u.length > 1 && ((isLetter(t[at - 1]) && isLetter(u[0])) || (isLetter(t[at + u.length]) && isLetter(u.at(-1))))).map((p) => p.u);
}
const reading = (parts) => parts.map(({ u }) => (u.length === 1 ? u : `[${u}]`)).join('');
function sampleOf(text, parts, sentence) {
  const t = prep(text), s = prep(sentence), from = t.indexOf(s);
  return reading(parts.filter(({ u, at }) => at + u.length > from && at < from + s.length));
}

for (const mode of MODES) {
  for (const { name, text, passes, sample } of RUNS) {
    const r = run(text, passes, MAIN.T, MAIN.N, mode);
    console.log('\n' + '='.repeat(100) + `\n${mode}: ${name}, streamed ${passes} times; pool ${MAIN.T}, population ${MAIN.N}; a use costs ${r.use.toFixed(2)}\n` + '='.repeat(100));
    console.log(`${r.lasting.length} lasting pieces${r.full ? ' (population full)' : ''}, in the order they nucleated (sightings, character):`);
    console.log('  ' + r.nucleations.map((n) => `${n.text}(${n.seen}@${n.at})`).join('  '));
    console.log('how hot, by stretch (a quarter of a pass): loose letters in the settled reading, tentative pairs formed, dissolved, nucleated');
    r.timeline.forEach((s, j) => console.log(`  ${pad(String(j + 1), 3)} loose ${pad((100 * s.loose).toFixed(0) + '%', 5)} pairs ${pad(String(s.pairs), 6)} dissolved ${pad(String(s.dissolved), 6)} nucleated ${s.nucleated}`));
    const ins = inside(text, r.last.parts);
    const loose = r.last.parts.filter((p) => p.u.length === 1).length;
    console.log(`the text as settled with the lasting pieces (${r.last.parts.length} units, ${loose} loose letters, ${ins.length} pieces cutting inside a word):`);
    console.log('  ' + reading(r.last.parts));
    console.log(`  cutting inside a word: ${[...new Set(ins)].join('  ') || '-'}`);
    console.log(`  "${sample}": ${sampleOf(text, r.last.parts, sample)}`);
  }
}

console.log('\n' + '='.repeat(100) + '\nsizes\n' + '='.repeat(100));
for (const mode of MODES)
  for (const { name, text, passes, sample } of RUNS) {
    console.log(`\n${mode}: ${name}`);
    console.log(`  ${pad('T', 6)} ${pad('N', 6)} ${pad('lasting', 8)} ${pad('units', 6)} ${pad('loose', 6)} ${pad('inside', 7)} ${pad('dissolved', 10)} sample`);
    for (const T of POOLS) for (const N of POPULATIONS) {
      const r = run(text, passes, T, N, mode);
      const ins = inside(text, r.last.parts);
      const loose = r.last.parts.filter((p) => p.u.length === 1).length;
      const dissolved = r.timeline.reduce((a, s) => a + s.dissolved, 0);
      console.log(`  ${pad(String(T), 6)} ${pad(String(N), 6)} ${pad(r.lasting.length + (r.full ? '*' : ''), 8)} ${pad(String(r.last.parts.length), 6)} ${pad(String(loose), 6)} ${pad(String(ins.length), 7)} ${pad(String(dissolved), 10)} ${sampleOf(text, r.last.parts, sample)}`);
    }
  }
console.log('\n(* population full) (units, loose and inside are for the text read once, settled with the lasting pieces)');
