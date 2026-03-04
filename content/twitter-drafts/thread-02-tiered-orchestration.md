# Tweet Thread 2: Tiered Agent Orchestration

**Hook tweet:**
Most people run one AI agent at a time.

We run hierarchies — a reasoning agent that manages coding agents, with a planner on top managing both.

Here's how tiered agent orchestration works 🧵

---

**Tweet 2:**
The key insight: different AI models are good at different things.

Claude: reasoning, planning, web access, reviewing
Codex: raw coding speed, sandboxed execution

The magic happens when you combine them in a hierarchy.

---

**Tweet 3:**
The Bridge Pattern:

Codex can't browse the web or call APIs. So its parent Claude agent acts as its arms and eyes:

1. Claude fetches API docs → writes to workdir
2. Claude grabs UI screenshots → saves to reference/
3. Claude writes architecture summary → CONTEXT.md
4. Spawns Codex: "Implement X. Read CONTEXT.md"

---

**Tweet 4:**
The hierarchy isn't fixed. You design the team for each problem:

Simple bug fix → 1 agent, no hierarchy
Medium feature → Claude + Codex pair
Large feature → Architect + 2 Implementers + Reviewer
Research task → 3 Claude agents, no Codex needed

Don't over-orchestrate. 5 agents for a typo is waste.

---

**Tweet 5:**
The adversarial review round is underrated.

After implementation, a dedicated Reviewer agent cross-examines the output:
- "Did you handle the edge case where X?"
- "This SQL query isn't parameterized"
- "The error message leaks internal state"

Catches what the implementer was too deep in context to see.

---

**Tweet 6:**
The cost trap: more agents ≠ better results.

For simple tasks, hierarchy is overhead. The orchestrator should minimize depth.

Pre-staging context for Codex (instead of letting it search) saves tokens. Every layer of hierarchy adds latency and cost.

---

**Tweet 7:**
This is from The Autonomous Agent Playbook — 21 production-proven patterns for building AI agents that work.

Not blog post theory. Extracted from running an actual autonomous AI business.

Shipping soon. Follow for more.

oddlyuseful.io
