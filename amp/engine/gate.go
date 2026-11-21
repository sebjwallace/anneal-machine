package engine

import "slices"

// L1B's activity while reading, with competition. Each moment:
//
//   - The L1B members that L1A's active members project up to come on, and are confirmed: the input has shown them.
//     A burst in L1A clears the confirmations first.
//   - Each assembly's gate counts its confirmed members, and opens when GateOpens says so. Its score is how much of
//     it is confirmed: confirmed members over its size.
//   - Of the assemblies whose gates are open, the one with the highest score wins. The winner stays the winner until
//     another scores higher; on a tie it stays. When no one has won yet, a tie for the highest score means none wins.
//   - The winner completes: its other members come on the moment after. It holds, through bursts too, until it is
//     outcompeted. Every other assembly stays quiet: only its confirmed members are on.
//
// So what is on is the confirmed members and the winner's members. Members a gate brought on don't count towards
// any score, or the winner, always complete, could never be outcompeted.

// C105 (experiment branch only): how confirmations last, and what a burst projects up.
type HoldRule int

const (
	HoldClear    HoldRule = iota // a burst clears every confirmation
	HoldKeep                     // a burst clears every confirmation but the winner's
	HoldKeepPlus                 // as HoldKeep, and a challenger that ties the winner takes over
	HoldWindow                   // a burst clears nothing; a confirmation lasts Window moments
)

var (
	Hold              = HoldClear
	Window            = 4
	BurstUpPickedOnly = false // a burst projects up only the member picked, not every member of the population
)

// GateOpens is the rule for an assembly's gate: open as soon as any of its members is confirmed (the owner's choice,
// for now).
func GateOpens(confirmed, size int) bool { return confirmed >= 1 }

// Gate is one assembly's gate at one moment.
type Gate struct {
	Assembly  int
	Counted   int // the assembly's members on this moment, for whatever reason
	Confirmed int // the assembly's members the input has shown since the last burst
	Size      int
	Open      bool
	Winner    bool
}

// Score is how much of the assembly the input has confirmed.
func (g Gate) Score() float64 { return float64(g.Confirmed) / float64(g.Size) }

// Complete is true when every member of the assembly is on.
func (g Gate) Complete() bool { return g.Counted == g.Size }

// L1BMoment is L1B's activity at one moment of a read.
type L1BMoment struct {
	Cleared   bool     // a burst in L1A cleared the confirmations this moment
	On        []Member // every L1B member on this moment, in population and number order
	Up        []Member // the members that came on this moment from L1A, projected up
	Completed []Member // the members that came on this moment because the winner completes
	Gates     []Gate   // every assembly's gate, in the order cast
	Winner    int      // the assembly winning this moment, or 0 for none
	Was       int      // the winner the moment before, or 0: when it differs from Winner, the state changed
}

// l1bState is what L1B carries from one moment to the next during a read.
type l1bState struct {
	confirmed map[Member]int // when each was confirmed
	winner    int
	coming    []Member // what the winner brings on next moment
	on        map[Member]bool
}

func newL1BState() *l1bState {
	return &l1bState{confirmed: map[Member]int{}, on: map[Member]bool{}}
}

// l1bStep works out L1B's activity for a moment, from the state it carries and L1A's active members.
func (m *Memory) l1bStep(s *l1bState, burst bool, active []Member) L1BMoment {
	moment := L1BMoment{Was: s.winner}
	now := m.moment
	switch {
	case Hold == HoldWindow:
		for member, at := range s.confirmed {
			if now-at >= Window {
				delete(s.confirmed, member)
			}
		}
	case burst && (Hold == HoldKeep || Hold == HoldKeepPlus) && s.winner > 0:
		keep := map[Member]bool{}
		for _, member := range m.assemblies[s.winner-1].Members {
			keep[member] = true
		}
		for member := range s.confirmed {
			if !keep[member] {
				delete(s.confirmed, member)
			}
		}
		moment.Cleared = true
	case burst:
		clear(s.confirmed)
		moment.Cleared = true
	}
	wasOn := s.on
	s.on = map[Member]bool{}
	for member := range s.confirmed {
		s.on[member] = true
	}
	if s.winner > 0 {
		for _, member := range m.assemblies[s.winner-1].Members {
			if wasOn[member] {
				s.on[member] = true // the winner holds
			}
		}
	}
	for _, member := range m.projectedUp(active) {
		s.confirmed[member] = now
		if !s.on[member] {
			moment.Up = append(moment.Up, member)
		}
		s.on[member] = true
	}
	for _, member := range s.coming {
		if !s.on[member] {
			s.on[member] = true
			moment.Completed = append(moment.Completed, member)
		}
	}

	bestScore := -1.0
	var bests []int
	for _, a := range m.assemblies {
		g := Gate{Assembly: a.ID, Size: len(a.Members)}
		for _, member := range a.Members {
			if s.on[member] {
				g.Counted++
			}
			if _, ok := s.confirmed[member]; ok {
				g.Confirmed++
			}
		}
		g.Open = GateOpens(g.Confirmed, g.Size)
		if g.Open {
			switch score := g.Score(); {
			case score > bestScore:
				bestScore, bests = score, []int{a.ID}
			case score == bestScore:
				bests = append(bests, a.ID)
			}
		}
		moment.Gates = append(moment.Gates, g)
	}
	switch {
	case len(bests) == 0:
		// no gate open: the winner, if any, holds
	case s.winner == 0:
		if len(bests) == 1 {
			s.winner = bests[0]
		}
	case bestScore > moment.Gates[s.winner-1].Score():
		if len(bests) == 1 {
			s.winner = bests[0]
		}
	case Hold == HoldKeepPlus && bestScore == moment.Gates[s.winner-1].Score():
		var others []int
		for _, id := range bests {
			if id != s.winner {
				others = append(others, id)
			}
		}
		if len(others) == 1 {
			s.winner = others[0]
		}
	}
	if s.winner != moment.Was && moment.Was > 0 {
		// outcompeted: the old winner's members that aren't confirmed go off
		for _, member := range m.assemblies[moment.Was-1].Members {
			if _, ok := s.confirmed[member]; !ok {
				delete(s.on, member)
			}
		}
	}
	s.coming = nil
	if s.winner > 0 {
		moment.Gates[s.winner-1].Winner = true
		for _, member := range m.assemblies[s.winner-1].Members {
			if !s.on[member] {
				s.coming = append(s.coming, member)
			}
		}
	}
	moment.Winner = s.winner
	// counts after the old winner let go
	for i, a := range m.assemblies {
		moment.Gates[i].Counted = 0
		for _, member := range a.Members {
			if s.on[member] {
				moment.Gates[i].Counted++
			}
		}
	}
	for member := range s.on {
		moment.On = append(moment.On, member)
	}
	sortMembers(moment.On)
	sortMembers(moment.Up)
	sortMembers(moment.Completed)
	return moment
}

// projectedUp lists the L1B members that the active L1A members project up to, without repeats.
func (m *Memory) projectedUp(active []Member) []Member {
	isActive := map[Member]bool{}
	for _, member := range active {
		isActive[member] = true
	}
	var up []Member
	for _, a := range m.assemblies {
		for i, from := range a.From {
			for _, f := range from {
				if isActive[f] && !slices.Contains(up, a.Members[i]) {
					up = append(up, a.Members[i])
				}
			}
		}
	}
	return up
}

func sortMembers(members []Member) {
	slices.SortFunc(members, func(a, b Member) int {
		if a.Population != b.Population {
			if a.Population < b.Population {
				return -1
			}
			return 1
		}
		return a.Number - b.Number
	})
}
