# C159 · Context picks the frame (a taste): hypothesis

Follows [C158](../C158-only-the-parts-it-uses/findings.md). The memory now holds two ways of working a column that
can't stand in for each other: a **reading** frame (reads the bottom digit fresh every column; adds and subtracts) and a
**holding** frame (holds the multiplier for the whole row; multiplies, including long multiplication's first row).
Recall from the cue alone completes into whichever has been reinforced most recently, so one kind of sum always fails.
The owner's transition-memory picture says a cue plus context should decide which state the memory completes into.

**A taste, by agreement with the owner:** a quick first indication rather than a thorough run.

## The idea

When a frame settles a worked sum, it is bound together with **what was in view at the start**: the content of every
place the frame can reach from the starting column, on the page as given (not the working). Nothing picks which of
those places matter. Recall is then from the cue plus what's in view on the new sum, kept in view for the whole of
recall. In this engine, a remembered frame gets credit for each of its members that's on and loses credit for each one
that isn't, so a frame stored with a similar page gets more support. If the sign is what matters, that has to come out
of overlap: the sign is the same across every sum a frame worked, and the digits vary.

## Setup (and what's given)

**Given, declared:** the two frames as C158 learned them (not relearned here, which is the shortcut that makes this a
taste), the signs' meanings, and binding the start view with the frame (fixed architecture, like the existing binding
rule). Per seed: 8 worked sums ("+", "−", "×" one digit, long first row, twice over), each run in the lanes with both
frames; whichever settles binds itself with its view. 4 seeds. Test: 20 new sums of each kind, recalled with the view
and, for comparison, from the cue alone.

## Predictions (fixed before running)

1. **With the view, each kind recalls its own frame:** "+" and "−" the reading frame, "×" and long rows the holding
   frame, and all four kinds come out right.
2. **From the cue alone,** one frame is recalled for everything (or nothing on a tie), as in C158.
3. **The risk:** remembered views of different sizes. A frame stored with fewer things in view has fewer members to
   miss, so it may win regardless (the same effect that made the leaner frame win in C158). Single-digit
   multiplications have the emptiest pages, so the holding frame might be favoured everywhere.
