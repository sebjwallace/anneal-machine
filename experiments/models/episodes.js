// COLUMNS FOR THE COMMON, EPISODES FOR THE SPECIFIC (C04, arm X1). Built on compress.js (C03's best: economy and pay its
// way). After the columns have explained what they can, the leftover is offered to EPISODES: exact snapshots of whole
// flashes, found by fit as in the core (shared / (episode size + cue pixels it lacks)), used only above FLOOR. The best episode
// explains the leftover pixels it holds. What is still left (2+ pixels) is a SURPRISE: the flash is stored as a new episode,
// and the leftover is offered as a candidate column. A pattern's own repeats are caught by its episode, so only a leftover
// that recurs across DIFFERENT patterns becomes a column: columns for the common, episodes for the specific.
// Needs compress.js loaded first (Node: required; browser: inlined before this file).
'use strict';
const EPBase = typeof Model !== 'undefined' ? Model : require('./compress.js').Model;
const FLOOR = 0.55;    // STAND-IN (the core's, doc 16): an episode counts only if its fit clears this
const EP_MIN = 2;      // a surprise must leave at least two pixels (as MIN_PART: one pixel alone is noise-sized)
function popc(v) { v = v - ((v >>> 1) & 0x55555555); v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return (((v + (v >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; }
function maskOf(x) { let v = 0; for (let i = 0; i < 25; i++) if (x[i]) v |= 1 << i; return v; }
const EP_ARMS = { X1: { label: 'X1: columns for the common, episodes for the specific' }, GEP: { label: 'GEP: columns only (C03 best, for comparison)' } };

class EpisodicModel extends EPBase {
  constructor(arm = 'X1', opt = {}) { super('GEP', opt); this.arm = arm; this.useEps = arm === 'X1'; this.eps = []; this.st.episodes = 0; }
  // the best-fitting episode catches the leftover pixels it holds; a surprise is stored (when learning)
  episodic(x, r, learn) {
    if (!this.useEps) return null;
    const xm = maskOf(x), nx = popc(xm); let best = 0, bf = 0;
    for (const e of this.eps) { const f = popc(e & xm) / (popc(e) + popc(xm & ~e)); if (f > bf) { bf = f; best = e; } }
    const ep = bf >= FLOOR ? best : 0, left = [];
    for (const i of r.left) { if (ep & (1 << i)) r.owner[i] = -2; else left.push(i); }
    let stored = false; if (learn && left.length >= EP_MIN && nx) { this.eps.push(xm); this.st.episodes++; stored = true; }
    return { left, episode: ep, fit: bf, stored };
  }
}
if (typeof module !== 'undefined') module.exports = { EpisodicModel, EP_ARMS, FLOOR };
