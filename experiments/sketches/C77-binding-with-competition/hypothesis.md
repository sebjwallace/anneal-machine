# C77 · Binding with competition: hypothesis

[C76](../C76-binding-a-sample/) showed that binding two sampled cells per part composes parts cleanly, but that as more
compositions are stored, recall starts spreading into other compositions. Two candidate fixes:
- **More cells per column** (the owner's view): fewer cells reused by chance, so less crosstalk.
- **Competition between whole memories** (C74): in each round, only the cells at the top level of support join.

C77 tests both on C76's world and recall, unchanged otherwise. Predictions in [PREREG.txt](PREREG.txt).
