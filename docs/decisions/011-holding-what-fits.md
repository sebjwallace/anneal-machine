# 011: Holding what fits (provisional)

**What.** When the learning keeps a hot stretch as raw experience, and the stretch needs more members of a letter
than that letter's population has, it is held as consecutive parts: each the longest the populations can hold, from
the start of the stretch. The engine refuses a single assembly that needs more (the Go engine's `TooFewToRepeatError`),
and the learning follows that rule rather than working round it.

**Why.** The engine copy used from C122 to C135 wrapped round and reused members, which the real engine never does.
Following the engine's own limit adds no number: the cut falls exactly where the limit falls. It affects few
stretches, mostly long ones read before much is held (4 to 9 per book; [C136](../../experiments/sketches/C136-holding-what-fits/)).

**Provisional.** How individuals become members is still being worked out (the owner's). This decision follows the
engine's rule as it stands, and changes with it.

**What would replace it.** A settled account of how individuals become members, and of how much a population can hold
for one assembly; or encoders whose buffers fit the populations they feed.
