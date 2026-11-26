package commands

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/state"
)

// InitCommand makes a folder a Docqet project, writing its docqet.yaml.
// docqet:implements capability:project-setup
func InitCommand() *cli.Command {
	return &cli.Command{
		Name:     "init",
		Category: settingUp,
		Usage:    "Make a folder a Docqet project",
		Description: `Writes docqet.yaml in the current folder, and adds .docqet/ to .gitignore. It
writes no docs: the kit's adopting.md covers bringing Docqet to existing code.
Then run docqet kit to install the agent kit.`,
		ArgValidator: maxArgs(0),
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "id", Usage: "the project's `ID`, in kebab case"},
			&cli.StringFlag{Name: "name", Usage: "the project's `NAME`, named for the software"},
			&cli.StringFlag{Name: "product", Usage: "the `ID` of the product it's part of, if it's one of several projects"},
			&cli.StringFlag{Name: "product-name", Usage: "the product's `NAME`, with --product"},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			id, name := cmd.String("id"), cmd.String("name")
			product, productName := cmd.String("product"), cmd.String("product-name")
			switch {
			case id == "" || name == "":
				return errors.New(`init needs --id and --name, such as --id hotel-bookings --name "Hotel Bookings"`)
			case !state.IsKebab(id):
				return fmt.Errorf("--id %q isn't kebab case, such as hotel-bookings", id)
			case product != "" && !state.IsKebab(product):
				return fmt.Errorf("--product %q isn't kebab case, such as hotel", product)
			case productName != "" && product == "":
				return errors.New("--product-name goes with --product")
			}
			if _, err := os.Stat("docqet.yaml"); err == nil {
				return errors.New("this folder already has a docqet.yaml")
			}
			var b strings.Builder
			fmt.Fprintf(&b, "# Marks this folder as a Docqet project.\nproject:\n  id: %s\n  name: %s\n", id, yamlString(name))
			if product != "" {
				if productName == "" {
					productName = product
				}
				fmt.Fprintf(&b, "# The product it's part of, with its other projects.\nproduct:\n  id: %s\n  name: %s\n", product, yamlString(productName))
			}
			if err := os.WriteFile("docqet.yaml", []byte(b.String()), 0o644); err != nil {
				return err
			}
			out := cmd.Root().Writer
			ignore, err := ensureLines(".gitignore", "# Docqet's state, written by docqet index.", []string{".docqet/"}, ".docqet/", "/.docqet/")
			if err != nil {
				return err
			}
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"files": []fileChange{{Path: "docqet.yaml", Status: "added"}, {Path: ".gitignore", Status: ignore}}})
				return nil
			}
			wd, _ := os.Getwd()
			_, _ = fmt.Fprintf(out, "added     docqet.yaml\n%-9s .gitignore\n\n%s is now a Docqet project. Run docqet kit to install the agent kit.\n", ignore, filepath.Base(wd))
			return nil
		},
	}
}

// yamlString quotes a name for YAML when it needs it.
func yamlString(s string) string {
	if strings.ContainsAny(s, ":#'\"{}[],&*!|>%@`") || strings.TrimSpace(s) != s {
		return fmt.Sprintf("%q", s)
	}
	return s
}

// fileChange is what a command did to one file.
type fileChange struct {
	Path   string `json:"path"`
	Status string `json:"status"` // added, updated, removed or ok
}

// ensureLines adds lines to the end of the file at path, after comment, when
// none of the lines it already has is one of present. It creates the file
// when there isn't one. It returns added, updated or ok.
func ensureLines(path, comment string, lines []string, present ...string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return "", err
	}
	existing := strings.Split(strings.ReplaceAll(string(data), "\r\n", "\n"), "\n")
	if slices.ContainsFunc(existing, func(l string) bool { return slices.Contains(present, strings.TrimSpace(l)) }) {
		return "ok", nil
	}
	status := "updated"
	text := string(data)
	if len(data) == 0 {
		status = "added"
	} else {
		if !strings.HasSuffix(text, "\n") {
			text += "\n"
		}
		text += "\n"
	}
	text += comment + "\n" + strings.Join(lines, "\n") + "\n"
	return status, os.WriteFile(path, []byte(text), 0o644)
}
