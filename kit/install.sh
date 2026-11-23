#!/usr/bin/env bash
# Install Docket's agent kit into a project, to be committed with it:
#
# - copies skills/docket/ to <project>/.agents/skills/docket/, where agents
#   that read the Agent Skills standard find it
# - links <project>/.claude/skills/docket to it, for Claude Code
# - writes AGENTS.md's Docket block, between markers, leaving the rest alone
# - makes sure CLAUDE.md imports AGENTS.md, for Claude Code
#
# Usage: install.sh [project-dir]
#
# Safe to re-run, to update the kit. Never deletes anything: files in the
# project's copy that the kit no longer has are reported and left in place.
set -euo pipefail

kit="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project="$(cd "${1:-.}" && pwd)"
start='<!-- docket-kit:start -->'
end='<!-- docket-kit:end -->'
conflicts=0

report() { printf '%-9s %s\n' "$1" "${2#"$project"/}"; }

[[ -e $project/docket.yaml ]] ||
  echo "note: $project has no docket.yaml yet; the skill's adopting.md says how to start"

# 1. The skill, copied with links followed, so checklist.yml is a real file.
dest="$project/.agents/skills/docket"
mkdir -p "$dest"
for file in "$kit/skills/docket"/*; do
  to="$dest/$(basename "$file")"
  if [[ ! -e $to ]]; then
    cp -L "$file" "$to" && report added "$to"
  elif cmp -s "$file" "$to"; then
    report ok "$to"
  else
    cp -L "$file" "$to" && report updated "$to"
  fi
done
for file in "$dest"/*; do
  [[ -e $kit/skills/docket/$(basename "$file") ]] ||
    report "not in kit, left alone:" "$file"
done

# 2. Claude Code reads skills from .claude/skills/, not .agents/skills/.
link="$project/.claude/skills/docket"
target="../../.agents/skills/docket"
mkdir -p "$(dirname "$link")"
if [[ -L $link && $(readlink "$link") == "$target" ]]; then
  report ok "$link"
elif [[ -e $link || -L $link ]]; then
  report CONFLICT "$link exists and isn't a link to $target; review it"
  conflicts=$((conflicts + 1))
else
  ln -s "$target" "$link" && report added "$link -> $target"
fi

# 3. AGENTS.md: the kit owns what's between the markers, the project the rest.
agents="$project/AGENTS.md"
block="$(
  echo "$start"
  echo "<!-- Written by Docket's kit/install.sh. Re-run it to update this block,"
  echo "     and put this project's own instructions outside it. -->"
  echo
  cat "$kit/AGENTS.md"
  echo
  echo "$end"
)"
if [[ ! -e $agents ]]; then
  printf '%s\n' "$block" >"$agents" && report added "$agents"
elif grep -qF "$start" "$agents"; then
  if ! grep -qF "$end" "$agents"; then
    report CONFLICT "$agents has the start marker but not the end one; fix it by hand"
    conflicts=$((conflicts + 1))
  else
    new="$(BLOCK="$block" awk -v s="$start" -v e="$end" '
      $0 == s { print ENVIRON["BLOCK"]; skip = 1; next }
      $0 == e { skip = 0; next }
      !skip' "$agents")"
    if [[ $new == "$(cat "$agents")" ]]; then
      report ok "$agents"
    else
      printf '%s\n' "$new" >"$agents" && report updated "$agents"
    fi
  fi
else
  printf '\n%s\n' "$block" >>"$agents" && report updated "$agents (block added at the end)"
fi

# 4. Claude Code reads CLAUDE.md, not AGENTS.md, so CLAUDE.md imports it.
claude="$project/CLAUDE.md"
if [[ -L $claude && $(readlink -f "$claude") == "$(readlink -f "$agents")" ]]; then
  report ok "$claude (a link to AGENTS.md)"
elif [[ ! -e $claude ]]; then
  printf '@AGENTS.md\n' >"$claude" && report added "$claude"
elif grep -qE '^@(\./)?AGENTS\.md[[:space:]]*$' "$claude"; then
  report ok "$claude"
else
  printf '\n@AGENTS.md\n' >>"$claude" && report updated "$claude (imports AGENTS.md)"
fi

[[ $conflicts -eq 0 ]]
