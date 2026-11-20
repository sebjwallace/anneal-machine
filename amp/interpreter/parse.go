package interpreter

import (
	"fmt"
	"strconv"
	"strings"
	"unicode"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// A statement is one line of AMP, read and checked, ready to be carried out.
type statement interface{ isStatement() }

// name = population size
type populationDeclaration struct {
	name engine.Name
	size int
}

// name = community population, population, ...
type communityDeclaration struct {
	name        engine.Name
	populations []engine.Name
}

// name = <c, a, t> ; c -> a -> t: one or more assemblies, given one name, sharing members.
type assemblyDeclaration struct {
	name     engine.Name
	outlines []engine.Outline
}

// invoke c, {a, t}: commas separate moments, braces hold what arrives together in one moment.
type invokeCommand struct {
	moments [][]engine.Name
}

// inspect c
type inspectCommand struct {
	name engine.Name
}

// save walkthrough.json
type saveCommand struct {
	path string
}

// open walkthrough.json
type openCommand struct {
	path string
}

func (populationDeclaration) isStatement() {}
func (communityDeclaration) isStatement()  {}
func (assemblyDeclaration) isStatement()   {}
func (invokeCommand) isStatement()         {}
func (inspectCommand) isStatement()        {}
func (saveCommand) isStatement()           {}
func (openCommand) isStatement()           {}

// SyntaxError: the line isn't AMP the interpreter can read.
type SyntaxError struct {
	Message string
}

func (e SyntaxError) Error() string { return e.Message }

func syntaxError(format string, args ...any) SyntaxError {
	return SyntaxError{Message: fmt.Sprintf(format, args...)}
}

func parse(line string) (statement, error) {
	if st, isFileCommand, err := parseFileCommand(line); isFileCommand {
		return st, err
	}
	tokens, err := scan(line)
	if err != nil {
		return nil, err
	}
	p := &parser{tokens: tokens}
	st, err := p.statement()
	if err != nil {
		return nil, err
	}
	if extra := p.take(); extra.kind != endToken {
		return nil, syntaxError("unexpected %s at the end of the line", extra.text)
	}
	return st, nil
}

// parseFileCommand reads save and open, which take the rest of the line as a file name, so it can hold any
// character. Followed by "=", the words are names being declared instead.
func parseFileCommand(line string) (statement, bool, error) {
	trimmed := strings.TrimSpace(line)
	end := strings.IndexFunc(trimmed, unicode.IsSpace)
	if end < 0 {
		end = len(trimmed)
	}
	command, path := trimmed[:end], strings.TrimSpace(trimmed[end:])
	if (command != "save" && command != "open") || strings.HasPrefix(path, "=") {
		return nil, false, nil
	}
	if path == "" {
		return nil, true, syntaxError("expected a file name after %q", command)
	}
	if command == "save" {
		return saveCommand{path: path}, true, nil
	}
	return openCommand{path: path}, true, nil
}

type parser struct {
	tokens []token
	next   int
}

// take returns the next token and moves past it. Past the last token it keeps returning the end.
func (p *parser) take() token {
	if p.next == len(p.tokens) {
		return token{kind: endToken}
	}
	t := p.tokens[p.next]
	p.next++
	return t
}

func (p *parser) peekIs(kind tokenKind) bool {
	return p.next < len(p.tokens) && p.tokens[p.next].kind == kind
}

// statement reads a command or a declaration. Command words aren't reserved: followed by "=", they are names.
func (p *parser) statement() (statement, error) {
	first := p.take()
	declaring := p.peekIs(equalsToken)
	switch {
	case first.is("invoke") && !declaring:
		return p.invoke()
	case first.is("inspect") && !declaring:
		return p.inspect()
	case p.startsOutline(first):
		return nil, syntaxError("an assembly written by hand needs a name, as in cat = <c, a, t>")
	case first.kind == wordToken:
		return p.declaration(engine.Name(first.text))
	default:
		return nil, syntaxError("expected a command or a name to declare%s", got(first))
	}
}

func (p *parser) declaration(name engine.Name) (statement, error) {
	if equals := p.take(); equals.kind != equalsToken {
		return nil, syntaxError("expected \"=\" after %s%s", name, got(equals))
	}
	switch first := p.take(); {
	case p.startsOutline(first):
		return p.assemblies(name, first)
	case first.is("population"):
		return p.population(name)
	case first.is("community"):
		return p.community(name)
	default:
		return nil, syntaxError("expected \"population\", \"community\", a state or a transition after \"=\"%s", got(first))
	}
}

// startsOutline is true when first begins a state (<) or a transition (a name followed by ->).
func (p *parser) startsOutline(first token) bool {
	return first.kind == openAngleToken || (first.kind == wordToken && p.peekIs(arrowToken))
}

// assemblies reads one or more outlines separated by semicolons, starting from first.
func (p *parser) assemblies(name engine.Name, first token) (statement, error) {
	var outlines []engine.Outline
	for {
		outline, err := p.outline(first)
		if err != nil {
			return nil, err
		}
		outlines = append(outlines, outline)
		if !p.peekIs(semicolonToken) {
			return assemblyDeclaration{name: name, outlines: outlines}, nil
		}
		p.take()
		if first = p.take(); !p.startsOutline(first) {
			return nil, syntaxError("expected a state or a transition after \";\"%s", got(first))
		}
	}
}

// outline reads a state, <c, a, t>, or a transition, c -> a -> t, starting from first.
func (p *parser) outline(first token) (engine.Outline, error) {
	if first.kind == openAngleToken {
		populations, err := p.names(`"<"`)
		if err != nil {
			return engine.Outline{}, err
		}
		if closing := p.take(); closing.kind != closeAngleToken {
			return engine.Outline{}, syntaxError("expected \",\" or \">\" after %s%s", populations[len(populations)-1], got(closing))
		}
		return engine.Outline{Shape: engine.StateShape, Populations: populations}, nil
	}
	steps := []engine.Name{engine.Name(first.text)}
	for p.peekIs(arrowToken) {
		p.take()
		step := p.take()
		if step.kind != wordToken {
			return engine.Outline{}, syntaxError("expected a population name after \"->\"%s", got(step))
		}
		steps = append(steps, engine.Name(step.text))
	}
	return engine.Outline{Shape: engine.TransitionShape, Populations: steps}, nil
}

func (p *parser) population(name engine.Name) (statement, error) {
	size := p.take()
	if size.kind != numberToken {
		return nil, syntaxError("expected a number of members after \"population\"%s", got(size))
	}
	n, err := strconv.Atoi(size.text)
	if err != nil {
		return nil, syntaxError("%s is too large a number of members", size.text)
	}
	return populationDeclaration{name: name, size: n}, nil
}

func (p *parser) community(name engine.Name) (statement, error) {
	populations, err := p.names(`"community"`)
	if err != nil {
		return nil, err
	}
	return communityDeclaration{name: name, populations: populations}, nil
}

// invoke reads one or more moments separated by commas. A moment is a population, or several in braces.
func (p *parser) invoke() (statement, error) {
	var moments [][]engine.Name
	after := `"invoke"`
	for {
		moment, err := p.moment(after)
		if err != nil {
			return nil, err
		}
		moments = append(moments, moment)
		if !p.peekIs(commaToken) {
			return invokeCommand{moments: moments}, nil
		}
		p.take()
		after = `","`
	}
}

func (p *parser) moment(after string) ([]engine.Name, error) {
	first := p.take()
	switch first.kind {
	case wordToken:
		return []engine.Name{engine.Name(first.text)}, nil
	case openBraceToken:
		together, err := p.names(`"{"`)
		if err != nil {
			return nil, err
		}
		if closing := p.take(); closing.kind != closeBraceToken {
			return nil, syntaxError("expected \",\" or \"}\" after %s%s", together[len(together)-1], got(closing))
		}
		return together, nil
	default:
		return nil, syntaxError("expected a population or \"{\" after %s%s", after, got(first))
	}
}

func (p *parser) inspect() (statement, error) {
	name := p.take()
	if name.kind != wordToken {
		return nil, syntaxError("expected a population name after \"inspect\"%s", got(name))
	}
	return inspectCommand{name: engine.Name(name.text)}, nil
}

// names reads one or more names separated by commas, the first coming after the given token.
func (p *parser) names(after string) ([]engine.Name, error) {
	var names []engine.Name
	for {
		name := p.take()
		if name.kind != wordToken {
			return nil, syntaxError("expected a population name after %s%s", after, got(name))
		}
		names = append(names, engine.Name(name.text))
		if !p.peekIs(commaToken) {
			return names, nil
		}
		p.take()
		after = `","`
	}
}

// got says what was found instead, for an error message. At the end of the line there is nothing to say.
func got(t token) string {
	if t.kind == endToken {
		return ""
	}
	return ", got " + t.text
}

type tokenKind int

const (
	endToken tokenKind = iota
	wordToken
	numberToken
	equalsToken
	commaToken
	openBraceToken
	closeBraceToken
	openAngleToken
	closeAngleToken
	arrowToken
	semicolonToken
)

type token struct {
	kind tokenKind
	text string
}

func (t token) is(word string) bool { return t.kind == wordToken && t.text == word }

var symbols = map[rune]tokenKind{
	'=': equalsToken,
	',': commaToken,
	'{': openBraceToken,
	'}': closeBraceToken,
	'<': openAngleToken,
	'>': closeAngleToken,
	'⟨': openAngleToken, // as the docs write states; printed back as < >
	'⟩': closeAngleToken,
	';': semicolonToken,
}

// scan splits a line into words, numbers and symbols.
func scan(line string) ([]token, error) {
	var tokens []token
	runes := []rune(line)
	for i := 0; i < len(runes); {
		r := runes[i]
		symbol, isSymbol := symbols[r]
		switch {
		case unicode.IsSpace(r):
			i++
		case r == '-' && i+1 < len(runes) && runes[i+1] == '>':
			tokens = append(tokens, token{kind: arrowToken, text: "->"})
			i += 2
		case isSymbol:
			tokens = append(tokens, token{kind: symbol, text: string(r)})
			i++
		case unicode.IsDigit(r):
			end := scanWhile(runes, i, unicode.IsDigit)
			tokens = append(tokens, token{kind: numberToken, text: string(runes[i:end])})
			i = end
		case isWordStart(r):
			end := scanWhile(runes, i, isWordPart)
			tokens = append(tokens, token{kind: wordToken, text: string(runes[i:end])})
			i = end
		default:
			return nil, syntaxError("unexpected character %q", string(r))
		}
	}
	return tokens, nil
}

func scanWhile(runes []rune, from int, keep func(rune) bool) int {
	end := from
	for end < len(runes) && keep(runes[end]) {
		end++
	}
	return end
}

func isWordStart(r rune) bool { return unicode.IsLetter(r) || r == '_' }
func isWordPart(r rune) bool  { return isWordStart(r) || unicode.IsDigit(r) }
