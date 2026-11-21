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

// Annealing is what one anneal over stored wholes did: the part they share, and for each whole what varies in it and
// the whole again composed from its parts. Each piece was either reused, because the memory already held it, or
// formed, unnamed.
type Annealing struct {
	Of     []Name
	Shared []Name // the letters every whole has, next to each other in order
	Part   Piece  // the shared part
	Wholes []AnnealedWhole
}

// AnnealedWhole is what anneal did for one whole.
type AnnealedWhole struct {
	Whole    Name
	Before   Piece // what varies before the shared part; empty when the whole starts with it
	After    Piece // what varies after it; empty when the whole ends with it
	Composed Piece // the whole again, from its parts in order; empty when nothing varies
}

// Piece is one part anneal reused or formed: an assembly and the transitions through it, each marked reused or not.
// A piece of one member has no assembly of its own; it takes part in composing as that member.
type Piece struct {
	Members    []Member
	Assemblies []Assembly
	Reused     []bool
}

// Empty is true when the piece has no members.
func (p Piece) Empty() bool { return len(p.Members) == 0 }

// AllReused is true when every assembly in the piece already existed.
func (p Piece) AllReused() bool { return !slices.Contains(p.Reused, false) }

// Anneal compares stored wholes and fits them into what the memory holds, forming only what is new (economy: reuse
// first). The shared part is the longest run of letters, in order and next to each other, that every whole has
// (abstraction); what varies in each is what comes before and after it (decomposition); and each whole is composed
// again from those pieces in order (composition). A piece the memory already holds is reused: an assembly with the
// same letters in order (the very same members if there is one, otherwise the earliest formed) for the shared part
// and what varies, and one with exactly the same members for a composed whole. Nothing existing changes.
func (m *Memory) Anneal(wholes []Name) (Annealing, error) {
	if len(wholes) < 2 {
		return Annealing{}, TooFewNamesError{Operation: "anneal"}
	}
	sequences := make([][]Member, len(wholes))
	for i, whole := range wholes {
		switch kind, declared := m.KindOf(whole); {
		case !declared:
			return Annealing{}, UndeclaredError{Name: whole}
		case kind != AssemblyKind:
			return Annealing{}, AnnealSourceError{Name: whole, Is: kind}
		}
		if slices.Contains(wholes[:i], whole) {
			return Annealing{}, GivenTwiceError{Name: whole}
		}
		sequences[i] = m.partMembers(whole)
	}
	start, length := longestSharedRun(sequences)
	if length < 2 {
		return Annealing{}, TooLittleSharedError{Shared: populationsOf(sequences[0][start : start+length])}
	}
	shared := sequences[0][start : start+length]
	annealing := Annealing{Of: slices.Clone(wholes), Shared: populationsOf(shared)}
	annealing.Part = m.reuseOrForm(shared)
	letters := annealing.Shared
	for i, whole := range wholes {
		at := indexOfRun(populationsOf(sequences[i]), letters)
		formed := AnnealedWhole{Whole: whole}
		formed.Before = m.reuseOrForm(sequences[i][:at])
		formed.After = m.reuseOrForm(sequences[i][at+len(letters):])
		if !formed.Before.Empty() || !formed.After.Empty() {
			formed.Composed = m.composeFrom([]Piece{formed.Before, annealing.Part, formed.After})
		}
		annealing.Wholes = append(annealing.Wholes, formed)
	}
	return annealing, nil
}

// reuseOrForm gives a piece over members: nothing for no members, the member itself for one, and otherwise an
// assembly and a transition, reused if the memory already holds one with the same letters in order.
func (m *Memory) reuseOrForm(members []Member) Piece {
	switch len(members) {
	case 0:
		return Piece{}
	case 1:
		return Piece{Members: members}
	}
	if existing, ok := m.sameLetters(members); ok {
		piece := Piece{Members: existing.members, Assemblies: []Assembly{existing}, Reused: []bool{true}}
		transition, reused := m.reuseOrFormExactly(TransitionShape, existing.members)
		piece.Assemblies, piece.Reused = append(piece.Assemblies, transition), append(piece.Reused, reused)
		return piece
	}
	return Piece{
		Members:    members,
		Assemblies: []Assembly{m.form("", StateShape, members), m.form("", TransitionShape, members)},
		Reused:     []bool{false, false},
	}
}

// sameLetters finds an assembly (not a transition) with the same letters as members, in the same order: the one with
// the very same members if there is one, otherwise the earliest formed.
func (m *Memory) sameLetters(members []Member) (Assembly, bool) {
	letters := populationsOf(members)
	var earliest *Assembly
	for i := range m.assemblies {
		a := &m.assemblies[i]
		if a.shape != StateShape || !slices.Equal(populationsOf(a.members), letters) {
			continue
		}
		if slices.Equal(a.members, members) {
			return *a, true
		}
		if earliest == nil {
			earliest = a
		}
	}
	if earliest == nil {
		return Assembly{}, false
	}
	return *earliest, true
}

// reuseOrFormExactly reuses an assembly of the shape with exactly these members in this order, or forms one.
func (m *Memory) reuseOrFormExactly(shape Shape, members []Member) (Assembly, bool) {
	for _, a := range m.assemblies {
		if a.shape == shape && slices.Equal(a.members, members) {
			return a, true
		}
	}
	return m.form("", shape, members), false
}

// composeFrom composes a whole from pieces in order, as composition does: an assembly binding a sample of each piece
// (a one-member piece takes part as itself) and transitions joining them last member to first; each reused if the
// memory already holds it.
func (m *Memory) composeFrom(pieces []Piece) Piece {
	var elements []element
	for _, piece := range pieces {
		switch {
		case piece.Empty():
		case len(piece.Members) == 1:
			elements = append(elements, element{exact: piece.Members})
		default:
			elements = append(elements, element{part: piece.Members})
		}
	}
	state := stateMembers(elements, nil)
	composed := Piece{Members: state}
	a, reused := m.reuseOrFormExactly(StateShape, state)
	composed.Assemblies, composed.Reused = append(composed.Assemblies, a), append(composed.Reused, reused)
	for _, chain := range chainMembers(elements, nil) {
		a, reused := m.reuseOrFormExactly(TransitionShape, chain)
		composed.Assemblies, composed.Reused = append(composed.Assemblies, a), append(composed.Reused, reused)
	}
	return composed
}

// longestSharedRun finds the longest run of letters, next to each other in order, that every sequence has. It
// returns where the run starts in the first sequence and how long it is; the first such run when several tie.
func longestSharedRun(sequences [][]Member) (start, length int) {
	first := populationsOf(sequences[0])
	for size := len(first); size > 0; size-- {
		for from := 0; from+size <= len(first); from++ {
			run := first[from : from+size]
			if !slices.ContainsFunc(sequences[1:], func(other []Member) bool { return indexOfRun(populationsOf(other), run) < 0 }) {
				return from, size
			}
		}
	}
	return 0, 0
}

// indexOfRun is where run first appears, next to each other in order, in letters, or -1.
func indexOfRun(letters, run []Name) int {
	for at := 0; at+len(run) <= len(letters); at++ {
		if slices.Equal(letters[at:at+len(run)], run) {
			return at
		}
	}
	return -1
}
