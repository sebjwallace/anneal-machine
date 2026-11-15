# C83 · Hardening by repetition

C82's copy of the core with one more change: a whole wholly seen again, made of parts, is tied again from them, so a bond
seen many times is backed by more segments than loosening takes in one go. Hypothesis, predictions, findings:
[hypothesis.md](hypothesis.md), [PREREG.txt](PREREG.txt), [findings.md](findings.md).

**Run:** `node run.js` (about a second; `SEEDS=1` is the development seed). The core's tests on this copy:
`ARM=core|loosen|harden node --test test/volume.test.js`.

**In short:** a bond seen once breaks at the first clash, and one seen four or more times survives it. So "ABCD" seen
twice or more survives "ABEF", and "ABC" still brings back "D". But a bond that survives the first clash is never heated
again, because the new whole wins by share, so the old value and the new one are both kept from then on. And every
repetition costs segments.
