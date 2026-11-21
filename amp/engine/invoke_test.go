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
	memory.SetRefractoryPeriod(true)
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
	memory.SetRefractoryPeriod(true)
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

func TestAWordWithARepeatIsNotARivalOfItself(t *testing.T) {
	memory := engine.New()
	mustValue(memory.DeclarePopulations([]engine.Name{"a", "b"}, 8))
	mustValue(memory.DeclareAssemblies("abab", []engine.Outline{
		{Shape: engine.StateShape, Populations: []engine.Name{"a", "b", "a", "b"}},
		{Shape: engine.TransitionShape, Populations: []engine.Name{"a", "b", "a", "b"}},
	}))

	invocation := mustValue(memory.Invoke([][]engine.Name{{"a", "b"}}))

	for _, moment := range invocation.Moments {
		if len(moment.Competitions) > 0 {
			t.Fatalf("moment %d: abab's state and chain competed: %+v", moment.Number, moment.Competitions)
		}
	}
	if last := invocation.Completions[0]; last.Last != 4 || invocation.RepeatsEvery == 0 {
		t.Errorf("want abab complete, 4 of 4, and held; got %d of 4, repeating every %d", last.Last, invocation.RepeatsEvery)
	}
}

func TestTheRefractoryPeriodIsOffByDefault(t *testing.T) {
	memory := engine.New()
	mustDeclarePopulation(t, memory, "c", 8)

	invocation := mustValue(memory.Invoke([][]engine.Name{{"c"}, {"c"}}))

	if memory.HasRefractoryPeriod() {
		t.Fatal("the refractory period should be off by default")
	}
	if second := invocation.Moments[1]; len(second.Refractory) != 0 || len(second.Active) != 8 {
		t.Errorf("with no refractory period, c should come on again at once; got %d active, %d refractory",
			len(second.Active), len(second.Refractory))
	}
}

func TestInputIsNotLimitedByTheBudget(t *testing.T) {
	memory := engine.New()
	mustDeclarePopulation(t, memory, "c", 8)
	if err := memory.SetBudget(2); err != nil {
		t.Fatal(err)
	}

	invocation := mustValue(memory.Invoke([][]engine.Name{{"c"}}))

	if active := len(invocation.Moments[0].Active); active != 8 {
		t.Errorf("an unexpected c should turn on all 8 members whatever the budget, got %d", active)
	}
}

func TestRecallNeverTakesAPopulationPastItsBudget(t *testing.T) {
	memory := engine.New()
	mustValue(memory.DeclarePopulations([]engine.Name{"a", "b"}, 8))
	mustValue(memory.DeclareAssemblies("long", []engine.Outline{{Shape: engine.StateShape, Populations: []engine.Name{"a", "b", "a", "b", "a", "b"}}}))
	if err := memory.SetBudget(2); err != nil {
		t.Fatal(err)
	}

	invocation := mustValue(memory.Invoke([][]engine.Name{{"a", "b"}}))

	cut := false
	for _, moment := range invocation.Moments {
		cut = cut || len(moment.BudgetCuts) > 0
		recalled := map[engine.Name]int{}
		for _, activation := range moment.Active {
			if !activation.Arrived {
				recalled[activation.Member.Population().Name()]++
			}
		}
		for name, n := range recalled {
			if n > 2 {
				t.Errorf("moment %d: recall brought on %d members of %s, over the budget of 2", moment.Number, n, name)
			}
		}
	}
	if !cut {
		t.Error("the state wants three members of a and of b, so the budget should have cut recall")
	}
}

func TestABudgetBelowZeroIsRefused(t *testing.T) {
	if err := engine.New().SetBudget(-1); err == nil {
		t.Error("want a refusal for a budget of -1")
	}
}
