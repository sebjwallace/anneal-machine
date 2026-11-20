# Understandable by design

A theory note, from a conversation between the owner and the assistant. It sits alongside
[explainable by design](explainable-by-design.md). **Nothing here has been tested.** It names a second goal: not only
can the machine say *why* it did something, but *what it knows* can be explored directly, by people and agents, through
tools that plug into its structure. The note proposes the contract clauses that follow (CTR-1 GOL-6 and OPZ-7, drafts).

Related: [explainable by design](explainable-by-design.md) (AMP and AMX, the record of changes),
[categories from context](categories-from-context.md), [assemblies first](assemblies-first.md), the
[language](../../language/README.md) ([walkthrough](../../language/walkthrough.md) step 7, asking an assembly what it is).

---

## 1. Two different questions

| | Explainability | Understandability |
|---|---|---|
| **Asks** | *why* did it do that? | *what* does it know? |
| **About** | one activation, one change, one decision | the shape of everything it has built |
| **Answered by** | the exact cause: a gate's guest list against what was active; the gap a new assembly filled | navigating its structure: concepts, what they are grouped with, the frames they appear in, where they were learnt |
| **In AMX** | `WHY`, the trace, the record of changes | naming by invoking, following frames and alternatives, folding, links back to sources |

You can have the first without the second. A system can trace every step and still leave you none the wiser about what
it has learnt overall. The owner sees understandability as a goal in its own right, sitting next to explainability.

## 2. The open box

**The owner's framing.** With today's large language models, knowledge comes second-hand: you read what the model
produced, and there is a process of transferring that knowledge to yourself through its output. Even when it is right,
you can't check what's underneath, because the model is largely a black box.

Here, **the structure is the knowledge.** The assemblies, frames, alternatives and categories the machine builds while
reading are its model of the domain. With a tool that plugs into that structure, you are looking at the model itself,
not a description of it. In the owner's words, you go into its mind. Not a black box, an **open box**.

**A capability, not the core.** Understandability is not built into AMP's mechanics. It is a capability the structure
makes possible, reached through AMX tools that read it. The core stays as it is: invoke and resolve. The tools sit
outside and never feed back.

**Not an after-effect.** The machine doesn't generate artefacts for you to understand afterwards, such as summaries,
reports or explanations. You understand it by exploring what it built. Where summaries are needed at scale (§5), they
are built *from* the structure, not generated *on top of* it.

## 3. Human in the loop

When the machine comes to a global resolution, a solution, people and agents should be able to understand **both the
problem and the solution** clearly, from the structure that was developed:

- **the problem as the machine represented it**: what was incomplete, which assemblies were involved, which competed;
- **the structure that resolved it**: what formed, from what comparison, linking which parts.

That gives human-in-the-loop a concrete meaning. A person doesn't have to trust an answer. They can inspect how it was
reached, and what the machine believed about the problem when it reached it.

## 4. A first use case: learning a new domain

**The owner's idea.** Entering a new domain, there is a lot to read, and a person has to do by hand what the engine
would do: make connections between everything. Instead, the engine reads the documents and builds the structure, and the
person **navigates it while still reading the documents**, now with a structured way through them.

**What the map would hold:**
- terms, as assemblies;
- the frames they appear in, and the alternatives that fill those frames;
- categories that formed implicitly, and the words grounded in them
  ([categories from context](categories-from-context.md));
- **links back to sources**: every assembly records where it formed, so each concept leads to the exact passages that
  taught it.

**How it would be used.** Start at a concept. See what it is grouped with, the frames it appears in, and what else appears
there. Jump to the sentences behind any of it. This is reading the documents through their own structure, not replacing
them with a summary.

**How it differs from existing tools.** Knowledge graphs are usually built by hand, or by a language model guessing
relations. Summaries lose the source. Here the map is the model itself, every link has an exact cause, and nothing is
invented. It is also close to the owner's comparison-based learning paths: the intersections and alternatives resolve
forms are exactly the comparisons that teach.

**Why it isn't near-term yet:**
- **The language first.** From letters, a fresh machine reading technical documents would spend almost everything on
  spelling and grammar. Either it reads general text first, or word-level populations are declared for this use. That
  is legitimate if declared, but a real choice.
- **Scale is untested.** The categories mechanism hasn't run even on a toy world. A domain's worth of documents is a big
  step up, and crosstalk could make the map muddy.
- **A viewer is needed**, built for navigating structure.

So it is a **target for the AMX ladder**, not a promise. Once reading and the categories test work, the next world is a
small domain corpus, a few dozen pages on one topic.

## 5. Honest limits

- **Open isn't the same as easy to understand.** The machine's categories will be fuzzy, overlapping, and sometimes unlike
  human ones (early "animal" includes "man"). Raw assemblies will often be bewildering. Understandability needs tools:
  naming by invoking, following frames and alternatives, **folding** many small assemblies into the few that matter.
  That is real work in AMX.
- **There is still a transfer, just a shorter one, and grounded.** Instead of reading an answer and trusting it, you
  navigate structure that links back to its sources. It is understanding by exploring, not by being told.
- **Scale.** A small domain may be navigable directly. A large one needs summaries of the structure, which are themselves
  a kind of artefact. The difference is that they are built from the structure and can be checked against it.
- **Understood is not the same as correct.** As with explainability, seeing exactly what the machine believes lets a
  mistake be found. It doesn't prevent one.

## 6. In the contract

Proposed for CTR-1, each marked draft until the owner signs:

- **GOL-6 · Understandable** *(goal)*: what it has learnt can be explored directly, by people and agents, through tools
  that read its structure, not through artefacts it generates.
- **OPZ-7 · Understanding** *(optimization)*: make that exploration as easy as possible at scale: few steps from any
  concept to its neighbours, its frames and its sources.

## 7. How it could be tested

Harder to measure than explainability, but not impossible:

- **Recovery.** In an AMX world with a known grammar, how many of the grammar's real units and categories can be found
  by navigating the structure, and how many navigation steps it takes.
- **Sources.** For a sample of assemblies, the links back to the passages that formed them are exact: the passages
  really do contain what the assembly holds.
- **Usefulness, later.** On a small real domain corpus, whether a person finds answers to questions about the domain
  faster with the map than with the documents alone. Questions fixed before the map is built.

## 8. Open questions

1. **Folding.** How many small assemblies are gathered into the few that matter, using only the structure (overlap,
   frames), with no tuned numbers.
2. **The viewer.** What navigating a web of assemblies looks like to a person, given it isn't a tree.
3. **Alien categories.** When the machine's categories don't match human ones, should the tool show them as they are, or
   help a person map them onto their own? (The first is more honest; the second may be more useful.)
4. **Where GOL-6 and OPZ-7 sit** in priority among the others in CTR-1.
