# C10 Outcompeted and duplicate columns (a visual aid, no change to learning)

*Model: `models/staged.js` (diagnostics only: `diagnose()`, runner-up tracking). Viewer: `sketches/C10-outcompeted/viewer.html`. Probe: `sketches/C10-outcompeted/probe.js` (SC, update "hot", 60,000 flashes, seeds 1 and 2).*

## The markers
- Recent counts fade over TAU = 2,000 flashes: wins; second places (runner-up to the winner); near ties (second, within 1 of the winner's distance).
- **Outcompeted:** at least 3 recent second places, and second in at least 60% of the flashes it took part in (won or came second).
- **Near-duplicate:** another column in the same layer differs from it by less than 1 in total (sum of squared strength differences), and that twin has more recent wins.

## What the probe saw
| | layer 1 (6) | 2 (12) | 3 (24) | 4 (48) | 5 (96) |
|---|---|---|---|---|---|
| outcompeted (flash 60,000, two seeds) | 1 | 1–2 | 5–7 | 13 | 22–27 |
| near-duplicates (flash 40,000, just after layer 5 appeared) | 0 | 0–1 | 0–1 | 3–4 | 38–39 |
| near-duplicates (flash 60,000) | 0 | 0 | 0–1 | 2–4 | 22–26 |

- Duplicates are mostly **siblings that haven't drifted apart**: they peak right after a layer appears (children start as copies of their parent) and thin out as they specialise, but about a quarter of the 96-column layer is still a duplicate after 20,000 more flashes.
- **Outcompeted columns grow with layer size:** about a quarter of the 96-column layer comes second far more often than first. Most duplicates are also outcompeted.
- Few columns never win at all: redundancy here is "always second", not "never used".

## Settings (for the aid only)
TAU 2,000, NEAR 1, OUT_MIN 3, OUT_SHARE 0.6, DUP 1.
