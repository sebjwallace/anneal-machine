# C118 · Heat and energy: hypothesis

Written before running. Follows [C114](../C114-differentiation/) and [C117](../C117-no-full-stops/).

## The question

C114's learning (differentiation: compare wholes, form the shared run and what varies) has two gaps against the
project's own principles. The owner asked to improve the mechanism itself, with no new mechanism (no context, no
support) to cover its holes.

- **No heat.** Every arriving whole is compared and split, even where what is held already explains it. The language
  says heat is what invoke can't complete, and that forming cools a gap. Annealing works where there is heat.
- **No energy rule.** Every split is kept. The contract (CON-1) says a change to structure is kept only if energy
  falls.

Under C117's strict scoring, about half of C114's pieces have both edges at real word boundaries. The errors are of
known kinds: seam slips (`tthing`), scraps from wholes cut mid-word (`fthe`, `eking`), and fragments of varying parts.
**Do heat and the energy rule, together or apart, make the pieces cleaner?**

## The mechanism

C117's learning and strict scoring, without spaces, with the cheapest reading only (no support reading). Two
switches:

- **heat**: an arriving whole is first read with what is held. Only its **hot stretches** (runs of two or more letters
  that no piece explains, read as loose letters) are compared and split. A hot stretch is stored as raw experience
  (forming over the gap, as the language says), instead of the whole. Without heat, the whole is compared and stored,
  as in C114.
- **energy**: a piece derived by a comparison (the shared run, or a part that varies) is kept only if it lowers
  energy. It pays if spelling it out in every held piece that contains it, and in the whole, would cost more than
  storing it once and pointing to it: k · (b − use) > b, with b its length in letters, use the cost of a pointer
  (C108's price at N 16384), and k the number of places it occurs (held pieces containing it, plus the whole). That
  is counting from the structure. Without energy, every derived piece is kept, as in C114.

**Raw experience is always kept** (wholes, or hot stretches with heat on): otherwise an empty memory would never
store anything and could never start. It is the material comparisons work on, like episodes. The energy rule judges
only what comparison derives. That is a given, stated here.

Four runs per text: neither (C114/C117 as they were), heat, energy, both. Texts: *Buster Brown* and *Alice*, no spaces,
cut into sentences and into fixed stretches of 60 letters. N 16384.

## Measures

C117's strict ones (clean share, coverage, words whole, cuts at a word boundary), plus pieces held, plus heat over the
run: the share of letters read loose (hot), per tenth of the book.

## Predictions

1. **heat**: far fewer comparisons and pieces. About the same clean share. Hot letters fall over the run (it cools).
2. **energy**: seam slips and scraps are rarely repeated, so they don't pay, and the clean share rises (from about 50%
   to 60% or more). Coverage falls somewhat, since fewer pieces are kept.
3. **both**: the cleanest, with the fewest pieces.
4. The gains hold for fixed cuts as well as sentences.

## Success and failure

- **Success:** "both" has a clean share at least 10 points above "neither", on both books, for sentences and fixed
  cuts, without coverage falling by half or more.
- **Failure:** no clear gain in clean share, or a gain bought only by reading far less of the text.
