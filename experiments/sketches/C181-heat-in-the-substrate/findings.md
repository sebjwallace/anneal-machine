# C181 · Heat in the substrate: findings

Run: `node heat.js > out.txt` (about twenty-five minutes). The first attempts traced: `DIAG=1 node heat.js` (first lines
in [diag.txt](diag.txt)). Read [the hypothesis](hypothesis.md) first. It was written before the run, with one disclosed
fix after the first run (in [out-first-run.txt](out-first-run.txt)).

## In short

**Heat as energy in the substrate, moved by four simple rules, didn't work. It churned.** Times one digit and the second
row both ran to the limit on every worked example without settling (3,010 and 6,005 runs), and nothing was learned (0 of
200 at test). This was the risk named before the run. The trace shows why, and the reasons say what the substrate's
energy needs.

**What went wrong:**

1. **Several parts took over at once on almost every attempt** (three to five changes). The first column of times one
   digit was already right, and the multiple take-overs wrecked it every time, so nothing ever cooled more than at the
   start. C180, trying one change at a time, never did that.
2. **Parts with few neighbours flipped first, whether or not they were to blame.** The move has one neighbour (the other
   direction), so a blamed move passes all its spreading heat to that one neighbour. The move flipped on almost every
   attempt, and that alone ruins a page. The read that was actually at fault (it found an empty place) shares its heat
   among nine neighbours, so holding at the same place, the change actually needed, got a ninth of a share and never
   rose above the bar.
3. **Heat piled up on the parts in place, which can't take over themselves.** Blame adds heat to the part that failed,
   and from there it leaks to all its neighbours on every attempt. So the warmest cells were usually the parts in place,
   radiating heat to their surroundings indefinitely.
4. **Parts that did their job got no stronger.** When a wrong digit landed on the working, every read was blamed, even
   though the first column showed they were right. Nothing in the rules let a part that helped cool something hold its
   ground. The bar was fixed.
5. **The places still to be done pulled the writes even when the writes weren't at fault.** In times one digit the
   writes were fine (the stall was a read), but the unfilled places kept heating the write cells until they took over,
   moving correct writes away.

## Results

| | times one digit (runs) | second row (runs) | test (200 new, from the start) |
|---|---|---|---|
| heat in the substrate (C181), after the fix | 3,010 (both examples to the limit) | 6,005 (all four to the limit) | 0 of 200; 0 of 200 |
| first run, before the fix | 24 (stuck: attempts refused) | 36 (stuck) | 0; 0 |
| C180, heat kept by the code | 14 | 341 | 200; 200 |

## Against the predictions

| | prediction | result |
|---|---|---|
| 1 | times one digit within about 20 attempts | **Fails:** to the limit, both examples. |
| 2 | the second row settles, without sticking where two parts move together, 150 to 600 attempts | **Fails:** to the limit, all four examples. |
| 3 | risks: churn, or the coincidence | **The churn came true**, in all of the failures. |

## Disclosed

- **The fix after the first run:** two parts taking the same place made the rule refuse whole attempts. The hottest now
  takes over first, and a part can't take a place another part holds. The knobs are unchanged and untuned.
- The trace (`DIAG`) was added after the run, to read the failure. It changes nothing in the run.

## The ledger

As the hypothesis. The energy layer (sources, spreading, taking over, draining, and the four knobs) replaced the code's
heat levels, tried marks, ranking and reach. **Still the code's:** practising, comparing an attempt's cooling with the
best, blame, and the layer's arithmetic.

## What it shows

Simple energy rules aren't enough. They have to hold the things the code's version had built in without saying so:

- **one change at a time** (or a reason why only the hottest part moves);
- **heat that doesn't depend on how many neighbours a part has;**
- **parts that cool something becoming harder to dislodge** (the bar should be each part's own strength, grown by the
  work it does, not a fixed number);
- **pulling only what's to blame.**

This turns "heat lowers the bar" into a sharper question for the owner: what makes a part in place strong, and what
lets only the most to blame give way?
