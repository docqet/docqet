// Package project finds the Docqet project a command acts on.
package project

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"

	"go.yaml.in/yaml/v3"
)

// ErrNotInProject is returned when no docqet.yaml is found.
var ErrNotInProject = errors.New("not in a Docqet project: no docqet.yaml here or in any folder above")

// Find returns the folder of the docqet.yaml nearest above dir, dir included:
// the project a command run in dir acts on. It returns ErrNotInProject when
// there's none.
func Find(dir string) (string, error) {
	dir, err := filepath.Abs(dir)
	if err != nil {
		return "", err
	}
	for {
		_, err := os.Stat(filepath.Join(dir, "docqet.yaml"))
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
	return filepath.Join(root, ".docqet", "state.json")
}

// Config is a project's docqet.yaml.
type Config struct {
	Project struct {
		ID   string `yaml:"id"`
		Name string `yaml:"name"`
	} `yaml:"project"`
	// Product is the software product the project is part of, when it names
	// one. Without one, the project is a product of its own.
	Product *struct {
		ID   string `yaml:"id"`
		Name string `yaml:"name"`
	} `yaml:"product"`
	// Server is where the project's Docqet server is, if it has one.
	Server string `yaml:"server"`
}

// ReadConfig reads docqet.yaml from the root of project. It's an error when
// there's none, or it doesn't name the project.
func ReadConfig(project fs.FS) (Config, error) {
	data, err := fs.ReadFile(project, "docqet.yaml")
	if err != nil {
		return Config{}, err
	}
	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return Config{}, fmt.Errorf("docqet.yaml: %w", err)
	}
	if cfg.Project.ID == "" || cfg.Project.Name == "" {
		return Config{}, errors.New("docqet.yaml: project needs an id and a name")
	}
	if cfg.Product != nil && (cfg.Product.ID == "" || cfg.Product.Name == "") {
		return Config{}, errors.New("docqet.yaml: product needs an id and a name")
	}
	return cfg, nil
}
