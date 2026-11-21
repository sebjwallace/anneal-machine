package main

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/interpreter"
)

// Only the language's own terms appear on screen, and everything AMP-shaped is printed by the interpreter, so AMT
// reads like amp.

var (
	titleStyle      = lipgloss.NewStyle().Bold(true)
	hintStyle       = lipgloss.NewStyle().Faint(true)
	activeStyle     = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Green)
	refractoryStyle = lipgloss.NewStyle().Foreground(lipgloss.Yellow)
	readyStyle      = lipgloss.NewStyle().Faint(true)
	shownStyle      = lipgloss.NewStyle().Reverse(true)
	problemStyle    = lipgloss.NewStyle().Foreground(lipgloss.Red)
)

var phaseMarks = map[phase]string{
	active:     activeStyle.Render("●"),
	refractory: refractoryStyle.Render("◐"),
	ready:      readyStyle.Render("·"),
}

func (m model) View() tea.View {
	refractory := "refractory off"
	if m.memory.HasRefractoryPeriod() {
		refractory = "refractory on"
	}
	sections := []string{titleStyle.Render(fmt.Sprintf("amt · %s · %s · %s", m.path, m.note, refractory))}
	switch m.screen {
	case assemblyScreen:
		sections = append(sections, m.assemblyView()...)
	default:
		sections = append(sections, m.runView()...)
	}
	if m.problem != "" {
		sections = append(sections, problemStyle.Render("error: "+m.problem))
	}
	if m.screen == runScreen {
		sections = append(sections, m.input.View())
	}
	view := tea.NewView(strings.Join(sections, "\n\n"))
	view.AltScreen = true
	view.WindowTitle = "amt · " + m.path
	return view
}

func (m model) runView() []string {
	phases := m.phases()
	sections := []string{m.runHint(), m.populationsView(phases)}
	switch states := m.statesView(phases); {
	case m.memory.CountAssemblies() == 0:
		sections = append(sections, hintStyle.Render("no assemblies yet, so invoking only shows the input: declare them in amp, as in cat = <c, a, t> ; c -> a -> t, and save"))
	case states != "":
		sections = append(sections, states)
	}
	if m.invocation != nil {
		sections = append(sections, m.momentsView())
	}
	return sections
}

func (m model) runHint() string {
	keys := "tab: assemblies · esc: quit"
	if m.invocation == nil || len(m.invocation.Moments) == 0 {
		return hintStyle.Render("type the input to invoke, as in c, {a, t}, then enter · " + keys)
	}
	moment := m.invocation.Moments[m.shown]
	where := fmt.Sprintf("moment %d · %d of %d in this invoke", moment.Number, m.shown+1, len(m.invocation.Moments))
	if m.holding() {
		where += " · held, " + interpreter.RepeatingEvery(m.invocation.RepeatsEvery)
	}
	controls := "space: play"
	if m.playing {
		controls = "space: pause"
	}
	return where + "   " + hintStyle.Render(controls+" · ← → step (with the input empty) · "+keys)
}

// populationsView draws each population as a row of its members, one mark per member's phase, with a key beside it.
func (m model) populationsView(phases map[memberID]phase) string {
	populations := m.memory.Populations()
	if len(populations) == 0 {
		return hintStyle.Render("no populations yet: declare them in amp and save")
	}
	nameWidth := 0
	for _, p := range populations {
		nameWidth = max(nameWidth, len(p.Name()))
	}
	key := []string{phaseMarks[active] + " active", phaseMarks[refractory] + " refractory", phaseMarks[ready] + " ready"}
	var rows []string
	for i, p := range populations {
		marks := make([]string, p.Size())
		for number := 1; number <= p.Size(); number++ {
			marks[number-1] = phaseMarks[phases[memberID{population: p.Name(), number: number}]]
		}
		row := fmt.Sprintf("%-*s  %s", nameWidth, p.Name(), strings.Join(marks, " "))
		if i < len(key) {
			row += "    " + key[i]
		}
		rows = append(rows, row)
	}
	for i := len(populations); i < len(key); i++ {
		rows = append(rows, strings.Repeat(" ", nameWidth+2)+"    "+key[i])
	}
	return strings.Join(rows, "\n")
}

