package interpreter

import (
	"fmt"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// c: 8 members, c{1..8}, all individuals
func printPopulation(p engine.Population, individuals int) string {
	return fmt.Sprintf("%s: %s, %s, %s", p.Name(), countMembers(p.Size()), memberRange(p), describeIndividuals(individuals, p.Size()))
}

// letters: c, a, t (24 members)
func printCommunity(c engine.Community) string {
	names := make([]string, 0, len(c.Populations()))
	for _, p := range c.Populations() {
		names = append(names, string(p.Name()))
	}
	return fmt.Sprintf("%s: %s (%s)", c.Name(), strings.Join(names, ", "), countMembers(c.Size()))
}

func countMembers(n int) string {
	if n == 1 {
		return "1 member"
	}
	return fmt.Sprintf("%d members", n)
}

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
