// Package git reads what docqet needs from git, by running git: the files of
// the working tree or of any commit, as an fs.FS, a branch's first-parent
// line, and each commit's parents, time and Docqet trailers.
package git

import (
	"archive/tar"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path"
	"strings"
	"testing/fstest"
	"time"
)

// ErrNotRepository is returned when a folder isn't in a git repository.
var ErrNotRepository = errors.New("not in a git repository")

// run runs git in dir and returns what it printed.
func run(ctx context.Context, dir string, args ...string) ([]byte, error) {
	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Dir = dir
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		msg := strings.TrimSpace(stderr.String())
		if strings.Contains(msg, "not a git repository") {
			return nil, ErrNotRepository
		}
		if msg == "" {
			msg = err.Error()
		}
		return nil, fmt.Errorf("git %s: %s", args[0], msg)
	}
	return out, nil
}

// IsRepository reports whether dir is in a git repository.
func IsRepository(ctx context.Context, dir string) bool {
	_, err := run(ctx, dir, "rev-parse", "--git-dir")
	return err == nil
}

// Resolve returns the full SHA of the commit rev names.
func Resolve(ctx context.Context, dir, rev string) (string, error) {
	out, err := run(ctx, dir, "rev-parse", "--verify", "--quiet", rev+"^{commit}")
	if err != nil {
		return "", fmt.Errorf("%s isn't a commit", rev)
	}
	return strings.TrimSpace(string(out)), nil
}

// Commit is what git knows about a commit that docqet sends with its state.
type Commit struct {
	SHA         string
	Parents     []string
	CommittedAt time.Time
}

// Show returns a commit's parents and the time it was committed.
func Show(ctx context.Context, dir, sha string) (Commit, error) {
	out, err := run(ctx, dir, "log", "-1", "--format=%H%x00%P%x00%cI", sha)
	if err != nil {
		return Commit{}, err
	}
	parts := strings.Split(strings.TrimSpace(string(out)), "\x00")
	if len(parts) != 3 {
		return Commit{}, fmt.Errorf("git log: unexpected output for %s", sha)
	}
	at, err := time.Parse(time.RFC3339, parts[2])
	if err != nil {
		return Commit{}, err
	}
	return Commit{SHA: parts[0], Parents: strings.Fields(parts[1]), CommittedAt: at}, nil
}

// Trailers returns the values of every trailer with key, read as git reads
// trailers, from sha and every commit it brought in: for a merge, the commits
// of the branch it merged.
func Trailers(ctx context.Context, dir, sha, key string) ([]string, error) {
	c, err := Show(ctx, dir, sha)
	if err != nil {
		return nil, err
	}
	args := []string{"log", "--format=%(trailers:key=" + key + ",valueonly,separator=%x1f)%x1e", sha}
	if len(c.Parents) > 0 {
		args = append(args, "--not", c.Parents[0])
	}
	out, err := run(ctx, dir, args...)
	if err != nil {
		return nil, err
	}
	var values []string
	for record := range strings.SplitSeq(string(out), "\x1e") {
		for v := range strings.SplitSeq(strings.TrimSpace(record), "\x1f") {
			if v = strings.TrimSpace(v); v != "" {
				values = append(values, v)
			}
		}
	}
	return values, nil
}

// FirstParents returns the commits on to's first-parent line after from,
// oldest first. With from empty, it's every commit on the line.
func FirstParents(ctx context.Context, dir, from, to string) ([]string, error) {
	rng := to
	if from != "" {
		rng = from + ".." + to
	}
	out, err := run(ctx, dir, "rev-list", "--first-parent", "--reverse", rng)
	if err != nil {
		return nil, err
	}
	return strings.Fields(string(out)), nil
}

// IsAncestor reports whether commit a is in b's history.
func IsAncestor(ctx context.Context, dir, a, b string) (bool, error) {
	cmd := exec.CommandContext(ctx, "git", "merge-base", "--is-ancestor", a, b)
	cmd.Dir = dir
	err := cmd.Run()
	var exit *exec.ExitError
	switch {
	case err == nil:
		return true, nil
	case errors.As(err, &exit) && exit.ExitCode() == 1:
		return false, nil
	default:
		return false, fmt.Errorf("git merge-base: %w", err)
	}
}

// Tree returns the files of dir, a folder in a repository, as they were at
// commit sha, read from git without checking anything out.
func Tree(ctx context.Context, dir, sha string) (fs.FS, error) {
	// Run in dir, git archive holds only that folder, with paths from it.
	out, err := run(ctx, dir, "archive", "--format=tar", sha)
	if err != nil {
		return nil, err
	}
	files := fstest.MapFS{}
	r := tar.NewReader(bytes.NewReader(out))
	for {
		h, err := r.Next()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("reading git archive: %w", err)
		}
		if h.Typeflag != tar.TypeReg {
			continue
		}
		data, err := io.ReadAll(r)
		if err != nil {
			return nil, err
		}
		files[path.Clean(h.Name)] = &fstest.MapFile{Data: data, Mode: 0o644, ModTime: h.ModTime}
	}
	return files, nil
}

