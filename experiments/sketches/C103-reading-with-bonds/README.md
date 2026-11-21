# C103 · Reading with bonds only

While reading, form only bonds, letter to letter, and no assemblies (the owner's idea). A pattern shows itself as
prediction: input seen before arrives expected instead of bursting. Read three times, "the cat the dog the bird the
mouse" settles at 5 bursts of 34 and no new bonds; what still bursts is real surprise (which animal follows "the ").
It needs predictions to count only from the letter just before, and a change to the rivalry rule. Forming an
assembly over each run of predicted letters fails: the assemblies complete and hold, and drown the input.

- [hypothesis.md](hypothesis.md) · [findings.md](findings.md) · [out.txt](out.txt)
- Branch `experiment/reading-bonds`. Run (from `amp/`): `go run ./cmd/c103`; traces: `go run ./cmd/c103/debug`, `go run ./cmd/c103/debug2`
