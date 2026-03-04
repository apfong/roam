# Safe Looping Patterns

How to get the benefits of autonomous agent loops without blowing through budget.

## The Problem

The Anthropic C compiler project ran Claude in an infinite loop with a $20K budget. Most of us need:
- Progress within budget
- Oversight without micromanagement
- Ability to course-correct before drift compounds

## Patterns

### 1. Bounded Iterations (Cheapest)

For focused tasks — bug fixes, small features:

```
Work on this task. Make up to 5 attempts to fix the issue.
After 5 attempts OR success, stop and report status.
```

**Cost:** Predictable, capped at N iterations
**Use when:** Single well-defined problem

### 2. Checkpoint Pattern (For Large Work)

For features, refactors, multi-file changes:

```markdown
After every significant change:
1. Commit with descriptive message
2. Update PROGRESS.md with what's done and what's next

After ~10 commits OR hitting a major milestone:
1. Push all commits
2. Stop and summarize progress for review
3. Wait for approval to continue

If stuck on something for >3 attempts:
1. Document the blocker in PROGRESS.md
2. Move to a different task or ask for help
```

**Why 10 commits:** Balances autonomy with oversight. Enough to make real progress, not so much that drift compounds.

**Cost:** Variable but controlled. Human reviews every ~10 commits.

**Progress file format:**
```markdown
# Progress

## Current Status
[What's working, what's not]

## Completed This Session
- [commit abc123] Added user auth
- [commit def456] Fixed login redirect
- [commit ghi789] Added tests for auth flow

## Next Up
- [ ] Password reset flow
- [ ] Email verification

## Blockers / Questions
- OAuth integration: tried X and Y, neither worked. Need input.

## Failed Approaches (Don't Repeat)
- Tried using library Z for OAuth, failed because [reason]
```

### 3. Time-Boxed Sessions

For maintenance, exploration, background work:

```javascript
sessions_spawn({
  task: "Review and fix TODO comments in src/",
  runTimeoutSeconds: 900,  // 15 min max
  label: "todo-cleanup"
})
```

**Cost:** Capped by time
**Use when:** Open-ended improvement tasks

### 4. Cron-Based Incremental

Periodic short sessions instead of one long loop:

```javascript
// Every hour, work on project for one "turn"
cron.add({
  schedule: "0 * * * *",
  task: "Check PROGRESS.md, complete next TODO, update status, stop"
})
```

**Cost:** Predictable per-session, accumulates over time
**Use when:** Long-running projects, background optimization

### 5. Budget-Aware Prompting

Explicit cost awareness in the prompt:

```
You have a budget of approximately 50K tokens for this task.
Prioritize high-impact changes first.
If stuck after 3 attempts on one issue, document it and move to the next.
Track your progress in PROGRESS.md.
```

**Cost:** Soft cap, relies on model compliance
**Use when:** Want flexibility with guardrails

## Comparison

| Pattern | Autonomy | Cost Control | Best For |
|---------|----------|--------------|----------|
| Bounded iterations | Low | Tight | Bug fixes, focused tasks |
| Checkpoint (10 commits) | Medium-High | Moderate | Features, refactors |
| Time-boxed | Medium | Tight | Exploration, maintenance |
| Cron incremental | High (over time) | Predictable | Long-running projects |
| Budget-aware | High | Soft | Flexible work |

## Anti-Patterns

❌ **Infinite loop without budget** — Will burn through money
❌ **Too frequent checkpoints (every commit)** — Loses efficiency gains
❌ **No progress tracking** — Can't resume, can't course-correct
❌ **No failure documentation** — Agent repeats same mistakes

## Implementation Notes

### For Claude Code
- Use `--dangerously-skip-permissions` only in containers
- The checkpoint pattern works with normal Claude Code sessions
- Sub-agents via `sessions_spawn` respect `runTimeoutSeconds`

### For Sub-Agents (Clawdbot)
```javascript
sessions_spawn({
  task: `
    Work on [feature]. Follow checkpoint pattern:
    - Commit after each significant change
    - Update PROGRESS.md
    - After 10 commits, stop and report
  `,
  runTimeoutSeconds: 1800,  // 30 min safety cap
  label: "feature-work"
})
```

### Monitoring
Set up a cron to check on long-running agents:
```javascript
cron.add({
  schedule: "*/5 * * * *",  // every 5 min
  task: "Check if labeled agents are done, report status"
})
```
