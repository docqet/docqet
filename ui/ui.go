// Package ui holds the built UI, embedded so the docket binary can serve it.
//
// `npm run build` writes it to dist. A fresh clone has only dist/.gitkeep, so
// the binary builds without Node and serves an empty UI until it's built.
package ui

import "embed"

//go:embed all:dist
var Dist embed.FS
