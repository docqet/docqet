package index

import (
	"bytes"
	"regexp"
	"strings"

	"github.com/docqet/docqet/internal/state"
)

// The verbs an annotation can have.
const (
	verbVerifies   = "verifies"
	verbImplements = "implements"
	verbGap        = "gap"
	verbTradeoff   = "tradeoff"
)

// annotation is one docqet:<verb> comment, with the place it's on.
type annotation struct {
	verb  string
	refs  []string
	file  string
	line  int // the annotation's own line
	place state.Place
}

var annotationPattern = regexp.MustCompile(`docqet:(verifies|implements|gap|tradeoff)[ \t]+(.*)$`)

// parseAnnotation finds an annotation on a line: its verb and the references
// it names. Nothing is parsed around it, so it works in any comment syntax:
// the references are the words after the verb that are written as
// references, up to the first that isn't, such as a comment's closing */.
func parseAnnotation(line string) (verb string, refs []string, ok bool) {
	m := annotationPattern.FindStringSubmatch(line)
	if m == nil {
		return "", nil, false
	}
	for word := range strings.FieldsSeq(m[2]) {
		if _, isRef := state.ParseRef(word); !isRef {
			break
		}
		refs = append(refs, word)
	}
	if len(refs) == 0 {
		return "", nil, false
	}
	return m[1], refs, true
}

// scanAnnotations finds every annotation in a file that isn't a Docqet doc.
// Each is on the first line below it that isn't blank or another annotation,
// and is recorded as its own line with that line's text, as the spec says.
func scanAnnotations(file string, data []byte) []annotation {
	if isBinary(data) || !bytes.Contains(data, []byte("docqet:")) {
		return nil
	}
	lines := strings.Split(strings.ReplaceAll(string(data), "\r\n", "\n"), "\n")
	var found []annotation
	for i, line := range lines {
		verb, refs, ok := parseAnnotation(line)
		if !ok {
			continue
		}
		a := annotation{verb: verb, refs: refs, file: file, line: i + 1}
		a.place = state.Place{File: file, Line: i + 1, Text: strings.TrimSpace(line)}
		for j := i + 1; j < len(lines); j++ {
			next := strings.TrimSpace(lines[j])
			if next == "" {
				continue
			}
			if _, _, isAnnotation := parseAnnotation(lines[j]); isAnnotation {
				continue
			}
			a.place.Text = next
			break
		}
		found = append(found, a)
	}
	return found
}

// isBinary reports whether data looks like a binary file rather than text.
func isBinary(data []byte) bool {
	head := data
	if len(head) > 8000 {
		head = head[:8000]
	}
	return bytes.IndexByte(head, 0) >= 0
}
