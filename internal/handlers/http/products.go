package http

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	"github.com/docqet/docqet/internal/combine"
	"github.com/docqet/docqet/internal/services"
	"github.com/docqet/docqet/internal/state"
)

// impacts are the impacts a gap can be rated, from the least.
var impacts = []string{"negligible", "inconvenient", "blocking", "damaging"}

// ProductsHandler serves the resources the UI reads about each product: its
// docs put together across its projects, with the figures derive works out
// for them. Every read goes through the read service.
type ProductsHandler struct {
	logger *slog.Logger
	reads  *services.ReadService
}

// NewProductsHandler returns a ProductsHandler over reads.
// docqet:implements capability:overview capability:readiness capability:product-view
func NewProductsHandler(logger *slog.Logger, reads *services.ReadService) *ProductsHandler {
	return &ProductsHandler{logger: logger, reads: reads}
}

// RegisterRoutes mounts the product routes on r, as resources.go lists them.
func (h *ProductsHandler) RegisterRoutes(r chi.Router) {
	r.Get("/products", h.ListProducts)
	r.Get("/products/{product}", h.GetProduct)
	r.Get("/products/{product}/status", h.GetStatus)
	r.Get("/products/{product}/projects", h.ListProjects)
	r.Get("/products/{product}/rubric", h.GetRubric)
	r.Get("/products/{product}/domains", h.ListDomains)
	r.Get("/products/{product}/domains/{id}", h.GetDomain)
	r.Get("/products/{product}/features", h.ListFeatures)
	r.Get("/products/{product}/features/{id}", h.GetFeature)
	r.Get("/products/{product}/capabilities", h.ListCapabilities)
	r.Get("/products/{product}/capabilities/{id}", h.GetCapability)
	r.Get("/products/{product}/capabilities/{id}/gaps/{key}", h.getNestedGap(state.TypeCapability))
	r.Get("/products/{product}/rules", h.ListRules)
	r.Get("/products/{product}/domains/{domain}/rules/{id}", h.GetRule)
	r.Get("/products/{product}/concepts", h.ListConcepts)
	r.Get("/products/{product}/domains/{domain}/concepts/{id}", h.GetConcept)
	r.Get("/products/{product}/personas", h.ListPersonas)
	r.Get("/products/{product}/personas/{id}", h.GetPersona)
	r.Get("/products/{product}/initiatives", h.ListInitiatives)
	r.Get("/products/{product}/initiatives/{id}", h.GetInitiative)
	r.Get("/products/{product}/mechanisms", h.listTechnical(combine.KindMechanism))
	r.Get("/products/{product}/mechanisms/{id}", h.getTechnical(combine.KindMechanism))
	r.Get("/products/{product}/mechanisms/{id}/gaps/{key}", h.getNestedGap(state.TypeMechanism))
	r.Get("/products/{product}/components", h.listTechnical(combine.KindComponent))
	r.Get("/products/{product}/components/{id}", h.getTechnical(combine.KindComponent))
	r.Get("/products/{product}/components/{id}/gaps/{key}", h.getNestedGap(state.TypeComponent))
	r.Get("/products/{product}/gaps", h.ListGaps)
	r.Get("/products/{product}/tradeoffs", h.ListTradeoffs)
	r.Get("/products/{product}/decisions", h.ListDecisions)
	r.Get("/products/{product}/problems", h.ListProblems)
	r.Get("/products/{product}/search", h.Search)
}

// ListProducts lists every product, each with every project of its own.
func (h *ProductsHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	summaries, err := h.reads.Products(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	products := make([]ProductResource, len(summaries))
	for i, s := range summaries {
		v, err := h.reads.View(r.Context(), s.ID, services.Scope{})
		if err != nil {
			h.fail(w, r, err)
			return
		}
		products[i] = newProductResource(v)
	}
	writePage(w, r, products)
}

// GetProduct returns a product.
func (h *ProductsHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		render.JSON(w, r, newProductResource(v))
	}
}

