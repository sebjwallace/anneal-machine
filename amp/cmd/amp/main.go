// Command amp is the AMP REPL: type a line of AMP, and it prints the result back in AMP.
//
// Lines can also be piped in, in which case no prompt is shown.
package main

import (
	"bufio"
	"fmt"
	"os"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/interpreter"
)

const prompt = "amp> "

func main() {
	in := interpreter.New(engine.New())
	interactive := isTerminal(os.Stdin)
	lines := bufio.NewScanner(os.Stdin)
	for showPrompt(interactive); lines.Scan(); showPrompt(interactive) {
		output, err := in.Run(lines.Text())
		switch {
		case err != nil:
			fmt.Fprintln(os.Stderr, "error:", err)
		case output != "":
			fmt.Println(output)
		}
	}
	if err := lines.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
	if interactive {
		fmt.Println()
	}
}

func showPrompt(interactive bool) {
	if interactive {
		fmt.Print(prompt)
	}
}

func isTerminal(f *os.File) bool {
	info, err := f.Stat()
	return err == nil && info.Mode()&os.ModeCharDevice != 0
}
