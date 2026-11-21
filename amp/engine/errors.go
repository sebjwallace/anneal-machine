package engine

import (
	"fmt"
	"strings"
)

// The reasons the engine refuses a request. Each is a value callers can match with errors.As.

// AlreadyDeclaredError: the name is taken. Nothing declared is ever replaced.
type AlreadyDeclaredError struct {
	Name Name
	As   Kind
}

func (e AlreadyDeclaredError) Error() string {
	return fmt.Sprintf("%s is already declared, as %s", e.Name, e.As.withArticle())
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
	return fmt.Sprintf("%s is %s, not a population", e.Name, e.Is.withArticle())
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

// NothingToAssembleError: an assembly was declared with no outline to form it from.
type NothingToAssembleError struct {
	Name Name
}

func (e NothingToAssembleError) Error() string {
	return fmt.Sprintf("%s has nothing to assemble", e.Name)
}

// TooSmallError: an assembly needs two members to point at each other, and a transition two steps to lead from one to
// the next.
type TooSmallError struct {
	Shape Shape
}

func (e TooSmallError) Error() string {
	if e.Shape == TransitionShape {
		return "a transition needs at least two steps"
	}
	return "an assembly needs at least two populations or parts"
}

// TooFewToRepeatError: a population appears more times in one assembly than it has members. Each time it appears
// takes a member of its own.
type TooFewToRepeatError struct {
	Population Name
	Size       int
	Times      int
}

func (e TooFewToRepeatError) Error() string {
	return fmt.Sprintf("%s has %d members, too few to appear %d times in one assembly", e.Population, e.Size, e.Times)
}

// NotAnAssemblyError: an assembly was expected, and the name was declared as something else.
type NotAnAssemblyError struct {
	Name Name
	Is   Kind
}

func (e NotAnAssemblyError) Error() string {
	return fmt.Sprintf("%s is %s, not an assembly", e.Name, e.Is.withArticle())
}

// RepeatedNameError: the same name was given twice in one declaration.
type RepeatedNameError struct {
	Name Name
}

func (e RepeatedNameError) Error() string {
	return fmt.Sprintf("%s appears twice in one declaration", e.Name)
}

// NegativeBudgetError: a budget below 0 was asked for. 0 means no budget.
type NegativeBudgetError struct {
	Budget int
}

func (e NegativeBudgetError) Error() string {
	return fmt.Sprintf("a budget can't be %d: give a number of members, or 0 for none", e.Budget)
}

// RepeatedPartError: the same assembly was named twice as a part of one assembly.
type RepeatedPartError struct {
	Part Name
}

func (e RepeatedPartError) Error() string {
	return fmt.Sprintf("%s is a part twice in one assembly", e.Part)
}

// NotAPopulationOrAssemblyError: an assembly was written with a name that is neither a population nor an assembly.
type NotAPopulationOrAssemblyError struct {
	Name Name
	Is   Kind
}

func (e NotAPopulationOrAssemblyError) Error() string {
	return fmt.Sprintf("%s is %s, not a population or an assembly", e.Name, e.Is.withArticle())
}

// TooFewToCompareError: compare was given fewer than two things.
type TooFewToCompareError struct{}

func (TooFewToCompareError) Error() string { return "compare needs at least two names" }

// GivenTwiceError: the same name was given twice to compare.
type GivenTwiceError struct {
	Name Name
}

func (e GivenTwiceError) Error() string { return fmt.Sprintf("%s is given twice", e.Name) }

// NotDecomposableError: braces were put on something that isn't an assembly. Braces take some of an assembly's
// members; a population's members are the engine's business.
type NotDecomposableError struct {
	Name Name
	Is   Kind
}

func (e NotDecomposableError) Error() string {
	return fmt.Sprintf("%s is %s, not an assembly: braces take some of an assembly's members", e.Name, e.Is.withArticle())
}

// NotInWholeError: braces asked for a population the assembly has no member of, or none left after the one before.
type NotInWholeError struct {
	Whole, Population Name
	After             Name // set when the population is there, but not after the one before it in the braces
}

func (e NotInWholeError) Error() string {
	if e.After != "" {
		return fmt.Sprintf("%s has no %s after %s", e.Whole, e.Population, e.After)
	}
	return fmt.Sprintf("%s has no member of %s", e.Whole, e.Population)
}

// TooFewNamesError: an intersection or a difference was asked of fewer than two things.
type TooFewNamesError struct {
	Operation string // "intersection" or "difference"
}

func (e TooFewNamesError) Error() string {
	if e.Operation == "anneal" {
		return "anneal needs at least two names"
	}
	return fmt.Sprintf("a%s %s needs at least two names", article(e.Operation), e.Operation)
}

// SourceError: an intersection or a difference takes its members from the first name, which wasn't an assembly.
type SourceError struct {
	Operation string
	Name      Name
	Is        Kind
}

func (e SourceError) Error() string {
	return fmt.Sprintf("a%s %s takes its members from the first name, and %s is %s, not an assembly", article(e.Operation), e.Operation, e.Name, e.Is.withArticle())
}

// FormedTooSmallError: what an intersection or a difference leaves is too little to form an assembly from.
type FormedTooSmallError struct {
	Operation string
	Result    []Name
}

func (e FormedTooSmallError) Error() string {
	if len(e.Result) == 0 {
		return fmt.Sprintf("the %s is empty", e.Operation)
	}
	return fmt.Sprintf("the %s is %s; an assembly needs at least two populations", e.Operation, e.Result[0])
}

// article is "n" before a word starting with a vowel, so "an intersection" and "a difference" read right.
func article(word string) string {
	if word != "" && strings.ContainsRune("aeiou", rune(word[0])) {
		return "n"
	}
	return ""
}

// AnnealSourceError: anneal compares stored wholes, and a name wasn't an assembly.
type AnnealSourceError struct {
	Name Name
	Is   Kind
}

func (e AnnealSourceError) Error() string {
	return fmt.Sprintf("anneal compares assemblies, and %s is %s", e.Name, e.Is.withArticle())
}

// NoSuchAssemblyError: an assembly was asked for by a number nothing has.
type NoSuchAssemblyError struct {
	ID AssemblyID
}

func (e NoSuchAssemblyError) Error() string { return fmt.Sprintf("there is no #%d", e.ID) }
