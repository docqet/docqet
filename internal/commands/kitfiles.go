package commands

import (
	"bytes"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"slices"
	"strings"

	"github.com/exalynt/docket/kit"
)

// The markers around the kit's block in a project's AGENTS.md or CLAUDE.md.
const (
	kitStart = "<!-- docket-kit:start -->"
	kitEnd   = "<!-- docket-kit:end -->"
)

// skillsPlaceholder is what the kit's block writes in place of the folder
// that holds the project's skills, filled in when it's installed.
const skillsPlaceholder = "{{skills}}"

// ignoreComment heads the kit's lines in .docketignore.
const ignoreComment = "# The agent kit's skill, written by docket kit. Its examples aren't this project's."

// installedTargets is the targets the kit's skill folder is in, in the
// project at root.
func installedTargets(root string) []string {
	var out []string
	for _, t := range kitTargets {
		if _, err := os.Lstat(filepath.Join(root, filepath.FromSlash(t.dir()))); err == nil {
			out = append(out, t.Name)
		}
	}
	return out
}

// applyKit makes the project at root hold this kit in exactly targets, and
// returns what it changed, or with check, what it would change. The block
// goes in AGENTS.md when the agents target is installed, naming its folder,
// and in CLAUDE.md when only claude is. With both, CLAUDE.md imports
// AGENTS.md. With no targets, everything the kit wrote is removed, but an
// @AGENTS.md line, which the project may want anyway.
func applyKit(root string, targets []string, check bool) ([]fileChange, error) {
	skill, err := fs.Sub(kit.Files, "skills/docket")
	if err != nil {
		return nil, err
	}
	block, err := kit.Files.ReadFile("AGENTS.md")
	if err != nil {
		return nil, err
	}
	var changes []fileChange
	var want, unwanted []string
	for _, t := range kitTargets {
		pattern := "/" + t.dir() + "/**/*.md"
		if slices.Contains(targets, t.Name) {
			c, err := syncDir(root, t.dir(), skill, check)
			if err != nil {
				return nil, err
			}
			changes = append(changes, c...)
			want = append(want, pattern)
			continue
		}
		c, err := removeDir(root, t.dir(), check)
		if err != nil {
			return nil, err
		}
		changes = append(changes, c...)
		unwanted = append(unwanted, pattern)
	}

	agents, claude := slices.Contains(targets, "agents"), slices.Contains(targets, "claude")
	blockFile, skills := "", ""
	switch {
	case agents:
		blockFile, skills = "AGENTS.md", ".agents/skills"
	case claude:
		blockFile, skills = "CLAUDE.md", ".claude/skills"
	}
	for _, f := range []string{"AGENTS.md", "CLAUDE.md"} {
		if f == blockFile {
			continue
		}
		status, had, err := removeBlock(filepath.Join(root, f), check)
		if err != nil {
			return nil, err
		}
		if had {
			changes = append(changes, fileChange{Path: f, Status: status})
		}
	}
	if blockFile != "" {
		text := strings.ReplaceAll(string(block), skillsPlaceholder, skills)
		status, err := writeBlock(filepath.Join(root, blockFile), text, check)
		if err != nil {
			return nil, err
		}
		changes = append(changes, fileChange{Path: blockFile, Status: status})
	}
	if agents {
		status, ok, err := importAgents(filepath.Join(root, "CLAUDE.md"), claude, check)
		if err != nil {
			return nil, err
		}
		if ok && !slices.ContainsFunc(changes, func(c fileChange) bool { return c.Path == "CLAUDE.md" && c.Status != "ok" }) {
			changes = append(changes, fileChange{Path: "CLAUDE.md", Status: status})
		}
	}
	status, err := syncIgnore(filepath.Join(root, ".docketignore"), want, unwanted, check)
	if err != nil {
		return nil, err
	}
	if status != "" {
		changes = append(changes, fileChange{Path: ".docketignore", Status: status})
	}
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
	if info, err := os.Lstat(target); err == nil && info.IsDir() {
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

// removeDir removes the kit's skill folder dir, or a link there, and then the
// folders above it that holds, up to root, if that leaves them empty.
func removeDir(root, dir string, check bool) ([]fileChange, error) {
	target := filepath.Join(root, filepath.FromSlash(dir))
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
			changes = append(changes, fileChange{Path: path.Join(dir, filepath.ToSlash(rel)), Status: "removed"})
			return nil
		})
		if err != nil {
			return nil, err
		}
	} else {
		changes = append(changes, fileChange{Path: dir, Status: "removed"})
	}
	if check {
		return changes, nil
	}
	if err := os.RemoveAll(target); err != nil {
		return nil, err
	}
	// Such as .claude/skills, then .claude. Remove fails on a folder that
	// isn't empty, which is left as it is.
	for parent := path.Dir(dir); parent != "." && parent != "/"; parent = path.Dir(parent) {
		_ = os.Remove(filepath.Join(root, filepath.FromSlash(parent)))
	}
	return changes, nil
}

