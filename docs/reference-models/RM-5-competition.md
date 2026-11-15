# RM-5 · Competition

**For:** choosing among candidates, so that answers are sharp and whole memories win or lose together.
**Serves:**
- CTR-1 CON-7 (don't guess);
- CAP-3;
- CON-19.

## Three places (core)
All three are read from what is active and what it is connected to, locally. No segment carries a label, and nothing
holds or scans a list of memories.

**1. Within a column** (which cell wins, RM-1):
```
a cell whose memory is wholly seen wins                 # every member active, every link in a lit column
    several such: all win, a junction                   # two memories meet here; taking one does not rule out the other
else the most support from the present wins, else the most from the moment before (PRN-5), else a fresh cell
a tie at the top is refused: no winner (CON-7)
```

**2. Between whole memories, in settling** (RM-4):
```
top = the candidates in a round at the top level of support
    # every cell of the best-matching memory reaches the same, highest support, so the memory joins whole
rivals: two top cells in one column, of different memories (neither's firing segment holds a link from the other),
        woken by the same active evidence
rivals do not join (a tie is refused, CON-7); the rest of top joins
```

**3. Between memories built on the same whole** (in counting, RM-2):
```
a segment's evidence = its members that are active and seen        # what was only brought back is not evidence (PRN-5)
if that evidence is a whole of its own                              # each of its cells has a firing segment lying
                                                                    # wholly within it, as the cells of the pair AB do
    every other memory holding all of it is an alternative built on the same whole
    the segment fires only if no alternative has a larger share of its memory active (RM-2)
else                                                                # the evidence is a sample of something larger
    nothing competes: the larger thing completes it                 # (A0 B0 as a handle on ABCD)
two segments are one memory, not alternatives, when either holds a link from the other's cell
on a tie, both fire
```
This is how a part shared by two wholes brings back the right one. After the house (ABCD) and the shed (ABEF) are cut so
that AB is shared (RM-8), seeing ABCD brings back nothing more, seeing ABEF nothing more, seeing ABC only D (3 of 4
against 2 of 4), and seeing AB alone both wholes: the tie is held, as the wall brought back both roofs in C78 (RM-10).

**Why "a whole of its own".** Two memories that draw on the same seen cells are rivals only if those cells are a whole
both are built on (AB, with CD or with EF). If they are a sample of a part (A0 B0, a handle on ABCD, tied into the Z),
the part is not a rival of the whole above it: it is what the whole stands on. Read without this, every part that is
itself a whole silences the wholes it belongs to, and the members of a large sampled assembly, which do not all link
each other, silence one another (0 of 200 seeds came back whole, against 200 of 200).

## When it helps, and when it can't
- **It is needed where a part is genuinely shared.** The wall shared by a house and a shed wakes both; competition picks
  the right one (C78: the other roof came back in 0-4%).
- **It cannot fix chance overlap.** When cells are reused by chance, an intruding memory gets the same support as a true
  one. Only more cells per column fixes that (C77).
- **It replaces caps given by hand.** In C73 an answer was capped at 8 columns; with the top level instead, answers sized
  themselves (C74: 7.6 cells).

## Rules a rebuild must keep
- **No number chooses how many winners:** the top level does.
- **A tie between rivals that exclude each other is refused, not broken by order.** Rivals that can both be right (two
  memories meeting in one column, each wholly seen or each woken by its own evidence) are not a tie.
- **No labels.** Which memories compete is read from topology: what is seen, and what holds what.

## Evidence
C73, C74, C77, C78. The core (15 November 2026): every case above, in `src/test/`; junctions in the Z (D0 and D1, M0 and
M1, both win, and any part brings back the whole Z); the label-free rule against the labelled one (removing the labels
with the old rival test gave 0 of 200 large assemblies back whole and broke the Z; the whole-of-its-own rule gives 200 of
200 and the Z whole).

## Open
- **The level of support in settling is global,** one number over all candidates. Whether it can be local is open.
- **Which part wakes a whole above it depends on its handle** (RM-7). A part that is exactly a whole of its own brings
  back only that whole when its own alternatives are wholly seen; whether it should also bring back the larger wholes it
  belongs to is open.
