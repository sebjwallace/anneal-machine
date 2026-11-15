import { Was } from '../engine/index.js';

// What each segment does, read from what it is connected to: no segment carries a mark.
//   sequence   wired to what cells were a moment ago: it predicts the next moment
//   assembly   wired to cells: it completes the present

export const roleOf = (segment) => (segment.links.some((source) => source instanceof Was) ? 'seq' : 'part');

export const NAME = { seq: 'sequence', part: 'assembly' };

// Where a link comes from: a cell, or a cell as it was.
export const origin = (source) => (source instanceof Was ? source.cell : source);
