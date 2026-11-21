package engine

import "slices"

// Every member is in one of three phases (the owner's terms):
//
//   - active: on this moment;
//   - refractory: it was active the moment before, so it can't come on this moment;
//   - ready: neither, so it can come on when a gate opens.
//
// The refractory period is a setting, off by default (SetRefractoryPeriod). Off, members are only active or ready.
//
// Every bond acts one moment later: what is active or refractory now decides what comes on next moment. Gates count
// active and refractory members alike.
//
// A state's gate opens for its ready members when the state's counted part is bigger than its missing part, so a
// part brings back the rest once more of the state is counted than missing. A transition's gate opens for a step
// when the step before is counted.
//
// Competition: two assemblies are rivals when they share a population but none of its members, so they explain the
// same input differently. A part is never a rival of its whole, since they share members. An assembly's support is its
// counted part minus its missing part. When rivals' gates would open in the same moment, the one with most support
// opens; if the most support is shared, the tie is held and none of the tied open. Nothing is turned off: a rival
// that loses simply doesn't open, and fades.

// Gate is one gate that opened for a member: the assembly it belongs to, and what it counted.
type Gate struct {
	Assembly Assembly
	Counted  int    // a state's gate: how many of the state's members it counted
	From     Member // a transition's gate: the step before
}

// Activation is a member coming on, and why.
type Activation struct {
	Member  Member
	Arrived bool   // from the world, as input; otherwise recalled
	Gates   []Gate // the gates that opened it, or that expected it if it arrived; none for unexpected input
}

// Outcome is how a rival came out of a competition.
type Outcome int

const (
	Won  Outcome = iota + 1 // most support among its rivals: its gates open
	Held                    // most support, but shared with a rival: the tie is held, and its gates don't open
	Lost                    // a rival had more support: its gates don't open
)

// Rival is one assembly in a competition.
type Rival struct {
	Assembly Assembly
	Counted  int
	Outcome  Outcome
}

// Competition is a group of rivals whose gates would have opened in the same moment.
type Competition struct {
	Rivals []Rival // in the order formed
}

// Moment is one moment of an invocation.
type Moment struct {
	Number     int // counted across the memory's whole life, not from the start of the invocation
	Input      []Population
	Active     []Activation // in the order members are numbered
	Refractory []Member
	// Unexplained are the populations with active members none of which belongs to an assembly: one of the three
	// counts of heat.
	Unexplained []Population
	// Competitions are the competitions decided for this moment. A held tie is another count of heat: unsettled.
	Competitions []Competition
}

// Completion is how much of one state was counted during an invocation.
type Completion struct {
	State Assembly
	Last  int // counted at the last moment
	Most  int // the most counted at any moment
}

// Invocation is what one invoke read, moment by moment, and how it ended.
type Invocation struct {
	Moments     []Moment
	Completions []Completion // every state with any member counted at any moment, in the order formed
	// RepeatsEvery is how many moments the memory takes to come back round, if it ended repeating: something is
	// holding. 0 if it ended because the next moment would be quiet.
	RepeatsEvery int
}

// Invoke reads input one moment at a time: each element of sequence is the populations that arrive together, a
// moment after the element before. After the input it carries on until the next moment would be quiet (nothing
// active or refractory) or would repeat an earlier moment of this invocation. It only reads, never changing what
// the memory knows. If any name isn't a population the whole invocation is refused and nothing happens.
func (m *Memory) Invoke(sequence [][]Name) (Invocation, error) {
	inputs, err := m.inputs(sequence)
	if err != nil {
		return Invocation{}, err
	}
	var invocation Invocation
	seen := map[string]int{}
	completions := m.startCompletions()
	record := func(moment Moment) {
		invocation.Moments = append(invocation.Moments, moment)
		seen[phasesKey(m.active, m.refractory)] = moment.Number
		completions.record(m)
	}
	for _, input := range inputs {
		record(m.step(m.upcoming(input)))
	}
	for {
		next := m.upcoming(nil)
		if next.active.isEmpty() && m.refractoryAfter().isEmpty() {
			break
		}
		if first, repeated := seen[phasesKey(next.active, m.refractoryAfter())]; repeated {
			invocation.RepeatsEvery = m.moment + 1 - first
			break
		}
		record(m.step(next))
	}
	invocation.Completions = completions.touched()
	return invocation, nil
}

