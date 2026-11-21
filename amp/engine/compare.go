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
