package interpreter

import (
	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// These let other tools, such as AMT, read and write AMP exactly as the interpreter does.

// ParseInvokeInput reads what follows "invoke": c, {a, t}.
func ParseInvokeInput(input string) ([][]engine.Name, error) {
	st, err := parse("invoke " + input)
	if err != nil {
		return nil, err
	}
	invoke, ok := st.(invokeCommand)
	if !ok {
		return nil, syntaxError("expected the input for invoke, as in c, {a, t}")
	}
	return invoke.moments, nil
}

// PrintInvocation writes an invocation as the interpreter prints it: a header line, one line per moment, then the
// summary.
func PrintInvocation(invocation engine.Invocation) string { return printInvocation(invocation) }

// WriteAssembly writes an assembly at the population level: <c, a, t> for a state, c -> a -> t for a transition.
func WriteAssembly(a engine.Assembly) string { return writeShape(a.Shape(), namesOf(a.Populations())) }

// WriteMember writes one member: c{3}.
func WriteMember(member engine.Member) string { return writeMember(member) }
