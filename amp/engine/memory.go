// Package engine holds the memory and performs the operations on it.
//
// This is the fresh start (branch l1a-reading): populations, and reading into them, which forms bonds. Sequence
// memory only, one community's worth; no assemblies yet.
package engine

import (
	"fmt"
	"maps"
	"slices"
)

// Name is what a declared thing is called.
type Name string

// ReadingSize is how many members reading gives a population it declares (a letter not seen before).
const ReadingSize = 9

// Population is a fixed group of members, declared once. Its members are numbered within it, from 1.
type Population struct {
	name Name
	size int
}

func (p Population) Name() Name { return p.name }

// Size is the number of members.
func (p Population) Size() int { return p.size }

// Member is one member of a population, numbered from 1.
type Member struct {
	Population Name
	Number     int
}

func (m Member) String() string { return fmt.Sprintf("%s{%d}", m.Population, m.Number) }

// Bond goes from one member to another, in one direction: when From is active, To is primed the moment after.
type Bond struct {
	From, To Member
}

func (b Bond) String() string { return fmt.Sprintf("%s -> %s", b.From, b.To) }

// Memory is everything the engine holds.
type Memory struct {
	populations     map[Name]Population
	populationOrder []Population
	// used is, for each population, its members that have been selected at least once. A member not in it is still
	// an individual.
	used  map[Name]map[int]bool
	bonds []Bond              // every bond, in the order formed
	out   map[Member][]Member // the members each member bonds to, in the order formed

	moment int    // the last moment that passed: one clock for the memory's whole life, 0 before any
	seed   uint64 // with the moment, decides each random pick, so the same reads give the same memory
}

func New() *Memory {
	return &Memory{populations: map[Name]Population{}, used: map[Name]map[int]bool{}, out: map[Member][]Member{}, seed: 1}
}

// Moment is the last moment that passed, 0 before any.
func (m *Memory) Moment() int { return m.moment }

// Seed decides the random picks (with the moment).
func (m *Memory) Seed() uint64 { return m.seed }

// SetSeed changes what decides the random picks from now on.
func (m *Memory) SetSeed(seed uint64) { m.seed = seed }

// Populations lists every population, in the order declared.
func (m *Memory) Populations() []Population { return slices.Clone(m.populationOrder) }

// Population looks up a population by name.
func (m *Memory) Population(name Name) (Population, bool) {
	p, ok := m.populations[name]
	return p, ok
}

// DeclarePopulation adds a population of size members. It is refused if the name is taken or size is below 1.
func (m *Memory) DeclarePopulation(name Name, size int) (Population, error) {
	if _, taken := m.populations[name]; taken {
		return Population{}, fmt.Errorf("%s is already declared", name)
	}
	if size < 1 {
		return Population{}, fmt.Errorf("a population needs at least 1 member, not %d", size)
	}
	p := Population{name: name, size: size}
	m.populations[name] = p
	m.populationOrder = append(m.populationOrder, p)
	m.used[name] = map[int]bool{}
	return p, nil
}

// DeclarePopulations adds several populations of the same size. All or nothing.
func (m *Memory) DeclarePopulations(names []Name, size int) ([]Population, error) {
	for i, name := range names {
		if slices.Contains(names[:i], name) {
			return nil, fmt.Errorf("%s is given twice", name)
		}
		if _, taken := m.populations[name]; taken {
			return nil, fmt.Errorf("%s is already declared", name)
		}
	}
	if size < 1 {
		return nil, fmt.Errorf("a population needs at least 1 member, not %d", size)
	}
	declared := make([]Population, 0, len(names))
	for _, name := range names {
		p, _ := m.DeclarePopulation(name, size)
		declared = append(declared, p)
	}
	return declared, nil
}

// Bonds lists every bond, in the order formed.
func (m *Memory) Bonds() []Bond { return slices.Clone(m.bonds) }

// BondsFrom lists the members a member bonds to, in the order formed.
func (m *Memory) BondsFrom(member Member) []Member { return slices.Clone(m.out[member]) }

// IsIndividual reports whether a member has never been selected.
func (m *Memory) IsIndividual(member Member) bool { return !m.used[member.Population][member.Number] }

// Selected lists the members of p that have been selected at least once (no longer individuals), in number order.
func (m *Memory) Selected(p Name) []Member {
	numbers := slices.Sorted(maps.Keys(m.used[p]))
	members := make([]Member, len(numbers))
	for i, n := range numbers {
		members[i] = Member{Population: p, Number: n}
	}
	return members
}

func (m *Memory) hasBond(from, to Member) bool { return slices.Contains(m.out[from], to) }

func (m *Memory) addBond(from, to Member) Bond {
	b := Bond{From: from, To: to}
	m.bonds = append(m.bonds, b)
	m.out[from] = append(m.out[from], to)
	return b
}

// clone copies the memory, so a read can be tried and thrown away if it fails part way.
func (m *Memory) clone() *Memory {
	c := &Memory{
		populations:     maps.Clone(m.populations),
		populationOrder: slices.Clone(m.populationOrder),
		used:            map[Name]map[int]bool{},
		bonds:           slices.Clone(m.bonds),
		out:             map[Member][]Member{},
		moment:          m.moment,
		seed:            m.seed,
	}
	for name, used := range m.used {
		c.used[name] = maps.Clone(used)
	}
	for from, to := range m.out {
		c.out[from] = slices.Clone(to)
	}
	return c
}
