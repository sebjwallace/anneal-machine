package interpreter

import (
	"fmt"
	"slices"
	"strconv"
	"strings"
	"unicode"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// A statement is one line of AMP, read and checked, ready to be carried out.
type statement interface{ isStatement() }

// name = population size, or a, b, c = population size for several at once
type populationDeclaration struct {
	names []engine.Name
	size  int
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

// the = intersection thedog, thecat: what they share; dog = difference thedog, the: what the first has that the rest
// don't. Either is formed as a new assembly beside them, from the first name's members.
type setDeclaration struct {
	operation setOperation
	name      engine.Name
	of        []engine.Name
}

type setOperation string

const (
	intersection setOperation = "intersection"
	difference   setOperation = "difference"
)

// compare thedog, thecat: what they share and how they differ, by population
type compareCommand struct {
	names []engine.Name
}

// reset: let go of all activity
type resetCommand struct{}

// budget 4, budget off, or budget alone to show it
type budgetCommand struct {
	change  settingChange
	members int // for turnOn: how many members of each population recall may have active
}

// assemblies, or assemblies 2 for the second page
type listAssembliesCommand struct {
	page int // from 1
}

// refractory on, phases off, or a setting's name alone to show it
type settingCommand struct {
	setting setting
	change  settingChange
}

// setting is something switched on or off.
type setting string

const (
	refractorySetting setting = "refractory" // whether members have a refractory period (the memory's, saved with it)
	phasesSetting     setting = "phases"     // whether invoke also prints each member's phase (amp's display only)
)

type settingChange int

const (
	showSetting settingChange = iota
	turnOn
	turnOff
)

// save walkthrough.json, or save alone for the current file
type saveCommand struct {
	path string // empty for the current file
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
func (settingCommand) isStatement()        {}
func (listAssembliesCommand) isStatement() {}
func (budgetCommand) isStatement()         {}
func (resetCommand) isStatement()          {}
func (compareCommand) isStatement()        {}
func (setDeclaration) isStatement()        {}
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
	if path == "" && command == "open" {
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

// peekAfterIs looks one token past the next.
func (p *parser) peekAfterIs(kind tokenKind) bool {
	return p.next+1 < len(p.tokens) && p.tokens[p.next+1].kind == kind
}

// statement reads a command or a declaration. Command words aren't reserved: followed by "=", they are names.
func (p *parser) statement() (statement, error) {
	first := p.take()
	declaring := p.peekIs(equalsToken) || p.peekIs(commaToken)
	switch {
	case first.isKeyword("invoke", "inv") && !declaring:
		return p.invoke()
	case first.isKeyword("inspect", "insp") && !declaring:
		return p.inspect()
	case first.is("compare") && !declaring:
		return p.compare()
	case first.is("reset") && !declaring:
		return resetCommand{}, nil
	case first.is("budget") && !declaring:
		return p.budget()
	case first.is("assemblies") && !declaring:
		return p.listAssemblies()
	case first.is(string(refractorySetting)) && !declaring:
		return p.setting(refractorySetting)
	case first.is(string(phasesSetting)) && !declaring:
		return p.setting(phasesSetting)
	case p.startsOutline(first):
		return nil, syntaxError("an assembly written by hand needs a name, as in cat = <c, a, t>")
	case first.kind == wordToken:
		names, err := p.declaredNames(first)
		if err != nil {
			return nil, err
		}
		return p.declaration(names)
	default:
		return nil, syntaxError("expected a command or a name to declare%s", got(first))
	}
}

// declaredNames reads the names on the left of "=": one, or several separated by commas. A name given twice is
// declared once (the owner asked for this to be forgiving).
func (p *parser) declaredNames(first token) ([]engine.Name, error) {
	names := []engine.Name{engine.Name(first.text)}
	for p.peekIs(commaToken) {
		p.take()
		name := p.take()
		if name.kind != wordToken {
			return nil, syntaxError("expected a name after \",\"%s", got(name))
		}
		if !slices.Contains(names, engine.Name(name.text)) {
			names = append(names, engine.Name(name.text))
		}
	}
	return names, nil
}

func (p *parser) declaration(names []engine.Name) (statement, error) {
	last := names[len(names)-1]
	if equals := p.take(); equals.kind != equalsToken {
		return nil, syntaxError("expected \"=\" after %s%s", last, got(equals))
	}
	first := p.take()
	outline := p.startsOutline(first)
	if !outline && first.isKeyword("population", "pop") {
		return p.population(names)
	}
	if len(names) > 1 {
		return nil, syntaxError("only populations can be declared several at once")
	}
	switch name := names[0]; {
	case outline:
		return p.assemblies(name, first)
	case first.isKeyword("community", "com"):
		return p.community(name)
	case first.isKeyword("intersection", "intr"), first.isKeyword("difference", "diff"):
		of, err := p.nameList(fmt.Sprintf("%q", first.text))
		if err != nil {
			return nil, err
		}
		operation := intersection
		if first.isKeyword("difference", "diff") {
			operation = difference
		}
		return setDeclaration{operation: operation, name: name, of: of}, nil
	default:
		return nil, syntaxError("expected \"population\", \"community\", \"intersection\", \"difference\", an assembly or a transition after \"=\"%s", got(first))
	}
}

// startsOutline is true when first begins a state (<) or a transition: a name followed by -> or by braces.
func (p *parser) startsOutline(first token) bool {
	return first.kind == openAngleToken || (first.kind == wordToken && (p.peekIs(arrowToken) || p.peekIs(openBraceToken)))
}

// assemblies reads one or more outlines separated by semicolons, starting from first.
func (p *parser) assemblies(name engine.Name, first token) (statement, error) {
	var outlines []engine.Outline
	for {
		outline, err := p.outline(first)
		if err != nil {
			return nil, err
		}
		outlines = append(outlines, outline...)
		if !p.peekIs(semicolonToken) {
			return assemblyDeclaration{name: name, outlines: outlines}, nil
		}
		p.take()
		if first = p.take(); !p.startsOutline(first) {
			return nil, syntaxError("expected a state or a transition after \";\"%s", got(first))
		}
	}
}

// written collects the names of an outline as written, each with any braces: cat{c, a} takes just those members of cat.
type written struct {
	names []engine.Name
	only  [][]engine.Name
}

func (w *written) add(name engine.Name, only []engine.Name) {
	w.names = append(w.names, name)
	w.only = append(w.only, only)
}

// last writes the last name as it was written, for an error message.
func (w written) last() string {
	return writeOutlineName(w.names[len(w.names)-1], w.only[len(w.only)-1])
}

func (w written) outline(shape engine.Shape) engine.Outline {
	return engine.Outline{Shape: shape, Names: w.names, Only: w.only}
}

// outline reads a state, <c, a, t>; a transition, c -> a -> t; or both at once over the same populations,
// <c -> a -> t>, which is short for <c, a, t> ; c -> a -> t (the owner's notation). It starts from first. Any name
// may carry braces: cat{c, a} is just those members of cat (decomposition).
func (p *parser) outline(first token) ([]engine.Outline, error) {
	if first.kind != openAngleToken {
		var chain written
		if _, err := p.outlineName(&chain, first, ""); err != nil {
			return nil, err
		}
		if err := p.moreSteps(&chain); err != nil {
			return nil, err
		}
		return []engine.Outline{chain.outline(engine.TransitionShape)}, nil
	}
	var names written
	arrows, err := p.outlineName(&names, p.take(), `"<"`)
	if err != nil {
		return nil, err
	}
	if arrows && p.peekIs(closeAngleToken) {
		// <thedog{t -> h -> e}>: an assembly over those members and a transition through them, as <c -> a -> t> is.
		p.take()
		return []engine.Outline{names.outline(engine.StateShape), names.outline(engine.TransitionShape)}, nil
	}
	if p.peekIs(arrowToken) {
		if err := p.moreSteps(&names); err != nil {
			return nil, err
		}
		if closing := p.take(); closing.kind != closeAngleToken {
			return nil, syntaxError("expected \"->\" or \">\" after %s%s", names.last(), got(closing))
		}
		return []engine.Outline{names.outline(engine.StateShape), names.outline(engine.TransitionShape)}, nil
	}
	for p.peekIs(commaToken) {
		p.take()
		if _, err := p.outlineName(&names, p.take(), `","`); err != nil {
			return nil, err
		}
	}
	if closing := p.take(); closing.kind != closeAngleToken {
		return nil, syntaxError("expected \",\" or \">\" after %s%s", names.last(), got(closing))
	}
	return []engine.Outline{names.outline(engine.StateShape)}, nil
}

// moreSteps carries a chain on through each "->" that follows: c -> a -> t.
func (p *parser) moreSteps(chain *written) error {
	for p.peekIs(arrowToken) {
		p.take()
		if _, err := p.outlineName(chain, p.take(), `"->"`); err != nil {
			return err
		}
	}
	return nil
}

// outlineName reads one name of an outline, with any braces after it, into names.
// The braces name populations separated by commas, cat{c, a}, or by arrows, cat{c -> a}; it reports which.
func (p *parser) outlineName(names *written, name token, after string) (arrows bool, err error) {
	if name.kind != wordToken {
		return false, syntaxError("expected a population name after %s%s", after, got(name))
	}
	if !p.peekIs(openBraceToken) {
		names.add(engine.Name(name.text), nil)
		return false, nil
	}
	p.take()
	var only []engine.Name
	commas := false
	before := `"{"`
	for {
		population := p.take()
		if population.kind != wordToken {
			return false, syntaxError("expected a population name after %s%s", before, got(population))
		}
		only = append(only, engine.Name(population.text))
		switch {
		case p.peekIs(commaToken):
			commas, before = true, `","`
		case p.peekIs(arrowToken):
			arrows, before = true, `"->"`
		default:
			if closing := p.take(); closing.kind != closeBraceToken {
				return false, syntaxError("expected \",\" or \"}\" after %s%s", population.text, got(closing))
			}
			if commas && arrows {
				return false, syntaxError("use commas or arrows inside braces, not both")
			}
			names.add(engine.Name(name.text), only)
			return arrows, nil
		}
		p.take()
	}
}

func (p *parser) population(names []engine.Name) (statement, error) {
	size := p.take()
	if size.kind != numberToken {
		return nil, syntaxError("expected a number of members after \"population\"%s", got(size))
	}
	n, err := strconv.Atoi(size.text)
	if err != nil {
		return nil, syntaxError("%s is too large a number of members", size.text)
	}
	return populationDeclaration{names: names, size: n}, nil
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

// compare reads names separated by commas: any declared names; the engine checks there are at least two.
func (p *parser) compare() (statement, error) {
	names, err := p.nameList(`"compare"`)
	if err != nil {
		return nil, err
	}
	return compareCommand{names: names}, nil
}

// nameList reads declared names separated by commas, the first coming after the given word.
func (p *parser) nameList(after string) ([]engine.Name, error) {
	var names []engine.Name
	for {
		name := p.take()
		if name.kind != wordToken {
			return nil, syntaxError("expected a name after %s%s", after, got(name))
		}
		names = append(names, engine.Name(name.text))
		if !p.peekIs(commaToken) {
			return names, nil
		}
		p.take()
		after = `","`
	}
}

func (p *parser) budget() (statement, error) {
	if p.next == len(p.tokens) {
		return budgetCommand{change: showSetting}, nil
	}
	switch value := p.take(); {
	case value.is("off"):
		return budgetCommand{change: turnOff}, nil
	case value.kind == numberToken:
		n, err := strconv.Atoi(value.text)
		if err != nil || n < 1 {
			return nil, syntaxError("a budget needs at least 1 member; budget off removes it")
		}
		return budgetCommand{change: turnOn, members: n}, nil
	default:
		return nil, syntaxError("expected a number or \"off\" after \"budget\"%s", got(value))
	}
}

func (p *parser) listAssemblies() (statement, error) {
	if p.next == len(p.tokens) {
		return listAssembliesCommand{page: 1}, nil
	}
	page := p.take()
	if page.kind != numberToken {
		return nil, syntaxError("expected a page number after \"assemblies\"%s", got(page))
	}
	n, err := strconv.Atoi(page.text)
	if err != nil || n < 1 {
		return nil, syntaxError("pages are numbered from 1")
	}
	return listAssembliesCommand{page: n}, nil
}

func (p *parser) setting(s setting) (statement, error) {
	if p.next == len(p.tokens) {
		return settingCommand{setting: s, change: showSetting}, nil
	}
	switch change := p.take(); {
	case change.is("on"):
		return settingCommand{setting: s, change: turnOn}, nil
	case change.is("off"):
		return settingCommand{setting: s, change: turnOff}, nil
	default:
		return nil, syntaxError("expected \"on\" or \"off\" after %q%s", string(s), got(change))
	}
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

// isKeyword is true when t is the word, or its short form from the instruction set in lower or upper case:
// population, pop or POP.
func (t token) isKeyword(word, short string) bool {
	return t.kind == wordToken && (t.text == word || t.text == short || t.text == strings.ToUpper(short))
}

var symbols = map[rune]tokenKind{
	'=': equalsToken,
	',': commaToken,
	'{': openBraceToken,
	'}': closeBraceToken,
	'<': openAngleToken,
	'>': closeAngleToken,
	'⟨': openAngleToken, // the retired typeset form, still accepted if pasted from older notes; printed back as < >
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
