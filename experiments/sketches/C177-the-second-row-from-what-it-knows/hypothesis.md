# C177 · The second row from what it knows: hypothesis

Written before the run, after the build check (`sanity.js`, which also found the fix below). Date: 2026-11-27.

## The question

C176 showed learning transfer inside one memory, but between two lessons that look almost the same. The second row of
long multiplication is the real test. It differs from anything the memory knows in five parts, and blind search needed
about 137,000 tries for it (C172). Can the memory that has learned adding and times one digit get the second row by
adapting what comes up, with the adapting guided by heat rather than by my code trying everything?

## The setup

- **One memory** (C176's design, tie-break arm), in school order:
  1. adding (C176's two examples);
  2. times one digit (C176's two examples);
  3. the second row (C172's two examples).
- **A second-row lesson:** the page shows the question with the first row already done. The composition and the start
  (one column left of the first row's start) are given; they were learned separately in C171. The second row and its
  carries are the target.
- **Per worked example:** the memory tries what the start brings up. Then the offers (every kept frame the start brought
  up as a rival). If none settles, it adapts the one the start brought up.
- **Adapting, guided by heat** (the code's proposing, declared; it replaces C176's one-part variation):
  - a write (the answer or the carry) may move only to a place of the working still to be done (heat);
  - a read only to a place holding a digit, and the sign read only to a place holding a sign;
  - holding or not, and the direction of the move, may flip.
  - Each part changes on its own. Nothing is grouped: no part is moved because another moved.
  - A change is kept if more of the working cools (C171's agreement). If no single change cools more, pairs of changes
    are tried. Rounds repeat until the page settles, with a limit of 12 rounds.
  - Ties go to the first in a fixed order (declared).
  - Each change is tried as a new frame cell offered with the cue, and binding keeps the one that settles.
- **Tests,** in the same memory: 200 adding, 200 times one digit, and 200 second rows. The second rows are run twice:
  once from the start (recall), and once with the learned way of working offered.

### A fix found by the build check (before the run, disclosed)

Trying an offer ran alongside whatever the start recalled. The view at the start gave a kept frame enough support to
start working in the same run. In the build check, a kept second-row frame did the work while times one digit was being
tried, so times one digit appeared to settle a second-row page. Now, when an offer is tried, the view isn't given with
the cue, so nothing kept starts working alongside it. Rechecked: times one digit offered on a second-row page settles 0
of 10, and the kept second-row way of working settles 10 of 10. C176's runs predate this and could have been affected
only in its tie-break arm's offers. Its diagnosis found the passenger there was inert (its parts never came on).

## Predictions

1. Adding and times one digit as C176 (times one digit in about 12 runs).
2. **Second row, first example:**
   - the start brings up times one digit (same view, "×");
   - it settles nothing, cools nothing (its writes land on the first row), and no offer settles.
   - **Adapting:** no single change cools more, because the answer must move down and the top must be read one place
     over together before any digit agrees. So a pair of changes is needed first: the write to the second row's answer
     place and the second read one place right. Then single changes: the carry write to the carries row, the carry read
     to where it's written. Then it settles.
   - **About 1,000 to 3,000 tries, against 137,000 blind and 15,600 in C174's recount.**
   - The big risk: a coincidence early on (a digit that agrees by chance) leads the adapting astray, and it gets stuck.
     If so, it's reported as stuck.
3. **Second example:** the start brings up times one digit again. It has more copies than the new second-row way of
   working, and both were seen with "×". It fails, the offers include the new one, and that settles.
4. **Tests:**
   - Adding and times one digit stay 200 of 200.
   - Second rows with the learned way of working offered: 200 of 200.
   - **Second rows from the start: mostly wrong.** The view (just the sign) can't tell a first row from a second row,
     so the start brings up times one digit, which has more copies. This is the context problem of C164, still open.

## The ledger (planned)

**Removed:** C176's one-part variation over every place. Changes to writes are now limited to where the heat is.

**Given:**
- the adapting's proposing and ranking (the code's);
- the start and composition of the second row;
- the first row on the page (the encoder);
- the view, target, sheets and lesson order;
- the facts;
- the vocabulary and frame cells made in advance;
- the tie-break;
- lesson 1's first search.
