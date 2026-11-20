package engine

// Inspection is a look inside one population, below the level the world speaks at. It only reads.
type Inspection struct {
	Population Population
	Active     []Member
	Refractory []Member
	// Unexpected is true when the active members arrived this moment with nothing expecting them, so all the
	// population's ready members came on and no member has been chosen yet.
	Unexpected bool
}

func (m *Memory) Inspect(name Name) (Inspection, error) {
	population, err := m.population(name)
	if err != nil {
		return Inspection{}, err
	}
	inspection := Inspection{Population: population, Unexpected: m.unexpected[name]}
	for member := population.first; member < population.first+population.size; member++ {
		if m.active.has(member) {
			inspection.Active = append(inspection.Active, m.memberAt(population, member))
		}
		if m.refractory.has(member) {
			inspection.Refractory = append(inspection.Refractory, m.memberAt(population, member))
		}
	}
	return inspection, nil
}
