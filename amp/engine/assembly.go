package engine

import "slices"

// AssemblyID is an assembly's number, #1 onwards, in the order assemblies formed.
type AssemblyID int

// Shape is what an assembly's bonds make of it. It is the shape of the bonds, not a label.
type Shape int

const (
	// StateShape: cyclic, its members pointing at each other. Any part brings back the rest.
	StateShape Shape = iota + 1
	// TransitionShape: a chain, its bonds pointing forwards. It carries activity on to what comes next.
	TransitionShape
)

func (s Shape) String() string {
	switch s {
	case StateShape:
		return "state"
	case TransitionShape:
		return "transition"
	}
	return "unknown shape"
}

// Member is one member of a population, numbered within it from 1: c{3}.
type Member struct {
	population Population
	number     int
}

func (m Member) Population() Population { return m.population }
func (m Member) Number() int            { return m.number }

// index is the member's place in the engine's numbering across every population.
func (m Member) index() int { return m.population.first + m.number - 1 }

// Assembly is a unit the engine treats as one thing. A state's members are a set, kept in the order written; a
// transition's members are its steps, in order. Assemblies never change once formed.
type Assembly struct {
	id      AssemblyID
	name    Name
	shape   Shape
	members []Member
}

func (a Assembly) ID() AssemblyID      { return a.id }
func (a Assembly) Name() Name          { return a.name }
func (a Assembly) Shape() Shape        { return a.shape }
func (a Assembly) Members() []Member   { return slices.Clone(a.members) }
func (a Assembly) Populations() []Name { return populationsOf(a.members) }

// Outline is an assembly written at the population level, before the engine has chosen its members: what the world
// says, since members are the engine's own business.
type Outline struct {
	Shape       Shape
	Populations []Name
}

// DeclareAssemblies forms an assembly for each outline and gives them all the name. A population that appears more
// than once in an outline gives a new member for each time it appears (the owner's choice for repeats). Outlines
// declared together share members by order of appearance: the second "a" in each outline is the same member. It is
// refused, and nothing forms, if the name is taken or any outline breaks a rule.
func (m *Memory) DeclareAssemblies(name Name, outlines []Outline) ([]Assembly, error) {
	if err := m.refuseRedeclaration(name); err != nil {
		return nil, err
	}
	if len(outlines) == 0 {
		return nil, NothingToAssembleError{Name: name}
	}
	var together []Population // each population once, in the order first written
	needed := map[Name]int{}  // how many members of each population the line needs: the most times it appears in one outline
	for _, outline := range outlines {
		populations, err := m.outlinePopulations(outline)
		if err != nil {
			return nil, err
		}
		times := map[Name]int{}
		for _, p := range populations {
			if times[p.name] == 0 && needed[p.name] == 0 {
				together = append(together, p)
			}
			times[p.name]++
			needed[p.name] = max(needed[p.name], times[p.name])
		}
	}
	chosen := m.chooseMembers(together, needed)
	assemblies := make([]Assembly, 0, len(outlines))
	for _, outline := range outlines {
		members := make([]Member, len(outline.Populations))
		times := map[Name]int{}
		for i, population := range outline.Populations {
			members[i] = chosen[population][times[population]]
			times[population]++
		}
		assemblies = append(assemblies, m.form(name, outline.Shape, members))
	}
	return assemblies, nil
}

// AllAssemblies lists every assembly, in the order formed.
func (m *Memory) AllAssemblies() []Assembly { return slices.Clone(m.assemblies) }

// CountAssemblies is how many assemblies the memory holds.
func (m *Memory) CountAssemblies() int { return len(m.assemblies) }

// Assemblies are the assemblies the name was given to, in the order formed.
func (m *Memory) Assemblies(name Name) ([]Assembly, error) {
	ids, ok := m.named[name]
	if !ok {
		if kind, declared := m.KindOf(name); declared {
			return nil, NotAnAssemblyError{Name: name, Is: kind}
		}
		return nil, UndeclaredError{Name: name}
	}
	assemblies := make([]Assembly, len(ids))
	for i, id := range ids {
		assemblies[i] = m.assemblies[id-1]
	}
	return assemblies, nil
}

// outlinePopulations checks an outline against the rules for its shape and looks up its populations.
func (m *Memory) outlinePopulations(outline Outline) ([]Population, error) {
	if len(outline.Populations) < 2 {
		return nil, TooSmallError{Shape: outline.Shape}
	}
	populations := make([]Population, len(outline.Populations))
	times := map[Name]int{}
	for i, name := range outline.Populations {
		population, err := m.population(name)
		if err != nil {
			return nil, err
		}
		if times[name]++; times[name] > population.size {
			return nil, TooFewToRepeatError{Population: name, Size: population.size, Times: times[name]}
		}
		populations[i] = population
	}
	return populations, nil
}

// chooseMembers gives each population as many of its next members as needed. A population hands out its members in
// order from the first, individuals first; once every member has been used it goes round again from the first (the
// owner's rule, kept simple on purpose).
func (m *Memory) chooseMembers(populations []Population, needed map[Name]int) map[Name][]Member {
	chosen := make(map[Name][]Member, len(populations))
	for _, p := range populations {
		for range needed[p.name] {
			next := m.next[p.name]
			chosen[p.name] = append(chosen[p.name], Member{population: p, number: next + 1})
			m.next[p.name] = (next + 1) % p.size
		}
	}
	return chosen
}

// form adds an assembly that has already passed every check.
func (m *Memory) form(name Name, shape Shape, members []Member) Assembly {
	assembly := Assembly{id: AssemblyID(len(m.assemblies) + 1), name: name, shape: shape, members: members}
	m.assemblies = append(m.assemblies, assembly)
	if name != "" {
		m.named[name] = append(m.named[name], assembly.id)
	}
	for _, member := range members {
		m.assembled.add(member.index())
	}
	return assembly
}

func populationsOf(members []Member) []Name {
	names := make([]Name, len(members))
	for i, member := range members {
		names[i] = member.population.name
	}
	return names
}
