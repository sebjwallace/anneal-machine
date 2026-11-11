# Findings C05: same input, same size, layers differ only in plasticity

*Sketch: `sketches/C05-plasticity/` (run.js, results.json, results-long.json, viewer). Model: `models/funnel.js` arm PL. 5 layers of 50 columns, all seeing the flash; 5% noise; 6,000 flashes (3 seeds) and 30,000 (2 seeds). Plasticity: a layer changes by (its plasticity x its own heat), never below a tenth of its plasticity; optionally it forgets unused columns in proportion. Streams: shuffled, or a changing focus (every 300 flashes, 80% of flashes from a new group of 10 patterns).*

## Results (heat = left over + wrong, as a share of ink)
| run | layer plasticity | each layer on all 98 at the end | all layers together, all 98 | together, current focus |
|---|---|---|---|---|
| shuffled, spread | 0.4 → 0.025 | 0.09 0.11 0.23 0.25 0.25 | 0.04 | 0.02 |
| focus, spread | 0.4 → 0.025 | 0.19 0.17 0.28 0.33 0.33 | **0.07** | **0.02** |
| focus, all 0.2 (control) | 0.2 x5 | 0.17 (all five identical) | 0.17 | 0.06 |
| focus, spread, 30,000 flashes | 0.4 → 0.025 | 0.18 0.10 0.23 0.33 0.35 | **0.03** | 0.03 |
| focus, all 0.2, 30,000 flashes | 0.2 x5 | 0.10 (identical) | 0.10 | 0.05 |

Forgetting on or off made little difference; fixed columns from the start made the stiff layers worse (0.45 to 0.48).

## What it showed
1. **Different plasticities together beat the same plasticity everywhere,** by a lot: 0.07 against 0.17 on all patterns (6,000 flashes), 0.03 against 0.10 (30,000). With equal plasticity the layers become **exact copies** (same input, same rule): four of the five are wasted. Different speeds make the layers different, and together they cover more.
2. **The most plastic layer is the "now" layer:** it's best on the current focus (0.02 to 0.04) but worse on everything else (0.18 to 0.19): it adapts within a phase (heat 0.31 → 0.22) and lets older patterns go.
3. **The middle layer is the best keeper:** plasticity 0.2 holds all patterns best (0.10 after 30,000 flashes).
4. **The stiffest layers never become a good long-term memory:** they stay at 0.33 even after 30,000 flashes. A stiff layer locks in its first, accidental columns (cut from early leftovers) and is too slow to correct them. **Stiff from birth means locked accidents.** This echoes the owner's earlier point that strict freezing causes locking and patchwork.

## Conclusions
- The spread of plasticity is useful in itself: it's a way to make parallel layers hold different things without designing what each holds.
- For a true long-term layer, stiffness shouldn't be fixed from birth. It should come with being proven: a column starts plastic and hardens as it keeps resolving heat (the owner's freezing-as-a-spectrum idea). That's the natural next experiment.

## Rising heat
The plasticity values (an experimental variable), COOL = ETA_M / ETA_HOT (from the core's own rates), the focus stream's 300 / 10 / 80% (a world setting, not a machine setting).
