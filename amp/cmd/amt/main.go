// Command amt is the Associative Memory Terminal: a view of a memory for people.
//
// Usage: amt <snapshot>. It opens a snapshot saved by amp and reloads it whenever amp saves again. Type the input to
// an invoke and step through its moments; tab shows every assembly. AMT only reads: it never writes the snapshot.
package main

import (
	"fmt"
	"os"
	"time"

	tea "charm.land/bubbletea/v2"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: amt <snapshot>")
		os.Exit(2)
	}
	m, err := newModel(os.Args[1], time.Now())
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
	if _, err := tea.NewProgram(m).Run(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
