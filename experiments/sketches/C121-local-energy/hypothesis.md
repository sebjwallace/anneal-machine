# C121 · Local energy: hypothesis

Written before running. Follows [C118](../C118-heat-and-energy/) and [C120](../C120-prime-patterns/).

## The question

The owner's principle from an earlier, unrecorded experiment: typos, slang and other variants are valid because they
exist in the world. They shouldn't be filtered out or averaged away. They should be learnt and used, and they are valid
in their own context.

In C118 to C120, every judgement is made against the whole of memory. A pattern pays if
k · (b − link) > b, where k counts the places it occurs across **all** held patterns, and the link costs
1 + log2(N) / log2(alphabet), set by the size of **all** memory (about 4 letters at N 16384). So a minority register is
judged at prices set by the majority. Its patterns are rarer overall, so they struggle to pay. And at a link of 4
letters, no pattern of 4 letters or fewer can ever pay, whatever its register (b − link ≤ 0). Raw experience is always
kept, so nothing is forgotten. But the minority rarely becomes reusable structure.

**Local energy**: judge a candidate against its own neighbourhood instead of all of memory. The neighbourhood is drawn
by the comparisons themselves, not by hand: the held patterns that share material (a three-letter run) with the whole
being learnt from. There, k counts the neighbourhood patterns containing the candidate (plus the whole), and the link
costs 1 + log2(n) / log2(alphabet), with n the size of the neighbourhood: naming a part among what usually appears
nearby, not among everything. This changes the energy accounting only. Choosing between variants in reading (context,
support) is left aside, as the owner asked.

## The texts

A majority register with a minority stretch inside it:

- **majority**: *Buster Brown* (a children's story), sentences 1 to 900;
- **minority**: the King James Bible, its first 250 sentences (the opening of Genesis), inserted as one stretch after
  Buster Brown's 400th sentence. Its register is archaic: `thee`, `thou`, `hath`, `unto`, `saith`, `shall`, `lord`.
- **unseen**: *Buster Brown* sentences 901 on, and the King James sentences 251 to 400, read after learning, never
  learnt from.

No spaces. Cut at sentence ends (the King James text's verse numbers are removed with all other non-letters).

## The runs

C118's "both" (heat, energy, experience read), with the energy rule **global** (as it was) or **local**. Reading (and so
heat) uses the global price in both, so that only learning differs. N 16384.

## Measures

For each register's unseen part: coverage, the strict clean share, and the cost of describing it per letter (cheapest
description, global price). For memory: patterns held; patterns found only in the minority stretch's text (in no
Buster Brown sentence); and which archaic marker words are held as patterns or inside one: `thee`, `thou`, `hath`,
`unto`, `saith`, `shall`, `lord`, `said`, `god`, `waters`, `earth`, `begat`.

## Predictions

1. **Global**: few minority-only patterns. None of the 4-letter markers (`thee`, `thou`, `hath`, `unto`, `lord`) can be
   held as patterns of their own. They only survive inside longer patterns.
2. **Local**: clearly more minority-only patterns, and short markers held as patterns. The link is cheaper in a
   neighbourhood of a few hundred, so short patterns can pay.
3. **The risk**: local also lets short patterns pay in the majority, which may bring scraps back (C107). Buster Brown's
   unseen clean share may fall.
4. Because reading uses the global price, short patterns, however well learnt, aren't read with, so coverage of the
   unseen minority rises less than the patterns held do.

## Success and failure

- **Success:** local holds clearly more minority-only patterns (at least half as many again) and the short markers,
  while Buster Brown's unseen clean share falls by no more than about 5 points.
- **Failure:** no clear gain for the minority, or the gain comes with scraps flooding the majority.
