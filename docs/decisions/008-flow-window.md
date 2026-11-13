# 008 · The flow is a window of recent pictures (compute limit)

**What:** rest weighs structure against the flow: the most recent pictures (`o.window` = 100), kept across rests. Before C30, the flow was cleared after every rest. So a rest that came soon after the previous one weighed against very few pictures, and threw away structure those pictures couldn't pay for (the final rest of a test run saw only 12).

**Why a window:** ideally the flow would be every picture ever seen. Re-explaining all of them for every candidate move is too slow, so this is about speed, not a rule about the world (like decision 001).

**Alternative:** grow the window as fast as compute allows, or summarise older pictures instead of dropping them (this ties into forgetting, in the backlog).
