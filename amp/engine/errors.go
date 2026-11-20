package engine

import "fmt"

// The reasons the engine refuses a request. Each is a value callers can match with errors.As.

// AlreadyDeclaredError: the name is taken. Nothing declared is ever replaced.
type AlreadyDeclaredError struct {
	Name Name
	As   Kind
}

func (e AlreadyDeclaredError) Error() string {
	return fmt.Sprintf("%s is already declared, as a %s", e.Name, e.As)
}

// TooFewMembersError: a population was asked for with fewer than one member.
type TooFewMembersError struct {
	Size int
}

func (e TooFewMembersError) Error() string {
	return fmt.Sprintf("a population needs at least 1 member, got %d", e.Size)
}

// UndeclaredError: a name was used that nothing was declared as.
type UndeclaredError struct {
	Name Name
}

func (e UndeclaredError) Error() string {
	return fmt.Sprintf("%s is not declared", e.Name)
}

// NotAPopulationError: a population was expected, and the name was declared as something else.
type NotAPopulationError struct {
	Name Name
	Is   Kind
}

func (e NotAPopulationError) Error() string {
	return fmt.Sprintf("%s is a %s, not a population", e.Name, e.Is)
}

// EmptyCommunityError: a community was asked for with no populations.
type EmptyCommunityError struct {
	Community Name
}

func (e EmptyCommunityError) Error() string {
	return fmt.Sprintf("community %s needs at least one population", e.Community)
}

// RepeatedPopulationError: a community listed the same population more than once.
type RepeatedPopulationError struct {
	Community  Name
	Population Name
}

func (e RepeatedPopulationError) Error() string {
	return fmt.Sprintf("%s appears twice in community %s", e.Population, e.Community)
}

// RepeatedInputError: the same population was given twice in one moment.
type RepeatedInputError struct {
	Population Name
}

func (e RepeatedInputError) Error() string {
	return fmt.Sprintf("%s appears twice in one moment", e.Population)
}
