# Tweet Drafts — The Autonomous Agent Playbook

*Value-first content sharing individual patterns. Not salesy — each tweet should be useful on its own.*

---

## Tweet 1: The Backup Cron Insight

Our AI agent runs a nightly self-improvement loop at 2am.

But crons fail ~10-15% of the time.

So we added a backup at 3am that checks: "Did the 2am run complete?"
- If yes → no-op
- If no → run the full protocol

Simple. Obvious in retrospect. Saved us dozens of silent failures.

The boring infrastructure patterns are the ones that actually matter.

---

## Tweet 2: The Adversarial Review Problem

When you run 4 AI agents in parallel and merge their outputs, you get unanimous agreement — not validated conclusions.

Each agent works blind. Nobody challenges anyone.

Fix: add a cross-examination phase.

Spawn 2 reviewer agents. Each MUST find:
- 3 opposing arguments
- 2 overestimated factors
- 1 blind spot

"Please review this" produces polite agreement.
"You MUST find 3 problems" makes the reviewer actually dig.

Two extra minutes. In return: answers that know where their own boundaries are.

---

## Tweet 3: Memory Decay

Flat-file memory (MEMORY.md) doesn't scale.

The fix: add a decay function.

`weight = base_weight × (0.95 ^ days_since_last_access)`

Knowledge you access stays prominent.
Knowledge you don't fades naturally.
Auto-archive anything below 0.1.

Without decay, agent memory becomes a hoarder's attic — everything saved, nothing findable.

With decay, it becomes a living system that surfaces what matters.

---

## Tweet 4: Skills vs Rules

If your CLAUDE.md / .cursorrules is over 500 lines, you're doing it wrong.

Rules = always loaded, every turn. (Style guides, security policies, project context.)

Skills = loaded on demand when relevant. (Deploy procedures, domain workflows, debugging guides.)

Putting a 200-line deployment procedure in your rules file means every single agent turn pays that context cost — even when fixing a typo.

Move procedures to skill files. Keep rules under 100 lines. Your agent gets faster immediately.

---

## Tweet 5: The Self-Healing Loop

Our agent's scripts break sometimes. Dependencies update, APIs change format, edge cases appear.

But nobody notices — because of this loop:

```
Smoke test fails
→ Capture error output
→ Spawn fix agent with context
→ Re-run tests
→ Pass? Commit the fix automatically.
→ Fail after 3 attempts? Alert a human.
```

Key rule: the fix agent can modify source code but NEVER modify the tests.

Most mornings we wake up to a commit message: "Auto-fix: updated parser for new API response format."

Zero downtime. Zero human intervention.
