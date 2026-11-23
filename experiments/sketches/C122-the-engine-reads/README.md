# C122 · The engine reads

A JavaScript copy of the AMP engine (`engine.js`), checked against the Go engine on `main` (`check/check.sh`: eleven
scenarios, the same 1,113 lines of output, moment by moment). It is used to run C118's learning (heat, energy, raw
experience) with the engine's own parts: invoke reads, anneal compares. With words declared by hand, invoke reads
perfectly. With a learnt memory, reading breaks into two- and three-letter fragments at chance, and gets worse as
memory grows. There are two causes:

- **Crosstalk.** At 8 members per letter, each member is shared by over 200 assemblies, so every moment is one big
  competition.
- **Support** (counted minus missing) favours short transitions. Two- and three-letter transitions win 25 to 41% of
  their competitions, six letters and up 2 to 5%. So reading never gets far into a long one.

The sketches' good results relied partly on reading a whole sentence at once. How support is counted for transitions
is the engine's rule, and the open question for the owner.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out-150.txt](out-150.txt) · [out.txt](out.txt) ·
  [out-diagnose.txt](out-diagnose.txt)
- `engine.js` (the copy, departures listed at the top) · `check/` (scenarios, the Go and JavaScript runners,
  `check.sh`) · `reads.js` (the experiment) · `diagnose.js` (why it breaks down). Plain JavaScript, no dependencies;
  the check needs Go. The books: `gutenberg.zip` from `github.com/nltk/nltk_data` (`packages/corpora`), unzipped.
  Run: `LIMIT=150 node reads.js <folder> burgess-busterbrown.txt 256`.
