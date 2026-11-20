// Package interpreter reads AMP, carries it out on the engine's memory, and prints the result back in AMP.
package interpreter

import (
	"fmt"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

type Interpreter struct {
	memory *engine.Memory
}

func New(memory *engine.Memory) *Interpreter {
	return &Interpreter{memory: memory}
}

// Run reads one line of AMP, carries it out, and returns what to print back. A blank line does nothing.
// The error is either a SyntaxError or the engine's reason for refusing.
func (in *Interpreter) Run(line string) (string, error) {
	if strings.TrimSpace(line) == "" {
		return "", nil
	}
	st, err := parse(line)
	if err != nil {
		return "", err
	}
	switch st := st.(type) {
	case populationDeclaration:
		population, err := in.memory.DeclarePopulation(st.name, st.size)
		if err != nil {
			return "", err
		}
		return printPopulation(population, in.memory.Individuals(population)), nil
	case communityDeclaration:
		community, err := in.memory.DeclareCommunity(st.name, st.populations)
		if err != nil {
			return "", err
		}
		return printCommunity(community), nil
	}
	panic(fmt.Sprintf("interpreter: no way to run %T", st))
}
