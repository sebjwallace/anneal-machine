# C40 · The park map shrunk right down (owner's version)

C39 was slow (3–9 minutes a run) partly because each place was a 3 × 3 view. Here an 8 × 8 page is the space: places on
every other pixel (4 × 4), the pixel between two places lit when that link is walked. Bench top-left, oak bottom-right.
A day is 2–3 walks drawn together; no walk holds both, no day joins them. Shown only the two end pixels, does the engine
fill in a chain joining them? Many seeds, so we get a rate, not two out of three.

Run: `SEEDS=20 DAYS=20,40 node tiny.js`.
