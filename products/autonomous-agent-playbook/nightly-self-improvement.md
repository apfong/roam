# Pattern: Nightly Self-Improvement Loop

## Problem
Agents make the same mistakes repeatedly. Skills degrade over time as context drifts. No mechanism for compounding improvement.

## Solution
Scheduled nightly review where the agent examines its own performance and improves its own configuration.

## Implementation

### Cron Setup (OpenClaw)
Two crons — primary + backup (crons are flaky):

**Primary (2:00 AM):**
```
payload: agentTurn
message: "Run your nightly self-improvement protocol. Review today's sessions, improve memory/skills/templates, generate changelog."
```

**Backup (3:00 AM):**
```
payload: agentTurn  
message: "If you haven't completed tonight's self-improvement run, do it now. Check memory/daily/ for today's improvement log."
```

### What the Agent Reviews
1. **Session transcripts** — What happened today?
2. **Mistakes** — What went wrong? Add to regressions list.
3. **Friction** — What was unnecessarily hard? Improve the skill/template.
4. **Patterns** — What repeated? Extract to tacit knowledge.
5. **Successes** — What worked well? Document why.

### What the Agent Modifies
Ordered by frequency (most → least):
- `memory/` files — knowledge graph, daily notes, tacit patterns
- Skill files — workflow improvements
- Templates — better starting points
- `AGENTS.md` — new regressions, workflow updates
- `TOOLS.md` — operational notes
- `SOUL.md` — rare, always flagged prominently

### Changelog Format
```markdown
# Nightly Improvements — YYYY-MM-DD

## Changes
- [file]: [what changed] — [why]

## Metrics
- Sessions reviewed: N
- Improvements made: N
- Regressions added: N

## Needs Human Review
- [item]: [reason it needs approval]
```

### Safety Rails
- Hard timeout: 30 minutes max
- Never delete files — archive or append
- SOUL.md changes require prominent flagging
- All changes committed to git with descriptive messages
- Changelog posted to Discord/communication channel

## Key Insight from Felix/Nat
The backup cron at 3am is critical. Felix's system learned that crons fail ~10-15% of the time. The backup checks if the improvement log exists for today — if it does, it's a no-op. If not, it runs the full protocol. Simple, robust.

## Anti-Patterns
- **Over-optimization:** Don't "improve" things that work. Stability matters.
- **Hallucinated improvements:** Don't invent problems to solve. Base changes on actual session data.
- **Scope creep:** The nightly run is for self-improvement, not product work. Keep them separate.
