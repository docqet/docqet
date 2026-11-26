package index

import (
	"bytes"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"go.yaml.in/yaml/v3"

	"github.com/docqet/docqet/internal/state"
)

// frontmatter is every field any doc type can have, as written. Which fields
// a type reads is decided as each entry is built; check validates them.
type frontmatter struct {
	Docqet       string         `yaml:"docqet"`
	ID           string         `yaml:"id"`
	Domain       string         `yaml:"domain"`
	Name         string         `yaml:"name"`
	Description  string         `yaml:"description"`
	Stability    string         `yaml:"stability"`
	Applies      string         `yaml:"applies"`
	Why          *string        `yaml:"why"`
	Role         *string        `yaml:"role"`
	Title        *string        `yaml:"title"`
	Image        *string        `yaml:"image"`
	Capabilities []string       `yaml:"capabilities"`
	Personas     []string       `yaml:"personas"`
	Initiatives  []string       `yaml:"initiatives"`
	Rules        []string       `yaml:"rules"`
	Concepts     []string       `yaml:"concepts"`
	Meets        []string       `yaml:"meets"`
	ConfusedWith []confusion    `yaml:"confused-with"`
	Gaps         []gap          `yaml:"gaps"`
	Tradeoffs    []tradeoff     `yaml:"tradeoffs"`
	Decisions    []decision     `yaml:"decisions"`
	line         map[string]int // each field's line in the file
	entryLines   map[string]int // each gap's and tradeoff's line, by key
}

type confusion struct {
	Concept *string `yaml:"concept"`
	Term    *string `yaml:"term"`
	Summary string  `yaml:"summary"`
}

type gap struct {
	ID          string   `yaml:"id"`
	Name        string   `yaml:"name"`
	Description string   `yaml:"description"`
	Affects     []string `yaml:"affects"`
	Impact      string   `yaml:"impact"`
	Likelihood  string   `yaml:"likelihood"`
	Reach       string   `yaml:"reach"`
}

type tradeoff struct {
	ID          string   `yaml:"id"`
	Name        string   `yaml:"name"`
	Description string   `yaml:"description"`
	Affects     []string `yaml:"affects"`
	Benefit     *string  `yaml:"benefit"`
	Drawback    string   `yaml:"drawback"`
}

type decision struct {
	Topic    *string  `yaml:"topic"`
	Question string   `yaml:"question"`
	Affects  []string `yaml:"affects"`
}

// doc is one Docqet doc read from a file.
type doc struct {
	file string
	fm   frontmatter
	body string
}

var docqetField = regexp.MustCompile(`(?m)^docqet\s*:`)

// splitFrontmatter returns a Markdown file's frontmatter and body, and the
// line the frontmatter's first line is on. ok is false when the file has no
// frontmatter.
func splitFrontmatter(data []byte) (fm, body []byte, ok bool) {
	data = bytes.ReplaceAll(data, []byte("\r\n"), []byte("\n"))
	if !bytes.HasPrefix(data, []byte("---\n")) {
		return nil, nil, false
	}
	rest := data[4:]
	for i := 0; i <= len(rest); {
		end := bytes.IndexByte(rest[i:], '\n')
		var line []byte
		if end < 0 {
			line = rest[i:]
		} else {
			line = rest[i : i+end]
		}
		if t := bytes.TrimRight(line, " \t"); bytes.Equal(t, []byte("---")) || bytes.Equal(t, []byte("...")) {
			after := []byte{}
			if end >= 0 {
				after = rest[i+end+1:]
			}
			return rest[:i], after, true
		}
		if end < 0 {
			break
		}
		i += end + 1
	}
	return nil, nil, false
}

// lineOfError is how yaml.v3 says where an error is.
var lineOfError = regexp.MustCompile(`^(?:yaml: )?line (\d+): (.*)$`)

