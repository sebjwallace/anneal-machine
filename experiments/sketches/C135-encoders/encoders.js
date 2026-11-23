// C135 · Encoders: the bridge from the outside world into the engine.
//
// An encoder turns a signal from outside into what the engine receives: it declares the populations it feeds, and it
// cuts the signal into buffers, each a sequence of population names that the engine reads whole. There will be many
// encoders, for many kinds of signal (text, sensors, pieces of images) and, for one kind of signal, many ways of
// cutting it, depending on the use (the owner's). Which one is used is a choice at the boundary, declared, like a
// sensor's sampling rate: architecture, not learning.
//
// The rule an encoder keeps: it may shape the signal into buffers, but it never hands over the structure the engine
// is there to discover. For text that means cutting at sentences, paragraphs or fixed lengths is allowed, and cutting
// at spaces is not: that would hand over the words.
//
// Each encoder gives { name, populations, encode(raw) }, where encode returns the buffers in order. A buffer is given
// as the words it contains, but only for measuring afterwards: the engine receives the letters run together, with no
// spaces and no word boundaries. A buffer cut through a word holds the two parts of it as two words.

'use strict';

const LETTERS = [...'abcdefghijklmnopqrstuvwxyz'];

// the text as lowercase words of letters a to z; anything else is dropped (the letters are the populations this
// encoder feeds; capitals, digits and punctuation would be populations of their own in a richer encoder)
const words = (text) => text.toLowerCase().replace(/[^a-z]+/g, ' ').trim().split(' ').filter(Boolean);

// a buffer for each sentence, cut at . ! ? ; :
const sentences = {
  name: 'sentences',
  describe: 'a buffer for each sentence (cut at . ! ? ; :)',
  populations: LETTERS,
  encode: (raw) => raw.split(/[.!?;:]+/).map(words).filter((w) => w.length),
};

// a buffer for each paragraph, cut at a blank line
const paragraphs = {
  name: 'paragraphs',
  describe: 'a buffer for each paragraph (cut at a blank line)',
  populations: LETTERS,
  encode: (raw) => raw.split(/\r?\n\s*\r?\n/).map(words).filter((w) => w.length),
};

// a buffer every n letters, cut wherever it falls, through words as often as not
const windows = (n) => ({
  name: `windows of ${n}`,
  describe: `a buffer every ${n} letters, cut wherever it falls`,
  populations: LETTERS,
  encode: (raw) => {
    const out = [];
    let buffer = [], length = 0;
    for (let w of words(raw)) {
      while (length + w.length > n) {
        const take = n - length;
        if (take > 0) buffer.push(w.slice(0, take));
        out.push(buffer);
        buffer = [];
        length = 0;
        w = w.slice(take);
      }
      if (w) { buffer.push(w); length += w.length; }
    }
    if (buffer.length) out.push(buffer);
    return out;
  },
});

module.exports = { sentences, paragraphs, windows, ENCODERS: { sentences, paragraphs, windows60: windows(60) } };
