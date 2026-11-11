# 002 · Search order at rest

**What:** at rest, candidate changes are tried best-estimate-first, and the first one that lowers energy is kept, not necessarily the one that lowers it most.

**Why:** measuring every candidate exactly before choosing is too slow.

**Would replace it:** measuring candidates exactly, or proving the estimate's order is the true order.
