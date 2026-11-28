# Crutch register: learned computation (C137 onwards)

One list of everything the learned-computation experiments give the engine rather than the engine doing it: crutches,
tricks, things written by hand, things formed beforehand, and fixed architecture. Kept so that nothing quietly becomes
permanent, and so that refactoring back to an honest engine starts from a list. Started 26 November 2026, at the
owner's request, after C166.

**How to use it.** Each experiment's own ledger says what it gives. This register is the running total. When an
experiment adds a crutch, add a row. When one removes a crutch, mark it removed and say where. A result that rests on a
crutch in the first two sections can't be counted as the engine doing that thing.

**Kinds.** *Doing the thinking*: the experiment's code or the assistant decides something the engine should decide.
*By hand*: structure written rather than learned, to test whether a representation can work at all (honest for that, not
a result about learning). *Formed beforehand*: knowledge given rather than learned. *Encoder*: how the world is laid
out and presented. *Architecture*: fixed machinery, acceptable in principle (as the owner's fixed ledger is), but listed
so it stays small and general.

## 1. Doing the thinking (to remove)

| Crutch | Where | Since | Why it's there | What would replace it | Status |
|---|---|---|---|---|---|
| **Proposing candidates by search** (stages A, B1, B2: read sets by ring, then carry places, moves, sign places, pass-ons) | `learn.js` in C142 to C164 | C142 | the engine has no way to come up with a new way of working | heat-driven settling that spreads from the gap ([candidate energy rules](../docs/theories/candidate-energy-rules.md)); recall and its ties as proposals | **in**; the main blocker (the second row's search was too costly, C163) |
| **The menu of part kinds** (sign read, sign write, pass-on, hold, dropping a part) | proposer, C153 to C158 | C153 | each was added when a procedure needed it | parts the engine forms itself; at least, a fixed general menu that stops growing | **in**; growing, which is a warning sign |
| **Replay of every stored step**, and varied replay | `learn.js` C155 to C158 | C155 | try what's known before searching | the memory's own offers (C164) | **replaced in C164** (only there); still in C155 to C158 |
| **Proposing compositions** (pairs of continuations: each known frame at each start relation within two columns) | C171 `learn.js` | C171 | the composition is found by settling, but the candidates are enumerated | proposals from the memory (recall, ties), or spreading from the gap | **in** |
| **Proposing a way of working's parts under doing and checking** (start relation, three reads within two rows of the focus, sign read, units write; then hold, carry place, move), with an outcome-equivalent filter (no reads of empty places, no sign reads without a sign, no writes to filled places; checked 0 of 300 pass) | C172 `learn.js` | C172 | the engine can't come up with a new way of working | as above | **in**; about 137,000 circuit runs for one frame, the costliest crutch now |
| **Choosing a single winner across worked examples, and building the test circuit from it** (the binding rule's intersection) | C171, C172 `learn.js` | C171 | to turn what settled into something that runs | one memory keeping what settles (a copy per settling) and choosing by competition with copies | **removed in C173** (for the second row); still in C171, C172 |
| **A tie-break among equals: the first formed wins** | C173 engine variant `tieFirstFormed`, one arm | C173 | three equally right ways of working tie for ever under repetition | something that gives one equal a single extra copy, once (repetition keeps it after that) | **in** (that arm only); which equal wins follows the code's listing order |
| **Proposing with pieces** (each part placed only where a learned way of working had it relative to a part already placed; pieces read off learned ways of working by the code) | C175 `lessons.js` | C175 | reuse from earlier lessons, done by the code for now | the engine fitting its own pieces into the gap, guided by heat | **removed in C176**: what one lesson kept comes up by association in the next, in one memory |
| **Adapting what comes up: ranking by how far it got, and varying one part at a time** (first whether the first read is held, then each part's place) | C176 `learn.js` | C176 | the old way of working needs one change to fit the new lesson | the engine adapting at the gap, guided by heat (where the work stopped) | **narrowed in C177** to heat-guided changes (below) |
| **Hubs from overlap: when and how they're used** (every pair of kept ways of working compared at the start of adapting, standing in for background comparing; completion by the most widely shared relation, tried as one change) | C186 `heat.js` | C186 | relational abstraction turning search into completion | continuous background intercomparing; completion as the engine's own dynamics | **in**; the second row 3 of 3 seeds |
| **Heat-guided adapting** (a write moves only to a place still to be done, a read only to a place holding something; keep a change if more cools; pairs if no single change helps; ties by a fixed order) | C177 `learn.js`; C179 `fanout.js` (four forms compared: greedy, nearest first and widening, spreading from the gap, a random budget flowing); C180 `heat.js` (as heat dynamics: blame, heat that builds and resets, reach growing with heat, one try at a time; heat levels still kept by the code) | C177 | the second row is five parts from anything known | the engine pulling parts toward the heat itself | **in**; the second row in 412 runs instead of 136,922 |
| **The start and composition of the second row given** (the page has the first row done; the focus placed one left of its start) | C177 | C177 | to test adapting on its own | the composition as learned in C171, in the same memory | **in** |
| **The order of lessons** (the usual school order, fixed before looking at later skills) | C175 | C175 | gradual learning | none needed if declared, as a syllabus | **in**, declared |
| **Reading offers from a stalled recall's competitions** | `lanes.js` `recallOffers`, C164; `keep.js` C173 (every recall link that competed, tried in turn) | C164 | to get the tied candidates out of the engine | recall that branches into lanes by itself | **in** (bookkeeping, held ties only) |
| **Heat declared by the encoder** (the worked example marks which cells are the working) | every `worked()` | C139 | the engine doesn't find what's unexplained by itself | heat as what nothing holds (the owner's "!"), found by the engine | **in** |
| **The start**: the cue given and the focus placed at the starting column | every run | C149 | nothing in the engine decides to begin, or where | attention going to heat; a spatial super-assembly for where a sum starts | **in** |
| **The restart**: the focus put at the start of the next row, a 0 carried in, the cue given again | C163 `taste.js` | C163 | long multiplication's second row needs it | a hand-over to a frame that jumps (spatial super-assembly) | **replaced in C169** by the jump to one left of the start latch (by hand) |
| **Frames handed over as already learned** in tastes | C159 to C163 `taste.js` | C159 | quick tastes | learn them in the same run (as C164 did) | **in** for those tastes |
| **Signs' meanings given** in tastes | C159 to C163 | C159 | as above | learned links (as C153 to C158) | **in** for those tastes |
| **The binding rule intersecting views** (overlaps) | C160, C161 `lanes.js` | C160 | to keep what episodes share | competition passing what ties agree on (C162), in the engine | **superseded by C162** as a direction; still in C160, C161 |
| **Proposer constraints** (no sign write and pass-on in one place) | C156 onwards | C156 | the lanes' private copies could hold two things in one place, which the write rule can't | lanes that write as the circuit does | **in** |
| **Arrival detected by code** (noticing an absence and switching Stalled on) | C165 `handover.js` | C165 | to make "nothing found" an event | two alternatives after phase 5, absence from competition | **removed in C166** |

## 2. By hand (honest for "can it work", not results about learning)

| What | Where | Since | Status |
|---|---|---|---|
| The second-row frame | C163 | C163 | **found in C172** by doing and checking (candidates proposed); not bound, a three-way tie over which sign place it reads; still by hand in C170, C171 |
| Frame B (copying back) and its copying facts | C165, C166 | C165 | in (a stand-in) |
| The procedure super-assembly and its hand-over gate | C165 to C167 | C165 | in |
| The jump (a one-step way of working) and its hand-overs; Done | C167 | C167 | in |
| The two-row procedure, and the jump's relation ("one to the left of the start") | C169 | C169 | **learned in C171** (from worked examples, candidates proposed) |
| The whole long-multiplication procedure: the adding frame (addition fixed as a part), the second jump ("the start itself"), four hand-overs | C170 | C170 | hand-overs, jumps and Done **learned in C171**; the adding frame still by hand |

## 3. Formed beforehand

| What | Where | Since | Status |
|---|---|---|---|
| The fact families (addition, subtraction, multiplication, copying), as gates | every circuit and lanes | C144 | in; learning tables separately is a later experiment, agreed with the owner |

## 4. Encoder

| What | Since | Notes |
|---|---|---|
| The page layout: which row is which | C142 | fixed rows; more rows added in C163 |
| The sign written once under the starting column (on the right, where work starts, not the left as on paper) | C154 | |
| The multiplier written once, right-aligned | C155 | |
| A 0 carried in above the starting column; numbers padded with one leading 0 | C142 | from C169 also above where the second row starts; from C170 above where the adding starts, the top padded with two 0s, and a 0 placeholder in the second row |
| Worked examples written in full; the carried sign and multiplier not shown | C142, C154 | |
| What's "in view": the places in a frame's reach from the start | C159 | |
| Training order (some procedures only learnable after others) | C155 | a multiplication first wouldn't be learned |

## 5. Architecture (fixed machinery; acceptable, kept small and general)

| What | Since | Notes |
|---|---|---|
| The six-phase clock; moving on only when a fact completes | C149 | |
| The write rule; nothing is overwritten | C149 | |
| Reach (15 places; 21 from C163; 27 from C170) | C149 | bigger reach makes search much costlier |
| Holding: pick-up, held value, gates into the slot | C157 | leak fixed in C159 |
| Settled gate; binding rule into the store | C151 | |
| Binding a frame with what was in view | C159 | |
| Ties pass what all agree on (`tieOverlap`) | C162 | engine-level, general |
| Copies counting; rivals from place; held states | C145, C148, C101 | engine-level |
| Frames held by their own running (by the clock), not as states for ever | C165 | differs from the earlier circuits, to reconcile |
| After a stall or hand-over, the focus stays put | C165 | |
| Two alternatives after phase 5: carrying on or Stalled | C166 | replaced the code-detected arrival |
| Binding where a procedure starts (a cue at a place forms {procedure, jump} -> that place) | C167 | permanent, so later runs jump to every old start (C167); **replaced in C168** by a latch |
| The start-place latch: a marker per place, held only while the procedure is held | C168 | held activity on wiring set up in advance; nothing formed per run |
| Alternatives after the procedure: renewing itself, or Done | C167 | letting go by competition |
| Lanes made in advance (a fixed number) | C146 | |

## 6. Known divergences to reconcile when refactoring

- **Learning has read the worked page's working** (every experiment before C171's target arms): frames read carries and
  rows from the page rather than from their own writes. C171 showed this hides order. The working should be a target
  to agree with, not content to read. That fix is in C171's target arms and C172 only.
- **The binding rule needs a single winner**, but equivalent ways of working can tie (C172: three sign places, all right).
  Nothing in the engine yet chooses among equals, or keeps what they share while still working (what they share leaves
  out the sign read, which the frame needs). C173: in one memory with copies counting, equals stay tied for ever, since
  repetition reinforces them equally; a tie broken once stays broken by repetition.
- **Context at the start was only the sign under the first column** (C176, C177). It couldn't tell a second row from a
  first row (both "×"): C177's second rows from the start were 0 of 200. **Resolved in C178** with the fuller view (the
  kind of thing at each place in reach, given by the encoder): 200 of 200. The view is still the encoder's; the memory
  doesn't look for itself.
- **The store and the circuit are one memory in C173 only** (frames kept as frame cells over a shared part vocabulary;
  pages on fresh sheets; targets as held activity). Elsewhere they are separate, with code moving steps between them.

- **Two circuits doing the same job:** the trial lanes (learning) and the test circuit (running) duplicate the clock,
  reading and writing. They have diverged twice (the hold leak, found in C159; the lanes assuming answers in row 3, found
  in C163). They should be one circuit.
- **The store and the circuit are separate memories,** with code moving steps from one to the other.
- **How frames are held** differs between C165 and C166 (by the clock) and everything before (as a state).
- **The procedure never let go** when finished in C165 and C166. Letting go by competition was added in C167.
- **Bindings outlive the run that made them** (C167). C168 added latches as held activity. Bindings formed during learning (the store) are still all lasting.
