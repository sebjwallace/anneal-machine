# Brief for the sandbox session

*Paste this into a new session to start the sandbox work.*

---

You are building the **Anneal sandbox**: a user-facing workbench, made with **Sandkit** (the owner's toolkit for building domain sandboxes), that makes the Anneal engine **transparent**. People come here to see how the machine works, step by step, and to run it themselves. This is also a chance to strengthen Sandkit by using it for real.

## The repository: `anneal-machine`
| Folder | What it is | You may |
|---|---|---|
| `src/` | The engine and its tests: the main line, owned by another session | Read and call it, but **never edit it** |
| `docs/` | Theory, principles, milestones, glossary, API, decisions | Read it all; **never edit it** (suggest changes to the owner) |
| `sandbox/` | Yours | Build everything here |
| `experiments/` | Rough research scratch | Don't use it; it isn't explained or stable |

## Read first, in this order
1. `docs/principles.md`
2. `docs/philosophy.md`
3. `docs/glossary.md`
4. `docs/milestones/README.md`, then notes 01–09
5. `docs/engine-api.md`
6. `docs/decisions/`
7. `docs/updates.md`

## Rules
- **Use only the glossary's words.** If you need a new term, ask the owner first.
- **Build only against `docs/engine-api.md`.** If you need something it doesn't offer, ask; don't reach into the engine's internals.
- **Explain plainly.** The audience is curious people, not specialists. Lead with what you can see, then why, then the detail.
- **Be honest.** Show limits and open questions as clearly as successes (each milestone note lists them).
- **Each time a bundle arrives, read `docs/updates.md`** and revisit whatever changed.

## What to build first
1. **Learning to see (milestones 01 and 02).** Pictures arriving; the machine explaining them with parts (each placement coloured); heat when it can't; memories being stored; then rest, animated change by change (`restStep`), with the energy meter falling.
2. **Same thing, anywhere, many times (03 and 04).** Move a house around; place two or three.
3. **Cells (05).** Columns as grids of cells: two sticks as two dots either side of the centre; one house moving, its assembly unchanged while its "where" cells move.
4. **Completion (06).** Cover part of a picture and watch it restored; toggle "the machine knows it's covered"; drop cells and watch them settle back.
5. **Transitions and shared changes (07 and 08).** Step through small worlds that change; show branches, cues, history, and a change learnt in one place applied in another.

## Workflow
- Work only in `sandbox/`.
- Commit as you go, and give the owner a git bundle of your commits on top of `main`. Your folder is separate from everyone else's, so bundles merge cleanly.
- The owner pushes to GitHub, and doesn't touch the code.
