package engine

import (
	"encoding/json"
	"fmt"
	"io"
)

// A snapshot holds what the memory knows: its populations, which of their members have been selected, the bonds in
// the order formed, the clock and the seed. Nothing is active between reads, so there is no activity to keep.

type snapshotFile struct {
	Seed        uint64               `json:"seed"`
	Moment      int                  `json:"moment"`
	Populations []snapshotPopulation `json:"populations"`
	Bonds       []snapshotBond       `json:"bonds"`
}

type snapshotPopulation struct {
	Name    Name  `json:"name"`
	Size    int   `json:"size"`
	Members []int `json:"members"` // the members selected so far, by number; the rest are individuals
}

type snapshotBond struct {
	From snapshotMember `json:"from"`
	To   snapshotMember `json:"to"`
}

type snapshotMember struct {
	Population Name `json:"population"`
	Number     int  `json:"number"`
}

// WriteSnapshot writes what the memory knows as JSON.
func (m *Memory) WriteSnapshot(w io.Writer) error {
	file := snapshotFile{Seed: m.seed, Moment: m.moment, Populations: []snapshotPopulation{}, Bonds: []snapshotBond{}}
	for _, p := range m.populationOrder {
		members := []int{}
		for _, member := range m.Selected(p.name) {
			members = append(members, member.Number)
		}
		file.Populations = append(file.Populations, snapshotPopulation{Name: p.name, Size: p.size, Members: members})
	}
	for _, b := range m.bonds {
		file.Bonds = append(file.Bonds, snapshotBond{
			From: snapshotMember{b.From.Population, b.From.Number},
			To:   snapshotMember{b.To.Population, b.To.Number},
		})
	}
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	return encoder.Encode(file)
}

// ReadSnapshot rebuilds a memory from a snapshot, checking it through the engine's own rules.
func ReadSnapshot(r io.Reader) (*Memory, error) {
	var file snapshotFile
	decoder := json.NewDecoder(r)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&file); err != nil {
		return nil, fmt.Errorf("not a snapshot: %w", err)
	}
	if file.Moment < 0 {
		return nil, fmt.Errorf("the moment can't be negative (%d)", file.Moment)
	}
	m := New()
	m.seed, m.moment = file.Seed, file.Moment
	for _, p := range file.Populations {
		if _, err := m.DeclarePopulation(p.Name, p.Size); err != nil {
			return nil, err
		}
		for _, n := range p.Members {
			if n < 1 || n > p.Size {
				return nil, fmt.Errorf("%s has no member %d", p.Name, n)
			}
			m.used[p.Name][n] = true
		}
	}
	for _, b := range file.Bonds {
		from, to := Member{b.From.Population, b.From.Number}, Member{b.To.Population, b.To.Number}
		for _, member := range []Member{from, to} {
			if m.IsIndividual(member) {
				return nil, fmt.Errorf("the bond %s -> %s needs %s to be a member", from, to, member)
			}
		}
		if m.hasBond(from, to) {
			return nil, fmt.Errorf("the bond %s -> %s is given twice", from, to)
		}
		m.addBond(from, to)
	}
	return m, nil
}
