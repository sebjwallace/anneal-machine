# Findings C07: attention, look only where it is still hot

*Sketch: `sketches/C07-attention/` (run.js, results.json, results-flip.json, viewer with presets). Model: `models/funnel.js`, arms FP, AG, AGL, AD. Funnel 100, 50, 25, 13, 6; plasticity 0.4 (wide) to 0.025 (narrow) unless flipped; 6,000 flashes, 5% noise, shuffled; 3 seeds. With attention (a cascade), layers take turns, each seeing only the pixels still unexplained; a layer given nothing does no work. Work = columns checked per flash.*

## Results
Doing nothing (the input as its own picture): error 1.26 at 5% noise, 3.80 at 15%, 2.15 with 30% missing.

| arm | heat | wrong | error 5% | error 15% | error, 30% missing | new shapes heat | work per flash |
|---|---|---|---|---|---|---|---|
| FP: every layer sees everything | 0.02 | 0.00 | 0.90 | 3.11 | 3.11 | 0.03 | 534 |
| **AD: attention, detail first** | **0.02** | 0.00 | **0.88** | **3.09** | 3.05 | 0.04 | **297** |
| AG: attention, generic first | 0.14 | 0.03 | 1.63 | 3.65 | 3.04 | 0.17 | 193 |
| AGL: AG with local heat | 0.16 | 0.02 | 1.73 | 3.72 | 3.11 | 0.15 | 239 |

Plasticity flipped (narrow layers fast): everything worse (FP 0.10, AD 0.10, AG 0.25 heat).

## What it showed
1. **Detail first is as good as looking at everything, for about 45% less work** (297 against 534 columns checked). The detailed layers explain most of a flash; the generic ones are only consulted for what's left.
2. **Generic first is cheapest but hides its own mistakes** (heat 0.14, wrong pixels 3 to 10 times higher, worse at seeing through noise and on new shapes). Generic parts claim pixels confidently and roughly; the detail layers never get to correct what was claimed. This is the blind spot predicted beforehand ("a self-consistent wrong explanation doesn't feel hot"). It isn't caused by the generic layers being stiff: making them fast made it worse.
3. **Local heat didn't help** generic-first.
4. **Filling in missing pieces is still worse than doing nothing** in every arm (about 3.1 against 2.15). Attention doesn't fix that: nothing yet completes a pattern from its parts.
5. **New shapes from known parts are explained well** (heat 0.03 to 0.04) when detail goes first or everything looks.

## Conclusions
- The ordering echoes the core's episodic memory: **be specific when you recognise the specific; fall back on the general for what's left** (doc 16, findings 09). Detail first is that rule, applied to seeing.
- Attention as "only look where it's hot" saves energy without loss, if the specific looks first.
- The blind spot is real: a cheap generic first pass needs a way for later layers to object (heat from wrong pixels that flows back, not only leftover that flows forward).

## Rising heat
None new in the machine: the cascade order is an arm; work is a measure.
