# C93 · Brought back competes: findings

Run: `node run.js` (`out.txt`). Engine: `engine/`, a copy of C92's, with three changes, each an option, all marked
"C93 sketch". The core's own tests are copied into `test/` and run against every combination:
`C93_WARM=1 C93_BROUGHT=1 C93_PERWHOLE=1 node --test test/volume.test.js` (each `0` or `1`).

## What changed, and why each was needed

The hypothesis named one change. The core's tests showed it wasn't enough on its own, and each failure pointed to the
next. They turned out to be one problem in three places.

1. **Brought back counts as evidence in competition** (`brought`, in `tally.js`). The change in the hypothesis. On its
   own it broke one core test (14): after "AB", "CD", "ABCD", "ABEF", "GH", "ABCDEFHG", seeing "GH" should bring back
   all of "ABCDEF", but "CD" was now held back.
2. **A handle on each whole in a part** (`perWhole`, in `volume.js` `#handle`). Why test 14 broke: the outer whole was
   tied with one handle on its big part, "ABCDEF", and that part is really two wholes glued at "AB" ("ABCD" and
   "ABEF"). The handle (A0 F0) wakes only "ABEF", so the outer whole knew "CD" only through the shared "AB". The core
   passed test 14 only because of the leak. Now: take a handle, see what it brings back within the part (completion,
   with competition), and while some cell of the part is still not brought back, take a handle from that cell too. The
   outer whole is then tied from A0 B0 C0 E0 G0 H0, and holds "CD" directly. (A first try, counting what one segment
   "covers", failed: links are sampled, so a segment never covers a whole, and it added needless handles, breaking test
   17's "a whole costs what its parts number".)
3. **The cut splits what is left over into its own wholes** (`perWhole`, in `volume.js`, step 5). Found in the run, not
   by the tests: in a world of three endings on "AB", teaching "ABGH" cut "ABCD" and "ABEF" as one memory (glued at
   "AB") and tied the leftover "CDEF" into **one false assembly**: "CD" and "EF" became a single thing never seen. Now
   the remainder is grouped on its own, and the fit is cut from each whole in it ("EF" here; "CD" was already held).

Also, from C92: **warmth helps a segment fire but never votes.** In competition a segment's share now counts only what
is active, not what is warm. Without this, warmth broke core test 13: after "AB" left both endings warm, a seen "C"
was cancelled out by the warm "EF".

**The one root.** The core reads a memory as everything joined through any shared cell (`#groups`). Two wholes that
share a part are then read as one: for competition, for handles and for the cut. All three changes read wholes
instead.

## Results

Core tests (17), every combination:

| | warm off | warm on |
|---|---|---|
| core rules | 17/17 | 17/17 |
| brought competes only | 16/17 (test 14) | 16/17 (test 14) |
| handles per whole only | 17/17 | 17/17 |
| **all three** | **17/17** | **17/17** |

C92's probes (20 seeds each; every seed the same):

| probe | core | warm (C92) | **all three** |
|---|---|---|---|
| "AB" then "E" | fresh "E", nothing | "E" reused; brought ABCDF | **"E" reused; brought ABF** |
| "AB" then "C" | fresh, nothing | reused; ABDEF | **reused; ABD** |
| nothing, then "E" | nothing | nothing | nothing |
| "AB", gap, "E" | nothing | nothing | nothing |
| "AB" then "X" | nothing | nothing | nothing |
| three endings: "AB" then "G" | fresh, nothing | reused; ABCDEFH | **reused; ABH** |
| three endings: "AB" then "X" | nothing | nothing | nothing |
| three endings: "AB", "C", "D" | fresh, nothing | reused; ABCEFGH | **reused; ABC** |

More endings on one "AB" (each probe: "AB", then the first letter of one ending; clean means that ending's own cell won
and exactly "AB" and its other letter came back):

| endings | core | warm | **all three** |
|---|---|---|---|
| 2 | 0/40 | 0/40 | **40/40** |
| 3 | 0/60 | 0/60 | **60/60** |
| 4 | 0/80 | 0/80 | **80/80** |
| 6 | 0/120 | 0/120 | **120/120** |
| 8 | 0/160 | 0/160 | **160/160** |

## What it shows

- **The variable is held open and closed cleanly.** After "AB", every ending is warm and none surfaces; one letter
  picks one ending, and exactly that ending comes back, with up to eight endings competing. That is RM-10's "holding a
  variable open", end to end, in cells.
- **The leak was one problem, not three.** Reading wholes instead of connected groups fixed competition, the handles of
  compositions, and the cut, and it removed a false assembly the core was quietly making.
- **Warmth stays the size of what is in play.** In C92 it grew to nearly everything while input kept coming; now it is
  the current whole and no more (trace: warm in A0 B0 C0 after "C").

## Violations (CTR-2 CON-7)

| | Violation | Kind | Clauses | How it would be removed |
|---|---|---|---|---|
| V1 | Warmth lasts exactly one moment | declared choice | CTR-1 CON-2, CON-1 | the energy rule (RM-9) decides what warmth stays |
| V2 | Warmth is what was brought back, not what was seen | declared choice | CTR-1 PRN-5 (read as fitting it) | test the other reading |
| V3 | A blank between lessons, so no transitions are learnt between them | given by hand | CTR-2 CON-2 | worlds where lessons run on |
| V4 | Brought back counts as evidence in competition, against RM-5's "only seen" | change to a reference model | RM-5, CTR-1 PRN-5 | agree it into RM-5, or find what PRN-5 protects that this breaks |
| V5 | A handle's reach is found by running completion inside the part at tie time | mechanism, declared | CTR-1 OPZ-2 (cost), CON-18 | measure its cost; it runs only when tying |
| V6 | Growth and cutting still unconditional | inherited gap | CTR-1 CON-1 | RM-9 |
| V7 | Four cells per column | fixed architecture (allowed) | CTR-1 CON-3 | stays, declared |

Nothing chooses which ending surfaces: that falls out of the counts. The worlds are tiny and clean; this shows the
mechanism, not that it scales.

## Next

1. **What makes warmth fade** without a clock (V1). Tried afterwards in sketches that were not kept, and worth recording:
   warmth that stays until something changes it (its column is lit, or the present reaches it and doesn't take it) holds
   a variable open across distractions, but grows with everything stored (about two warm cells for every constant ever
   seen); tying endings to their constant, so they go when a new frame opens, keeps warmth the size of what is in play but
   holds one frame at a time. The bound that worked later for held states is rivalry (C101).
2. **Frames with real variety:** the same machinery on ordered input, where one shared start has many endings.
