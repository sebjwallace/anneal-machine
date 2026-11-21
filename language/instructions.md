# Instructions, the REPL and the logs

The [walkthrough](walkthrough.md) notation is **declarative**: it says what exists. This page is the register beneath
it, an **instruction set** in the style of assembly language, which is **imperative** and says what to do, step by step.
Every declaration maps onto instructions. The interpreter logs what it runs as instructions.

**Status: a draft to react to.** Mnemonics are at most four characters, as the owner asked. Each also has a word alias
for the REPL (`invoke` for `INV`).

## The instruction set

```
; declaring structure (once, before running)
POP   c 8          declare population c with 8 members
COM   w c,a,t      declare community w of populations

; activity (what is on)
SET   {c, a}       make populations active, together, this moment
SEQ   c,a,t        feed populations one per moment
STEP               advance one moment

; the two roots
INV   c            invoke: read, and report completion or incompletion, and how far
RSLV  last         resolve: form structure from what invoke left (or RSLV #1,#3 to compare stored)

; set operations (read-only: they return sets and change nothing)
INTR  #1,#3        intersection        ∩
UNI   #1,#3        union               ∪
DIFF  #1,#3        difference          −
SYMD  #1,#3        symmetric diff.     △
CNT   #1           count               |·|
HAS   #1,a         membership          ∈
SUB   #1,#2        subset test         ⊆

; assembling by hand (programming: writing is bonding)
ASML  <c,a,t>      assemble an assembly (members bonded to each other)
CHN   c,a,t        assemble a transition (a chain)
BOND  c,a          add one directed bond
GATE  t {a,d} 2    give t a gate: these sources, this threshold

; storage
LOAD  #12          bring into RAM (loaded)
STOR  #12          move out to disk (stored)

; examination (AMX: reading only, never feeds back)
INSP  c            look inside a population or member
WHY   barks        which gate opened it, and from what
NAME  #12 cat      attach a name for reading
POL   inv+rslv     declare the policy for this run
```

**There is no instruction for keeping something on.** Things stay active only because the dynamics sustain them: a
assembly reverberates because its members point at each other. Context comes in as input (`invoke day`) and stays present
through its own structure, or fades when something outcompetes it.

**Which are really primitive.** Only `INV` and `RSLV` are roots. The set operations are read-only queries, used by
`RSLV` inside and by AMX outside. `ASML`, `CHN`, `BOND` and `GATE` are what `RSLV` does underneath, exposed so structure
can be written by hand. Everything else declares, feeds input or examines.

