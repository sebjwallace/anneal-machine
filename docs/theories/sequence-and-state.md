# Sequence memory and state memory

A theory note and handoff, written 21 November 2026 at the end of the session that built the branch `l1a-reading`, so
the owner can take it away and talk it through with another agent. It continues [After completion](after-completion.md).
That note's problem (the engine keeps things only as activity, so holding piles up and blocks new input) is what this
session set out to answer. The owner's answer is below; it is built and partly tested. The question it leaves is in §4.

## 1. The owner's answer, from first principles

**Sequence memory.** Each character is a population. Reading streams a text in, a character each moment.

- If the population has a **primed** member, only that member comes on.
- If not, the population **bursts**: every member comes on, and an **individual** is picked at random to be the
  **member** for this character from now on.
- Every character **bonds** to the next: the member selected the moment before bonds to the member selected now.
  Bonds point one way.

So the first reading of "A B C D" leaves a chain. Read "X B C Y" afterwards: B bursts, but the B member from before
bonds to C, so C arrives primed. That is the first prediction. A run of correct predictions is a **motif** ("the " read
again is a motif of 3). A motif can only happen on a repeat.

**State memory.** A motif is **cast** into an **assembly**; assemblies are later annealed. Assemblies don't live with
the input, which is where the crosstalk in After completion came from. They live in a second community.

- **Sequence memory** (L1A): directional bonds, driven by the input.
- **State memory** (L1B): assemblies, whose members are bonded to each other both ways. That makes an assembly an
  attractor: it completes, and holds until another assembly outcompetes it. A **state** is an assembly that has
  settled and holds; a **transition** is a competitor forcing it out.
- L1A projects up, L1B projects down (predicting what L1A will read), and L1B projects laterally to hold its
  assemblies. The same pattern repeats upwards: L2A and L2B, and so on.

What each is for:

- State memory doesn't care about order: "meow the cat" completes the same assembly as "the cat meow". It holds
  through noise: in "the purring cat meow", "the cat meow" should hold while "purring" goes by.
- Sequence memory gives order. Together they reinforce each other: in "meow the purring cat", sequence memory hasn't
  seen "purring cat", but state memory still projects "cat" strongly, on the tip of the tongue.
- After "the", state memory holds both "cat" and "dog" as possible, until the c or d arrives.
- The owner suspects assemblies can **cooperate** as well as compete.
- Gates make capacity: because each assembly's gate counts its own members, members can be reused across assemblies.

## 2. What is built (branch `l1a-reading`)

A fresh engine, interpreter (`amp`) and terminal view (AMT); the earlier engine is on `main`. Who decided each rule is
given, because several are defaults that were never discussed in depth.

**L1A (reading).** As in §1 (the owner). Defaults: 9 members per population; a space is the population `_`; each read
starts with nothing active, so its first character always bursts; picks are random but decided by a seed and the
moment; a read is all or nothing; if several members of one population are primed, all come on and one is selected at
random.

**Motifs.** From a character whose population burst, through the characters after it that arrived primed, up to the
next burst. Its length is how many predictions it got right. Motifs cross word boundaries: after "the cat sat on the
mat the dog sat on the log", reading "the dog sat on the mat" has the motif "the_dog_sat_on" (13), because the data
repeated it.

**Casting** (the owner chose among four options, "option 3 in its L1B form"). When a motif ends (at the burst after
it, or at the end of the read):

- If no assembly has those characters in that order, a new one is cast in L1B (its own populations, 9 members each):
  one L1B member per position (`_` twice gets two), all bonded to each other both ways.
- Every L1A member that took part projects up to its L1B member: the member selected at each moment, and at the
  moment that burst, also the members that primed the next character. In X B C Y, both B members project up to the
  assembly's b.
- If an assembly already has those characters, only the missing projections are added. Overlapping motifs ("the_cat_"
  and "the_") are separate assemblies. (Defaults the owner agreed.)

**Reuse** (the owner: gates make it possible). Casting picks any member of the L1B population not already in the
assembly. Without reuse, L1B ran out of individuals on the second sentence.

**Gates and competition in L1B.** The gate rule is the owner's; the rest were the agent's defaults when the owner asked
for competition.

- Each moment, the L1B members that L1A's active members project up to come on and are **confirmed**. A burst clears
  the confirmations.
- An assembly's gate opens as soon as any one of its members is confirmed (the owner's choice).
- Its **score** is how much of it is confirmed (confirmed members over its size). Of the open gates the highest score
  **wins**. The winner stays until another scores higher; on a tie it stays; with no winner yet, a tie means none
  wins.
- The winner completes (its other members come on the moment after) and holds, through bursts too, until outcompeted.
  Every other assembly stays quiet: only its confirmed members are on.

"Confirmed", "score" and "winner" are used in the code and in AMT but are **not agreed words**. They are the agent's
placeholders, to be confirmed or replaced.

**Not built:** L1B projecting down to prime L1A, cooperation, annealing, layers above L1.

**Tools.** `go run ./cmd/amp` (the REPL: `invoke "text"`, `assemblies`, `inspect #1`, `bonds`, `save`). `go run ./cmd/amt`
(type text, watch it read moment by moment: the L1A graph of members and bonds with colours for primed, burst, picked
and bond formed; motifs bracketed under the text; L1B as a 3×3 grid per population; the assemblies with how much of
each is confirmed and which wins; ↑ ↓ select an assembly and mark the L1A members that project up to it). The owner
judges by seeing, so new behaviour should be visible in AMT before a decision is asked of them.

## 3. What has been seen

