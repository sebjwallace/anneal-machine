// Package interpreter reads a line of AMP, carries it out on the engine and prints the result back.
//
// The fresh start knows: declaring populations, reading text (invoke "..."), listing bonds, inspecting a population,
// the seed, and saving and opening snapshots.
package interpreter

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/snapshot"
)

type Interpreter struct {
	memory  *engine.Memory
	current string // the file last opened or saved
}

func New(memory *engine.Memory) *Interpreter { return &Interpreter{memory: memory} }

// Memory is the memory the interpreter works on.
func (in *Interpreter) Memory() *engine.Memory { return in.memory }

var (
	namePattern        = `[A-Za-z_][A-Za-z0-9_]*`
	populationsPattern = regexp.MustCompile(`^(` + namePattern + `(?:\s*,\s*` + namePattern + `)*)\s*=\s*(?:population|pop)\s+(-?\d+)$`)
	invokePattern      = regexp.MustCompile(`^(?:invoke|inv)\s+"(.*)"$`)
	inspectPattern     = regexp.MustCompile(`^(?:inspect|insp)\s+(` + namePattern + `)$`)
)

// Run carries out one line and returns what to print.
func (in *Interpreter) Run(line string) (string, error) {
	line = strings.TrimSpace(line)
	if i := strings.Index(line, "//"); i >= 0 && !strings.Contains(line[:i], `"`) {
		line = strings.TrimSpace(line[:i])
	}
	switch {
	case line == "":
		return "", nil
	case populationsPattern.MatchString(line):
		return in.declare(populationsPattern.FindStringSubmatch(line))
	case invokePattern.MatchString(line):
		return in.read(invokePattern.FindStringSubmatch(line)[1])
	case inspectPattern.MatchString(line):
		return in.inspect(engine.Name(inspectPattern.FindStringSubmatch(line)[1]))
	case line == "bonds":
		return in.bonds(), nil
	case line == "seed":
		return fmt.Sprintf("seed %d", in.memory.Seed()), nil
	case strings.HasPrefix(line, "seed "):
		n, err := strconv.ParseUint(strings.TrimSpace(strings.TrimPrefix(line, "seed ")), 10, 64)
		if err != nil {
			return "", errors.New("seed takes a whole number, as in seed 7")
		}
		in.memory.SetSeed(n)
		return fmt.Sprintf("seed %d", n), nil
	case line == "save" || strings.HasPrefix(line, "save "):
		return in.save(strings.TrimSpace(strings.TrimPrefix(line, "save")))
	case strings.HasPrefix(line, "open "):
		return in.Open(strings.TrimSpace(strings.TrimPrefix(line, "open ")))
	}
	return "", fmt.Errorf("can't read %q", line)
}

func (in *Interpreter) declare(match []string) (string, error) {
	size, err := strconv.Atoi(match[2])
	if err != nil {
		return "", err
	}
	var names []engine.Name
	for _, name := range strings.Split(match[1], ",") {
		names = append(names, engine.Name(strings.TrimSpace(name)))
	}
	declared, err := in.memory.DeclarePopulations(names, size)
	if err != nil {
		return "", err
	}
	lines := make([]string, len(declared))
	for i, p := range declared {
		lines[i] = fmt.Sprintf("%s: population of %d", p.Name(), p.Size())
	}
	return strings.Join(lines, "\n"), nil
}

func (in *Interpreter) read(text string) (string, error) {
	reading, err := in.memory.Read(text)
	if err != nil {
		return "", err
	}
	return PrintReading(reading), nil
}

// PrintReading writes a read moment by moment, then a summary line (the text with each character that burst in
// upper case, how many burst and how many bonds formed) and its motifs.
func PrintReading(r engine.Reading) string {
	rows := [][]string{{"moment", "", "arrived", "member", "bond formed", "primes next"}}
	burst, formed := 0, 0
	var marks strings.Builder
	for _, moment := range r.Moments {
		arrived := "primed"
		if moment.Burst {
			arrived = fmt.Sprintf("burst (%d on)", len(moment.Active))
			burst++
		} else if len(moment.Primed) > 1 {
			arrived = "primed: " + joinMembers(moment.Primed)
		}
		member := moment.Member.String()
		if moment.New {
			member += " new"
		}
		bond := ""
		if moment.Bond != nil {
			bond = moment.Bond.String()
			formed++
		}
		rows = append(rows, []string{strconv.Itoa(moment.Number), string(moment.Population), arrived, member, bond, joinMembers(moment.Predicts)})
		mark := string(moment.Population)
		if moment.Burst {
			mark = strings.ToUpper(mark)
		}
		marks.WriteString(mark)
	}
	summary := fmt.Sprintf("%s · %d of %d burst · %d %s formed", marks.String(), burst, len(r.Moments), formed, plural(formed, "bond", "bonds"))
	return table(rows) + "\n" + summary + "\n" + PrintMotifs(r)
}

