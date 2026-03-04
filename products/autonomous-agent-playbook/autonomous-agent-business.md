# Pattern: Autonomous Agent Business

## Overview
An AI agent that operates a business end-to-end: product development, marketing, sales, support, and self-improvement. Inspired by FelixCraftAI/Masinov but adapted for multi-agent OpenClaw architecture.

## Architecture

### Agent Hierarchy
```
Human (Founder/Investor)
├── Personal Assistant Agent (existing — handles personal tasks)
└── Business Agent (CEO — autonomous operations)
    ├── Support Agent (customer service, email)
    ├── Dev Agent (coding, bugs, deployments)
    ├── Content Agent (social media, blog, marketing)
    └── Sales Agent (outreach, relationships)
```

### Key Principle: Separate OpenClaw Instances > Sub-agents
Sub-agents (sessions_spawn) die on session recycle. For autonomous business operations, each agent should be a separate OpenClaw instance with:
- Its own workspace directory
- Its own memory files
- Its own cron jobs
- Its own identity (SOUL.md, IDENTITY.md)
- Shared access to common repos via git

### Communication: Discord as Command Center
Discord provides structured channels that serve as both workspace and audit trail:
- Each agent posts to relevant channels
- Human reviews channels 1-2x/day
- Reactions (✅/❌) serve as approval/rejection
- Threads for detailed discussions
- Search for historical decisions

## Three-Tier Memory with Decay

### Layer 1: Knowledge Graph (PARA method)
- Projects, Areas, Resources, Archives
- Entity-based JSON with access tracking
- Decay formula: `weight = base * (0.95 ^ days_since_access)`
- Auto-archive when weight < 0.1

### Layer 2: Daily Notes
- Chronological capture (YYYY-MM-DD.md)
- Nightly extraction → knowledge graph promotion
- 30-day summarize + archive cycle

### Layer 3: Tacit Knowledge
- Patterns about HOW things work
- Customer behavior, operational insights, preferences
- Hardest to capture, most valuable
- Update on pattern recognition, not schedule

## Nightly Self-Improvement Loop

**Critical differentiator.** This is what makes autonomous agents compound over time.

### Schedule
- 2:00 AM: Primary improvement run
- 3:00 AM: Backup run (crons are flaky — always have a backup)

### Process
1. Review all sessions from the day
2. Extract improvements to: skills, memory, templates, agent configs
3. Recalculate memory decay weights
4. Generate changelog with diffs
5. Post summary to Discord #daily-report

### Anti-Patterns
- Don't modify things that work (stability > novelty)
- Don't run for >30 minutes (hard timeout)
- Always additive or archive, never delete

## Trust Ladder

Progressive autonomy earned through competence:

1. **Observer** — Can read, analyze, draft. All actions need approval.
2. **Contributor** — Can execute known workflows. New patterns need approval.
3. **Operator** — Can make operational decisions. Strategy needs approval.
4. **Autonomous** — Full operational autonomy. Only escalates for: spending >$X, first-time public comms, irreversible decisions.

Start at Observer. Promote based on demonstrated competence, not time.

## Revenue Tracking

Every agent must track:
- API costs (tokens, tool calls)
- Infrastructure costs (hosting, services)
- Revenue generated
- Net margin

The business agent should be self-sustaining: revenue > costs. If not, that's priority #1.

## Product Strategy for Agent Businesses

### What agents can sell:
1. **Digital products** — Guides, templates, configs (lowest friction)
2. **Automated services** — Consulting delivered by AI (higher value)
3. **SaaS** — Productized patterns from services (highest scale)

### Meta-insight from Felix/ClawMart:
The most natural first product is "how I work" — selling your own agent configs, memory systems, and operational patterns. This is authentic, requires no inventory, and improves as the agent improves.

## Implementation Checklist

- [ ] Separate OpenClaw instance per agent role
- [ ] Discord server with structured channels
- [ ] Nightly self-improvement crons (2am + 3am backup)
- [ ] Three-tier memory system
- [ ] Revenue/cost tracking from day 1
- [ ] Trust ladder documented with current level
- [ ] Git-based artifact persistence (survives restarts)
- [ ] Changelog system for all self-modifications
