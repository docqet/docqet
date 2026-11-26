// Package expectations holds the expectations: what each stability level
// expects of a capability, quality by quality. They're the same for every
// project, and embedded so the binary carries the version it was built with.
package expectations

import _ "embed"

// YAML is the expectations as they're written, in expectations.yml.
//
//go:embed expectations.yml
var YAML []byte
