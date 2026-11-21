package main

import (
	"os"
	"strings"
	"time"

	"charm.land/bubbles/v2/textinput"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/interpreter"
	"github.com/sebjwallace/anneal-machine/amp/snapshot"
)

// AMT only reads. It opens a snapshot, reloads it whenever the file changes (when amp saves), and runs invokes on its
// own copy of the memory, which it never writes back. Invoking only reads what the memory knows.

// screen is which view is showing.
type screen int

const (
	runScreen      screen = iota // populations, states and moments of the last invoke
	assemblyScreen               // every assembly and its members
)

// phase is a member's phase at the moment shown (the owner's terms).
type phase int

const (
	ready phase = iota
	active
	refractory
)

// memberID names one member by its population and its number within it, as c{3} does.
type memberID struct {
	population engine.Name
	number     int
}

func idOf(member engine.Member) memberID {
	return memberID{population: member.Population().Name(), number: member.Number()}
}

// dullCursor is the input cursor's colour: a dim grey, so it shows where typing goes without drawing the eye.
var dullCursor = lipgloss.Color("240")

// watchEvery is how often AMT looks at the snapshot file for changes.
const watchEvery = 500 * time.Millisecond

// playEvery is how long each moment shows while playing: a pace for people to watch, nothing to do with the engine.
const playEvery = 600 * time.Millisecond

// checkFile is the message that it's time to look at the snapshot file again.
type checkFile time.Time

// nextFrame is the message that it's time to show the next moment while playing. It carries which play it belongs
// to, so a pause or a new invoke stops earlier plays from moving things on.
type nextFrame struct{ play int }

type model struct {
	path       string
	memory     *engine.Memory
	fileTime   time.Time // the snapshot file's modification time when last opened
	note       string    // when the snapshot was last opened or reloaded
	problem    string    // the last thing that went wrong, shown until the next success
	invocation *engine.Invocation
	shown      int // which of the invocation's moments is shown
	screen     screen
	selected   int // which assembly the assembly screen shows
	playing    bool
	play       int // counts plays started, to tell a current frame from a stale one
	input      textinput.Model
	width      int
}

func newModel(path string, now time.Time) (model, error) {
	memory, err := snapshot.Open(path)
	if err != nil {
		return model{}, err
	}
	info, err := os.Stat(path)
	if err != nil {
		return model{}, err
	}
	input := textinput.New()
	input.Prompt = "invoke> "
	input.Placeholder = "c, {a, t}"
	styles := input.Styles()
	styles.Cursor.Blink = false
	styles.Cursor.Color = dullCursor
	input.SetStyles(styles)
	input.Focus()
	return model{
		path:     path,
		memory:   memory,
		fileTime: info.ModTime(),
		note:     "opened " + now.Format("15:04:05"),
		input:    input,
		width:    80,
	}, nil
}

func (m model) Init() tea.Cmd { return watch() }

func watch() tea.Cmd {
	return tea.Tick(watchEvery, func(t time.Time) tea.Msg { return checkFile(t) })
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		return m, nil
	case checkFile:
		return m.reloadIfChanged(time.Time(msg)), watch()
	case nextFrame:
		if !m.playing || msg.play != m.play {
			return m, nil
		}
		m = m.advance()
		if !m.playing {
			return m, nil
		}
		return m, m.frame()
	case tea.KeyPressMsg:
		switch key := msg.String(); {
		case key == "ctrl+c" || key == "esc":
			return m, tea.Quit
		case key == "tab":
			m.screen = 1 - m.screen
			return m, nil
		case key == "enter":
			m = m.invoke()
			if m.playing {
				return m, m.frame()
			}
			return m, nil
		case key == "space" && m.screen == runScreen && m.input.Value() == "" && m.invocation != nil:
			m = m.togglePlay()
			if m.playing {
				return m, m.frame()
			}
			return m, nil
		case m.navigate(key):
			return m.moved(key), nil
		}
	}
	var cmd tea.Cmd
	m.input, cmd = m.input.Update(msg)
	return m, cmd
}

// navigate is true when a key moves through moments or assemblies rather than editing the input. Left and right step
// through moments only while the input is empty, so they still move the cursor while typing.
func (m model) navigate(key string) bool {
	switch m.screen {
	case assemblyScreen:
		return key == "up" || key == "down"
	default:
		emptyInput := m.input.Value() == ""
		return emptyInput && (key == "left" || key == "right" || key == "home" || key == "end")
	}
}

