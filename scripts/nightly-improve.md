# Nightly Self-Improvement Protocol

**Triggered by:** Cron at 2:00 AM ET daily
**Backup trigger:** Cron at 3:00 AM ET (catches failures from first run)

## What the agent does each night:

### 1. Session Review
- Read all session files from today
- Extract: decisions made, mistakes, successes, customer interactions
- Note any recurring friction or inefficiency

### 2. Memory Maintenance
- Recalculate knowledge graph decay weights
- Promote durable facts from daily notes → knowledge graph
- Update tacit knowledge with new patterns
- Archive stale entities

### 3. Self-Improvement
For each session reviewed, ask:
- "What could I have done better?"
- "Is there a skill or template I should update?"
- "Did I repeat a mistake that's already documented?"

Then:
- Update AGENTS.md with new regressions/lessons
- Improve skill files if a workflow was clunky
- Add to tacit knowledge if a new pattern emerged
- Update SOUL.md if identity/approach needs refinement

### 4. Changelog
Write a summary to `memory/daily/YYYY-MM-DD-improvements.md`:
```markdown
# Nightly Improvements — YYYY-MM-DD

## Memory Changes
- Added: [entity] to knowledge graph
- Archived: [entity] (decayed below threshold)
- Updated: [tacit pattern]

## Self-Improvements
- Updated: [file] — [what changed and why]
- New skill: [skill name] — [purpose]

## Metrics
- Sessions reviewed: N
- Facts extracted: N
- Entities archived: N
- Files modified: N
```

### 5. Report
Post summary to Discord #daily-report channel with:
- What was improved
- Diffs of significant changes (use git diff)
- Any items needing Alex's review
- Revenue/cost update if applicable

## Anti-Patterns
- Don't delete or overwrite — always additive or archive
- Don't "improve" things that are working fine (stability > novelty)
- Don't modify SOUL.md without flagging it prominently
- Don't run for more than 30 minutes — set a hard timeout