// WorkingTree returns the files of dir as they are now, uncommitted changes
// included: the ones git tracks or would, so what .gitignore leaves out, such
// as node_modules, isn't read. Outside a repository, it's every file in dir.
func WorkingTree(ctx context.Context, dir string) (fs.FS, error) {
	out, err := run(ctx, dir, "ls-files", "-z", "--cached", "--others", "--exclude-standard")
	if errors.Is(err, ErrNotRepository) {
		return os.DirFS(dir), nil
	}
	if err != nil {
		return nil, err
	}
	base := os.DirFS(dir)
	var names []string
	for name := range strings.SplitSeq(string(out), "\x00") {
		if name == "" {
			continue
		}
		// A file deleted but not yet staged is still listed.
		if _, err := fs.Stat(base, name); err != nil {
			continue
		}
		names = append(names, name)
	}
	return newListFS(base, names), nil
}

// IsDirty reports whether dir has uncommitted changes, untracked files
// included.
func IsDirty(ctx context.Context, dir string) (bool, error) {
	out, err := run(ctx, dir, "status", "--porcelain", "--", ".")
	if err != nil {
		return false, err
	}
	return len(bytes.TrimSpace(out)) > 0, nil
}

// Changed returns the files changed in dir since base: in commits since
// base's merge base with HEAD, staged or not, and new files git would track.
// Paths are relative to dir, and only files under it are listed.
func Changed(ctx context.Context, dir, base string) ([]string, error) {
	mb, err := MergeBase(ctx, dir, base)
	if err != nil {
		return nil, err
	}
	out, err := run(ctx, dir, "diff", "--name-only", "--relative", "-z", mb)
	if err != nil {
		return nil, err
	}
	untracked, err := run(ctx, dir, "ls-files", "-z", "--others", "--exclude-standard")
	if err != nil {
		return nil, err
	}
	return names(append(out, untracked...)), nil
}

// MergeBase returns the commit base and HEAD last had in common.
func MergeBase(ctx context.Context, dir, base string) (string, error) {
	out, err := run(ctx, dir, "merge-base", base, "HEAD")
	if err != nil {
		return "", fmt.Errorf("%s has no common history with HEAD", base)
	}
	return strings.TrimSpace(string(out)), nil
}

// Staged returns the files staged in dir, relative to it.
func Staged(ctx context.Context, dir string) ([]string, error) {
	out, err := run(ctx, dir, "diff", "--cached", "--name-only", "--relative", "-z")
	if err != nil {
		return nil, err
	}
	return names(out), nil
}

// StagedTree returns the files of dir as they're staged, read from git's
// index. It writes the index's tree to the object database, as git commit
// would, and changes no ref.
func StagedTree(ctx context.Context, dir string) (fs.FS, error) {
	out, err := run(ctx, dir, "write-tree")
	if err != nil {
		return nil, err
	}
	// Run in dir, as Tree runs git archive, it holds only that folder.
	return Tree(ctx, dir, strings.TrimSpace(string(out)))
}

// DefaultBase is the main branch to compare a change with: origin/HEAD, as
// git clone sets it.
func DefaultBase(ctx context.Context, dir string) (string, error) {
	out, err := run(ctx, dir, "rev-parse", "--abbrev-ref", "origin/HEAD")
	if err != nil {
		return "", errors.New("there's no origin/HEAD to compare with: give --base, such as --base main")
	}
	return strings.TrimSpace(string(out)), nil
}

// Commits returns the commits in a range, such as origin/main..HEAD, oldest
// first.
func Commits(ctx context.Context, dir, rng string) ([]string, error) {
	out, err := run(ctx, dir, "rev-list", "--reverse", rng)
	if err != nil {
		return nil, err
	}
	return strings.Fields(string(out)), nil
}

// Message returns a commit's message, and the values of its own trailers
// with key, read as git reads them.
func Message(ctx context.Context, dir, sha, key string) (message string, trailers []string, err error) {
	out, err := run(ctx, dir, "log", "-1", "--format=%B%x00%(trailers:key="+key+",valueonly,separator=%x1f)", sha)
	if err != nil {
		return "", nil, err
	}
	parts := strings.SplitN(string(out), "\x00", 2)
	if len(parts) == 2 {
		for v := range strings.SplitSeq(strings.TrimSpace(parts[1]), "\x1f") {
			if v = strings.TrimSpace(v); v != "" {
				trailers = append(trailers, v)
			}
		}
	}
	return parts[0], trailers, nil
}

// names splits git's -z output into names.
func names(out []byte) []string {
	var list []string
	seen := map[string]bool{}
	for name := range strings.SplitSeq(string(out), "\x00") {
		if name != "" && !seen[name] {
			seen[name] = true
			list = append(list, name)
		}
	}
	return list
}
