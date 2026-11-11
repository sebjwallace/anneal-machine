# Findings C12: restless idle columns (added to the C11 page)

*Model: `models/staged.js`, opt.restless. Probe: `sketches/C12-restless/probe.js` (RA, big layer only, speed 0.2, update "hot", no pattern noise, 20,000 flashes, seeds 1 and 2; wins counted over the last 5,000).*

## The mechanism
After each flash, every column that did not win has its strengths jiggled at random by up to a = restless x min(1, idle / (3 x layer size)) x (1 - fit), where idle = flashes since it last won, and fit = a running record (rate 0.1) of how well it fits the flashes it does win (1 - heat, at least 0). Quiet columns wander until they catch a pattern; columns that fit what they win calm down.

## Results (96-column layer)
| most jiggle per flash | columns winning at least 0.2% of flashes | top 5 columns' share | patterns with their own column | heat |
|---|---|---|---|---|
| 0 | 19 | 42% | 19 of 98 | 0.51 |
| 0.005 | 31 | 36% | 31 | 0.40 |
| 0.01 | 33 | 30% | 33 | 0.39 |
| **0.02** | **41** | **24%** | **41** | **0.37** |
| 0.05 | 31 | 31% | 31 | 0.46 |

## What it showed
- **Hogging is severe without noise:** only 19 of 96 columns ever win; five columns take 42% of all flashes.
- **Restless idle columns spread the work:** at 0.02, 41 columns win and heat falls from 0.51 to 0.37.
- **Too much restlessness hurts again** (0.05): columns are shaken off patterns before they settle.
- **Pattern noise had been doing part of this job:** with 5% noise and no restlessness the same layer reached 0.32 (C11).

## C13: columns that start fully random (opt.start = 'random')
Same probe, every pixel of a fresh column starting anywhere from 0 to 1 instead of faint haze (0 to 0.05):

| most jiggle per flash | columns winning | top 5 share | heat (random start) | heat (haze, above) |
|---|---|---|---|---|
| 0 | 26 | 37% | 0.47 | 0.51 |
| 0.01 | 29 | 38% | 0.45 | 0.39 |
| 0.02 | 35 | 37% | 0.42 | **0.37** |
| 0.05 | 33 | 37% | 0.48 | 0.46 |

- Without restlessness, a random start spreads the wins a little better than haze (26 against 19 columns).
- With restlessness, haze does better (0.37 against 0.42). Patterns are sparse (about 7 of 25 pixels on), so a random column, half on on average, is far from every pattern and rarely wins; a hazy one is close to all of them and gets drawn in. Small jiggles don't bring a random column close enough.

## New settings (rising heat)
The full-restlessness point (3 fair shares), the fit record's rate (0.1), and restless itself (an experimental variable, default 0.02 on the page).
