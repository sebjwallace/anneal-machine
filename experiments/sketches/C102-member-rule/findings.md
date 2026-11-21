# C102 · The member rule: in order or by occurrence

Branch `experiment/members-by-occurrence`. Run in the AMP interpreter (`amp`), refractory period on, with the member
rule as a setting: `members in order` (each new assembly takes its populations' next members; the rule on `main`) or
`members by occurrence` (the k-th appearance of a population in an assembly is its k-th member, so a letter is the
same member in every word).

## The question

Words that share letters ("thedog", "thecat", "themouse", "thebird") each got their own members for "t", "h", "e", so
the shared part "the" existed as four separate copies. Abstracting "the" then meant merging copies, which would need
rewiring assemblies (forbidden: assemblies are immutable) or forming beside them. The owner's test for any method: the
new abstraction must be able to grow structure and come to dominate what it was abstracted from. Would members by
occurrence, which shares "the" from the start, do better?

## Predictions and results

| | Prediction (written before running) | Result |
|---|---|---|
| P1 | By occurrence, every word's "t", "h", "e" are `t{1}, h{1}, e{1}`; repeats take `t{2}`, `e{2}` | **Holds.** |
| P2 | With the old rivalry rule ("share a population but not its member"), "t, h, e" opens all four chains out of `e{1}` with nothing competing | **Holds,** and more: words **splice into each other** through shared letters. "thebird" ends on `d{1}`, which is also "thedog"'s, so "thedog"'s chain runs on: `d -> o -> g`. |
| P3 | With competition by order, the four next letters after "the" tie and nothing is recalled | **Holds.** ("thecat" is favoured from the first letter: two "t"s, both lit by an unexpected "t".) |
| P4 | Competition by order can't stop the splicing: a step with no rival at that moment opens | **Holds,** and worse than expected: "thebird" runs into "og", then through `o{1}` into "themouse"'s "use". |

**A fix tried and dropped:** a chain step needing the two steps before it (both counted, as gates see two moments).
It stopped single-letter splicing, but needs the refractory period on (off, gates see one moment and chains stop after
their second member), and it doesn't stop a shared pair: "redo" by occurrence is `r{1} e{1} d{1} o{1}`, so after
"e, d" the step `o -> g` of "thedog" still opens ("redog"). Each longer overlap needs a longer reach back.

## What else the runs showed (members in order)

- **The old rivalry rule missed wholes composed from a shared part.** "thedog" and "thecat", both composed with "the",
  share its members, so weren't rivals, and "the" brought back both.
- **Competition by order** (rivals bring on alternatives: members of different populations following, or leading into,
  the same population) fixes it: after "the", "dog" and "cat" tie and are held; reading "d" settles it for "thedog".
- **A rival could lose to one that itself lost** ("dog"'s chain lost to "thecat"'s chain, which had lost to
  "thedog"). Working down from the most support, beaten only by an unbeaten rival, fixes it.
- **Two versions of one word no longer jam.** Under the old rule, an old flat "thecat" and a new one composed from
  "the" were rivals (same populations, different members) and tied on every input. By order they aren't rivals.
- **The composed version wins without a contest.** Reading "t, h, e, c", the version built from parts completes and
  holds (4 of 4); the flat one can't (at most 3 of 6), because a state of more than three can't be completed by its
  own chain. Structure from parts is what lets the new version take over: no merge, no rewiring.

## What it means

- **Members by occurrence is rejected.** A chain step only knows the letter before it, so words sharing letters splice
  into one another, and stopping that needs an ever-longer reach back. Members in order never splice, because each
  word's chain runs through its own members: context held in members, but per word, so identity is kept through
  composition (shared parts are composed explicitly) rather than lost, which is what decision 009 objected to.
- **Competition by order is adopted** (commit `1064235` on `main`).
- **Abstraction needs no merge.** Form the shared part beside, compose words from it, and leave the old words alone;
  the composed versions are the ones that complete and hold, and nothing old needs refactoring (immutability,
  structure over strength).

## Still open

- **Support doesn't count ways in.** If dominance ever comes down to a contest, support should include how many ways in
  an assembly has (structure over strength), not only counted minus missing.
- **Repeats favour a word from its first letter** (an unexpected "t" lights both of "thecat"'s "t"s).
- **Picking out part of a whole** (`ca = <cat{c, a}>`), so a word's own remaining part can be composed with a shared
  part, isn't built yet.

## Given by hand (declared)

The words and their populations; the member rule (a setting); the refractory period on.
