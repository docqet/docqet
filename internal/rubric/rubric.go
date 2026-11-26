// Package rubric holds the stability rubric: what each stability level
// expects of a capability, quality by quality. It's the same for every
// project, and embedded so the binary carries the version it was built with.
package rubric

import _ "embed"

// YAML is the rubric as it's written, in rubric.yml.
//
//go:embed rubric.yml
var YAML []byte
