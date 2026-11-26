package commands

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"slices"
	"strings"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/project"
	"github.com/exalynt/docket/kit"
)

// The markers around the kit's block in a project's AGENTS.md.
const (
	kitStart = "<!-- docket-kit:start -->"
	kitEnd   = "<!-- docket-kit:end -->"
)

// skillDir is where the kit's skill is written: .agents/skills/, where most
// agents look for a project's skills. Claude Code, which doesn't look there
// yet, reads it because the kit's block in AGENTS.md says where it is.
const skillDir = ".agents/skills/docket"

// oldSkillDir is where an earlier kit also wrote the skill, for Claude Code.
// Running the kit removes it.
const oldSkillDir = ".claude/skills/docket"

// KitCommand installs or updates the agent kit in the project.
// docket:implements capability:kit-install
func KitCommand() *cli.Command {
	return &cli.Command{
		Name:     "kit",
		Category: settingUp,
		Usage:    "Install or update the agent kit",
		Description: `Writes the agent kit this version of docket carries into the project, at its
root: the docket skill into .agents/skills/docket/, the kit's block between
its markers in AGENTS.md, an @AGENTS.md line in an existing CLAUDE.md, and the
skill's folder in .docketignore. It removes the copy of the skill an earlier
kit wrote to .claude/skills/docket/. It changes
nothing else, so it's safe to run again after updating docket. --check
changes nothing, and exits 1 if the project's copy isn't this kit, for CI.`,
		Before: maxArgs(0),
		Flags: []cli.Flag{
			&cli.BoolFlag{Name: "check", Usage: "exit 1 if the project's copy isn't this version's kit, for CI"},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			wd, err := os.Getwd()
			if err != nil {
				return err
			}
			root, err := project.Find(wd)
			if err != nil {
				return err
			}
			changes, err := installKit(root, cmd.Bool("check"))
			if err != nil {
				return err
			}
			out := cmd.Root().Writer
			stale := slices.ContainsFunc(changes, func(c fileChange) bool { return c.Status != "ok" })
			if cmd.Bool("json") {
				writeJSON(out, map[string]any{"check": cmd.Bool("check"), "upToDate": !stale, "files": changes})
			} else {
				for _, c := range changes {
					_, _ = fmt.Fprintf(out, "%-9s %s\n", c.Status, c.Path)
				}
				switch {
				case cmd.Bool("check") && stale:
					_, _ = fmt.Fprintln(out, "\nThe project's kit isn't this docket's: run docket kit to update it.")
				case cmd.Bool("check"):
					_, _ = fmt.Fprintln(out, "\nThe project's kit is up to date.")
				}
			}
			if cmd.Bool("check") && stale {
				return errFound
			}
			return nil
		},
	}
}

// installKit makes the project at root hold this kit, and returns what it
// changed, or with check, what it would change.
func installKit(root string, check bool) ([]fileChange, error) {
	skill, err := fs.Sub(kit.Files, "skills/docket")
	if err != nil {
		return nil, err
	}
	block, err := kit.Files.ReadFile("AGENTS.md")
	if err != nil {
		return nil, err
	}
	changes, err := syncDir(root, skillDir, skill, check)
	if err != nil {
		return nil, err
	}
	old, err := removeOldSkill(root, check)
	if err != nil {
		return nil, err
	}
	changes = append(changes, old...)
	c, err := writeBlock(filepath.Join(root, "AGENTS.md"), string(block), check)
	if err != nil {
		return nil, err
	}
	changes = append(changes, fileChange{Path: "AGENTS.md", Status: c})
	if c, ok, err := importAgents(filepath.Join(root, "CLAUDE.md"), check); err != nil {
		return nil, err
	} else if ok {
		changes = append(changes, fileChange{Path: "CLAUDE.md", Status: c})
	}
	c, err = ignoreSkill(filepath.Join(root, ".docketignore"), []string{"/" + skillDir + "/**/*.md"}, check)
	if err != nil {
		return nil, err
	}
	changes = append(changes, fileChange{Path: ".docketignore", Status: c})
	return changes, nil
}

// syncDir makes the folder dir, under root, hold exactly the files of src,
// and returns what it changed in it.
func syncDir(root, dir string, src fs.FS, check bool) ([]fileChange, error) {
	target := filepath.Join(root, filepath.FromSlash(dir))
	// A link here is the kit as it was once installed: replace it with a copy.
	if info, err := os.Lstat(target); err == nil && info.Mode()&fs.ModeSymlink != 0 {
		if !check {
			if err := os.Remove(target); err != nil {
				return nil, err
			}
		}
	} else if err == nil && !info.IsDir() {
		return nil, fmt.Errorf("%s isn't a folder: move it away, and run docket kit again", dir)
	}
	var changes []fileChange
	want := map[string]bool{}
	err := fs.WalkDir(src, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		want[p] = true
		data, err := fs.ReadFile(src, p)
		if err != nil {
			return err
		}
		dest := filepath.Join(target, filepath.FromSlash(p))
		have, err := os.ReadFile(dest)
		status := "ok"
		switch {
		case errors.Is(err, os.ErrNotExist):
			status = "added"
		case err != nil:
			return err
		case !bytes.Equal(have, data):
			status = "updated"
		}
		if status != "ok" && !check {
			if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
				return err
			}
			if err := os.WriteFile(dest, data, 0o644); err != nil {
				return err
			}
		}
		changes = append(changes, fileChange{Path: path.Join(dir, p), Status: status})
		return nil
	})
	if err != nil {
		return nil, err
	}
	// Files the kit no longer has.
	if _, err := os.Stat(target); err == nil {
		err = filepath.WalkDir(target, func(p string, d fs.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return err
			}
			rel, err := filepath.Rel(target, p)
			if err != nil {
				return err
			}
			if want[filepath.ToSlash(rel)] {
				return nil
			}
			if !check {
				if err := os.Remove(p); err != nil {
					return err
				}
			}
			changes = append(changes, fileChange{Path: path.Join(dir, filepath.ToSlash(rel)), Status: "removed"})
			return nil
		})
		if err != nil {
			return nil, err
		}
	}
	return changes, nil
}

