package commands

import (
	"context"
	"errors"
	"fmt"
	"io"
	"slices"
	"strings"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/derive"
	"github.com/docqet/docqet/internal/index"
	"github.com/docqet/docqet/internal/state"
)

// RubricCommand shows the stability rubric: what each level expects.
// docqet:implements capability:rubric
func RubricCommand() *cli.Command {
	return &cli.Command{
		Name:      "rubric",
		Category:  reading,
		Usage:     "What each stability level expects",
		ArgsUsage: "[outcome:<quality>/<level>/<id>]",
		Description: `Shows the stability rubric, which is built into docqet and the same for every
project: every quality and the outcomes each level expects. --level shows what
one level expects, including what lower levels carry up, with the examples of
overengineering at that level. An outcome's reference shows it with its
examples. --for and --to list what promoting a capability expects that its
level doesn't yet, and where each outcome stands: only they read the project.`,
		ArgValidator: maxArgs(1),
		Flags: withSourceFlags(
			&cli.StringFlag{Name: "level", Usage: "everything `LEVEL` expects, including what it carries up"},
			&cli.StringFlag{Name: "for", Usage: "what promoting capability `REF` needs, with --to"},
			&cli.StringFlag{Name: "to", Usage: "with --for, the `LEVEL` to promote to"},
		),
		Action: func(ctx context.Context, cmd *cli.Command) error {
			out := cmd.Root().Writer
			asJSON := cmd.Bool("json")
			if cmd.IsSet("for") || cmd.IsSet("to") {
				return promotion(ctx, cmd)
			}
			rubric, err := index.Rubric()
			if err != nil {
				return err
			}
			if ref := cmd.Args().First(); ref != "" {
				o, q := derive.ExpectedOutcome(&rubric, ref)
				if o == nil {
					return fmt.Errorf("%s isn't an outcome in the rubric: docqet rubric lists them", ref)
				}
				if asJSON {
					writeJSON(out, map[string]any{"quality": q.ID, "outcome": o})
					return nil
				}
				printOutcome(out, q, o)
				return nil
			}
			level := cmd.String("level")
			if level != "" && !slices.Contains(state.Levels, level) {
				return fmt.Errorf("--level is one of %s", strings.Join(state.Levels, ", "))
			}
			if asJSON {
				writeJSON(out, rubricAt(rubric, level))
				return nil
			}
			printRubric(out, rubric, level)
			return nil
		},
	}
}

type rubricQuality struct {
	ID              string          `json:"id"`
	Name            string          `json:"name"`
	Question        string          `json:"question"`
	Summary         *string         `json:"summary,omitempty"`
	Outcomes        []state.Outcome `json:"outcomes"`
	Overengineering []state.Example `json:"overengineering,omitempty"`
}

// rubricAt is the rubric as --json shows it: every outcome, or with level,
// those it expects and its examples of overengineering.
func rubricAt(r state.Rubric, level string) map[string]any {
	if level == "" {
		return map[string]any{"rubric": r}
	}
	var qs []rubricQuality
	for _, q := range r.Qualities {
		rq := rubricQuality{ID: q.ID, Name: q.Name, Question: q.Question, Outcomes: []state.Outcome{}}
		for _, l := range q.Levels {
			if l.Level == level {
				rq.Summary = l.Summary
				rq.Overengineering = l.Overengineering
				for _, o := range l.Outcomes {
					rq.Overengineering = append(rq.Overengineering, o.Overengineering...)
				}
			}
		}
		for _, o := range derive.OutcomesOf(&q) {
			if derive.AppliesAt(o, level) {
				rq.Outcomes = append(rq.Outcomes, o)
			}
		}
		qs = append(qs, rq)
	}
	return map[string]any{"level": level, "qualities": qs}
}

func printRubric(out io.Writer, r state.Rubric, level string) {
	if level != "" {
		_, _ = fmt.Fprintf(out, "What %s expects, with what lower levels carry up\n\n", levelName(level))
	}
	for _, q := range r.Qualities {
		_, _ = fmt.Fprintf(out, "%s: %s\n", q.Name, q.Question)
		for _, l := range q.Levels {
			if level != "" && l.Level != level {
				continue
			}
			if level == "" {
				summary := "expects nothing"
				if l.Summary != nil {
					summary = oneLine(*l.Summary, 200)
				}
				_, _ = fmt.Fprintf(out, "  %s: %s\n", levelName(l.Level), summary)
				for _, o := range l.Outcomes {
					_, _ = fmt.Fprintf(out, "    %s\n      %s\n", o.ID, oneLine(o.Text, 300))
				}
				continue
			}
			if l.Summary != nil {
				_, _ = fmt.Fprintf(out, "  %s\n", oneLine(*l.Summary, 300))
			}
		}
		if level == "" {
			_, _ = fmt.Fprintln(out)
			continue
		}
		for _, o := range derive.OutcomesOf(&q) {
			if derive.AppliesAt(o, level) {
				_, _ = fmt.Fprintf(out, "  %s\n    %s\n", o.ID, oneLine(o.Text, 300))
			}
		}
		var over []state.Example
		for _, l := range q.Levels {
			if l.Level == level {
				over = append(over, l.Overengineering...)
				for _, o := range l.Outcomes {
					over = append(over, o.Overengineering...)
				}
			}
		}
		if len(over) > 0 {
			_, _ = fmt.Fprintf(out, "  Likely overengineering at %s:\n", levelName(level))
			for _, e := range over {
				_, _ = fmt.Fprintf(out, "    - %s\n", oneLine(e.Text, 200))
			}
		}
		_, _ = fmt.Fprintln(out)
	}
}

