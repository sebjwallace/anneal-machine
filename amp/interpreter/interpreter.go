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
	// showPhases is whether invoke also prints each member's phase, moment by moment. It belongs to amp's display,
	// not to the memory, so it isn't saved.
	showPhases bool
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

// assembliesPerPage is how many assemblies one page lists: enough to scan, few enough to fit a terminal window.
const assembliesPerPage = 20

// NoSuchPageError: a page was asked for past the last.
type NoSuchPageError struct {
	Page, Pages int
}

func (e NoSuchPageError) Error() string {
	if e.Pages == 1 {
		return fmt.Sprintf("page %d doesn't exist: there is 1 page of assemblies", e.Page)
	}
	return fmt.Sprintf("page %d doesn't exist: there are %d pages of assemblies", e.Page, e.Pages)
}

// listAssemblies lists one page of every assembly, in the order formed.
func (in *Interpreter) listAssemblies(page int) (string, error) {
	all := in.memory.AllAssemblies()
	if len(all) == 0 {
		return "no assemblies yet", nil
	}
	pages := (len(all) + assembliesPerPage - 1) / assembliesPerPage
	if page > pages {
		return "", NoSuchPageError{Page: page, Pages: pages}
	}
	first := (page - 1) * assembliesPerPage
	shown := all[first:min(first+assembliesPerPage, len(all))]
	return printAssemblyList(shown, first, len(all), page, pages), nil
}

// set switches a setting, if asked, and says what it is now.
func (in *Interpreter) set(command settingCommand) string {
	on := command.change == turnOn
	switch command.setting {
	case refractorySetting:
		if command.change != showSetting {
			in.memory.SetRefractoryPeriod(on)
		}
		on = in.memory.HasRefractoryPeriod()
	case phasesSetting:
		if command.change != showSetting {
			in.showPhases = on
		}
		on = in.showPhases
	}
	return printSetting(command.setting, on)
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
		if in.showPhases {
			return printInvocation(invocation) + "\n\n" + printPhases(invocation, in.memory.Populations()), nil
		}
		return printInvocation(invocation), nil
	case inspectCommand:
		return in.inspect(st.name)
	case settingCommand:
		return in.set(st), nil
	case listAssembliesCommand:
		return in.listAssemblies(st.page)
	case budgetCommand:
		switch st.change {
		case turnOn:
			if err := in.memory.SetBudget(st.members); err != nil {
				return "", err
			}
		case turnOff:
			if err := in.memory.SetBudget(0); err != nil {
				return "", err
			}
		}
		return printBudget(in.memory.Budget()), nil
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
