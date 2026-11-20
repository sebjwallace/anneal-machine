package interpreter

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// c: 8 members, c{1..8}, all individuals
func printPopulation(p engine.Population, individuals int) string {
	return fmt.Sprintf("%s: %s, %s, %s", p.Name(), countMembers(p.Size()), memberRange(p), describeIndividuals(individuals, p.Size()))
}

// letters: c, a, t (24 members)
func printCommunity(c engine.Community) string {
	return fmt.Sprintf("%s: %s (%s)", c.Name(), strings.Join(populationNames(c.Populations()), ", "), countMembers(c.Size()))
}

func countMembers(n int) string { return countOf(n, "member", "members") }

// memberRange writes every member of p with its population: c{1..8}, or x{1} for a population of one.
func memberRange(p engine.Population) string {
	if p.Size() == 1 {
		return fmt.Sprintf("%s{1}", p.Name())
	}
	return fmt.Sprintf("%s{1..%d}", p.Name(), p.Size())
}

func describeIndividuals(individuals, size int) string {
	if individuals == size {
		return "all individuals"
	}
	return fmt.Sprintf("%d individuals", individuals)
}

// moment 1   c        incomplete   heat !c
// moment 2   a        incomplete   heat !a
//
// Inputs are padded into one column, so what invoke found lines up.
func printInvocation(invocation engine.Invocation) string {
	inputs := make([]string, len(invocation.Moments))
	inputWidth := 9
	for i, moment := range invocation.Moments {
		inputs[i] = writeTogether(moment.Input)
		inputWidth = max(inputWidth, len([]rune(inputs[i]))+3)
	}
	numberWidth := len(strconv.Itoa(len(invocation.Moments)))
	lines := make([]string, len(invocation.Moments))
	for i, moment := range invocation.Moments {
		line := fmt.Sprintf("moment %-*d   %s%s", numberWidth, moment.Number, padRight(inputs[i], inputWidth), describeMoment(moment))
		lines[i] = strings.TrimRight(line, " ")
	}
	return strings.Join(lines, "\n")
}

// writeTogether writes populations that arrived in one moment: c alone, {c, a, t} together, ∅ for nothing.
func writeTogether(populations []engine.Population) string {
	switch len(populations) {
	case 0:
		return "∅"
	case 1:
		return string(populations[0].Name())
	}
	return "{" + strings.Join(populationNames(populations), ", ") + "}"
}

// describeMoment says what invoke found: nothing to add if it accounted for everything, otherwise the heat.
func describeMoment(moment engine.Moment) string {
	if moment.Complete() {
		return ""
	}
	hot := make([]string, len(moment.Unexplained))
	for i, p := range moment.Unexplained {
		hot[i] = "!" + string(p.Name())
	}
	return "incomplete   heat " + strings.Join(hot, ", ")
}

// c: 8 members; active: all 8 (unexpected input, no member chosen yet)
func printInspection(inspection engine.Inspection) string {
	p := inspection.Population
	return fmt.Sprintf("%s: %s; active: %s", p.Name(), countMembers(p.Size()), describeActive(inspection))
}

func describeActive(inspection engine.Inspection) string {
	switch inspection.Cause {
	case engine.NoCause:
		return "none"
	case engine.UnexpectedInput:
		return fmt.Sprintf("%s (unexpected input, no member chosen yet)", countActive(inspection))
	}
	panic(fmt.Sprintf("interpreter: no way to describe cause %d", inspection.Cause))
}

func countActive(inspection engine.Inspection) string {
	if inspection.Active == inspection.Population.Size() {
		return fmt.Sprintf("all %d", inspection.Active)
	}
	return strconv.Itoa(inspection.Active)
}

func populationNames(populations []engine.Population) []string {
	names := make([]string, len(populations))
	for i, p := range populations {
		names[i] = string(p.Name())
	}
	return names
}

func padRight(text string, width int) string {
	return text + strings.Repeat(" ", max(0, width-len([]rune(text))))
}

// 3 populations, 1 community
func countDeclarations(memory *engine.Memory) string {
	return countOf(len(memory.Populations()), "population", "populations") + ", " +
		countOf(len(memory.Communities()), "community", "communities")
}

func countOf(n int, one, many string) string {
	if n == 1 {
		return "1 " + one
	}
	return fmt.Sprintf("%d %s", n, many)
}
