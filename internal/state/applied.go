package state

// Applied is one project's state at a commit on its main branch, with what
// the server needs to place it in history: what `docqet apply` sends.
type Applied struct {
	Parents     []string  `json:"parents"`
	CommittedAt string    `json:"committedAt"`
	Trailers    []Trailer `json:"trailers"`
	State       State     `json:"state"`
}

// Trailer is one of a commit's Docqet trailers, such as
// Docqet-Became: capability:early-arrival -> capability:early-check-in,
// gathered from the commit and any a merge brought in.
type Trailer struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
