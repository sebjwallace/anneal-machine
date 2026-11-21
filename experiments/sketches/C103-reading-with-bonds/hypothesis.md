# C103 · Reading with bonds only: hypothesis

Written before running. The owner's idea: while reading, don't form assemblies and don't anneal; form only bonds, letter
to letter, so noise leaves a trace without filling the memory. A pattern then shows itself as **prediction**: input seen
before arrives expected instead of bursting. Is there a point where an assembly could be made from what emerges?

## Rules (fixed before running)

- Reading forms bonds only: a bond is a two-member transition from the member standing for one letter to the member
  standing for the next. No assemblies.
- A predicted letter (a gate expected one of its members) is that member; no bond forms.
- A letter that bursts (nothing expected it) has its member settled by what follows: if the next letter is predicted
  from one of the burst population's members, that member is it (bond into it from the letter before); otherwise it
  takes the population's next member (the owner's in-order rule), bonded from the letter before.
- Refractory period off (gates read only the moment before); no budget.
- A predicted stretch: consecutive predicted letters, with the burst letter they continue from.

## Predictions: "the cat the dog the bird the mouse", read three times in a row

| | Prediction |
|---|---|
| P1 | Pass 1: the first "the cat " bursts throughout; the 2nd "the " has h, e, space predicted (t settled as the first "t" by what follows); the 3rd and 4th "the " are predicted in full, t included (a space at a word's end now leads to "the"). |
| P2 | Pass 1 forms 22 bonds, including a fork: the space after "the" leads on to c, d, b and m. |
| P3 | No word splices into another: "bird" ends on its own "d" member, not dog's. |
| P4 | Pass 2: the only letters that burst are the first "t" (nothing led into it yet) and the first letter after each "the ": the fork's four bonds compete as alternatives, tie, and are held. Pass 2 forms 1 bond (from mouse's last "e" to "t"). |
| P5 | Pass 3: only the four letters after "the " burst, and no bonds form. That heat doesn't go away: it is genuine ambiguity (which animal?), which only context could settle. |
| P6 | Predicted stretches in pass 2 cross word boundaries ("cat the "), because in this text each word is always followed by "the ". What recurs is what the data repeats, not words as such. |
| P7 | Random letters (noise): almost nothing predicted on a second pass of fresh noise; a bond per letter, heat stays near its maximum. The same noise read twice: the second pass is predicted. |

## What could fool us

- The fork tie (P4) depends on competition by order treating bonds that leave the same member as rivals; if it
  doesn't, the fork would bring on all four letters at once instead of none.
- Settling a burst letter by what follows looks one moment ahead; it must use only what the gates did, never the
  text itself.
