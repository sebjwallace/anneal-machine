# C41 · Findings (output in out.txt; runs in 0.2 s)

**With only the two episodes.** Recall of one episode from two of its states works (A and P → J filled in; A and J → P;
J and O → G). **A and O → nothing**, at any spacing. There is no magnet: completion accepts a thing only when two
pieces of evidence fall inside it (one placement explaining two items is the saving), and each episode gets only one.
Two episodes each holding one cue are no cheaper than the cues on their own. Sharing J doesn't help, because J isn't
in the evidence.

**With a level above episodes (both held together, lined up at J; given by hand).** A and O two steps apart →
found, J filled in, but also G and P: the whole region, not the path (as in C39). Only at the right spacing.

**With a kind with two slots ("_ → J → _", first A or G, last P or O; its versions written out by hand).**
- A and O two steps apart → **A → J → O**, a version that never happened, and only the path.
- A and P → A → J → P (what happened).
- A and J, or J and O → nothing: two versions fit equally, so it doesn't choose (a fork at the junction).
- A alone → nothing.

**Result.** The snap at a shared state does not come from the existing rule: an episode needs two pieces of evidence in
it to come up, and joining at a state nobody cued saves nothing. What does give exactly the new path is a kind with
more than one slot: the two episodes are the same except at both ends, so a kind that varies both ends makes every
combination, including the one never seen, and completion picks the one both cues fit. Today kinds have one slot
(milestone 10's listed limit), so the engine can't form this yet. Whether a two-slot kind would *pay* (be kept by
energy) is the open question; with only two episodes it may not.
