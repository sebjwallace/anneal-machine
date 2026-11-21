package engine

import "slices"

// L1B's activity while reading. Each moment:
//
//   - A burst in L1A clears L1B: everything in it goes off. (Until competition is built, this is what ends
//     activity there.)
//   - The L1B members that L1A's active members project up to come on.
//   - The members an open gate brought on (the moment before) come on.
//   - An L1B member that came on stays on until the next burst.
//   - Each assembly's gate counts its own members that are on. It opens when GateOpens says so, and its other
//     members come on the moment after: the assembly completes.

// GateOpens is the rule for an assembly's gate: open as soon as any of its members is counted (the owner's choice,
// for now).
func GateOpens(counted, size int) bool { return counted >= 1 }

// Gate is one assembly's gate at one moment.
type Gate struct {
	Assembly int
	Counted  int // the assembly's members on this moment
	Size     int
	Open     bool
}

// Complete is true when every member of the assembly is on.
func (g Gate) Complete() bool { return g.Counted == g.Size }

// L1BMoment is L1B's activity at one moment of a read.
type L1BMoment struct {
	Cleared   bool     // a burst in L1A cleared L1B this moment, before anything came on
	On        []Member // every L1B member on this moment, in population and number order
	Up        []Member // the members that came on this moment from L1A, projected up
	Completed []Member // the members that came on this moment because a gate opened the moment before
	Gates     []Gate   // every assembly's gate, in the order cast
}

// l1bStep works out L1B's activity for a moment from what was on, L1A's active members, and what the gates opened
// the moment before brought on. It returns the moment and what open gates bring on next.
func (m *Memory) l1bStep(on map[Member]bool, burst bool, active []Member, coming []Member) (L1BMoment, []Member) {
	moment := L1BMoment{}
	if burst {
		clear(on)
		coming = nil
		moment.Cleared = true
	}
	for _, member := range m.projectedUp(active) {
		if !on[member] {
			on[member] = true
			moment.Up = append(moment.Up, member)
		}
	}
	for _, member := range coming {
		if !on[member] {
			on[member] = true
			moment.Completed = append(moment.Completed, member)
		}
	}
	var next []Member
	for _, a := range m.assemblies {
		g := Gate{Assembly: a.ID, Size: len(a.Members)}
		for _, member := range a.Members {
			if on[member] {
				g.Counted++
			}
		}
		g.Open = GateOpens(g.Counted, g.Size)
		if g.Open {
			for _, member := range a.Members {
				if !on[member] && !slices.Contains(next, member) {
					next = append(next, member)
				}
			}
		}
		moment.Gates = append(moment.Gates, g)
	}
	for member := range on {
		moment.On = append(moment.On, member)
	}
	sortMembers(moment.On)
	sortMembers(moment.Up)
	sortMembers(moment.Completed)
	return moment, next
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
