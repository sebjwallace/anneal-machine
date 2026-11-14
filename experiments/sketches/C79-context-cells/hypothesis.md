# C79 · Which cell: Numenta's scheme in a text world: hypothesis

What picks the cell for a new memory was the open piece for text (RM-1). Cells chosen by context alone encoded the frame,
not the word (the other repository's sketch 20); one cell per word keeps the word but loses its context. Numenta's scheme
gives both:
- the column is the word's identity;
- the cell is its context;
- a predicted cell is used when context predicts one;
- otherwise the whole column lights and one cell (least used) learns this context.

**Hypothesis:** on cells and segments (firing at two), this predicts the next word sharply where one cell per word can
only predict every word that ever followed; a word never seen in a frame still generalises through its column. The test
world is "the S V the O", where the object depends on the subject and verb together. Predictions in
[PREREG.txt](PREREG.txt).
