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

// Outline is an assembly as written, before the engine has chosen its members: what the world says, since members are
// the engine's own business. Each name is a population, or an assembly to compose (a part).
//
// Only, where given for a name, takes just that assembly's members for those populations: decomposition, written
// cat{c, a}. Only[i] belongs to Names[i]; nil (or a missing entry) means the name as a whole.
type Outline struct {
	Shape Shape
	Names []Name
	Only  [][]Name
}

// only is the populations Names[i] is restricted to, or nil for the whole name.
func (o Outline) only(i int) []Name {
	if i < len(o.Only) {
		return o.Only[i]
	}
	return nil
}

// element is one name of an outline, looked up: a population; a part, which is an assembly being composed; or some
// of an assembly's members, taken exactly (decomposition).
type element struct {
	population Population // set for a population
	part       []Member   // set for a part: the members of the assemblies with that name, each once, in order
	exact      []Member   // set for decomposition: those members of an assembly, in its order
}

// DeclareAssemblies forms assemblies from the outlines and gives them all the name.
//
// A population gives a member of its own: a new one each time it appears in an outline (the owner's choice for
// repeats), and outlines declared together share members by order of appearance, so the second "a" in each is the
// same member.
//
// A part, an assembly named inside the outline, is composition: the new assembly uses the part's own members, so it
// connects to the part through them (members are pivot points). A state binds a sample of each part: the fewest of
// its members that still complete it, more than half, taken in order (as C76 found, the smallest binding that
// completes is the best). A chain joins a part by its first member coming in and its last going out, so the -> dog
// bonds the last member of "the" to the first of "dog".
//
// It is refused, and nothing forms, if the name is taken or any outline breaks a rule.
func (m *Memory) DeclareAssemblies(name Name, outlines []Outline) ([]Assembly, error) {
	if err := m.refuseRedeclaration(name); err != nil {
		return nil, err
	}
	if len(outlines) == 0 {
		return nil, NothingToAssembleError{Name: name}
	}
	elements := make([][]element, len(outlines))
	var together []Population // each population once, in the order first written
	needed := map[Name]int{}  // how many members of each population the line needs: the most times it appears in one outline
	for i, outline := range outlines {
		written, err := m.outlineElements(outline)
		if err != nil {
			return nil, err
		}
		elements[i] = written
		times := map[Name]int{}
		for _, e := range written {
			if e.part != nil || e.exact != nil {
				continue
			}
			p := e.population
			if times[p.name] == 0 && needed[p.name] == 0 {
				together = append(together, p)
			}
			times[p.name]++
			needed[p.name] = max(needed[p.name], times[p.name])
		}
	}
	chosen := m.chooseMembers(together, needed)
	var assemblies []Assembly
	for i, outline := range outlines {
		times := map[Name]int{}
		memberOf := func(p Population) Member {
			member := chosen[p.name][times[p.name]]
			times[p.name]++
			return member
		}
		switch outline.Shape {
		case StateShape:
			assemblies = append(assemblies, m.form(name, StateShape, stateMembers(elements[i], memberOf)))
		case TransitionShape:
			for _, chain := range chainMembers(elements[i], memberOf) {
				assemblies = append(assemblies, m.form(name, TransitionShape, chain))
			}
		}
	}
	return assemblies, nil
}

// stateMembers lists a state's members: each population's member, a sample of each part, and the exact members
// decomposed from a whole, each member once.
func stateMembers(elements []element, memberOf func(Population) Member) []Member {
	var members []Member
	for _, e := range elements {
		var taken []Member
		switch {
		case e.exact != nil:
			taken = e.exact
		case e.part != nil:
			taken = sample(e.part)
		default:
			taken = []Member{memberOf(e.population)}
		}
		for _, member := range taken {
			if !slices.Contains(members, member) {
				members = append(members, member)
			}
		}
	}
	return members
}

// sample is the fewest of a part's members that still complete it: more than half, the first ones in order.
func sample(part []Member) []Member { return part[:len(part)/2+1] }