// readDoc reads file as a Docqet doc. isDoc is false when it isn't one: no
// frontmatter, or none naming a `docqet` type. A doc that can't be read, such
// as one whose frontmatter isn't YAML, is a doc with problems and no entry.
func readDoc(file string, data []byte) (d *doc, isDoc bool, problems []state.Problem) {
	fmText, body, ok := splitFrontmatter(data)
	if !ok || !docqetField.Match(fmText) {
		return nil, false, nil
	}
	// The frontmatter starts on the file's second line, after its ---.
	at := func(line int) int { return line + 1 }

	var node yaml.Node
	if err := yaml.Unmarshal(fmText, &node); err != nil {
		return nil, true, []state.Problem{yamlProblem(file, err, at)}
	}
	var fm frontmatter
	if err := node.Decode(&fm); err != nil {
		var typeErr *yaml.TypeError
		if !errors.As(err, &typeErr) {
			return nil, true, []state.Problem{yamlProblem(file, err, at)}
		}
		// The fields that decoded are kept, and each that didn't is a problem.
		for _, e := range typeErr.Errors {
			problems = append(problems, yamlProblem(file, errors.New(e), at))
		}
	}
	fm.line, fm.entryLines = fieldLines(&node, at)

	switch {
	case !isDocType(fm.Docqet):
		return nil, true, append(problems, fileProblem(state.InvalidFrontmatter, file, fm.line["docqet"],
			fmt.Sprintf("docqet is %q, which isn't a doc type: it's one of domain, feature, capability, rule, concept, persona, initiative, mechanism or component", fm.Docqet)))
	case fm.ID == "":
		return nil, true, append(problems, fileProblem(state.InvalidFrontmatter, file, fm.line["docqet"], "A doc needs an id."))
	}

	// Gaps and tradeoffs need a key to be one: without one, there's nothing to
	// call them by.
	gaps := fm.Gaps[:0:0]
	for _, g := range fm.Gaps {
		if g.ID == "" {
			problems = append(problems, fileProblem(state.InvalidFrontmatter, file, fm.line["gaps"], "A gap needs an id."))
			continue
		}
		gaps = append(gaps, g)
	}
	fm.Gaps = gaps
	tradeoffs := fm.Tradeoffs[:0:0]
	for _, t := range fm.Tradeoffs {
		if t.ID == "" {
			problems = append(problems, fileProblem(state.InvalidFrontmatter, file, fm.line["tradeoffs"], "A tradeoff needs an id."))
			continue
		}
		tradeoffs = append(tradeoffs, t)
	}
	fm.Tradeoffs = tradeoffs

	return &doc{file: file, fm: fm, body: trimBody(string(body))}, true, problems
}

// fieldLines finds the line each top-level field is on, and each gap's and
// tradeoff's, by its key.
func fieldLines(node *yaml.Node, at func(int) int) (fields, entries map[string]int) {
	fields, entries = map[string]int{}, map[string]int{}
	if node.Kind != yaml.DocumentNode || len(node.Content) == 0 || node.Content[0].Kind != yaml.MappingNode {
		return fields, entries
	}
	m := node.Content[0]
	for i := 0; i+1 < len(m.Content); i += 2 {
		key, value := m.Content[i], m.Content[i+1]
		fields[key.Value] = at(key.Line)
		if (key.Value == "gaps" || key.Value == "tradeoffs") && value.Kind == yaml.SequenceNode {
			for _, item := range value.Content {
				if item.Kind != yaml.MappingNode {
					continue
				}
				for j := 0; j+1 < len(item.Content); j += 2 {
					if item.Content[j].Value == "id" {
						entries[key.Value+"#"+item.Content[j+1].Value] = at(item.Line)
					}
				}
			}
		}
	}
	return fields, entries
}

func yamlProblem(file string, err error, at func(int) int) state.Problem {
	msg := err.Error()
	line := 0
	if m := lineOfError.FindStringSubmatch(msg); m != nil {
		n, _ := strconv.Atoi(m[1])
		line, msg = at(n), m[2]
	}
	return fileProblem(state.InvalidFrontmatter, file, line, "The frontmatter isn't valid: "+msg)
}

// fileProblem is a problem found reading a file, rather than one about a doc.
func fileProblem(typ, file string, line int, msg string) state.Problem {
	return state.Problem{Type: typ, Capabilities: []string{}, Message: msg, File: file, Line: line}
}

func isDocType(t string) bool {
	switch t {
	case state.TypeDomain, state.TypeFeature, state.TypeCapability, state.TypeRule, state.TypeConcept,
		state.TypePersona, state.TypeInitiative, state.TypeMechanism, state.TypeComponent:
		return true
	}
	return false
}

// trimBody is a body as state holds it: without the blank lines around it.
func trimBody(body string) string {
	body = strings.TrimLeft(body, "\n")
	return strings.TrimRight(body, " \t\n")
}

func decisions(ds []decision) []state.Decision {
	out := make([]state.Decision, 0, len(ds))
	for _, d := range ds {
		out = append(out, state.Decision{Topic: d.Topic, Question: strings.TrimSpace(d.Question), Affects: list(d.Affects)})
	}
	return out
}

// list is l, never nil, so it's [] in JSON.
func list[T any](l []T) []T {
	if l == nil {
		return []T{}
	}
	return l
}

func evidence() state.Evidence {
	return state.Evidence{Implements: []state.Place{}, Verifies: []state.Place{}}
}

// entryRefs is each gap's or tradeoff's ID on the doc ref.
func gapRefs(ref string, gs []gap) []string {
	out := make([]string, 0, len(gs))
	for _, g := range gs {
		out = append(out, ref+"#"+g.ID)
	}
	return out
}

func tradeoffRefs(ref string, ts []tradeoff) []string {
	out := make([]string, 0, len(ts))
	for _, t := range ts {
		out = append(out, ref+"#"+t.ID)
	}
	return out
}
