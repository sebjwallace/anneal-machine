# C127 · Spelled pieces: hypothesis

## What the audit after C126 found

Since C123, the engine copy's `readBuffer` has treated every held state of two or more members as a piece. It matched
each one against the buffer by the letters of its members. Two kinds of state do not spell anything, so their letters
make a string that never occurred.

The first is a **composition**. When anneal splits two wholes, it also forms a state that recognises each whole from
its parts. Following the Go engine, it takes about the first half of each part's members (`composeFrom`). That works as
a recognition state, because its gate opens once enough of it is counted. But its members are not a spelling. A whole
cut into "hap" and "pen" is recognised from "ha" and "pe", so its letters read "hape". The copy filed "hape" in the
reading index as if it were a piece.

The second is a **long word whose letter needs more members than its population has**. With 8 members per letter, a
raw stretch holding nine "e"s comes round to the first member again. The state holds each member once, so its letters
lose the repeats. The chain holds them all.

A probe on C126's *Buster Brown* run found 98 of the 1,357 held patterns to be strings like these, which occur nowhere
in the hot stretches the engine took in. Examples are "hape", "mouh", "saidin", "joot" and
"comfortablbdoflavand...". They make up 826 of the 6,504 letters held, about 13%.

Reading is barely touched: only 3 of the 1,831 pieces read on the unseen tenth were phantoms, because a mangled string
rarely matches real text. The bookkeeping is touched more. Phantoms are counted in memory, on the yardstick's memory
side. They can be chosen as anneal partners. They are counted when the energy rule asks how many held patterns contain
a piece. And they can make a hot stretch look already held.

The audit also found that a hot stretch counted as seen again was credited twice: once as its loose letters, when it
was read, and once as the piece. A line of dead code was removed too.

## The fix, from the engine's own structure

Every honest spelling in the engine has a chain beside its state. `declareWord` forms both, and so do anneal's parts
(`reuseOrForm`, and reuse forms the chain if it is missing). A composition's chains are broken at each part boundary,
so none runs over its whole state. The rule is therefore:

**A state is a piece only when a chain was formed over the same members in order, repeats aside. The piece's text is
that chain's letters.**

This needs no new idea. It reads what the engine already holds. Compositions stay what they are, recognition states
that invoke can use, but they are no longer read as text or priced. A long word is read by its full spelling. The
engine's own rules are unchanged (invoke, anneal, reuse, what is formed), and `check/` still matches the Go engine.

The experiment follows the same rule everywhere it handles held patterns: partner choice, the energy rule's count,
the seen-again test and memory. Anneal is given chains rather than state members, so a long stretch keeps its repeated
letters.

The double credit is fixed by crediting a stretch seen again as the piece instead of its letters: its letters' uses
are taken back.

## What is expected

Phantoms fall to zero. Memory falls by roughly the share the phantoms held. Much of that fall is bookkeeping, not
better learning, and it should be read that way.

Reading on unseen text should change little, since phantoms were hardly ever read. If C126's reading figures were
propped up by phantoms, they will drop here. If they hold, C126's conclusions stand.

## Runs

Three settings on each book, everything else as in C126: C126 as it was (`new Memory({ spelled: false })`, which must
reproduce C126's figures exactly), then spelled pieces only, then spelled pieces with the single credit as well.
