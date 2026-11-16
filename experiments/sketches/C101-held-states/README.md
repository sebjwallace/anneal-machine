# C101 · Held states

No context in cells (decision 009): each letter is the same two cells everywhere; context is what stays held. A new
letter replaces held letters that are its rivals (they have followed the same letters). Without noise, the end of every
episode is predicted exactly, and the hold stays at 4-6 letters however many contexts are known. Noise letters, which
follow everything, become rivals of everything and knock the context out.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- Run: `node run.js`
