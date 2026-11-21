package main

import (
	"fmt"
	"math"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// L1B is drawn as its populations, each a square grid of its members (· an individual, ● a member of an assembly,
// ◆ a member of the assembly selected), with how many are members under each; and the assemblies listed with their
// members. Selecting an assembly (↑ ↓) also marks, on the L1A graph, the members that project up to it. While a read
// plays, the assembly cast or added to at the moment shown is selected.

// l1bNow is L1B as the moment shown has it: the assemblies cast by then, each with only the projections up to it
// added by then, and what casting did at the moment shown.
func (m model) l1bNow() ([]engine.Assembly, *engine.Casting) {
	later := map[int]bool{}
	hidden := map[engine.Projection]bool{}
	var now *engine.Casting
	if m.reading != nil {
		for i, moment := range m.reading.Moments {
			c := moment.Cast
			switch {
			case c == nil:
			case i == m.shown:
				now = c
			case i > m.shown:
				if c.New {
					later[c.Assembly] = true
				}
				for _, p := range c.Projections {
					hidden[p] = true
				}
			}
		}
	}
	var assemblies []engine.Assembly
	for _, a := range m.memory.Assemblies() {
		if later[a.ID] {
			continue
		}
		for i, member := range a.Members {
			var from []engine.Member
			for _, f := range a.From[i] {
				if !hidden[engine.Projection{From: f, To: member}] {
					from = append(from, f)
				}
			}
			a.From[i] = from
		}
		assemblies = append(assemblies, a)
	}
	return assemblies, now
}

// selectedAssembly is the assembly selected, as the moment shown has it, if it has been cast by then.
func (m model) selectedAssembly() (engine.Assembly, bool) {
	assemblies, _ := m.l1bNow()
	for _, a := range assemblies {
		if a.ID == m.selected {
			return a, true
		}
	}
	return engine.Assembly{}, false
}

// follow selects the assembly that casting cast or added to at the moment shown, if it did, or else the winner.
func (m model) follow() model {
	if m.reading != nil {
		moment := m.reading.Moments[m.shown]
		switch {
		case moment.Cast != nil:
			m.selected = moment.Cast.Assembly
		case moment.L1B.Winner > 0:
			m.selected = moment.L1B.Winner
		}
	}
	return m
}

// choose moves the selection to the assembly before or after, among those cast by the moment shown.
func (m model) choose(step int) model {
	assemblies, _ := m.l1bNow()
	if len(assemblies) == 0 {
		return m
	}
	at := -1
	for i, a := range assemblies {
		if a.ID == m.selected {
			at = i
		}
	}
	switch {
	case at < 0 && step > 0:
		at = 0
	case at < 0:
		at = len(assemblies) - 1
	default:
		at = min(max(at+step, 0), len(assemblies)-1)
	}
	m.selected = assemblies[at].ID
	return m
}

// l1bActivity is L1B's activity at the moment shown: nothing on when no read is being shown.
func (m model) l1bActivity() engine.L1BMoment {
	if m.reading == nil {
		return engine.L1BMoment{}
	}
	return m.reading.Moments[m.shown].L1B
}

// l1bView draws L1B's populations as grids, wrapped to the width.
func (m model) l1bView() string {
	populations := m.memory.L1BPopulations()
	if len(populations) == 0 {
		return ""
	}
	assemblies, _ := m.l1bNow()
	member := map[engine.Member]bool{}
	for _, a := range assemblies {
		for _, mm := range a.Members {
			member[mm] = true
		}
	}
	chosen := map[engine.Member]bool{}
	if a, ok := m.selectedAssembly(); ok {
		for _, mm := range a.Members {
			chosen[mm] = true
		}
	}
	act := m.l1bActivity()
	var blocks [][]string
	for _, p := range populations {
		blocks = append(blocks, gridBlock(p, member, chosen, act))
	}
	open := 0
	for _, g := range act.Gates {
		if g.Open {
			open++
		}
	}
	title := titleStyle.Render("L1B") + fmt.Sprintf(" · %d %s · %d on · %d of %d gates open",
		len(assemblies), plural(len(assemblies), "assembly", "assemblies"), len(act.On), open, len(act.Gates))
	if act.Winner > 0 {
		title += " · " + markStyles[stateMark].Render(fmt.Sprintf("#%d %s wins", act.Winner, m.assemblyName(act.Winner)))
	} else if len(act.Gates) > 0 {
		title += " · no winner"
	}
	if act.Cleared {
		title += " · " + markStyles[burst].Render("confirmations cleared by the burst")
	}
	if a, ok := m.selectedAssembly(); ok {
		title += " · " + markStyles[selectedMark].Render(fmt.Sprintf("#%d %s", a.ID, a.Name())) + " selected"
	}
	return title + "\n" + joinBlocks(blocks, m.width)
}

// gridBlock draws one population: its name, its members in a square grid (numbered row by row), and how many of
// them belong to an assembly. The shape says what a member is (· an individual, ○ ● a member of an assembly, ◇ ◆ a
// member of the assembly selected), filled when it is on; the colour says why it is on (green: projected up from
// L1A this moment; magenta: brought on by the winner; plain: on since earlier).
func gridBlock(p engine.Population, member, chosen map[engine.Member]bool, act engine.L1BMoment) []string {
	on, up, completed := map[engine.Member]bool{}, map[engine.Member]bool{}, map[engine.Member]bool{}
	for _, mm := range act.On {
		on[mm] = true
	}
	for _, mm := range act.Up {
		up[mm] = true
	}
	for _, mm := range act.Completed {
		completed[mm] = true
	}
	side := int(math.Ceil(math.Sqrt(float64(p.Size()))))
	width := side*2 - 1
	lines := []string{center(string(p.Name()), width)}
	used := 0
	for row := range side {
		var cells []string
		for col := range side {
			n := row*side + col + 1
			if n > p.Size() {
				cells = append(cells, " ")
				continue
			}
			mm := engine.Member{Population: p.Name(), Number: n}
			if !member[mm] {
				cells = append(cells, hintStyle.Render("·"))
				continue
			}
			used++
			shape := "○"
			if chosen[mm] {
				shape = "◇"
			}
			if on[mm] {
				shape = map[string]string{"○": "●", "◇": "◆"}[shape]
			}
			style := hintStyle
			switch {
			case up[mm]:
				style = markStyles[arrived]
			case completed[mm]:
				style = markStyles[stateMark]
			case on[mm]:
				style = titleStyle
			case chosen[mm]:
				style = markStyles[selectedMark]
			}
			cells = append(cells, style.Render(shape))
		}
		lines = append(lines, strings.Join(cells, " "))
	}
	count := center(fmt.Sprintf("%d/%d", used, p.Size()), width)
	switch {
	case used == p.Size():
		count = markStyles[fullMark].Render(count)
	case used*3 > p.Size()*2:
		count = markStyles[formed].Render(count)
	default:
		count = hintStyle.Render(count)
	}
	return append(lines, count)
}

func center(s string, width int) string {
	n := len([]rune(s))
	if n >= width {
		return s
	}
	left := (width - n) / 2
	return strings.Repeat(" ", left) + s + strings.Repeat(" ", width-n-left)
}

// joinBlocks sets blocks side by side, three spaces apart, starting a new row of blocks when the width is reached.
func joinBlocks(blocks [][]string, width int) string {
	const gap = 3
	var rows []string
	for start := 0; start < len(blocks); {
		blockWidth := len([]rune(blocks[start][0])) // the name line, which carries no styles
		perRow := max(1, (width+gap)/(blockWidth+gap))
		end := min(start+perRow, len(blocks))
		for line := range blocks[start] {
			var parts []string
			for _, b := range blocks[start:end] {
				parts = append(parts, b[line])
			}
			rows = append(rows, strings.TrimRight(strings.Join(parts, strings.Repeat(" ", gap)), " "))
		}
		if end < len(blocks) {
			rows = append(rows, "")
		}
		start = end
	}
	return strings.Join(rows, "\n")
}

// assemblyListLines is how many assemblies the list shows at most, around the one selected.
const assemblyListLines = 8

// assemblyList lists the assemblies as the moment shown has them, with their members. The one selected is marked;
// whatever casting did at the moment shown is in yellow.
func (m model) assemblyList() string {
	assemblies, now := m.l1bNow()
	if len(assemblies) == 0 {
		return ""
	}
	fresh := map[engine.Projection]bool{}
	if now != nil {
		for _, p := range now.Projections {
			fresh[p] = true
		}
	}
	gates := map[int]engine.Gate{}
	for _, g := range m.l1bActivity().Gates {
		gates[g.Assembly] = g
	}
	nameWidth := 0
	for _, a := range assemblies {
		nameWidth = max(nameWidth, len(fmt.Sprintf("#%d %s", a.ID, a.Name())))
	}
	at := 0
	var lines []string
	for i, a := range assemblies {
		head := fmt.Sprintf("#%d %s", a.ID, a.Name())
		head += strings.Repeat(" ", nameWidth-len(head))
		var members []string
		for _, mm := range a.Members {
			members = append(members, label(mm))
		}
		line := head + "   " + gateText(gates[a.ID]) + "   " + strings.Join(members, " ")
		cast := now != nil && now.Assembly == a.ID
		switch {
		case cast && now.New:
			line = markStyles[formed].Render(line) + markStyles[formed].Render("   cast now")
		case cast && len(now.Projections) > 0:
			var ups []string
			for _, p := range now.Projections {
				ups = append(ups, label(p.From)+"→"+label(p.To))
			}
			line += markStyles[formed].Render("   up now: " + strings.Join(ups, " "))
		}
		if a.ID == m.selected {
			at = i
			line = markStyles[selectedMark].Render("◆ ") + line
		} else {
			line = "  " + line
		}
		lines = append(lines, line)
	}
	title := hintStyle.Render("assemblies, in the order cast · ↑ ↓ select")
	if len(lines) > assemblyListLines {
		start := min(max(at-assemblyListLines/2, 0), len(lines)-assemblyListLines)
		title += hintStyle.Render(fmt.Sprintf(" · %d–%d of %d", start+1, start+assemblyListLines, len(lines)))
		lines = lines[start : start+assemblyListLines]
	}
	return title + "\n" + strings.Join(lines, "\n")
}

// gateText writes an assembly's gate at the moment shown, padded so the members line up: how much of it the input
// has confirmed, "wins" for the winner (magenta), faint when the gate is shut.
func gateText(g engine.Gate) string {
	const width = 11
	pad := func(text string) string { return fmt.Sprintf("%-*s", width, text) }
	switch {
	case g.Size == 0:
		return strings.Repeat(" ", width) // cast at this moment, or no read shown: no gate counted yet
	case g.Winner:
		return markStyles[stateMark].Render(pad(fmt.Sprintf("wins %d/%d", g.Confirmed, g.Size)))
	case g.Open:
		return pad(fmt.Sprintf("%d/%d", g.Confirmed, g.Size))
	}
	return hintStyle.Render(pad(fmt.Sprintf("0/%d", g.Size)))
}
