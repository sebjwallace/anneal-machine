# 001 · Quick fitting at rest (a compute limit)

**What:** awake, a picture is fitted by competition with re-settling where heat is left (at most 6 rounds). At rest, when the flow (every picture since the last rest) is re-explained for each candidate change, one competition pass is used, with no re-settling.

**Why:** re-settling for every candidate would slow rest. This is about speed, not a rule about the world.

**History:** until C75 (14 November 2026), awake fitting was a full search: competition rerun from every opening placement, the cheapest kept. C75 found competition alone gave the same fit on 1,495 of 1,500 test pictures and learnt exactly the same; re-settling where heat was left matched all 1,500. The search was removed from the core. The cap of 6 re-settling rounds is part of this compute limit.

**Would replace it:** a faster exact search, or re-explaining only the pictures a change could affect.
