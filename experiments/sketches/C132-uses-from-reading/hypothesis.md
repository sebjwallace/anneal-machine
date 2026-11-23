# C132 · Uses from reading: hypothesis

Distillation [D-03](../../../docs/distillation/D-03-buffer-annealing.md), V13: the floor of three letters on anneal
partners, hidden in the three-letter index since C118 and found in C131.

## Why

Without the floor (C131), the learning collapsed: on *Alice*, "the" was read inside a piece 2% of the time. Since
C125, cost as surprise counts a use each time a piece is read, and also each time anneal forms or reuses a piece. With
partners sharing only two letters, anneal's shared part is often a common pair such as "th" or "he", already held and
reused. Each such anneal counts another use of the pair, thousands of times over. The pairs become so cheap that
reading prefers `[th]e` to `[the]`, and "the" is never read, so never used, so it stays dear.

## The change

A use is counted only when a piece is read: when it explains the input. Anneal forming or reusing a piece is the
memory building structure, not the input being explained, so it no longer counts. This removes a rule (the anneal
credit of C125), and adds nothing. Run with and without the floor.

## Also: the yardstick

C131 found that energy as measured (memory plus the cost of describing the unseen tenth) can rate learning less as
better. The contract defines energy as what the machine keeps plus what it costs to explain what it receives (CTR-1
DEF-1): all of it, not a tenth. So this experiment also reports **energy over the whole book**: memory plus the cost of
describing every sentence, learnt or unseen, with the final memory. The tenth-only figure is kept beside it.

## Predictions

1. With uses only from reading, the collapse goes: without the floor, energy over the whole book within 2% of C131
   with the floor.
2. Energy over the whole book ranks the four settings the same way the reading measures do.

**Survives if** 1 holds on both books. Then the floor can go.
