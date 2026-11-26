package index

import (
	"fmt"
	"strings"
	"sync"

	"go.yaml.in/yaml/v3"

	"github.com/exalynt/docket/internal/expectations"
	"github.com/exalynt/docket/internal/state"
)

type rawExpectations struct {
	Kinds []struct {
		ID   string `yaml:"id"`
		Name string `yaml:"name"`
	} `yaml:"kinds"`
	Qualities []struct {
		ID       string              `yaml:"id"`
		Name     string              `yaml:"name"`
		Question string              `yaml:"question"`
		Why      string              `yaml:"why"`
		Levels   map[string]rawLevel `yaml:"levels"`
	} `yaml:"qualities"`
}

type rawLevel struct {
	Summary         *string      `yaml:"summary"`
	Outcomes        []rawOutcome `yaml:"outcomes"`
	Implementation  []rawExample `yaml:"implementation"`
	Overengineering []rawExample `yaml:"overengineering"`
}

type rawOutcome struct {
	ID              string       `yaml:"id"`
	Text            string       `yaml:"text"`
	Until           *string      `yaml:"until"`
	Implementation  []rawExample `yaml:"implementation"`
	Overengineering []rawExample `yaml:"overengineering"`
}

// rawExample is an example as the expectations write it: its text alone, or
// its text and kinds.
type rawExample struct {
	Text  string   `yaml:"text"`
	Kinds []string `yaml:"kinds"`
}

func (e *rawExample) UnmarshalYAML(node *yaml.Node) error {
	if node.Kind == yaml.ScalarNode {
		e.Text = node.Value
		return nil
	}
	type plain rawExample
	return node.Decode((*plain)(e))
}

// Expectations are the expectations built into docket, as state holds them.
// They're the same for every project, so they're read once.
var Expectations = sync.OnceValues(func() (state.Expectations, error) {
	var raw rawExpectations
	if err := yaml.Unmarshal(expectations.YAML, &raw); err != nil {
		return state.Expectations{}, fmt.Errorf("the expectations: %w", err)
	}
	out := state.Expectations{Kinds: []state.Kind{}, Qualities: []state.Quality{}}
	for _, k := range raw.Kinds {
		out.Kinds = append(out.Kinds, state.Kind{ID: k.ID, Name: k.Name})
	}
	for _, q := range raw.Qualities {
		quality := state.Quality{ID: q.ID, Name: q.Name, Question: q.Question, Why: q.Why, Levels: []state.Level{}}
		for _, name := range state.Levels {
			l := q.Levels[name]
			level := state.Level{
				Level:           name,
				Summary:         l.Summary,
				Outcomes:        []state.Outcome{},
				Implementation:  examples(l.Implementation),
				Overengineering: examples(l.Overengineering),
			}
			for _, o := range l.Outcomes {
				level.Outcomes = append(level.Outcomes, state.Outcome{
					ID:              fmt.Sprintf("outcome:%s/%s/%s", q.ID, name, o.ID),
					Level:           name,
					Text:            strings.TrimSpace(o.Text),
					Until:           o.Until,
					Implementation:  examples(o.Implementation),
					Overengineering: examples(o.Overengineering),
				})
			}
			quality.Levels = append(quality.Levels, level)
		}
		out.Qualities = append(out.Qualities, quality)
	}
	return out, nil
})

func examples(raw []rawExample) []state.Example {
	out := make([]state.Example, 0, len(raw))
	for _, e := range raw {
		out = append(out, state.Example{Text: strings.TrimSpace(e.Text), Kinds: list(e.Kinds)})
	}
	return out
}
