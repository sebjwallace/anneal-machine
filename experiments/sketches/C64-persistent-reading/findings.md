# C64 · Persistent assemblies while reading · findings

Run: `node run.js` (out.txt). Givens: C62's G1-G4, plus G5 (the eye steps on in order by 2 or 4 letters). The
persistence rule is the mechanism under test, written in run.js: a carried-over placement stays while every letter of it
still in view matches what is seen; on any misfit it is let go and that part is settled afresh.

| Spaces | Step | Letters explained afresh per look (of 8): fresh → persist | Left unexplained per look: fresh · split · persist | Cuts F1: fresh · split · persist |
|---|---|---|---|---|
| kept | 2 | 8 → **3.3** | 1.37 · 2.71 · **1.25** | 45 · 58 · 57 % |
| kept | 4 | 8 → **4.7** | 1.30 · 2.55 · **0.99** | 44 · 63 · 57 % |
| removed | 2 | 8 → **3.6** | 1.66 · 3.13 · **1.40** | 68 · 64 · **80 %** |
| removed | 4 | 8 → **5.1** | 1.71 · 3.24 · **1.19** | 68 · 73 · 74 % |

Placements let go on a misfit: 12 to 43 per run, against 322 to 523 kept.

## What it shows
- **Event-driven reading saves about half the work, at no cost to understanding.** Only 3.3 to 5.1 of each window's 8
  letters need explaining afresh, and less is left unexplained than reading from scratch (0.99-1.40 against
  1.30-1.71). What still fits costs nothing; only misfits and new letters are worked on (CON-18).
- **Letting go happens by itself.** Carried-over placements that stopped fitting were dropped and re-settled, a few
  dozen per run; nothing else had to decide when.
- **The better cuts were mostly the seam, as the control showed.** Reading the old and new letters separately from
  scratch (SPLIT) improves the cuts about as much with spaces kept (58-63 % against persistence's 57 %), so that gain
  is an artefact of cutting where old meets new. SPLIT pays for it, though: it leaves twice as much unexplained.
  Only without spaces at step 2 does persistence clearly cut better than the seam alone (80 % against 64 %).
  Persistence also keeps precision up where the seam alone loses it.

## Lessons
The control was worth it: without it, "persistence cuts words better" would have been claimed (CTR-2 PRN-3). The claim
that stands is about work and heat, not cuts.

## Next
- Persistence across regions: the held context as a persisting assembly in a region above (CAP-15).
- Persistence plus completion: a persisting word that slides out of view could predict what comes next.
