# 04 · Cast: many castings from one pattern

## In one paragraph
A picture can hold several of the same thing: two houses, three sticks. The machine handles that naturally. Once one house has been placed, those pixels count as explained, and it looks again at what's left. The same house shape can be placed again, somewhere else. Two houses are simply "house here, house there": one pattern, two castings. At rest, a memory is also compared with itself, so a repeat inside one picture is found too.

## Why it matters
- Real scenes are full of repeats. Treating "two of the same" as two separate new things would waste memory and miss the point.
- It's cheap: remembering two houses costs two placements, not two pictures.

## How it works
1. **Explaining:** after each placement, the explained pixels are set aside, and the search continues on what's left. A part may be placed as many times as it newly explains something. The only rule is that the same part can't be placed twice in the same spot.
2. **Pulling apart (01):** a part compared with itself, shifted, finds a piece that repeats inside one memory.
3. **Grouping:** every occurrence of an arrangement is counted, including repeats inside one memory, and every occurrence is replaced by the composite.

## What it showed
- Two houses were explained as the house unit placed twice, with nothing left over.
- **Copies of a known thing:** in 88% of scenes, one unit explained every copy.
- **Two copies of an object never seen before:** the same known parts were reused for both copies, every time.

## What to show people
- A picture with two or three copies, explained by the same unit placed several times, each placement in its own colour.
- The cost: two houses costing about two placements, not two pictures.

## Limits and open questions
- When copies touch, the machine may see them as one bigger shape (like "twins", which is two blocks). Whether that's right depends on what has recurred.
- Choosing the best explanation is a search. The engine tries every opening placement awake (see 09 · Fettle), which fixed cases like "one box for two sticks".

## Where it lives
- Code: `src/engine/see.js` (`greedy`, `explain`; self-comparison in `shifts` and `splitGeom`; `findIn` for grouping).
- Experiment: C19. Findings: `experiments/findings/C19*.md`.
