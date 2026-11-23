// Runs scenarios.json on the Go engine (amp/engine on main) and prints every moment, in the same form as run-js.js.
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"c122check/engine" // copied from amp/engine by check.sh
)

type step struct {
	Word    string     `json:"word"`
	Letters []string   `json:"letters"`
	Reset   bool       `json:"reset"`
	Anneal  []string   `json:"anneal"`
	Invoke  [][]string `json:"invoke"`
}
type scenario struct {
	Name        string   `json:"name"`
	Refractory  bool     `json:"refractory"`
	Size        int      `json:"size"`
	Populations []string `json:"populations"`
	Steps       []step   `json:"steps"`
}

func label(m engine.Member) string { return fmt.Sprintf("%s{%d}", m.Population().Name(), m.Number()) }

func main() {
	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		panic(err)
	}
	var scenarios []scenario
	if err := json.Unmarshal(data, &scenarios); err != nil {
		panic(err)
	}
	var out []string
	for _, sc := range scenarios {
		out = append(out, "# "+sc.Name)
		mem := engine.New()
		mem.SetRefractoryPeriod(sc.Refractory)
		names := make([]engine.Name, len(sc.Populations))
		for i, p := range sc.Populations {
			names[i] = engine.Name(p)
		}
		if _, err := mem.DeclarePopulations(names, sc.Size); err != nil {
			panic(err)
		}
		for _, st := range sc.Steps {
			switch {
			case st.Word != "":
				letters := make([]engine.Name, len(st.Letters))
				for i, l := range st.Letters {
					letters[i] = engine.Name(l)
				}
				if _, err := mem.DeclareAssemblies(engine.Name(st.Word), []engine.Outline{{Shape: engine.StateShape, Names: letters}, {Shape: engine.TransitionShape, Names: letters}}); err != nil {
					panic(err)
				}
			case st.Reset:
				mem.Reset()
			case st.Anneal != nil:
				wholes := []engine.Name{engine.Name(st.Anneal[0]), engine.Name(st.Anneal[1])}
				r, err := mem.Anneal(wholes)
				if err != nil {
					out = append(out, fmt.Sprintf("anneal %s refused", strings.Join(st.Anneal, ",")))
					continue
				}
				var shared []string
				for _, s := range r.Shared {
					shared = append(shared, string(s))
				}
				out = append(out, fmt.Sprintf("anneal %s shares %s", strings.Join(st.Anneal, ","), strings.Join(shared, "")))
			case st.Invoke != nil:
				seq := make([][]engine.Name, len(st.Invoke))
				for i, mo := range st.Invoke {
					for _, n := range mo {
						seq[i] = append(seq[i], engine.Name(n))
					}
				}
				inv, err := mem.Invoke(seq)
				if err != nil {
					panic(err)
				}
				for _, mo := range inv.Moments {
					var act []string
					for _, a := range mo.Active {
						var gates []string
						for _, g := range a.Gates {
							if g.Assembly.Shape() == engine.TransitionShape {
								gates = append(gates, fmt.Sprintf("#%d<%s", g.Assembly.ID(), label(g.From)))
							} else {
								gates = append(gates, fmt.Sprintf("#%d:%d", g.Assembly.ID(), g.Counted))
							}
						}
						plus := ""
						if !a.Arrived {
							plus = "+"
						}
						act = append(act, fmt.Sprintf("%s%s[%s]", label(a.Member), plus, strings.Join(gates, " ")))
					}
					var ref []string
					for _, m := range mo.Refractory {
						ref = append(ref, label(m))
					}
					var unexpl []string
					for _, p := range mo.Unexplained {
						unexpl = append(unexpl, string(p.Name()))
					}
					var comps []string
					for _, c := range mo.Competitions {
						var rs []string
						for _, r := range c.Rivals {
							o := map[engine.Outcome]string{engine.Won: "won", engine.Held: "held", engine.Lost: "lost"}[r.Outcome]
							rs = append(rs, fmt.Sprintf("#%d:%d:%s", r.Assembly.ID(), r.Counted, o))
						}
						comps = append(comps, strings.Join(rs, "/"))
					}
					out = append(out, fmt.Sprintf("%d | %s | ref %s | unexpl %s | %s", mo.Number, strings.Join(act, " "), strings.Join(ref, " "), strings.Join(unexpl, ""), strings.Join(comps, " ; ")))
				}
				out = append(out, fmt.Sprintf("repeats %d", inv.RepeatsEvery))
			}
		}
		for _, a := range mem.AllAssemblies() {
			var ms []string
			for _, m := range a.Members() {
				ms = append(ms, label(m))
			}
			out = append(out, fmt.Sprintf("#%d %s %s", a.ID(), a.Shape(), strings.Join(ms, " ")))
		}
	}
	fmt.Println(strings.Join(out, "\n"))
}
