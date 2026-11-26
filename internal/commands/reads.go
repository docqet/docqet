package commands

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/combine"
	"github.com/exalynt/docket/internal/derive"
	"github.com/exalynt/docket/internal/services"
	"github.com/exalynt/docket/internal/state"
)

// local is this project's state, read from the working tree or a commit, and
// put together the way the read service puts any states together, so every
// figure a CLI read shows is worked out by the same code as the server's and
// the UI's.
type local struct {
	indexed
	view *services.View
}

// readHere indexes the project the command is run in, with --at if it was
// given, and puts it together within initiative, when it isn't "". The reads
// built so far read this project's files only, so --remote, --product and
// --project are refused.
func readHere(ctx context.Context, cmd *cli.Command, initiative string) (local, error) {
	if err := notBuiltFlags(cmd.IsSet, "remote", "product", "project"); err != nil {
		return local{}, err
	}
	ix, err := indexHere(ctx, cmd.String("at"))
	if err != nil {
		return local{}, err
	}
	view, err := viewOf(ctx, ix.state, initiative)
	if err != nil {
		return local{}, err
	}
	return local{indexed: ix, view: view}, nil
}

// viewOf puts one state together on its own, as the read service would.
func viewOf(ctx context.Context, st *state.State, initiative string) (*services.View, error) {
	reads := services.NewReadService(func(context.Context) ([]*state.State, error) {
		return []*state.State{st}, nil
	})
	product := st.Project.ID
	if st.Product != nil {
		product = st.Product.ID
	}
	view, err := reads.View(ctx, product, services.Scope{Initiative: initiative})
	if errors.Is(err, services.ErrInvalidScope) {
		return nil, fmt.Errorf("initiative:%s isn't in this project", initiative)
	}
	return view, err
}

// relToRoot turns a path given on the command line, relative to where it was
// run, into one relative to the project's root, as the state's files are.
func relToRoot(root, p string) (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	abs := p
	if !filepath.IsAbs(p) {
		abs = filepath.Join(wd, p)
	}
	rel, err := filepath.Rel(root, abs)
	if err != nil || rel == ".." || strings.HasPrefix(rel, "../") {
		return "", fmt.Errorf("%s isn't in the project at %s", p, root)
	}
	return filepath.ToSlash(rel), nil
}

// under reports whether file is p, or in the folder p.
func under(file, p string) bool {
	return p == "." || file == p || strings.HasPrefix(file, strings.TrimSuffix(p, "/")+"/")
}

// levelName is a level as people read it: Prototype, Alpha, Beta, GA, Draft.
func levelName(level string) string {
	switch level {
	case "ga":
		return "GA"
	case "":
		return ""
	default:
		return strings.ToUpper(level[:1]) + level[1:]
	}
}

// domainName is a domain's name, or its ID when it has no doc.
func domainName(p *combine.Product, id string) string {
	if d := p.Domain(id); d != nil && d.Name != "" {
		return d.Name
	}
	return id
}

// levelsOf is a capability's level in each domain that builds it, such as
// "Beta in Guest stays".
func levelsOf(p *combine.Product, c *combine.Capability) []string {
	var out []string
	for _, l := range c.Levels {
		out = append(out, fmt.Sprintf("%s in %s", levelName(l.Level), domainName(p, l.Domain)))
	}
	return out
}

// declared is a gap's or tradeoff's ID as it's declared and written in an
// annotation, without the @<project> combining adds.
func declared(id string) string {
	hash := strings.Index(id, "#")
	if i := strings.LastIndex(id, "@"); hash >= 0 && i > hash {
		return id[:i]
	}
	return id
}

// keyOf is a gap's or tradeoff's key: what follows # in its ID.
func keyOf(id string) string {
	id = declared(id)
	if i := strings.Index(id, "#"); i >= 0 {
		return id[i+1:]
	}
	return id
}

// ruleRef is a combined rule's or concept's reference, as rule:<id>@<domain>.
func ruleRef(typ, key string) string {
	return typ + ":" + key
}

// inDomain writes a rule's or concept's key, <id>@<domain>, as a link from
// a doc in domain: without the domain when it's the same.
func inDomain(key, domain string) string {
	if id, d, ok := strings.Cut(key, "@"); ok && d == domain {
		return id
	}
	return key
}

// resolveKey finds the combined key of a rule or concept a reference names:
// <id>@<domain> as written, or the only one with that ID when it has no
// domain.
func resolveKey(r state.Ref, keys []string) (string, error) {
	if r.Domain != "" {
		key := r.ID + "@" + r.Domain
		for _, k := range keys {
			if k == key {
				return k, nil
			}
		}
		return "", fmt.Errorf("%s:%s isn't in this project", r.Type, key)
	}
	var found []string
	for _, k := range keys {
		if strings.HasPrefix(k, r.ID+"@") {
			found = append(found, k)
		}
	}
	switch len(found) {
	case 0:
		return "", fmt.Errorf("%s:%s isn't in this project", r.Type, r.ID)
	case 1:
		return found[0], nil
	default:
		return "", fmt.Errorf("%s:%s is in several domains: say which, such as %s:%s", r.Type, r.ID, r.Type, found[0])
	}
}