func (m model) moved(key string) model {
	if m.screen == runScreen {
		m.playing = false
	}
	switch key {
	case "up":
		m.selected = max(m.selected-1, 0)
	case "down":
		m.selected = min(m.selected+1, max(m.memory.CountAssemblies()-1, 0))
	case "left":
		m.shown = max(m.shown-1, 0)
	case "right":
		m.shown = min(m.shown+1, m.lastMoment())
	case "home":
		m.shown = 0
	case "end":
		m.shown = m.lastMoment()
	}
	return m
}

func (m model) lastMoment() int {
	if m.invocation == nil {
		return 0
	}
	return max(len(m.invocation.Moments)-1, 0)
}

// invoke runs what was typed, as the input to invoke, and shows its first moment.
func (m model) invoke() model {
	typed := strings.TrimSpace(m.input.Value())
	if typed == "" {
		return m
	}
	sequence, err := interpreter.ParseInvokeInput(typed)
	if err != nil {
		m.problem = err.Error()
		return m
	}
	invocation, err := m.memory.Invoke(sequence)
	if err != nil {
		m.problem = err.Error()
		return m
	}
	m.invocation, m.shown, m.problem = &invocation, 0, ""
	m.input.Reset()
	return m.startPlay()
}

func (m model) startPlay() model {
	m.playing = len(m.invocation.Moments) > 1 || m.invocation.RepeatsEvery > 0
	m.play++
	return m
}

func (m model) frame() tea.Cmd {
	play := m.play
	return tea.Tick(playEvery, func(time.Time) tea.Msg { return nextFrame{play: play} })
}

// togglePlay pauses, or plays on from the moment shown; from the end of an invoke that held nothing, it plays again
// from the start.
func (m model) togglePlay() model {
	if m.playing {
		m.playing = false
		return m
	}
	if m.shown == m.lastMoment() && m.invocation.RepeatsEvery == 0 {
		m.shown = 0
	}
	return m.startPlay()
}

// advance shows the next moment. Past the last, a memory that is holding goes round its repeating moments again, as
// it would if left to run; one that held nothing stops.
func (m model) advance() model {
	switch {
	case m.shown < m.lastMoment():
		m.shown++
	case m.invocation.RepeatsEvery > 0:
		m.shown = len(m.invocation.Moments) - m.invocation.RepeatsEvery
	default:
		m.playing = false
	}
	return m
}

// holding is true when the moment shown is one of the moments the memory repeats while something is held.
func (m model) holding() bool {
	return m.invocation != nil && m.invocation.RepeatsEvery > 0 && m.shown >= len(m.invocation.Moments)-m.invocation.RepeatsEvery
}

// reloadIfChanged opens the snapshot again if the file has changed. A snapshot that can't be read leaves the memory
// as it was and says why.
func (m model) reloadIfChanged(now time.Time) model {
	info, err := os.Stat(m.path)
	if err != nil {
		m.problem = err.Error()
		return m
	}
	if info.ModTime().Equal(m.fileTime) {
		return m
	}
	memory, err := snapshot.Open(m.path)
	if err != nil {
		m.problem = err.Error()
		return m
	}
	m.memory, m.fileTime, m.invocation, m.shown, m.playing = memory, info.ModTime(), nil, 0, false
	m.selected = min(m.selected, max(memory.CountAssemblies()-1, 0))
	m.note, m.problem = "reloaded "+now.Format("15:04:05"), ""
	return m
}

// phases gives each member's phase at the moment shown, or now if nothing has been invoked since opening.
func (m model) phases() map[memberID]phase {
	phases := map[memberID]phase{}
	if m.invocation != nil && len(m.invocation.Moments) > 0 {
		moment := m.invocation.Moments[m.shown]
		for _, activation := range moment.Active {
			phases[idOf(activation.Member)] = active
		}
		for _, member := range moment.Refractory {
			phases[idOf(member)] = refractory
		}
		return phases
	}
	for _, p := range m.memory.Populations() {
		inspection, _ := m.memory.Inspect(p.Name())
		for _, member := range inspection.Active {
			phases[idOf(member)] = active
		}
		for _, member := range inspection.Refractory {
			phases[idOf(member)] = refractory
		}
	}
	return phases
}
