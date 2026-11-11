# 03 · Pattern: one shape, recognised anywhere

## In one paragraph
A part is stored as its **shape only**, as if cut out and slid into a corner. Where it sits in a picture is a separate note: "this part, placed here". A composite remembers the **spacing** between its parts, not where they are on the page. So a house learnt at the top left is the same house at the bottom right. To recognise, the machine slides each known shape over the picture and finds where it fits.

## Why it matters
- **The same thing shouldn't have to be learnt again in every position.** Separating *what* from *where* means it's learnt once and recognised anywhere.
- It's the foundry's pattern: one master shape that every casting is made from.

## How it works
1. **Stored without position.** Every part is kept in its own frame, and every memory and composite lists placements (which part, at what offset).
2. **Recognising.** Each lit pixel in the picture votes for the positions where a known shape would line up with it. The position with the most votes is where the shape fits. A shape is placed if it explains more than it gets wrong, and more than the price of placing it.
3. **Comparing at every shift** (01 · Smelt) is what finds the same part in different places: two pictures with a house in different spots still line up when one is slid over the other.
4. **Duplicates are removed:** two units that look the same, wherever they sit, collapse into one.

## What it showed
- In a 10×10 world of scenes, every shape and object was recovered as a single unit. Each was learnt once, then recognised in positions it had never been seen in.
- After a bug was fixed (the same house kept three or four times), there were no duplicates.

## What to show people
- One house learnt in one corner, then recognised everywhere else.
- The voting: pixels lighting up the positions where a shape would fit.
- *What* (the shape) and *where* (the placement), drawn as two separate things.

## Limits and open questions
- Recognition is of exact shapes. A slightly different or noisy shape is a different thing, unless it's explained as a known shape plus a few pixels.
- Size and rotation aren't covered: a bigger or turned house is a new shape.

## Where it lives
- Code: `src/engine/see.js` (parts in their own frame, placements, `greedy` and `explain` voting by offset).
- Experiment: C18. Findings: `experiments/findings/C18*.md`.
