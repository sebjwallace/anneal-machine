// Command amp is the AMP REPL: type a line of AMP, and it prints the result back in AMP.
//
// Usage: amp [snapshot]. Given a snapshot saved with "save", it opens it first.
//
// At a terminal, lines are edited as in any shell: arrows move and recall earlier lines, and Ctrl-R searches them.
// Earlier lines are kept between sessions in ~/.amp_history. "exit", Ctrl-C or Ctrl-D quits. Lines can also be piped
// in, in which case no prompt is shown and "exit" stops reading.
package main

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/peterh/liner"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/interpreter"
)

const prompt = "amp> "

// exitCommand quits the REPL. It belongs to the REPL, not to AMP, so it is only recognised on a line of its own:
// "exit = population 8" still declares a population.
const exitCommand = "exit"

func isExit(line string) bool { return strings.TrimSpace(line) == exitCommand }

func main() {
	in := interpreter.New(engine.New())
	switch len(os.Args) {
	case 1:
	case 2:
		opened, err := in.Open(os.Args[1])
		if err != nil {
			fmt.Fprintln(os.Stderr, "error:", err)
			os.Exit(1)
		}
		fmt.Println(opened)
	default:
		fmt.Fprintln(os.Stderr, "usage: amp [snapshot]")
		os.Exit(2)
	}

	var err error
	if isTerminal(os.Stdin) && isTerminal(os.Stdout) {
		err = typeLines(in)
	} else {
		err = pipeLines(in)
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

// typeLines runs the REPL at a terminal, with line editing and history.
func typeLines(in *interpreter.Interpreter) error {
	editor := liner.NewLiner()
	defer editor.Close()
	editor.SetCtrlCAborts(true)

	history := historyFile()
	readHistory(editor, history)
	defer writeHistory(editor, history)

	for {
		line, err := editor.Prompt(prompt)
		switch {
		case errors.Is(err, liner.ErrPromptAborted), errors.Is(err, io.EOF): // Ctrl-C, Ctrl-D
			fmt.Println()
			return nil
		case err != nil:
			return err
		}
		if strings.TrimSpace(line) != "" {
			editor.AppendHistory(line)
		}
		if isExit(line) {
			return nil
		}
		respond(in, line)
	}
}

// pipeLines runs each line piped in, with no prompt.
func pipeLines(in *interpreter.Interpreter) error {
	lines := bufio.NewScanner(os.Stdin)
	for lines.Scan() && !isExit(lines.Text()) {
		respond(in, lines.Text())
	}
	return lines.Err()
}

func respond(in *interpreter.Interpreter, line string) {
	output, err := in.Run(line)
	switch {
	case err != nil:
		fmt.Fprintln(os.Stderr, "error:", err)
	case output != "":
		fmt.Println(output)
	}
}

// historyFile is where earlier lines are kept between sessions, or "" if there is no home directory to keep them in.
func historyFile() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(home, ".amp_history")
}

// readHistory recalls lines from earlier sessions. Having none yet is normal.
func readHistory(editor *liner.State, path string) {
	if path == "" {
		return
	}
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()
	editor.ReadHistory(f)
}

// writeHistory keeps this session's lines for the next. History is a convenience, so failing to keep it is reported
// but doesn't stop anything.
func writeHistory(editor *liner.State, path string) {
	if path == "" {
		return
	}
	f, err := os.Create(path)
	if err == nil {
		_, err = editor.WriteHistory(f)
		err = errors.Join(err, f.Close())
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, "couldn't keep the history:", err)
	}
}

func isTerminal(f *os.File) bool {
	info, err := f.Stat()
	return err == nil && info.Mode()&os.ModeCharDevice != 0
}
