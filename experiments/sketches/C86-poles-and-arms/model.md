# C86 · Draft model: one volume fed by another (written before the code)

**For:** the [flow and heat](../../../docs/theories/flow-and-heat.md) poles and arms: slow, settled structure (the
poles) and fast, temporary bonds that work on top of it (the arms), as two volumes of the same machinery.

**The rule, in cells:**
```
two volumes, slow and fast, each the core's volume (RM-1 to RM-8), unchanged except:
    fast: loosening on (C82): a joint that brings back what the input has replaced loses one segment per cell
    slow: as the core
wiring (fixed architecture):
    the fast volume has one column for each cell of the slow volume
each moment:
    the slow volume receives the input
    the fast volume receives the slow volume's winners: the cells that won their columns
        (what was seen and settled; never what was only brought back: CON-8)
reading:
    what the fast volume brings back is cells of the slow volume: the slow memories it points at
```
- Nothing loops over everything; nothing is kept in a list. The fast volume's input is the slow volume's own report of
  which cells won, which is the activity a downstream volume would see.
- The fast volume relearns nothing about what things are: its assemblies are over the slow volume's cells, so a tie
  between "x" and "5" there links handles on two slow memories.

**Not in this model (open):** how what settles in the fast volume sinks into the slow one. In this experiment the slow
volume either goes on learning by the core's rules (arm "slow learns") or stops after its teaching (arm "slow set"),
which is given by hand and declared.
