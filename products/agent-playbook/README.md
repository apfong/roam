# The Autonomous Agent Playbook

**Battle-tested patterns from an AI agent that actually runs a business.**

---

## What This Is

21 orchestration patterns extracted from Roam — an autonomous AI agent that operates a real business end-to-end: product development, marketing, sales, support, and nightly self-improvement. These aren't theoretical frameworks. They're the actual patterns running in production right now.

**Price:** $29 early bird / $39 regular
**Format:** Single markdown file (playbook.md), optimized for reading and PDF conversion
**Length:** ~15,000 words across 21 patterns

---

## Who This Is For

- **AI agent builders** who want patterns that actually work, not toy demos
- **OpenClaw users** looking to level up their agent orchestration
- **Indie hackers** building autonomous systems that compound over time
- **Engineering teams** adopting AI agents for development workflows

---

## Table of Contents

### Part I: Foundation
*The core primitives every agent system needs*

1. **The Agent Loop** — The canonical loop underlying all AI agents
2. **Context Management** — Strategies for the growing context window problem
3. **Three-Tier Memory with Decay** — Knowledge graph + daily notes + tacit knowledge
4. **Skills vs Rules** — When to use always-on rules vs on-demand procedures
5. **Harness Engineering** — Systematically improving agent effectiveness over time
6. **CLI Over MCP** — Why CLIs beat custom protocols for agent tooling

### Part II: Orchestration
*Patterns for coordinating multiple agents*

7. **Parallel Agent Teams** — Git-based coordination for 16+ parallel agents
8. **Wave Execution Swarms** — Dependency-aware parallel waves with verification
9. **Tiered Agent Orchestration** — Multi-level hierarchies mixing reasoning + coding agents
10. **Parallel Worktree Operations** — Isolated git worktrees for conflict-free parallel coding
11. **ChatDev 2.0 YAML Workflows** — DAG-based agent pipelines with fan-out/fan-in

### Part III: Reliability
*Patterns that keep agents from going off the rails*

12. **Self-Healing Agents** — Auto-detect, diagnose, and fix failures without humans
13. **Safe Looping** — Bounded iteration patterns that don't blow through budget
14. **Pre-PR Quality Stack** — Four-step quality gate before any code ships
15. **Hooks as Middleware** — Intercept agent actions for validation, logging, and guardrails
16. **Phased Execution** — Break complex tasks into gated phases with artifacts
17. **Spec-Driven Development** — From constitution to executable task DAGs

### Part IV: Operations
*Running an autonomous agent business*

18. **Cron-as-Code** — Version-controlled, testable cron definitions
19. **Nightly Self-Improvement** — The compounding loop that makes agents better every day
20. **Discord Autonomous Agent Runbook** — Step-by-step: spin up a Discord-driven AI CEO
21. **The Autonomous Agent Business** — End-to-end architecture for an AI that runs a business

---

## How to Use This Playbook

**If you're just starting:** Read patterns 1-3 (Foundation) and pattern 13 (Safe Looping). Get a single agent working reliably before adding complexity.

**If you have one agent working:** Read Part II (Orchestration) to coordinate multiple agents. Pattern 8 (Wave Execution) is the sweet spot for most teams.

**If you're building for production:** Read Part III (Reliability) cover to cover. Pattern 12 (Self-Healing) and Pattern 14 (Pre-PR Quality Stack) will save you from shipping broken code.

**If you want full autonomy:** Read Part IV (Operations). Pattern 21 (Autonomous Agent Business) is the full architecture, and Pattern 19 (Nightly Self-Improvement) is the secret weapon that makes everything compound.

---

## About Roam

Roam is an autonomous AI agent built on OpenClaw, running as a separate business entity with its own Discord command center, nightly self-improvement crons, revenue tracking, and product development pipeline. These patterns aren't just documented — they're executed every day.

Built by [Oddly Useful](https://oddlyuseful.io).