// inputs looks up every population in sequence before anything runs.
func (m *Memory) inputs(sequence [][]Name) ([][]Population, error) {
	inputs := make([][]Population, 0, len(sequence))
	for _, names := range sequence {
		input := make([]Population, 0, len(names))
		for i, name := range names {
			if slices.Contains(names[:i], name) {
				return nil, RepeatedInputError{Population: name}
			}
			population, err := m.population(name)
			if err != nil {
				return nil, err
			}
			input = append(input, population)
		}
		inputs = append(inputs, input)
	}
	return inputs, nil
}

// nextMoment is what the next moment will be, worked out before the memory moves to it.
type nextMoment struct {
	input        []Population
	active       memberSet
	arrived      memberSet
	unexpected   map[Name]bool // input populations nothing expected, so all their ready members came on
	gates        map[int][]Gate
	competitions []Competition
}

// upcoming works out the next moment from the phases now and what arrives, without changing anything. Input a gate
// expects turns on only the members expected; input nothing expects turns on all the population's ready members.
func (m *Memory) upcoming(input []Population) nextMoment {
	gates, competitions := m.openGates(m.active.union(m.refractory))
	next := nextMoment{input: input, unexpected: map[Name]bool{}, gates: gates, competitions: competitions}
	for _, p := range input {
		var arriving []int
		for member := p.first; member < p.first+p.size; member++ {
			if _, expected := gates[member]; expected {
				arriving = append(arriving, member)
			}
		}
		if len(arriving) == 0 {
			next.unexpected[p.name] = true
			for member := p.first; member < p.first+p.size; member++ {
				if m.isReady(member) {
					arriving = append(arriving, member)
				}
			}
		}
		for _, member := range arriving {
			next.active.add(member)
			next.arrived.add(member)
		}
	}
	for member := range gates {
		next.active.add(member)
	}
	return next
}

// opening is an assembly whose gates would open this moment, before competition decides.
type opening struct {
	assembly Assembly
	counted  int
	gates    map[int]Gate // the gate it would open on each ready member
}

func (o opening) support() int { return o.counted - (len(o.assembly.members) - o.counted) }

// openGates finds, for each ready member, the gates that open on what is counted now, after competition.
func (m *Memory) openGates(counted memberSet) (map[int][]Gate, []Competition) {
	var openings []opening
	for _, a := range m.assemblies {
		if o := m.wouldOpen(a, counted); len(o.gates) > 0 {
			openings = append(openings, o)
		}
	}
	outcomes, competitions := compete(openings)
	gates := map[int][]Gate{}
	for i, o := range openings {
		if outcomes[i] != Won {
			continue
		}
		for _, member := range o.assembly.members {
			if gate, opens := o.gates[member.index()]; opens {
				gates[member.index()] = append(gates[member.index()], gate)
			}
		}
	}
	return gates, competitions
}

// wouldOpen finds the gates an assembly would open on its ready members, if nothing competed with it.
func (m *Memory) wouldOpen(a Assembly, counted memberSet) opening {
	o := opening{assembly: a, counted: countMembers(counted, a.members), gates: map[int]Gate{}}
	switch a.shape {
	case StateShape:
		if o.support() > 0 {
			for _, member := range a.members {
				if m.isReady(member.index()) {
					o.gates[member.index()] = Gate{Assembly: a, Counted: o.counted}
				}
			}
		}
	case TransitionShape:
		for i := 1; i < len(a.members); i++ {
			from, to := a.members[i-1], a.members[i]
			if counted.has(from.index()) && m.isReady(to.index()) {
				o.gates[to.index()] = Gate{Assembly: a, From: from}
			}
		}
	}
	return o
}

// compete decides each opening's outcome against its rivals among the openings, and reports each group of rivals.
// An opening with no rivals wins.
func compete(openings []opening) ([]Outcome, []Competition) {
	outcomes := make([]Outcome, len(openings))
	for i, o := range openings {
		outcomes[i] = Won
		for j, other := range openings {
			if i == j || !areRivals(o.assembly, other.assembly) {
				continue
			}
			switch {
			case other.support() > o.support():
				outcomes[i] = Lost
			case other.support() == o.support() && outcomes[i] == Won:
				outcomes[i] = Held
			}
		}
	}
	var competitions []Competition
	for _, group := range rivalGroups(openings) {
		competition := Competition{}
		for _, i := range group {
			competition.Rivals = append(competition.Rivals, Rival{Assembly: openings[i].assembly, Counted: openings[i].counted, Outcome: outcomes[i]})
		}
		competitions = append(competitions, competition)
	}
	return outcomes, competitions
}

