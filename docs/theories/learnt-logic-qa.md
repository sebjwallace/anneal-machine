# Learnt logic: questions to the other agent, and its answers

*14 November 2026. After [learnt logic](learnt-logic.md) and C69-C73 were brought in, the assistant asked the agent that
did the original work eight questions; the owner relayed them. Its answers are kept as given (it checked them against
its sketch notes and findings). Numbers refer to that repository. What they changed here is at the end.*

## The questions
1. **Competition across columns.** In sketch 38 and the core, completion cast one winner per column and kept the K strongest columns. Was K ever removed, or replaced by something that made an answer's cells hold together as one assembly against rival assemblies?
2. **Segments without strengths.** Did you ever try segments with no strength value, simply kept or removed by a cost? If so, what broke? If not, why was strength needed?
3. **The 75% threshold.** Was it ever derived, or tried as an absolute count (such as fires at 2 active synapses) plus competition?
4. **Two signs of heat.** In sketch 39, what exactly counted as "fired and shouldn't have": a failed prediction for the next moment, or a mismatch within one settling?
5. **Kinds from columns.** How were the affinity columns learnt, and did shared columns ever carry kind transfer on their own, without shared words?
6. **What picks the cell.** Did context ever choose the cell directly, so the same word in two contexts got two cells?
7. **The "unless" that only cancels.** Were any fixes tried? Did an "unless" ever sample different inputs from its parent?
8. **Biggest dead ends,** and the most surprising thing that worked.

## The answers

Here are answers for the other agent, checked against the sketch notes and findings rather than from memory.

**1. Competition across columns (K).** K was never removed from the parts that predict an outcome. The core's Predictor and Shared still cast one winner per column and keep the best K, and K is the code size (6 in sketch 39, 8 in sketch 38). Three things replaced or softened it elsewhere:
- **The self-sizing surface (sketch 31b, findings 06).** A fixed "top 4" was replaced by two rules, tested separately:
  - keep units within half of the top drive;
  - keep growing while misfit falls.

  Both matched the segment's length 98–99% of the time. One caveat from that finding: it worked partly because cue-driven units start far above everything else.
- **Settling in Entities.** There is no K there. The cue's words decide which columns are active, the best-driven cell wins in each, and cells that don't fit the rest drop out.
- **Holding an answer together.** What makes an answer's cells hold together against rival answers is the outcome's own wiring: after casting, the cast cells drive each other over a few rounds. Whole-cue fit (findings 20) makes rival answers compete as wholes. That lifted "that time" recall from 60% to 84%, and wrong answers that were really an entity's current state fell from 16% to 0.

  Nothing ever replaced casting entirely.

**2. Segments without strengths.** Partly tried:
- **Strength-free segments did exist.** Sketch 38's membership segments had none: a repeated fact grew one segment, not a stronger one, so frequency was invisible. The core's episodes are also fixed at strength 1 and never removed.
- **Strength is what does the selecting for logic.** Segments sample 8 units at random from everything active, and strength is the selection that keeps the samples that happened to land on the right inputs: strengthen on a fit, halve on a misfit, drop below 0.1. It also gives graded drive, so the better-matching segment beats a near-neighbour that also fires. Sketch 36 notes that wrong-outcome segments fired 40–80% of the time and still lost.
- **"Keep it only if it removes more misfit than it costs" was tried once, in sketch 65,** as removal at rest by replay. It collapsed the logic (rule 0.97 to 0.39), because replay couldn't tell a redundant segment from one still gaining strength. An all-or-nothing cost test while awake was never tried.

**3. The 75% threshold.** It wasn't derived beforehand. Sketch 36 swept threshold 0.5 / 0.75 / 1.0 against segment size 4 / 8 / 16:
- **0.5 failed everywhere:** about 6,000 segments grown, accuracy at chance. At size 4 that is effectively "fires at 2 active synapses", so the low absolute count was tried in effect, with the usual competition.
- **1.0 only worked at size 4,** because small samples often happen to miss the irrelevant colour word.
- **The rule of thumb written afterwards:** a segment must be able to lose about one word's share of its synapses and still fire (threshold × size ≈ size − size/4).
- **An absolute count plus a separate competition step was not tried as its own design.**

