# C105 · How a winner holds through a burst: findings

Branch `experiment/c105-winner-holds` (off `l1a-reading`). Code: the switches `Hold`, `Window` and
`BurstUpPickedOnly` in `amp/engine/gate.go` and `read.go`; runner `amp/cmd/c105` (`go run ./cmd/c105`, or
`go run ./cmd/c105 <seed>` for one seed in detail). Rules, test bed and predictions, written before running:
`hypothesis.md`. Output: `out.txt`.

Training cast the three assemblies expected: `#1 the_cat_meow`, `#2 the_`, `#3 the_dog_bark`.

## Result

No rule holds and changes reliably. Over seeds 1–10 (the seed decides which members are picked):

| rule | burst projects up | A1 noise | A2 noise | A3 change | A4 order | all four | B takeovers (weak) |
|---|---|---|---|---|---|---|---|
| clear (committed) | every member | 0 | 10 | 0 | 0 | 0 | 141 (95) |
| keep | every member | 0 | 0 | 0 | 0 | 0 | 30 (0) |
| keep+ | every member | 0 | 0 | 0 | 0 | 0 | 322 (0) |
| window 4 | every member | 0 | 10 | 10 | 9 | 0 | 212 (42) |
| window 8 | every member | 0 | 10 | 10 | 0 | 0 | 138 (0) |
| clear | picked only | 3 | 10 | 9 | 0 | 0 | 89 (63) |
| keep | picked only | 0 | 0 | 0 | 3 | 0 | 46 (10) |
| keep+ | picked only | 0 | 3 | 9 | 7 | 0 | 234 (10) |
| **window 4** | **picked only** | 3 | 10 | 10 | 9 | **2** | 196 (81) |
| window 8 | picked only | 3 | 10 | 10 | 0 | 0 | 119 (24) |

The best is window 4 with bursts projecting up only the member picked: it passes everything but A1 almost always, and
all four in 2 seeds of 10. Seed 1, the detailed run in `out.txt`, happens to be one of the two.

It comes down to two separate problems, neither of them the hold rule as such:

1. **Short assemblies can't be beaten.** The score is how much of an assembly is confirmed, so after "the ", `the_` is
   fully confirmed (4/4 = 1). A phrase can at best tie it, and a tie keeps the winner. That is why clear fails A3 and
   A4 every time: there is no burst inside a phrase the memory knows, so nothing clears `the_`'s score. Keep makes it
   permanent (`the_` wins everything). A window lets `the_`'s confirmations run out, so the phrase can overtake it:
   window 4 passes A3 and A4. Window 8 is too long for A4 ("meow the cat" ends while `the_` is still fully
   confirmed).
2. **Noise that continues something learned.** In every A1 failure, the dog phrase wins at the space after
   "purring". "Purring" ends in g; the g bursts, which turns on every g member in L1A, including dog's; dog's g primes
   the space that followed "dog"; so the space arrives primed, from the dog's context, and projects up into the dog
   phrase. The hold rule isn't what fails: L1A hands L1B the dog's context. Where it passes, the space member reached
   other assemblies too and the scores fell otherwise.

**Projecting up only the member picked at a burst** is what lets noise go by: a member picked at a burst is new and
projects up to nothing, so a burst confirms nothing in L1B, and the winner holds (A1 0 → 3 of 10). It does not cut
weak takeovers on ordinary sentences, except under clear.

## Predictions

| | Held? |
|---|---|
| P1 | Partly. Clear fails A1 (0/10) as predicted, but passes A2 (10/10: o is in both phrases, so it ties and nothing changes), and fails A3 and A4 (0/10), for reason 1 above, which I didn't foresee. |
| P2 | Yes: keep locks in `the_`. |
| P3 | Yes for A1 and A2 (keep+ ends on `the_`). With picked only it passes A3 (9/10) and A4 (7/10). |
| P4 | No. Window 8 doesn't hold through noise any better than window 4 (both 0/10, or 3/10 with picked only), and it fails A4. Both do make A3 change. |
| P5 | No. Picked only cuts weak takeovers only under clear (95 → 63); under the others it raises them. It does help holding through noise. |
| P6 | Mostly: the best rule passes all four in 2 seeds of 10. |

## Open

- **Short assemblies inside long ones** (problem 1). `the_` is part of `the_cat_meow`. Scoring by how many members are
  confirmed rather than how much would reverse the bias towards long assemblies instead. Or assemblies nested like
  these might cooperate rather than compete: the owner's suspicion that assemblies can cooperate.
- **Context leaking through a burst** (problem 2). This is in L1A: after a burst, the next character can be primed
  by a member that was only on because the burst turned everything on, and it brings that member's context with it.
  C103 met the same thing in another form.
- Takeovers on ordinary sentences stay high under every rule that passes A3 (138–212): the winner changes often.
