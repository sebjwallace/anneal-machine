// Command c105 runs experiment C105: how a winner in L1B holds through a burst. See
// experiments/sketches/C105-winner-holds.
package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

type config struct {
	name   string
	hold   engine.HoldRule
	window int
	picked bool
}

var configs = func() []config {
	holds := []config{
		{name: "clear", hold: engine.HoldClear},
		{name: "keep", hold: engine.HoldKeep},
		{name: "keep+", hold: engine.HoldKeepPlus},
		{name: "window 4", hold: engine.HoldWindow, window: 4},
		{name: "window 8", hold: engine.HoldWindow, window: 8},
	}
	var all []config
	for _, picked := range []bool{false, true} {
		for _, h := range holds {
			h.picked = picked
			all = append(all, h)
		}
	}
	return all
}()

func (c config) label() string {
	up := "every member"
	if c.picked {
		up = "picked only"
	}
	return fmt.Sprintf("%-8s · burst projects up %s", c.name, up)
}

func (c config) set() {
	engine.Hold, engine.Window, engine.BurstUpPickedOnly = c.hold, c.window, c.picked
}

func must(m *engine.Memory, text string) engine.Reading {
	r, err := m.Read(text)
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
	return r
}

// seed is the seed every memory in a run starts with.
var seed uint64 = 1

func trainA() *engine.Memory {
	m := engine.New()
	m.SetSeed(seed)
	for _, text := range []string{"the cat meow", "the cat meow", "the dog bark", "the dog bark"} {
		must(m, text)
	}
	return m
}

func name(m *engine.Memory, id int) string {
	if id == 0 {
		return "-"
	}
	a, _ := m.Assembly(id)
	return a.Name()
}

// trace writes the read with the winner under each character, as the assembly's ID, and returns the winner at each
// moment.
func trace(m *engine.Memory, r engine.Reading) (string, []int) {
	var text, ids strings.Builder
	var winners []int
	for i, moment := range r.Moments {
		c := string(r.Text[i])
		if c == " " {
			c = "_"
		}
		if moment.Burst {
			c = strings.ToUpper(c)
		}
		w := moment.L1B.Winner
		winners = append(winners, w)
		cell := "."
		if w > 0 {
			cell = fmt.Sprint(w)
		}
		width := max(len(cell), 1)
		text.WriteString(fmt.Sprintf("%-*s ", width, c))
		ids.WriteString(fmt.Sprintf("%-*s ", width, cell))
	}
	return text.String() + "\n    " + ids.String(), winners
}

type check struct {
	text  string
	want  string // the phrase that should win at the end
	never string // a phrase that should never win
	then  string // for A3: the phrase that should win first
}

var checks = []check{
	{text: "the purring cat meow", want: "the_cat_meow", never: "the_dog_bark"},
	{text: "the loud dog bark", want: "the_dog_bark", never: "the_cat_meow"},
	{text: "the dog bark the cat meow", want: "the_cat_meow", then: "the_dog_bark"},
	{text: "meow the cat", want: "the_cat_meow"},
}

func main() {
	if len(os.Args) == 2 {
		fmt.Sscan(os.Args[1], &seed) // go run ./cmd/c105 <seed>: the detailed run for that seed
	}
	trained := trainA()
	fmt.Println("Test bed A: assemblies cast by training (the cat meow ×2, the dog bark ×2)")
	for _, a := range trained.Assemblies() {
		fmt.Printf("  #%d %s\n", a.ID, a.Name())
	}
	fmt.Println()

	summary := [][]string{{"rule", "A1", "A2", "A3", "A4", "B takeovers", "B weak"}}
	for _, c := range configs {
		c.set()
		fmt.Println("== " + c.label())
		row := []string{c.label()}
		for i, ch := range checks {
			m := trainA()
			r := must(m, ch.text)
			text, winners := trace(m, r)
			final := name(m, winners[len(winners)-1])
			pass := final == ch.want
			firstOK := ch.then == ""
			for _, w := range winners {
				if ch.never != "" && name(m, w) == ch.never {
					pass = false
				}
				if ch.then != "" && name(m, w) == ch.then {
					firstOK = true
				}
			}
			pass = pass && firstOK
			mark := "fail"
			if pass {
				mark = "pass"
			}
			fmt.Printf("A%d %s: ends on %s · %s\n    %s\n", i+1, ch.text, final, mark, text)
			row = append(row, fmt.Sprintf("%s (%s)", mark, final))
		}
		takeovers, weak := sentences()
		fmt.Printf("B: %d takeovers, %d weak\n\n", takeovers, weak)
		summary = append(summary, append(row, fmt.Sprint(takeovers), fmt.Sprint(weak)))
	}
	fmt.Println("Summary (seed 1)")
	for _, row := range summary {
		fmt.Println("  " + strings.Join(row, " | "))
	}
	seeds()
}

// seeds runs every rule over seeds 1 to 10 (the seed decides which members are picked) and counts how many seeds
// pass each test, with B's takeovers summed.
func seeds() {
	fmt.Println()
	fmt.Println("Over seeds 1–10: seeds passing each test; B takeovers and weak takeovers, summed")
	for _, c := range configs {
		c.set()
		passes := make([]int, len(checks))
		allFour, takeovers, weak := 0, 0, 0
		for s := uint64(1); s <= 10; s++ {
			seed = s
			all := true
			for i, ch := range checks {
				m := trainA()
				r := must(m, ch.text)
				_, winners := trace(m, r)
				pass := name(m, winners[len(winners)-1]) == ch.want
				firstOK := ch.then == ""
				for _, w := range winners {
					if ch.never != "" && name(m, w) == ch.never {
						pass = false
					}
					if ch.then != "" && name(m, w) == ch.then {
						firstOK = true
					}
				}
				if pass && firstOK {
					passes[i]++
				} else {
					all = false
				}
			}
			if all {
				allFour++
			}
			t, w := sentences()
			takeovers, weak = takeovers+t, weak+w
		}
		fmt.Printf("  %s | A1 %2d | A2 %2d | A3 %2d | A4 %2d | all four %2d | B %3d takeovers, %3d weak\n",
			c.label(), passes[0], passes[1], passes[2], passes[3], allFour, takeovers, weak)
	}
	seed = 1
}

// sentences reads test bed B and counts takeovers (a winner replaced by another) and weak ones (the new winner has
// only one member confirmed).
func sentences() (int, int) {
	m := engine.New()
	m.SetSeed(seed)
	takeovers, weak := 0, 0
	for _, text := range []string{
		"the cat sat on the mat the dog sat on the log",
		"the dog sat on the mat",
		"the cat sat on the log",
		"a dog and a cat sat on a mat",
		"the mat",
	} {
		r := must(m, text)
		for _, moment := range r.Moments {
			l := moment.L1B
			if l.Was > 0 && l.Winner != l.Was && l.Winner > 0 {
				takeovers++
				if l.Gates[l.Winner-1].Confirmed <= 1 {
					weak++
				}
			}
		}
	}
	return takeovers, weak
}
