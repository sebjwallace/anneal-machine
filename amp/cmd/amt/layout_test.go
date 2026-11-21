package main

import (
	"fmt"
	"strings"
	"testing"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// Every bond gets a line, for a memory about as busy as the owner judged still readable.
func TestEveryBondIsRouted(t *testing.T) {
	m := engine.New()
	if _, err := m.Read("the cat sat on the mat the dog sat on the log"); err != nil {
		t.Fatal(err)
	}
	l := lay(m)
	for _, b := range m.Bonds() {
		if _, ok := l.routes[b]; !ok {
			t.Errorf("no line for %s", b)
		}
	}
	if testing.Verbose() {
		fmt.Println(strings.Join(draw(l, whole(m), 0, 200), "\n"))
	}
}
