package engine

import (
	"encoding/json"
	"fmt"
	"io"
	"slices"
)

// A snapshot holds what the memory knows (its declarations and assemblies, with the members each assembly was
// given) and how far its clock has run. It doesn't hold what is active, so a memory read from one starts with nothing
// active. Reading goes back through the engine's own rules, so a file is checked like anything typed.
//
// The snapshot is written here, inside the engine, because which member carries an assembly is the engine's own
// business: saving the members chosen, rather than re-choosing them, means a later change to how members are chosen
// can't quietly change a saved memory.

// snapshotVersion is the snapshot format. A file with any other version is refused rather than guessed at.
const snapshotVersion = 1

type snapshotFile struct {
	Version     int                  `json:"version"`
	Moment      int                  `json:"moment"`               // the last moment that passed; absent in early files, meaning 0
	Refractory  bool                 `json:"refractory,omitempty"` // whether members have a refractory period; absent means off
	Budget      int                  `json:"budget,omitempty"`     // members per population recall may have active; absent means none
	Populations []snapshotPopulation `json:"populations"`
	Communities []snapshotCommunity  `json:"communities"`
	Assemblies  []snapshotAssembly   `json:"assemblies"` // absent in early files, meaning none
}

type snapshotPopulation struct {
	Name Name `json:"name"`
	Size int  `json:"size"`
	// Next is the member the next new assembly gets, counted from 1. Absent in early files, meaning the first.
	Next int `json:"next,omitempty"`
}

type snapshotCommunity struct {
	Name        Name   `json:"name"`
	Populations []Name `json:"populations"`
}

type snapshotAssembly struct {
	ID      AssemblyID       `json:"id"`
	Name    Name             `json:"name,omitempty"`
	Shape   string           `json:"shape"`
	Members []snapshotMember `json:"members"`
}

type snapshotMember struct {
	Population Name `json:"population"`
	Member     int  `json:"member"`
}

// SnapshotVersionError: the file was written in a snapshot format this engine doesn't read.
type SnapshotVersionError struct {
	Version int
}

func (e SnapshotVersionError) Error() string {
	return fmt.Sprintf("snapshot format %d isn't one this engine reads (it reads %d)", e.Version, snapshotVersion)
}

// WriteSnapshot puts the memory's snapshot on w, as indented JSON.
func (m *Memory) WriteSnapshot(w io.Writer) error {
	snapshot := snapshotFile{
		Version:     snapshotVersion,
		Moment:      m.moment,
		Refractory:  m.refractoryPeriod,
		Budget:      m.budget,
		Populations: []snapshotPopulation{},
		Communities: []snapshotCommunity{},
		Assemblies:  []snapshotAssembly{},
	}
	for _, p := range m.populationOrder {
		snapshot.Populations = append(snapshot.Populations, snapshotPopulation{Name: p.name, Size: p.size, Next: m.next[p.name] + 1})
	}
	for _, c := range m.communityOrder {
		snapshot.Communities = append(snapshot.Communities, snapshotCommunity{Name: c.name, Populations: populationNames(c.populations)})
	}
	for _, a := range m.assemblies {
		members := make([]snapshotMember, len(a.members))
		for i, member := range a.members {
			members[i] = snapshotMember{Population: member.population.name, Member: member.number}
		}
		snapshot.Assemblies = append(snapshot.Assemblies, snapshotAssembly{ID: a.id, Name: a.name, Shape: a.shape.String(), Members: members})
	}
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	return encoder.Encode(snapshot)
}

// ReadSnapshot builds a new memory from the snapshot on r.
func ReadSnapshot(r io.Reader) (*Memory, error) {
	decoder := json.NewDecoder(r)
	decoder.DisallowUnknownFields()
	var snapshot snapshotFile
	if err := decoder.Decode(&snapshot); err != nil {
		return nil, fmt.Errorf("not a snapshot: %w", err)
	}
	if snapshot.Version != snapshotVersion {
		return nil, SnapshotVersionError{Version: snapshot.Version}
	}
	if snapshot.Moment < 0 {
		return nil, fmt.Errorf("moment %d is before the first moment", snapshot.Moment)
	}
	m := NewAfter(snapshot.Moment)
	m.refractoryPeriod = snapshot.Refractory
	if err := m.SetBudget(snapshot.Budget); err != nil {
		return nil, err
	}
	for _, p := range snapshot.Populations {
		population, err := m.DeclarePopulation(p.Name, p.Size)
		if err != nil {
			return nil, err
		}
		if p.Next < 0 || p.Next > p.Size {
			return nil, fmt.Errorf("population %s has no member %d to give next", p.Name, p.Next)
		}
		m.next[population.name] = max(p.Next-1, 0)
	}
	for _, c := range snapshot.Communities {
		if _, err := m.DeclareCommunity(c.Name, c.Populations); err != nil {
			return nil, err
		}
	}
	for i, a := range snapshot.Assemblies {
		if err := m.restoreAssembly(i, a); err != nil {
			return nil, fmt.Errorf("assembly #%d: %w", a.ID, err)
		}
	}
	return m, nil
}

// restoreAssembly forms a saved assembly with the members it was saved with, checked by the same rules as declaring.
func (m *Memory) restoreAssembly(position int, saved snapshotAssembly) error {
	if want := AssemblyID(position + 1); saved.ID != want {
		return fmt.Errorf("found where #%d should be", want)
	}
	shape, err := parseShape(saved.Shape)
	if err != nil {
		return err
	}
	outline := Outline{Shape: shape}
	for _, member := range saved.Members {
		outline.Populations = append(outline.Populations, member.Population)
	}
	populations, err := m.outlinePopulations(outline)
	if err != nil {
		return err
	}
	if _, isAssembly := m.named[saved.Name]; !isAssembly {
		if err := m.refuseRedeclaration(saved.Name); err != nil {
			return err
		}
	}
	members := make([]Member, len(populations))
	for i, population := range populations {
		number := saved.Members[i].Member
		if number < 1 || number > population.size {
			return fmt.Errorf("population %s has no member %d", population.name, number)
		}
		members[i] = Member{population: population, number: number}
		if slices.Contains(members[:i], members[i]) {
			return fmt.Errorf("has %s{%d} twice; each time a population appears takes a member of its own", population.name, number)
		}
	}
	m.form(saved.Name, shape, members)
	return nil
}

func parseShape(text string) (Shape, error) {
	for _, shape := range []Shape{StateShape, TransitionShape} {
		if shape.String() == text {
			return shape, nil
		}
	}
	return 0, fmt.Errorf("%q isn't a shape; expected \"state\" or \"transition\"", text)
}

func populationNames(populations []Population) []Name {
	names := make([]Name, len(populations))
	for i, p := range populations {
		names[i] = p.name
	}
	return names
}
