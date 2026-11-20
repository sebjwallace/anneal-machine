package engine

// Inspection is a look inside one population, below the level the world speaks at. It only reads.
type Inspection struct {
	Population Population
	Active     int   // how many of its members are active now
	Cause      Cause // why they are active; NoCause when none are
}

func (m *Memory) Inspect(name Name) (Inspection, error) {
	population, err := m.population(name)
	if err != nil {
		return Inspection{}, err
	}
	return Inspection{
		Population: population,
		Active:     m.active.countIn(population),
		Cause:      m.causes[name],
	}, nil
}
