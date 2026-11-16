# C101 · Held states: hypothesis

A rough sketch, not preregistered. The first experiment after [decision 009](../../../docs/decisions/009-no-context-in-cells.md):
no context in cells. Every letter is its own assembly, the same two cells wherever it turns up. Context is held: what
came before stays active as its own assemblies, because nothing has changed it (the owner's transition memory).

**The question the owner set:** in "x a b y" and "n a b t", "a b" is shared, so after "a b" the next letter is
ambiguous unless something carries what came first. Can held states carry it, and can holding stay bounded with no
clock, no cap and no price, by letting a held state go only when a rival of the same kind takes its place?

**The mechanism** (`run.js`, a small engine on the project's principles: cells, segments, the bar of two, competition by
share; not the core). When a letter arrives that wasn't predicted alone, each of its cells grows two segments:
- a **step** segment, over the letter that arrived just before it: what can follow what;
- a **context** segment, over everything active the moment before, held states included: which of those it was.

To predict: a letter is a candidate if its step segment fires (its letter just arrived, or is still held); among the
candidates, the one whose context segment has the largest share of its links active wins, and a tie is held as a tie.
A transition reads "held plus new".

**How held states go (the arms):**
- **moment:** nothing is held past one moment (the one-step baseline; "a b" should stay ambiguous).
- **never:** nothing is let go (the pile-up baseline).
- **given rivals:** each letter has a kind given by hand (context letters, middle letters, end letters, noise), and a new
  letter replaces held letters of its kind. A ceiling, puppeteered, declared: no claim rests on it.
- **learnt rivals:** two letters are rivals when they have followed the same letter (their step segments share a
  predecessor): they stand in the same place. A new letter replaces held letters that are its rivals, and itself if
  already held. Nothing about kinds is given.

**The world.** Episodes, one letter at a time: a context letter, the shared middle, then the end letter that context
decides ("x" → "y", "n" → "t", and so on for K contexts). Noise letters can be slipped in between the middle letters and
between episodes. Scored over the last third: whether, at an episode's last letter, the prediction was exactly that
letter; and how many letters are held.

**Expected.** moment: about 1/K at the end. never: right, but holding grows. given rivals: right and small. learnt
rivals: the test; expected risk: noise letters follow everything, so they may become rivals of the context letters and
knock them out.
