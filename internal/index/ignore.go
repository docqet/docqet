package index

import (
	"errors"
	"io/fs"
	"regexp"
	"strings"
)

// ignoreFile is the file at a project's root that leaves files out of it, in
// gitignore's syntax.
const ignoreFile = ".docketignore"

// ignorePattern is one line of a .docketignore.
type ignorePattern struct {
	re      *regexp.Regexp
	negate  bool // it starts with !, so a path it matches is part of the project again
	dirOnly bool // it ends with /, so it matches only folders
}

// ignore is a project's .docketignore: the files and folders that aren't part
// of the project, so nothing is read from them, neither docs nor annotations.
type ignore []ignorePattern

// readIgnore reads the .docketignore at the root of fsys. A project without
// one ignores nothing.
func readIgnore(fsys fs.FS) (ignore, error) {
	data, err := fs.ReadFile(fsys, ignoreFile)
	if errors.Is(err, fs.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var ig ignore
	for line := range strings.Lines(string(data)) {
		if p, ok := parseIgnoreLine(line); ok {
			ig = append(ig, p)
		}
	}
	return ig, nil
}

// parseIgnoreLine reads one line as gitignore does: blank lines and comments
// match nothing, ! negates, a trailing / matches only folders, a / anywhere
// else anchors the pattern to the root, and *, ?, [...] and ** are globs.
func parseIgnoreLine(line string) (ignorePattern, bool) {
	line = strings.TrimRight(line, "\r\n")
	if !strings.HasSuffix(line, `\ `) {
		line = strings.TrimRight(line, " ")
	}
	if line == "" || strings.HasPrefix(line, "#") {
		return ignorePattern{}, false
	}
	var p ignorePattern
	if strings.HasPrefix(line, "!") {
		p.negate = true
		line = line[1:]
	}
	if strings.HasSuffix(line, "/") {
		p.dirOnly = true
		line = strings.TrimSuffix(line, "/")
	}
	anchored := strings.Contains(line, "/")
	line = strings.TrimPrefix(line, "/")
	if line == "" {
		return ignorePattern{}, false
	}

	expr := globToRegexp(line)
	if !anchored {
		expr = "(?:.*/)?" + expr
	}
	re, err := regexp.Compile("^" + expr + "$")
	if err != nil {
		re = regexp.MustCompile("^" + regexp.QuoteMeta(line) + "$")
	}
	p.re = re
	return p, true
}

// globToRegexp turns a gitignore glob into a regular expression over a
// slash-separated path.
func globToRegexp(glob string) string {
	var b strings.Builder
	for i := 0; i < len(glob); i++ {
		c := glob[i]
		switch {
		case strings.HasPrefix(glob[i:], "**/") && (i == 0 || glob[i-1] == '/'):
			b.WriteString("(?:.*/)?") // any folders, or none
			i += 2
		case strings.HasPrefix(glob[i:], "**") && i+2 == len(glob) && (i == 0 || glob[i-1] == '/'):
			b.WriteString(".*") // everything inside
			i++
		case c == '*':
			b.WriteString("[^/]*")
		case c == '?':
			b.WriteString("[^/]")
		case c == '[':
			end := strings.IndexByte(glob[i+1:], ']')
			if end < 0 {
				b.WriteString(`\[`)
				continue
			}
			class := glob[i+1 : i+1+end]
			if strings.HasPrefix(class, "!") {
				class = "^" + class[1:]
			}
			b.WriteString("[" + class + "]")
			i += end + 1
		case c == '\\' && i+1 < len(glob):
			i++
			b.WriteString(regexp.QuoteMeta(string(glob[i])))
		default:
			b.WriteString(regexp.QuoteMeta(string(c)))
		}
	}
	return b.String()
}

// ignored reports whether a path, relative to the project's root, is left out
// of the project. The last pattern that matches it decides, as in gitignore.
// Folders are checked as they're walked, so a file in an ignored folder is
// never reached, and can't be brought back with !.
// docket:implements capability:ignoring-files rule:ignored-files-arent-read@authoring
func (ig ignore) ignored(p string, isDir bool) bool {
	out := false
	for _, pat := range ig {
		if pat.dirOnly && !isDir {
			continue
		}
		if pat.re.MatchString(p) {
			out = !pat.negate
		}
	}
	return out
}
