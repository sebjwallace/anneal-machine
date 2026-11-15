import { Volume } from '../engine/index.js';

// A run: a sequence of inputs fed to a fresh volume, over and over. Going to a moment replays the inputs up to it on a
// new volume, so going back shows the volume exactly as it was then, with nothing kept beside it.

export class Run {
  #labels;
  #cellsPerColumn;
  #inputs;

  constructor({ labels, cellsPerColumn, inputs }) {
    this.#labels = labels;
    this.#cellsPerColumn = cellsPerColumn;
    this.#inputs = inputs;
  }

  get labels() { return this.#labels; }
  get inputs() { return this.#inputs; }

  input(t) { return this.#inputs[t % this.#inputs.length]; }
  pass(t) { return Math.floor(t / this.#inputs.length) + 1; }

  // The volume after t inputs, and the moment each made.
  at(t) {
    const volume = new Volume({ labels: this.#labels, cellsPerColumn: this.#cellsPerColumn });
    const moments = [];
    for (let i = 0; i < t; i++) moments.push(volume.receive([...this.input(i)]));
    return { volume, moments };
  }
}