func printOutcome(out io.Writer, q *state.Quality, o *state.Outcome) {
	_, _ = fmt.Fprintf(out, "%s\n%s, from %s", o.ID, q.Name, levelName(o.Level))
	if o.Until != nil {
		_, _ = fmt.Fprintf(out, " until %s", levelName(*o.Until))
	}
	_, _ = fmt.Fprintf(out, "\n\n%s\n", oneLine(o.Text, 2000))
	examples := func(title string, list []state.Example) {
		if len(list) == 0 {
			return
		}
		_, _ = fmt.Fprintf(out, "\n%s\n", title)
		for _, e := range list {
			kinds := ""
			if len(e.Kinds) > 0 {
				kinds = " (" + strings.Join(e.Kinds, ", ") + ")"
			}
			_, _ = fmt.Fprintf(out, "  - %s%s\n", oneLine(e.Text, 300), kinds)
		}
	}
	examples("How meeting it might look", o.Implementation)
	examples("Likely overengineering", o.Overengineering)
}

type promotionRow struct {
	Outcome   string         `json:"outcome"`
	Text      string         `json:"text"`
	Standing  string         `json:"standing"`
	Gaps      []gapView      `json:"gaps"`
	Tradeoffs []tradeoffView `json:"tradeoffs"`
	Decisions []decisionView `json:"decisions"`
	MetBy     []string       `json:"metBy"`
}

// promotion is rubric --for --to: each outcome the target level expects that
// the capability's level doesn't, and where it stands.
func promotion(ctx context.Context, cmd *cli.Command) error {
	ref, to := cmd.String("for"), cmd.String("to")
	if ref == "" || to == "" {
		return errors.New("--for and --to go together, such as --for capability:room-booking --to beta")
	}
	if !slices.Contains(state.Levels, to) {
		return fmt.Errorf("--to is one of %s", strings.Join(state.Levels, ", "))
	}
	r, ok := state.ParseRef(ref)
	if !ok || r.Type != state.TypeCapability || r.Key != "" {
		return fmt.Errorf("--for takes a capability, such as capability:room-booking, not %q", ref)
	}
	lo, err := readHere(ctx, cmd, "")
	if err != nil {
		return err
	}
	p := lo.view.Product
	c := p.Capability(r.ID)
	if c == nil {
		return fmt.Errorf("%s isn't in this project", ref)
	}
	if combine.Rank(to) <= combine.Rank(c.Stability) {
		return fmt.Errorf("%s is already %s: --to has to be above it", ref, levelName(c.Stability))
	}
	if p.Rubric == nil {
		return errors.New("the project's state has no rubric")
	}
	at := *c
	at.Stability = to
	var rows []promotionRow
	for _, q := range p.Rubric.Qualities {
		for _, o := range derive.OutcomesOf(&q) {
			if !derive.AppliesAt(o, to) || derive.AppliesAt(o, c.Stability) {
				continue
			}
			s := derive.OutcomeStandingOf(p, &at, o)
			row := promotionRow{Outcome: o.ID, Text: o.Text, Standing: string(s.Standing), Gaps: []gapView{}, Tradeoffs: []tradeoffView{}, MetBy: []string{}}
			for _, g := range s.Gaps {
				row.Gaps = append(row.Gaps, gapViewOf(p, g))
			}
			for _, t := range s.Tradeoffs {
				row.Tradeoffs = append(row.Tradeoffs, tradeoffViewOf(t))
			}
			row.Decisions = decisionViews("", s.Decisions)
			for _, t := range s.By {
				row.MetBy = append(row.MetBy, t.Kind+":"+t.ID)
			}
			rows = append(rows, row)
		}
	}
	out := cmd.Root().Writer
	if cmd.Bool("json") {
		writeJSON(out, map[string]any{"source": lo.source, "capability": ref, "from": c.Stability, "to": to, "outcomes": rows})
		return nil
	}
	_, _ = fmt.Fprintf(out, "%s\n\n%s   %s → %s\n\n", lo.source.line(), ref, levelName(c.Stability), levelName(to))
	if len(rows) == 0 {
		_, _ = fmt.Fprintln(out, "Nothing more is expected.")
		return nil
	}
	tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
	for _, row := range rows {
		var what []string
		for _, g := range row.Gaps {
			what = append(what, fmt.Sprintf("%s (%s)", g.ID, g.ratings()))
		}
		for _, t := range row.Tradeoffs {
			what = append(what, t.ID)
		}
		for _, d := range row.Decisions {
			what = append(what, fmt.Sprintf("decision: %q", oneLine(d.Question, 80)))
		}
		what = append(what, row.MetBy...)
		detail := strings.Join(what, ", ")
		if row.Standing == string(derive.StandingTrust) {
			detail = "nothing affects it, so promoting claims it's met"
		}
		_, _ = fmt.Fprintf(tw, "%s\t%s\t%s\n", row.Outcome, row.Standing, detail)
	}
	return tw.Flush()
}
