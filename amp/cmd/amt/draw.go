package main

import (
	"strconv"
	"strings"

	"charm.land/lipgloss/v2"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// mark is how a member or a bond is coloured at the moment shown.
type mark int

const (
	plain        mark = iota
	arrived           // the member selected, which arrived primed: sequence memory predicted it
	burst             // a member of the population that burst (every member is on)
	picked            // the individual picked when its population burst, a member from now on
	primed            // primed by sequence memory for the next moment, and the bonds priming it
	formed            // the bond formed this moment
	stateMark         // state memory's predictions: L1B members a gate brought on (and, once built, L1A primed from L1B)
	selectedMark      // the assembly selected in L1B, and the L1A members that project up to it
	fullMark          // an L1B population with no individual left
)

var markStyles = map[mark]lipgloss.Style{
	plain:        lipgloss.NewStyle(),
	arrived:      lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Green),
	burst:        lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Red),
	picked:       lipgloss.NewStyle().Bold(true).Reverse(true).Foreground(lipgloss.Red),
	primed:       lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Cyan),
	formed:       lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Yellow),
	stateMark:    lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Magenta),
	selectedMark: lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Blue),
	fullMark:     lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Red),
}

// scene is what the moment shown has reached, and how each part of it is coloured.
type scene struct {
	members map[engine.Member]mark // only the members drawn
	motif   map[engine.Member]bool // the members of the motif the moment shown is in, as far as it has gone: underlined
	// projects are the L1A members that project up to the assembly selected in L1B: marked ◆ beside them
	projects map[engine.Member]bool
	bonds    map[engine.Bond]mark // only the bonds drawn
}

var subscripts = []rune("₀₁₂₃₄₅₆₇₈₉")

// label writes a member as its letter and its number in subscript, as in t₄.
func label(m engine.Member) string {
	var b strings.Builder
	b.WriteString(string(m.Population))
	for _, d := range strconv.Itoa(m.Number) {
		b.WriteRune(subscripts[d-'0'])
	}
	return b.String()
}

var boxes = map[int]rune{
	left | right: '─', up | down: '│', left: '─', right: '─', up: '│', down: '│',
	down | right: '┌', down | left: '┐', up | right: '└', up | left: '┘',
	up | down | right: '├', up | down | left: '┤', down | left | right: '┬', up | left | right: '┴',
	up | down | left | right: '┼',
}

type cell struct {
	r     rune
	mark  mark
	under bool
}

// draw lays out the scene as lines of text, cutting it to width from column offset. It always draws the rows the
// whole memory takes up, so nothing moves up or down as moments are stepped through.
func draw(l layout, s scene, offset, width int) []string {
	canvas := make([][]cell, l.height)
	for y := range canvas {
		canvas[y] = make([]cell, l.width)
		for x := range canvas[y] {
			canvas[y][x] = cell{r: ' '}
		}
	}
	type usage struct {
		bits     int
		mark     mark
		straight int // the bits of lines through here that are pure horizontal, for drawing crossings
	}
	cells := map[point]*usage{}
	arrows := map[point]cell{}
	for b, bm := range s.bonds {
		r, ok := l.routes[b]
		if !ok {
			continue
		}
		for i, c := range r.cells {
			u := cells[c]
			if u == nil {
				u = &usage{}
				cells[c] = u
			}
			u.bits |= r.bits[i]
			if r.bits[i] == left|right {
				u.straight |= r.bits[i]
			}
			u.mark = max(u.mark, bm)
		}
		end := r.cells[len(r.cells)-1]
		if a, ok := arrows[end]; !ok || bm > a.mark {
			arrows[end] = cell{r: r.arrow, mark: bm}
		}
	}
	for c, u := range cells {
		bits := u.bits
		if l.crossings[c] && u.straight != 0 {
			bits = left | right // the horizontal line is drawn over the vertical one it crosses
		}
		canvas[c.y][c.x] = cell{r: boxes[bits], mark: u.mark}
	}
	for c, a := range arrows {
		canvas[c.y][c.x] = a
	}
	for m, mm := range s.members {
		p := l.nodes[m]
		for i, r := range []rune(label(m)) {
			if p.x+i < l.width {
				canvas[p.y][p.x+i] = cell{r, mm, s.motif[m]}
			}
		}
		if s.projects[m] && p.x+nodeWidth < l.width {
			canvas[p.y][p.x+nodeWidth] = cell{r: '◆', mark: selectedMark}
		}
	}

	var lines []string
	for _, row := range canvas[l.top : l.bottom+1] {
		end := min(offset+width, len(row))
		if offset >= end {
			lines = append(lines, "")
			continue
		}
		var b strings.Builder
		run, runMark, runUnder := []rune{}, plain, false
		flush := func() {
			if len(run) > 0 {
				b.WriteString(markStyles[runMark].Underline(runUnder).Render(string(run)))
				run = run[:0]
			}
		}
		for _, c := range row[offset:end] {
			if c.mark != runMark || c.under != runUnder {
				flush()
				runMark, runUnder = c.mark, c.under
			}
			run = append(run, c.r)
		}
		flush()
		lines = append(lines, strings.TrimRight(b.String(), " "))
	}
	return lines
}

// whole is the scene with every member and bond drawn and nothing coloured: the memory as it stands.
func whole(memory *engine.Memory) scene {
	s := scene{members: map[engine.Member]mark{}, bonds: map[engine.Bond]mark{}}
	for _, m := range order(memory) {
		s.members[m] = plain
	}
	for _, b := range memory.Bonds() {
		s.bonds[b] = plain
	}
	return s
}
