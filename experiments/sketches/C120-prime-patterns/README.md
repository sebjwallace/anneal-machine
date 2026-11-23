# C120 · Prime patterns

After learning a book as C118 does, a rest phase tries splitting every held pattern and keeps a new part only if it
makes memory cheaper. Each pattern is then stored as its cheapest composition, or flat if that is cheaper: then it is
**prime** (no split lowers energy). Scored by energy: memory plus the cost of describing the unseen last tenth. Rest
lowers energy modestly (2.5 to 3% at the cheapest link price, almost nothing at the dearest). What is prime depends on
the price of a link. At 4 letters `hatter` is prime; at 2.3, `hatter` = `h` + `atter`. At the cheapest price the primes
are a small alphabet of short words and endings (`the`, `and`, `she`, `ing`, `ness`, `jury`), and composites are built
from them (`whiterabbit` = `[white][rabbit]`, `nothing` = `no[thing]`). Many compositions just peel off a free letter.
The first version of rest counted savings many times over and is kept as a record (`out-batch-rest.txt`).

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt) · [out-batch-rest.txt](out-batch-rest.txt)
- `prime.js`, plain JavaScript, no dependencies (learning is C118's `heat.js`). Needs `gutenberg.zip` from
  `github.com/nltk/nltk_data` (`packages/corpora`), unzipped. Run: `node prime.js <folder>`.
