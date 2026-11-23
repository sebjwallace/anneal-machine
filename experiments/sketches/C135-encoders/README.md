# C135 · Encoders

Distillation D-03, step 7. The owner's framing: an encoder is the bridge from the outside world into the engine. It
declares the populations it feeds and cuts its signal into buffers, and there will be many, for many kinds of signal and
many uses. Cutting text at full stops is therefore the encoder's choice, declared at the boundary, not something given
by hand inside the learning. The one rule: an encoder may shape the signal but never hands over the structure the engine
is to discover (no cutting at spaces). Three text encoders (sentences, paragraphs, windows of 60 letters) feed the same
learning. Sentences and paragraphs come within 1% of each other on neutral energy, and windows cutting through words
cost about 5% more. Sentences stay the default for language.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `encoders.js` (the encoders) · `engine.js` (as C134) · `check/` · `learn.js`. Needs `gutenberg.zip` from
  `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run: `node learn.js <folder> carroll-alice.txt all 8`.
