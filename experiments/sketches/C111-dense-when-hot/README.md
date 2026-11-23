# C111 · Dense when hot

C110 with dense reading: every piece that fits is met, overlapping, and every two met pieces side by side make a
tentative pair. It failed. Judged each on its own sightings, every shift of a frequent phrase pays equally (`the_d`,
`_the_d`, `he_d`, `e_do` …), so the population fills with near-copies. Frequency can't choose where to cut. Only
competition for the same letters can, where one rival takes them and the others get nothing there. "Dense only where
hot" cuts the churn but not the duplicates. What's missing is competition among tentative rivals. How they should
compete (a tentative piece doesn't pay yet, so "cheapest" can't pick it) is left for the owner to decide.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- `dense.js`, plain JavaScript, no dependencies. Run: `node dense.js`.
