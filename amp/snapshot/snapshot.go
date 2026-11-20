// Package snapshot saves what the memory holds to a JSON file and opens it again.
//
// A snapshot holds what the memory knows (its declarations, and later its assemblies) and how far its clock has run,
// so moments carry on numbering where they left off. It doesn't hold what is active, so an opened memory starts with
// nothing active. Opening goes back through the engine's own declarations, so a file is checked by the same rules as
// anything typed.
package snapshot

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/sebjwallace/anneal-machine/amp/engine"
)

// version is the snapshot format. A file with any other version is refused rather than guessed at.
const version = 1

type file struct {
	Version     int          `json:"version"`
	Moment      int          `json:"moment"` // the last moment that passed; absent in early files, meaning 0
	Populations []population `json:"populations"`
	Communities []community  `json:"communities"`
}

type population struct {
	Name engine.Name `json:"name"`
	Size int         `json:"size"`
}

type community struct {
	Name        engine.Name   `json:"name"`
	Populations []engine.Name `json:"populations"`
}

// VersionError: the file was written in a snapshot format this engine doesn't read.
type VersionError struct {
	Version int
}

func (e VersionError) Error() string {
	return fmt.Sprintf("snapshot format %d isn't one this engine reads (it reads %d)", e.Version, version)
}

// Write puts the memory's snapshot on w.
func Write(w io.Writer, memory *engine.Memory) error {
	snapshot := file{
		Version:     version,
		Moment:      memory.Moment(),
		Populations: []population{},
		Communities: []community{},
	}
	for _, p := range memory.Populations() {
		snapshot.Populations = append(snapshot.Populations, population{Name: p.Name(), Size: p.Size()})
	}
	for _, c := range memory.Communities() {
		var members []engine.Name
		for _, p := range c.Populations() {
			members = append(members, p.Name())
		}
		snapshot.Communities = append(snapshot.Communities, community{Name: c.Name(), Populations: members})
	}
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	return encoder.Encode(snapshot)
}

// Read builds a new memory from the snapshot on r.
func Read(r io.Reader) (*engine.Memory, error) {
	decoder := json.NewDecoder(r)
	decoder.DisallowUnknownFields()
	var snapshot file
	if err := decoder.Decode(&snapshot); err != nil {
		return nil, fmt.Errorf("not a snapshot: %w", err)
	}
	if snapshot.Version != version {
		return nil, VersionError{Version: snapshot.Version}
	}
	if snapshot.Moment < 0 {
		return nil, fmt.Errorf("moment %d is before the first moment", snapshot.Moment)
	}
	memory := engine.NewAfter(snapshot.Moment)
	for _, p := range snapshot.Populations {
		if _, err := memory.DeclarePopulation(p.Name, p.Size); err != nil {
			return nil, err
		}
	}
	for _, c := range snapshot.Communities {
		if _, err := memory.DeclareCommunity(c.Name, c.Populations); err != nil {
			return nil, err
		}
	}
	return memory, nil
}

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
	if err := Write(temporary, memory); err != nil {
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
	memory, err := Read(f)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return memory, nil
}
