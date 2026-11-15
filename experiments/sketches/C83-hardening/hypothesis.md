# C83 · Hardening by repetition: hypothesis

Written 15 November 2026, after C82. Loosening (C82) lets a variable be rebound cheaply, but it can't tell a fast bond
from a lasting one: "ABCD", built from "AB" and "CD" and seen once, is forgotten as soon as "ABEF" arrives. The owner's
idea: bonds form freely while things are hot and break easily, and the ones that keep fitting harden as they cool.
Segments carry no strength (CTR-1 CON-9), so hardness has to be structural: a bond seen many times is backed by more
segments, and loosening takes one at a time.

**The change (one, on top of C82's, in `engine/volume.js`):** a whole wholly seen again, made of parts, is tied again
from them: a handle from each part, as in any tie (RM-7). Its parts are read from each cell's first completing segment
(the part it was first tied into). That reading is declared, and is not in any model.

**Hypothesis:**
- a bond seen once breaks at the first clash, as in C82;
- a bond seen many times survives a clash;
- so "ABCD" seen several times survives "ABEF", and "ABC" still brings back "D";
- the price is structure: every repetition adds segments.

**Seen on the development seed, before the PREREG:** after the first clash, "x" seen with "5" is a whole wholly seen,
and the old "x = 3" loses to it by share (RM-5), so it isn't brought back and isn't heated again. A bond that survives
the first clash is then never loosened further: the old value and the new one are both brought back from then on. The
re-ties also pick their handles afresh, so the extra segments don't always stack on the same cells.

Predictions in [PREREG.txt](PREREG.txt).
