# Parallel Worktree Operations

Operational pattern for running multiple coding agents on the same codebase without conflicts. Uses git worktrees for isolation, tasklists for coordination, and Graphite for cleanup.

## The Problem

Multiple agents working on the same repo will:
- Conflict on file edits (same branch, same files)
- Overwrite each other's uncommitted changes
- Create merge nightmares if not isolated

## The Solution: Worktree-Per-Agent

Each parallel coding agent gets its own **git worktree** — a separate checkout of the repo with its own working directory, branch, and index. Changes are isolated until merge.

**Convention:** Worktrees live in `.trees/` inside the repo (not `/tmp/`). This keeps them discoverable, project-scoped, and survives reboots.

```
main repo: ~/project/                     (orchestrator reads, doesn't write)
    │
    ├── .trees/auth/                       (Agent A's isolated checkout)
    │   └── branch: feat/auth
    ├── .trees/api/                        (Agent B's isolated checkout)
    │   └── branch: feat/api
    └── .trees/ui/                         (Agent C's isolated checkout)
        └── branch: feat/ui
```

See [skills/worktrees.md](../skills/worktrees.md) for the full creation skill.
See [skills/gt-sync-cleanup.md](../skills/gt-sync-cleanup.md) for the cleanup skill.

## Lifecycle

### 1. Create (Before Spawning Agent)

The orchestrator creates worktrees for each agent BEFORE spawning:

```bash
cd ~/project
mkdir -p .trees

# Add .trees to .gitignore
grep -q '^\.trees$' .gitignore 2>/dev/null || echo '.trees' >> .gitignore

# Create worktree per agent
git worktree add -b feat/auth .trees/auth
git worktree add -b feat/api .trees/api
git worktree add -b feat/ui .trees/ui

# Symlink env files + deps for each
for slug in auth api ui; do
  cd .trees/$slug
  for f in ../../.env*; do [ -f "$f" ] && ln -sf "$f" .; done
  [ -d "../../node_modules" ] && ln -sf ../../node_modules .
  cd ../..
done
```

Then spawn each agent with `workdir` set to its `.trees/<slug>` path.

### 2. Work (Agent Operates in Worktree)

Each agent works in its isolated worktree. It can:
- Read/write files freely
- Run tests, build, lint
- Make commits on its branch
- Push its branch to remote

Agents do NOT interact with each other's worktrees.

### 3. Submit (Agent Creates PR)

When done, the agent creates a PR from its branch:

```bash
# Using Graphite
cd /tmp/wt-feature-auth
gt submit

# Or using gh
gh pr create --base main --head feature/auth --title "Implement auth"
```

### 4. Review & Merge

Orchestrator or reviewer agent:
- Reviews each PR (adversarial review if warranted)
- Merges via GitHub (squash merge preferred for clean history)

### 5. Cleanup (Post-Merge)

**Use the gt-sync-cleanup skill** ([skills/gt-sync-cleanup.md](../skills/gt-sync-cleanup.md)) for full automated cleanup. The key steps:

1. **Pre-sync:** Detect worktrees with merged/closed PRs via `gh pr view` → remove them (unblocks `gt sync`)
2. **Sync:** `gt sync` fetches remote, restacks branches, deletes merged branch refs
3. **Post-sync:** Remove orphaned worktrees whose branches were deleted by `gt sync`
4. **Prune:** `git worktree prune`

```bash
# Quick version (from main repo)
cd ~/project

# Pre-sync: remove worktrees for merged PRs
main_wt=$(git rev-parse --show-toplevel)
git worktree list --porcelain | grep '^worktree ' | sed 's/^worktree //' | while read wt; do
  [ "$wt" = "$main_wt" ] && continue
  branch=$(git worktree list | grep "^$wt " | grep -oE '\[.+\]' | tr -d '[]')
  [ -z "$branch" ] && continue
  pr_state=$(gh pr view "$branch" --json state --jq '.state' 2>/dev/null)
  if [ "$pr_state" = "MERGED" ] || [ "$pr_state" = "CLOSED" ]; then
    git worktree remove "$wt" 2>/dev/null && git branch -D "$branch" 2>/dev/null
  fi
done

# Sync
gt sync

# Post-sync: remove orphaned worktrees
git worktree list --porcelain | grep '^worktree ' | sed 's/^worktree //' | while read wt; do
  [ "$wt" = "$main_wt" ] && continue
  branch=$(git worktree list | grep "^$wt " | grep -oE '\[.+\]' | tr -d '[]')
  [ -z "$branch" ] && continue
  git show-ref --verify --quiet "refs/heads/$branch" || git worktree remove "$wt" 2>/dev/null
done

git worktree prune
```

