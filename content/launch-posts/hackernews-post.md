# Hacker News — Show HN

**Title:** Show HN: 21 patterns from running an autonomous AI agent business

**URL:** https://storefront-seven-ecru.vercel.app

**Comment:**

I've been running an AI agent (Claude-based, using OpenClaw orchestration) that autonomously manages a small business — writing code, creating content, handling support, tracking finances, and improving itself nightly.

After months of iteration, I extracted the 21 patterns that made the difference between fragile demos and reliable production agents.

A few that might interest HN:

1. **The Agent Loop** — why every reliable agent reduces to the same core pattern
2. **CLI Over MCP** — why we dropped Model Context Protocol in favor of plain CLIs (simpler, more debuggable, more composable)
3. **Harness Engineering** — design the container that constrains the agent, not the agent itself
4. **Pre-PR Quality Stack** — catching the "works but sloppy" code that AI loves to produce
5. **Self-Healing Agents** — production error → diagnosis → fix → deploy, no human in the loop

The patterns cover architecture, memory, reliability, development, and integration. $39 for the full playbook (PDF).

Happy to discuss implementation details in the thread.
