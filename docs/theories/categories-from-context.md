# Categories from context: "animal", implicit and explicit

A theory note, from a conversation between the owner and the assistant. **Nothing here has been tested.** It sets out
how a category such as "animal" could form legitimately in AMP, from the machinery already agreed, in two versions:

- **implicit**, where the word is never seen but the things it covers are associated;
- **explicit**, where the word itself is used.

It also sets out how the two meet. The owner sees this as core: it is what decomposition, composition and abstraction
were for. The structure that results doesn't only grow upwards, but in many directions at once. The owner hopes the
AMP interpreter can learn it quickly. The note ends with how that would be tested.

Related: the [language](../../language/README.md) ([walkthrough](../../language/walkthrough.md) steps 5–8:
alternatives, keys, types, member definitions, resolving in the loop), [learned computation](learned-computation.md),
[structure over strength](structure-over-strength.md), [explainable by design](explainable-by-design.md) (AMX).

---

## 1. The machinery it uses

Nothing new. Everything here is already in the language:

- **reading with resolve in the loop**: every moment, resolving only where there is heat, taking in what is held as
  context;
- **alternatives**: when the same step of a chain meets different things, they become alternatives, `x -> a | o -> y`;
- **types**: a named set of alternatives;
- **comparison** by intersection (`∩`) and symmetric difference (`△`), and comparison of stored assemblies **only where
  they share members**, through pivot points;
- **forming beside, never editing**: assemblies are immutable, so every new structure is added alongside.

## 2. Implicit: the category without its name

**It forms from things turning up in the same places.**

1. Reading "the dog eats", then "the cat eats": at the step after "the", the chain expected "dog" and met "cat". Resolve
   forms alternatives:
   ```
   the -> dog | cat -> eats
   ```
2. "the bird eats" adds a third: `dog | cat | bird`.
3. The same happens in other frames:
   ```
   the -> dog | cat | bird -> sleeps
   a   -> dog | bird       -> ran
   ```
   Each frame grows its own set of alternatives, and **they keep being largely the same set.**
4. Those sets share members ("dog" is in all of them), so they meet at pivot points, and comparing them is the local
   comparison resolve is allowed. Their **intersection**, the things that keep turning up wherever the others do, forms
   as an assembly of its own:
   ```
   forms #41 = ⟨{dog, cat, bird}⟩     the things that eat, sleep and run
   ```

`#41` is "animal" without the word: a category defined entirely by the company its members keep. Linguistics has a
name for the idea that words used in similar contexts have similar meanings: the **distributional hypothesis**, from Zellig
Harris and J. R. Firth in the 1950s. Here it isn't a statistic over a corpus. It falls out of alternatives and
intersection, one sentence at a time.

**It is fuzzy at first, and partly wrong.** "the man eats" and "the child sleeps" fit the same frames, so early on `#41`
is closer to "living things that act" than to "animal". It sharpens as frames arrive that animals share and people don't,
such as "the dog barked" or "on a leash". Those make a smaller intersection inside the larger one. The fuzziness is
realistic, not a flaw, but it means varied text is needed before the category matches the word.

## 3. Explicit: the word arrives

"animal" is first just another chain of letters. Then two things happen:

- **It appears in the same frames**: "the animal eats", "an animal sleeps". So it joins the same alternative sets as
  "dog" and "cat":
  ```
  the -> dog | cat | bird | animal -> eats
  ```
- **It appears in sentences that link it directly**: "a dog is an animal", "animals like cats and dogs". Those form
  transitions from the specific words to it.

## 4. Where they meet: the word is grounded

Now the word's assembly and the unnamed category **overlap heavily**: they share frames and they share members. So
comparison, local through those shared members, forms their intersection, and **the word becomes bonded to the
category.**

- Invoking "animal" brings back the category, the dog-cat-bird set.
- Invoking the category brings back the word.

**The name and the concept formed separately, then found each other.** That is the label grounded in what it means,
rather than defined. The two routes also check each other. A word whose company doesn't overlap its supposed category,
or a category no word settles on, stays visibly separate in the structure, and AMX can see it.

## 5. Not just upwards: many directions

The owner's picture is that composition, decomposition and abstraction don't only build a ladder upwards. They build in
many directions at once, and together make something complicated but structured. On this example the directions are
concrete:

