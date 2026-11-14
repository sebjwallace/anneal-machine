# Contracts

What the owner agrees shapes Anneal, in the form of Sandkit's domain contract (domain-discovery practice). Each is a
target: the essential shape of something, which today's code may not yet fulfil. The code is one way of fulfilling it
and could be rewritten in any language or paradigm. A new idea must fit a contract, or show it has a gap, or correct
it; a contract changes only when its parties agree (an amendment is a new contract that supersedes the old one).

Every clause has a code, and clauses cite each other and the definitions by code. A code is a name, not a position: a
clause keeps its code when it moves, so what cites it (the ledger, findings, distillations) stays right. The assistant
drafts and never signs.

## How the lists are ordered
- **From general to specific**, in every list. The first clauses are the ones any rebuild must get right; the later
  ones are more particular (about cells, hardware, one kind of memory). A specific clause low in a list is fine: it is
  there because a rebuild that forgot it would fall short, not because it matters as much as those above it.
- **Goals and optimizations are also in order of priority.** They are not equally binding: there is leeway in each.
  When two pull against each other and one has to give, the higher one wins, and the findings say which gave way and
  by how much. A large loss to the higher one is never bought with a small gain to the lower.
- **Principles** are in order too: when two preferences pull different ways, the higher one is preferred.
- **Constraints have no priority among themselves**, because none gives way. They are grouped as limits (what is
  impossible for any learner), then rules (what we choose), then conflicts (what would break another clause), and
  general to specific within each group.
- **Capabilities** are general to specific, the core ones first. Nothing must use them, so they have no priority.

## How the parts fit
Each part of a contract answers a different question, so they don't overlap:
- **Goals** and **optimizations** say where to go: a goal is reached and then done; an optimization is a direction,
  never finished, balanced against the others.
- **Constraints** say which options are off the table: rules we choose, limits that are impossible, and options that
  would break another clause. Each says what violating it costs.
- **Capabilities** say which options are on the table: what the system can use to move towards its goals more easily.
  They are soft (nothing must use them), but forgetting one makes the goals harder. Each says what it gives and costs.
- **Principles** say which of the valid options to prefer when several are open and pull different ways, including in
  situations nobody foresaw. Each says what it gives way to.

The test for where a clause belongs: if it may never give way, it is a constraint; if it is something the system can
use, a capability; if it is a direction, an optimization; if it is a preference, a principle. **Definitions** fix the
words, so a reader coming to it cold fills no gaps with their own meanings.

| Contract | About | Status |
|---|---|---|
| [CTR-1 · The system](system.md) | The machine itself: what it achieves, optimizes, can do, may not do, and chooses by. Independent of how anyone builds it. **The more important one.** | proposed |
| [CTR-2 · The practice](practice.md) | How we develop it here (with AI agents): evidence, puppeteering, the core and the branch, how we talk. Someone else could build CTR-1 with a different practice, or none. | proposed |

How the contracts came to be, clause by clause, is in the [ledger](../ledger/README.md).
