// The domain model: the Anneal engine itself. It is NOT copied here: the page loads it straight from the repo
// (../src/engine/see.js, with ../src/worlds/catalogue.js and scenes.js), so the sandbox always shows the real engine.
// This file only gives the page a small interface onto it: a learner, a stream of pictures from the scene world, and
// what the page needs to read. It never changes how the engine works. See docs/engine-api.md.

function createLearner({ seed = 1 } = {}) {
  const world = new SceneWorld(CATALOGUE);
  let r, engine, seen, log;

  function reset() { r = rng(seed); engine = new Model('FL', {}); seen = 0; log = []; }

  // A fresh picture from the scene world (1-3 shapes or objects at random places).
  function nextPicture() { return world.next(r, 0).x; }

  // Awake: the engine sees a picture (and may remember it).
  function look(x) { seen++; const q = engine.step(x); return q; }

  // Rest: one move at a time. Returns the move kept, or null when nothing more lowers energy.
  function restStep() { const a = engine.restStep(); if (a) log.push({ after: seen, type: a.type, saving: a.saving }); return a; }

  reset();

  return {
    reset, nextPicture, look, restStep,
    explain: (x) => engine.read(x),        // how the engine explains a picture, without learning from it
    bill: () => engine.measure(),          // energy: { E, structure, flow, pc }
    parts: () => engine.units.filter((u) => !u.loose),
    shape: (u) => engine.exp(u),           // a part's pixels, as [x, y]
    price: () => engine.pc(),              // what one placement costs now
    memories: () => engine.items.length,
    get seen() { return seen; },
    get log() { return log; },
    size: SW,
    world,
  };
}

if (typeof module !== 'undefined') module.exports = { createLearner };
