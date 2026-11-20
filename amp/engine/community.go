package engine

import "slices"

// Community is a fixed grouping of populations, declared once.
type Community struct {
	name        Name
	populations []Population
}

func (c Community) Name() Name { return c.name }

// Populations are the community's populations, in the order they were declared in it.
func (c Community) Populations() []Population { return slices.Clone(c.populations) }

// Size is the number of members across all the community's populations.
func (c Community) Size() int {
	size := 0
	for _, p := range c.populations {
		size += p.size
	}
	return size
}

// DeclareCommunity groups already-declared populations under a new name. Each population may appear only once.
func (m *Memory) DeclareCommunity(name Name, populationNames []Name) (Community, error) {
	if err := m.refuseRedeclaration(name); err != nil {
		return Community{}, err
	}
	if len(populationNames) == 0 {
		return Community{}, EmptyCommunityError{Community: name}
	}
	populations := make([]Population, 0, len(populationNames))
	for i, populationName := range populationNames {
		if slices.Contains(populationNames[:i], populationName) {
			return Community{}, RepeatedPopulationError{Community: name, Population: populationName}
		}
		population, err := m.population(populationName)
		if err != nil {
			return Community{}, err
		}
		populations = append(populations, population)
	}
	community := Community{name: name, populations: populations}
	m.communities[name] = community
	return community, nil
}
