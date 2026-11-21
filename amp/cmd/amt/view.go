package main

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

var (
	titleStyle   = lipgloss.NewStyle().Bold(true)
	hintStyle    = lipgloss.NewStyle().Faint(true)
	shownStyle   = lipgloss.NewStyle().Reverse(true)
	problemStyle = lipgloss.NewStyle().Foreground(lipgloss.Red)
)

func (m model) View() tea.View {
	where := m.path
	if where == "" {
		where = "AMT's own memory"
	}
	title := fmt.Sprintf("amt · %s · %s · %d populations · %d bonds", where, m.note, len(m.memory.Populations()), len(m.memory.Bonds()))
	sections := []string{titleStyle.Render(title), m.hint()}
	graph := draw(m.layout, m.scene(), m.offset(), m.width)
	if len(m.memory.Bonds()) == 0 && m.reading == nil {
		graph = []string{hintStyle.Render("nothing read yet")}
	}
	sections = append(sections, strings.Join(graph, "\n"))
	if m.reading != nil {
		sections = append(sections, m.textView()+"\n"+m.momentView()+"\n"+m.motifsSoFar())
	}
	sections = append(sections, legend())
	if m.problem != "" {
		sections = append(sections, problemStyle.Render("error: "+m.problem))
	}
	sections = append(sections, m.input.View())
	view := tea.NewView(strings.Join(sections, "\n\n"))
	view.AltScreen = true
	view.WindowTitle = "amt · " + where
	return view
}

func (m model) hint() string {
	if m.reading == nil {
		return hintStyle.Render("type text to read (lower-case letters and spaces), then enter · esc: quit")
	}
	return hintStyle.Render(fmt.Sprintf("moment %d · %d of %d in this read · with the input empty: space plays and pauses, ← → step, home / end · esc: quit",
		m.reading.Moments[m.shown].Number, m.shown+1, len(m.reading.Moments)))
}

// offset is how far across the drawing starts, so the member selected at the moment shown stays in view.
func (m model) offset() int {
	if m.reading == nil || m.layout.width <= m.width {
		return 0
	}
	x := m.layout.nodes[m.reading.Moments[m.shown].Member].x
	return max(0, min(x-m.width/3, m.layout.width-m.width))
}

// textView writes the text read, each character coloured by how it arrived, with the one shown highlighted.
func (m model) textView() string {
	var b strings.Builder
	for i, moment := range m.reading.Moments {
		c := string(moment.Population)
		style := markStyles[arrived]
		if moment.Burst {
			style = markStyles[burst]
		}
		if i > m.shown {
			style = hintStyle
		}
		if i == m.shown {
			style = style.Inherit(shownStyle)
		}
		b.WriteString(style.Render(c))
	}
	if marks := m.motifMarks(); marks != "" {
		b.WriteString("\n" + marks)
	}
	return b.String()
}

// motifMarks draws a bracket under each motif the moment shown has reached, as far as it has gone, with the motif it is
// in highlighted.
func (m model) motifMarks() string {
	cells := make([]string, m.shown+1)
	for i := range cells {
		cells[i] = " "
	}
	found := false
	for _, l := range m.reading.Motifs() {
		if l.Start+1 > m.shown {
			break
		}
		found = true
		end := min(l.End, m.shown)
		style := hintStyle
		if m.shown <= l.End {
			style = markStyles[arrived]
		}
		for i := l.Start; i <= end; i++ {
			r := "─"
			switch i {
			case l.Start:
				r = "└"
			case end:
				r = "┘"
			}
			cells[i] = style.Render(r)
		}
	}
	if !found {
		return ""
	}
	return strings.TrimRight(strings.Join(cells, ""), " ")
}

// motifsSoFar lists the motifs the moment shown has reached, each with how many predictions it got right so far.
func (m model) motifsSoFar() string {
	var parts []string
	for _, l := range m.reading.Motifs() {
		if l.Start+1 > m.shown {
			break
		}
		l.End = min(l.End, m.shown)
		var chars strings.Builder
		for _, moment := range m.reading.Moments[l.Start : l.End+1] {
			chars.WriteString(string(moment.Population))
		}
		parts = append(parts, fmt.Sprintf("%s %d", chars.String(), l.Length()))
	}
	if len(parts) == 0 {
		return hintStyle.Render("no motifs yet")
	}
	return "motifs: " + strings.Join(parts, " · ")
}

func (m model) momentView() string {
	moment := m.reading.Moments[m.shown]
	parts := []string{string(moment.Population)}
	switch {
	case moment.Burst:
		parts = append(parts, fmt.Sprintf("nothing primed it, so it burst: all %d members on", len(moment.Active)),
			fmt.Sprintf("picked %s, an individual until now", label(moment.Member)))
	case len(moment.Primed) > 1:
		parts = append(parts, "primed: "+labels(moment.Primed)+", all on", "selected "+label(moment.Member))
	default:
		parts = append(parts, "primed, so "+label(moment.Member)+" on")
	}
	if moment.Bond != nil {
		parts = append(parts, fmt.Sprintf("bond %s → %s formed", label(moment.Bond.From), label(moment.Bond.To)))
	}
	if l, in := m.reading.MotifAt(m.shown); in {
		parts = append(parts, fmt.Sprintf("in a motif of %d so far", l.Length()))
	} else if m.shown > 0 && !m.reading.Moments[m.shown-1].Burst {
		if before, was := m.reading.MotifAt(m.shown - 1); was {
			parts = append(parts, fmt.Sprintf("ends the motif of %d before it", before.Length()))
		}
	}
	if len(moment.Predicts) > 0 {
		parts = append(parts, "primes "+labels(moment.Predicts)+" for the next moment")
	} else {
		parts = append(parts, "primes nothing")
	}
	return strings.Join(parts, " · ")
}

func labels(members []engine.Member) string {
	parts := make([]string, len(members))
	for i, member := range members {
		parts[i] = label(member)
	}
	return strings.Join(parts, " ")
}

func legend() string {
	keys := []string{
		markStyles[arrived].Render("arrived primed"),
		markStyles[burst].Render("burst: every member on"),
		markStyles[picked].Render("picked") + " from the individuals",
		markStyles[primed].Render("primed for the next moment") + " (sequence memory)",
		markStyles[formed].Render("bond formed"),
		lipgloss.NewStyle().Underline(true).Render("in the motif so far"),
		markStyles[stateMark].Render("primed by state memory") + hintStyle.Render(" (not built yet)"),
	}
	return strings.Join(keys, " · ")
}
