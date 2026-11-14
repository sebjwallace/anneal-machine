// C61 · LOOKING FOR LOST KEYS. A fringe sketch, not the engine: a direct model of the recall rule and the engine's
// pricing, using the branch's store of experiences (C56) for memory. Question (owner): when searching, memory stops you
// looking again where you've already looked. We have no negative associations ("kitchen, no keys"). Does the effect
// fall out of pricing alone: a claim of keys somewhere the machine has SEEN without keys costs (like a pixel drawn
// wrongly), a claim about somewhere it hasn't looked costs nothing (hidden)?
//
// GIVEN BY HAND (puppeteering, declared; the results below are NOT evidence for these):
//   G1 the house (5 rooms) and where the keys really are each day (the world);
//   G2 what a look shows: looking in a room shows whether the keys are there (perception assumed perfect);
//   G3 the want rising (from outside, like the craving) and that finding the keys ends it;
//   G4 when several candidates are equally cheap: look first where more kept memories put the keys, then the most
//      recent (the machine must act; the tie rule says it can't decide by evidence alone);
//   G5 when no memory fits any more: look in an unlooked room, in house order (no curiosity mechanism yet).
// DONE BY THE MACHINE (what the results test):
//   M1 the want wakes every kept memory with keys in it (the want is one active thing: the bar is lowered, as in C51);
//   M2 its own looks are held for the episode: a room it looked in is "seen"; every other room stays hidden by default.
//      Nobody marks rooms seen or tells it where it has been;
//   M3 each candidate is priced against what is held: keys claimed in a seen room without keys = a misfit (cost 1);
//      in a hidden room, free; the cheapest candidate is looked at next;
//   M4 when the keys are found the want is satisfied, the hold lets go (the seen rooms are forgotten), and the episode
//      (from the want rising to the keys found) is kept as an experience (C60).
// Controls: NO-HOLD: looks are not held (M2 off: every room hidden again after each look). MARKED: the puppet run: we
// mark every wrong room as seen before it starts (what puppeteering would have "shown").
'use strict';
const { rng } = require('../../../src/worlds/catalogue.js');
const { Experiences } = require('../C56-integrated/engine/experiences.js');
const ROOMS = ['kitchen', 'hallway', 'lounge', 'bedroom', 'garage'], P = [0.5, 0.25, 0.15, 0.08, 0.02];
const KEYS = 9;   // the value for "keys" in a kept picture
const where = (r) => { let u = r(), i = 0; while (u > P[i]) { u -= P[i]; i++; } return Math.min(i, ROOMS.length - 1); };
// a kept episode, as a picture on an 8-wide page: row 0 = rooms looked at (value room+2 at x = room), row 1 = keys
// where they were found
const episodePic = (looked, found) => { const x = new Uint8Array(64); for (const r of looked) x[r] = r + 2; x[8 + found] = KEYS; return x; };

function search(lived, truth, mode) {
  const seen = new Set(); let looks = 0, revisits = 0; const order = [];
  if (mode === 'marked') ROOMS.forEach((_, r) => { if (r !== truth) seen.add(r); });   // the puppet: rooms marked seen by us
  for (let step = 0; step < 50; step++) {
    // M1: every kept memory with keys in it wakes; each claims keys at its room
    const cands = new Map(); let i = 0;
    for (const row of lived.kept.values()) { i++; for (const [x, y, v] of row) if (y === 1 && v === KEYS) { const c = cands.get(x) || { room: x, n: 0, last: 0 }; c.n++; c.last = i; cands.set(x, c); } }
    // M3: price each candidate against what is held: a seen room without keys → misfit 1; hidden → 0
    const priced = [...cands.values()].map((c) => ({ ...c, cost: seen.has(c.room) ? 1 : 0 }));
    const fit = priced.filter((c) => c.cost === 0).sort((a, b) => b.n - a.n || b.last - a.last);   // G4 among equals
    let room;
    if (fit.length) room = fit[0].room; else { const un = ROOMS.map((_, r) => r).filter((r) => !seen.has(r)); room = un.length ? un[0] : 0; }   // G5
    if (order.includes(room)) revisits++;
    order.push(room); looks++;
    if (room === truth) return { looks, revisits, order, found: true };   // G2: the look shows the keys
    if (mode !== 'nohold') seen.add(room);   // M2: the machine's own look is held for the episode
  }
  return { looks, revisits, order, found: false };
}
for (const mode of ['held', 'nohold', 'marked']) {
  const r = rng(61), lived = new Experiences(50); let L = 0, R = 0, F = 0, garage = [], firstGarage = null, kitchenAfterGarage = null;
  for (let day = 1; day <= 300; day++) { const truth = where(r), res = search(lived, truth, mode);
    if (day > 50) { L += res.looks; R += res.revisits; F += res.found ? 1 : 0; }
    if (truth === 4) { garage.push(res.looks); if (firstGarage === null) firstGarage = { day, ...res }; }
    if (firstGarage && kitchenAfterGarage === null && day > firstGarage.day) kitchenAfterGarage = { day, first: ROOMS[res.order[0]] };
    if (res.found) lived.see(episodePic(res.order, truth), 8);   // M4: the episode kept (store of experiences: its own rule)
  }
  console.log(`\n${{ held: 'HELD (the machine holds its own looks for the episode)', nohold: 'NO-HOLD control (looks not held)', marked: 'MARKED control (we mark the wrong rooms seen: puppeteering)' }[mode]}`);
  console.log(`  days 51-300: found ${F}/250 · looks per search ${(L / 250).toFixed(2)} · revisits ${R}`);
  if (firstGarage) console.log(`  first time the keys were in the garage (day ${firstGarage.day}, never there before): looked ${firstGarage.order.map((i) => ROOMS[i]).join(' → ')} (${firstGarage.looks} looks${firstGarage.found ? '' : ', not found'})`);
  if (garage.length > 1) console.log(`  later garage days: looks ${garage.slice(1).join(', ')}`);
  if (kitchenAfterGarage) console.log(`  the next day, first look: ${kitchenAfterGarage.first} (the "no keys" of the garage day was not kept as a ban)`);
}
// what an ideal searcher that knows the odds would average (looks in order of likelihood): for comparison only
let ideal = 0; P.forEach((p, i) => { ideal += p * (i + 1); }); console.log(`\nfor comparison: looking in order of the true odds averages ${ideal.toFixed(2)} looks`);
