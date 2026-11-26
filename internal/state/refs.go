package state

import (
	"regexp"
	"strings"
)

// Ref is a reference, parsed: <type>:<id>, with @<domain> for a rule or
// concept in another domain, and #<key> for a gap or tradeoff on a doc.
type Ref struct {
	Type   string
	ID     string
	Domain string
	Key    string
}

var refPattern = regexp.MustCompile(`^([a-z]+):([a-z0-9]+(?:-[a-z0-9]+)*)(?:@([a-z0-9]+(?:-[a-z0-9]+)*))?(?:#([a-z0-9]+(?:-[a-z0-9]+)*))?$`)

// ParseRef parses a reference. Outcome references, outcome:<quality>/<level>/<id>,
// aren't doc references, so they don't parse: see IsOutcomeRef.
func ParseRef(s string) (Ref, bool) {
	m := refPattern.FindStringSubmatch(s)
	if m == nil {
		return Ref{}, false
	}
	return Ref{Type: m[1], ID: m[2], Domain: m[3], Key: m[4]}, true
}

// IsOutcomeRef reports whether s is written as a checklist outcome's reference.
func IsOutcomeRef(s string) bool {
	return strings.HasPrefix(s, "outcome:")
}

// DocRef is the reference to a doc of type typ with id.
func DocRef(typ, id string) string {
	return typ + ":" + id
}

var kebab = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

// IsKebab reports whether s is kebab case, as IDs and values are.
func IsKebab(s string) bool {
	return kebab.MatchString(s)
}

// The doc types, as `docket` names them.
const (
	TypeDomain     = "domain"
	TypeFeature    = "feature"
	TypeCapability = "capability"
	TypeRule       = "rule"
	TypeConcept    = "concept"
	TypePersona    = "persona"
	TypeInitiative = "initiative"
	TypeMechanism  = "mechanism"
	TypeComponent  = "component"
)

// Stability levels, in order, after draft.
var Levels = []string{"prototype", "alpha", "beta", "ga"}
