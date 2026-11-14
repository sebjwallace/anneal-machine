# Contracts

What the owner agrees shapes Anneal, in the form of Sandkit's domain contract (domain-discovery practice). Each is a
target: the essential shape of something, which today's code may not yet fulfil. The code is one way of fulfilling it
and could be rewritten in any language or paradigm. A new idea must fit a contract, or show it has a gap, or correct
it; a contract changes only when its parties agree (an amendment is a new contract that supersedes the old one).

Every clause has a code, and clauses cite each other and the definitions by code. Order is priority within each list.
The assistant drafts and never signs.

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
