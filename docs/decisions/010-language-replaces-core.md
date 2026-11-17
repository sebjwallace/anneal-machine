# 010: The language replaces the core

**What.** The core code in `src/` (the engine, its tests and the viewer) has been deleted. The main line of the project
is now the language, in [`language/`](../../language/README.md): a notation for members, edges, gates, assemblies,
and how heat forms and breaks structure. For now it is markdown only.

**Why.** The core had fallen behind the theory. Recent work (the warm layer, held states, learned computation, no
context in cells, structure over strength, how heat restructures) was done in standalone sketches or in theory, not in
the core. Keeping it as the reference was pulling attention back to its older assumptions and becoming a distraction.
The language is meant to state the machine precisely in its own terms, so that an interpreter can be built from it,
instead of patching the old engine forward.

**What is affected.**
- `src/` is gone; it remains in git history.
- `package.json` no longer has `test` or `view` scripts.
- The sandbox, and older experiments that imported `../src/` or `../../../src/`, no longer run as they are. They are
  kept as history. Experiments that copied the engine into their own folder still run.
- Docs that describe the engine (architecture, engine API, reference models, checkpoints) describe the retired core.
  They stay as the record of what was learnt.

**What would change this.** Nothing is planned to bring the core back. When there is code again, it will be an
interpreter for the language.
