// Package engine holds the memory and performs the operations on it.
//
// The memory is everything the engine holds: populations, communities and, later, assemblies. The engine knows
// nothing about text; the interpreter reads AMP and calls it.
package engine

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

// Memory is everything the engine holds. Declarations are only ever added: nothing declared is replaced or removed.
type Memory struct {
	populations map[Name]Population
	communities map[Name]Community
}

func New() *Memory {
	return &Memory{
		populations: map[Name]Population{},
		communities: map[Name]Community{},
	}
}

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
