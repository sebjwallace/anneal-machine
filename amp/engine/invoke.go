package engine

import "slices"

// Cause says why a population's members are active.
type Cause int

const (
	// NoCause: none of the population's members are active.
	NoCause Cause = iota
	// UnexpectedInput: the population arrived from the world with nothing predicting a member, so all its members
	// came on. No member has been chosen yet.
	UnexpectedInput
)

// Moment is one step of an invocation: what arrived, and what invoke couldn't account for.
type Moment struct {
	Number int
	Input  []Population // what arrived together, in the order given
	// Unexplained are the populations with active members that no assembly accounts for: one of the three counts
	// of heat. The other two, missing and unsettled, need assemblies.
	Unexplained []Population
}

// Complete is true when invoke accounted for everything active this moment.
func (m Moment) Complete() bool { return len(m.Unexplained) == 0 }

// Invocation is what one invoke read, moment by moment.
type Invocation struct {
	Moments []Moment
}

// Invoke reads input one moment at a time: each element of sequence is the populations that arrive together, a
// moment after the element before. It only reads, never changing what the memory knows. If any name isn't a
// population the whole invocation is refused and nothing becomes active.
func (m *Memory) Invoke(sequence [][]Name) (Invocation, error) {
	inputs, err := m.inputs(sequence)
	if err != nil {
		return Invocation{}, err
	}
	moments := make([]Moment, 0, len(inputs))
	for i, input := range inputs {
		moments = append(moments, m.step(i+1, input))
	}
	return Invocation{Moments: moments}, nil
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

// step advances one moment. No assemblies exist yet, so nothing holds activity from the moment before, nothing
// predicts a member, and nothing accounts for what arrives: every input population is unexpected and unexplained.
func (m *Memory) step(number int, input []Population) Moment {
	m.active.empty()
	clear(m.causes)
	for _, p := range input {
		m.active.addAll(p)
		m.causes[p.name] = UnexpectedInput
	}
	return Moment{Number: number, Input: input, Unexplained: m.unexplained()}
}

// unexplained lists, in the order declared, the populations with active members that no assembly accounts for.
// No assemblies exist yet, so that is every population with any member active.
func (m *Memory) unexplained() []Population {
	var unexplained []Population
	for _, p := range m.populationOrder {
		if m.active.countIn(p) > 0 {
			unexplained = append(unexplained, p)
		}
	}
	return unexplained
}
