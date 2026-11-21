package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"time"

	tea "charm.land/bubbletea/v2"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/snapshot"
)

var noon = time.Date(2026, 11, 21, 12, 0, 0, 0, time.UTC)

var ansi = regexp.MustCompile(`\x1b\[[0-9;]*m`)

func press(m model, keys ...tea.KeyPressMsg) model {
	for _, key := range keys {
		next, _ := m.Update(key)
		m = next.(model)
	}
	return m
}

func typeIn(m model, text string) model {
	for _, r := range text {
		if r == ' ' {
			m = press(m, tea.KeyPressMsg{Code: tea.KeySpace, Text: " "})
			continue
		}
		m = press(m, tea.KeyPressMsg{Code: r, Text: string(r)})
	}
	return press(m, tea.KeyPressMsg{Code: tea.KeyEnter})
}

var (
	rightKey = tea.KeyPressMsg{Code: tea.KeyRight}
	spaceKey = tea.KeyPressMsg{Code: tea.KeySpace, Text: " "}
)

func screen(m model) string { return ansi.ReplaceAllString(m.View().Content, "") }

func fresh(t *testing.T) model {
	t.Helper()
	m, err := newModel("", noon)
	if err != nil {
		t.Fatal(err)
	}
	return m
}

// The owner's example: at the second read's c, it arrives primed by the b member from the first read.
func TestReadingShowsWhatArrivedPrimed(t *testing.T) {
	m := typeIn(fresh(t), "abcd")
	m = typeIn(m, "xbcy")
	m = press(m, spaceKey, rightKey, rightKey) // pause, then step to c
	got := screen(m)
	c := m.reading.Moments[2]
	if c.Burst || !strings.Contains(got, "primed, so "+label(c.Member)+" on") {
		t.Errorf("c should arrive primed:\n%s", got)
	}
	if s := m.scene(); s.members[c.Member] != arrived || s.bonds[*c.Bond] != formed {
		t.Errorf("c should be marked arrived and its new bond formed: %v", s)
	}
	if testing.Verbose() {
		fmt.Println(got)
	}
}

// Moments not reached yet aren't drawn.
func TestEarlyMomentsDrawOnlyWhatTheyReached(t *testing.T) {
	m := typeIn(fresh(t), "the cat")
	m = press(m, spaceKey, tea.KeyPressMsg{Code: tea.KeyHome})
	if s := m.scene(); len(s.members) != 1 || len(s.bonds) != 0 {
		t.Errorf("the first moment should draw only t: %d members, %d bonds", len(s.members), len(s.bonds))
	}
}

func TestReloadsWhenAmpSaves(t *testing.T) {
	path := filepath.Join(t.TempDir(), "reading.json")
	memory := engine.New()
	if err := snapshot.Save(path, memory); err != nil {
		t.Fatal(err)
	}
	m, err := newModel(path, noon)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := memory.Read("abc"); err != nil {
		t.Fatal(err)
	}
	if err := snapshot.Save(path, memory); err != nil {
		t.Fatal(err)
	}
	later := noon.Add(time.Minute)
	os.Chtimes(path, later, later)
	m = m.reloadIfChanged(later)
	if len(m.memory.Bonds()) != 2 {
		t.Errorf("after reloading, %d bonds, want 2", len(m.memory.Bonds()))
	}
}

// The motif the moment shown is in is underlined on the graph and bracketed under the text; one that has ended says so.
func TestMotifsShow(t *testing.T) {
	m := typeIn(fresh(t), "abcd")
	m = typeIn(m, "xbcy")
	m = press(m, spaceKey, tea.KeyPressMsg{Code: tea.KeyEnd}) // y, which burst after the motif b c
	got := screen(m)
	if !strings.Contains(got, "ends the motif of 1 before it") || !strings.Contains(got, "motifs: bc 1") {
		t.Errorf("y should end the motif b c:\n%s", got)
	}
	m = press(m, tea.KeyPressMsg{Code: tea.KeyLeft}) // c
	if s := m.scene(); len(s.motif) != 2 {
		t.Errorf("at c, the motif so far is b and c: %v", s.motif)
	}
	if testing.Verbose() {
		m = typeIn(m, "the cat sat on the mat the dog sat on the log")
		m = typeIn(m, "the dog sat on the mat")
		m = press(m, spaceKey, tea.KeyPressMsg{Code: tea.KeyHome})
		for range 13 {
			m = press(m, tea.KeyPressMsg{Code: tea.KeyRight})
		}
		m.width = 140
		fmt.Println(screen(m))
	}
}

// When y ends the motif b c, #1 is cast and selected: its members are marked in L1B's grids, and both b members of
// L1A are marked as projecting up to it.
func TestCastingShows(t *testing.T) {
	m := typeIn(fresh(t), "abcd")
	m = typeIn(m, "xbcy")
	m = press(m, spaceKey, tea.KeyPressMsg{Code: tea.KeyLeft}) // c: nothing cast yet
	if got := screen(m); strings.Contains(got, "#1 bc") {
		t.Errorf("before y, #1 shouldn't show:\n%s", got)
	}
	m = press(m, tea.KeyPressMsg{Code: tea.KeyEnd}) // y
	got := screen(m)
	if !strings.Contains(got, "cast #1 bc into L1B") || !strings.Contains(got, "◆ #1 bc") || !strings.Contains(got, "1/9") {
		t.Errorf("y should cast and select #1:\n%s", got)
	}
	b, c := m.reading.Moments[1], m.reading.Moments[2]
	s := m.scene()
	if len(s.projects) != 3 || !s.projects[b.Member] || !s.projects[c.Member] {
		t.Errorf("the two b members and c should be marked as projecting up to #1: %v", s.projects)
	}
	if testing.Verbose() {
		m = typeIn(m, "the cat sat on the mat the dog sat on the log")
		m = press(m, spaceKey, tea.KeyPressMsg{Code: tea.KeyEnd})
		m.width = 150
		fmt.Println(screen(m))
		m = press(m, tea.KeyPressMsg{Code: tea.KeyUp}, tea.KeyPressMsg{Code: tea.KeyUp})
		fmt.Println(strings.Join(strings.Split(screen(m), "\n")[:14], "\n"))
	}
}
