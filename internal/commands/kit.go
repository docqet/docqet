package commands

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"
	"text/tabwriter"

	"github.com/urfave/cli/v3"

	"github.com/exalynt/docket/internal/project"
)

// kitTarget is a place agents read a project's skills from, and the kit's
// skill folder there.
type kitTarget struct {
	Name   string `json:"name"`
	Skills string `json:"skills"` // the folder that holds every skill, such as .agents/skills
}

// dir is the kit's skill folder in the target.
func (t kitTarget) dir() string { return t.Skills + "/docket" }

// kitTargets are the places the kit can be installed, in the order they're
// written. agents is the default and comes first: when it's installed, the
// kit's block is in AGENTS.md and names its folder.
var kitTargets = []kitTarget{
	{Name: "agents", Skills: ".agents/skills"},
	{Name: "claude", Skills: ".claude/skills"},
}

// supportedAgent is an agent the kit can be installed for: what it reads, and
// the target its files go in. The kit README's "Supported agents" table says
// the same, and changes with this one.
type supportedAgent struct {
	Name   string `json:"name"` // as given to --agent
	Agent  string `json:"agent"`
	Target string `json:"target"`
	Reads  string `json:"reads"`
	Notes  string `json:"notes,omitempty"`
}

// supportedAgents are checked against each agent's docs as of 2026-11-25.
var supportedAgents = []supportedAgent{
	{Name: "agents", Agent: "Any agent that reads AGENTS.md and .agents/skills/", Target: "agents", Reads: "AGENTS.md, .agents/skills/"},
	{Name: "claude", Agent: "Claude Code", Target: "claude", Reads: "CLAUDE.md (AGENTS.md when there's no CLAUDE.md), .claude/skills/"},
	{Name: "codex", Agent: "Codex", Target: "agents", Reads: "AGENTS.md, .agents/skills/"},
	{Name: "cursor", Agent: "Cursor", Target: "agents", Reads: "AGENTS.md, .agents/skills/"},
	{Name: "copilot", Agent: "GitHub Copilot", Target: "agents", Reads: "AGENTS.md, .agents/skills/ (CLI and cloud agent)",
		Notes: "Copilot in VS Code reads skills only from .github/skills/, so it finds the skill through AGENTS.md."},
	{Name: "gemini", Agent: "Gemini CLI", Target: "agents", Reads: "GEMINI.md, .agents/skills/",
		Notes: "Add AGENTS.md to its context.fileName setting, or it won't read the kit's block."},
	{Name: "windsurf", Agent: "Windsurf", Target: "agents", Reads: "AGENTS.md, .agents/skills/"},
}

