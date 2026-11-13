// C56 · THE STORE OF EXPERIENCES (C46, C47): its own rule, not energy. Every picture is kept the moment it is seen; seen
// again, it is refreshed; when the store is full, the one not seen for longest fades. CAP is a chosen number (declared).
// need (C58): how many times a step must have been lived to be trusted (1 = once, as before; 2 = twice: two
// experiences, like the recall rule's two clues). check(route): a route of items (along x) is trusted when every step in it was lived: some kept picture holds those
// two items next to each other, in that order (the recall rule: two items inside one memory). A step nobody took is a misfit.
'use strict';
class Experiences {
  constructor(cap = 50) { this.cap = cap; this.kept = new Map(); }
  // C58: each kept experience also counts how many times it was lived (seen again = counted again, and refreshed)
  see(x, W) { const row = []; for (let i = 0; i < x.length; i++) if (x[i]) row.push([i % W, Math.floor(i / W), x[i]]); const k = row.map((p) => p.join(',')).join(';'); const was = this.kept.get(k); this.kept.delete(k); this.kept.set(k, row); row.times = (was ? was.times : 0) + 1; if (this.kept.size > this.cap) this.kept.delete(this.kept.keys().next().value); }
  // how many times the step a → b was lived, across everything kept
  times(a, b) { let n = 0; for (const row of this.kept.values()) for (const [x, y, v] of row) if (v === a && row.some(([x2, y2, v2]) => v2 === b && y2 === y && x2 === x + 1)) n += row.times || 1; return n; }
  lived(a, b) { return this.times(a, b) >= (this.need || 1); }
  pictures(W) { return [...this.kept.values()].map((row) => { const x = new Uint8Array(W * W); for (const [a, b, v] of row) x[b * W + a] = v; return x; }); }
  check(route) { const bad = []; for (let i = 1; i < route.length; i++) if (!this.lived(route[i - 1], route[i])) bad.push([route[i - 1], route[i]]); return { trusted: !bad.length, misfits: bad }; }
}
module.exports = { Experiences };
