package snapshot_test

import (
	"bytes"
	"errors"
	"fmt"
	"strings"
	"testing"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/snapshot"
)

func TestASnapshotRebuildsTheSameDeclarations(t *testing.T) {
	original := engine.New()
	for _, name := range []engine.Name{"c", "a", "t"} {
		must(original.DeclarePopulation(name, 8))
	}
	must(original.DeclareCommunity("letters", []engine.Name{"t", "c"}))

	var saved bytes.Buffer
	if err := snapshot.Write(&saved, original); err != nil {
		t.Fatal(err)
	}
	opened, err := snapshot.Read(&saved)
	if err != nil {
		t.Fatal(err)
	}

	if got, want := describe(opened), describe(original); got != want {
		t.Errorf("opened %q, saved %q", got, want)
	}
}

// Members are numbered across populations in the order declared, so a snapshot must keep that order for invoke to
// light the same members.
func TestAnOpenedMemoryInvokesLikeTheOriginal(t *testing.T) {
	original := engine.New()
	must(original.DeclarePopulation("wide", 100))
	must(original.DeclarePopulation("c", 8))

	var saved bytes.Buffer
	if err := snapshot.Write(&saved, original); err != nil {
		t.Fatal(err)
	}
	opened, err := snapshot.Read(&saved)
	if err != nil {
		t.Fatal(err)
	}
	must(opened.Invoke([][]engine.Name{{"c"}}))

	if inspection, _ := opened.Inspect("c"); inspection.Active != 8 {
		t.Errorf("c: %d active, want 8", inspection.Active)
	}
	if inspection, _ := opened.Inspect("wide"); inspection.Active != 0 {
		t.Errorf("wide: %d active, want 0", inspection.Active)
	}
}

func TestAFileFromAnotherFormatIsRefused(t *testing.T) {
	_, err := snapshot.Read(strings.NewReader(`{"version": 2, "populations": [], "communities": []}`))

	if !errors.As(err, new(snapshot.VersionError)) {
		t.Fatalf("want VersionError, got %v", err)
	}
}

func TestAFileWithUnknownFieldsIsRefused(t *testing.T) {
	_, err := snapshot.Read(strings.NewReader(`{"version": 1, "populations": [], "communities": [], "weights": []}`))

	if err == nil {
		t.Fatal("want a refusal for the unknown field")
	}
}

func TestAFileIsCheckedByTheEngineRules(t *testing.T) {
	_, err := snapshot.Read(strings.NewReader(`{"version": 1, "populations": [{"name": "c", "size": 8}, {"name": "c", "size": 4}], "communities": []}`))

	if !errors.As(err, new(engine.AlreadyDeclaredError)) {
		t.Fatalf("want AlreadyDeclaredError, got %v", err)
	}
}

// describe writes the memory's declarations in order, for comparing two memories.
func describe(memory *engine.Memory) string {
	var parts []string
	for _, p := range memory.Populations() {
		parts = append(parts, fmt.Sprintf("%s=%d", p.Name(), p.Size()))
	}
	for _, c := range memory.Communities() {
		var names []string
		for _, p := range c.Populations() {
			names = append(names, string(p.Name()))
		}
		parts = append(parts, string(c.Name())+"=("+strings.Join(names, ",")+")")
	}
	return strings.Join(parts, " ")
}

func must[T any](value T, err error) T {
	if err != nil {
		panic(err)
	}
	return value
}

func TestAnOpenedMemoryCarriesOnCountingMoments(t *testing.T) {
	original := engine.New()
	must(original.DeclarePopulation("c", 8))
	must(original.Invoke([][]engine.Name{{"c"}, {"c"}, {"c"}}))

	var saved bytes.Buffer
	if err := snapshot.Write(&saved, original); err != nil {
		t.Fatal(err)
	}
	opened, err := snapshot.Read(&saved)
	if err != nil {
		t.Fatal(err)
	}
	invocation := must(opened.Invoke([][]engine.Name{{"c"}}))

	if got := invocation.Moments[0].Number; got != 4 {
		t.Errorf("first moment after opening is %d, want 4", got)
	}
}

func TestAFileFromBeforeTheClockStartsAtTheFirstMoment(t *testing.T) {
	opened, err := snapshot.Read(strings.NewReader(`{"version": 1, "populations": [], "communities": []}`))
	if err != nil {
		t.Fatal(err)
	}

	if opened.Moment() != 0 {
		t.Errorf("moment %d, want 0", opened.Moment())
	}
}

func TestANegativeMomentIsRefused(t *testing.T) {
	_, err := snapshot.Read(strings.NewReader(`{"version": 1, "moment": -1, "populations": [], "communities": []}`))

	if err == nil {
		t.Fatal("want a refusal for a moment before the first")
	}
}