// KitCommand manages the agent kit in the project: which agents it's
// installed for, and whether it's this docket's.
// docket:implements capability:kit-install
func KitCommand() *cli.Command {
	agentFlag := &cli.StringSliceFlag{Name: "agent", Usage: "an agent to install the kit for, such as claude or codex: docket kit agents lists them"}
	return &cli.Command{
		Name:     "kit",
		Category: settingUp,
		Usage:    "Install, update or remove the agent kit, for the agents the project uses",
		Description: `The kit is the docket skill and a block of instructions, built into this
docket. It's written where each agent the project uses reads it: for most
agents, the skill in .agents/skills/docket/ and the block in AGENTS.md, and for
Claude Code, the skill in .claude/skills/docket/. Without a subcommand, it
shows what's installed.`,
		Action: func(ctx context.Context, cmd *cli.Command) error { return kitStatus(cmd) },
		Commands: []*cli.Command{
			{
				Name:   "install",
				Before: maxArgs(0),
				Usage:  "Install the kit, for the agents given (most agents, through AGENTS.md, by default), or add agents to it",
				Flags:  []cli.Flag{agentFlag},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					root, installed, err := kitHere()
					if err != nil {
						return err
					}
					want, err := targetsOf(cmd.StringSlice("agent"))
					if err != nil {
						return err
					}
					if len(want) == 0 && len(installed) == 0 {
						want = []string{"agents"}
					}
					return kitApply(cmd, root, union(installed, want), cmd.StringSlice("agent"))
				},
			},
			{
				Name:   "remove",
				Before: maxArgs(0),
				Usage:  "Remove the kit for the agents given, or with none, remove it entirely",
				Flags:  []cli.Flag{agentFlag},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					root, installed, err := kitHere()
					if err != nil {
						return err
					}
					drop, err := targetsOf(cmd.StringSlice("agent"))
					if err != nil {
						return err
					}
					keep := []string{}
					if len(drop) > 0 {
						keep = slices.DeleteFunc(slices.Clone(installed), func(t string) bool { return slices.Contains(drop, t) })
					}
					return kitApply(cmd, root, keep, nil)
				},
			},
			{
				Name:   "update",
				Before: maxArgs(0),
				Usage:  "Rewrite the kit for every agent it's installed for, with this docket's",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					root, installed, err := kitHere()
					if err != nil {
						return err
					}
					if len(installed) == 0 {
						return errors.New("the kit isn't installed here: run docket kit install")
					}
					return kitApply(cmd, root, installed, nil)
				},
			},
			{
				Name:   "status",
				Before: maxArgs(0),
				Usage:  "Show which agents the kit is installed for, and whether it's this docket's",
				Action: func(ctx context.Context, cmd *cli.Command) error { return kitStatus(cmd) },
			},
			{
				Name:   "check",
				Before: maxArgs(0),
				Usage:  "Exit 1 if the kit isn't installed, or isn't this docket's, for CI",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					root, installed, err := kitHere()
					if err != nil {
						return err
					}
					out := cmd.Root().Writer
					if len(installed) == 0 {
						if cmd.Bool("json") {
							writeJSON(out, map[string]any{"installed": []string{}, "upToDate": false})
						} else {
							_, _ = fmt.Fprintln(out, "The kit isn't installed here: run docket kit install.")
						}
						return errFound
					}
					changes, err := applyKit(root, installed, true)
					if err != nil {
						return err
					}
					stale := isStale(changes)
					if cmd.Bool("json") {
						writeJSON(out, map[string]any{"installed": installed, "upToDate": !stale, "files": changes})
					} else {
						printChanges(out, changes, false)
						if stale {
							_, _ = fmt.Fprintln(out, "\nThe project's kit isn't this docket's: run docket kit update.")
						} else {
							_, _ = fmt.Fprintln(out, "\nThe project's kit is up to date.")
						}
					}
					if stale {
						return errFound
					}
					return nil
				},
			},
			{
				Name:   "agents",
				Before: maxArgs(0),
				Usage:  "List the agents the kit can be installed for",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					out := cmd.Root().Writer
					if cmd.Bool("json") {
						writeJSON(out, map[string]any{"agents": supportedAgents, "targets": kitTargets})
						return nil
					}
					printAgents(out)
					return nil
				},
			},
		},
	}
}

// kitHere finds the project and the targets the kit is installed in there.
func kitHere() (root string, installed []string, err error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", nil, err
	}
	if root, err = project.Find(wd); err != nil {
		return "", nil, err
	}
	return root, installedTargets(root), nil
}

// targetsOf maps agent names to the targets their files go in, in the
// targets' order. An unknown name is an error listing the known ones.
func targetsOf(names []string) ([]string, error) {
	var targets []string
	for _, n := range names {
		i := slices.IndexFunc(supportedAgents, func(a supportedAgent) bool { return a.Name == strings.ToLower(n) })
		if i < 0 {
			var known []string
			for _, a := range supportedAgents {
				known = append(known, a.Name)
			}
			return nil, fmt.Errorf("docket kit doesn't know the agent %q: it's one of %s", n, strings.Join(known, ", "))
		}
		targets = append(targets, supportedAgents[i].Target)
	}
	return union(nil, targets), nil
}

// union is the targets in a or b, in kitTargets' order.
func union(a, b []string) []string {
	var out []string
	for _, t := range kitTargets {
		if slices.Contains(a, t.Name) || slices.Contains(b, t.Name) {
			out = append(out, t.Name)
		}
	}
	return out
}

