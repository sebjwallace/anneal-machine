// Command amt is the Associative Memory Terminal: a view of a memory for people.
//
// Usage: amt [snapshot]. Type text and press enter: AMT reads it into its own copy of the memory and plays it moment
// by moment, each member drawn with the bonds between them. Given a snapshot saved by amp, it opens it first and opens
// it again whenever amp saves. AMT never writes the snapshot.
package main

import (
	"fmt"
	"os"
	"time"

	tea "charm.land/bubbletea/v2"
)

func main() {
	path := ""
	switch len(os.Args) {
	case 1:
	case 2:
		path = os.Args[1]
	default:
		fmt.Fprintln(os.Stderr, "usage: amt [snapshot]")
		os.Exit(2)
	}
	m, err := newModel(path, time.Now())
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
	if _, err := tea.NewProgram(m).Run(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
