# Handoff · 14 November 2026 · the cells-first world

*Written at the end of a long session with the owner, so the next session can start fresh. Read this first, then the
files it points to, in the order given. Nothing here replaces the contracts: they judge everything.*

---

## 1. Read in this order

1. **This document.**
2. [Contracts](../contracts/README.md): [the system](../contracts/system.md) (CTR-1) and
   [the practice](../contracts/practice.md) (CTR-2). Read "How the lists are ordered" and "Today against the contract".
3. [Cells first](../theories/cells-first.md): how the machine moved from bookkeeping to cells and segments, piece by
   piece, with the evidence.
4. [Reference models](../reference-models/README.md): RM-1 to RM-10, how to build each part. Read "What the models do
   not yet cover cleanly" and the standing rule before building anything.
5. [Glossary](../glossary.md): the agreed words. Use no others.
6. The cells engine: [experiments/cells-engine](../../experiments/cells-engine/README.md). Read its "Against the
   contracts today".
7. The last three experiments: [C79](../../experiments/sketches/C79-context-cells/findings.md),
   [C80](../../experiments/sketches/C80-reading-letters/findings.md),
   [C81](../../experiments/sketches/C81-levels-from-letters/findings.md). Each has an audit section; read it.
8. The [ledger](../ledger/ledger.md), latest entries: from PRB-11 to INC-4.

---

## 2. Where we are, in plain terms

**The old world** (still the core, `src/engine/`): the engine keeps lists of parts and memories and works over them
centrally. That is bookkeeping, and it is now ruled out of the core (CTR-1 CON-19, CTR-2 CON-8). One piece was improved
on 14 November: fitting is competition with re-settling where heat is left (C75), with no search over openings. It
still runs over a list of every unit.

**The new world** (the reference models, and the cells engine): the machine is cells and their connections, and
nothing else.
- A column of cells stands over each input cell: the column is identity, the cell is context.
- A cell's links are split into segments, one per memory: each segment is an AND, firing at two active links; the cell
  is an OR of its segments.
- An assembly is only cells and links, never an entry anywhere.
- Memories wake and complete from part of themselves, and compete through one shared level of support.
- Parts are composed by binding two cells from each.
- Wholes are decomposed by the cut between fit and misfit, which leaves the shared part (the abstraction) on the same
  cells.

Experiments C73 to C81 showed these pieces, each in its own small world.

**The newest results** (C79 to C81, on the cells engine):
- **From letters alone, read once, the region learns:**
  - the next letter inside words, sharply;
  - where words begin, from where its predictions are broadest (the second kind of heat: predicted, not there).
- **Letting go of context at a word's start gives each word one chain of cells** (an identity).
- **Two regions are needed:** one keeps context and marks boundaries; one lets go there and holds the words.
- **With true boundaries,** words, shared beginnings and sentences all formed.
- **With the region's own boundaries** (74% right, 82% found), words formed for about half the cases.

