package engine

import (
	"encoding/json"
	"fmt"
	"io"
)

// A snapshot holds what the memory knows: its populations, which of their members have been selected, the bonds in
// the order formed, L1B's populations and assemblies with what projects up to them, the clock and the seed. Nothing
// is active between reads, so there is no activity to keep.

type snapshotFile struct {
	Seed        uint64               `json:"seed"`
	Moment      int                  `json:"moment"`
	Populations []snapshotPopulation `json:"populations"`
	Bonds       []snapshotBond       `json:"bonds"`
	L1B         []snapshotPopulation `json:"l1b"`
	Assemblies  []snapshotAssembly   `json:"assemblies"`
}

type snapshotAssembly struct {
	Motif   []Name             `json:"motif"`
	Members []snapshotMember   `json:"members"`
	From    [][]snapshotMember `json:"from"` // for each member, the L1A members that project up to it
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
	file := snapshotFile{Seed: m.seed, Moment: m.moment, Populations: []snapshotPopulation{}, Bonds: []snapshotBond{},
		L1B: []snapshotPopulation{}, Assemblies: []snapshotAssembly{}}
	for _, p := range m.l1bOrder {
		members := []int{}
		for n := 1; n <= p.size; n++ {
			if m.l1bUsed[p.name][n] {
				members = append(members, n)
			}
		}
		file.L1B = append(file.L1B, snapshotPopulation{Name: p.name, Size: p.size, Members: members})
	}
	for _, a := range m.assemblies {
		sa := snapshotAssembly{Motif: a.Motif}
		for i, member := range a.Members {
			sa.Members = append(sa.Members, snapshotMember{member.Population, member.Number})
			from := []snapshotMember{}
			for _, f := range a.From[i] {
				from = append(from, snapshotMember{f.Population, f.Number})
			}
			sa.From = append(sa.From, from)
		}
		file.Assemblies = append(file.Assemblies, sa)
	}
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
	for _, p := range file.L1B {
		if _, taken := m.l1b[p.Name]; taken {
			return nil, fmt.Errorf("L1B's %s is given twice", p.Name)
		}
		if p.Size < 1 {
			return nil, fmt.Errorf("L1B's %s needs at least 1 member", p.Name)
		}
		population := Population{name: p.Name, size: p.Size}
		m.l1b[p.Name], m.l1bOrder, m.l1bUsed[p.Name] = population, append(m.l1bOrder, population), map[int]bool{}
		for _, n := range p.Members {
			if n < 1 || n > p.Size {
				return nil, fmt.Errorf("L1B's %s has no member %d", p.Name, n)
			}
			m.l1bUsed[p.Name][n] = true
		}
	}
	for i, sa := range file.Assemblies {
		a := Assembly{ID: i + 1, Motif: sa.Motif}
		if len(sa.Members) != len(sa.Motif) || len(sa.From) != len(sa.Motif) || len(sa.Motif) == 0 {
			return nil, fmt.Errorf("assembly #%d needs one member, and its projections, for each character", a.ID)
		}
		for k, sm := range sa.Members {
			member := Member{sm.Population, sm.Number}
			if member.Population != sa.Motif[k] || !m.l1bUsed[member.Population][member.Number] {
				return nil, fmt.Errorf("assembly #%d: %s isn't a member of L1B's %s", a.ID, member, sa.Motif[k])
			}
			a.Members = append(a.Members, member)
			var from []Member
			for _, f := range sa.From[k] {
				up := Member{f.Population, f.Number}
				if up.Population != member.Population || m.IsIndividual(up) {
					return nil, fmt.Errorf("assembly #%d: %s can't project up to %s", a.ID, up, member)
				}
				from = append(from, up)
			}
			a.From = append(a.From, from)
		}
		if _, taken := m.byMotif[motifKey(a.Motif)]; taken {
			return nil, fmt.Errorf("assembly #%d: %s is already cast", a.ID, a.Name())
		}
		m.assemblies = append(m.assemblies, a)
		m.byMotif[motifKey(a.Motif)] = a.ID
	}
	return m, nil
}