// chainMembers lists the chains a transition forms. Populations follow one another in one chain. A part breaks it: the
// chain so far ends at the part's first member, and a new one starts from its last, since the part's own structure
// carries what lies between.
func chainMembers(elements []element, memberOf func(Population) Member) [][]Member {
	var chains [][]Member
	var chain []Member
	finish := func() {
		if len(chain) >= 2 {
			chains = append(chains, chain)
		}
		chain = nil
	}
	for _, e := range elements {
		if e.exact != nil {
			chain = append(chain, e.exact...)
			continue
		}
		if e.part == nil {
			chain = append(chain, memberOf(e.population))
			continue
		}
		chain = append(chain, e.part[0])
		finish()
		chain = []Member{e.part[len(e.part)-1]}
	}
	finish()
	return chains
}

// AssemblyByID finds an assembly by its number, #1 onwards.
func (m *Memory) AssemblyByID(id AssemblyID) (Assembly, error) {
	if id < 1 || int(id) > len(m.assemblies) {
		return Assembly{}, NoSuchAssemblyError{ID: id}
	}
	return m.assemblies[id-1], nil
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

// outlineElements checks an outline against the rules for its shape and looks up each name: a population, or an
// assembly to compose as a part.
func (m *Memory) outlineElements(outline Outline) ([]element, error) {
	elements := make([]element, len(outline.Names))
	times := map[Name]int{}
	parts := map[Name]bool{}
	size := 0 // what the outline gives, to check against the shape's smallest: a member, or a part, counts one
	for i, name := range outline.Names {
		kind, declared := m.KindOf(name)
		only := outline.only(i)
		switch {
		case !declared:
			return nil, UndeclaredError{Name: name}
		case only != nil && kind != AssemblyKind:
			return nil, NotDecomposableError{Name: name, Is: kind}
		case only != nil:
			exact, err := m.decompose(name, only)
			if err != nil {
				return nil, err
			}
			elements[i] = element{exact: exact}
			size += len(exact)
			continue
		case kind == AssemblyKind:
			if parts[name] {
				return nil, RepeatedPartError{Part: name}
			}
			parts[name] = true
			elements[i] = element{part: m.partMembers(name)}
			size++
		case kind == PopulationKind:
			population := m.populations[name]
			if times[name]++; times[name] > population.size {
				return nil, TooFewToRepeatError{Population: name, Size: population.size, Times: times[name]}
			}
			elements[i] = element{population: population}
			size++
		default:
			return nil, NotAPopulationOrAssemblyError{Name: name, Is: kind}
		}
	}
	if size < 2 {
		return nil, TooSmallError{Shape: outline.Shape}
	}
	return elements, nil
}

// decompose takes members of an assembly by matching the populations in order: each takes the next member of that
// population after the one before, so thecat{c, a, t} is its last three letters and thecat{t, h, e} its first three,
// and a repeat is written twice (abab{a, a}). The part forms beside the whole, with nothing cut out of it.
func (m *Memory) decompose(name Name, populations []Name) ([]Member, error) {
	whole := m.partMembers(name)
	taken := make([]Member, 0, len(populations))
	from := 0
	for i, population := range populations {
		at := slices.IndexFunc(whole[from:], func(member Member) bool { return member.population.name == population })
		if at < 0 {
			if i == 0 || !slices.ContainsFunc(whole, func(member Member) bool { return member.population.name == population }) {
				return nil, NotInWholeError{Whole: name, Population: population}
			}
			return nil, NotInWholeError{Whole: name, Population: population, After: populations[i-1]}
		}
		taken = append(taken, whole[from+at])
		from += at + 1
	}
	return taken, nil
}

// partMembers lists the members of every assembly with the name, each once, in the order they first appear.
func (m *Memory) partMembers(name Name) []Member {
	var members []Member
	for _, id := range m.named[name] {
		for _, member := range m.assemblies[id-1].members {
			if !slices.Contains(members, member) {
				members = append(members, member)
			}
		}
	}
	return members
}

// outlinePopulations checks members' populations against the rules for an assembly's shape, as declaring would.
func (m *Memory) outlinePopulations(outline Outline) ([]Population, error) {
	if len(outline.Names) < 2 {
		return nil, TooSmallError{Shape: outline.Shape}
	}
	populations := make([]Population, len(outline.Names))
	times := map[Name]int{}
	for i, name := range outline.Names {
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
