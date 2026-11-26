// Package client talks to a Docket server's API, for the commands that act
// on the server.
package client

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/exalynt/docket/internal/state"
)

// ErrNotFound is returned when the server has nothing for what was asked.
var ErrNotFound = errors.New("not found on the server")

// Client calls one Docket server.
type Client struct {
	base string
	http *http.Client
}

// New returns a Client for the server at base, such as https://docket.example.com.
func New(base string) *Client {
	return &Client{base: strings.TrimRight(base, "/") + "/api/v1", http: &http.Client{Timeout: time.Minute}}
}

// Commit is a commit the server has applied for a project.
type Commit struct {
	Project     string    `json:"project"`
	Commit      string    `json:"commit"`
	CommittedAt time.Time `json:"committedAt"`
	AppliedAt   time.Time `json:"appliedAt"`
}

// Project is a project the server has states for.
type Project struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	LastCommit Commit `json:"lastCommit"`
}

// GetProject returns a project as of its latest applied commit, or
// ErrNotFound when nothing's been applied for it.
func (c *Client) GetProject(ctx context.Context, project string) (Project, error) {
	var p Project
	_, err := c.do(ctx, http.MethodGet, "/projects/"+url.PathEscape(project), nil, &p)
	return p, err
}

// HasCommit reports whether the server has applied a project's commit.
func (c *Client) HasCommit(ctx context.Context, project, sha string) (bool, error) {
	_, err := c.do(ctx, http.MethodGet, "/projects/"+url.PathEscape(project)+"/commits/"+url.PathEscape(sha), nil, nil)
	if errors.Is(err, ErrNotFound) {
		return false, nil
	}
	return err == nil, err
}

// ApplyCommit sends a project's state at a commit. created reports whether
// the commit was new to the server, rather than replacing what it had.
func (c *Client) ApplyCommit(ctx context.Context, project, sha string, a state.Applied) (created bool, err error) {
	status, err := c.do(ctx, http.MethodPut, "/projects/"+url.PathEscape(project)+"/commits/"+url.PathEscape(sha), a, nil)
	return status == http.StatusCreated, err
}

// do sends a request with body as JSON, and decodes a successful response
// into out. An error response becomes an error with the server's message.
func (c *Client) do(ctx context.Context, method, path string, body, out any) (int, error) {
	var reader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return 0, err
		}
		reader = bytes.NewReader(data)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.base+path, reader)
	if err != nil {
		return 0, err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return 0, fmt.Errorf("couldn't reach the server: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode == http.StatusNotFound {
		return resp.StatusCode, ErrNotFound
	}
	if resp.StatusCode >= 300 {
		var e struct {
			Error string `json:"error"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&e)
		if e.Error == "" {
			e.Error = resp.Status
		}
		return resp.StatusCode, fmt.Errorf("the server refused it (%d): %s", resp.StatusCode, e.Error)
	}
	if out != nil {
		if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
			return resp.StatusCode, fmt.Errorf("reading the server's response: %w", err)
		}
	}
	return resp.StatusCode, nil
}
