# 001 · Quick search at rest (a compute limit)

**What:** awake, a picture is explained by the full search: every opening placement is tried and the cheapest explanation wins. At rest, when the flow (every picture since the last rest) is re-explained for each candidate change, the quick greedy search is used instead.

**Why:** the full search for every candidate would make rest take hours. This is about speed, not a rule about the world.

**Would replace it:** a faster exact search, or re-explaining only the pictures a change could affect.
