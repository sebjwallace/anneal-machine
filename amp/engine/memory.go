// Package engine holds the memory and performs the operations on it.
//
// The memory is everything the engine holds: populations, communities and assemblies. The engine knows nothing about
// text; the interpreter reads AMP and calls it.
package engine

import (
	"fmt"
	"slices"
)

// Name is what a declared thing is called. Populations, communities and assemblies share one set of names.
type Name string

// Kind says what a name was declared as.
type Kind int

const (
	PopulationKind Kind = iota + 1
	CommunityKind
	AssemblyKind
)

func (k Kind) String() string {
	switch k {
	case PopulationKind:
		return "population"
	case CommunityKind:
		return "community"
	case AssemblyKind:
		return "assembly"
	}
	return "unknown kind"
}

// withArticle writes the kind as it reads in a sentence: a population, an assembly.
func (k Kind) withArticle() string {
	if k == AssemblyKind {
		return "an " + k.String()
	}
	return "a " + k.String()
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

	assemblies []Assembly            // every assembly, in the order formed; #n is assemblies[n-1]
	named      map[Name][]AssemblyID // the assemblies each name was given to, in the order formed
	next       map[Name]int          // for each population, the member a new assembly gets next, counted from 0
	assembled  memberSet             // the members that belong to at least one assembly

	moment     int           // the last moment that passed: one clock for the memory's whole life, 0 before any
	active     memberSet     // the members active this moment
	refractory memberSet     // the members active the moment before, which can't come on this moment
	unexpected map[Name]bool // populations that arrived this moment with nothing expecting them
}

func New() *Memory {
	return NewAfter(0)
}

// NewAfter starts an empty memory whose clock has already reached moment, so its next moment is moment+1. It is for
// continuing a saved memory. moment must not be negative.
func NewAfter(moment int) *Memory {
	if moment < 0 {
		panic(fmt.Sprintf("engine: a memory can't start after moment %d", moment))
	}
	return &Memory{
		populations: map[Name]Population{},
		communities: map[Name]Community{},
		named:       map[Name][]AssemblyID{},
		next:        map[Name]int{},
		moment:      moment,
	}
}

// Moment is the last moment that passed, 0 before any. Moments count on across invocations, so every moment in the
// memory's life has its own number.
func (m *Memory) Moment() int { return m.moment }

// Populations lists every population, in the order declared.
func (m *Memory) Populations() []Population { return slices.Clone(m.populationOrder) }

// Communities lists every community, in the order declared.
func (m *Memory) Communities() []Community { return slices.Clone(m.communityOrder) }

// KindOf reports what name was declared as, if it was declared at all.
func (m *Memory) KindOf(name Name) (Kind, bool) {
	if _, ok := m.populations[name]; ok {
		return PopulationKind, true
	}
	if _, ok := m.communities[name]; ok {
		return CommunityKind, true
	}
	if _, ok := m.named[name]; ok {
		return AssemblyKind, true
	}
	return 0, false
}

func (m *Memory) refuseRedeclaration(name Name) error {
	if kind, declared := m.KindOf(name); declared {
		return AlreadyDeclaredError{Name: name, As: kind}
	}
	return nil
}
