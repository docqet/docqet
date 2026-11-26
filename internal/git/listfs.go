package git

import (
	"io"
	"io/fs"
	"path"
	"slices"
	"time"
)

// listFS is base, showing only the files named, and the folders they're in.
type listFS struct {
	base  fs.FS
	files map[string]bool
	dirs  map[string][]fs.DirEntry
}

func newListFS(base fs.FS, names []string) *listFS {
	l := &listFS{base: base, files: map[string]bool{}, dirs: map[string][]fs.DirEntry{".": nil}}
	children := map[string]map[string]bool{}
	add := func(dir, name string, isDir bool) {
		if children[dir] == nil {
			children[dir] = map[string]bool{}
		}
		if _, seen := children[dir][name]; !seen {
			children[dir][name] = isDir
			l.dirs[dir] = append(l.dirs[dir], dirEntry{name: name, dir: isDir})
		}
	}
	for _, name := range names {
		l.files[name] = true
		child, isDir := name, false
		for {
			dir := path.Dir(child)
			add(dir, path.Base(child), isDir)
			if dir == "." {
				break
			}
			child, isDir = dir, true
		}
	}
	for dir := range l.dirs {
		slices.SortFunc(l.dirs[dir], func(a, b fs.DirEntry) int {
			switch {
			case a.Name() < b.Name():
				return -1
			case a.Name() > b.Name():
				return 1
			}
			return 0
		})
	}
	return l
}

func (l *listFS) Open(name string) (fs.File, error) {
	if !fs.ValidPath(name) {
		return nil, &fs.PathError{Op: "open", Path: name, Err: fs.ErrInvalid}
	}
	if l.files[name] {
		return l.base.Open(name)
	}
	if entries, ok := l.dirs[name]; ok {
		return &dirFile{name: name, entries: entries}, nil
	}
	return nil, &fs.PathError{Op: "open", Path: name, Err: fs.ErrNotExist}
}

func (l *listFS) ReadDir(name string) ([]fs.DirEntry, error) {
	entries, ok := l.dirs[name]
	if !ok {
		return nil, &fs.PathError{Op: "readdir", Path: name, Err: fs.ErrNotExist}
	}
	return slices.Clone(entries), nil
}

type dirEntry struct {
	name string
	dir  bool
}

func (e dirEntry) Name() string { return e.name }
func (e dirEntry) IsDir() bool  { return e.dir }
func (e dirEntry) Type() fs.FileMode {
	if e.dir {
		return fs.ModeDir
	}
	return 0
}
func (e dirEntry) Info() (fs.FileInfo, error) { return dirInfo(e), nil }

type dirInfo struct {
	name string
	dir  bool
}

func (i dirInfo) Name() string       { return i.name }
func (i dirInfo) Size() int64        { return 0 }
func (i dirInfo) ModTime() time.Time { return time.Time{} }
func (i dirInfo) IsDir() bool        { return i.dir }
func (i dirInfo) Sys() any           { return nil }
func (i dirInfo) Mode() fs.FileMode {
	if i.dir {
		return fs.ModeDir | 0o755
	}
	return 0o644
}

type dirFile struct {
	name    string
	entries []fs.DirEntry
	read    int
}

func (d *dirFile) Stat() (fs.FileInfo, error) {
	return dirInfo{name: path.Base(d.name), dir: true}, nil
}
func (d *dirFile) Read([]byte) (int, error) {
	return 0, &fs.PathError{Op: "read", Path: d.name, Err: fs.ErrInvalid}
}
func (d *dirFile) Close() error { return nil }

func (d *dirFile) ReadDir(n int) ([]fs.DirEntry, error) {
	rest := d.entries[d.read:]
	if n <= 0 {
		d.read = len(d.entries)
		return slices.Clone(rest), nil
	}
	if len(rest) == 0 {
		return nil, io.EOF
	}
	if n > len(rest) {
		n = len(rest)
	}
	d.read += n
	return slices.Clone(rest[:n]), nil
}