// PrintMotifs lists a read's motifs, each as the characters it covers and how many predictions it got right.
func PrintMotifs(r engine.Reading) string {
	motifs := r.Motifs()
	if len(motifs) == 0 {
		return "no motifs"
	}
	parts := make([]string, len(motifs))
	for i, l := range motifs {
		var chars strings.Builder
		for _, moment := range r.Moments[l.Start : l.End+1] {
			chars.WriteString(string(moment.Population))
		}
		parts[i] = fmt.Sprintf("%s %d", chars.String(), l.Length())
	}
	return fmt.Sprintf("%s: %s", plural(len(motifs), "motif", "motifs"), strings.Join(parts, " · "))
}

func (in *Interpreter) bonds() string {
	bonds := in.memory.Bonds()
	if len(bonds) == 0 {
		return "no bonds yet"
	}
	lines := make([]string, len(bonds))
	for i, b := range bonds {
		lines[i] = b.String()
	}
	return strings.Join(lines, "\n")
}

func (in *Interpreter) inspect(name engine.Name) (string, error) {
	p, ok := in.memory.Population(name)
	if !ok {
		return "", fmt.Errorf("%s isn't a population", name)
	}
	selected := in.memory.Selected(name)
	lines := []string{fmt.Sprintf("%s: population of %d · %d %s · %d %s", name, p.Size(),
		len(selected), plural(len(selected), "member", "members"),
		p.Size()-len(selected), plural(p.Size()-len(selected), "individual", "individuals"))}
	into := map[engine.Member][]engine.Member{}
	for _, b := range in.memory.Bonds() {
		if b.To.Population == name {
			into[b.To] = append(into[b.To], b.From)
		}
	}
	for _, member := range selected {
		line := "  " + member.String()
		if from := into[member]; len(from) > 0 {
			line += " · from " + joinMembers(from)
		}
		if to := in.memory.BondsFrom(member); len(to) > 0 {
			line += " · to " + joinMembers(to)
		}
		lines = append(lines, line)
	}
	return strings.Join(lines, "\n"), nil
}

func (in *Interpreter) save(path string) (string, error) {
	if path == "" {
		path = in.current
	}
	if path == "" {
		return "", errors.New("save to which file? as in save reading.json")
	}
	if err := snapshot.Save(path, in.memory); err != nil {
		return "", err
	}
	in.current = path
	return "saved " + path, nil
}

// Open replaces the memory with the snapshot at path.
func (in *Interpreter) Open(path string) (string, error) {
	memory, err := snapshot.Open(path)
	if err != nil {
		return "", err
	}
	in.memory, in.current = memory, path
	return fmt.Sprintf("opened %s: %d populations, %d bonds", path, len(memory.Populations()), len(memory.Bonds())), nil
}

func joinMembers(members []engine.Member) string {
	parts := make([]string, len(members))
	for i, m := range members {
		parts[i] = m.String()
	}
	return strings.Join(parts, ", ")
}

func plural(n int, one, many string) string {
	if n == 1 {
		return one
	}
	return many
}

// table lines up columns with two spaces between them, trimming the ends of lines.
func table(rows [][]string) string {
	widths := make([]int, len(rows[0]))
	for _, row := range rows {
		for i, cell := range row {
			widths[i] = max(widths[i], len([]rune(cell)))
		}
	}
	lines := make([]string, len(rows))
	for r, row := range rows {
		var b strings.Builder
		for i, cell := range row {
			b.WriteString(cell)
			if i < len(row)-1 {
				b.WriteString(strings.Repeat(" ", widths[i]-len([]rune(cell))+2))
			}
		}
		lines[r] = strings.TrimRight(b.String(), " ")
	}
	return strings.Join(lines, "\n")
}