// ruleKeys and conceptKeys are the product's rules' and concepts' keys.
func ruleKeys(p *combine.Product) []string {
	keys := make([]string, len(p.Rules))
	for i, r := range p.Rules {
		keys[i] = r.ID
	}
	return keys
}

func conceptKeys(p *combine.Product) []string {
	keys := make([]string, len(p.Concepts))
	for i, c := range p.Concepts {
		keys[i] = c.ID
	}
	return keys
}

// gapView is a gap as reads show it.
type gapView struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Impact      string        `json:"impact"`
	Likelihood  string        `json:"likelihood"`
	Reach       string        `json:"reach"`
	Affects     []string      `json:"affects"`
	Risk        int           `json:"risk"`
	Verdict     string        `json:"verdict"`
	Description string        `json:"description,omitempty"`
	Places      []state.Place `json:"places,omitempty"`
}

func gapViewOf(p *combine.Product, g *combine.Gap) gapView {
	r := derive.RiskOf(p, g)
	return gapView{
		ID: declared(g.ID), Name: g.Name, Impact: g.Impact, Likelihood: r.Likelihood, Reach: r.Reach,
		Affects: declaredAll(g.Affects), Risk: r.Score, Verdict: string(r.Verdict),
		Description: g.Description, Places: placesOf(g.Places),
	}
}

// ratings is a gap's impact, likelihood and reach, as "blocking, certain, all".
func (g gapView) ratings() string {
	return fmt.Sprintf("%s, %s, %s", g.Impact, g.Likelihood, g.Reach)
}

// riskText is a gap's risk score and verdict.
func (g gapView) riskText() string {
	return fmt.Sprintf("risk %d (%s)", g.Risk, g.Verdict)
}

// tradeoffView is a tradeoff as reads show it.
type tradeoffView struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Affects     []string      `json:"affects"`
	Description string        `json:"description,omitempty"`
	Benefit     *string       `json:"benefit,omitempty"`
	Drawback    string        `json:"drawback,omitempty"`
	Places      []state.Place `json:"places,omitempty"`
}

func tradeoffViewOf(t *combine.Tradeoff) tradeoffView {
	return tradeoffView{
		ID: declared(t.ID), Name: t.Name, Affects: declaredAll(t.Affects), Description: t.Description,
		Benefit: t.Benefit, Drawback: t.Drawback, Places: placesOf(t.Places),
	}
}

func declaredAll(ids []string) []string {
	out := make([]string, len(ids))
	for i, id := range ids {
		out[i] = declared(id)
	}
	return out
}

func placesOf(places []combine.Place) []state.Place {
	out := make([]state.Place, len(places))
	for i, p := range places {
		out[i] = p.Place
	}
	return out
}

// decisionView is an open decision as reads show it.
type decisionView struct {
	On       string   `json:"on,omitempty"`
	Topic    *string  `json:"topic"`
	Question string   `json:"question"`
	Affects  []string `json:"affects"`
}

func decisionViews(on string, ds []state.Decision) []decisionView {
	out := []decisionView{}
	for _, d := range ds {
		out = append(out, decisionView{On: on, Topic: d.Topic, Question: d.Question, Affects: declaredAll(d.Affects)})
	}
	return out
}

// oneLine folds text onto one line, cut to n runes.
func oneLine(text string, n int) string {
	text = strings.Join(strings.Fields(text), " ")
	if r := []rune(text); len(r) > n {
		return string(r[:n-1]) + "…"
	}
	return text
}

// gapsOf returns the gaps with the given combined IDs, riskiest first.
func gapsOf(p *combine.Product, ids []string) []*combine.Gap {
	var gaps []*combine.Gap
	for _, id := range ids {
		if g := p.Gap(id); g != nil {
			gaps = append(gaps, g)
		}
	}
	return derive.InRiskOrder(p, gaps, func(g *combine.Gap) *combine.Gap { return g })
}

// tradeoffsOf returns the tradeoffs with the given combined IDs.
func tradeoffsOf(p *combine.Product, ids []string) []*combine.Tradeoff {
	var out []*combine.Tradeoff
	for _, id := range ids {
		if t := p.Tradeoff(id); t != nil {
			out = append(out, t)
		}
	}
	return out
}

// tradeoffOn returns the tradeoff with key on the doc ref names, or nil.
func tradeoffOn(p *combine.Product, ref, key string) *combine.Tradeoff {
	prefix := ref + "#" + key + "@"
	for _, t := range p.Tradeoffs {
		if strings.HasPrefix(t.ID, prefix) {
			return t
		}
	}
	return nil
}
