package interpreter

import (
	"fmt"
	"slices"
	"strconv"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// c: 8 members, c{1..8}, all individuals
func printPopulation(p engine.Population, individuals int) string {
	return fmt.Sprintf("%s: %s, %s, %s", p.Name(), countMembers(p.Size()), memberRange(p), describeIndividuals(individuals, p.Size()))
}

// letters: c, a, t (24 members)
func printCommunity(c engine.Community) string {
	return fmt.Sprintf("%s: %s (%s)", c.Name(), strings.Join(populationNames(c.Populations()), ", "), countMembers(c.Size()))
}

func countMembers(n int) string { return countOf(n, "member", "members") }

// memberRange writes every member of p with its population: c{1..8}, or x{1} for a population of one.
func memberRange(p engine.Population) string {
	if p.Size() == 1 {
		return fmt.Sprintf("%s{1}", p.Name())
	}
	return fmt.Sprintf("%s{1..%d}", p.Name(), p.Size())
}

func describeIndividuals(individuals, size int) string {
	if individuals == size {
		return "all individuals"
	}
	return fmt.Sprintf("%d individuals", individuals)
}

// moment   active   refractory   why
// 1        c
// 2        +a       c            a: cat c -> a
// complete   cat <c, a, t>   3 of 3
// held       repeating every 2 moments
//
// One row per moment, at the population level: + marks what was recalled rather than arriving from the world. Then
// how much of each state the invocation reached, and whether the memory ended holding.
func printInvocation(invocation engine.Invocation) string {
	rows := [][]string{{"moment", "active", "refractory", "why"}}
	for _, moment := range invocation.Moments {
		rows = append(rows, []string{
			strconv.Itoa(moment.Number),
			writeActive(moment),
			strings.Join(populationNames(populationsOf(moment.Refractory)), ", "),
			writeWhy(moment),
		})
	}
	lines := []string{writeTable(rows)}
	if summary := writeSummary(invocation); summary != "" {
		lines = append(lines, summary)
	}
	return strings.Join(lines, "\n")
}

// writeActive lists the populations with active members: c if any arrived from the world, +c if all were recalled.
func writeActive(moment engine.Moment) string {
	var written []string
	for _, group := range groupByPopulation(moment.Active) {
		if group.arrived {
			written = append(written, string(group.population.Name()))
		} else {
			written = append(written, "+"+string(group.population.Name()))
		}
	}
	return strings.Join(written, ", ")
}

// writeWhy says, for each population that came on by a gate, which gates; then any heat.
func writeWhy(moment engine.Moment) string {
	var reasons []string
	for _, group := range groupByPopulation(moment.Active) {
		if len(group.gates) == 0 {
			continue
		}
		var gates []string // each gate written once: one state can open several members of a population
		for _, gate := range group.gates {
			if written := writeGate(gate); !slices.Contains(gates, written) {
				gates = append(gates, written)
			}
		}
		reason := strings.Join(gates, ", ")
		if group.arrived {
			reason = "expected by " + reason
		}
		reasons = append(reasons, fmt.Sprintf("%s: %s", group.population.Name(), reason))
	}
	for _, competition := range moment.Competitions {
		reasons = append(reasons, writeCompetition(competition))
	}
	for _, cut := range moment.BudgetCuts {
		reasons = append(reasons, fmt.Sprintf("budget %s: %d of %d recalled", cut.Population.Name(), cut.Recalled, cut.Wanted))
	}
	if len(moment.Unexplained) > 0 {
		hot := make([]string, len(moment.Unexplained))
		for i, p := range moment.Unexplained {
			hot[i] = "!" + string(p.Name())
		}
		reasons = append(reasons, "incomplete, heat "+strings.Join(hot, ", "))
	}
	return strings.Join(reasons, "; ")
}

// writeCompetition says how a group of rivals came out:
//
//	tie: cat <c, a, t> 2 of 3 | cot <c, o, t> 2 of 3, held
//	cat <c, a, t> 3 of 3 over cot <c, o, t> 2 of 3
func writeCompetition(competition engine.Competition) string {
	byOutcome := map[engine.Outcome][]engine.Rival{}
	for _, rival := range competition.Rivals {
		byOutcome[rival.Outcome] = append(byOutcome[rival.Outcome], rival)
	}
	var written string
	switch {
	case len(byOutcome[engine.Held]) > 0:
		written = "tie: " + strings.Join(writeSides(byOutcome[engine.Held]), " | ") + ", held"
	case len(byOutcome[engine.Won]) > 0:
		written = strings.Join(writeSides(byOutcome[engine.Won]), ", ")
	}
	if lost := byOutcome[engine.Lost]; len(lost) > 0 {
		written += " over " + strings.Join(writeSides(lost), ", ")
	}
	return written
}

// writeSides writes rivals grouped by name, each name once: cat <c, a, t> 2 of 3, c -> a -> t 2 of 3.
func writeSides(rivals []engine.Rival) []string {
	var names []engine.Name
	written := map[engine.Name][]string{}
	for _, rival := range rivals {
		a := rival.Assembly
		if _, seen := written[a.Name()]; !seen {
			names = append(names, a.Name())
		}
		written[a.Name()] = append(written[a.Name()], fmt.Sprintf("%s %d of %d", writeShape(a.Shape(), namesOf(a.Populations())), rival.Counted, len(a.Members())))
	}
	sides := make([]string, len(names))
	for i, name := range names {
		sides[i] = fmt.Sprintf("%s %s", name, strings.Join(written[name], ", "))
	}
	return sides
}

// writeGate names a gate by its assembly: cat <c, a, t> 2 of 3 for a state, cat c -> a for a transition's step.
func writeGate(gate engine.Gate) string {
	a := gate.Assembly
	if a.Shape() == engine.StateShape {
		return fmt.Sprintf("%s %s %d of %d", a.Name(), writeShape(a.Shape(), namesOf(a.Populations())), gate.Counted, len(a.Members()))
	}
	return fmt.Sprintf("%s %s -> %s", a.Name(), gate.From.Population().Name(), stepAfter(a, gate.From).Population().Name())
}

// stepAfter is the member that follows from in a transition.
func stepAfter(transition engine.Assembly, from engine.Member) engine.Member {
	members := transition.Members()
	for i := 0; i+1 < len(members); i++ {
		if members[i] == from {
			return members[i+1]
		}
	}
	panic("interpreter: a transition's gate came from a member not on it")
}

// populationGroup is what one population did in a moment.
type populationGroup struct {
	population engine.Population
	arrived    bool
	gates      []engine.Gate
}

func groupByPopulation(activations []engine.Activation) []populationGroup {
	var groups []populationGroup
	for _, activation := range activations {
		p := activation.Member.Population()
		if len(groups) == 0 || groups[len(groups)-1].population != p {
			groups = append(groups, populationGroup{population: p})
		}
		group := &groups[len(groups)-1]
		group.arrived = group.arrived || activation.Arrived
		group.gates = append(group.gates, activation.Gates...)
	}
	return groups
}

// writeSummary says how complete each state got, and whether the memory ended holding.
func writeSummary(invocation engine.Invocation) string {
	held := invocation.RepeatsEvery > 0
	var rows [][]string
	for _, c := range invocation.Completions {
		state, size := c.State, len(c.State.Members())
		label := fmt.Sprintf("%s %s", state.Name(), writeShape(state.Shape(), namesOf(state.Populations())))
		switch {
		case held && c.Last == size:
			rows = append(rows, []string{"complete", label, fmt.Sprintf("%d of %d", size, size)})
		case held && c.Last > 0:
			rows = append(rows, []string{"incomplete", label, fmt.Sprintf("%d of %d", c.Last, size)})
		default:
			if c.Most == size {
				rows = append(rows, []string{"complete", label, fmt.Sprintf("%d of %d, not held", size, size)})
			} else {
				rows = append(rows, []string{"incomplete", label, fmt.Sprintf("at most %d of %d", c.Most, size)})
			}
		}
	}
	if held {
		rows = append(rows, []string{"held", RepeatingEvery(invocation.RepeatsEvery)})
	}
	if len(rows) == 0 {
		return ""
	}
	return writeTable(rows)
}

// RepeatingEvery says how often a held memory comes back round: repeating every moment, every 2 moments.
func RepeatingEvery(moments int) string {
	if moments == 1 {
		return "repeating every moment"
	}
	return fmt.Sprintf("repeating every %d moments", moments)
}

// #1 cat state <c, a, t>
// #2 cat transition c -> a -> t
// page 1 of 3, assemblies 1 to 20 of 45; next: assemblies 2
//
// first is how many assemblies come before this page, total how many there are.
func printAssemblyList(shown []engine.Assembly, first, total, page, pages int) string {
	lines := make([]string, 0, len(shown)+1)
	for _, a := range shown {
		lines = append(lines, fmt.Sprintf("#%d %s %s %s", a.ID(), a.Name(), a.Shape(), writeShape(a.Shape(), namesOf(a.Populations()))))
	}
	switch {
	case pages == 1:
		lines = append(lines, countOf(total, "assembly", "assemblies"))
	case page < pages:
		lines = append(lines, fmt.Sprintf("page %d of %d, assemblies %d to %d of %d; next: assemblies %d", page, pages, first+1, first+len(shown), total, page+1))
	default:
		lines = append(lines, fmt.Sprintf("page %d of %d, assemblies %d to %d of %d", page, pages, first+1, first+len(shown), total))
	}
	return strings.Join(lines, "\n")
}

// thedog ∩ thecat   t, h, e (3)
// thedog ∪ thecat   t, h, e, d, o, g, c, a (8)
// thedog − thecat   d, o, g (3)
// thecat − thedog   c, a (2)
// thedog △ thecat   d, o, g, c, a (5)
// thedog ⊆ thecat   no
// thecat ⊆ thedog   no
//
// With more than two, only the intersection and union of them all.
func printComparison(c engine.Comparison) string {
	names := namesOf(c.Of)
	rows := [][]string{
		{strings.Join(names, " ∩ "), writePopulationSet(c.Intersection)},
		{strings.Join(names, " ∪ "), writePopulationSet(c.Union)},
	}
	if len(names) == 2 {
		first, second := names[0], names[1]
		rows = append(rows,
			[]string{first + " − " + second, writePopulationSet(c.FirstOnly)},
			[]string{second + " − " + first, writePopulationSet(c.SecondOnly)},
			[]string{first + " △ " + second, writePopulationSet(c.Symmetric)},
			[]string{first + " ⊆ " + second, yesOrNo(c.FirstInSecond)},
			[]string{second + " ⊆ " + first, yesOrNo(c.SecondInFirst)},
		)
	}
	return writeTable(rows)
}

// t, h, e (3), or ∅ (0)
func writePopulationSet(names []engine.Name) string {
	if len(names) == 0 {
		return "∅ (0)"
	}
	return fmt.Sprintf("%s (%d)", strings.Join(namesOf(names), ", "), len(names))
}

func yesOrNo(yes bool) string {
	if yes {
		return "yes"
	}
	return "no"
}

// budget: 4, or budget: off
func printBudget(members int) string {
	if members == 0 {
		return "budget: off"
	}
	return fmt.Sprintf("budget: %d", members)
}

// refractory: on
func printSetting(s setting, on bool) string {
	if on {
		return string(s) + ": on"
	}
	return string(s) + ": off"
}

// moment   c          a          t
// 1        ●●●●●●●●   ········   ········
// 2                   ●·······   ◦·······
// ● active   ◦ primed   · ready   blank: refractory
//
// One row per moment and one column per population, one mark per member, so reading down shows how activity moves.
func printPhases(invocation engine.Invocation, populations []engine.Population) string {
	header := []string{"moment"}
	for _, p := range populations {
		header = append(header, string(p.Name()))
	}
	rows := [][]string{header}
	for _, moment := range invocation.Moments {
		phases := map[engine.Population]map[int]rune{}
		for _, activation := range moment.Active {
			markMember(phases, activation.Member, '●')
		}
		for _, member := range moment.Refractory {
			markMember(phases, member, ' ')
		}
		for _, member := range moment.Primed {
			markMember(phases, member, '◦')
		}
		row := []string{strconv.Itoa(moment.Number)}
		for _, p := range populations {
			marks := []rune(strings.Repeat("·", p.Size()))
			for number, mark := range phases[p] {
				marks[number-1] = mark
			}
			row = append(row, string(marks))
		}
		rows = append(rows, row)
	}
	return writeTable(rows) + "\n● active   ◦ primed   · ready   blank: refractory"
}

func markMember(phases map[engine.Population]map[int]rune, member engine.Member, mark rune) {
	p := member.Population()
	if phases[p] == nil {
		phases[p] = map[int]rune{}
	}
	phases[p][member.Number()] = mark
}

// writeTable lines rows up in columns, three spaces apart. A row may stop early; its last cell isn't padded.
func writeTable(rows [][]string) string {
	var widths []int
	for _, row := range rows {
		for i, cell := range row[:len(row)-1] {
			if i == len(widths) {
				widths = append(widths, 0)
			}
			widths[i] = max(widths[i], len([]rune(cell)))
		}
	}
	lines := make([]string, len(rows))
	for i, row := range rows {
		var line strings.Builder
		for j, cell := range row {
			if j < len(row)-1 {
				line.WriteString(padRight(cell, widths[j]+3))
			} else {
				line.WriteString(cell)
			}
		}
		lines[i] = strings.TrimRight(line.String(), " ")
	}
	return strings.Join(lines, "\n")
}

// c: 8 members; active: c{1}; refractory: c{2..8}
func printInspection(inspection engine.Inspection) string {
	p := inspection.Population
	active := writeMembers(p, inspection.Active)
	if inspection.Unexpected {
		active = fmt.Sprintf("%s (unexpected input, no member chosen yet)", countActive(p, len(inspection.Active)))
	}
	return fmt.Sprintf("%s: %s; active: %s; refractory: %s", p.Name(), countMembers(p.Size()), active, writeMembers(p, inspection.Refractory))
}

func countActive(p engine.Population, active int) string {
	if active == p.Size() {
		return fmt.Sprintf("all %d", active)
	}
	return strconv.Itoa(active)
}

// writeMembers writes members of one population: none, c{1}, c{1, 3}, or c{2..8} for a run.
func writeMembers(p engine.Population, members []engine.Member) string {
	if len(members) == 0 {
		return "none"
	}
	var runs []string
	for i := 0; i < len(members); {
		end := i
		for end+1 < len(members) && members[end+1].Number() == members[end].Number()+1 {
			end++
		}
		if end-i >= 2 {
			runs = append(runs, fmt.Sprintf("%d..%d", members[i].Number(), members[end].Number()))
		} else {
			for _, member := range members[i : end+1] {
				runs = append(runs, strconv.Itoa(member.Number()))
			}
		}
		i = end + 1
	}
	return fmt.Sprintf("%s{%s}", p.Name(), strings.Join(runs, ", "))
}

// populationsOf lists the populations of members, each once, in the order met.
func populationsOf(members []engine.Member) []engine.Population {
	var populations []engine.Population
	for _, member := range members {
		if p := member.Population(); len(populations) == 0 || populations[len(populations)-1] != p {
			populations = append(populations, p)
		}
	}
	return populations
}

func populationNames(populations []engine.Population) []string {
	names := make([]string, len(populations))
	for i, p := range populations {
		names[i] = string(p.Name())
	}
	return names
}

func padRight(text string, width int) string {
	return text + strings.Repeat(" ", max(0, width-len([]rune(text))))
}

// 3 populations, 1 community
func countDeclarations(memory *engine.Memory) string {
	return countOf(len(memory.Populations()), "population", "populations") + ", " +
		countOf(len(memory.Communities()), "community", "communities") + ", " +
		countOf(memory.CountAssemblies(), "assembly", "assemblies")
}

func countOf(n int, one, many string) string {
	if n == 1 {
		return "1 " + one
	}
	return fmt.Sprintf("%d %s", n, many)
}

// cat: state <c, a, t> and transition c -> a -> t
// thedog: state <the, dog> and transition the -> dog
//
// What was written, populations and parts as named; inspect shows the members chosen.
func printAssemblyDeclaration(name engine.Name, outlines []engine.Outline) string {
	written := make([]string, len(outlines))
	for i, outline := range outlines {
		written[i] = outline.Shape.String() + " " + writeShape(outline.Shape, namesOf(outline.Names))
	}
	return fmt.Sprintf("%s: %s", name, strings.Join(written, " and "))
}

// cat: #1 state <c{1}, a{1}, t{1}>; #2 transition c{1} -> a{1} -> t{1}
func printAssemblies(name engine.Name, assemblies []engine.Assembly) string {
	parts := make([]string, len(assemblies))
	for i, a := range assemblies {
		members := make([]string, len(a.Members()))
		for j, member := range a.Members() {
			members[j] = writeMember(member)
		}
		parts[i] = fmt.Sprintf("#%d %s %s", a.ID(), a.Shape(), writeShape(a.Shape(), members))
	}
	return fmt.Sprintf("%s: %s", name, strings.Join(parts, "; "))
}

// writeShape writes a state as <c, a, t> and a transition as c -> a -> t.
func writeShape(shape engine.Shape, parts []string) string {
	switch shape {
	case engine.StateShape:
		return "<" + strings.Join(parts, ", ") + ">"
	case engine.TransitionShape:
		return strings.Join(parts, " -> ")
	}
	panic(fmt.Sprintf("interpreter: no way to write shape %d", shape))
}

// c{3}
func writeMember(member engine.Member) string {
	return fmt.Sprintf("%s{%d}", member.Population().Name(), member.Number())
}

func namesOf(names []engine.Name) []string {
	texts := make([]string, len(names))
	for i, name := range names {
		texts[i] = string(name)
	}
	return texts
}