// kitApply makes the project hold the kit in exactly targets, and reports
// what it changed, with the notes for the agents named.
func kitApply(cmd *cli.Command, root string, targets, named []string) error {
	changes, err := applyKit(root, targets, false)
	if err != nil {
		return err
	}
	out := cmd.Root().Writer
	notes := notesFor(named)
	if cmd.Bool("json") {
		writeJSON(out, map[string]any{"installed": targets, "files": changes, "notes": notes})
		return nil
	}
	printChanges(out, changes, true)
	if len(targets) == 0 {
		_, _ = fmt.Fprintln(out, "\nThe kit is removed.")
	} else {
		_, _ = fmt.Fprintf(out, "\nInstalled for: %s\n", servedBy(targets))
	}
	for _, n := range notes {
		_, _ = fmt.Fprintf(out, "Note: %s\n", n)
	}
	return nil
}

// kitStatus shows which agents the kit is installed for, and whether it's
// this docket's.
func kitStatus(cmd *cli.Command) error {
	root, installed, err := kitHere()
	if err != nil {
		return err
	}
	out := cmd.Root().Writer
	var changes []fileChange
	if len(installed) > 0 {
		if changes, err = applyKit(root, installed, true); err != nil {
			return err
		}
	}
	stale := isStale(changes)
	if cmd.Bool("json") {
		writeJSON(out, map[string]any{"installed": installed, "upToDate": len(installed) > 0 && !stale, "files": changes})
		return nil
	}
	if len(installed) == 0 {
		_, _ = fmt.Fprintln(out, "The kit isn't installed here. Install it with docket kit install, or for other agents with --agent: docket kit agents lists them.")
		return nil
	}
	_, _ = fmt.Fprintf(out, "Installed for: %s\n", servedBy(installed))
	if stale {
		_, _ = fmt.Fprintln(out, "It isn't this docket's kit: run docket kit update.")
		printChanges(out, changes, false)
	} else {
		_, _ = fmt.Fprintln(out, "It's this docket's kit.")
	}
	return nil
}

// servedBy says which agents each target serves, such as
// "agents (Codex, Cursor, …), claude (Claude Code)".
func servedBy(targets []string) string {
	var parts []string
	for _, t := range targets {
		var agents []string
		for _, a := range supportedAgents {
			if a.Target == t && a.Name != "agents" {
				agents = append(agents, a.Agent)
			}
		}
		parts = append(parts, fmt.Sprintf("%s (%s)", t, strings.Join(agents, ", ")))
	}
	return strings.Join(parts, ", ")
}

// notesFor is the notes for the agents named.
func notesFor(names []string) []string {
	var notes []string
	for _, a := range supportedAgents {
		if a.Notes != "" && slices.Contains(names, a.Name) {
			notes = append(notes, a.Agent+": "+a.Notes)
		}
	}
	return notes
}

func printAgents(out io.Writer) {
	tw := tabwriter.NewWriter(out, 0, 0, 2, ' ', 0)
	_, _ = fmt.Fprintln(tw, "--agent\tAgent\tTarget\tReads")
	for _, a := range supportedAgents {
		_, _ = fmt.Fprintf(tw, "%s\t%s\t%s\t%s\n", a.Name, a.Agent, a.Target, a.Reads)
	}
	_ = tw.Flush()
	_, _ = fmt.Fprintln(out)
	for _, a := range supportedAgents {
		if a.Notes != "" {
			_, _ = fmt.Fprintf(out, "%s: %s\n", a.Agent, a.Notes)
		}
	}
	_, _ = fmt.Fprintln(out, "\nAn agent not listed that reads AGENTS.md uses --agent agents.")
}

func isStale(changes []fileChange) bool {
	return slices.ContainsFunc(changes, func(c fileChange) bool { return c.Status != "ok" })
}

// printChanges lists each file's status, leaving out those that are ok
// unless all is set.
func printChanges(out io.Writer, changes []fileChange, all bool) {
	for _, c := range changes {
		if all || c.Status != "ok" {
			_, _ = fmt.Fprintf(out, "%-9s %s\n", c.Status, c.Path)
		}
	}
}
