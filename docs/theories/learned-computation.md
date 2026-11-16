# Learned computation

A theory note, worked out in conversation between the owner and the assistant. **Not built or tested** except where a
section says so. It records the owner's step from transition memory to computation: the binding problem, and how
associative memory answers it without registers or pointers. It also records the principle that composition and
decomposition, shown so far across a picture, apply through transitions in time.

Related: [persistent assemblies](persistent-assemblies.md), [cells first](cells-first.md) (frames, the cut),
[learnt logic](learnt-logic.md), [decision 009](../decisions/009-no-context-in-cells.md) (no context in cells), C82
(rebinding a variable), C92 and C93 (a variable held open), C101 (held states).

---

## 1. The problem: what points at 5?

The owner's question, in his words: when we say "x + 2", how do we know that it is the 5 that is being read, and not the
"x"? Using "x" (and "+") as keys into memory will bring 5 back: 5 joins the active assembly. But that doesn't mean "x"
resolves to 5. What places 5 there? What writes to "x", and what reads from it? Only the bond from "x" points at 5;
nothing in "+" or in "2" points at it. And "x" may itself have been seen in the "+" frame before, as may "y" or any
number.

This is the **binding problem**, and without an answer to it there is no computation: values have to be put into
places, read out of them, and operated on.

**The trap.** The owner's own diagnosis: the picture of a CPU (registers, RAM, addresses, a pointer from a name to a
value) was too fixed in mind. In that picture something must point at 5. In an associative machine nothing needs to.

## 2. The walk-through: "x = 5", "y = 3", then "x − y"

Inputs arrive one at a time.

1. **"x = 5": writing is bonding.** "x" and 5 are active together and are bonded: a few fast links between their cells
   (C82's rebinding showed exactly one value held at a time, 100%, when the old bond is loosened as the new one is made).
   The bond simply stays: nothing pushes on it, so it persists across any number of steps (transition memory: a state
   persists until something changes it).
2. **"y = 3":** the same, for "y" and 3, on other cells.
3. **"x" arrives: reading is completion.** Its bond brings 5 back. This is the ordinary work of associative memory: part
   of an assembly brings back the rest. No separate "resolve x" step: "x" is a cue.
4. **"−" arrives: it ties in, and it waits.** An operator has met many numbers, so it is associated with numbers in
   general: directly with those it has seen, and through the abstract assembly of numbers with the rest (operators are
   selective for the domain they operate on). So "−" ties into what is already active, and 5 becomes what is before it.
   At the same time "−" primes forward: it is waiting for a number.
5. **"y" arrives and brings back 3,** and 3 lands in the whole that is forming with the waiting "−". It is the tighter
   fit: it is what "−" was waiting for. 5 is still active, but it belongs to the earlier part of the forming whole.
6. **The answer is association.** "5, then −, then 3" is now active as one whole, and because "5 − 3 = 2" has been met
   before (memorised, as arithmetic facts are), that whole is associated with 2. **2 becomes primed:** warm, expected, not
   yet surfaced, until something such as "=" or a question brings it up (the warm layer, C92 and C93: held below the
   surface until one more input tips it).

**Order comes from time.** "5 − 3" and "3 − 5" use the same three things; an AND over them as a set could not tell them
apart. Arriving in order, they differ: in "5 − 3", 5 is what was already held when "−" arrived and 3 is what came after;
in "3 − 5", the reverse. A transition reads **what was held plus what has just arrived**, so the two give different
results. (An earlier proposal in the same conversation got order from context cells, the cell of "−" depending on what
came before; that is ruled out by decision 009, and held states do the same job without it.)

**Why decision 009 matters here.** If context were carried in cells, the "x" in "x − y" would be a different cell from the
"x" in "x = 5", and its bond to 5 would not be reached. With each thing the same cells wherever it appears, the bond is
always reachable.

## 3. What this says: computation is association

- **A place is something waiting to be filled:** an operator that has tied in and primes what comes next.
- **A value is what is bonded now:** written by bonding, read by completion, replaced by loosening and rebinding.
- **An answer is what the whole is associated with,** primed before it lands.
- **Computing is chaining:** when one result can be the input to the next (the ripple of transition memory: one state
  changes, and whatever depends on it shifts to fit), small learned facts compose into larger computations. Multi-digit
  arithmetic is the same facts chained digit by digit, with the carry as a small state that persists until the next
  digit uses it.
- **It is implicit,** in the owner's word: not a program executed, but activity building up. The owner's further thought,
  for another time: such chains could form loops, guided by overarching top-down context.

So the machine's computation is **learned**: it learns facts and transitions from what it meets, and computing is those
associations running, in order, through what is held.

## 4. Composition and decomposition over time (the principle, not yet built)

The owner's earlier experiments did composition (Sagan's synthesis) and decomposition (Sagan's analysis) across the
columns of a picture, one scene at a time: a house and a shed cut where they share a wall (RM-8), a whole tied from
handles on its parts (RM-7). Text has no picture: only a sequence of activity. **The principle still applies; it happens
through transitions instead of across space.** The machinery is the same, with the dimension flipped.

- **Synthesis over time:** what recurs in succession is composed: "c" then "a" becomes "ca"; "ca" then "t" becomes "cat",
  units built from units, in the same way as larger wholes are tied from parts in space.
- **Analysis over time:** "cat", "can", "cal" share "ca" and then go different ways, so the cut over transitions gives
  "ca" as the constant and the place after it as a variable whose type is whatever has followed: a frame in time, as
  "AB" with its endings was a frame in space (C92, C93). The leftover endings are not noise; they are the variable part.
- **What the core lacks for it,** read from the code: grouping (which cells belong to one memory) counts only links
  between cells active at the same moment, never the links to what was active a moment ago, so tying and cutting never see
  across a moment; and the cut is only wired within a moment, though its three conditions (what fits, what was expected
  and isn't there, what the input has of its own) all exist over time.
- **What the session's experiments suggest:** holding single letters side by side is not enough (C101 worked with rivals
  but broke with noise; holding by bonds alone was unreliable, in sketches not kept). In the owner's picture "a" stays
  active while "b", "c" and "d" arrive because "a b c d" is one whole; held as a whole, its support would last as long as
  the whole is arriving. So **holding and composing over time are the same problem from two sides.**

Combined, a transition memory whose states can be composed and decomposed into assemblies, sub-assemblies and
super-assemblies, with variables and arithmetic done by association, is the route the owner sees into learned
computation.

## 5. Open questions

1. **Which state does an input change?** "ran to the door" should change the cat's place, not the dog's. Heat going where
   the misfit is answers part of it; with two of the same kind in play, something has to decide which fits.
2. **Two of the same kind at once** ("the cat" and "the other cat"; two different 5s): several instances active together.
   Freeing cells from carrying context (decision 009) leaves room for this.
3. **Transitions that generalise:** "the cat ran to the door" and "the dog ran to the garden" should teach one transition
   ("an animal ran to a place" sets where the animal is). That needs frames and types: the cut first, then the transition
   learned over the frame. The same holds for arithmetic: "x holding a value, then 'x = something'" becoming "x holding that
   something" covers every value; "x with 3 becomes x with 5" covers one.
4. **What carries no information should count for little:** a letter (or "the") that can be followed by anything says
   little about what comes next, and noise that comes before everything says little about where anything stands. The
   owner's caution: weighing this must come from structure (counted structure, sparse bonds), never from the slow
   averaging his machine avoids.
5. **Reading and writing must be learned, not modes:** "x" in "x = 5" is written, in "x + 2" read; the frame around "x"
   decides, as two learned transitions, not as built-in modes.
