package engine

import (
	"fmt"
	"maps"
	"math/rand/v2"
	"slices"
	"strings"
)

// L1B is the community where motifs are cast into assemblies (state memory). It has populations of its own, one for
// each character, separate from the ones reading drives (L1A). Its members are written the same way, b{3}; where a
// member belongs is always clear from where it is shown. A member can belong to several assemblies: each assembly's
// gate counts only its own members.

// Assembly is a motif cast into L1B: one L1B member for each character of the motif, in order, all bonded to each
// other in both directions. The L1A members that took part in the motif project up to them.
type Assembly struct {
	ID      int    // #1 is the first cast
	Motif   []Name // the characters it was cast from, in order
	Members []Member
	// From is, for each of Members, the L1A members that project up to it.
	From [][]Member
}

// Name writes the assembly's characters, as in the_.
func (a Assembly) Name() string {
	var b strings.Builder
	for _, c := range a.Motif {
		b.WriteString(string(c))
	}
	return b.String()
}

// Bonds are the bonds between the assembly's members: every member to every other, both ways.
func (a Assembly) Bonds() []Bond {
	var bonds []Bond
	for _, from := range a.Members {
		for _, to := range a.Members {
			if from != to {
				bonds = append(bonds, Bond{From: from, To: to})
			}
		}
	}
	return bonds
}

// Projection goes up from an L1A member to an L1B member.
type Projection struct {
	From, To Member
}

func (p Projection) String() string { return fmt.Sprintf("%s -> %s", p.From, p.To) }

// Casting is what happened when a motif ended: a new assembly cast from it, or projections added to the assembly
// already cast from the same characters, or nothing new at all.
type Casting struct {
	Motif       Motif // in the read it happened in
	Assembly    int   // the assembly's ID
	New         bool  // the assembly was cast now
	Projections []Projection
}

// Assemblies lists every assembly, in the order cast.
func (m *Memory) Assemblies() []Assembly {
	assemblies := make([]Assembly, len(m.assemblies))
	for i, a := range m.assemblies {
		assemblies[i] = a.clone()
	}
	return assemblies
}

// Assembly looks up an assembly by its ID.
func (m *Memory) Assembly(id int) (Assembly, bool) {
	if id < 1 || id > len(m.assemblies) {
		return Assembly{}, false
	}
	return m.assemblies[id-1].clone(), true
}

// L1BPopulations lists L1B's populations, in the order declared.
func (m *Memory) L1BPopulations() []Population { return slices.Clone(m.l1bOrder) }

func (a Assembly) clone() Assembly {
	c := Assembly{ID: a.ID, Motif: slices.Clone(a.Motif), Members: slices.Clone(a.Members)}
	for _, from := range a.From {
		c.From = append(c.From, slices.Clone(from))
	}
	return c
}

func motifKey(names []Name) string {
	parts := make([]string, len(names))
	for i, n := range names {
		parts[i] = string(n)
	}
	return strings.Join(parts, " ")
}

// cast casts the motif that has just ended, which runs over moments[start..end] of the read so far. Each L1A member
// that took part projects up: the member selected at each moment, and, at the moment that burst, the members that
// primed the member selected next (they were on because the population burst).
func (m *Memory) cast(moments []Moment, motif Motif, pick *rand.Rand) (*Casting, error) {
	names := make([]Name, 0, motif.End-motif.Start+1)
	from := make([][]Member, 0, motif.End-motif.Start+1)
	for k := motif.Start; k <= motif.End; k++ {
		names = append(names, moments[k].Population)
		took := []Member{moments[k].Member}
		if k < motif.End {
			next := moments[k+1].Member
			for _, active := range moments[k].Active {
				if active != moments[k].Member && m.hasBond(active, next) {
					took = append(took, active)
				}
			}
		}
		from = append(from, took)
	}
	casting := &Casting{Motif: motif}
	id, exists := m.byMotif[motifKey(names)]
	if !exists {
		a := Assembly{ID: len(m.assemblies) + 1, Motif: names, From: make([][]Member, len(names))}
		for _, name := range names {
			if _, ok := m.l1b[name]; !ok {
				p := Population{name: name, size: ReadingSize}
				m.l1b[name] = p
				m.l1bOrder = append(m.l1bOrder, p)
				m.l1bUsed[name] = map[int]bool{}
			}
			// With gates, members can be reused: any member of the population will do, individual or not, as long
			// as it isn't already in this assembly.
			var candidates []Member
			for n := 1; n <= m.l1b[name].size; n++ {
				if candidate := (Member{Population: name, Number: n}); !slices.Contains(a.Members, candidate) {
					candidates = append(candidates, candidate)
				}
			}
			if len(candidates) == 0 {
				return nil, fmt.Errorf("%s has more %s than L1B's %s has members (%d)", motifKey(names), name, name, m.l1b[name].size)
			}
			member := candidates[pick.IntN(len(candidates))]
			m.l1bUsed[name][member.Number] = true
			a.Members = append(a.Members, member)
		}
		m.assemblies = append(m.assemblies, a)
		m.byMotif[motifKey(names)] = a.ID
		id, casting.New = a.ID, true
	}
	casting.Assembly = id
	a := &m.assemblies[id-1]
	for i, took := range from {
		for _, member := range took {
			if !slices.Contains(a.From[i], member) {
				a.From[i] = append(a.From[i], member)
				casting.Projections = append(casting.Projections, Projection{From: member, To: a.Members[i]})
			}
		}
	}
	return casting, nil
}

func cloneAssemblyState(m, c *Memory) {
	c.l1b = maps.Clone(m.l1b)
	c.l1bOrder = slices.Clone(m.l1bOrder)
	c.l1bUsed = map[Name]map[int]bool{}
	for name, used := range m.l1bUsed {
		c.l1bUsed[name] = maps.Clone(used)
	}
	c.assemblies = make([]Assembly, len(m.assemblies))
	for i, a := range m.assemblies {
		c.assemblies[i] = a.clone()
	}
	c.byMotif = maps.Clone(m.byMotif)
}
