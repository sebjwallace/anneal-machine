package main

import (
	"os"
	"strings"
	"time"

	"charm.land/bubbles/v2/textinput"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/snapshot"
)

// AMT reads text into its own copy of the memory and shows it moment by moment as members joined by bonds. Given a
// snapshot, it opens it and opens it again whenever amp saves; it never writes it.

var dullCursor = lipgloss.Color("240")

const (
	watchEvery = 500 * time.Millisecond
	playEvery  = 600 * time.Millisecond
)

type checkFile time.Time

type nextFrame struct{ play int }

type model struct {
	path     string // the snapshot watched, or "" for a memory of AMT's own
	memory   *engine.Memory
	fileTime time.Time
	note     string
	problem  string

	layout layout
	// The last read, and what the memory held before it, so each moment shows only what it had reached.
	reading       *engine.Reading
	membersBefore map[engine.Member]bool
	bondsBefore   int
	shown         int

	playing bool
	play    int
	input   textinput.Model
	width   int
}

func newModel(path string, now time.Time) (model, error) {
	m := model{path: path, memory: engine.New(), note: "new memory", width: 100}
	if path != "" {
		memory, err := snapshot.Open(path)
		if err != nil {
			return model{}, err
		}
		info, err := os.Stat(path)
		if err != nil {
			return model{}, err
		}
		m.memory, m.fileTime, m.note = memory, info.ModTime(), "opened "+now.Format("15:04:05")
	}
	input := textinput.New()
	input.Prompt = "invoke> "
	input.Placeholder = "the cat sat on the mat"
	styles := input.Styles()
	styles.Cursor.Blink = false
	styles.Cursor.Color = dullCursor
	input.SetStyles(styles)
	input.Focus()
	m.input = input
	m.layout = lay(m.memory)
	return m, nil
}

func (m model) Init() tea.Cmd {
	if m.path == "" {
		return nil
	}
	return watch()
}

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
		if m.shown < m.lastMoment() {
			m.shown++
		}
		if m.shown == m.lastMoment() {
			m.playing = false
			return m, nil
		}
		return m, m.frame()
	case tea.KeyPressMsg:
		emptyInput := m.input.Value() == ""
		switch key := msg.String(); {
		case key == "ctrl+c" || key == "esc":
			return m, tea.Quit
		case key == "enter":
			m = m.read()
			if m.playing {
				return m, m.frame()
			}
			return m, nil
		case key == "space" && emptyInput && m.reading != nil:
			m = m.togglePlay()
			if m.playing {
				return m, m.frame()
			}
			return m, nil
		case emptyInput && (key == "left" || key == "right" || key == "home" || key == "end"):
			m.playing = false
			switch key {
			case "left":
				m.shown = max(m.shown-1, 0)
			case "right":
				m.shown = min(m.shown+1, m.lastMoment())
			case "home":
				m.shown = 0
			case "end":
				m.shown = m.lastMoment()
			}
			return m, nil
		}
	}
	var cmd tea.Cmd
	m.input, cmd = m.input.Update(msg)
	return m, cmd
}

func (m model) lastMoment() int {
	if m.reading == nil {
		return 0
	}
	return max(len(m.reading.Moments)-1, 0)
}

// read reads what was typed into AMT's memory and plays it from its first moment.
func (m model) read() model {
	text := m.input.Value()
	if strings.TrimSpace(text) == "" {
		return m
	}
	before := map[engine.Member]bool{}
	for _, member := range order(m.memory) {
		before[member] = true
	}
	bondsBefore := len(m.memory.Bonds())
	reading, err := m.memory.Read(text)
	if err != nil {
		m.problem = err.Error()
		return m
	}
	m.reading, m.membersBefore, m.bondsBefore, m.shown, m.problem = &reading, before, bondsBefore, 0, ""
	m.layout = lay(m.memory)
	m.input.Reset()
	m.playing = len(reading.Moments) > 1
	m.play++
	return m
}

func (m model) frame() tea.Cmd {
	play := m.play
	return tea.Tick(playEvery, func(time.Time) tea.Msg { return nextFrame{play: play} })
}

func (m model) togglePlay() model {
	if m.playing {
		m.playing = false
		return m
	}
	if m.shown == m.lastMoment() {
		m.shown = 0
	}
	m.playing = true
	m.play++
	return m
}

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
	m.memory, m.fileTime, m.reading, m.shown, m.playing = memory, info.ModTime(), nil, 0, false
	m.layout = lay(memory)
	m.note, m.problem = "reloaded "+now.Format("15:04:05"), ""
	return m
}

// scene is what the moment shown has reached, coloured: with no read yet, the whole memory, uncoloured.
func (m model) scene() scene {
	if m.reading == nil {
		return whole(m.memory)
	}
	s := scene{members: map[engine.Member]mark{}, bonds: map[engine.Bond]mark{}}
	for member := range m.membersBefore {
		s.members[member] = plain
	}
	for _, b := range m.memory.Bonds()[:m.bondsBefore] {
		s.bonds[b] = plain
	}
	for _, moment := range m.reading.Moments[:m.shown+1] {
		s.members[moment.Member] = plain
		if moment.Bond != nil {
			s.bonds[*moment.Bond] = plain
		}
	}
	moment := m.reading.Moments[m.shown]
	if moment.Burst {
		for member := range s.members {
			if member.Population == moment.Population {
				s.members[member] = burst
			}
		}
		s.members[moment.Member] = picked
	} else {
		for _, member := range moment.Active {
			s.members[member] = arrived
		}
	}
	predicted := map[engine.Member]bool{}
	for _, member := range moment.Predicts {
		predicted[member] = true
		if s.members[member] == plain {
			s.members[member] = primed
		}
	}
	for _, from := range moment.Active {
		for b := range s.bonds {
			if b.From == from && predicted[b.To] {
				s.bonds[b] = primed
			}
		}
	}
	if moment.Bond != nil {
		s.bonds[*moment.Bond] = formed
	}
	if l, in := m.reading.LullAt(m.shown); in {
		s.lull = map[engine.Member]bool{}
		for _, member := range l.Members(*m.reading) {
			s.lull[member] = true
		}
	}
	return s
}
