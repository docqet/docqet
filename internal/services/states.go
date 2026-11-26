// Package services is where the server's work is orchestrated: what to check,
// what to store, and in what order, over the repositories.
package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/docqet/docqet/internal/check"
	"github.com/docqet/docqet/internal/repositories"
	"github.com/docqet/docqet/internal/state"
)

var (
	// ErrInvalidState is returned for a state that isn't one, or that's sent
	// for another project or commit than it says.
	ErrInvalidState = errors.New("services: invalid state")
	// ErrProjectNotFound is returned for a project with nothing applied.
	ErrProjectNotFound = errors.New("services: project not found")
	// ErrCommitNotFound is returned for a commit that hasn't been applied.
	ErrCommitNotFound = errors.New("services: commit not found")
)

// StateService takes the states `docqet apply` sends, and hands them back.
type StateService struct {
	states repositories.StateRepository
	uow    repositories.UnitOfWork
	now    func() time.Time
}

// NewStateService returns a StateService over states, writing in uow's
// transactions.
func NewStateService(states repositories.StateRepository, uow repositories.UnitOfWork) *StateService {
	return &StateService{states: states, uow: uow, now: time.Now}
}

// Applied is a project's state at a commit, as the server holds it.
type Applied struct {
	Commit repositories.AppliedCommit
	State  *state.State
}

var shaPattern = regexp.MustCompile(`^(?:[0-9a-f]{40}|[0-9a-f]{64})$`)

// Apply stores a project's state at a commit, replacing any stored for it,
// so sending a commit twice changes nothing. It checks the state as the CLI
// does, and keeps the problems it finds itself rather than the ones it's
// sent, but for those only files show. It returns ErrInvalidState for a state
// that isn't one, or that's for another project. created reports whether the
// commit is new to the server.
// docqet:implements capability:applying component:server rule:applying-twice-changes-nothing@reporting
func (s *StateService) Apply(ctx context.Context, project, sha string, a state.Applied) (result Applied, created bool, err error) {
	invalid := func(format string, args ...any) error {
		return fmt.Errorf("%w: %s", ErrInvalidState, fmt.Sprintf(format, args...))
	}
	if !shaPattern.MatchString(sha) {
		return Applied{}, false, invalid("%q isn't a full commit SHA", sha)
	}
	committedAt, err := time.Parse(time.RFC3339, a.CommittedAt)
	if err != nil {
		return Applied{}, false, invalid("committedAt %q isn't an RFC 3339 time", a.CommittedAt)
	}
	for _, p := range a.Parents {
		if !shaPattern.MatchString(p) {
			return Applied{}, false, invalid("parent %q isn't a full commit SHA", p)
		}
	}
	st := a.State
	if err := check.Validate(&st); err != nil {
		return Applied{}, false, invalid("%s", err)
	}
	if st.Project.ID != project {
		return Applied{}, false, invalid("the state is project %s's, not %s's", st.Project.ID, project)
	}

	st.Commit = sha
	check.Recheck(&st)
	hash, body, err := stateBody(&st)
	if err != nil {
		return Applied{}, false, err
	}
	c := repositories.AppliedCommit{
		Project:     project,
		SHA:         sha,
		Parents:     a.Parents,
		CommittedAt: committedAt,
		AppliedAt:   s.now(),
		Trailers:    a.Trailers,
		StateHash:   hash,
		IndexedAt:   st.IndexedAt,
	}
	if st.Product != nil {
		c.Product = st.Product.ID
	}
	err = s.uow.Do(ctx, func(ctx context.Context) error {
		if err := s.states.PutState(ctx, hash, body); err != nil {
			return err
		}
		created, err = s.states.UpsertCommit(ctx, c)
		return err
	})
	if err != nil {
		return Applied{}, false, err
	}
	return Applied{Commit: c, State: &st}, created, nil
}

// stateBody is the state as it's stored, without what's particular to the
// commit it was indexed at, so commits that change nothing in the docs share
// one, and the hash it's stored under.
func stateBody(st *state.State) (hash string, body []byte, err error) {
	stored := *st
	stored.Commit, stored.IndexedAt = "", ""
	body, err = json.Marshal(stored)
	if err != nil {
		return "", nil, err
	}
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:]), body, nil
}

// GetCommit returns a project's applied commit, without its state, or
// ErrCommitNotFound.
func (s *StateService) GetCommit(ctx context.Context, project, sha string) (repositories.AppliedCommit, error) {
	c, err := s.states.GetCommit(ctx, project, sha)
	if errors.Is(err, repositories.ErrNotFound) {
		return c, ErrCommitNotFound
	}
	return c, err
}

// Get returns a project's state at a commit, or ErrCommitNotFound.
func (s *StateService) Get(ctx context.Context, project, sha string) (Applied, error) {
	c, err := s.GetCommit(ctx, project, sha)
	if err != nil {
		return Applied{}, err
	}
	return s.withState(ctx, c)
}

// GetLatest returns a project's latest applied state, by commit time, or
// ErrProjectNotFound when nothing's been applied for it.
func (s *StateService) GetLatest(ctx context.Context, project string) (Applied, error) {
	c, err := s.states.GetLatestCommit(ctx, project)
	if errors.Is(err, repositories.ErrNotFound) {
		return Applied{}, ErrProjectNotFound
	}
	if err != nil {
		return Applied{}, err
	}
	return s.withState(ctx, c)
}

// ListLatest returns every project's latest applied state, by project ID.
func (s *StateService) ListLatest(ctx context.Context) ([]Applied, error) {
	projects, err := s.states.ListProjects(ctx)
	if err != nil {
		return nil, err
	}
	latest := make([]Applied, 0, len(projects))
	for _, p := range projects {
		a, err := s.GetLatest(ctx, p)
		if err != nil {
			return nil, fmt.Errorf("the latest state of %s: %w", p, err)
		}
		latest = append(latest, a)
	}
	return latest, nil
}

func (s *StateService) withState(ctx context.Context, c repositories.AppliedCommit) (Applied, error) {
	body, err := s.states.GetState(ctx, c.StateHash)
	if err != nil {
		return Applied{}, fmt.Errorf("the state of %s at %s: %w", c.Project, c.SHA, err)
	}
	var st state.State
	if err := json.Unmarshal(body, &st); err != nil {
		return Applied{}, err
	}
	st.Commit, st.IndexedAt = c.SHA, c.IndexedAt
	return Applied{Commit: c, State: &st}, nil
}
