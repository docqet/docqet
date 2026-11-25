// Package kit holds the agent development kit, embedded so `docket kit` can
// install it into a project.
package kit

import "embed"

//go:embed AGENTS.md skills
var Files embed.FS
