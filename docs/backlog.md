# Backlog: things to fix or try (as of C24)

Grouped by where they came up. Nothing here is started.

## Seeing (C20–C21)
- **Memory scraps.** About a dozen bottom-layer parts are odd scattered leftovers of stored scenes. New scenes never use them, and they become pointless columns in C21. Option: let a memory hold loose pixels, so these can go. Catch: something seen only once would then never become a part. Needs a deliberate decision.
- **Better explaining while awake.** The "try the strongest few first choices, keep the cheapest" explanation is only used for encoding (C21 on). Awake learning still uses plain greedy, which made the flag + flag mistake. Try it awake too, and check speed.
- **Rest gets slow if it piles up.** Rest re-checks everything, so after many scenes with no rest a single step takes about a second. Only re-check what changed since the last rest.
- **Viewer:** the colour of the first unit (orange) looks like heat (red), and the "parts, ×n" labels overlap under layers 2–3 (C20 page).

## Cells (C21)
- **Graded positions.** Neighbouring offsets get unrelated cells, so "slightly further right" shares nothing with "here". A small blob of cells per position would give overlap. Probably needed for variation, noise and small moves.
- **One floor per level, or a shared floor?** Per level never collides, but things on different levels can't share cells. A shared floor allows similarity across levels, with some collisions (3 of 28 pairs). Decide.
- **How much to sample** from each child when building a bigger assembly (3 gave exact rebuilds here; deeper worlds may differ).

## Completion and memory (C22)
- **Deeper worlds** (houses → streets → town), with assemblies that only know a sample of their children, so settling really needs several rounds. Owner's idea: an unsettled assembly is in a high-energy state, and nothing else happens until it settles.
- **Hippocampus index.** Keep a sparse sample across all levels of a scene, plus where things were, and recall the whole scene from a partial cue. Sample more from surprising or distinctive parts, and across sub-parts, not evenly (C22 showed which cells are kept matters more than how many).
- **Hidden vs empty.** Completion is far better when it knows a patch is hidden rather than empty. What tells the machine "unknown" in a natural way?

## States and transitions (C23–C24)
- **Changes that depend on where** (walls). Shared changes drop position, so a bounce at a wall is missed in a new row. The comparison already shows when position matters ("same x, different y"): keep that axis in the shared change when the comparison shows it.
- **Telling look-alikes apart.** With one stick moving and one still, nothing in a single state says which moves. Fix: put a little history in the state (the scene just before, as well as now). Movement then shows in the state itself. That should also remove the need for "apply a shared change once per step".
- **Many independent changes at once.** "Apply once" breaks when two separate things make the same kind of change in the same step. With history in the state, apply every match that doesn't touch the same cells.
- **Things appearing from nowhere** aren't predicted in the "changes" version.
- **Changes at higher levels.** Transitions are on primitive cells. A whole house moving should be one change of the house, not four part changes.
- **"One step right" for any shape.** The same move looks the same in every column's grid. Comparing transitions across columns could give a move that works on anything, which is close to an action.
- **Learning a context** rather than being given one (the bouncing stick's direction).
- **Whole state vs changes only.** No difference yet; may matter once things generalise.

## Bigger directions (from discussion)
- **Abstract region:** cells with no grid; nearness comes only from shared cells; fed by the visual region.
- **Slots and kinds:** variation within a thing (the agreed next item in the handoff order).
- **Imagination and simulation:** run transitions on their own output with no input, drawn back onto the grid (see the interacting squares and diamonds idea).

## Moving things and imagination (C25)
- **Self-correction (owner's idea):** imagination drawn out to the grid comes back in, and surprise corrects it. Learning must be off, or what's imagined must be marked as imagined, or it will learn from its own fiction.
- **Rules that don't depend on exact offsets.** Every meeting geometry must be seen today (side × offset × both directions × both shapes). This is the main limit on imagination.
- **Walls from pixels,** not told as context (needs "keep position when it matters").
- **Three-way bumps and other never-seen situations:** what should happen when no rule really fits?

## Crutches to remove (audit after C25; owner asked "is it pure?") · DONE for the main line: see docs/architecture.md and docs/decisions/
- **Told, not seen:** the distance to the border was given as context in C25. Walls drawn as pixels are being tried (C25b, below).
- **Filters:** C25 kept a rule only if it included the object's own previous place. It is now an option, off for C25b.
- **Rules I wrote that the engine doesn't discover:**
  - following objects between pictures by "nearest, within 3 cells";
  - picking a rule ("never wrong, most detail, else least wrong");
  - "exact memory beats shared change";
  - completion's settling order;
  - "apply a shared change once" (C24).
  These should come from one principle (energy), not from me.
- **Hand-set numbers, some tuned after seeing failures:**
  - how far rules look (5 cells, walls 2);
  - how many first choices explaining tries (12);
  - the sample per child (3);
  - the rest search budget.
- **Stand-ins:** composites (pointers) and transitions/rules (tables of sets and counts) mimic what assemblies should do, but aren't cells and associations actually firing.

## Seeing layer: weaknesses exposed by walls (C25b)
- **A thing that is always there** (a fixed border) is learnt as one big shape, so "a wall next to me" can't be local. That is reasonable: walls that never move make position the cause.
- **Big repetitive structures** (rooms of bricks in varying places) defeat pulling apart. It splits at the single best overlap, which for long rows of bricks is a big chunk of wall, not one brick. Result: 128 units, 9 layers, 6 minutes, and no brick.
- **Many small scattered things** (loose bricks) leave about 100 memory scraps. Placement price grows with the number of units, so a 2-pixel brick barely pays and rooms are only partly explained (heat 0.22).
- **Fix first:** memory scraps (let memories hold loose pixels, drop what nothing uses), then retry walls. Maybe also let pulling apart find the smallest repeating piece (compare a part with itself at every shift, keep the piece that repeats most).

## Side branch (paused, owner: a curiosity, not the main course)
- Imagination of squares and diamonds (C25 to C27): rules for situations, similarity. Paused. Findings in findings/C25 to C27.

- **Flow window:** ideally every picture ever seen. Grow it or summarise older pictures (decision 008; ties into forgetting). This is what keeps one energy at 90% on the moving world: with every picture as the flow it predicts 100% (C32), at about 3× the time.
- **A kind that nearly fits** (C32, experiment): a rest move that adds what's actually there as a new version. It works, but energy turns it down on every test world, so it isn't in the engine. Revisit with a world where it would pay.
- **"Remember one thing" at rest** (C32, experiment): lowers the 12×12 bill (1,161) and removes completion's invented pixels, but damaged-picture completion gets slightly worse. Owner to decide if it's worth pursuing.
