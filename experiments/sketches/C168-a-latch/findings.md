# C168 · A latch: findings

Run: `node latch.js > out.txt`, about twenty seconds. Read [the hypothesis](hypothesis.md) first. Engine: C167's copy,
unchanged. Everything by hand.

## In short

**The latch works: a procedure's start place now lasts only as long as the procedure.** Two sums run straight on in
one memory, with nothing reset between them. With the start place held as a latch, the second sum's jump went only to
its own start, and both sums were worked and copied right, in **all 100 pairs**. With the start place bound as a bond
(as C167), the second jump went to both starts in all 100, and the second copy came out right in only 6, by coincidence.

**And it's letting go that makes the latch work.** With the latch but no letting go, the first procedure was still held
when the second cue came, so its start marker was still on, and the second jump brought on both places, just like the
bond. Again 6 of 100. So a latch is only temporary because the thing it's tied to ends.

**Nothing new is formed per sum.** The latch is held activity on wiring that's the same for every place and set up in
advance. That fits "nothing breaks": what's temporary is activity, not structure. It's also what the owner's procedures
note says latches became, a held register.

**Single sums are unchanged:** 200 of 200 worked, copied, jumped home and went quiet.

## Results

| arm (100 pairs, or 200 single sums) | first sum right | second jump: own start only / more than one place | second sum right | how the second run ended |
|---|---|---|---|---|
| bond, two sums | 100 | 0 / 100 | 6 | went quiet |
| **latch, two sums** | 100 | **100 / 0** | **100** | went quiet |
| latch, two sums, no letting go | 100 | 0 / 100 | 6 | procedure still held |
| latch, one sum | 200 of 200 worked, copied and jumped to its own start | | | went quiet, 200 of 200 |

In the latch arm the last recorded moment still shows the second sum's start marker. That's the moment the procedure
lets go: the marker had been renewed by the procedure one moment earlier, and with the procedure gone it isn't renewed
again, so the memory then goes quiet. The first pair, 385 + 708 then 113 + 730: with the bond the second copy came out
0043, and with the latch it came out 0843, the right answer.

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | bond: the second sum fails nearly always | **Holds:** right in 6 of 100. |
| 2 | latch: both sums right in every pair; the second jump only to its own start | **Holds:** 100 of 100. |
| 3 | latch, no letting go: the second jump to both, the second sum fails nearly always | **Holds:** 6 of 100. |
| 4 | latch, one sum: 200 of 200 | **Holds.** |

## The ledger

**Given:** as C167, with the bond for the start place replaced by the latch (start markers wired the same for every
place, in advance, held while the procedure is held: architecture), and with two sums run straight on with no reset
between them (removing the reset C167 used). **The engine:** everything after each cue. **Disclosed:** the first run's
last column reported what was on in the last recorded moment as "still on at the end", which made the latch arm look
as if a marker lingered. It was relabelled to say how the run ended (it went quiet) alongside that moment. No other
change.

## What it shows

Bonds and latches are both needed, and now both exist: the wiring (lasting) and the held marker (temporary, tied to
the procedure that made it). A procedure can start somewhere, hand over, jump back to its start, finish, let go, and
leave nothing behind, so that the next one starts clean, all inside the memory, though all by hand.

## What it suggests next

Theory note §9, step 3: **put the pieces together by hand for a two-pass procedure.** For long multiplication, a first
row, a jump to where the second row starts, the second row, and letting go, with the start of the second row picked
out by a latch rather than by the experiment moving the focus. That would remove the restart crutch from C163. Learning
any of it comes after.