| | Result |
|---|---|
| Reading | Repeats arrive primed; reading a text again settles to the bursts that are genuine surprise (which word follows "the "). |
| Casting without reuse | L1B ran out of individuals by the second sentence (`_` needs one member per space in a motif). |
| Gates, no competition | Within a moment or two of a burst, nearly every assembly completes (11 of 11). A "more than half" gate only slows it (8 of 11 by the end of "the mat"). Gates alone can't tell assemblies apart once they share members. |
| Competition | One assembly wins at a time; reading "the mat", `the_` wins at h and holds; nothing else completes. |
| C105 | How a winner holds through a burst: below. |

**[C105](../../experiments/sketches/C105-winner-holds/)** compared ten rules: how confirmations last (cleared at a
burst, kept for the winner, kept with ties going to the challenger, lasting 4 or 8 moments) by what a burst projects
up (every member of the population, or only the member picked). Tested on a memory that read "the cat meow" and "the
dog bark" twice each: holding through noise ("the purring cat meow", "the loud dog bark"), changing ("the dog bark the
cat meow"), order ("meow the cat"), over ten seeds. **No rule does all four reliably.** The best (a 4-moment window,
picked only) passes all four in 2 seeds of 10; it passes the change and the order nearly always, and holds through
"purring" in 3 of 10. Projecting up only the member picked helps holding: a member picked at a burst is new and
projects up to nothing, so noise confirms nothing and the winner holds. That is close to the owner's picture that
noise isn't processed.

## 4. The problem now

In plain terms: **a winner should hold through noise, and give way when something that fits better arrives. Scored as
"how much of it is confirmed", it can't do both.** C105 found two causes underneath, neither of them the rule for how
long a winner holds.

1. **Short assemblies inside long ones can't be beaten.** After "the ", `the_` is fully confirmed (4 of 4). The phrase
   it is part of, `the_cat_meow`, can at best tie, and a tie keeps the winner, so the phrase never wins. Letting
   confirmations run out helps, because `the_` fades. But it is really a question of how assemblies inside one another
   relate: do they compete at all?
2. **Noise can carry another word's context through L1A.** "Purring" ends in g, like "dog". The g bursts, which turns
   on every g member in L1A, dog's included; dog's g primes the space that followed "dog"; the space arrives carrying
   dog's context and confirms the dog phrase. It happened in every failing seed. C103 met the same thing in another
   form: a burst turns everything on, and chains through it run on.

Also seen: on ordinary sentences the winner changes often (89 to 234 changes over five sentences and ten seeds, under
the rules that pass the change test).

## 5. Open questions

Roughly in the order they probably need settling.

1. **Nested assemblies.** `the_` is part of `the_cat_meow`. Should they compete, or cooperate? If they cooperate, what
   does that mean: can a part and its whole both hold, can a part support the whole it is in? This is the owner's
   suspicion that assemblies can cooperate, and it may settle problem 1 without touching the score.
2. **What decides a winner.** How much is confirmed favours short assemblies; how many members are confirmed would
   favour long ones. Or something else: the owner wants assemblies to start completing as soon as possible, and hold
   until outcompeted. Is a score the right shape at all, or should it come from the dynamics (members bonded both
   ways, completion, gates)?
3. **What a burst sends up.** Every member of the population (every context it was ever in), or only the member picked
   (noise stays silent)? After completion's rule 5 is close to this: unexpected input turns on only its primed members,
   if it has any.
4. **Context through a burst** (problem 2). After a burst, should the next character be allowed to take the context of
   a member that was only on because the burst turned everything on? Or is that the state memory's job to overrule?
5. **How long confirmations last.** Cleared at a burst (as committed), a window (C105's best), or something the
   competition itself decides ("until outcompeted").
6. **Projecting down.** When the winner completes, it should prime L1A: which L1A members (every one that projects up
   to it, or only those that continue the sequence)? This isn't built, and it may change everything above. If state
   memory primes "cat" while "purring" goes by, the c may arrive primed instead of bursting.
7. **Casting by order.** Casting matches characters in order, so "meow the cat" read twice would cast an assembly of
   its own, not join "the cat meow". State memory is meant to be order-free. Should casting match by the set of
   characters instead?
8. **L1A capacity.** The first character of every read bursts and uses up an individual; with 9 members per
   population, a letter that starts many reads runs out.

## 6. For an agent picking this up

- **Code** (branch `l1a-reading`, in `amp/`): `engine/read.go` (reading, the order of each moment), `engine/motif.go`,
  `engine/assembly.go` (casting), `engine/gate.go` (L1B activity and competition); `cmd/amt/` (AMT: `layout.go` places
  members and routes bonds, `l1b.go` draws L1B); `README.md` there describes it all. The commits: `0bc5fdb` (fresh
  start), `f386aa0` and `f6a3878` (motifs), `5e8a94c` (casting, reuse, gates, L1B in AMT), `458df77` (competition).
  C105's code is on `experiment/c105-winner-holds`; its record is on `main`.
- **Words** ([glossary](../glossary.md)): population, member, individual, primed, burst, bond, motif, cast, assembly,
  community, gate, state, transition, anneal. Placeholders not yet agreed: confirmed, score, winner. L1A, L1B and so on
  are the owner's names for the communities.
- **How the owner works.** The owner gives the principles and constraints; the agent works out the details and runs the
  experiments on a branch, with predictions written before running. Experiment records go onto `main`; code stays on
  the branch. Don't coin terms, in prose, tables, headers or sketches: propose a new word first. Answer the question
  asked; don't turn it into a change nobody asked for. Show things visually (in AMT, or a sketch in AMT's style)
  before asking for a decision. Explain in plain terms when asked; keep it simple, and ask rather than add a mechanism.