| Direction | What forms | Example |
|---|---|---|
| **up** (composition) | wholes made of parts | letters into "dog"; "the", "dog", "eats" into a sentence |
| **down** (decomposition) | the parts that vary, beside the whole | "dog" and "cat" as alternatives within "the _ eats" |
| **sideways** (alternatives, types) | sets of things that can stand in the same place | `dog \| cat \| bird` |
| **across frames** (abstraction) | what the sets from different frames share | `#41`, the things that eat, sleep and run |
| **diagonally** (grounding) | a word bonded to a category it wasn't built from | "animal" ↔ `#41` |
| **through time** (transitions) | what follows what | `dog -> barks & day` |
| **inwards** (refinement) | smaller intersections inside larger ones | animals inside "living things that act" |

The same word sits in all of these at once. "dog" is a whole of letters, an alternative in many frames, a member of
`#41`, a source for "barks", and a specific case of "animal". Because members are pivot points that many assemblies use,
none of these structures has to be built in a particular order or nested in one hierarchy. **It is a web, not a tree**:
each assembly is a set, and sets overlap in every direction.

## 6. Why it could be quick

- **One exposure each.** Every step above is a single resolve on a single misfit. A frame's alternatives start forming
  the second time the frame is met with something new in it.
- **No counting.** Nothing waits for statistics to accumulate. The category forms as soon as two frames' alternative sets
  share enough members to be compared, and it grows each time another frame agrees.
- **Comparison is local.** Only assemblies that share members are compared, so the work doesn't grow with everything ever
  read.

So the hope is tens of sentences, not millions, for the implicit category to appear, and a handful more uses of the word
for it to be grounded. That is a hope, to be tested.

## 7. How to test it (AMX)

A small world written from a grammar, so the right answers are known. The machine never sees the grammar.

- **Vocabulary**: a few animals (dog, cat, bird), a few people (man, child), a few objects (ball, cup); verbs that some
  share (eats, sleeps) and some don't (barks, flies, rolls); frames such as "the _ eats", "a _ ran", "on a _".
- **Phase 1, implicit**: sentences with no category words.
- **Phase 2, explicit**: add "animal" in the same frames, and a few linking sentences ("a dog is an animal").
- **Text in**, read at the character level, with resolve in the loop.

**Predictions, to be fixed before any run:**

1. **The implicit category forms.** An assembly forms whose members overlap {dog, cat, bird} by at least 2 of 3, from a
   number of sentences to be stated in advance.
2. **It is fuzzy first, then sharpens.** Early on it includes man and child. After the frames animals don't share with
   people arrive, a smaller assembly forms inside it, excluding them.
3. **Objects stay out.** "ball" and "cup" never join it, since they don't share its frames.
4. **The word is grounded.** After phase 2, invoking "animal" brings back at least two of dog, cat and bird, and invoking
   the category brings back "animal".
5. **Speed.** The numbers of sentences for predictions 1 and 4, stated in advance, and compared with the hope of §6.
6. **Everything is traceable.** Every assembly involved can be asked where it came from (the record of changes) and what
   it is (invoked and named by AMX).

**What could fool us:**

- **A grammar too clean.** Frames written so that categories line up perfectly make it easy. The world should include
  overlaps and odd cases: things that eat but aren't animals, animals that appear in only one frame.
- **One member per word.** Real runs have several members per thing, overlapping. The test should use that, or it's
  testing a grammar, not a memory.
- **Naming by hand.** AMX names the category for reporting only. If the name ever reached the machine, the grounding in
  §4 would be faked.
- **Seen once, then claimed.** The category must appear on **new** sentences too. A new animal word placed into a known
  frame should join the category's alternatives without that pairing being shown.

## 8. Open questions

1. **When two alternative sets are similar enough to compare**: how much overlap, and where that comes from without being
   tuned.
2. **Word boundaries** at the character level: whether spaces really break chains into words, as walkthrough step 8
   suggests.
3. **Relations, not just categories.** "a dog is an animal" is a relation. Does it need more than transitions, or is it a
   transition that happens to link a specific word to a category's word?
4. **Mistakes in grounding.** A word that keeps the company of a category but means something else (a pet's name, say).
   What keeps it out?
