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

	invocation, err := memory.Invoke([][]engine.Name{{"across", "wide"}})
	if err != nil {
		t.Fatal(err)
	}

	active := map[engine.Name]int{}
	for _, activation := range invocation.Moments[0].Active {
		active[activation.Member.Population().Name()]++
	}
	want := map[engine.Name]int{"across": 8, "wide": 130}
	for _, name := range []engine.Name{"before", "across", "wide", "after"} {
		if active[name] != want[name] {
			t.Errorf("%s: %d active, want %d", name, active[name], want[name])
		}
	}
}

func TestAMemberActiveOneMomentIsRefractoryTheNext(t *testing.T) {
	memory := engine.New()
	mustDeclarePopulation(t, memory, "c", 8)
	mustDeclarePopulation(t, memory, "a", 8)

	invocation, err := memory.Invoke([][]engine.Name{{"c"}, {"a"}})
	if err != nil {
		t.Fatal(err)
	}

	second := invocation.Moments[1]
	if len(second.Refractory) != 8 || second.Refractory[0].Population().Name() != "c" {
		t.Errorf("moment 2 should have all of c refractory, got %v", second.Refractory)
	}
	if len(second.Unexplained) != 1 || second.Unexplained[0].Name() != "a" {
		t.Errorf("moment 2 should leave only a unexplained, got %v", second.Unexplained)
	}
}

func TestInvokeEndsBeforeAQuietMoment(t *testing.T) {
	memory := engine.New()
	mustDeclarePopulation(t, memory, "c", 8)

	invocation, err := memory.Invoke([][]engine.Name{{"c"}})
	if err != nil {
		t.Fatal(err)
	}

	if len(invocation.Moments) != 2 || invocation.RepeatsEvery != 0 {
		t.Fatalf("want c active, then c refractory, then stop; got %d moments, repeating every %d",
			len(invocation.Moments), invocation.RepeatsEvery)
	}
	if inspection, _ := memory.Inspect("c"); len(inspection.Active) != 0 || len(inspection.Refractory) != 8 {
		t.Errorf("c should end refractory, got %+v", inspection)
	}
}
