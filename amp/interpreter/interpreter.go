// Package interpreter reads AMP, carries it out on the engine's memory, and prints the result back in AMP.
package interpreter

import (
	"fmt"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/snapshot"
)

type Interpreter struct {
	memory *engine.Memory
}

func New(memory *engine.Memory) *Interpreter {
	return &Interpreter{memory: memory}
}

// Open replaces the whole memory with the snapshot at path, and says what it holds. If the snapshot can't be read,
// the memory is left as it was.
func (in *Interpreter) Open(path string) (string, error) {
	memory, err := snapshot.Open(path)
	if err != nil {
		return "", err
	}
	in.memory = memory
	return fmt.Sprintf("opened %s: %s", path, countDeclarations(memory)), nil
}

// Run reads one line of AMP, carries it out, and returns what to print back. A blank line does nothing.
// The error is a SyntaxError, the engine's reason for refusing, or why a file couldn't be saved or opened.
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
	case invokeCommand:
		invocation, err := in.memory.Invoke(st.moments)
		if err != nil {
			return "", err
		}
		return printInvocation(invocation), nil
	case inspectCommand:
		inspection, err := in.memory.Inspect(st.population)
		if err != nil {
			return "", err
		}
		return printInspection(inspection), nil
	case saveCommand:
		if err := snapshot.Save(st.path, in.memory); err != nil {
			return "", err
		}
		return fmt.Sprintf("saved %s: %s", st.path, countDeclarations(in.memory)), nil
	case openCommand:
		return in.Open(st.path)
	}
	panic(fmt.Sprintf("interpreter: no way to run %T", st))
}
