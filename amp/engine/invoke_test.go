package engine_test

import (
	"testing"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// Members are held as bits in 64-bit words; populations here straddle and span word boundaries.
func TestUnexpectedInputTurnsOnExactlyItsOwnMembers(t *testing.T) {
	memory := engine.New()
	sizes := map[engine.Name]int{"before": 60, "across": 8, "wide": 130, "after": 3}
	for _, name := range []engine.Name{"before", "across", "wide", "after"} {
		mustDeclarePopulation(t, memory, name, sizes[name])
	}

	if _, err := memory.Invoke([][]engine.Name{{"across", "wide"}}); err != nil {
		t.Fatal(err)
	}

	want := map[engine.Name]int{"before": 0, "across": 8, "wide": 130, "after": 0}
	for name, active := range want {
		inspection, err := memory.Inspect(name)
		if err != nil {
			t.Fatal(err)
		}
		if inspection.Active != active {
			t.Errorf("%s: %d active, want %d", name, inspection.Active, active)
		}
	}
}

func TestNothingHoldsActivityFromTheMomentBefore(t *testing.T) {
	memory := engine.New()
	mustDeclarePopulation(t, memory, "c", 8)
	mustDeclarePopulation(t, memory, "a", 8)

	invocation, err := memory.Invoke([][]engine.Name{{"c"}, {"a"}})
	if err != nil {
		t.Fatal(err)
	}

	second := invocation.Moments[1]
	if len(second.Unexplained) != 1 || second.Unexplained[0].Name() != "a" {
		t.Errorf("moment 2 should leave only a unexplained, got %v", second.Unexplained)
	}
	if inspection, _ := memory.Inspect("c"); inspection.Active != 0 || inspection.Cause != engine.NoCause {
		t.Errorf("c should be off after moment 2, got %+v", inspection)
	}
}