// rivalGroups gathers openings joined by rivalry, directly or through others, leaving out those with no rivals.
func rivalGroups(openings []opening) [][]int {
	group := make([]int, len(openings))
	for i := range group {
		group[i] = -1
	}
	var groups [][]int
	for start := range openings {
		if group[start] >= 0 {
			continue
		}
		members := []int{start}
		group[start] = len(groups)
		for k := 0; k < len(members); k++ {
			for j := range openings {
				if group[j] < 0 && areRivals(openings[members[k]].assembly, openings[j].assembly) {
					group[j] = len(groups)
					members = append(members, j)
				}
			}
		}
		slices.Sort(members)
		groups = append(groups, members)
	}
	return slices.DeleteFunc(groups, func(g []int) bool { return len(g) < 2 })
}

// areRivals is true when two assemblies share a population but none of its members. Assemblies that share a member
// of a population read it the same way there, as a part does its whole.
func areRivals(a, b Assembly) bool {
	for _, x := range a.members {
		ofSamePopulation := membersOf(b, x.population)
		if len(ofSamePopulation) > 0 && !slices.ContainsFunc(ofSamePopulation, func(y Member) bool { return slices.Contains(a.members, y) }) {
			return true
		}
	}
	return false
}

// membersOf lists an assembly's members that belong to p.
func membersOf(a Assembly, p Population) []Member {
	var members []Member
	for _, member := range a.members {
		if member.population == p {
			members = append(members, member)
		}
	}
	return members
}

// isReady is true when the member can come on next moment: it isn't active now, so it won't be refractory then.
// With no refractory period, every member is ready.
func (m *Memory) isReady(member int) bool { return !m.refractoryAfter().has(member) }

// refractoryAfter is what will be refractory next moment: what is active now, if members have a refractory period.
func (m *Memory) refractoryAfter() memberSet {
	if !m.refractoryPeriod {
		return nil
	}
	return m.active
}

// step moves the memory to the next moment and reports it.
func (m *Memory) step(next nextMoment) Moment {
	m.moment++
	m.refractory = m.refractoryAfter()
	m.active = next.active
	m.unexpected = next.unexpected
	moment := Moment{Number: m.moment, Input: next.input, Competitions: next.competitions}
	for _, p := range m.populationOrder {
		for member := p.first; member < p.first+p.size; member++ {
			if m.active.has(member) {
				moment.Active = append(moment.Active, Activation{
					Member:  m.memberAt(p, member),
					Arrived: next.arrived.has(member),
					Gates:   next.gates[member],
				})
			}
			if m.refractory.has(member) {
				moment.Refractory = append(moment.Refractory, m.memberAt(p, member))
			}
		}
		if m.active.countIn(p) > 0 && m.active.intersection(m.assembled).countIn(p) == 0 {
			moment.Unexplained = append(moment.Unexplained, p)
		}
	}
	return moment
}

func (m *Memory) memberAt(p Population, index int) Member {
	return Member{population: p, number: index - p.first + 1}
}

func countMembers(set memberSet, members []Member) int {
	count := 0
	for _, member := range members {
		if set.has(member.index()) {
			count++
		}
	}
	return count
}

// phasesKey identifies a moment by which members are active and which refractory, to tell when the memory repeats.
func phasesKey(active, refractory memberSet) string {
	return active.key() + "|" + refractory.key()
}

// completions follows how much of each state is counted, moment by moment, through one invocation.
type completions []Completion

func (m *Memory) startCompletions() completions {
	var all completions
	for _, a := range m.assemblies {
		if a.shape == StateShape {
			all = append(all, Completion{State: a})
		}
	}
	return all
}

func (all completions) record(m *Memory) {
	counted := m.active.union(m.refractory)
	for i := range all {
		present := countMembers(counted, all[i].State.members)
		all[i].Last = present
		all[i].Most = max(all[i].Most, present)
	}
}

func (all completions) touched() []Completion {
	var touched []Completion
	for _, c := range all {
		if c.Most > 0 {
			touched = append(touched, c)
		}
	}
	return touched
}
