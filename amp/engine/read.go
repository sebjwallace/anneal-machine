package engine

import (
	"fmt"
	"math/rand/v2"
	"slices"
)

// Moment is what happened at one moment of a read: one character arriving.
type Moment struct {
	Number     int  // on the memory's clock
	Population Name // the population the character drives
	// Primed are the members of Population that the moment before primed (its active members bond to them). Empty
	// means nothing predicted this character, so the population burst.
	Primed []Member
	Burst  bool
	// Member is the member selected: the primed member (one picked at random if several were primed), or, when the
	// population burst, an individual picked at random, which from now on is a member.
	Member Member
	New    bool // Member was an individual until this moment
	// Active are the members on this moment: the primed members, or every member of the population when it burst.
	Active []Member
	Bond   *Bond // the bond formed this moment, from the member selected the moment before to Member, if any
	// Predicts are the members this moment's active members bond to: what they prime for the next moment.
	Predicts []Member
	// Cast is what casting did, when a motif ended this moment: at the burst after it, or at the read's last moment.
	Cast *Casting
	// L1B is L1B's activity this moment (before anything cast this moment, which acts from the next).
	L1B L1BMoment
}

// Reading is what a read did, moment by moment.
type Reading struct {
	Text    string
	Moments []Moment
}

// PopulationFor is the population a character drives: a letter's own, and "_" for a space.
func PopulationFor(r rune) (Name, error) {
	switch {
	case r == ' ':
		return "_", nil
	case r >= 'a' && r <= 'z':
		return Name(string(r)), nil
	}
	return "", fmt.Errorf("reading takes lower-case letters and spaces only, not %q", r)
}

// Read streams text in, one character a moment. Each read starts afresh: nothing is active before its first
// character. For each character:
//
//   - If the moment before primed members of its population, they are active and the population doesn't burst;
//     one of them is selected.
//   - Otherwise the population bursts: every member is active, and an individual is picked at random as the member
//     selected.
//   - The member selected the moment before bonds to the member selected now, unless that bond already exists.
//   - L1B's activity follows: see l1bStep.
//   - When a motif ends (at the burst after it, or at the end of the read), it is cast into L1B: see cast.
//
// A letter not seen before is declared with ReadingSize members. The read is all or nothing: if a population has no
// individual left when it bursts, nothing is changed.
func (m *Memory) Read(text string) (Reading, error) {
	trial := m.clone()
	reading, err := trial.read(text)
	if err != nil {
		return Reading{}, err
	}
	*m = *trial
	return reading, nil
}

func (m *Memory) read(text string) (Reading, error) {
	names := make([]Name, 0, len(text))
	for _, r := range text {
		name, err := PopulationFor(r)
		if err != nil {
			return Reading{}, err
		}
		names = append(names, name)
	}
	reading := Reading{Text: text}
	var previous *Member
	var active []Member
	lastBurst := 0
	l1b := newL1BState()
	for _, name := range names {
		if _, ok := m.populations[name]; !ok {
			if _, err := m.DeclarePopulation(name, ReadingSize); err != nil {
				return Reading{}, err
			}
		}
		m.moment++
		pick := rand.New(rand.NewPCG(m.seed, uint64(m.moment)))
		moment := Moment{Number: m.moment, Population: name, Primed: m.primedIn(name, active)}
		if len(moment.Primed) > 0 {
			moment.Active = moment.Primed
			moment.Member = moment.Primed[pick.IntN(len(moment.Primed))]
		} else {
			individuals := m.individuals(name)
			if len(individuals) == 0 {
				return Reading{}, fmt.Errorf("%s has no individual left to pick when it bursts (all %d are members)", name, m.populations[name].size)
			}
			moment.Burst = true
			moment.Active = m.everyMember(name)
			moment.Member = individuals[pick.IntN(len(individuals))]
			moment.New = true
			m.used[name][moment.Member.Number] = true
		}
		if previous != nil && !m.hasBond(*previous, moment.Member) {
			bond := m.addBond(*previous, moment.Member)
			moment.Bond = &bond
		}
		moment.Predicts = m.primedBy(moment.Active)
		up := moment.Active
		if BurstUpPickedOnly && moment.Burst {
			up = []Member{moment.Member}
		}
		moment.L1B = m.l1bStep(l1b, moment.Burst, up)
		i := len(reading.Moments)
		last := i == len(names)-1
		switch {
		case moment.Burst && i > 0 && !reading.Moments[i-1].Burst:
			// the burst ends the motif before it
			casting, err := m.cast(reading.Moments, Motif{Start: lastBurst, End: i - 1}, pick)
			if err != nil {
				return Reading{}, err
			}
			moment.Cast = casting
		case last && !moment.Burst:
			// the read ends in a motif, which this moment ends
			casting, err := m.cast(append(reading.Moments, moment), Motif{Start: lastBurst, End: i}, pick)
			if err != nil {
				return Reading{}, err
			}
			moment.Cast = casting
		}
		if moment.Burst {
			lastBurst = i
		}
		reading.Moments = append(reading.Moments, moment)
		selected := moment.Member
		previous, active = &selected, moment.Active
	}
	return reading, nil
}

// primedIn lists the members of population p that active bond to, in number order.
func (m *Memory) primedIn(p Name, active []Member) []Member {
	var primed []Member
	for _, member := range m.primedBy(active) {
		if member.Population == p {
			primed = append(primed, member)
		}
	}
	return primed
}

// primedBy lists every member that active bond to, without repeats, ordered by population and number.
func (m *Memory) primedBy(active []Member) []Member {
	var primed []Member
	for _, from := range active {
		for _, to := range m.out[from] {
			if !slices.Contains(primed, to) {
				primed = append(primed, to)
			}
		}
	}
	slices.SortFunc(primed, func(a, b Member) int {
		if a.Population != b.Population {
			if a.Population < b.Population {
				return -1
			}
			return 1
		}
		return a.Number - b.Number
	})
	return primed
}

func (m *Memory) individuals(p Name) []Member {
	var individuals []Member
	for n := 1; n <= m.populations[p].size; n++ {
		if !m.used[p][n] {
			individuals = append(individuals, Member{Population: p, Number: n})
		}
	}
	return individuals
}

func (m *Memory) everyMember(p Name) []Member {
	members := make([]Member, m.populations[p].size)
	for i := range members {
		members[i] = Member{Population: p, Number: i + 1}
	}
	return members
}
