// Package snapshot saves the memory to a file and opens it again. What goes in a snapshot, and how it is checked
// on the way back in, is the engine's business (engine.Memory.WriteSnapshot, engine.ReadSnapshot); this package
// looks after the file.
package snapshot

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// Save writes the memory's snapshot to path. It writes a temporary file beside it and renames it into place, so a
// failed save never leaves a half-written snapshot.
func Save(path string, memory *engine.Memory) (err error) {
	temporary, err := os.CreateTemp(filepath.Dir(path), "."+filepath.Base(path)+".*")
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			os.Remove(temporary.Name())
		}
	}()
	if err := memory.WriteSnapshot(temporary); err != nil {
		temporary.Close()
		return err
	}
	if err := temporary.Close(); err != nil {
		return err
	}
	return os.Rename(temporary.Name(), path)
}

// Open reads the snapshot at path into a new memory.
func Open(path string) (*engine.Memory, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	memory, err := engine.ReadSnapshot(f)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return memory, nil
}
