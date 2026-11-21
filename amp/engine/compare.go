package engine

import "slices"

// Comparison compares declared things by the populations they cover: an assembly by its members' populations, a
// community by its populations, a population by itself. It only reads. Every set lists populations in the order they
// first appear.
type Comparison struct {
	Of           []Name
	Intersection []Name // in every one: AND
	Union        []Name // in any: OR
	// Only when exactly two are compared.
	FirstOnly     []Name // in the first and not the second: difference
	SecondOnly    []Name // in the second and not the first
	Symmetric     []Name // in one but not both: symmetric difference, XOR
	FirstInSecond bool   // subset: everything in the first is in the second
	SecondInFirst bool
}

// Compare compares two or more declared things by the populations they cover.
func (m *Memory) Compare(names []Name) (Comparison, error) {
	if len(names) < 2 {
		return Comparison{}, TooFewToCompareError{}
	}
	sets := make([][]Name, len(names))
	for i, name := range names {
		if slices.Contains(names[:i], name) {
			return Comparison{}, GivenTwiceError{Name: name}
		}
		set, err := m.populationsCovered(name)
		if err != nil {
			return Comparison{}, err
		}
		sets[i] = set
	}
	c := Comparison{Of: slices.Clone(names)}
	for _, set := range sets {
		c.Union = appendNew(c.Union, set...)
	}
	for _, p := range sets[0] {
		if !slices.ContainsFunc(sets[1:], func(set []Name) bool { return !slices.Contains(set, p) }) {
			c.Intersection = append(c.Intersection, p)
		}
	}
	if len(sets) == 2 {
		c.FirstOnly, c.SecondOnly = difference(sets[0], sets[1]), difference(sets[1], sets[0])
		c.Symmetric = append(slices.Clone(c.FirstOnly), c.SecondOnly...)
		c.FirstInSecond, c.SecondInFirst = len(c.FirstOnly) == 0, len(c.SecondOnly) == 0
	}
	return c, nil
}

// populationsCovered lists the populations a declared name covers, each once, in order.
func (m *Memory) populationsCovered(name Name) ([]Name, error) {
	kind, declared := m.KindOf(name)
	switch {
	case !declared:
		return nil, UndeclaredError{Name: name}
	case kind == PopulationKind:
		return []Name{name}, nil
	case kind == CommunityKind:
		return populationNames(m.communities[name].populations), nil
	default:
		return appendNew(nil, populationsOf(m.partMembers(name))...), nil
	}
}

// appendNew adds the names not already in the list, keeping their order.
func appendNew(list []Name, names ...Name) []Name {
	for _, name := range names {
		if !slices.Contains(list, name) {
			list = append(list, name)
		}
	}
	return list
}

// difference lists what is in a and not in b, in a's order.
func difference(a, b []Name) []Name {
	var only []Name
	for _, name := range a {
		if !slices.Contains(b, name) {
			only = append(only, name)
		}
	}
	return only
}

// DeclareIntersection forms what several things share as a new assembly beside them: the populations all of them
// cover, taken as members of the first named, which must be an assembly, in its order. Like decomposition it forms an
// assembly over those members and a transition through them. It returns what it formed and the populations shared.
func (m *Memory) DeclareIntersection(name Name, of []Name) ([]Assembly, []Name, error) {
	if len(of) < 2 {
		return nil, nil, TooFewNamesError{Operation: "intersection"}
	}
	if err := m.refuseRedeclaration(name); err != nil {
		return nil, nil, err
	}
	switch kind, declared := m.KindOf(of[0]); {
	case !declared:
		return nil, nil, UndeclaredError{Name: of[0]}
	case kind != AssemblyKind:
		return nil, nil, SourceError{Operation: "intersection", Name: of[0], Is: kind}
	}
	comparison, err := m.Compare(of)
	if err != nil {
		return nil, nil, err
	}
	shared := comparison.Intersection
	if len(shared) < 2 {
		return nil, nil, FormedTooSmallError{Operation: "intersection", Result: shared}
	}
	from := []Name{of[0]}
	assemblies, err := m.DeclareAssemblies(name, []Outline{
		{Shape: StateShape, Names: from, Only: [][]Name{shared}},
		{Shape: TransitionShape, Names: from, Only: [][]Name{shared}},
	})
	return assemblies, shared, err
}

// DeclareDifference forms what the first name has that the others don't, beside it: the first's members, with each of
// the others' letters taken away in order, as an assembly and a transition. Taking away in order keeps a repeated
// letter that only the first has: thecat − the leaves c, a and thecat's last t, where a plain set difference would
// lose every t. It returns what it formed and the populations left.
func (m *Memory) DeclareDifference(name Name, of []Name) ([]Assembly, []Name, error) {
	if len(of) < 2 {
		return nil, nil, TooFewNamesError{Operation: "difference"}
	}
	if err := m.refuseRedeclaration(name); err != nil {
		return nil, nil, err
	}
	switch kind, declared := m.KindOf(of[0]); {
	case !declared:
		return nil, nil, UndeclaredError{Name: of[0]}
	case kind != AssemblyKind:
		return nil, nil, SourceError{Operation: "difference", Name: of[0], Is: kind}
	}
	kept := m.partMembers(of[0])
	for _, other := range of[1:] {
		letters, err := m.lettersInOrder(other)
		if err != nil {
			return nil, nil, err
		}
		kept = takeAwayInOrder(kept, letters)
	}
	left := populationsOf(kept)
	if len(kept) < 2 {
		return nil, nil, FormedTooSmallError{Operation: "difference", Result: left}
	}
	return []Assembly{m.form(name, StateShape, kept), m.form(name, TransitionShape, kept)}, left, nil
}

// lettersInOrder lists the populations a declared name stands for, in order, repeats kept: an assembly's members'
// populations, a community's populations, or a population itself.
func (m *Memory) lettersInOrder(name Name) ([]Name, error) {
	kind, declared := m.KindOf(name)
	switch {
	case !declared:
		return nil, UndeclaredError{Name: name}
	case kind == PopulationKind:
		return []Name{name}, nil
	case kind == CommunityKind:
		return populationNames(m.communities[name].populations), nil
	default:
		return populationsOf(m.partMembers(name)), nil
	}
}

// takeAwayInOrder removes from members, for each letter in turn, the next member of that population after the last
// one removed; a letter with no such member is passed over.
func takeAwayInOrder(members []Member, letters []Name) []Member {
	removed := make([]bool, len(members))
	from := 0
	for _, letter := range letters {
		at := slices.IndexFunc(members[from:], func(member Member) bool { return member.population.name == letter })
		if at < 0 {
			continue
		}
		removed[from+at] = true
		from += at + 1
	}
	var kept []Member
	for i, member := range members {
		if !removed[i] {
			kept = append(kept, member)
		}
	}
	return kept
}
