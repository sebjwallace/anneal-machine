package engine

import "slices"

// Every member is in one of three phases (the owner's terms):
//
//   - active: on this moment;
//   - refractory: it was active the moment before, so it can't come on this moment;
//   - ready: neither, so it can come on when a gate opens.
//
// Every bond acts one moment later: what is active or refractory now decides what comes on next moment. Gates count
// active and refractory members alike.
//
// A state's gate opens for its ready members when the state's counted part is bigger than its missing part, so a
// part brings back the rest once more of the state is counted than missing. A transition's gate opens for a step
// when the step before is counted.

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

// Moment is one moment of an invocation.
type Moment struct {
	Number     int // counted across the memory's whole life, not from the start of the invocation
	Input      []Population
	Active     []Activation // in the order members are numbered
	Refractory []Member
	// Unexplained are the populations with active members none of which belongs to an assembly: one of the three
	// counts of heat.
	Unexplained []Population
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
		if next.active.isEmpty() && m.active.isEmpty() {
			break
		}
		if first, repeated := seen[phasesKey(next.active, m.active)]; repeated {
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
	input      []Population
	active     memberSet
	arrived    memberSet
	unexpected map[Name]bool // input populations nothing expected, so all their ready members came on
	gates      map[int][]Gate
}

// upcoming works out the next moment from the phases now and what arrives, without changing anything. Input a gate
// expects turns on only the members expected; input nothing expects turns on all the population's ready members.
func (m *Memory) upcoming(input []Population) nextMoment {
	gates := m.openGates(m.active.union(m.refractory))
	next := nextMoment{input: input, unexpected: map[Name]bool{}, gates: gates}
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

// openGates finds, for each ready member, the gates that open on what is counted now.
func (m *Memory) openGates(counted memberSet) map[int][]Gate {
	gates := map[int][]Gate{}
	for _, a := range m.assemblies {
		switch a.shape {
		case StateShape:
			present := countMembers(counted, a.members)
			if present > len(a.members)-present {
				for _, member := range a.members {
					if m.isReady(member.index()) {
						gates[member.index()] = append(gates[member.index()], Gate{Assembly: a, Counted: present})
					}
				}
			}
		case TransitionShape:
			for i := 1; i < len(a.members); i++ {
				from, to := a.members[i-1], a.members[i]
				if counted.has(from.index()) && m.isReady(to.index()) {
					gates[to.index()] = append(gates[to.index()], Gate{Assembly: a, From: from})
				}
			}
		}
	}
	return gates
}

// isReady is true when the member can come on next moment: it isn't active now, so it won't be refractory then.
func (m *Memory) isReady(member int) bool { return !m.active.has(member) }

// step moves the memory to the next moment and reports it.
func (m *Memory) step(next nextMoment) Moment {
	m.moment++
	m.refractory = m.active
	m.active = next.active
	m.unexpected = next.unexpected
	moment := Moment{Number: m.moment, Input: next.input}
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
