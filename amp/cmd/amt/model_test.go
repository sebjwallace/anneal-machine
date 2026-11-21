package main

import (
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
	"time"

	tea "charm.land/bubbletea/v2"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/interpreter"
	"github.com/sebjwallace/anneal-machine/amp/snapshot"
)

var noon = time.Date(2026, 11, 20, 12, 0, 0, 0, time.UTC)

// saveMemory declares lines of AMP on a fresh memory and saves it, as amp would.
func saveMemory(t *testing.T, path string, lines ...string) {
	t.Helper()
	memory := engine.New()
	in := interpreter.New(memory)
	for _, line := range lines {
		if _, err := in.Run(line); err != nil {
			t.Fatalf("%s: %v", line, err)
		}
	}
	if err := snapshot.Save(path, memory); err != nil {
		t.Fatal(err)
	}
}

var catLines = []string{"refractory on", "c = population 8", "a = population 8", "t = population 8", "cat = <c, a, t> ; c -> a -> t"}

func openCat(t *testing.T) (model, string) {
	t.Helper()
	path := filepath.Join(t.TempDir(), "cat.json")
	saveMemory(t, path, catLines...)
	m, err := newModel(path, noon)
	if err != nil {
		t.Fatal(err)
	}
	return m, path
}

func press(t *testing.T, m model, keys ...tea.KeyPressMsg) model {
	t.Helper()
	for _, key := range keys {
		next, _ := m.Update(key)
		m = next.(model)
	}
	return m
}

func typeIn(t *testing.T, m model, text string) model {
	t.Helper()
	for _, r := range text {
		m = press(t, m, tea.KeyPressMsg{Code: r, Text: string(r)})
	}
	return m
}

var (
	enter = tea.KeyPressMsg{Code: tea.KeyEnter}
	right = tea.KeyPressMsg{Code: tea.KeyRight}
	left  = tea.KeyPressMsg{Code: tea.KeyLeft}
	tab   = tea.KeyPressMsg{Code: tea.KeyTab}
	down  = tea.KeyPressMsg{Code: tea.KeyDown}
)

var styling = regexp.MustCompile(`\x1b\[[0-9;]*m`)

// screen is what the view shows, without styling.
func screenOf(m model) string { return styling.ReplaceAllString(m.View().Content, "") }

func TestInvokingShowsEachMomentAsItWas(t *testing.T) {
	m, _ := openCat(t)

	m = press(t, typeIn(t, m, "c"), enter)

	if got := screenOf(m); !strings.Contains(got, "moment 1 · 1 of 4") || !strings.Contains(got, "cat <c, a, t>   1 of 3") {
		t.Fatalf("after invoke c, want moment 1 with cat 1 of 3, got:\n%s", got)
	}
	m = press(t, m, right, right, right)
	got := screenOf(m)
	if !strings.Contains(got, "moment 4 · 4 of 4") || !strings.Contains(got, "cat <c, a, t>   3 of 3") {
		t.Fatalf("at the last moment, want cat 3 of 3, got:\n%s", got)
	}
	if !strings.Contains(got, "a  ● ·") || !strings.Contains(got, "c  ◐ ·") {
		t.Errorf("at moment 4, want a{1} active and c{1} refractory, got:\n%s", got)
	}
	if !strings.Contains(got, "held       repeating every 2 moments") {
		t.Errorf("want the moment table as amp prints it, got:\n%s", got)
	}
}

func TestArrowsEditTheInputWhileThereIsSomethingTyped(t *testing.T) {
	m, _ := openCat(t)
	m = press(t, typeIn(t, m, "c"), enter)

	m = press(t, typeIn(t, m, "t"), right)

	if !strings.Contains(screenOf(m), "moment 1 · 1 of 4") {
		t.Errorf("right with input typed should not step, got:\n%s", screenOf(m))
	}
}

func TestInputThatIsNotAMPIsReportedAndKept(t *testing.T) {
	m, _ := openCat(t)

	m = press(t, typeIn(t, m, "c, z"), enter)

	got := screenOf(m)
	if !strings.Contains(got, "error: z is not declared") || m.input.Value() != "c, z" {
		t.Errorf("want the refusal shown and the input kept, got %q and:\n%s", m.input.Value(), got)
	}
}