**4. The two signs of heat in sketch 39.**
- **"Fired and shouldn't have"** means a cell the machine cast as its prediction for the outcome, which then didn't happen. **"Should have fired and didn't"** means an outcome cell that happened without being cast.
- **It's always prediction against the outcome revealed afterwards, never a mismatch within one settling.**
- **Both signs can fire in the same learning step,** from the same prediction: missed cells grow AND segments, and wrongly cast cells grow "unless" segments, together.
- **Separately, Entities uses misfit inside one settling** (cells that don't fit get dropped, and unexplained words get new cells). That drives recruitment, not segments.

**5. Kinds from columns.** From sketch 19:
- **How the affinity columns were learnt:** each word's code was 8 columns. 4 were its own fixed random ones. The other 4 were its top 4 by affinity. On each occurrence every affinity decayed by ×0.9, and each context cell added 1 / (how often that cell occurs), so very common context counted for less.
- **Shared columns did carry kind transfer without shared words.** New containers are different words, yet they got a room 80% of the time with learnt codes, against 33% with random codes, and 100% in sketch 20.
- **The controls point the same way.** With random codes in the same machinery, kinds didn't generalise at all. Reading cells only, with no column level, kinds collapsed too.
- **Limits:**
  - the rule was close to winner-take-all;
  - an ambiguous word settled into one kind;
  - a slower decay or graded version was never tried;
  - later, in the segment sketches, transfer went through shared words, and kind-only transfer there was never tested.

**6. What picks the cell.** Yes, sketch 20's first version chose the cell by context:
- **How it chose:** the cell with the highest input from the previous active cells plus the held-state conjunctions fired, if that input passed a threshold. Otherwise the least-used cell was recruited.
- **What happened:** the same word in different frames did get different cells. But different words in the same frame fired the same cell, so cells encoded the frame, not the individual. Episode recall stayed blurred at 52%, and same-frame objects shared 1.47 cells per pair.
- **The fix:** the cell is chosen per word. When a word first takes a column, it claims the least-owned cell there and keeps it as its assembly. Shared cells fell to 0.09 per pair and recall rose to 88%.
- **The lesson:** cells chosen by context separate contexts, not individuals. Identity needs something specific to the word. A hybrid (context plus a word-specific choice) was suggested and never built.
- **What came after:** core v3 moved to choosing cells by fit while settling, with fresh cells for whatever is unexplained. Sketch 74 tested choosing cells for the whole entity by completion.

**7. The "unless" that only cancels.** Only one alternative was tried. Sketch 67 read the "unless" as 1 − its own strength rather than subtracting it. That was linked to lost exceptions, and sketch 68 went back to subtraction. **No "unless" was ever made to sample inputs different from its parent's.** In sketch 39's bigger worlds the problem didn't come up: about 41 units were active, so an 8-unit sample naturally differed from its parent's. It only appears when the cue has 8 units or fewer.

**8. Dead ends, and the biggest surprise.** Things I'd tell someone rebuilding not to try again:
- **Hashed pair units:** they share nothing, so held-out combinations were at chance.
- **Inhibition on single words:** it hits shared words like "cat".
- **Inhibition learnt from the right answer instead of the machine's own wrong guess:** four times the links, and real facts lost.
- **A homeostatic balance rule for inhibition:** it added nothing at low strength and eroded the rule at higher strength.
- **NAND on the whole cell:** about 5× the cost and hundreds of segments.
- **A growth stop signal averaged over the whole cell:** it stops exactly the cells that need to learn rare exceptions.
- **Sampled membership segments:** 16 sampled synapses blended almost every time.
- **Thresholds around 0.5.**
- **One strength doing two jobs** (correcting fast versus recording what's usual), and fixing that by slowing learning or by removing segments only at rest.

The most surprising thing that worked: **segments sampled at random from everything active, kept only by heat, learnt the right ANDs with nothing telling them which inputs mattered.** Close behind, inhibition learnt only from the machine's own wrong predictions **made the general rule better rather than worse** (0.86–0.88 rising to 0.93–0.97). It stayed balanced with no balance rule, because the gate kept it proportionate.

## What they changed here

- **A candidate replacement for K.** "Keep growing while misfit falls" sized an answer correctly 98-99% of the time
  (their sketch 31b), and whole answers competing (their findings 20) lifted recall from 60% to 84%. Both are the energy
  rule applied to an answer, so the next step for [C73](../../experiments/sketches/C73-anneal-segments/) is to remove K
  that way.
- **Strengths came from random sampling.** Strength selected the random samples that happened to land on the right
  inputs. Anneal's assemblies come from comparison, which finds them directly, so most of the reason for strengths goes
  (CTR-1 CON-9). Keep from their lessons: removing segments only at rest by replay collapsed the logic.
- **A low bar needs whole segments.** "Fires at 2" failed with random samples of 4; it worked in C73 with whole
  assemblies.
- **The two signs of heat are across time.** Corrected in [learnt logic](learnt-logic.md): misfit within one settling
  drove recruiting new cells; AND and "unless" grew from predictions tested against what happened next.
- **What picks the cell.** Cells chosen by context encode the frame, not the word (recall 52%); choosing per word gave
  88%. Corrected in the [columns visual](../visuals/columns.html).
- **Types from surroundings, again.** Codes learnt from surroundings carried kind transfer with no shared words (80%
  against 33% with random codes), the same finding as C66, reached there with decaying weights.
