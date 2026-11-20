// Package engine holds the memory and performs the operations on it.
//
// The memory is everything the engine holds: populations, communities and, later, assemblies. The engine knows
// nothing about text; the interpreter reads AMP and calls it.
package engine

import "slices"

// Name is what a declared thing is called. Populations and communities share one set of names.
type Name string

// Kind says what a name was declared as.
type Kind int

const (
	PopulationKind Kind = iota + 1
	CommunityKind
)

func (k Kind) String() string {
	switch k {
	case PopulationKind:
		return "population"
	case CommunityKind:
		return "community"
	}
	return "unknown kind"
}

// Memory is everything the engine holds: what it knows, and what is active now. Declarations are only ever added:
// nothing declared is replaced or removed.
type Memory struct {
	populations map[Name]Population
	communities map[Name]Community
	// Both in the order declared. Populations' members are numbered across all of them in this order.
	populationOrder []Population
	communityOrder  []Community
	members         int // members across every population

	active memberSet      // the members active this moment
	causes map[Name]Cause // why each active population's members are active
}

func New() *Memory {
	return &Memory{
		populations: map[Name]Population{},
		communities: map[Name]Community{},
		causes:      map[Name]Cause{},
	}
}

// Populations lists every population, in the order declared.
func (m *Memory) Populations() []Population { return slices.Clone(m.populationOrder) }

// Communities lists every community, in the order declared.
func (m *Memory) Communities() []Community { return slices.Clone(m.communityOrder) }

// kindOf reports what name was declared as, if it was declared at all.
func (m *Memory) kindOf(name Name) (Kind, bool) {
	if _, ok := m.populations[name]; ok {
		return PopulationKind, true
	}
	if _, ok := m.communities[name]; ok {
		return CommunityKind, true
	}
	return 0, false
}

func (m *Memory) refuseRedeclaration(name Name) error {
	if kind, declared := m.kindOf(name); declared {
		return AlreadyDeclaredError{Name: name, As: kind}
	}
	return nil
}
