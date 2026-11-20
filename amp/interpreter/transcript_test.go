package interpreter_test

import (
	"flag"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/sebjwallace/anneal-machine/amp/engine"
	"github.com/sebjwallace/anneal-machine/amp/interpreter"
)

const prompt = "amp> "

// update rewrites each transcript with what the interpreter actually prints: go test ./interpreter -update.
// Read the diff before keeping it; a transcript is a prediction, and changing one is a decision.
var update = flag.Bool("update", false, "rewrite the transcripts with the actual output")

// exchange is one line typed at the prompt and what the interpreter should print back.
type exchange struct {
	typed    string
	expected string
}

// Each file in testdata is a transcript of a REPL session on a fresh engine, written before the code that passes it.
func TestTranscripts(t *testing.T) {
	paths, err := filepath.Glob(filepath.Join("testdata", "*.txt"))
	if err != nil || len(paths) == 0 {
		t.Fatalf("no transcripts found in testdata: %v", err)
	}
	for _, path := range paths {
		t.Run(filepath.Base(path), func(t *testing.T) {
			exchanges := readTranscript(t, path)
			transcript, err := filepath.Abs(path)
			if err != nil {
				t.Fatal(err)
			}
			t.Chdir(t.TempDir()) // files a transcript saves land here, not in testdata
			in := interpreter.New(engine.New())
			var rewritten strings.Builder
			for _, ex := range exchanges {
				got := respond(in, ex.typed)
				rewritten.WriteString(prompt + ex.typed + "\n")
				if got != "" {
					rewritten.WriteString(got + "\n")
				}
				if got != ex.expected && !*update {
					t.Errorf("%s%s\n got: %q\nwant: %q", prompt, ex.typed, got, ex.expected)
				}
			}
			if *update {
				if err := os.WriteFile(transcript, []byte(rewritten.String()), 0o644); err != nil {
					t.Fatal(err)
				}
			}
		})
	}
}

// respond prints what the REPL would show for one typed line.
func respond(in *interpreter.Interpreter, typed string) string {
	output, err := in.Run(typed)
	if err != nil {
		return "error: " + err.Error()
	}
	return output
}

func readTranscript(t *testing.T, path string) []exchange {
	t.Helper()
	text, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var exchanges []exchange
	var printed []string
	finish := func() {
		if len(exchanges) > 0 {
			exchanges[len(exchanges)-1].expected = strings.TrimRight(strings.Join(printed, "\n"), "\n")
		}
		printed = nil
	}
	for _, line := range strings.Split(string(text), "\n") {
		if typed, ok := strings.CutPrefix(line, prompt); ok {
			finish()
			exchanges = append(exchanges, exchange{typed: typed})
			continue
		}
		printed = append(printed, line)
	}
	finish()
	return exchanges
}
