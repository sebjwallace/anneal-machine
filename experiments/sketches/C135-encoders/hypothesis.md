# C135 · Encoders: hypothesis

Distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), step 7, V9 (sentences cut at full stops) and
V10 (the text prepared).

## The owner's framing

What comes into the engine won't always be language: it may be sensor readings, pieces of images, anything. So there
will be many **encoders**, each turning one kind of signal into what the engine receives, and for one kind of signal
there may be many ways of cutting it into **buffers**, depending on the use: sentences, paragraphs or something else
for text. The encoder is the bridge from the outside world into the engine.

## What that means for D-03

Cutting the text at full stops, and keeping only the letters a to z, were listed as given by hand (V9, V10). Seen this
way they are the encoder's choices: made at the boundary, declared, like a sensor's sampling rate, and not part of the
learning. That holds on one condition, which every encoder keeps: **an encoder may shape the signal into buffers, but
never hands over the structure the engine is there to discover.** For text, cutting at sentences, paragraphs or fixed
lengths is allowed. Cutting at spaces is not, because that would hand over the words.

## The change

The experiment's text handling becomes an encoder module (`encoders.js`). Each encoder declares the populations it
feeds and cuts the signal into buffers. Three text encoders: a buffer per sentence, a buffer per paragraph, and a
buffer every 60 letters cut wherever it falls. The learning (C134's) declares whatever populations the encoder gives
and reads its buffers. It knows nothing else about the encoder.

## Prediction

The learning doesn't depend on the encoder. Sentences and paragraphs within 3% of each other on neutral energy over the
whole book. Windows a few percent worse, since they cut through words and the learning has to work round that, as in
C117.
