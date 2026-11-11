# Findings C27: recognising similar situations, not only identical ones

*Code: `models/similar.js` (on C26's `reach.js`, unchanged). Runner: `sketches/C27-similar/run.js` (`KIND=reach` gives C26, `KIND=similar` gives C27; same demonstrations and tests).*

## How it works
- **Situations as cells.** A situation (a thing's surroundings) becomes a set of cells. Each thing nearby lights cells for what it is and where it is, at every scale at once: its exact offset, and the offset rounded to 2, 4, 8 and 16 cells. Nearby positions share more cells; the same position shares all of them. There's no blur size to choose.
- **Exact first.** Out to each distance, what was seen exactly like this decides, as in C26.
- **Similarity only where needed.** Only when nothing exactly like it was ever seen is it recalled by overlap (shared cells over all cells), and only among situations that were identical out to the previous distance. "What happened in situations like this one, which were the same as far as I'd already looked?"

## Two versions that didn't work (kept for the record)
- **Similarity everywhere:** bounces improved, but moving on fell to 87%. A free object with a neighbour four cells away looked like a bump.
- **Similarity only when exact memory runs out, but against every situation:** still too eager (moving on 88–92%).

## Results (24×24, rooms of random size and place; C26 exact vs C27 similar)
| | C26, 375 demos | C27, 375 demos | C26, 1,500 demos | C27, 1,500 demos |
|---|---|---|---|---|
| next step, two objects | 88% | 86% | 92% | 91% |
| next step, five objects | 61% | 58% | 70% | 67% |
| moving on (five) | 100% | 93% | 100% | 95% |
| turning round, wall or bump (five) | 53% | **77%** | 70% | **84%** |
| changing shape (five) | 23% | **50%** | 42% | **57%** |
| imagining five, right at step 10 | 31% | **46%** | 43% | **53%** |
| imagining five, right at step 20 | 12% | **27%** | 16% | **27%** |

- **Generalising works where it was missing.** With a quarter of the demonstrations, C27 gets bounces and shape changes about as right as C26 does with all of them. Imagination stays right for longer.
- **The cost: it sometimes over-generalises.** Moving on drops from 100% to about 95%: a new situation that resembles a bump gets treated like one. That's the trade-off now.

## Next
- **Over-generalising:** when recalling by similarity, how similar is similar enough? The natural answer is the energy rule: trust a similar memory only if using it describes what happens more cheaply than not using it. To be tried.
- **The same idea for shapes:** noisy pictures and variations of the same thing.
