# Ideas (the owner's notes, gathered over time; not yet designed or built)

## 1. Decomposition by comparison: analysis and synthesis (11 Nov 2026)

**The problem it answers:** across the experiments so far, patterns aren't really decomposed into their parts. We find crumbs, fragments or statistical parts, not a logical decomposition. Decomposition matters because it allows composition, and the more efficient the composition, the better.

**The idea: learn by comparing things with each other.**
- **Similarity:** when two things are compared, their overlap becomes an **abstraction**, and each column represents an abstraction.
- **Difference:** how two things differ is the counteracting force. Using overlap alone would fall back into the old problems. Difference may not be an abstraction itself, but it's essential. Perhaps like Boolean logic: not only overlap (AND), but the other operations too.
- **Example:** three inputs: a cross; a vertical line; a horizontal line.
  - cross vs vertical: the similarity is the vertical line (an abstraction); the difference is the horizontal line.
  - cross vs horizontal: the similarity is the horizontal line.
  - So the cross isn't a raw column of its own: it's a **derived column**, a composition of its primitives (vertical + horizontal).
- **Analysis and synthesis:** decomposition into parts, composition back from them. Compression where the parts are **logical, not statistical**, and are used to explain everything built from them. A specific episodic input is then built from a finite number of parts.

**How it might run (open):**
- Awake: capture a session's inputs as columns (the 90% snapshot surface, C14/C15: in effect a session's worth of input held in memory).
- **Rest:** inputs stop, and columns are compared against each other (perhaps each against every other), looking for overlaps and differences. New columns fall out of that decomposition.
- Unlike everything so far, which is driven by inputs: this is driven by comparing what is already stored.

**Not yet known:** the exact machinery; how differences are used; which operations; what happens to the original (derived) columns.

**Aims (added 11 Nov 2026):**
- **Efficiency.** What we've done so far is slow, expensive and messy. This approach should learn **faster, cleaner and more efficiently**.
- **Online or at rest.** It could run online as inputs come in, but at least at first it's seen as a **rest-period** process: inputs stop, and the internal columns **self-organise with one another**.

## Reference: assemblies (11 Nov 2026)
Our write-up for the handoff agent: https://claude.ai/artifact/Cr3aBRsvswkHzpYJpC58Qo
Its reply, "Assemblies: what they are in the machine, and how they fit the columns track": https://claude.ai/artifact/7tKRhxumK7wP3R3DU6mdbC
Key points: our composites already are assemblies (stand-ins with positions; sub/super = levels of one rule). Missing: completion (recognise by fit, fill in top-down, settle), slots for substitutes (= kinds, by collapsing near-duplicates that differ in one place), re-checking at rest, and energy that counts the flow (description length). Suggested order: energy with the flow → completion → slots and kinds → incremental re-checking → bridge back to the core (column = part, cell = that part in that place in that whole).

## 2. Layers only when they lower heat (11 Nov 2026)
- Layering should happen naturally, in response to high energy and heat. **Don't build anything that doesn't need to exist:** if one layer can do it, have one layer.
- Keep composition through layers only if it reduces heat, both in **structure** and in the **energy of the information flowing through**.
- Overall, heat should fall, whether in structure or in information.

**First try: C16 (findings/C16-factoring.md).** Heat = duplicated structure between parts; at rest the hottest pair is factored into overlap and differences when it lowers energy. Bars, halves and diagonals emerged; memories became compositions; new shapes were rebuilt exactly on first sight; one rest took 0.3 s.
