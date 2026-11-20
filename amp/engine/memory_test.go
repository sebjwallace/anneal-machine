package engine_test

import (
	"errors"
	"slices"
	"testing"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

func TestRedeclaringAPopulationKeepsTheOriginal(t *testing.T) {
	memory := engine.New()
	mustDeclarePopulation(t, memory, "c", 8)

	_, err := memory.DeclarePopulation("c", 4)

	var already engine.AlreadyDeclaredError
	if !errors.As(err, &already) || already.As != engine.PopulationKind {
		t.Fatalf("want AlreadyDeclaredError as a population, got %v", err)
	}
	community, err := memory.DeclareCommunity("w", []engine.Name{"c"})
	if err != nil {
		t.Fatal(err)
	}
	if community.Size() != 8 {
		t.Errorf("c should still have 8 members, community has %d", community.Size())
	}
}

func TestARefusedCommunityIsNotDeclared(t *testing.T) {
	memory := engine.New()
	mustDeclarePopulation(t, memory, "c", 8)

	_, err := memory.DeclareCommunity("w", []engine.Name{"c", "z"})

	var undeclared engine.UndeclaredError
	if !errors.As(err, &undeclared) || undeclared.Name != "z" {
		t.Fatalf("want UndeclaredError for z, got %v", err)
	}
	if _, err := memory.DeclarePopulation("w", 2); err != nil {
		t.Errorf("w should still be free, got %v", err)
	}
}

func TestACommunityNeedsAPopulation(t *testing.T) {
	_, err := engine.New().DeclareCommunity("w", nil)

	if !errors.As(err, new(engine.EmptyCommunityError)) {
		t.Fatalf("want EmptyCommunityError, got %v", err)
	}
}

func TestACommunityHoldsPopulationsInTheOrderGiven(t *testing.T) {
	memory := engine.New()
	for _, name := range []engine.Name{"c", "a", "t"} {
		mustDeclarePopulation(t, memory, name, 8)
	}

	community, err := memory.DeclareCommunity("letters", []engine.Name{"t", "c", "a"})
	if err != nil {
		t.Fatal(err)
	}

	var order []engine.Name
	for _, p := range community.Populations() {
		order = append(order, p.Name())
	}
	if want := []engine.Name{"t", "c", "a"}; !slices.Equal(order, want) {
		t.Errorf("got %v, want %v", order, want)
	}
}

func mustDeclarePopulation(t *testing.T, memory *engine.Memory, name engine.Name, size int) {
	t.Helper()
	if _, err := memory.DeclarePopulation(name, size); err != nil {
		t.Fatal(err)
	}
}
