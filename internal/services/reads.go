package services

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"strings"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/derive"
	"github.com/docqet/docqet/internal/state"
)

var (
	// ErrProductNotFound is returned for a product no project is part of.
	ErrProductNotFound = errors.New("services: product not found")
	// ErrInvalidScope is returned for a scope that names a project that isn't
	// the product's, or a for that names nothing showing.
	ErrInvalidScope = errors.New("services: invalid scope")
	// ErrNotFound is returned for a doc, gap or tradeoff that isn't showing.
	ErrNotFound = errors.New("services: not found")
)

// StateSource is where reads take their states from: the latest state of
// every project, in the same order on every call. It's each project's latest
// applied state for docqet serve, and .docqet/state.json for docqet ui.
type StateSource func(ctx context.Context) ([]*state.State, error)

// ReadService answers every read the same way, whoever asks: it takes a
// product's states from its source, narrows them to a scope, and puts them
// together, so the figures derive works out from them are the same
// everywhere.
type ReadService struct {
	source StateSource
}

// NewReadService returns a ReadService over source.
func NewReadService(source StateSource) *ReadService {
	return &ReadService{source: source}
}

// ProductSummary is a product and the latest states of its projects.
type ProductSummary struct {
	ID     string
	Name   string
	States []*state.State
}

// productOf is the product a state's project is part of: the one it
// declares, or else one of its own, named for it.
func productOf(st *state.State) state.Ident {
	if st.Product != nil {
		return *st.Product
	}
	return st.Project
}

// Products returns every product, in the order their first projects come,
// each named by its first project's state.
func (s *ReadService) Products(ctx context.Context) ([]ProductSummary, error) {
	states, err := s.source(ctx)
	if err != nil {
		return nil, err
	}
	var products []ProductSummary
	for _, st := range states {
		p := productOf(st)
		i := slices.IndexFunc(products, func(x ProductSummary) bool { return x.ID == p.ID })
		if i < 0 {
			products = append(products, ProductSummary{ID: p.ID, Name: p.Name})
			i = len(products) - 1
		}
		products[i].States = append(products[i].States, st)
	}
	return products, nil
}

// Scope narrows what a read shows. Projects, when set, shows only those of
// the product's projects. Initiative, when set, shows only what's part of
// it, as the initiative concept says.
type Scope struct {
	Projects   []string
	Initiative string
}

// View is a product as one read shows it: its projects' states, narrowed to
// the scope and put together.
type View struct {
	*combine.Product
	// States are the states it was put together from, after the scope.
	States []*state.State
}

// View returns a product put together within scope, or ErrProductNotFound,
// or ErrInvalidScope for a project that isn't the product's or an
// initiative that isn't showing.
func (s *ReadService) View(ctx context.Context, product string, scope Scope) (*View, error) {
	products, err := s.Products(ctx)
	if err != nil {
		return nil, err
	}
	i := slices.IndexFunc(products, func(x ProductSummary) bool { return x.ID == product })
	if i < 0 {
		return nil, ErrProductNotFound
	}
	states := products[i].States
	if len(scope.Projects) > 0 {
		var chosen []*state.State
		for _, id := range scope.Projects {
			j := slices.IndexFunc(states, func(st *state.State) bool { return st.Project.ID == id })
			if j < 0 {
				return nil, fmt.Errorf("%w: %s isn't one of %s's projects", ErrInvalidScope, id, product)
			}
			chosen = append(chosen, states[j])
		}
		states = chosen
	}
	states = combine.ScopeToInitiative(states, scope.Initiative)
	v := &View{Product: combine.Combine(states), States: states}
	if scope.Initiative != "" && v.Initiative(scope.Initiative) == nil {
		return nil, fmt.Errorf("%w: %s isn't showing", ErrInvalidScope, state.DocRef(state.TypeInitiative, scope.Initiative))
	}
	return v, nil
}

// GapOn returns the gap with key on the doc ref names, such as
// capability:room-booking: the first in the product's order, whatever
// project declares it, or nil.
func (v *View) GapOn(ref, key string) *combine.Gap {
	prefix := ref + "#" + key + "@"
	for _, g := range v.Gaps {
		if strings.HasPrefix(g.ID, prefix) {
			return g
		}
	}
	return nil
}

// ProjectMaturity returns one project's maturity, from its features alone,
// as if it were shown on its own.
func (v *View) ProjectMaturity(project string) *derive.Maturity {
	if len(v.States) == 1 && v.States[0].Project.ID == project {
		return derive.ProductMaturity(v.Product)
	}
	for _, st := range v.States {
		if st.Project.ID == project {
			return derive.ProductMaturity(combine.Combine([]*state.State{st}))
		}
	}
	return nil
}

// Within returns the capabilities a for names, as the CLI's --for and the
// API's ?for= mean it: a project's, a persona's, a problem's, a
// constraint's, an initiative's, an area's or a feature's capabilities, or one capability.
// Several references, separated by commas, name the capabilities they all
// share, such as those in a feature that serve a persona. It returns
// ErrInvalidScope for a reference that names nothing showing.
func (v *View) Within(refs string) ([]*combine.Capability, error) {
	var caps []*combine.Capability
	for i, ref := range strings.Split(refs, ",") {
		these, err := v.within(strings.TrimSpace(ref))
		if err != nil {
			return nil, err
		}
		if i == 0 {
			caps = these
			continue
		}
		caps = slices.DeleteFunc(caps, func(c *combine.Capability) bool { return !slices.Contains(these, c) })
	}
	return caps, nil
}

func (v *View) within(ref string) ([]*combine.Capability, error) {
	r, ok := state.ParseRef(ref)
	if !ok {
		return nil, fmt.Errorf("%w: %q isn't a reference", ErrInvalidScope, ref)
	}
	invalid := fmt.Errorf("%w: %s isn't showing", ErrInvalidScope, ref)
	switch r.Type {
	case "project":
		var caps []*combine.Capability
		for _, c := range v.Capabilities {
			if slices.ContainsFunc(c.From, func(f combine.Contribution) bool { return f.Project == r.ID }) {
				caps = append(caps, c)
			}
		}
		if !slices.ContainsFunc(v.Projects, func(p combine.Project) bool { return p.ID == r.ID }) {
			return nil, invalid
		}
		return caps, nil
	case state.TypePersona:
		if p := v.Persona(r.ID); p != nil {
			return derive.PersonaCapabilities(v.Product, p), nil
		}
	case state.TypeProblem:
		if pr := v.Problem(r.ID); pr != nil {
			return derive.ProblemCapabilities(v.Product, pr), nil
		}
	case state.TypeConstraint:
		if cn := v.Constraint(r.ID); cn != nil {
			return derive.ConstraintCapabilities(v.Product, cn), nil
		}
	case state.TypeInitiative:
		if i := v.Initiative(r.ID); i != nil {
			return derive.CapabilitiesByID(v.Product, i.Capabilities), nil
		}
	case state.TypeArea:
		if a := v.Area(r.ID); a != nil {
			return derive.AreaCapabilities(v.Product, a), nil
		}
	case state.TypeFeature:
		if f := v.Feature(r.ID); f != nil {
			return derive.CapabilitiesByID(v.Product, f.Capabilities), nil
		}
	case state.TypeCapability:
		if c := v.Capability(r.ID); c != nil {
			return []*combine.Capability{c}, nil
		}
	}
	return nil, invalid
}
