# CTR-2 · The practice · proposed

*Drafted by the assistant on 14 November 2026 from the owner's words. Not in force until the owner signs. Clauses
marked **draft** are proposed from what the owner has said but not yet stated by him as such.*

How we develop the system here: the owner working with AI agents. It serves [CTR-1 · The system](system.md). Someone
building CTR-1 another way would have a different practice contract, or none.

## The sheet

**Scope.** *In:* experiments, theories, the core and the branch, the sandbox and visuals, documents, and how the owner
and agents work together. *Out:* what the system is (that is CTR-1).

**Definitions**
- **DEF-1 The core:** `src/engine/`, the main line.
- **DEF-2 The branch:** the integrated working copy, `experiments/sketches/C56-integrated/engine/`.
- **DEF-3 A sketch:** an experiment copy outside both, for a quick question.
- **DEF-4 Given by hand (puppeteering):** anything supplied by the experimenter instead of done by the machine.
- **DEF-5 A crutch:** a number tuned to pass a test, a filter, or a rule written for a task.
- **DEF-6 A patch:** structure added to cover a misfit instead of resolving it.
- **DEF-7 A declared choice:** anything in the system that doesn't follow from its rule, written down with what would
  replace it.
- **DEF-8 Evidence:** a measured result against a baseline, with what was given by hand (DEF-4) stated.
- **DEF-9 A violation:** a place where an experiment breaks a clause of CTR-1 or CTR-2: something given by hand, a
  crutch, a patch, a choice not yet declared, or a mechanism written outside the engine.
- **DEF-10 Distillation:** removing an experiment's violations (DEF-9) one at a time, measuring after each, until what
  is left fulfils the contracts.
- **DEF-11 Bookkeeping:** the program keeping a list of the system's things (assemblies, memories, placements) and
  working over it centrally, in place of the dynamics of cells and segments (CTR-1 CON-19).

**Goals** (reached, then done; in order of priority)
- **GOL-1** A system that fulfils CTR-1, with evidence (DEF-8) for each clause it claims.
- **GOL-2** *(draft)* The owner and any agent who picks up the work hold the same understanding of it, without drift.
- **GOL-3** Every result we build on is distilled (DEF-10): what it rests on fulfils the contracts.

**Optimizations** (directions, never done; in order of priority: in a trade-off the higher one wins)
- **OPZ-1** Less given by hand (DEF-4), in every experiment and in the system.
- **OPZ-2** Fewer declared choices (DEF-7): each moved into the system's rule, or removed.
- **OPZ-3** *(draft)* Less time lost: to results that rested on puppeteering, to drift, to misunderstanding.
- **OPZ-4** The smallest code that fulfils CTR-1: fewest constructs and lines, echoing CTR-1 OPZ-3.

**Constraints** (what rules options out; none gives way; general to specific)
- **CON-3** No crutches (DEF-5) and no patches (DEF-6). *Hard.*
- **CON-2** Given by hand (DEF-4) only to narrow in on something, always declared, and no claim may rest on what was
  given. *Hard.*
- **CON-7** Every experiment lists its violations (DEF-9), clause by clause. Violations are allowed while exploring;
  undeclared ones are not. *Hard.*
- **CON-4** Every declared choice (DEF-7) is written in `docs/decisions/`. *Hard.*
- **CON-1** Nothing goes into the core (DEF-1) unless it is distilled (DEF-10), with evidence (DEF-8) and the owner's
  approval: tests identical or better. *Hard.*
- **CON-8** *(draft)* Bookkeeping (DEF-11) may be used in experiments, declared as a violation (CON-7), but never
  enters the core; bookkeeping already in the core is a violation to distil out. *Hard.*
- **CON-5** No new terms without the owner's agreement; words keep the meanings in the glossary. *Hard.*
- **CON-6** Commits and bundles only when the owner asks. *Hard.*

**Capabilities** (what lets us move; general to specific)
- **CAP-4** The assistant: reasoning, writing, building and running experiments.
- **CAP-3** Written memory that outlasts a session: checkpoints, findings, theories, guides, contracts.
- **CAP-6** The contracts as a measuring rod: any experiment can be read against them clause by clause, so its
  violations (DEF-9) are found, not guessed.
