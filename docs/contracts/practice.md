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

**Goals** (reached, then done)
- **GOL-1** A system that fulfils CTR-1, with evidence (DEF-8) for each clause it claims.
- **GOL-2** *(draft)* The owner and any agent who picks up the work hold the same understanding of it, without drift.

**Optimizations** (directions, never done)
- **OPZ-1** Less given by hand (DEF-4), in every experiment and in the system.
- **OPZ-2** Fewer declared choices (DEF-7): each moved into the system's rule, or removed.
- **OPZ-3** *(draft)* Less time lost: to results that rested on puppeteering, to drift, to misunderstanding.
- **OPZ-4** The smallest code that fulfils CTR-1: fewest constructs and lines, echoing CTR-1 OPZ-3.

**Constraints** (what rules options out)
- **CON-1** Nothing goes into the core (DEF-1) without evidence (DEF-8) and the owner's approval: tests identical or
  better. *Hard.*
- **CON-2** Given by hand (DEF-4) only to narrow in on something, always declared, and no claim may rest on what was
  given. *Hard.*
- **CON-3** No crutches (DEF-5) and no patches (DEF-6). *Hard.*
- **CON-4** Every declared choice (DEF-7) is written in `docs/decisions/`. *Hard.*
- **CON-5** No new terms without the owner's agreement; words keep the meanings in the glossary. *Hard.*
- **CON-6** Commits and bundles only when the owner asks. *Hard.*

**Capabilities** (what lets us move)
- **CAP-1** Sketch, branch and core (DEF-3, DEF-2, DEF-1): ideas tried cheaply, kept apart until they've earned a place.
- **CAP-2** Visuals and the sandbox: agreeing how something works by seeing it.
- **CAP-3** Written memory that outlasts a session: checkpoints, findings, theories, guides, contracts.
- **CAP-4** The assistant: reasoning, writing, building and running experiments.
- **CAP-5** *(draft)* The system itself as a helper ("Neil"), once it can hold our history.

**Principles** (what we choose by)
- **PRN-1** Don't change anything until you understand it. *(The owner's.)*
- **PRN-2** Measure against a baseline before believing a result; an explanation is not evidence.
- **PRN-3** A result that looks too good is checked for what was given by hand (CON-2).
- **PRN-4** Inspired, not copied.
- **PRN-5** Plain words, and pictures when words drift (CAP-2); walk through a visual by what to press and look at.
- **PRN-6** Detail where misreading is likely: a reader fills gaps with their own picture.

**Parties.** The owner. *Not signed.*

---

## Details

**CON-2** is the owner's puppeteering rule (13 November): puppeteer only to narrow in, be explicit about how much, and
never take a win that could be the result of it. **PRN-3** is what the lost-keys puppet control showed (C61): marking
rooms by hand gave one look per search, better than the true odds allow. **CON-1** combines principles 8 and 9 with the
owner's rule that the core changes only with his approval. **CON-5** and **PRN-5** are the owner's preferences for
plain, agreed language and for visuals. **PRN-6** is the owner's reason for the detailed column guide. **CAP-5** is
"Neil" (13 November).

Each experiment's findings should name what it serves in either contract (for example `serves: CTR-1 CAP-5;
CTR-2 CON-2`) and what was given by hand.

## For the owner to decide
1. The drafts (GOL-2, OPZ-3, CAP-5) and the definitions.
2. Whether anything here belongs in CTR-1 instead, or the other way round.
3. Then sign.