// markers finds the kit's block in text: where it starts, and where it ends,
// past its end marker's newline. found is false when there's none, and it's
// an error when the markers aren't one start and one end after it.
func markers(name, text string) (i, j int, found bool, err error) {
	start, end := strings.Count(text, kitStart), strings.Count(text, kitEnd)
	switch {
	case start == 0 && end == 0:
		return 0, 0, false, nil
	case start != 1 || end != 1 || strings.Index(text, kitEnd) < strings.Index(text, kitStart):
		return 0, 0, false, fmt.Errorf("%s has to have one %s and one %s after it: fix the markers, and run docket kit again", name, kitStart, kitEnd)
	}
	i = strings.Index(text, kitStart)
	j = strings.Index(text, kitEnd) + len(kitEnd)
	if j < len(text) && text[j] == '\n' {
		j++
	}
	return i, j, true, nil
}

// writeBlock writes block between the kit's markers in file: in place of
// what's between them, or at the end when it has none, or as the whole file
// when there's none.
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
	i, j, found, err := markers(filepath.Base(file), text)
	if err != nil {
		return "", err
	}
	if !found {
		if strings.TrimSpace(text) == "" {
			return "updated", writeUnlessCheck(file, wrapped, check)
		}
		if !strings.HasSuffix(text, "\n") {
			text += "\n"
		}
		return "updated", writeUnlessCheck(file, text+"\n"+wrapped, check)
	}
	updated := text[:i] + wrapped + text[j:]
	if updated == text {
		return "ok", nil
	}
	return "updated", writeUnlessCheck(file, updated, check)
}

// removeBlock removes the kit's block from file, and the file itself when
// nothing else is left in it. had is false when there's no block to remove.
func removeBlock(file string, check bool) (status string, had bool, err error) {
	data, err := os.ReadFile(file)
	if errors.Is(err, os.ErrNotExist) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	text := string(data)
	i, j, found, err := markers(filepath.Base(file), text)
	if err != nil || !found {
		return "", false, err
	}
	before, after := strings.TrimRight(text[:i], "\n"), text[j:]
	updated := before
	if before != "" {
		updated += "\n"
	}
	if after != "" && before != "" {
		updated += "\n"
	}
	updated += strings.TrimLeft(after, "\n")
	if strings.TrimSpace(updated) == "" {
		if check {
			return "removed", true, nil
		}
		return "removed", true, os.Remove(file)
	}
	return "updated", true, writeUnlessCheck(file, updated, check)
}

// importAgents adds an @AGENTS.md line to CLAUDE.md, since Claude Code reads
// AGENTS.md itself only when a project has no CLAUDE.md. It creates CLAUDE.md
// only with create, when the kit is installed for Claude Code too, and
// otherwise reports false when there's none.
func importAgents(file string, create, check bool) (status string, exists bool, err error) {
	data, err := os.ReadFile(file)
	if errors.Is(err, os.ErrNotExist) {
		if !create {
			return "", false, nil
		}
		return "added", true, writeUnlessCheck(file, "@AGENTS.md\n", check)
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
	if text != "" {
		text += "\n"
	}
	return "updated", true, writeUnlessCheck(file, text+"@AGENTS.md\n", check)
}

// syncIgnore makes the project's .docketignore leave out the kit's skill
// folders in want, since the skill's example annotations would otherwise be
// read as the project's own, and no longer list those in unwanted. It returns
// "" when there's no .docketignore and nothing to add to one.
func syncIgnore(file string, want, unwanted []string, check bool) (string, error) {
	data, err := os.ReadFile(file)
	exists := err == nil
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return "", err
	}
	if !exists && len(want) == 0 {
		return "", nil
	}
	var lines []string
	if exists {
		lines = strings.Split(strings.TrimRight(string(data), "\n"), "\n")
	}
	lines = slices.DeleteFunc(lines, func(l string) bool { return slices.Contains(unwanted, strings.TrimSpace(l)) })
	var missing []string
	for _, p := range want {
		if !slices.ContainsFunc(lines, func(l string) bool { return strings.TrimSpace(l) == p }) {
			missing = append(missing, p)
		}
	}
	if len(want) == 0 {
		lines = slices.DeleteFunc(lines, func(l string) bool { return l == ignoreComment })
	}
	if len(missing) > 0 {
		if !slices.Contains(lines, ignoreComment) {
			if len(lines) > 0 && lines[len(lines)-1] != "" {
				lines = append(lines, "")
			}
			lines = append(lines, ignoreComment)
		}
		i := slices.Index(lines, ignoreComment) + 1
		for i < len(lines) && strings.HasPrefix(lines[i], "/") {
			i++
		}
		lines = slices.Insert(lines, i, missing...)
	}
	for len(lines) > 0 && lines[len(lines)-1] == "" {
		lines = lines[:len(lines)-1]
	}
	updated := strings.Join(lines, "\n")
	if updated != "" {
		updated += "\n"
	}
	switch {
	case exists && updated == string(data):
		return "ok", nil
	case exists && updated == "":
		if check {
			return "removed", nil
		}
		return "removed", os.Remove(file)
	case !exists:
		return "added", writeUnlessCheck(file, updated, check)
	}
	return "updated", writeUnlessCheck(file, updated, check)
}

func writeUnlessCheck(file, text string, check bool) error {
	if check {
		return nil
	}
	return os.WriteFile(file, []byte(text), 0o644)
}