func TestSavingInAmpReloadsTheMemory(t *testing.T) {
	m, path := openCat(t)
	m = press(t, typeIn(t, m, "c"), enter)

	saveMemory(t, path, append(catLines, "o = population 8", "cot = <c, o, t> ; c -> o -> t")...)
	m.fileTime = time.Time{} // the save may land within the file system's time resolution
	next, _ := m.Update(checkFile(noon.Add(time.Minute)))
	m = next.(model)

	got := screenOf(m)
	if !strings.Contains(got, "reloaded 12:01:00") || !strings.Contains(got, "cot <c, o, t>   0 of 3") {
		t.Fatalf("want the new memory with cot, got:\n%s", got)
	}
	if m.invocation != nil {
		t.Error("an invoke from before the reload should be cleared")
	}
}

func TestTheAssemblyScreenShowsMembersAndPhases(t *testing.T) {
	m, _ := openCat(t)
	m = press(t, typeIn(t, m, "c"), enter, right, right, right)

	m = press(t, m, tab, down)

	got := screenOf(m)
	if !strings.Contains(got, "#2 cat transition c -> a -> t") || !strings.Contains(got, "a{1}   ● active") || !strings.Contains(got, "c{1}   ◐ refractory") {
		t.Errorf("want the transition chosen, with a{1} active and c{1} refractory, got:\n%s", got)
	}
}

func TestTheCursorDoesNotBlink(t *testing.T) {
	m, _ := openCat(t)

	if cursor := m.input.Styles().Cursor; cursor.Blink || cursor.Color != dullCursor {
		t.Errorf("want a steady dull cursor, got blink %v, colour %v", cursor.Blink, cursor.Color)
	}
	if blink := m.input.Focus(); blink != nil {
		t.Error("focusing the input should start no blink timer")
	}
}

func TestAMemoryWithNoAssembliesSaysSo(t *testing.T) {
	path := filepath.Join(t.TempDir(), "letters.json")
	saveMemory(t, path, "c = population 8", "a = population 8", "t = population 8", "cat = community c, a, t")
	m, err := newModel(path, noon)
	if err != nil {
		t.Fatal(err)
	}

	if got := screenOf(m); !strings.Contains(got, "refractory off") {
		t.Errorf("want the title to show the refractory period is off, got:\n%s", got)
	}
	if got := screenOf(m); !strings.Contains(got, "no assemblies yet, so invoking only shows the input") {
		t.Errorf("want a note that there is nothing to recall, got:\n%s", got)
	}
}

var space = tea.KeyPressMsg{Code: tea.KeySpace, Text: " "}

// frame delivers the next play frame, as the timer would.
func frame(t *testing.T, m model) model {
	t.Helper()
	next, _ := m.Update(nextFrame{play: m.play})
	return next.(model)
}

func TestAnInvokePlaysItselfAndKeepsAHeldStateGoing(t *testing.T) {
	m, _ := openCat(t)
	m = press(t, typeIn(t, m, "c"), enter)
	if !m.playing || m.shown != 0 {
		t.Fatalf("an invoke should start playing from its first moment, got playing %v at %d", m.playing, m.shown)
	}

	var shown []int
	for range 6 {
		m = frame(t, m)
		shown = append(shown, m.invocation.Moments[m.shown].Number)
	}

	// moments 1 to 4, then "cat" holds: 3 and 4 repeat
	if want := []int{2, 3, 4, 3, 4, 3}; !slices.Equal(shown, want) {
		t.Errorf("played moments %v, want %v", shown, want)
	}
	if !strings.Contains(screenOf(m), "held, repeating every 2 moments") {
		t.Errorf("want the screen to say it is held, got:\n%s", screenOf(m))
	}
}

func TestPlayingStopsAtTheEndWhenNothingIsHeld(t *testing.T) {
	m, _ := openCat(t)
	m = press(t, typeIn(t, m, "t"), enter)

	m = frame(t, frame(t, m))

	if m.playing || m.shown != m.lastMoment() {
		t.Errorf("want stopped at the last moment, got playing %v at %d", m.playing, m.shown)
	}
}

func TestSpacePausesAndArrowsStep(t *testing.T) {
	m, _ := openCat(t)
	m = press(t, typeIn(t, m, "c"), enter)

	m = press(t, m, space)
	if m.playing {
		t.Fatal("space should pause")
	}
	m = frame(t, m)
	if m.shown != 0 {
		t.Errorf("a paused play should not move on, got moment index %d", m.shown)
	}
	m = press(t, m, space, right)
	if m.playing || m.shown != 1 {
		t.Errorf("an arrow should pause and step, got playing %v at %d", m.playing, m.shown)
	}
}

func TestSpaceIsTypedWhileThereIsInput(t *testing.T) {
	m, _ := openCat(t)

	m = typeIn(t, m, "{c, t}")

	if m.input.Value() != "{c, t}" {
		t.Errorf("want the space typed, got %q", m.input.Value())
	}
}
