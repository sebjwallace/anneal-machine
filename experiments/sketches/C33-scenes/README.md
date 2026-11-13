# C33 scenes: a forest and a city, for episodic memory

A picture world (W x W binary pixels, default 32, also works at 24) of whole scenes built from five small objects:
tree (3x4), cabin (5x4), house (5x5), car (5x3) and a rare person (1x3). Cabin and house share the same roof;
the car's wheels and the tree's trunk are both single pixels under a solid body. No two objects ever touch (always a 1-pixel gap).

How scenes are laid out:
- FOREST: two or three groves at random spots; a grove is a neat grid of trees (2-3 across, 1-2 rows, trees 4 px apart
  across, 5 px down, now and then one missing). Half the time a cabin stands right beside a grove; 1 in 5 has a car in the lower half.
- CITY: a street at a random height. A row of houses 6-7 px apart, a road row with 2-3 cars under it, and (60% of the time)
  a second row of houses facing them below the road. One or two trees dotted wherever there is room.
At W=32: forests average ~11 objects / ~88 px, cities ~8 objects / ~106 px. Each scene is different, but the
large-scale structure (clumps of trees vs. a street) is the same every time.

API (`world.js`): `W`, `SHAPES` (name -> [[x,y],...]), `SIZE`, `PIECES` (the shared parts and where they sit),
`scene(r, type, W=32)` -> `{ x: Uint8Array, type, objects: [{ name, x, y }] }`, and
`stream(r, n, W=32, mix = { forest: 0.5, city: 0.5 })` -> array of scenes. `r` is `rng(seed)` from src/worlds/catalogue.js.

What it tests: can the engine store a whole scene as one memory, general at the top ("a forest", "a street") and
detailed underneath (which objects, where), and recall the whole scene from a part of it?
`node preview.js [W]` prints 3 scenes of each kind, a same-seed check, and stats over 600 scenes.
