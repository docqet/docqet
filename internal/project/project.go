// Package project finds the Docket project a command acts on.
package project

import (
	"errors"
	"os"
	"path/filepath"
)

// ErrNotInProject is returned when no docket.yaml is found.
var ErrNotInProject = errors.New("not in a Docket project: no docket.yaml here or in any folder above")

// Find returns the folder of the docket.yaml nearest above dir, dir included:
// the project a command run in dir acts on. It returns ErrNotInProject when
// there's none.
func Find(dir string) (string, error) {
	dir, err := filepath.Abs(dir)
	if err != nil {
		return "", err
	}
	for {
		_, err := os.Stat(filepath.Join(dir, "docket.yaml"))
		if err == nil {
			return dir, nil
		}
		if !errors.Is(err, os.ErrNotExist) {
			return "", err
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", ErrNotInProject
		}
		dir = parent
	}
}

// StatePath is where a project's working tree state is kept, in the project
// at root.
func StatePath(root string) string {
	return filepath.Join(root, ".docket", "state.json")
}
