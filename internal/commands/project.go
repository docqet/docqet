package commands

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"time"

	"github.com/docqet/docqet/internal/git"
	"github.com/docqet/docqet/internal/index"
	"github.com/docqet/docqet/internal/project"
	"github.com/docqet/docqet/internal/state"
)

// source says which states a read was worked out from, as the first line of
// its text and its JSON's source field.
type source struct {
	When        string          `json:"when"`
	Commit      string          `json:"commit"`
	Uncommitted bool            `json:"uncommitted"`
	Projects    []sourceProject `json:"projects"`
}

type sourceProject struct {
	ID   string `json:"id"`
	From string `json:"from"`
}

// line is the source as the first line of a read's text, such as
// "hotel-bookings · working tree (4f2c9e1 + uncommitted)".
func (s source) line() string {
	id := ""
	if len(s.Projects) > 0 {
		id = s.Projects[0].ID
	}
	commit := short(s.Commit)
	switch {
	case s.When == "commit":
		return fmt.Sprintf("%s · %s", id, commit)
	case commit == "":
		return fmt.Sprintf("%s · working tree", id)
	case s.Uncommitted:
		return fmt.Sprintf("%s · working tree (%s + uncommitted)", id, commit)
	default:
		return fmt.Sprintf("%s · working tree (%s)", id, commit)
	}
}

func short(sha string) string {
	if len(sha) > 7 {
		return sha[:7]
	}
	return sha
}

// indexed is a project's state, worked out from its files, and where from.
type indexed struct {
	root   string
	state  *state.State
	source source
}

// indexHere indexes the project the command is run in: its working tree, or
// with at, a commit, read from git.
func indexHere(ctx context.Context, at string) (indexed, error) {
	wd, err := os.Getwd()
	if err != nil {
		return indexed{}, err
	}
	root, err := project.Find(wd)
	if err != nil {
		return indexed{}, err
	}

	var (
		fsys fs.FS
		src  source
	)
	if at != "" {
		sha, err := git.Resolve(ctx, root, at)
		if err != nil {
			return indexed{}, err
		}
		if fsys, err = git.Tree(ctx, root, sha); err != nil {
			return indexed{}, err
		}
		src = source{When: "commit", Commit: sha}
	} else {
		if fsys, err = git.WorkingTree(ctx, root); err != nil {
			return indexed{}, err
		}
		src = source{When: "working-tree"}
		if git.IsRepository(ctx, root) {
			if sha, err := git.Resolve(ctx, root, "HEAD"); err == nil {
				src.Commit = sha
			}
			if src.Uncommitted, err = git.IsDirty(ctx, root); err != nil {
				return indexed{}, err
			}
		}
	}

	st, err := index.Index(fsys)
	if errors.Is(err, fs.ErrNotExist) && at != "" {
		return indexed{}, fmt.Errorf("the project has no docqet.yaml at %s", short(src.Commit))
	}
	if err != nil {
		return indexed{}, err
	}
	st.Commit = src.Commit
	st.IndexedAt = time.Now().UTC().Format(time.RFC3339)
	src.Projects = []sourceProject{{ID: st.Project.ID, From: src.When}}
	return indexed{root: root, state: st, source: src}, nil
}

// notBuiltFlags refuses the flags of cmd's draft that aren't built yet.
func notBuiltFlags(isSet func(string) bool, names ...string) error {
	for _, name := range names {
		if isSet(name) {
			return fmt.Errorf("--%s isn't built yet: cmd/docqet/README.md drafts what it will do", name)
		}
	}
	return nil
}
