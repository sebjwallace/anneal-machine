# Findings 05: NOT as learnt inhibition

*Findings from sketch 37, November 2026. Tests [hypothesis 05](hypothesis.md).*

## What was tested

Inhibition learnt from the automaton's own failed predictions: context C was active, X was predicted, X didn't happen, so C inhibits X. It was tested in three parts:
1. **exceptions**, such as "penguin bird" doesn't "fly";
2. **identity**, replacing sketch 27's hand-written co-presence bookkeeping with learnt inhibition;
3. **lock-in**, sketch 26's self-reinforcing loop.

There were 10 fresh test seeds, with settings frozen before the test runs.

## Results

### 1. Exceptions: holds

| | positive links only (summed) | positive only (out-voting) | **learnt NOT** | NOT without the "own prediction" gate |
|---|---|---|---|---|
| late exceptions ("penguin") don't "fly" | 0 | 1 | **1** | 1 |
| regular birds still "fly" | 1 | .70 | **1.00** | .15 |
| a new "green bird" "flies" | 1 | 0 | **.8** (1.0 later) | .3 |
| all pairs correct | .92 | .97 | **.998** | .81 |

- An exception was honoured after 1–2 occurrences, with **no damage to the general rule**. Positive links can only win by out-voting, which costs the rule for other birds.
- **Unlearning works:** a "chick" that started flying recovered in 3–4 occurrences.
- **It stays balanced without a balance rule.** Inhibition levelled off by itself. The homeostatic balance rule added nothing at low strength, and at higher strength it wore away the general rule.
- **Learning only from the automaton's own failed predictions is what keeps it safe.** Without that gate, it made four times the links and lost real facts ("ostrich runs", "penguin swims").

### 2. Identity: fails

| wrong-entity rate | no identity learning | sketch 27's bookkeeping | learnt NOT |
|---|---|---|---|
| single snapshots | 12.0% | 2.9% | 12.6% |

Learnt NOT never created the late "ginger cat" as a new entity.
- **Failed predictions are too rare.** The automaton visibly picks the wrong entity only about 8 times per run.
- **Inhibition from a whole pattern hits shared words too.** "cat" and "sleeping" ended up inhibiting as much as the identity word did.
- Inhibiting between every pair of co-present entities blocked the right entity 86% of the time.

### 3. Lock-in: fails

Changeability stayed the wrong way round in every condition (colour .81–.88, activity .09–.15). In sketch 26's world, the automaton never sees its own predictions fail, so there is nothing to learn from. With scenes added, learnt NOT made things worse.

## Conclusions

1. **Learnt NOT works where the world shows a prediction failed.** Exceptions are learnt quickly, without collateral damage, unlearnt when they stop being true, and stay balanced. That is the counterbalancing force for the exception case, and it fixes what positive links can't.
2. **It isn't independent evidence when the only check is the automaton's own choice.** In parts 2 and 3, the automaton rarely or never sees that it chose wrongly, so negative feedback has nothing to act on. Sketch 27's lesson stands: identity needs an independent signal, such as co-presence.
3. **Single-cue inhibition is too blunt; it needs to be conjunctive.** When a failure inhibits each active word separately, shared words like "cat" get suppressed along with the identity word. What's needed is "*this combination* suppresses X": an inhibitory segment (NOT of an AND). That is the NAND idea, and it also covers sketch 36's failure on exceptions such as "ginger cat" + "bowl full" (65%).
4. **The safety of learnt inhibition comes from the gate, not from balance.** Inhibition learnt only from the automaton's own wrong predictions stays proportionate. A homeostatic balance rule wasn't needed here.
5. **Hypothesis 05 is partly supported:** prediction 1 holds and prediction 4 holds; predictions 2 and 3 fail.

## Weak points

- Two design changes were made on the development seed before pre-registration. A hard block deadlocked, because a blocked entity can never unlearn, so inhibition now subtracts from a match instead.
- Part 1's exceptions each have their own word ("penguin"), which makes them easy. Context-dependent exceptions, which need conjunctions, were not tested.
- Parts 2 and 3 were run at a single learning rate.

## Next

**Inhibitory segments**, one mechanism with two signs:
- a cell that *should have fired and didn't* grows an excitatory segment (sketch 36);
- a cell that *fired and shouldn't have* grows an inhibitory segment.

Test it on the conjunctive exceptions that both sketch 36 and sketch 37 couldn't express.

## Reproduce

```
cd sketches/37-learnt-not && ./runall.sh     # about 14 minutes; see NOTE.md and PREREG.txt
```