// removeOldSkill removes the copy of the skill, or the link to it, that an
// earlier kit wrote to .claude/skills/docket/, and then .claude/skills/ and
// .claude/ if that leaves them empty.
func removeOldSkill(root string, check bool) ([]fileChange, error) {
	target := filepath.Join(root, filepath.FromSlash(oldSkillDir))
	info, err := os.Lstat(target)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var changes []fileChange
	if info.IsDir() {
		err = filepath.WalkDir(target, func(p string, d fs.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return err
			}
			rel, err := filepath.Rel(target, p)
			if err != nil {
				return err
			}
			changes = append(changes, fileChange{Path: path.Join(oldSkillDir, filepath.ToSlash(rel)), Status: "removed"})
			return nil
		})
		if err != nil {
			return nil, err
		}
	} else {
		changes = append(changes, fileChange{Path: oldSkillDir, Status: "removed"})
	}
	if check {
		return changes, nil
	}
	if err := os.RemoveAll(target); err != nil {
		return nil, err
	}
	for _, dir := range []string{".claude/skills", ".claude"} {
		// Remove fails on a folder that isn't empty, which is left as it is.
		_ = os.Remove(filepath.Join(root, filepath.FromSlash(dir)))
	}
	return changes, nil
}

// writeBlock writes block between the kit's markers in the AGENTS.md at
// file: in place of what's between them, or at the end when it has none, or
// as the whole file when there's none.
func writeBlock(file, block string, check bool) (string, error) {
	wrapped := kitStart + "\n" + strings.TrimSpace(block) + "\n" + kitEnd + "\n"
	data, err := os.ReadFile(file)
	if errors.Is(err, os.ErrNotExist) {
		return "added", writeUnlessCheck(file, wrapped, check)
	}
	if err != nil {
		return "", err
	}
	text := string(data)
	start, end := strings.Count(text, kitStart), strings.Count(text, kitEnd)
	switch {
	case start == 0 && end == 0:
		if !strings.HasSuffix(text, "\n") {
			text += "\n"
		}
		return "updated", writeUnlessCheck(file, text+"\n"+wrapped, check)
	case start != 1 || end != 1 || strings.Index(text, kitEnd) < strings.Index(text, kitStart):
		return "", fmt.Errorf("AGENTS.md has to have one %s and one %s after it: fix the markers, and run docket kit again", kitStart, kitEnd)
	}
	i := strings.Index(text, kitStart)
	j := strings.Index(text, kitEnd) + len(kitEnd)
	if j < len(text) && text[j] == '\n' {
		j++
	}
	updated := text[:i] + wrapped + text[j:]
	if updated == text {
		return "ok", nil
	}
	return "updated", writeUnlessCheck(file, updated, check)
}

// importAgents adds an @AGENTS.md line to an existing CLAUDE.md, since Claude
// Code reads AGENTS.md itself only when a project has no CLAUDE.md. It
// reports false when there's no CLAUDE.md, which it never creates.
func importAgents(file string, check bool) (status string, exists bool, err error) {
	data, err := os.ReadFile(file)
	if errors.Is(err, os.ErrNotExist) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	for line := range strings.SplitSeq(string(data), "\n") {
		if strings.TrimSpace(line) == "@AGENTS.md" {
			return "ok", true, nil
		}
	}
	text := string(data)
	if text != "" && !strings.HasSuffix(text, "\n") {
		text += "\n"
	}
	return "updated", true, writeUnlessCheck(file, text+"\n@AGENTS.md\n", check)
}

// ignoreSkill adds the kit's skill folder to the project's .docketignore,
// since the skill's example annotations would otherwise be read as the
// project's own.
func ignoreSkill(file string, patterns []string, check bool) (string, error) {
	data, err := os.ReadFile(file)
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return "", err
	}
	lines := strings.Split(string(data), "\n")
	var missing []string
	for _, p := range patterns {
		if !slices.ContainsFunc(lines, func(l string) bool { return strings.TrimSpace(l) == p }) {
			missing = append(missing, p)
		}
	}
	if len(missing) == 0 {
		return "ok", nil
	}
	if check {
		if len(data) == 0 {
			return "added", nil
		}
		return "updated", nil
	}
	return ensureLines(file, "# The agent kit's skill, written by docket kit. Its examples aren't this project's.", missing, missing...)
}

func writeUnlessCheck(file, text string, check bool) error {
	if check {
		return nil
	}
	return os.WriteFile(file, []byte(text), 0o644)
}
