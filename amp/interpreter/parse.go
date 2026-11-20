package interpreter

import (
	"fmt"
	"strconv"
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

func (populationDeclaration) isStatement() {}
func (communityDeclaration) isStatement()  {}

// SyntaxError: the line isn't AMP the interpreter can read.
type SyntaxError struct {
	Message string
}

func (e SyntaxError) Error() string { return e.Message }

func syntaxError(format string, args ...any) SyntaxError {
	return SyntaxError{Message: fmt.Sprintf(format, args...)}
}

func parse(line string) (statement, error) {
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
		return nil, syntaxError("unexpected %s after the declaration", extra.text)
	}
	return st, nil
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

func (p *parser) statement() (statement, error) {
	name := p.take()
	if name.kind != wordToken {
		return nil, syntaxError("expected a name to declare%s", got(name))
	}
	if equals := p.take(); equals.kind != equalsToken {
		return nil, syntaxError("expected \"=\" after %s%s", name.text, got(equals))
	}
	switch declaration := p.take(); {
	case declaration.is("population"):
		return p.population(engine.Name(name.text))
	case declaration.is("community"):
		return p.community(engine.Name(name.text))
	default:
		return nil, syntaxError("expected \"population\" or \"community\" after \"=\"%s", got(declaration))
	}
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
	var populations []engine.Name
	after := "\"community\""
	for {
		population := p.take()
		if population.kind != wordToken {
			return nil, syntaxError("expected a population name after %s%s", after, got(population))
		}
		populations = append(populations, engine.Name(population.text))
		if p.peekIs(commaToken) {
			p.take()
			after = "\",\""
			continue
		}
		return communityDeclaration{name: name, populations: populations}, nil
	}
}

func (p *parser) peekIs(kind tokenKind) bool {
	return p.next < len(p.tokens) && p.tokens[p.next].kind == kind
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
)

type token struct {
	kind tokenKind
	text string
}

func (t token) is(word string) bool { return t.kind == wordToken && t.text == word }

// scan splits a line into words, numbers and symbols.
func scan(line string) ([]token, error) {
	var tokens []token
	runes := []rune(line)
	for i := 0; i < len(runes); {
		r := runes[i]
		switch {
		case unicode.IsSpace(r):
			i++
		case r == '=':
			tokens = append(tokens, token{kind: equalsToken, text: "="})
			i++
		case r == ',':
			tokens = append(tokens, token{kind: commaToken, text: ","})
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