**Safety guarantees:**
- Uncommitted changes are protected (`git worktree remove` refuses without `--force`)
- Only MERGED/CLOSED PRs trigger pre-sync removal; OPEN PRs are untouched
- Local-only branches (no PR) are skipped
- Stale git lock files (>5min, no owner process) are cleared before sync

## Tasklist Coordination

Use Claude Code's Task tool (or a shared tasklist file) to prevent agents from working on overlapping areas.

### Task Assignment File

The orchestrator writes a `TASKS.md` (or uses Claude's built-in Task tool) before spawning agents:

```markdown
# Tasks — Feature Sprint

## Agent A: feature/auth (worktree: /tmp/wt-feature-auth)
- [ ] Implement login flow in src/auth/
- [ ] Add JWT middleware in src/middleware/
- [ ] Write tests in tests/auth/
DO NOT TOUCH: src/api/, src/ui/, src/db/

## Agent B: feature/api (worktree: /tmp/wt-feature-api)
- [ ] Implement REST endpoints in src/api/
- [ ] Add validation schemas in src/api/schemas/
- [ ] Write tests in tests/api/
DO NOT TOUCH: src/auth/, src/ui/, src/middleware/

## Agent C: feature/ui (worktree: /tmp/wt-feature-ui)
- [ ] Build React components in src/ui/
- [ ] Add Storybook stories in src/ui/__stories__/
- [ ] Write tests in tests/ui/
DO NOT TOUCH: src/auth/, src/api/, src/middleware/
```

### Key Rules
- **Explicit file boundaries** — each agent knows exactly which directories are theirs
- **DO NOT TOUCH lists** — prevents accidental overlap
- **Shared files** (e.g., types, constants) — either pre-define them before spawning, or assign ONE agent as owner

### Handling Shared Dependencies

If agents need shared types/interfaces:

1. **Pre-create shared types** before spawning agents (orchestrator does this)
2. **Or assign one agent as "foundation"** that runs first and creates shared types
3. **Never let two agents edit the same file** — this is the #1 source of merge conflicts

## Integration with Tiered Architecture

```
Orchestrator (Pip)
    │
    │ 1. Create worktrees
    │ 2. Write TASKS.md with boundaries
    │ 3. Spawn Claude sub-agents with worktree paths
    │
    ├── Claude: Implementer-A (workdir: .trees/auth)
    │   ├── reads TASKS.md, respects boundaries
    │   └── spawns Codex in same worktree if needed
    │
    ├── Claude: Implementer-B (workdir: .trees/api)
    │   ├── reads TASKS.md, respects boundaries
    │   └── spawns Codex in same worktree if needed
    │
    └── Claude: Reviewer
        └── reviews all PRs post-submission
    
    After merge:
    │ 4. Run gt-sync-cleanup skill (pre-sync → gt sync → post-sync → prune)
    │ 5. Verify main has all changes
```

## Graphite Integration

If using Graphite (`gt`):

```bash
# Create branches via gt from the worktree
cd /tmp/wt-feature-auth
gt create -am "Implement auth flow"

# Submit PR
gt submit

# After merge, from main repo:
gt sync    # pulls trunk, restacks, cleans merged branches

# Then remove worktrees
git worktree remove /tmp/wt-feature-auth
```

`gt sync` handles branch cleanup automatically for merged branches, but worktree directories still need manual removal.

## Anti-Patterns

❌ **Two agents in the same worktree** — guaranteed conflicts
❌ **No file boundaries** — agents edit the same files, merge hell
❌ **Forgetting cleanup** — orphaned worktrees pile up in /tmp
❌ **Branching off another agent's branch** — use main as base for all worktrees
❌ **Shared mutable state files** — if two agents need to update the same config, serialize (one after the other)

## Checklist for Orchestrator

Before spawning parallel coding agents:
- [ ] `mkdir -p .trees` and ensure `.trees` in `.gitignore`
- [ ] Create worktree per agent: `git worktree add -b feat/{slug} .trees/{slug}`
- [ ] Symlink `.env*` files and deps into each worktree
- [ ] Write TASKS.md with explicit file boundaries
- [ ] Pre-create shared types/interfaces if needed
- [ ] Set each agent's workdir to `.trees/{slug}`

After all agents complete and PRs merge:
- [ ] Run gt-sync-cleanup (pre-sync → `gt sync` → post-sync → prune)
- [ ] Verify main branch has all changes
- [ ] `git worktree list` to confirm cleanup

## See Also
- [Tiered Agent Orchestration](tiered-agent-orchestration.md) — full hierarchy pattern
- [Parallel Agent Teams](parallel-agent-teams.md) — git-based coordination
- [Fleet Parallel Workers](../../projects/micro-saas-lab/agents/patterns/fleet-parallel.md) — the simpler version
