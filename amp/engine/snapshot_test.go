package engine_test

import (
	"bytes"
	"errors"
	"fmt"
	"slices"
	"strings"
	"testing"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

func TestASnapshotRebuildsTheSameDeclarations(t *testing.T) {
	original := engine.New()
	for _, name := range []engine.Name{"c", "a", "t"} {
		mustValue(original.DeclarePopulation(name, 8))
	}
	mustValue(original.DeclareCommunity("letters", []engine.Name{"t", "c"}))

	var saved bytes.Buffer
	if err := original.WriteSnapshot(&saved); err != nil {
		t.Fatal(err)
	}
	opened, err := engine.ReadSnapshot(&saved)
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
	original.SetRefractoryPeriod(true)
	mustValue(original.DeclarePopulation("wide", 100))
	mustValue(original.DeclarePopulation("c", 8))

	var saved bytes.Buffer
	if err := original.WriteSnapshot(&saved); err != nil {
		t.Fatal(err)
	}
	opened, err := engine.ReadSnapshot(&saved)
	if err != nil {
		t.Fatal(err)
	}
	mustValue(opened.Invoke([][]engine.Name{{"c"}}))

	if inspection, _ := opened.Inspect("c"); len(inspection.Refractory) != 8 {
		t.Errorf("c: %d refractory, want 8", len(inspection.Refractory))
	}
	if inspection, _ := opened.Inspect("wide"); len(inspection.Active)+len(inspection.Refractory) != 0 {
		t.Errorf("wide should be untouched, got %+v", inspection)
	}
}

func TestAFileFromAnotherFormatIsRefused(t *testing.T) {
	_, err := engine.ReadSnapshot(strings.NewReader(`{"version": 2, "populations": [], "communities": []}`))

	if !errors.As(err, new(engine.SnapshotVersionError)) {
		t.Fatalf("want VersionError, got %v", err)
	}
}

func TestAFileWithUnknownFieldsIsRefused(t *testing.T) {
	_, err := engine.ReadSnapshot(strings.NewReader(`{"version": 1, "populations": [], "communities": [], "weights": []}`))

	if err == nil {
		t.Fatal("want a refusal for the unknown field")
	}
}

func TestAFileIsCheckedByTheEngineRules(t *testing.T) {
	_, err := engine.ReadSnapshot(strings.NewReader(`{"version": 1, "populations": [{"name": "c", "size": 8}, {"name": "c", "size": 4}], "communities": []}`))

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

func mustValue[T any](value T, err error) T {
	if err != nil {
		panic(err)
	}
	return value
}

func TestAnOpenedMemoryCarriesOnCountingMoments(t *testing.T) {
	original := engine.New()
	mustValue(original.DeclarePopulation("c", 8))
	mustValue(original.Invoke([][]engine.Name{{"c"}, {"c"}, {"c"}}))

	var saved bytes.Buffer
	if err := original.WriteSnapshot(&saved); err != nil {
		t.Fatal(err)
	}
	opened, err := engine.ReadSnapshot(&saved)
	if err != nil {
		t.Fatal(err)
	}
	invocation := mustValue(opened.Invoke([][]engine.Name{{"c"}}))

	if got := invocation.Moments[0].Number; got != 4 {
		t.Errorf("first moment after opening is %d, want 4", got)
	}
}

func TestAFileFromBeforeTheClockStartsAtTheFirstMoment(t *testing.T) {
	opened, err := engine.ReadSnapshot(strings.NewReader(`{"version": 1, "populations": [], "communities": []}`))
	if err != nil {
		t.Fatal(err)
	}

	if opened.Moment() != 0 {
		t.Errorf("moment %d, want 0", opened.Moment())
	}
}

func TestANegativeMomentIsRefused(t *testing.T) {
	_, err := engine.ReadSnapshot(strings.NewReader(`{"version": 1, "moment": -1, "populations": [], "communities": []}`))

	if err == nil {
		t.Fatal("want a refusal for a moment before the first")
	}
}

func TestASnapshotCannotGiveAnAssemblyAMemberThatDoesNotExist(t *testing.T) {
	_, err := engine.ReadSnapshot(strings.NewReader(`{"version": 1,
		"populations": [{"name": "c", "size": 2}, {"name": "a", "size": 2}], "communities": [],
		"assemblies": [{"id": 1, "name": "ca", "shape": "state",
			"members": [{"population": "c", "member": 3}, {"population": "a", "member": 1}]}]}`))

	if err == nil || !strings.Contains(err.Error(), "no member 3") {
		t.Fatalf("want a refusal for c{3}, got %v", err)
	}
}

func TestASnapshotKeepsAssembliesInOrder(t *testing.T) {
	_, err := engine.ReadSnapshot(strings.NewReader(`{"version": 1,
		"populations": [{"name": "c", "size": 2}, {"name": "a", "size": 2}], "communities": [],
		"assemblies": [{"id": 2, "name": "ca", "shape": "state",
			"members": [{"population": "c", "member": 1}, {"population": "a", "member": 1}]}]}`))

	if err == nil {
		t.Fatal("want a refusal for #2 where #1 should be")
	}
}

func TestASnapshotKeepsEachRepeatsOwnMember(t *testing.T) {
	original := engine.New()
	mustValue(original.DeclarePopulations([]engine.Name{"b", "o", "k"}, 8))
	mustValue(original.DeclareAssemblies("book", []engine.Outline{{Shape: engine.TransitionShape, Populations: []engine.Name{"b", "o", "o", "k"}}}))

	var saved bytes.Buffer
	if err := original.WriteSnapshot(&saved); err != nil {
		t.Fatal(err)
	}
	opened := mustValue(engine.ReadSnapshot(&saved))

	var numbers []int
	for _, member := range mustValue(opened.Assemblies("book"))[0].Members() {
		numbers = append(numbers, member.Number())
	}
	if want := []int{1, 1, 2, 1}; !slices.Equal(numbers, want) {
		t.Errorf("book's members are numbered %v, want %v", numbers, want)
	}
}

func TestASnapshotCannotGiveAnAssemblyTheSameMemberTwice(t *testing.T) {
	_, err := engine.ReadSnapshot(strings.NewReader(`{"version": 1,
		"populations": [{"name": "o", "size": 2}], "communities": [],
		"assemblies": [{"id": 1, "name": "oo", "shape": "transition",
			"members": [{"population": "o", "member": 1}, {"population": "o", "member": 1}]}]}`))

	if err == nil || !strings.Contains(err.Error(), "o{1} twice") {
		t.Fatalf("want a refusal for o{1} twice, got %v", err)
	}
}

func TestASnapshotKeepsTheRefractorySetting(t *testing.T) {
	for _, on := range []bool{true, false} {
		original := engine.New()
		original.SetRefractoryPeriod(on)

		var saved bytes.Buffer
		if err := original.WriteSnapshot(&saved); err != nil {
			t.Fatal(err)
		}

		if opened := mustValue(engine.ReadSnapshot(&saved)); opened.HasRefractoryPeriod() != on {
			t.Errorf("saved with the refractory period %v, opened with it %v", on, opened.HasRefractoryPeriod())
		}
	}
}
