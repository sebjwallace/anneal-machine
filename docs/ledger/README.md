# Ledger

The story of how the system came to be, alongside the [contracts](../contracts/README.md). The contracts describe the
system; the ledger shows the forces that shaped it: problems and solutions, questions and answers, ideas and how they
came out, and what each did to the contracts. Any system built to the contracts carries this lineage with it.

It is also an index: it points **back** to the experiments (by their codes) and **forward** to the contract clauses
(by theirs), so everything is traceable both ways.

- **[ledger.md](ledger.md)** is the readable ledger, with both indexes, the open entries, and the clauses nothing has
  touched yet. It is built, never edited by hand.
- **[records.js](records.js)** holds the entries. Add or supersede entries there, then run `node docs/ledger/build.js`.
  The build checks that every clause code exists in the contracts and every experiment code has a folder.

## The shape of an entry
Each entry is an arc: it **opens** with a gap, names the **experiments** that worked on it and what was **given by
hand**, **closes** with a resolution (or stays open: an open entry is the project's heat), records any **lessons**, and
says what it did to the **contract** (created, confirmed, changed, challenged, or shaped: it fed a clause before the
clause existed), with a one-sentence **lesson**.

## The kinds (Sandkit's, plus two of ours)
| | Code | Kind | In an entry |
|---|---|---|---|
| Opens | PRB | Problem | something wrong now |
| | QST | Question | something unknown |
| | HYP | Hypothesis | an idea put up to be tested |
| | INC | Incident | something that went wrong once (also recorded as a lesson) |
| | THY | **Theory** *(ours)* | a bigger idea several hypotheses sit under; usually stays open |
| | PRO | **Promotion** *(ours)* | something moving from sketch to branch to core, with the evidence that earned it |
| Work | C-code | Experiment | the folder name in `experiments/sketches/` |
| Closes | SOL | Solution | what answered a problem |
| | OUT | Outcome | how a hypothesis or experiment came out: worked, partly, failed, not borne out |
| | CLM | Claim | what we now hold to be true (how a question is answered) |
| Lessons | DEC | Decision | a choice where the evidence didn't settle it (a declared choice) |
| | PAT | Pattern | a way that works |
| | APT | Anti-pattern | a way that looks right but goes wrong |
| | TRD | Trade-off | what one thing costs in another |

## Experiment codes
Every experiment is coded by its folder in `experiments/sketches/` (C01 to C61). C57 and C58 ran on the branch, so their
folders point into `C56-integrated/`. C33 has two folders (scale, scenes). There is no C13. Findings for C02-C35 are in
`experiments/findings/`; from C36 they sit in each folder.
