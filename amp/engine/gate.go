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
	confirmed map[Member]bool
	winner    int
	coming    []Member // what the winner brings on next moment
	on        map[Member]bool
}

func newL1BState() *l1bState {
	return &l1bState{confirmed: map[Member]bool{}, on: map[Member]bool{}}
}

// l1bStep works out L1B's activity for a moment, from the state it carries and L1A's active members.
func (m *Memory) l1bStep(s *l1bState, burst bool, active []Member) L1BMoment {
	moment := L1BMoment{Was: s.winner}
	if burst {
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
		s.confirmed[member] = true
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

	best, bestScore, tied := 0, -1.0, false
	for _, a := range m.assemblies {
		g := Gate{Assembly: a.ID, Size: len(a.Members)}
		for _, member := range a.Members {
			if s.on[member] {
				g.Counted++
			}
			if s.confirmed[member] {
				g.Confirmed++
			}
		}
		g.Open = GateOpens(g.Confirmed, g.Size)
		if g.Open {
			switch score := g.Score(); {
			case score > bestScore:
				best, bestScore, tied = a.ID, score, false
			case score == bestScore:
				tied = true
			}
		}
		moment.Gates = append(moment.Gates, g)
	}
	switch {
	case best == 0:
		// no gate open: the winner, if any, holds
	case s.winner == 0 && !tied:
		s.winner = best
	case s.winner > 0 && bestScore > moment.Gates[s.winner-1].Score():
		if !tied {
			s.winner = best
		}
	}
	if s.winner != moment.Was && moment.Was > 0 {
		// outcompeted: the old winner's members that aren't confirmed go off
		for _, member := range m.assemblies[moment.Was-1].Members {
			if !s.confirmed[member] {
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