// GetStatus returns the product at a glance, or the figures of what a ?for=
// names.
func (h *ProductsHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	v, ok := h.view(w, r)
	if !ok {
		return
	}
	within, ok := h.within(w, r, v)
	if !ok {
		return
	}
	render.JSON(w, r, newStatusResource(v, within))
}

// ListProjects lists the product's projects showing.
func (h *ProductsHandler) ListProjects(w http.ResponseWriter, r *http.Request) {
	v, ok := h.view(w, r)
	if !ok {
		return
	}
	projects := make([]ProductProjectResource, len(v.Projects))
	for i, p := range v.Projects {
		projects[i] = newProductProjectResource(v, p)
	}
	writePage(w, r, projects)
}

// GetRubric returns the product's rubric, empty when it has none.
func (h *ProductsHandler) GetRubric(w http.ResponseWriter, r *http.Request) {
	v, ok := h.view(w, r)
	if !ok {
		return
	}
	rubric := state.Rubric{Kinds: []state.Kind{}, Qualities: []state.Quality{}}
	if v.Rubric != nil {
		rubric = *v.Rubric
	}
	render.JSON(w, r, rubric)
}

// ListDomains lists the domains showing.
func (h *ProductsHandler) ListDomains(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Domains, func(d *combine.Domain) DomainResource { return newDomainResource(v.Product, d) }))
	}
}

// GetDomain returns a domain.
func (h *ProductsHandler) GetDomain(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		id := chi.URLParam(r, "id")
		if d := v.Domain(id); d != nil {
			render.JSON(w, r, newDomainResource(v.Product, d))
			return
		}
		notShowing(w, r, state.DocRef(state.TypeDomain, id))
	}
}

// ListFeatures lists the features showing.
func (h *ProductsHandler) ListFeatures(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Features, func(f *combine.Feature) FeatureResource { return newFeatureResource(v.Product, f) }))
	}
}

// GetFeature returns a feature.
func (h *ProductsHandler) GetFeature(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		id := chi.URLParam(r, "id")
		if f := v.Feature(id); f != nil {
			render.JSON(w, r, newFeatureResource(v.Product, f))
			return
		}
		notShowing(w, r, state.DocRef(state.TypeFeature, id))
	}
}

// ListCapabilities lists the capabilities showing, narrowed by ?for= and
// ?stability=.
func (h *ProductsHandler) ListCapabilities(w http.ResponseWriter, r *http.Request) {
	levels, ok := listParam(w, r, "stability", append([]string{combine.Draft}, state.Levels...))
	if !ok {
		return
	}
	v, ok := h.view(w, r)
	if !ok {
		return
	}
	within, ok := h.within(w, r, v)
	if !ok {
		return
	}
	writePage(w, r, build(v.ListCapabilities(within, levels), func(c *combine.Capability) CapabilityResource {
		return newCapabilityResource(v.Product, c)
	}))
}

// GetCapability returns a capability.
func (h *ProductsHandler) GetCapability(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		id := chi.URLParam(r, "id")
		if c := v.Capability(id); c != nil {
			render.JSON(w, r, newCapabilityResource(v.Product, c))
			return
		}
		notShowing(w, r, state.DocRef(state.TypeCapability, id))
	}
}

// getNestedGap returns the gap with a key on a doc of a type: the first,
// in the product's order, whatever project declares it.
func (h *ProductsHandler) getNestedGap(typ string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		v, ok := h.view(w, r)
		if !ok {
			return
		}
		ref, key := state.DocRef(typ, chi.URLParam(r, "id")), chi.URLParam(r, "key")
		if g := v.GapOn(ref, key); g != nil {
			render.JSON(w, r, newGapResource(v.Product, g, nil))
			return
		}
		notShowing(w, r, ref+"#"+key)
	}
}

// ListRules lists the rules showing.
func (h *ProductsHandler) ListRules(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Rules, func(x *combine.Rule) RuleResource { return newRuleResource(v.Product, x) }))
	}
}

