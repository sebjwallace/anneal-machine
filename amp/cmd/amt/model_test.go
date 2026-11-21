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