**Choices to note.**
- `INTR` and `UNI` (the owner's choices, replacing `CAP` and `CUP`) name ∩ and ∪. They avoid `AND` and `OR`, which in AMP mean gates and
  topology.
- `ASML` (the owner's choice, replacing `FORM`) assembles an **assembly**, its members bonded to each other. `CHN`
  assembles a **transition**. In prose, "forms" still describes what resolve does.
- `SET` and `SEQ` are braces and commas from walkthrough step 2.
- `GATE` addresses a gate by its member. How to address a single gate is open (below).

## Mapping declarations to instructions

| Declaration | Instructions |
|---|---|
| `c = population 8` | `POP c 8` |
| `<c, a, t>` | `ASML <c,a,t>` |
| `c -> a -> t` | `CHN c,a,t` |
| `c -> a \| o -> t` | `CHN c,a\|o,t` (alternatives compete at that step) |
| `a & animals`, after c | `GATE a {c,animals} 2`, all of value-step and keys |
| `invoke {c, a}` / `invoke c, a, t` | `SET {c,a}` + `INV` / `SEQ c,a,t` with `INV` each moment |

## The REPL

Declarations for structure, commands for actions, one line at a time. Defining structure by hand with the **invoke-only**
policy keeps it exactly as built while you poke at it. Switching learning on (`policy inv+rslv`) shows resolve adding to
it. **Stepping** one moment at a time is what makes the dynamics (competition, completion) visible. A live view, showing
each population's members lighting and dimming as you step, would pair naturally with it later. A REPL is also one of
the simplest parts to build in Go, so it can be the interpreter's first piece.

```
amp> c = population 8
c: 8 members, all individuals
amp> cat = <c, a, t> ; c -> a -> t
cat: <c, a, t> and transition c -> a -> t
amp> invoke {c, t}
moment 2   tie: cat (2 of 3) | cot (2 of 3), held
incomplete
amp> invoke a
moment 3   cat wins
amp> why cat
cat: 3 of 3: c, t, then a, all from input
```

**Starting afresh.** `reset` lets go of all activity, so nothing is active or refractory; what the memory knows, the
settings and the clock are unchanged. A REPL command, not an instruction: it doesn't come from the dynamics, so it is
for examining, not for running.

**Short forms.** In the REPL, the instructions' mnemonics can be typed in place of their words, in lower or upper
case: `pop` for `population`, `com` for `community`, `intr` for `intersection`, `diff` for `difference`, `inv` for
`invoke`, `insp` for `inspect`. REPL commands that aren't instructions (`assemblies`, `reset`, `save`, `open`, `exit`, the settings) keep
their words.

**Intersection.** `the = intersection thedog, thecat` (or `intr`) forms what the names share as a new assembly beside
them: the populations all of them cover, taken as members of the first named, in its order, as an assembly and a
transition, exactly as `the = <thedog{t -> h -> e}>` would by hand. It is abstraction, done by hand.

**Difference.** `dog = difference thedog, the` (or `diff`) forms what the first name has that the others don't, beside
it, from the first's members: decomposition, done by hand. The others' letters are taken away **in order**, so a
repeated letter only the first has is kept: `thecat − the` is c, a and thecat's last t, where a plain set difference
would lose every t. With more than two names, each is taken away in turn.

**Comparing.** `compare thedog, thecat` runs the set operations above (`INTR`, `UNI`, `DIFF`, `SYMD`, `CNT`, `SUB`) at the
population level: an assembly stands for its members' populations, a community for its populations, a population
for itself. Two names give the intersection, union, both differences, the symmetric difference, the counts and
both subset tests; more than two give the intersection and union of them all. It only reads.

**Listing assemblies.** `assemblies` lists every assembly, in the order formed, 20 to a page; `assemblies 2` shows the
second page. A REPL command for reading, not an instruction.

**Seeing the phases.** `phases on` makes invoke also print every member's phase, moment by moment: one row per
moment, one column per population, ● active, ◦ primed (a gate reached it, but it didn't come on),
· ready, and a blank for refractory. `phases off` stops it; `phases` shows the setting.
A REPL display setting, not an instruction, and not saved.

**Saving a session.** `save walkthrough.json` writes a snapshot of what the memory holds (populations, communities,
assemblies, and the refractory setting) to a JSON file; `open walkthrough.json` replaces the memory with it. `save` on
its own saves to the file last opened or saved. These are REPL commands,
not instructions: they keep a session between runs and are separate from **loaded** and **stored**, which say where an
assembly sits while the engine runs. A snapshot doesn't hold what is active, so an opened memory starts with nothing on.

## The three logs

By CTR-1 CON-20 (draft, nothing happens without a recorded cause), logging is not optional. There are three logs, because
they grow at very different rates:

| Log | Holds | Grows |
|---|---|---|
| **command log** | what was asked: every invoke, resolve and policy, from the REPL or a script | slowly |
| **record of changes** | every change to structure (each assembly formed, load, store, name), each with its cause; the engine's whole history, since nothing is removed | only when something is learnt |
| **trace** | each moment: which members came on, which gate opened them, who won each competition, which ties were held | fastest |

**Replay.** The engine has no randomness, so the command log and the starting state are enough to replay any run exactly.
The record of changes answers where any assembly came from. The trace answers why any single thing happened (`WHY`).
**The command log and the record of changes are always on. The trace is switched on per run, or regenerated on demand by
replaying**, so its size never forces a choice.

**All three are written as instructions,** each with what it found or made, so the log, the trace and the record read as
the language. See walkthrough step 9 for an example.

## Addressing a single gate (proposed)

Assemblies are `#1`, members are `c{3}`, but there is no address for one gate, which explanations need ("barks came on by
its gate from #4"). Since every gate belongs to exactly one assembly, the proposal is to address it by its member and the
assembly that formed it, with no new kind of name:

```
barks{2}#4      the gate on barks{2} that belongs to assembly #4
```

Not yet agreed.