// statesView shows how much of each state is counted (active or refractory) at the moment shown.
func (m model) statesView(phases map[memberID]phase) string {
	var rows [][]string
	for _, a := range m.memory.AllAssemblies() {
		if a.Shape() != engine.StateShape {
			continue
		}
		var bar strings.Builder
		counted := 0
		for _, member := range a.Members() {
			if phases[idOf(member)] != ready {
				counted++
				bar.WriteString(activeStyle.Render("█"))
			} else {
				bar.WriteString(readyStyle.Render("░"))
			}
		}
		rows = append(rows, []string{fmt.Sprintf("%s %s", a.Name(), interpreter.WriteAssembly(a)), fmt.Sprintf("%d of %d", counted, len(a.Members())), bar.String()})
	}
	return alignColumns(rows)
}

// momentsView prints the invocation as amp does, with the moment shown highlighted.
func (m model) momentsView() string {
	lines := strings.Split(interpreter.PrintInvocation(*m.invocation), "\n")
	for i := range lines {
		lines[i] = lipgloss.NewStyle().MaxWidth(m.width).Render(lines[i])
	}
	if row := m.shown + 1; row < len(lines) {
		lines[row] = shownStyle.Render(lines[row])
	}
	return strings.Join(lines, "\n")
}

// assemblyView lists every assembly, and shows the members of the one chosen with their phases.
func (m model) assemblyView() []string {
	assemblies := m.memory.AllAssemblies()
	hint := hintStyle.Render("↑ ↓ choose · tab: run · esc: quit")
	if len(assemblies) == 0 {
		return []string{hint, hintStyle.Render("no assemblies yet: declare them in amp and save")}
	}
	var list []string
	for i, a := range assemblies {
		line := fmt.Sprintf("#%d %s %s", a.ID(), a.Name(), writeShaped(a))
		if i == m.selected {
			line = shownStyle.Render(line)
		}
		list = append(list, line)
	}
	chosen := assemblies[m.selected]
	phases := m.phases()
	var members [][]string
	for _, member := range chosen.Members() {
		p := phases[idOf(member)]
		members = append(members, []string{interpreter.WriteMember(member), phaseMarks[p] + " " + phaseName(p)})
	}
	return []string{hint, strings.Join(list, "\n"), titleStyle.Render(fmt.Sprintf("#%d %s %s", chosen.ID(), chosen.Name(), writeShaped(chosen))) + "\n" + alignColumns(members)}
}

// writeShaped writes an assembly as <c, a, t> and a transition as "transition c -> a -> t", as amp does.
func writeShaped(a engine.Assembly) string {
	if a.Shape() == engine.TransitionShape {
		return "transition " + interpreter.WriteAssembly(a)
	}
	return interpreter.WriteAssembly(a)
}

func phaseName(p phase) string {
	switch p {
	case active:
		return "active"
	case refractory:
		return "refractory"
	}
	return "ready"
}

// alignColumns lines up rows in columns, three spaces apart, measuring what shows rather than the styling.
func alignColumns(rows [][]string) string {
	var widths []int
	for _, row := range rows {
		for i, cell := range row {
			if i == len(widths) {
				widths = append(widths, 0)
			}
			widths[i] = max(widths[i], lipgloss.Width(cell))
		}
	}
	lines := make([]string, len(rows))
	for i, row := range rows {
		cells := make([]string, len(row))
		for j, cell := range row {
			cells[j] = cell
			if j < len(row)-1 {
				cells[j] += strings.Repeat(" ", widths[j]-lipgloss.Width(cell)+3)
			}
		}
		lines[i] = strings.Join(cells, "")
	}
	return strings.Join(lines, "\n")
}
