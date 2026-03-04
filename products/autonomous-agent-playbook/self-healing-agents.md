# Self-Healing Agents Pattern

## Overview

Self-healing agents automatically detect, diagnose, and fix failures in automated pipelines without human intervention. The pattern creates a verification loop around every agent task and every scheduled job.

## Core Components

### 1. Post-Agent Verification Hooks

After every Codex agent completes a task, run a verification step before marking it "done":

```
Agent completes → Run tests → Pass? → Report success
                              Fail? → Write feedback → Agent retries
```

**Implementation:** `lib/self-healing/post_agent_verify.sh`

- Takes: test command, working directory, agent label
- Runs the test suite against the agent's output
- On pass: writes `success` to the agent's status file
- On fail: captures error output, writes it as feedback for the agent to iterate

**Key principle:** The human should never be the first person to discover a bug. Tests catch it, the agent fixes it, then it reports success.

### 2. Smoke Test Framework

Periodic health checks for all scripts and pipelines:

```
Cron (daily) → smoke_runner.sh → Run all test_*.py + smoke_*.sh
                                → Report JSON results
                                → Alert on failures
```

**Implementation:** `lib/self-healing/smoke_runner.sh`

- Discovers all `test_*.py` and `smoke_*.sh` files in a directory
- Runs each with a timeout
- Outputs structured JSON: `{tests: [{name, status, duration, output}], summary: {pass, fail, skip}}`
- Non-zero exit if any test fails

**Smoke tests vs unit tests:**
- Smoke tests: "Does it run at all? Can it import? Does --dry-run work?"
- Unit tests: "Does the logic produce correct results?"
- Both are needed. Smoke tests catch environment/dependency rot.

### 3. Auto-Correction Loop

When a test fails, automatically spawn a fix agent:

```
Test fails → Capture output → Spawn Codex agent with:
               - Failed test output
               - Source files
               - "Fix this test failure"
             → Re-run tests
             → Pass? Done.
             → Fail? Retry (up to N times)
```

**Implementation:** `lib/self-healing/auto_correct.sh`

- Takes: failed test output, working directory, max retries (default 3)
- Spawns a Codex agent via `codex-agent.sh` with the failure context
- Re-runs tests after each fix attempt
- Gives up after N attempts and alerts the human

**Guard rails:**
- Max 3 retry attempts (prevent infinite loops)
- Each attempt gets the cumulative context (what was tried before)
- Time-boxed: 10 min per attempt max
- Only fixes test failures, never modifies tests themselves

### 4. Regression Gates

Tests must pass before any agent can report "done" to a human:

```
Agent work → Pre-commit tests → Pass? → Commit + report
                                 Fail? → Auto-correct loop
                                         Still fail? → Report failure (not success)
```

This is enforced by `post_agent_verify.sh` being the mandatory exit gate for all agent tasks.

### 5. Cron/Script Git-Tracking

All operational scripts and cron definitions live in version control:

- Cron jobs defined in `crons.yaml` (see `patterns/cron-as-code.md`)
- Scripts versioned in git with tests
- Changes to crons require a commit (auditable)
- `cron_manifest.py` can diff live crons vs declared crons and sync

## Integration Pattern

```yaml
# In your project:
tests/
  test_*.py          # Unit tests (pytest)
  smoke_test.sh      # Quick health check
crons.yaml           # Declared cron jobs
scripts/
  self_check.sh      # Runs full test suite + smoke tests
```

## When to Use

- Any project with scheduled/automated scripts
- Agent-generated code that needs verification
- Pipelines that run unattended (crons, webhooks)
- Any system where "it broke 3 days ago and nobody noticed" is unacceptable

## Anti-Patterns

- **Testing tests:** Don't let the auto-correct agent modify test files
- **Infinite retry:** Always cap retries; alert humans when stuck
- **Silent failures:** Every failure must produce a notification
- **Untested smoke tests:** Smoke tests themselves should be simple enough to be obviously correct
