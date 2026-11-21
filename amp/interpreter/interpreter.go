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
	file   string // the current file: the snapshot last opened or saved, which save on its own saves to
}

// NoFileToSaveError: save was given no file name, and no file has been opened or saved yet.
type NoFileToSaveError struct{}

func (NoFileToSaveError) Error() string {
	return "no file to save to yet: give one, as in save walkthrough.json"
}

func New(memory *engine.Memory) *Interpreter {
	return &Interpreter{memory: memory}
}

// inspect looks inside a population or an assembly.
func (in *Interpreter) inspect(name engine.Name) (string, error) {
	switch kind, _ := in.memory.KindOf(name); kind {
	case engine.AssemblyKind:
		assemblies, err := in.memory.Assemblies(name)
		if err != nil {
			return "", err
		}
		return printAssemblies(name, assemblies), nil
	case engine.CommunityKind:
		return "", NotInspectableError{Name: name, Is: kind}
	}
	inspection, err := in.memory.Inspect(name)
	if err != nil {
		return "", err
	}
	return printInspection(inspection), nil
}

// NotInspectableError: inspect looks inside populations and assemblies, and the name is something else.
type NotInspectableError struct {
	Name engine.Name
	Is   engine.Kind
}

func (e NotInspectableError) Error() string {
	return fmt.Sprintf("%s is a %s, not a population or an assembly", e.Name, e.Is)
}

// Open replaces the whole memory with the snapshot at path, makes it the current file, and says what it holds. If the
// snapshot can't be read, the memory and the current file are left as they were.
func (in *Interpreter) Open(path string) (string, error) {
	memory, err := snapshot.Open(path)
	if err != nil {
		return "", err
	}
	in.memory, in.file = memory, path
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
		populations, err := in.memory.DeclarePopulations(st.names, st.size)
		if err != nil {
			return "", err
		}
		lines := make([]string, len(populations))
		for i, population := range populations {
			lines[i] = printPopulation(population, in.memory.Individuals(population))
		}
		return strings.Join(lines, "\n"), nil
	case communityDeclaration:
		community, err := in.memory.DeclareCommunity(st.name, st.populations)
		if err != nil {
			return "", err
		}
		return printCommunity(community), nil
	case assemblyDeclaration:
		assemblies, err := in.memory.DeclareAssemblies(st.name, st.outlines)
		if err != nil {
			return "", err
		}
		return printAssemblyDeclaration(st.name, assemblies), nil
	case invokeCommand:
		invocation, err := in.memory.Invoke(st.moments)
		if err != nil {
			return "", err
		}
		return printInvocation(invocation), nil
	case inspectCommand:
		return in.inspect(st.name)
	case refractoryCommand:
		if st.setting != showRefractory {
			in.memory.SetRefractoryPeriod(st.setting == refractoryOn)
		}
		return printRefractory(in.memory.HasRefractoryPeriod()), nil
	case saveCommand:
		path := st.path
		if path == "" {
			path = in.file
		}
		if path == "" {
			return "", NoFileToSaveError{}
		}
		if err := snapshot.Save(path, in.memory); err != nil {
			return "", err
		}
		in.file = path
		return fmt.Sprintf("saved %s: %s", path, countDeclarations(in.memory)), nil
	case openCommand:
		return in.Open(st.path)
	}
	panic(fmt.Sprintf("interpreter: no way to run %T", st))
}
