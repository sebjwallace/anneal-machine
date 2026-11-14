# RM-5 · Competition

**For:** choosing among candidates, so that answers are sharp and whole memories win or lose together.
**Serves:**
- CTR-1 CON-7 (don't guess);
- CAP-3;
- CON-19.

## Two kinds
```
within a column:
    of a column's candidate cells, the one with the most support wins
    if the top two tie, the column has no winner (refused)

between whole memories (one shared level of support):
    top = the candidates in a round at the top level of support
    # every cell of the best-matching memory reaches the same, highest support, so the memory joins whole
    rivals: two top cells are rivals if neither's firing segment holds a link from the other
            (they belong to different memories), and they compete for the same column, or the same cells
    if any rivals are in top: those rivals do not join (a tie is refused, CON-7); the rest of top joins
    else: all of top joins
```

For bindings (RM-7), the same idea compares binding segments:
```
of the binding segments firing in a round, only those with the highest share of their links active may fire
```
This is how a part shared by two compositions brings back the right one: the composition with more of its binding active
wins.

## When it helps, and when it can't
- **It is needed where a part is genuinely shared.** The wall shared by a house and a shed wakes both; competition
  between whole memories picks the right one (C78: the other roof came back in 0-4%).
- **It cannot fix chance overlap.** When cells are reused by chance, an intruding memory gets the same support as a true
  one. Only more cells per column fixes that (C77: competition added nothing and cost about 25 times the work).
- **It replaces caps given by hand.** In C73 an answer was capped at 8 columns; with the top level instead, answers sized
  themselves (C74: 7.6 cells).

## Rules a rebuild must keep
- **No number chooses how many winners:** the top level does.
- **A tie between rivals that exclude each other is refused, not broken by order.** Rivals that can both be right (two
  parts that only overlap) are not a tie: taking one shrinks the other, it doesn't rule it out.

## Evidence
C73, C74, C77, C78.

## Open
- **Rivals that can both be right.** Two memories that only overlap (taking one shrinks the other, it doesn't rule it
  out) are not a tie. The test above (different memories, the same column or cells) is the proposed local form. Not yet
  tested.
- **The shared level is one number over all candidates: global.** Whether it can be local, spanning a region or a
  neighbourhood, is open.
- **Binding segments compare as bindings because they carry a kind label** (RM-2). Whether that label can go is open.