// GetRule returns a domain's rule.
func (h *ProductsHandler) GetRule(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		key := chi.URLParam(r, "id") + "@" + chi.URLParam(r, "domain")
		if x := v.Rule(key); x != nil {
			render.JSON(w, r, newRuleResource(v.Product, x))
			return
		}
		notShowing(w, r, state.DocRef(state.TypeRule, key))
	}
}

// ListConcepts lists the concepts showing.
func (h *ProductsHandler) ListConcepts(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Concepts, newConceptResource))
	}
}

// GetConcept returns a domain's concept.
func (h *ProductsHandler) GetConcept(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		key := chi.URLParam(r, "id") + "@" + chi.URLParam(r, "domain")
		if c := v.Concept(key); c != nil {
			render.JSON(w, r, newConceptResource(c))
			return
		}
		notShowing(w, r, state.DocRef(state.TypeConcept, key))
	}
}

// ListPersonas lists the personas showing.
func (h *ProductsHandler) ListPersonas(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Personas, func(p *combine.Persona) PersonaResource { return newPersonaResource(v.Product, p) }))
	}
}

// GetPersona returns a persona.
func (h *ProductsHandler) GetPersona(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		id := chi.URLParam(r, "id")
		if p := v.Persona(id); p != nil {
			render.JSON(w, r, newPersonaResource(v.Product, p))
			return
		}
		notShowing(w, r, state.DocRef(state.TypePersona, id))
	}
}

// ListInitiatives lists the initiatives showing.
func (h *ProductsHandler) ListInitiatives(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Initiatives, func(i *combine.Initiative) InitiativeResource { return newInitiativeResource(v.Product, i) }))
	}
}

// GetInitiative returns an initiative.
func (h *ProductsHandler) GetInitiative(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		id := chi.URLParam(r, "id")
		if i := v.Initiative(id); i != nil {
			render.JSON(w, r, newInitiativeResource(v.Product, i))
			return
		}
		notShowing(w, r, state.DocRef(state.TypeInitiative, id))
	}
}

// listTechnical lists the mechanisms or components showing, by kind.
func (h *ProductsHandler) listTechnical(kind string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		v, ok := h.view(w, r)
		if !ok {
			return
		}
		docs := v.Mechanisms
		if kind == combine.KindComponent {
			docs = v.Components
		}
		writePage(w, r, build(docs, func(t *combine.Technical) TechnicalResource { return newTechnicalResource(v.Product, t) }))
	}
}

// getTechnical returns a mechanism or component, by kind.
func (h *ProductsHandler) getTechnical(kind string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		v, ok := h.view(w, r)
		if !ok {
			return
		}
		ref := state.DocRef(kind, chi.URLParam(r, "id"))
		if t := v.Technical(ref); t != nil {
			render.JSON(w, r, newTechnicalResource(v.Product, t))
			return
		}
		notShowing(w, r, ref)
	}
}

// ListGaps lists the gaps showing, narrowed by ?for= and ?impact=, and
// riskiest first with ?sort=risk.
func (h *ProductsHandler) ListGaps(w http.ResponseWriter, r *http.Request) {
	rated, ok := listParam(w, r, "impact", impacts)
	if !ok {
		return
	}
	sorts, ok := listParam(w, r, "sort", []string{"risk"})
	if !ok {
		return
	}
	v, ok := h.view(w, r)
	if !ok {
		return
	}
	within, ok := h.within(w, r, v)
	if !ok {
		return
	}
	writePage(w, r, build(v.ListGaps(within, rated, len(sorts) > 0), func(l services.ListedGap) GapResource {
		return newGapResource(v.Product, l.Gap, l.Within)
	}))
}

// ListTradeoffs lists the tradeoffs showing.
func (h *ProductsHandler) ListTradeoffs(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Tradeoffs, func(t *combine.Tradeoff) TradeoffResource { return newTradeoffResource(v.Product, t) }))
	}
}

