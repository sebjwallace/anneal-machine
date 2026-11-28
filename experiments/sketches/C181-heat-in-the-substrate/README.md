# C181 · Heat in the substrate

Heat as energy on the substrate's cells, moved by four general rules: blame and unfilled places as sources; spreading,
half kept and half shared with neighbours; the warmest alternative above a fixed bar taking over and spending its heat;
draining when more cools. No list of changes, no tried marks, no ranking. It churned. Several parts took over at once,
parts with few neighbours (the move) flipped first, heat piled up on the parts in place, and parts doing their job got
no stronger. Nothing settled, and both lessons failed (0 of 200). What it shows is what the energy rules must also hold:
one change at a time, heat independent of how many neighbours a part has, a bar grown by the work a part does, and
pulling only what's to blame. One fix after the first run, disclosed.

- [hypothesis.md](hypothesis.md) (written before the run, with the fix appended) · [findings.md](findings.md) ·
  [out.txt](out.txt) · [out-first-run.txt](out-first-run.txt) · [diag.txt](diag.txt)
- `heat.js` (C180's with the new arm, `energyRule`) · as C180 otherwise.
- Run: `node heat.js > out.txt` (about twenty-five minutes); `DIAG=1 node heat.js` for the trace.
