# Working on this sandbox

This folder is a domain sandbox: a small, self-contained application that houses an interactive model of a subject, so people can understand it by working with it. It was built with [Sandkit](https://github.com/sebjwallace/sandkit).

## Read first

1. **The goal,** in `sandbox.js`. It says what this sandbox is for, and should guide every change.
2. **Where it stands,** below.
3. **`JOURNAL.md`,** what changed and why, newest first. Read only as far back as you need.
4. **`lib/sandkit/practices/building-a-sandbox.md`,** the method this sandbox follows.
5. **Any other practice the sandbox follows,** such as `lib/sandkit/practices/domain-discovery.md` when it discovers a domain, on a page of its own (`discovery.html` by default) linked from the header.
6. **`lib/sandkit/practices/workshops.md`,** when asked to workshop the sandbox: to review, correct or hand over its model with the people who know the subject.
7. **`lib/sandkit/practices/tagging.md`,** before tagging anything. Semantic tagging is opt-in: it costs tokens, so ask the person first, and suggest starting or stopping if the sandbox's needs change. On a yes, add `sb-tags-mode` to the sandbox's pages, so people can see and follow the tags. To gather what to read on a topic, run `node lib/sandkit/tools/tags.mjs search . <tag> …` before opening records (see `tagging-search.md`).
8. **`lib/sandkit/CATALOG.md`,** for everything Sandkit offers in detail; the index under Sandkit components below covers most needs. Links to anything not in `lib/` point to parts this sandbox doesn't use yet; fetch them from the source recorded in `lib/sandkit/SOURCE.md` if you need them.

## Where it stands

Where this sandbox is now, and how it is meant to grow. Rewrite it at the end of every iteration, when the person chooses where to go next; the journal holds the history.

- **Version:** 0.5.0
- **Chapters built:**
  - 1 · The basics (`index.html`): one rule; pricing a picture; seeing; rest; what's next.
  - 2 · Columns and assemblies (`columns.html`), with symbols rather than pictures: pieces; a column as a stack of floors; floor 0 (where); floor 1 (things); assemblies; completion; floor 2 (things made of things); so far. It runs the engine's `cells.js` and `complete.js` on `symbols.js`.
- **Chapters planned (the owner chooses):** change (transitions, shared changes, context, cues); kinds; the wall (busy scenes); and more on any earlier idea.
- **Practices followed:** building a sandbox only. No discovery engine (the owner's choice for now).
- **Tagging:** no, not needed yet.
- **Chosen direction:** the owner is catching up on how the engine works before guiding the main line. Chapter 1 covers the foundations only, on purpose; he'll say where to go next.
- **Open questions:** the engine's own open decisions are in `../docs/state.md` (section 7).

**The model is the Anneal engine itself**, loaded straight from `../src/` (never copied), so this sandbox must stay inside the `anneal-machine` repo. `model.js` is only a small interface onto it (`createLearner`). Never edit `../src/` from here: it belongs to the main line. Build against `../docs/engine-api.md`, and use the words in `../docs/glossary.md` only.

## Files

| File | What it is |
|---|---|
| `index.html` | The first page: chapters and the interactive surface. |
| `sandbox.js` | The sandbox's name, goal and pages, set on the shell. Every page includes it. |
| `columns.html` | Chapter 2: columns and assemblies, with plain symbols. |
| `symbols.js` | A world of plain symbols (no pictures) that the engine's cells and completion code run on, for chapter 2. |
| `model.js` | A small interface onto the domain model, which is the Anneal engine in `../src/engine/` (loaded by each page, never copied): a learner and a stream of pictures from the scene world. |
| `view.js` | The view model: functions that turn the model's state into what the pages show, if several pages share them. |
| `sources/` | The material this sandbox was built from, described in `catalogue.json`, with new arrivals in `inbox/` and digests of material that couldn't be kept in `digests/`. See `lib/sandkit/practices/sources.md`. |
| `records/` | In a discovery sandbox, what was written from the sources: claims, questions, decisions and the rest, one script per kind. See `lib/sandkit/practices/domain-discovery.md`. |
| `data/` | Data the pages use, as scripts (never fetched): `assemblies.js`, a snapshot of three things the engine learnt, for `<an-assembly>`. |
| `JOURNAL.md` | What changed and why, one entry per version, newest first. |
| `CLAUDE.md` | One line pointing to this file, for agents that read only `CLAUDE.md`. |
| `style.css` | The sandbox's own styles, using the theme tokens (`--sb-*`) as `lib/sandkit/STYLE.md` describes. |
| `lib/sandkit/` | Sandkit components, shell and practices, copied in. See `SOURCE.md` for where they came from. |
| `parts.js` | Functions returning HTML for parts used on more than one page or chapter, if any. |
| `components/` | Components this sandbox owns (ejected or written here), if any. |
| `mechanisms/` | Mechanisms this sandbox owns (ejected), if any. |

<!-- sandkit:components -->
## Sandkit components

*Kept current by Sandkit's setup, along with Sandkit mechanisms. Anything added between these markers is replaced, so keep the sandbox's own notes outside them.*

**Before building any part of a page, find it in the index below and in This sandbox's components.** Build by hand only when nothing fits, and record why in the journal's Parts line (see the building guide, step 5).

- **Use them through their manifests** (`lib/sandkit/components/<name>/manifest.md`, `lib/sandkit/shell/manifest.md`, and for any engine `lib/sandkit/engines/<name>/manifest.md`). Don't read their source: it costs about three times as much as the manifest, which says all you need to use them.
- **Don't edit anything in `lib/`.** It is a copy, and may be replaced when Sandkit is updated.
- **To change a component, eject it:** copy its folder into `components/`, rename it (replace every occurrence of its tag name, e.g. `sb-log`, with a new one), note where it came from at the top of the file, and point the pages that use it at the new copy. From then on it belongs to this sandbox.
- **Combine components in the page,** never inside each other. The practices say which components go together and how to wire them.

What serves each need, kept current from `lib/sandkit/CATALOG.md` by Sandkit's setup. Copying by hand, paste the catalog's Find by need section between these markers.

<!-- sandkit:find-by-need -->
The same catalog from the subject's side: find the need, then read the manifest of what serves it. A component can serve several needs, and a need several components.

### How the subject works

- Something accumulates, and can overflow or run out → `sb-store`
- A supply that's met only in full, or refused → `sb-store`
- How long a supply lasts at the current rate → `sb-store`

### Running and trying things

- Let people play, pause, step and change speed → `sb-controls`
- Let people turn the model's knobs and see the effect → `sb-parameters`
- Scrub back and forth through a run, with named moments → `sb-scrubber`
- Code or an algorithm stepped through, line by line → `sb-code`

### Change and time

- Values change over time and the trend matters → `sb-chart`
- Things that happened, in order → `sb-log`, `sb-timeline`
- Moments and spans laid out in time, with now marked → `sb-timeline`
- Headline figures, their change and whether it's good news → `sb-stat`

### Rules and decisions

- Show which rule applies next and which just applied → `sb-rules`
- One rule read closely: its branch in force, held or broken → `sb-rule`
- A choice that branches on answers down to outcomes → `sb-decision-tree`
- Expected behaviour as Given / When / Then, checked as it plays → `sb-scenario`
- A decision made: the options weighed, the one chosen and why → `sb-choice`
- A status earned or lost: approved, verified, superseded → `sb-stamp`

### Structure and relationships

- Modes and transitions, with what's active now → `sb-statechart`, `sb-graph`
- A network of nodes and links, with things moving along them → `sb-graph`
- Nested things, like folders or an outline → `sb-tree`
- Kinds of things, what they inherit and how they relate → `sb-ontology`
- Entities, their fields and what refers to what → `sb-erd`
- Where things come from and what they lead to → `sb-lineage`
- Software systems, explored level by level → `sb-c4`
- Which sets things belong to, and the overlaps → `sb-venn`
- Everywhere a thing appears on the page, and what it links to → `sb-xref`

### Flow and process

- Steps of a process with branches and lanes, the current one marked → `sb-flowchart`
- Things moving through stages, with limits → `sb-kanban`
- Who sends what to whom, in order → `sb-sequence`
- A workflow lit up as it runs → `sb-graph`, `sb-flowchart`

### Space and maths

- A space of cells coloured by state, which people can paint → `sb-grid`
- Vectors, points and shapes on a plane, moved by matrices → `sb-plane`
- A matrix or vector to read or edit → `sb-matrix`
- An equation whose parts light up what they stand for → `sb-math`
- A picture, map or plan to zoom into, with places marked → `sb-image`

### Comparing and summarising

- Things compared on one measure → `sb-bars`
- Rows and columns to sort, search and filter → `sb-table`
- A large collection to search, filter, sort and group → `sb-search`
- Headline figures against their targets → `sb-stat`

### Data

- A data set's shape: fields, types, gaps and odd values → `sb-profile`
- Which fields determine others or go together → `sb-dependencies`
- JSON with the parts that matter picked out → `sb-json`

### Explaining and guiding

- Text with the parts that matter marked and explained → `sb-annotate`
- A definition, tip, warning or question set apart → `sb-callout`
- A guided tour of the page, one part at a time → `sb-tour`
- A story told across several views, step by step → `sb-walkthrough`
- A code people can point at to light up every mention → `sb-id`
- Everything on the page that can be pointed at, as an outline → `sb-outliner`
- What something is, when people point at it → `sb-inspect-mode`
- Why something is there, traced back on a click → `sb-trace-mode`
- What parts are about, and topics kept lit across the page → `sb-tags-mode`
- Searching by tags, scored, for people in Tags mode and for the agent, and pulling results onto the page → `sb-tags-mode`, `tags`
- A screen or clickable flow of an interface → `sb-wireframe`

### Laying out the page

- Chapters or views, one at a time → `sb-tabs`
- Sections that open and close, saying what changed inside → `sb-accordion`
- A view people can pop out, move and dock back → `sb-panel`
- The one thing that needs attention now, over the page → `sb-modal`
- Gathering what bears on one question side by side, laid out from rough places, with no coordinates or screenshots → `sb-board`

### Working with people

- Comments from people exploring, gathered for the agent → `sb-comments`
- A question put to a group, answers hidden until all are in → `sb-poll`
- A prediction made before the reveal → `sb-poll`
- Who someone is, and everywhere they appear → `sb-person`
- A workshop's record, in sections to filter and move through → `sb-notebook`
- Handing something to the agent, and showing its reply → `sb-handoff`
- A decision a group records together → `sb-choice`

### Sources and evidence

- The sandbox's source material, to search and filter → `sb-sources`
- One source, with the passages the model cites marked → `sb-source`
- What something rests on, back to its sources → `sb-lineage`
- Discovering a domain on purpose: cards of claims, questions and decisions → `sb-discovery-card`, `discovery`
- Weighing claims, and what stands as of each iteration → `discovery`
- What the people involved agree shapes a domain, on one sheet, to sign, test against and share as a PDF → `sb-discovery-card`, `discovery`
<!-- /sandkit:find-by-need -->
<!-- /sandkit:components -->

<!-- sandkit:mechanisms -->
## Sandkit mechanisms

**Before writing any part of the domain model, find it among the mechanisms in the index above.** Write it by hand only when nothing fits, and record why in the journal's Parts line (see the building guide, step 4). Read `lib/sandkit/practices/mechanisms.md` before building or changing the model.

- **Use them through their manifests** (`lib/sandkit/mechanisms/<name>/manifest.md`), never their source.
- **Don't edit anything in `lib/`.**
- **To change a mechanism, eject it:** copy its folder into `mechanisms/`, rename it with this sandbox's own prefix (its folder, file and global: `sb-store` and `SbStore` become, say, `wh-store` and `WhStore`), note where it came from at the top of the file, and point the model and pages at the new copy. From then on it belongs to this sandbox.
- **Compose them in `model.js`,** never inside each other, naming things for what they are in the subject.
<!-- /sandkit:mechanisms -->

## This sandbox's components

Parts of the surface this sandbox made its own, once they were needed in more than one place. Use them through these lines, not their code. See `lib/sandkit/practices/domain-components.md`.

- `<an-columns>` in `components/an-columns/`: columns side by side as 3D stacks of floors, a cube per lit cell (CSS 3D). Takes `columns`, `floors: [{ f, label, ref }]`, `cells: [{ col, f, x, y, ref, tags, chain, group, filled, color, tone, text, title }]`; `chain` joins a piece up its column, `group` joins a thing across columns. View cube, orthographic by default, row/grid layout, settings panel; pointing announces, announced refs/tags light; click to keep a cell's neighbours. See its manifest.
- `<an-assembly>` in `components/an-assembly/`: one thing two ways (its cells in an `<an-columns>`, and its picture), linked by pointing; focus on a thing inside it, offsets, kept or filled in, pull apart, play completion. Takes `data` (as in `data/assemblies.js`) and `thing`. See its manifest.
- `<an-sequencer>` in `components/an-sequencer/`: a design pad for column experiments: set up a grid of columns and cells, paint which columns (or cells) are active per time step, hold columns on at every step, a timeline with thumbnails and playback, the design as JSON. `design`, `step`, `activeAt(t)`; events `an-sequence-change`, `an-step`. Used on `workbench.html`. See its manifest.

## Conventions

- **Be economical with tokens, unless the person asks otherwise.** Read only what you need, trust components to do their work, and let the person's feedback do the checking rather than screenshots and repeated looking. Never at the cost of what they asked for.
- **Work in iterations.** One chapter or change at a time, handed over before the next. See `lib/sandkit/practices/building-a-sandbox.md`.
- **Journal every change.** After any meaningful change, add an entry to `JOURNAL.md`, update Where it stands, and commit if the folder uses Git (tagging a breaking version). See `lib/sandkit/practices/journal.md`.
- **A page per part worth sharing on its own,** once the sandbox grows: each listed in `sandbox.js`, sharing `model.js`, and including only what it uses, so it can be exported alone. See `lib/sandkit/practices/pages.md`.
- **Exporting a page:** when asked, run `node lib/sandkit/tools/export.mjs <page>.html` from this folder (the page's Export button gives people the prompt), then report where it saved, every file that went in with its size, and any warnings.
- **Sources are added only with the person's say-so, then screened, catalogued and cited.** Never save part of the chat, or anything else you'd bring in, as a source without asking first. Screen every source before using it, wherever it came from, and raise anything sensitive with the person. Process `sources/inbox/` when it isn't empty, cite passages from the model's `ITEMS` (or, in a discovery sandbox, from its records), and run `node lib/sandkit/tools/sources.mjs check .` after. See `lib/sandkit/practices/sources.md`.
- **Serving:** features that read or write the sandbox's files need `node lib/sandkit/tools/serve.mjs .` (then open the address it prints). Everything else works by double-clicking.
- **Declare everything, then start.** Page scripts declare their state and functions first, and start the sandbox in one marked section at the end.
- **Pointing is free.** Name what a part stands for with `data-ref`, and the highlighting script in every page lights it everywhere it appears, pins included. Name several things with `data-points-at`. Don't write highlight wiring unless `lib/sandkit/practices/highlighting.md` says you need it.
- **Codes for what people discuss.** Rules, entities, claims and sources get stable codes (see `lib/sandkit/practices/identifiers.md`), issued in the model and cited everywhere.
- **Reveal, don't merely display.** Show why things happen, not only that they did.
- **Keep it small and clear.** This is a sandbox, not production software.
- **Test as little as possible, for as long as possible.** Add model tests (plain assertions, no library) only once the model has grown enough to need them; see the guide, step 4. No automated tests of the interface unless the person asks; check it by hand only when really needed, and never assume what tools are available.

## Updating Sandkit

Follow "Updating Sandkit in a sandbox" in `lib/sandkit/practices/building-a-sandbox.md`. In short: note the versions in `lib/sandkit/SOURCE.md`, re-copy the files from a newer Sandkit, and apply any **Breaking** changelog entries since those versions. If Node is available, Sandkit's `node tools/setup.mjs <this-folder>` does the copying and lists the changes; `node tools/setup.mjs <this-folder> sb-name` adds a component, with `--page <page>.html` for a page other than `index.html`.
