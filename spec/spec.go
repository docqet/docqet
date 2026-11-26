// Package spec holds the parts of the spec docket reads at run time,
// embedded so the binary carries the version it was built with.
package spec

import _ "embed"

// Checklist is the stability checklist, stability/checklist.yml, the same for
// every project.
//
//go:embed stability/checklist.yml
var Checklist []byte