// ListDecisions lists the open decisions showing, each with the doc it's on.
func (h *ProductsHandler) ListDecisions(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, newHeldDecisionResources(v.Product, v.ListDecisions()))
	}
}

// ListProblems lists the problems showing.
func (h *ProductsHandler) ListProblems(w http.ResponseWriter, r *http.Request) {
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Problems, newProblemResource))
	}
}

// Search lists the projects and docs that match ?q=, best first.
func (h *ProductsHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeError(w, r, http.StatusBadRequest, "q is required: the text to search for")
		return
	}
	if v, ok := h.view(w, r); ok {
		writePage(w, r, build(v.Search(q), newSearchResultResource))
	}
}

// build translates each of items into its resource, as a list that's never
// null.
func build[T, R any](items []T, resource func(T) R) []R {
	out := make([]R, len(items))
	for i, x := range items {
		out[i] = resource(x)
	}
	return out
}

// view returns the product the path names, put together within ?project=
// and ?initiative=. It writes the error and returns false when it can't.
func (h *ProductsHandler) view(w http.ResponseWriter, r *http.Request) (*services.View, bool) {
	query := r.URL.Query()
	scope := services.Scope{Projects: splitList(query.Get("project")), Initiative: query.Get("initiative")}
	v, err := h.reads.View(r.Context(), chi.URLParam(r, "product"), scope)
	if err != nil {
		h.fail(w, r, err)
		return nil, false
	}
	return v, true
}

// within returns the capabilities ?for= names, never nil with one, or nil
// without it. It writes the error and returns false when it can't.
func (h *ProductsHandler) within(w http.ResponseWriter, r *http.Request, v *services.View) ([]*combine.Capability, bool) {
	ref := r.URL.Query().Get("for")
	if ref == "" {
		return nil, true
	}
	caps, err := v.Within(ref)
	if err != nil {
		h.fail(w, r, err)
		return nil, false
	}
	return list(caps), true
}

// fail maps the read service's errors to a status and a message safe to
// return. Anything unexpected is a 500, with its cause logged.
func (h *ProductsHandler) fail(w http.ResponseWriter, r *http.Request, err error) {
	switch {
	case errors.Is(err, services.ErrProductNotFound):
		writeError(w, r, http.StatusNotFound, "nothing applied is part of this product")
	case errors.Is(err, services.ErrInvalidScope):
		writeError(w, r, http.StatusBadRequest, strings.TrimPrefix(err.Error(), "services: "))
	default:
		h.logger.ErrorContext(r.Context(), "request failed", "method", r.Method, "path", r.URL.Path, "error", err)
		writeError(w, r, http.StatusInternalServerError, "something went wrong")
	}
}

// notShowing writes the 404 for a doc or gap, by reference, that isn't
// showing.
func notShowing(w http.ResponseWriter, r *http.Request, ref string) {
	writeError(w, r, http.StatusNotFound, ref+" isn't showing")
}

// splitList splits a comma list, leaving out empty entries.
func splitList(s string) []string {
	var out []string
	for x := range strings.SplitSeq(s, ",") {
		if x = strings.TrimSpace(x); x != "" {
			out = append(out, x)
		}
	}
	return out
}

// listParam returns a query parameter's comma list, each one of allowed. It
// writes a 400 saying what's allowed and returns false for anything else.
func listParam(w http.ResponseWriter, r *http.Request, name string, allowed []string) ([]string, bool) {
	values := splitList(r.URL.Query().Get(name))
	for _, x := range values {
		if !slices.Contains(allowed, x) {
			msg := fmt.Sprintf("invalid %s: %q must be %s", name, x, allowed[0])
			if len(allowed) > 1 {
				msg = fmt.Sprintf("invalid %s: %q isn't one of %s or %s", name, x, strings.Join(allowed[:len(allowed)-1], ", "), allowed[len(allowed)-1])
			}
			writeError(w, r, http.StatusBadRequest, msg)
			return nil, false
		}
	}
	return values, true
}