- **CAP-7** *(draft)* Reference models: documents and pseudocode describing how to build each part (`docs/reference-models/`),
  which any rebuild, in any language, borrows from; agreed descriptions in place of shared code to manage.
- **CAP-1** Sketch, branch and core (DEF-3, DEF-2, DEF-1): ideas tried cheaply, kept apart until they've earned a place.
- **CAP-2** Visuals and the sandbox: agreeing how something works by seeing it.
- **CAP-5** *(draft)* The system itself as a helper ("Neil"), once it can hold our history.

**Principles** (what we choose by; when two pull apart, the higher one is preferred)
- **PRN-1** Don't change anything until you understand it. *(The owner's.)*
- **PRN-2** Measure against a baseline before believing a result; an explanation is not evidence.
- **PRN-3** A result that looks too good is checked for what was given by hand (CON-2).
- **PRN-7** Explore freely, then distil: once a handful of experiments have made a result worth keeping, remove their
  violations before building further on it.
- **PRN-4** Inspired, not copied.
- **PRN-6** Detail where misreading is likely: a reader fills gaps with their own picture.
- **PRN-5** Plain words, and pictures when words drift (CAP-2); walk through a visual by what to press and look at.

**Parties.** The owner. *Not signed.*

---

## Details

**CON-2** is the owner's puppeteering rule (13 November): puppeteer only to narrow in, be explicit about how much, and
never take a win that could be the result of it. **PRN-3** is what the lost-keys puppet control showed (C61): marking
rooms by hand gave one look per search, better than the true odds allow. **CON-1** combines principles 8 and 9 with the
owner's rule that the core changes only with his approval. **CON-5** and **PRN-5** are the owner's preferences for
plain, agreed language and for visuals. **PRN-6** is the owner's reason for the detailed column guide. **CAP-5** is
"Neil" (13 November).

**CAP-7** is the owner's (14 November): rather than a library of versioned components, which would bring the overhead
of managing code, the work keeps reference models, descriptions and pseudocode for each part, judged by the contracts.
An experiment, or a rebuild from scratch on its own branch, borrows from them and can be written in any language. A
model changes when evidence changes it, and says how far its evidence goes (shown, core, proposed, open).

**CON-8** is the owner's (14 November): a list of assemblies worked over by the program is bookkeeping, a convenient
stand-in for what cells and segments should do (CTR-1 CON-19). It is fine for narrowing in, as hand-given things are
(CON-2), and like them it must be declared and must not reach the core. The core today still has some (CTR-1, "Today
against the contract"): it is listed for distillation, not grandfathered in.

**Distillation** (DEF-10, GOL-3, CON-1, CON-7, CAP-6, PRN-7) is the owner's (14 November). Experiments are allowed to
break the contracts while exploring: that is what lets them be quick. The cost is that a result resting on violations
can't be built on or brought into the core. So once a handful of experiments have made a result worth keeping, the
work turns around: read the experiment against both contracts (CAP-6), list every violation (CON-7), then remove them
one at a time, measuring after each. If a result survives the removal of a violation, it never depended on it; if it
falls, the violation was doing the work, and that is the next thing to understand. When nothing is left to remove, the
result is distilled, and only then is it a candidate for the core (CON-1). *Why:* without it, experiments stay in the
branches and the core never benefits (the owner: the step into the core felt like too high a barrier); with it, the
step is a series of small, measured removals. *Gives way (PRN-7):* to more exploring when no result is yet worth
keeping.

Each experiment's findings should name what it serves in either contract (for example `serves: CTR-1 CAP-5;
CTR-2 CON-2`) and list its violations, clause by clause.

## For the owner to decide
1. The drafts (GOL-2, OPZ-3, CAP-5, CON-8) and the definitions (including DEF-11, bookkeeping), including distillation (DEF-9, DEF-10, GOL-3, CON-7, CAP-6,
   PRN-7).
2. The order of each list: goals and optimizations as priorities, the rest general to specific.
3. Whether anything here belongs in CTR-1 instead, or the other way round.
4. The reference models (CAP-7, draft), written 14 November 2026 in place of a component library.
5. Then sign.
