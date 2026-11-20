package engine

// Population is a fixed group of members, declared once. Its members are numbered within it, from 1.
type Population struct {
	name  Name
	size  int
	first int // where its members start in the engine's numbering across every population
}

func (p Population) Name() Name { return p.name }

// Size is the number of members.
func (p Population) Size() int { return p.size }

// DeclarePopulation adds a population of size members. It is refused if the name is taken or size is below 1.
func (m *Memory) DeclarePopulation(name Name, size int) (Population, error) {
	if err := m.refuseRedeclaration(name); err != nil {
		return Population{}, err
	}
	if size < 1 {
		return Population{}, TooFewMembersError{Size: size}
	}
	population := Population{name: name, size: size, first: m.members}
	m.populations[name] = population
	m.populationOrder = append(m.populationOrder, population)
	m.members += size
	return population, nil
}

// Individuals counts the members of p that belong to no assembly. No assemblies exist yet, so every member is one.
func (m *Memory) Individuals(p Population) int {
	return p.size
}

// population looks up name, which must have been declared as a population.
func (m *Memory) population(name Name) (Population, error) {
	if population, ok := m.populations[name]; ok {
		return population, nil
	}
	if kind, declared := m.kindOf(name); declared {
		return Population{}, NotAPopulationError{Name: name, Is: kind}
	}
	return Population{}, UndeclaredError{Name: name}
}