**What is not clean** (the audit at the end of the session; found by the owner's check, and the reason for this
handoff's emphasis):
- C81 did word recognition and shared parts by its own code scanning every segment (bookkeeping).
- It put the boundary rule and the letting go outside the engine.
- It stored every run on first sight, with no energy rule.
- It grouped and chose sentences using the truth. Its sentence result with the region's own boundaries cannot be
  claimed.
- The cells engine has no energy rule at all: it grows segments and never keeps or drops by energy.

The reference models were audited too, and now name every gap instead of hiding it.

---

## 3. The most important open gap

**The energy rule at the level of cells** (RM-9). The project's one rule (CTR-1 CON-1) is that a change is kept only if
energy falls, priced in one currency taken from the world (CON-2).
- **Today's bill is over placements:** a use of an assembly costs about 1.5, an unexplained cell 1, a cell claimed but
  not there 1. Its naming cost counts every assembly known, which is bookkeeping.
- **In the cell form, only part of the bill exists:** a segment costs its links, a binding costs its links (C76), and a
  cut pays when it saves links (C78).
- **What is missing:** what an unexplained cell and a prediction not there cost against the links that would explain
  them, and so when a segment or an assembly is grown, kept or dropped.

Until this exists, growth is unconditional: the cell creep in C79 and C81 is the symptom. Even the bar of two is carried
over from the placement bill, not yet re-derived.

---

## 4. The experiment we are trying to do

**Goal:** words, their shared parts, and sentences, learnt from a stream of letters by the regions themselves: no words
given, no bookkeeping, no truth used by the machine. This is C81 done cleanly (call it C82 and onwards).

**What C81 showed is possible (with true boundaries):**
- one chain of cells per word;
- the shared beginnings of words ("ca" in "cat", "car", "cart") held as parts on shared cells;
- sentences bound by two cells per word, their object recalled from subject and verb.

**What must change to do it cleanly** (each is a violation in C81's audit):
1. **Boundaries and letting go inside the engine.** Region 1 marks where a word begins from its own state: the breadth
   of prediction peaking, with one step of look-ahead or another rule. Region 2 lets go of context there. Today this is
   in C81's code, reaching into the region's `past`. It belongs in the engine, and the wiring of region 1 to region 2
   should be declared as the only thing given.
2. **Recognising a stored word by segments.** When a stored word comes again, its cells' assembly segments fire in
   full; that is the recognition. No scan over segments, and no comparing link sets.
3. **Shared parts by the cut (RM-8),** not by scanning which cells already carry a word segment.
4. **Keeping by the energy rule:** a run is kept as a word only if it pays (it recurs), which needs gap 3.
5. **Sentences without the truth.** What marks the end of a sentence must come from the stream (a full stop as an input
   character, or a boundary at the next level), and which runs belong together must be read from the region's state, not
   from true sentence numbers. Binding the words' cells (RM-7) then follows.
6. **Better boundaries from the level above.** A cut that yields a recognised word is evidence it was right; a run that
   never recurs is evidence it was wrong. Fitting stored words back onto the stream (RM-6, one level up) would let the
   word level correct the letter level.

**A sensible order:**
1. **The energy rule at the level of cells** (gap 3). It is needed for item 4 and makes everything else honest.
2. **Items 1 to 3:** move what C81 did into the engine, driven by the region's state; keep the engine's tests passing.
3. **Items 4 and 5,** then item 6.

**How to check it is clean:** read every experiment against both contracts, clause by clause, *before* writing what it
shows (the lesson of INC-3). List every violation in the findings. Any result that rests on something given, or on the
truth, is not claimed.

---

## 5. How the owner works (standing rules)

- **Commits and bundles only when the owner asks.** He applies bundles and pushes himself.
  - GitHub's last commit is 822c884.
  - The last bundle carried bc50e83 and 70b1d43.
  - Everything since 70b1d43 (C79-C81, the cells engine, both audits, the model fixes, this handoff) is not yet
    committed unless he has asked since.
- **No changes to the core (`src/engine/`) without his approval.** For now: "forget about the core"; work in the cells
  engine.
- **No new terms without his agreement;** plain words; the glossary's meanings.
- **Visuals** for understanding:
  - keep to the visual language in `docs/visuals/` (dots are cells, outlines or bands are assemblies, red is heat,
    dashed rings are predicted but not there, sliced cells show segments);
  - explain each one as a walkthrough ("press this, look at that");
  - save one only when he confirms; saved pages carry the walkthrough and a story.
- **Puppeteering only to narrow in,** always declared, and never a claim resting on it. He wants to avoid "smoke and
  mirrors": results that look like wins but rest on hand-holding, bookkeeping or the truth.
- **Pre-register:** predictions written after a development seed and before test seeds; changes made on the development
  seed declared.
- **Examples use people, animals and things,** not heat words.
- **Brief answers when he asks for brief;** when he uses voice, prose rather than bullet points.

---

## 6. Lessons from the session worth keeping

- Learn from winners: a cell predicted only through a burst must still learn its context (C79).
- Keep sequence segments (predicting the next input) apart from assembly segments (completing the present) (C81).
- A region that both marks boundaries and lets go spoils its own boundaries; use two regions (C81).
- Competition cannot fix chance overlap between memories; only more cells per column can (C77). It is needed where a
  part is genuinely shared (C78).
- Surprise stops marking word boundaries once every possible first letter is predicted; the breadth of prediction (the
  second kind of heat) keeps marking them (C80).
- Two cells per part is the smallest binding that completes, and the cleanest (C76).
- The search over openings in fitting was overhead; competition does the work (C75).

---

## 7. Other open problems (from the models and theories)

- Holding a variable open (frames, RM-10).
- A local rather than global level of inhibition (RM-5).
- Rest as replay (RM-8).
- Shifts without offsets, for pictures.
- How long context is held, and the creep (RM-1).
- When to bind, from the region's own state (RM-7).
- The first distillation, D-01 ([docs/distillation](../distillation/README.md)), paused since step 1.
- The bookkeeping still in the core ("Today against the contract" in CTR-1).
