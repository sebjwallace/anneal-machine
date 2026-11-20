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
CAP   #1,#3        intersection        ∩
CUP   #1,#3        union               ∪
DIFF  #1,#3        difference          −
SYMD  #1,#3        symmetric diff.     △
CNT   #1           count               |·|
HAS   #1,a         membership          ∈
SUB   #1,#2        subset test         ⊆

; assembling by hand (programming: writing is bonding)
ASML  ⟨c,a,t⟩      assemble a state
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
state reverberates because its members point at each other. Context comes in as input (`invoke day`) and stays present
through its own structure, or fades when something outcompetes it.

**Which are really primitive.** Only `INV` and `RSLV` are roots. The set operations are read-only queries, used by
`RSLV` inside and by AMX outside. `ASML`, `CHN`, `BOND` and `GATE` are what `RSLV` does underneath, exposed so structure
can be written by hand. Everything else declares, feeds input or examines.

**Choices to note.**
- `CAP` and `CUP` are the traditional names for ∩ and ∪. They avoid `AND` and `OR`, which in AMP mean gates and
  topology.
- `ASML` (the owner's choice, replacing `FORM`) assembles a **state**. `CHN` assembles a **transition**. Both make
  assemblies, of different shapes. In prose, "forms" still describes what resolve does.
- `SET` and `SEQ` are braces and commas from walkthrough step 2.
- `GATE` addresses a gate by its member. How to address a single gate is open (below).

## Mapping declarations to instructions

| Declaration | Instructions |
|---|---|
| `c = population 8` | `POP c 8` |
| `⟨c, a, t⟩` | `ASML ⟨c,a,t⟩` |
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
amp> cat = ⟨c, a, t⟩ ; c -> a -> t
cat: state ⟨c, a, t⟩ and transition c -> a -> t
amp> invoke {c, t}
moment 2   tie: cat (2 of 3) | cot (2 of 3), held
incomplete
amp> invoke a
moment 3   cat wins
amp> why cat
cat: 3 of 3: c, t, then a, all from input
```

**Saving a session.** `save walkthrough.json` writes a snapshot of what the memory holds (populations, communities,
and later assemblies) to a JSON file; `open walkthrough.json` replaces the memory with it. These are REPL commands,
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
