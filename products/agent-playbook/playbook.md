# The Autonomous Agent Playbook

### Battle-tested patterns from an AI agent that actually runs a business

---

## Introduction

These are the actual patterns powering Roam, an AI that runs its own business.

Not a research paper. Not a framework pitch. Not "here's what we think might work." These are the 21 orchestration patterns running in production right now — managing products, writing code, handling support, tracking revenue, and improving itself every night at 2am.

Roam is an autonomous AI agent built on OpenClaw. It has its own Discord command center, its own git repos, its own nightly self-improvement crons, and its own P&L. It spawns sub-agents for parallel work, coordinates them via git, heals its own failures, and ships real products.

Every pattern in this playbook was extracted from that system. Some we designed upfront. Most we discovered the hard way — by watching agents fail, diagnosing why, and encoding the fix so it never happened again.

**How to read this playbook:**

Each pattern follows the same structure:
- **Summary** — One line: what it does
- **When to use** — The specific situation where this pattern shines
- **The pattern** — Full explanation with architecture diagrams and code
- **Practical example** — How we actually use it

The patterns are organized in four sections that build on each other:
1. **Foundation** — Core primitives every agent needs
2. **Orchestration** — Coordinating multiple agents
3. **Reliability** — Keeping agents from going off the rails
4. **Operations** — Running an autonomous agent business

Start with Foundation. Skip to whatever section matches your current challenge. Every pattern stands alone, but they're designed to compose.

Let's build something that works.

---

# Part I: Foundation

*The core primitives every agent system needs. Get these right and everything else follows. Get them wrong and no amount of orchestration complexity will save you.*

---

## Pattern 1: The Agent Loop

**The canonical loop underlying all AI agents — understand this and you understand everything.**

### When to Use
Always. This is the mental model for every AI agent, whether it's a single-turn chatbot or a 16-agent parallel swarm. If you're building agents, you need to internalize this loop.

### The Pattern

Every AI agent, at its core, runs the same loop:

```
┌─────────────────────────────────────────────┐
│  User Input                                 │
│  ↓                                          │
│  Build Prompt (instructions + tools + ctx)  │
│  ↓                                          │
│  Model Inference                            │
│  ↓                                          │
│  ┌─ Tool call requested?                    │
│  │  YES → Execute tool → Append result ─┐   │
│  │                                      │   │
│  │  ←──────────── Loop back ────────────┘   │
│  │                                          │
│  │  NO → Assistant message                  │
│  │       (turn complete, return to user)    │
│  └──────────────────────────────────────    │
└─────────────────────────────────────────────┘
```

A single turn can include many tool calls before producing a final response. The loop continues until the model decides it has enough information.

**Prompt construction follows a layered priority:**

| Role | Content | Priority |
|------|---------|----------|
| `system` | Model behavior rules | Highest |
| `developer` | Sandbox rules, config | High |
| `user` | Instructions, context, message | Medium |
| `assistant` | Model's prior responses | Lowest |

Instructions aggregate from multiple sources, most specific last:

```
Global defaults (toolkit/platform)
  → Project-level (AGENTS.md in repo root)
    → Directory-level (AGENTS.md in cwd)
      → Task-specific (per-delegation instructions)
```

Most specific instructions win on conflicts. This enables shared defaults with project-specific overrides.

**Tool execution uses trust levels:**

| Trust Level | Examples | Guardrails |
|-------------|----------|------------|
| Sandboxed | Shell commands, file writes | Agent enforces restrictions |
| Self-guarded | MCP servers, external APIs | Tool enforces own limits |
| Trusted | Read-only operations, search | Minimal restrictions |

**In multi-agent systems, the loop operates at two levels:**

- **Level 1:** Each specialist agent (researcher, coder, critic) runs its own loop
- **Level 2:** The orchestrator runs a higher-order loop — decomposing goals into tasks, delegating to specialists, integrating results

```
User Goal
  → Orchestrator decomposes
    → Researcher loop (search → synthesize → report)
    → Coder loop (plan → implement → test)
    → Critic loop (review → issue → suggest)
  → Orchestrator integrates
  → Final output
```

This nested structure is what makes multi-agent more powerful than single-agent for complex tasks.

### Practical Example

Roam uses two-level loops constantly. When building a product feature, the main session acts as orchestrator — it decomposes the work, spawns specialist sub-agents for research, coding, and review, then integrates their outputs. Each sub-agent runs its own tool-calling loop until its task is complete. The orchestrator never touches a file directly; it delegates everything.

---

## Pattern 2: Context Management

**How to manage the growing context window — the difference between agents that work reliably and ones that fall apart on complex tasks.**

### When to Use
Every agent system hits context limits eventually. Use these strategies from day one to avoid painful debugging later.

### The Pattern

Every agent turn adds to the conversation — user messages, tool calls, results, responses. Context grows without bound. Models have finite context windows. Something has to give.

**Strategy 1: Append-Only (Default Choice)**

Never rearrange history. Every new prompt = old prompt + new content appended at the end.

```
Turn 1: [system][tools][instructions][msg1]
Turn 2: [system][tools][instructions][msg1][tools1][result1][asst1][msg2]
Turn 3: ...+[tools2][result2][asst2][msg3]
```

Why: Prompt caching works via exact prefix matching. The model only processes new tokens; cached prefix is reused. This turns quadratic inference into linear. **This is your default.**

**Strategy 2: Summarize-and-Compact (Long Sessions)**

When context approaches the limit, summarize older turns:

```
Before: [system][tools][instructions][turn1..turn50][new_msg]
After:  [system][tools][instructions][summary_of_1-45][turn46..50][new_msg]
```

Lossy, but enables longer conversations. Breaks prompt caching (prefix changes).

**Strategy 3: Hierarchical Context (Multi-Agent)**

Each agent level manages its own context:

```
Orchestrator: [goal][task_list][specialist_summaries][current_step]
Specialist:   [delegation][task_tools][task_history][current_work]
```

Each agent gets focused, relevant context. Avoids polluting specialist context with orchestrator details.

**Context Budget Planning for 200K Window:**

| Component | Budget | Notes |
|-----------|--------|-------|
| System prompt | ~2K | Fixed overhead |
| Tools/functions | ~3K | Grows with tool count |
| Instructions | ~5K | AGENTS.md, configs |
| Conversation history | ~150K | The growing part |
| Output reserve | ~30K | Space for response |
| Safety margin | ~10K | Buffer |

**Warning signs:** >50% used = monitor. >75% = consider compaction. >90% = compact now.

**Delegation context protocol — what to pass when delegating to a specialist:**

Always include: clear task, constraints, expected output format, available tools.
Never include: other specialists' conversation history, orchestrator's internal reasoning, unrelated prior tasks.

### Practical Example

Roam uses hierarchical context for all multi-agent work. When spawning a content agent to draft tweets, it passes only: the task description, relevant product context, and brand voice guidelines. It never passes the full session history. This keeps the sub-agent focused and prevents the "confused by irrelevant context" failure mode we hit repeatedly in our first week.

---

## Pattern 3: Three-Tier Memory with Decay

**Knowledge graph + daily notes + tacit knowledge, with automatic decay so old info doesn't crowd out what matters.**

### When to Use
When a single MEMORY.md file stops scaling. When your agent keeps losing important context across sessions. When old information crowds out recent, relevant knowledge.

### The Pattern

Three specialized memory layers with automatic decay and promotion:

**Layer 1: Knowledge Graph**
Entity-based facts organized by PARA (Projects, Areas, Resources, Archives). Each entity has metadata including a decay weight:

```json
{
  "id": "uuid",
  "type": "project",
  "title": "Descriptive name",
  "content": "The actual knowledge",
  "tags": ["relevant", "tags"],
  "created": "ISO-8601",
  "lastAccessed": "ISO-8601",
  "accessCount": 0,
  "decayWeight": 1.0,
  "connections": ["related-entity-ids"]
}
```

**Decay formula:** `weight = base_weight * (0.95 ^ days_since_last_access)`

Auto-archive when weight < 0.1. Accessing an entity resets its weight — so important-but-infrequent knowledge survives when you actually use it.

**Layer 2: Daily Notes**
Chronological capture in `YYYY-MM-DD.md` files. Write daily → extract facts nightly → summarize + archive at 30 days.

**Layer 3: Tacit Knowledge**
Patterns about HOW things work — not what happened. Customer behavior, operational insights, preferences. Updated on pattern recognition, not schedule. This is the hardest to capture and most valuable.

**Maintenance crons:**

Nightly (2am):
1. Recalculate all decay weights
2. Extract facts from today's daily notes → knowledge graph
3. Check for new tacit patterns from session review
4. Archive decayed entities
5. Generate modification changelog

Weekly:
1. Summarize daily notes older than 30 days
2. Audit tacit knowledge for accuracy
3. Deduplicate knowledge graph

**Key insight:** The decay mechanism is crucial. Without it, memory becomes a hoarder's attic — everything saved, nothing findable. Decay ensures frequently-accessed knowledge stays prominent while stale info fades naturally.

### Practical Example

Roam's `memory/` directory has three subdirectories: `knowledge-graph/`, `daily/`, and `tacit/`. Every night at 2am, the self-improvement cron recalculates decay weights and promotes facts from daily notes. After two weeks, we noticed customer support patterns were being lost in daily notes — so we added a tacit knowledge file `memory/tacit/support-patterns.md` that captures recurring issues. It's accessed every time we handle support, so its weight stays high permanently.

---

## Pattern 4: Skills vs Rules

**When to use always-on rules vs on-demand procedures — and why getting this wrong bloats every single agent turn.**

### When to Use
When your AGENTS.md / CLAUDE.md is getting long. When you notice the agent being slow because of context overhead. When you repeat multi-step instructions.

### The Pattern

**Rules** = context always included in the system prompt. Loaded at session start, applies to every turn.
**Skills** = domain-specific procedures agents discover and invoke when relevant. Loaded dynamically.

> "Rules = what you always want. Skills = what you sometimes need."

**Use rules for:**
- Coding style & conventions
- Project-specific context (tech stack, architecture)
- Security policies ("never commit secrets")
- Communication preferences

**Use skills for:**
- Multi-step workflows (deployment, testing procedures)
- Domain expertise (auth patterns, payment integration)
- Tool-specific procedures (git worktrees, CI/CD)
- Conditional workflows (build failure debugging)

**File organization:**
```
project/
├── CLAUDE.md              # Rules (always loaded)
├── skills/
│   ├── deploy.md          # Skill: deployment workflow
│   ├── testing.md         # Skill: test patterns
│   └── domain/
│       ├── auth.md        # Domain skill
│       └── payments.md    # Domain skill
```

**The litmus test:** If your rules file is >500 lines, you're putting procedures in rules. Split them into skills.

### Practical Example

Roam's AGENTS.md is 60 lines — just identity, session protocol (Orient → Work → Persist), and critical regressions. Everything else is in skill files. The nightly improvement protocol? That's `scripts/nightly-improve.md`. Discord channel operations? That's in TOOLS.md, loaded only when posting to Discord. This keeps every session fast because the system prompt stays small.

---

## Pattern 5: Harness Engineering

**Systematically improving your agent's effectiveness — every mistake becomes a permanent fix.**

### When to Use
Always. This is the meta-pattern that makes all other patterns improve over time. Start from day one.

### The Pattern

The core principle: **Every agent mistake → new test or AGENTS.md fix.**

```
Agent makes mistake
        ↓
┌───────────────────────┐
│  Diagnose root cause  │
│  - Unclear prompt?    │
│  - Missing context?   │
│  - Wrong tool access? │
│  - Missing test?      │
└───────────┬───────────┘
            ↓
┌───────────────────────┐
│  Fix the harness      │
│  - Update CLAUDE.md   │
│  - Add test case      │
│  - Improve skill      │
│  - Restrict tool      │
└───────────┬───────────┘
            ↓
Agent less likely to repeat mistake
```

**The six-step progression** (from Mitchell Hashimoto's AI adoption journey):

1. **Drop the chatbot mindset** — Use agents that take action, not Q&A
2. **Reproduce your own work** — Do tasks manually AND with the agent. Compare. Learn the edges.
3. **End-of-day agents** — Kick off long-running tasks before signing off
4. **Outsource slam dunks** — Identify high-confidence tasks, let the agent handle them autonomously
5. **Engineer the harness** — Every mistake becomes an improvement to rules, tests, or skills
6. **Always have an agent running** — Target 10-20% of workday with an agent actively working

**"See Like an Agent" — tool design principle from the Claude Code team:**

Shape tools to model abilities, not human preferences. Key lessons:

- When a tool doesn't work, try redesigning it before blaming the model
- As models improve, revisit tool assumptions — tools that constrained weaker models may limit stronger ones
- Let agents build their own context (via search/grep) rather than pre-computing it
- Every line in your system prompt should answer: "Would the agent make a mistake if this wasn't here?" If no, cut it.

### Practical Example

In Roam's first week, the agent kept using `rm` instead of `trash` for file deletion. Rather than hoping it would remember, we added to AGENTS.md: "`trash` > `rm`". That's harness engineering — a 15-character fix that prevents a class of irreversible mistakes forever. We now have a "Regressions" section in AGENTS.md that grows every time we catch a failure pattern.

---

## Pattern 6: CLI Over MCP

**Why existing command-line tools beat custom protocols for agent tooling.**

### When to Use
Whenever you're deciding how to give an agent access to a service. If a CLI exists, use it. Don't build an MCP server.

### The Pattern

LLMs have trained on millions of man pages, Stack Overflow answers, and shell scripts. They already know how to use CLIs. They don't need a special protocol.

**Why CLIs win:**

1. **Composability** — Pipe through `jq`, chain with `grep`, redirect to files
2. **Debuggability** — When Claude runs `gh pr view 123`, you can run the same command and see exactly what it saw
3. **Auth already works** — `aws` uses profiles, `gh` uses `gh auth login`, `kubectl` uses kubeconfig
4. **No moving parts** — Binaries on disk. No background processes, no initialization dance
5. **Permission granularity** — Allowlist `gh pr view` but require approval for `gh pr merge`

**Decision framework:**
```
Does a CLI exist for this service?
├── Yes → Use the CLI
└── No
    ├── Can you use curl + REST API? → Use curl
    └── Neither exists → MCP is appropriate
```

**When MCP makes sense:** The service is inherently stateful/streaming, genuinely has no CLI, or you need real-time push notifications.

### Practical Example

Roam uses `gh` for GitHub operations, `gt` for Graphite branch management, and `curl` + `jq` for API calls. We never built MCP servers for any of these. When we need to check PR status, the agent runs `gh pr view --json state` — same command a human developer would run. Debugging is trivial because we can reproduce any agent action in our own terminal.

---

# Part II: Orchestration

*Patterns for coordinating multiple agents. This is where things get powerful — and where they can go spectacularly wrong if you don't have the right coordination primitives.*

---

## Pattern 7: Parallel Agent Teams

**Git-based coordination for 16+ parallel agents — no orchestrator needed.**

### When to Use
When you have many independent tasks (e.g., fixing different test failures) and want maximum parallelism. When tasks are well-defined enough that agents can work independently.

### The Pattern

From Anthropic's C compiler project: 16 parallel Claude agents built a 100K-line compiler. The key insight: **Git IS the coordination layer.**

**The loop harness** keeps agents running continuously:

```bash
#!/bin/bash
while true; do
  COMMIT=$(git rev-parse --short=6 HEAD)
  LOGFILE="agent_logs/agent_${COMMIT}.log"
  claude --dangerously-skip-permissions \
    -p "$(cat AGENT_PROMPT.md)" \
    --model claude-opus-4-X &> "$LOGFILE"
done
```

**Git-based task locking (no orchestrator needed):**

```
current_tasks/
├── parse_if_statement.txt      # Agent A's lock
├── codegen_function_def.txt    # Agent B's lock
└── fix_arm_backend.txt         # Agent C's lock
```

Protocol: Agent writes a file to claim a task → git conflict resolution prevents duplicates → agent works, merges, pushes, removes lock → loop spawns fresh session.

**Design for agents, not humans:**

- Print summary stats, not thousands of lines (context pollution)
- Make output grep-able: `ERROR parse_int: expected 42, got 0`
- Add `--fast` flags for random subsample testing (agents can't tell time)
- Maintain PROGRESS.md and lessons.md for fresh-context agents

**Specialized agent roles:**

| Role | Responsibility |
|------|----------------|
| Feature agents | Implement functionality, fix tests |
| Code quality agent | Refactor, deduplicate |
| Performance agent | Optimize speed |
| Design critic | Architecture review |
| Documentation agent | Keep docs current |

**The Adversarial Review Round** (critical for avoiding groupthink):

When parallel agents produce outputs, don't just merge them. Add a cross-examination phase:

```
Phase 1: Independent Analysis (4-6 specialists, blind to each other)
Phase 2: Cross-Examination (2-3 reviewers, each MUST find problems)
Phase 3: Judgment (synthesizer rules: retain | needs evidence | overturn)
```

The key: hardcode the reviewer output contract. Don't say "review this." Say "you MUST find 3 opposing arguments, 2 overestimated factors, 1 underestimated factor, and contradictions between reports." Forcing "you MUST find problems" makes reviewers actually dig.

**Scale reference:** 16 agents, ~2000 sessions, 2B input tokens, 140M output tokens, ~$20K, 100K lines of Rust output in ~2 weeks.

### Practical Example

Roam uses this pattern for parallel content creation. When preparing a launch, we spawn 3-4 agents: one for sales copy, one for technical docs, one for social media drafts, one for email sequences. They all work in the same repo but different directories. A reviewer agent then cross-examines all outputs for consistency before anything ships. The adversarial round has caught embarrassing contradictions between our sales copy and technical docs twice already.

---

## Pattern 8: Wave Execution Swarms

**Dependency-aware parallel execution in waves, with orchestrator verification between each wave.**

### When to Use
When building features with clear task dependencies. When you want the parallelism of teams but with verification between phases. When you need to minimize wasted tokens on discovery.

### The Pattern

The core insight: an orchestrator that plans the work should also coordinate execution. It already has the complete picture.

**Phase 1: Planning** — The orchestrator researches the codebase, generates tasks with explicit dependencies:

```
T1: [depends_on: []] Create database schema
T2: [depends_on: []] Install packages
T3: [depends_on: [T1]] Create repository layer
T4: [depends_on: [T1]] Create service interfaces
T5: [depends_on: [T3, T4]] Implement business logic
T6: [depends_on: [T2, T5]] Add API endpoints
```

**Wave computation (topological sort):**
```
Wave 1: T1, T2          (no dependencies — parallel)
Wave 2: T3, T4          (after T1 — parallel)
Wave 3: T5              (after T3, T4)
Wave 4: T6              (after T2, T5)
```

**Phase 2: Wave Execution** — For each wave:

1. Launch subagents in parallel with **targeted context**: exact file paths, what adjacent tasks are doing, current project state
2. Subagents complete, commit (never push), update plan
3. **Orchestrator verifies** the wave before proceeding
4. Next wave begins

**The plan is a living document.** Each task has mutable fields:

```markdown
### T1: Create User Model
- **depends_on**: []
- **location**: src/models/user.ts
- **status**: Completed ✅
- **log**: Created User model with email, name, passwordHash fields
- **files edited/created**: src/models/user.ts, src/models/index.ts
```

**Key rules:**
- Commit but never push while other agents work in parallel
- Give each agent exact file paths (dramatically reduces discovery tokens)
- Orchestrator verifies between waves — catches issues before they compound

### Practical Example

Roam uses waves for any multi-file feature work. When building the product landing page, the orchestrator planned 8 tasks across 4 waves: Wave 1 scaffolded the project and installed deps (parallel). Wave 2 built the component library and content (parallel). Wave 3 assembled pages (sequential, needed components). Wave 4 added deployment config. The inter-wave verification caught a CSS import issue in Wave 2 that would have broken everything in Wave 3.

---

## Pattern 9: Tiered Agent Orchestration

**Multi-level hierarchies combining reasoning agents with specialized coding agents for maximum capability coverage.**

### When to Use
When tasks need both strategic thinking (research, architecture) and raw implementation throughput. When different parts of a problem need different model strengths.

### The Pattern

```
Orchestrator (main session)
    │
    ├── Claude Sub-Agent (full tool access)
    │   ├── browser, web_search, exec, files
    │   ├── can spawn and monitor Codex agents
    │   └── acts as "senior dev" reviewing Codex output
    │
    └── Codex Agent (sandboxed coding)
        ├── read/write files, run commands
        ├── NO browser, web search, API calls
        └── excels at raw implementation from clear specs
```

**The Bridge Pattern:** Claude as Codex's arms and eyes. Codex can't browse the web or call APIs. Its parent Claude agent handles this by pre-staging context:

1. `web_fetch` API docs → write to workdir
2. Browser snapshot of target UI → save screenshot
3. Read existing codebase → write architecture summary
4. Spawn Codex: "Implement X. Read CONTEXT.md for reference."
5. Monitor output, fetch more context if needed
6. Review, test, approve or iterate

**The hierarchy is NOT fixed.** The orchestrator designs the optimal team for each problem:

- **Feature implementation:** Architect + Frontend Implementer (with Codex) + Backend Implementer (with Codex) + Reviewer
- **Research & analysis:** Researcher A + Researcher B + Analyst + Skeptic
- **Bug investigation:** Investigator → Codex fix → Verifier
- **Simple enough for one agent?** Just do it. No hierarchy needed.

**Rule of thumb:** Don't over-orchestrate. If you can do it in one session, do it in one session. The hierarchy exists for problems that genuinely benefit from parallelism and specialization.

### Practical Example

Roam uses tiered orchestration for development work. When implementing a new API endpoint, the orchestrator spawns a Claude sub-agent that researches the existing codebase structure, writes a CONTEXT.md with architecture notes and API conventions, then launches a Codex agent to do the actual implementation. The Claude agent reviews the output, runs tests, and iterates if needed. This separation means the Codex agent never wastes tokens on exploration — it gets exactly the context it needs upfront.

---

## Pattern 10: Parallel Worktree Operations

**Isolated git worktrees for conflict-free parallel coding agents.**

### When to Use
When multiple coding agents need to work on the same repo simultaneously. When you've been burned by merge conflicts from parallel agents editing the same branch.

### The Pattern

Each parallel agent gets its own **git worktree** — a separate checkout with its own working directory, branch, and index.

```
main repo: ~/project/                     (orchestrator reads, doesn't write)
    │
    ├── .trees/auth/                       (Agent A — branch: feat/auth)
    ├── .trees/api/                        (Agent B — branch: feat/api)
    └── .trees/ui/                         (Agent C — branch: feat/ui)
```

**Lifecycle:**

1. **Create** — Orchestrator creates worktrees before spawning agents:
```bash
mkdir -p .trees
git worktree add -b feat/auth .trees/auth
git worktree add -b feat/api .trees/api
```

2. **Work** — Each agent operates in isolation. Can read/write, test, commit freely.

3. **Submit** — Agent creates PR from its branch.

4. **Review & Merge** — Reviewer agent cross-examines, then merge via GitHub.

5. **Cleanup** — Remove worktrees after merge, run `git worktree prune`.

**Tasklist coordination prevents file conflicts:**

```markdown
## Agent A: feat/auth (worktree: .trees/auth)
- [ ] Implement login flow in src/auth/
- [ ] Add JWT middleware in src/middleware/
DO NOT TOUCH: src/api/, src/ui/

## Agent B: feat/api (worktree: .trees/api)
- [ ] Implement REST endpoints in src/api/
DO NOT TOUCH: src/auth/, src/ui/
```

**Handling shared dependencies:** Pre-create shared types before spawning agents, or assign ONE agent as "foundation" that runs first. Never let two agents edit the same file.

### Practical Example

Roam uses worktrees whenever we need parallel coding. The `.trees/` convention keeps everything discoverable and project-scoped. We symlink `.env` files and `node_modules` into each worktree to avoid redundant installs. After PRs merge, our cleanup skill runs `gt sync` then prunes orphaned worktrees automatically. The explicit "DO NOT TOUCH" boundaries in our task files have eliminated merge conflicts entirely.

---

## Pattern 11: ChatDev 2.0 YAML Workflows

**DAG-based agent pipelines with fan-out/fan-in, conditional routing, and loop control.**

### When to Use
When you need complex multi-agent workflows with dynamic routing. When you want reusable workflow templates. When simple parallel teams aren't enough and you need loops, conditions, and hierarchical aggregation.

### The Pattern

Define agent workflows as YAML DAGs:

```yaml
graph:
  start: [Planner]
  end: [FinalReport]
  nodes:
    - id: Planner
      type: agent
      config:
        role: "Plan the research approach..."
    - id: Researcher
      type: agent
      config:
        role: "Research the assigned topic..."
    - id: FinalReport
      type: agent
      config:
        role: "Synthesize all findings..."
  edges:
    - from: Planner
      to: Researcher
      dynamic:
        type: map          # Fan-out: one instance per query
        split:
          type: regex
          config:
            pattern: "<Query>:\\s*(.*)"
    - from: Researcher
      to: FinalReport      # Fan-in: aggregate all results
```

**Key node types:**
- **Agent** — LLM call with role, tools, context window config
- **Literal** — Static content injection
- **Passthrough** — Aggregation/routing point
- **Subgraph** — Nested workflow (inline or from file)
- **Loop Counter** — Fixed iteration control

**Conditional routing uses keywords in model output:**

```yaml
condition:
  type: keyword
  config:
    any: ["ROUTE: Planner", "NEEDS_REVISION"]
```

**Powerful patterns available:**
- **Deep Research:** Planner → parallel query fan-out → Writer → Quality Reviewer → loop back or finish
- **ReAct Agent:** Task normalizer → Thought/Action/Observation loop → QA editor
- **Scatter-Gather:** Multiple start nodes → parallel processing → hierarchical tree aggregation

**Context management per node:** `context_window: 0` for stateless (cheapest), `N` for rolling window, `-1` for full history (expensive).

### Practical Example

Roam uses a simplified version of this pattern for content research. When analyzing competitors, we define a workflow: Planner generates search queries → fan-out to 3 parallel researcher nodes → passthrough aggregates → synthesizer produces report → critic reviews (loops back if quality score < 7). The YAML definition is reusable — we swap out the Planner's prompt for different research topics and the same pipeline runs.

---

# Part III: Reliability

*Patterns that keep agents from going off the rails. If Part II is about making agents powerful, Part III is about making them trustworthy. Ship these before you ship anything else.*

---

## Pattern 12: Self-Healing Agents

**Auto-detect, diagnose, and fix failures in automated pipelines without human intervention.**

### When to Use
Any project with scheduled or automated scripts. Agent-generated code that needs verification. Any system where "it broke 3 days ago and nobody noticed" is unacceptable.

### The Pattern

Create a verification loop around every agent task and every scheduled job:

**1. Post-Agent Verification Hooks**

```
Agent completes → Run tests → Pass? → Report success
                              Fail? → Write feedback → Agent retries
```

The human should never be the first person to discover a bug. Tests catch it, the agent fixes it, then it reports success.

**2. Smoke Test Framework**

Periodic health checks for all scripts:

```
Cron (daily) → smoke_runner.sh → Run all test_*.py + smoke_*.sh
                                → Structured JSON results
                                → Alert on failures
```

Smoke tests ≠ unit tests. Smoke tests: "Does it run? Can it import? Does --dry-run work?" Unit tests: "Is the logic correct?" Both needed.

**3. Auto-Correction Loop**

```
Test fails → Capture output → Spawn fix agent with:
               - Failed test output
               - Source files
               - "Fix this test failure"
             → Re-run tests
             → Pass? Done.
             → Fail after 3 attempts? → Alert human
```

**Guard rails:**
- Max 3 retry attempts (prevent infinite loops)
- Each attempt gets cumulative context (what was tried before)
- Time-boxed: 10 min per attempt max
- Only fixes test failures, **never modifies tests themselves**

**4. Regression Gates**

Tests must pass before any agent can report "done":

```
Agent work → Pre-commit tests → Pass? → Commit + report
                                 Fail? → Auto-correct loop
                                         Still fail? → Report failure (NOT success)
```

### Practical Example

Roam's self-healing saved us in week two. A nightly cron script broke due to a dependency update. The smoke test caught it at 6am. The auto-correction loop spawned a Codex agent that diagnosed the issue (API response format changed), fixed the parser, re-ran the smoke test (passed), committed the fix, and posted to Discord — all before anyone woke up. Total downtime: 0. Human intervention: 0.

---

## Pattern 13: Safe Looping

**Bounded iteration patterns that don't blow through budget.**

### When to Use
Whenever an agent needs to work autonomously for more than one turn. This is the pattern that prevents $20K surprise bills.

### The Pattern

Five patterns, from most to least constrained:

**1. Bounded Iterations (Cheapest)**

```
Make up to 5 attempts to fix the issue.
After 5 attempts OR success, stop and report.
```

Cost: predictable, capped. Use for single well-defined problems.

**2. Checkpoint Pattern (For Large Work)**

```markdown
After every significant change:
1. Commit with descriptive message
2. Update PROGRESS.md

After ~10 commits OR a major milestone:
1. Push, stop, summarize for review
2. Wait for approval to continue

If stuck for >3 attempts:
1. Document blocker in PROGRESS.md
2. Move to different task or ask for help
```

Why 10 commits: balances autonomy with oversight. Enough for real progress, not so much that drift compounds.

**3. Time-Boxed Sessions**

```javascript
sessions_spawn({
  task: "Review and fix TODO comments",
  runTimeoutSeconds: 900,  // 15 min max
  label: "todo-cleanup"
})
```

**4. Cron-Based Incremental**

```
Every hour: check PROGRESS.md, complete next TODO, update, stop.
```

Predictable per-session cost. Accumulates over time.

**5. Budget-Aware Prompting**

```
You have ~50K tokens for this task.
Prioritize high-impact changes first.
If stuck after 3 attempts, document and move on.
```

**Comparison:**

| Pattern | Autonomy | Cost Control | Best For |
|---------|----------|--------------|----------|
| Bounded iterations | Low | Tight | Bug fixes |
| Checkpoint | Medium-High | Moderate | Features, refactors |
| Time-boxed | Medium | Tight | Exploration |
| Cron incremental | High | Predictable | Long-running projects |
| Budget-aware | High | Soft | Flexible work |

### Practical Example

Roam uses the checkpoint pattern for all feature work and time-boxed sessions for maintenance. Our standard delegation includes: "Commit after each significant change. Update PROGRESS.md. After 10 commits, push and stop." For nightly improvement, we use a 30-minute time box — the cron has a hard timeout to prevent runaway sessions. The combination of these two patterns means we've never had a surprise cost spike.

---

## Pattern 14: Pre-PR Quality Stack

**Four-step quality gate before any code ships — catches the "works but sloppy" problem common in AI-generated code.**

### When to Use
Before creating any pull request with AI-generated code. This is the difference between "it passes tests" and "it's actually good."

### The Pattern

Run these in order:

```
1. /code-review  → Self-review for bugs, edge cases, security
2. /simplify     → Can this be done with less code?
3. /deslop       → Remove AI-smell: unnecessary comments, dead code
4. /commit-pr    → Create the PR
```

**Why this order:**
1. Find bugs before worrying about style
2. Fewer lines = fewer bugs, easier review
3. Clean up cosmetics after logic is solid
4. PR is reviewer-ready

**AI-smell indicators (for the deslop step):**
- Comments that restate the code
- Unused imports or variables
- Overly defensive null checks that can't happen
- Generic variable names (data, result, temp)
- Console.log left in
- TODOs that were already done
- Commented-out code blocks

**For high-stakes work, extend with adversarial verification (VSDD):**

```
Phase 1: Spec crystallization → Gate: adversary can't find holes
Phase 2: Test-first implementation → Gate: all tests green
Phase 3: Fresh-context adversarial review → Gate: reviewer forced to hallucinate flaws
Phase 4: Feedback integration loop
Phase 5: Create PR only after convergence
```

**Key insight:** Convergence signal = when the reviewer is forced to invent problems that don't exist. That's your concrete, testable exit condition — much better than "looks good to me."

### Practical Example

Every PR Roam creates goes through the quality stack. The /deslop step alone has removed an average of 15% of generated code — all unnecessary comments and over-engineering. The adversarial review step has caught two security issues (exposed API keys in error messages) that the basic code review missed. We estimate this adds 3-5 minutes per PR but saves 20+ minutes of human review.

---

## Pattern 15: Hooks as Middleware

**Intercept agent actions before or after execution — validation, logging, auto-formatting, and guardrails.**

### When to Use
When you need consistent behavior across all agent tool calls. When you want logging, guardrails, or auto-formatting without modifying every prompt.

### The Pattern

```
User Request → PreToolUse Hook → Tool Executes → PostToolUse Hook → Response
```

**Use cases with examples:**

**Guardrails (synchronous — blocks dangerous actions):**
```yaml
PreToolUse:
  - matcher: "Bash"
    command: |
      if echo "$TOOL_INPUT" | grep -qE "rm -rf|DROP TABLE"; then
        echo "BLOCKED: Dangerous command"
        exit 1
      fi
```

**Auto-format after edits (async — doesn't block):**
```yaml
PostToolUse:
  - matcher: "Edit|Write"
    command: "pnpm prettier --write $FILE_PATH"
    async: true
```

**Auto-commit checkpoints:**
```yaml
PostToolUse:
  - matcher: "Edit|Write"
    command: |
      cd $PROJECT_ROOT
      git add -A && git commit -m "checkpoint: $TOOL_NAME on $FILE_PATH"
    async: true
```

**Audit trail:**
```yaml
PreToolUse:
  - command: 'echo "{\"ts\": \"$(date)\", \"tool\": \"$TOOL_NAME\"}" >> ~/.agent_audit.jsonl'
    async: true
```

**Available hooks:** PreToolUse, PostToolUse, Stop, Notification, TeammateIdle, TaskCompleted.

**Key rule:** Keep validation hooks synchronous (they need to block). Keep logging/formatting async (they shouldn't slow down the agent).

### Practical Example

Roam uses a PreToolUse hook that blocks any `rm` command (enforcing our `trash > rm` rule from AGENTS.md). We also have an async PostToolUse hook that logs every tool call to a JSONL file — this feeds into our nightly review, helping us understand what the agent actually does all day. The auto-commit hook has been invaluable for recovering from mid-session failures.

---

## Pattern 16: Phased Execution

**Break complex tasks into explicit phases with artifacts — each phase feeds the next.**

### When to Use
Any task that spans multiple files or takes more than 2 hours. Features, refactors, integrations. NOT bug fixes or typo corrections.

### The Pattern

```
RESEARCH → SPEC → PLAN → EXECUTE → VERIFY
```

Each phase produces a concrete artifact:

| Phase | Artifact |
|-------|----------|
| Research | `docs/feature-research.md` |
| Spec | `docs/feature-spec.md` |
| Plan | `docs/feature-plan.md` |
| Execute | Actual code |
| Verify | Test results, QA notes |

**Implementation patterns:**

**Pattern 1: Plan Mode → Execute Mode** — Use Claude Code's built-in plan mode. Accepting a plan clears context, giving execution a clean slate.

**Pattern 2: Phase Gates** — Require human approval between phases. Research → (approval) → Spec → (approval) → Plan → (approval) → Execute → Verify.

**Pattern 3: Subagent Per Phase** — Different agents for different phases:
```
Research agent (read-only, web access) → output: research.md
Planning agent (architect) → input: research.md, output: plan.md
Implementation agent (coder) → input: plan.md, output: code
```

**Spec document template:**
```markdown
# Feature: [Name]
## User Stories
## Acceptance Criteria
## Technical Approach
## Files to Create/Modify
## Edge Cases
## Security Considerations
## Out of Scope
```

### Practical Example

When Roam built the product landing page, we ran all five phases. The research phase discovered that our target audience cares more about "patterns from production" than "comprehensive framework." The spec codified this into acceptance criteria. The plan broke it into 12 tasks across 4 waves. Execution followed the plan exactly. Verification caught a broken mobile layout. Without the research phase, we would have built the wrong messaging.

---

## Pattern 17: Spec-Driven Development

**From project constitution to executable task DAGs — preventing "vibe coding" at scale.**

### When to Use
Greenfield features with unclear scope. Multi-agent implementation where tasks must be unambiguous. Projects with quality or compliance requirements.

### The Pattern

```
Constitution → Spec → Plan → Tasks → Implementation
```

**Phase 1: Constitution** — Project-level governance. Written once, evolves rarely. Every feature must comply.

Defines: core principles (3-7), non-negotiable standards, technology constraints, quality gates, governance rules. Acts as a persistent system prompt for every agent in the project.

**Phase 2: Feature Spec** — Describes WHAT and WHY, never HOW. Key innovation: prioritized user stories with independent testability.

```markdown
### User Story 1 - Photo Albums (Priority: P1) 🎯 MVP
Users can create photo albums grouped by date.
**Independent Test**: Upload 3 photos → verify album created.
**Acceptance Scenarios**:
1. Given photos, When "Create Album", Then grouped by date.
```

Use RFC 2119 language (MUST, SHOULD, MAY). Every requirement must be testable.

**Phase 3: Implementation Plan** — Where tech decisions live. Includes constitution compliance check.

**Phase 4: Task Breakdown** — Directly assignable to agents with parallelism markers:

```markdown
- [ ] T001 [P] [US1] Create User model in src/models/user.ts
- [ ] T002 [P] [US1] Create Album model in src/models/album.ts
- [ ] T003 [US1] Implement AlbumService (depends on T001, T002)
```

`[P]` = parallelizable. `[US1]` = belongs to user story 1. Exact file paths in every task.

Tasks marked `[P]` become fan-out nodes in orchestration DAGs. Sequential tasks become edges. User stories become subgraphs. Checkpoints become gate nodes.

### Practical Example

Roam used SDD for its first product (this playbook). The constitution defined: "Revenue > vanity. Ship > perfect." The spec listed user stories: P1 was the playbook content itself, P2 was sales copy, P3 was launch tweets. The plan mapped each to specific files and agents. Tasks were parallelized — content writing and sales copy happened simultaneously. The constitution compliance check ("does this actually help us make money?") killed two planned features that were interesting but wouldn't sell.

---

# Part IV: Operations

*Running an autonomous agent business. These patterns are what make Roam self-sustaining — the operational machinery that keeps everything running, improving, and generating revenue while humans sleep.*

---

## Pattern 18: Cron-as-Code

**Version-controlled, testable, auditable cron job definitions.**

### When to Use
Any project with scheduled jobs. The moment you have more than one cron job, put them in code.

### The Pattern

Store cron definitions in YAML, in git:

```yaml
# crons.yaml
jobs:
  - name: nightly-improvement
    schedule: "0 2 * * *"
    timezone: America/New_York
    command: "Run self-improvement protocol"
    smoke_test: "Check if improvement log exists for today"
    description: "Review sessions, improve memory/skills"

  - name: daily-smoke-test
    schedule: "0 6 * * *"
    command: bash tests/smoke_test.sh
    description: "Run all smoke tests, alert on failures"
```

**Fields:** name, schedule (5-field cron), command, timezone (optional), smoke_test (optional), description, enabled (boolean).

**Tooling:**
```bash
cron_manifest.py show crons.yaml    # What's declared
cron_manifest.py diff crons.yaml    # Declared vs live
cron_manifest.py sync crons.yaml    # Apply to system
cron_manifest.py smoke crons.yaml   # Run all smoke tests
```

**Benefits:**
1. **Auditable** — git blame shows who changed each job
2. **Reproducible** — new environments get same cron setup
3. **Testable** — each job has a smoke_test command
4. **Diffable** — catch drift between declared and actual

### Practical Example

Roam's `crons.yaml` defines 4 jobs: primary nightly improvement (2am), backup nightly improvement (3am), daily smoke tests (6am), and weekly memory audit (Sunday 4am). Every change goes through git. When we added the weekly audit, the diff in the PR clearly showed what changed. The smoke_test for each job runs `--dry-run` to verify the script works without side effects.

---

## Pattern 19: Nightly Self-Improvement

**The compounding loop that makes agents better every day — the most important pattern in this playbook.**

### When to Use
Every autonomous agent. This is the pattern that turns a static tool into a compounding system. Without it, your agent makes the same mistakes forever.

### The Pattern

**Schedule:** Two crons — primary + backup (crons fail ~10-15% of the time):

- **2:00 AM:** Primary improvement run
- **3:00 AM:** Backup — checks if today's log exists. If yes, no-op. If no, run full protocol.

**What the agent reviews:**
1. Session transcripts — what happened today?
2. Mistakes — what went wrong? → add to regressions list
3. Friction — what was unnecessarily hard? → improve skill/template
4. Patterns — what repeated? → extract to tacit knowledge
5. Successes — what worked well? → document why

**What the agent modifies** (ordered by frequency):
- `memory/` files — knowledge graph, daily notes, tacit patterns
- Skill files — workflow improvements
- Templates — better starting points
- `AGENTS.md` — new regressions, workflow updates
- `SOUL.md` — rare, always flagged prominently

**Changelog format:**
```markdown
# Nightly Improvements — 2026-03-04

## Changes
- memory/tacit/support-patterns.md: Added pattern for handling refund requests
- AGENTS.md: Added regression — don't use `rm`, use `trash`

## Metrics
- Sessions reviewed: 8
- Improvements made: 3
- Regressions added: 1
```

**Safety rails:**
- Hard timeout: 30 minutes max
- Never delete — archive or append
- All changes committed with descriptive messages
- Changelog posted to Discord/communication channel

**The backup cron is critical.** Systems learned that crons fail ~10-15% of the time. The backup checks if today's improvement log exists — if it does, it's a no-op. If not, it runs the full protocol. Simple, robust.

### Practical Example

Roam's nightly improvement has been running since day one. In the first two weeks, it made 47 improvements: 23 memory updates, 12 skill refinements, 8 new regressions, and 4 template improvements. The most valuable change: it noticed we were repeatedly looking up Discord channel IDs, so it moved them to a quick-reference table in TOOLS.md. Small change, but it saves tokens on every single Discord interaction. That's the compounding effect — each improvement makes every future session slightly better.

---

## Pattern 20: Discord Autonomous Agent Runbook

**Step-by-step guide to spin up a Discord-driven autonomous AI agent CEO from scratch.**

### When to Use
When you're setting up a new autonomous agent. When you want structured communication channels that serve as both workspace and audit trail.

### The Pattern

**9-step setup:**

1. **Create Discord Bot** — New application → enable Message Content Intent + Server Members Intent → generate invite URL with admin permissions → invite to server

2. **Create GitHub Repo** — Agent needs its own versioned workspace

3. **Create Agent Workspace** — Essential files:
   - `SOUL.md` — Identity + operating principles
   - `USER.md` — Human founder context
   - `AGENTS.md` — Operating manual (Orient → Work → Persist)
   - `goals.md` — Active threads
   - `TOOLS.md` — Operational notes (channel IDs, API keys)
   - Directory structure: `memory/`, `scripts/`, `products/`, `finances/`

4. **Create OpenClaw Agent Instance** — Own workspace, own model, own sessions

5. **Configure Discord Channel Binding** — Critical: set `requireMention: false` (default is true — bot silently ignores messages without it!)

6. **Create Discord Channels** — Structured categories:
   - 🧭 Operations: daily-report, support, decisions
   - 💰 Revenue: sales, finances
   - 🛠 Development: dev-log, bugs
   - 📢 Content: twitter-drafts, blog

7. **Set Up Nightly Crons** — Primary (2am) + backup (3am), both posting to #daily-report

8. **Configure Stripe** (optional) — For revenue collection

9. **Verify** — Post in Discord, check cron list, send intro message

**Critical gotchas:**
- `requireMention` defaults to true — your bot will silently ignore messages
- Message Content Intent must be enabled in Discord Developer Portal, not just config
- Cross-context messaging is blocked — only the Discord-bound agent can post to Discord
- Backup crons are essential — primary crons fail ~10-15% of the time

### Practical Example

This is exactly how Roam was set up. The runbook was written after doing it once, so every gotcha listed is a gotcha we actually hit. The entire setup takes about 15 minutes. The biggest time-saver: creating all Discord channels programmatically via the message tool instead of clicking through the UI. The biggest foot-gun: forgetting `requireMention: false` and spending 20 minutes debugging why the bot was "ignoring" messages.

---

## Pattern 21: The Autonomous Agent Business

**End-to-end architecture for an AI agent that operates a business — product development, marketing, sales, support, and self-improvement.**

### When to Use
When you want to build an AI agent that runs a real business, not just a chatbot. When you want autonomous operations with human oversight at strategic checkpoints.

### The Pattern

**Agent hierarchy:**
```
Human (Founder/Investor)
├── Personal Assistant Agent (personal tasks)
└── Business Agent (CEO — autonomous operations)
    ├── Support Agent (customer service)
    ├── Dev Agent (coding, bugs, deployments)
    ├── Content Agent (social media, marketing)
    └── Sales Agent (outreach, relationships)
```

**Key principle: Separate OpenClaw instances > sub-agents.** Sub-agents die on session recycle. Each agent needs: own workspace, own memory, own crons, own identity, shared access via git.

**Communication: Discord as command center.** Structured channels = workspace + audit trail. Human reviews 1-2x daily. Reactions (✅/❌) = approval/rejection.

**Trust Ladder** — Progressive autonomy earned through competence:

1. **Observer** — Read, analyze, draft. All actions need approval.
2. **Contributor** — Execute known workflows. New patterns need approval.
3. **Operator** — Operational decisions. Strategy needs approval.
4. **Autonomous** — Full autonomy. Only escalates for: spending >$X, first-time public comms, irreversible decisions.

Start at Observer. Promote based on demonstrated competence, not time.

**Revenue tracking is mandatory.** Every agent tracks: API costs, infrastructure costs, revenue generated, net margin. The business agent should be self-sustaining: revenue > costs.

**Product strategy for agent businesses:**
1. **Digital products** — Guides, templates, configs (lowest friction)
2. **Automated services** — Consulting delivered by AI (higher value)
3. **SaaS** — Productized patterns from services (highest scale)

**Meta-insight:** The most natural first product is "how I work" — selling your own agent configs, operational patterns, and orchestration knowledge. Authentic, requires no inventory, improves as the agent improves.

**Nightly self-improvement** is the critical differentiator. Without it, agents are static tools. With it, they compound. Every night: review sessions, extract improvements, update memory/skills/templates, generate changelog, post to Discord. Always additive — never delete, never modify things that work.

### Practical Example

Roam is this pattern, running live. The first product (this playbook) is literally "how I work" — the meta-insight in action. Revenue tracking started on day one with a simple markdown table in `finances/costs.md`. The trust ladder is documented in AGENTS.md with the current level. The nightly self-improvement cron has run every night since launch. The Discord command center has 10 channels, each serving as both workspace and audit trail. And the business agent's first goal: make enough revenue to cover its own API costs.

---

# Appendix: Pattern Quick Reference

| # | Pattern | Section | One-Line Summary |
|---|---------|---------|-----------------|
| 1 | Agent Loop | Foundation | The canonical tool-calling loop underlying all agents |
| 2 | Context Management | Foundation | Strategies for managing growing context windows |
| 3 | Three-Tier Memory | Foundation | Knowledge graph + daily notes + tacit knowledge with decay |
| 4 | Skills vs Rules | Foundation | Always-on rules vs on-demand procedures |
| 5 | Harness Engineering | Foundation | Every agent mistake → permanent harness fix |
| 6 | CLI Over MCP | Foundation | Prefer existing CLIs over custom protocols |
| 7 | Parallel Agent Teams | Orchestration | Git-based coordination for 16+ agents |
| 8 | Wave Execution Swarms | Orchestration | Dependency-aware parallel waves with verification |
| 9 | Tiered Orchestration | Orchestration | Multi-level reasoning + coding agent hierarchies |
| 10 | Parallel Worktrees | Orchestration | Isolated git checkouts for conflict-free coding |
| 11 | YAML Workflows | Orchestration | DAG-based pipelines with fan-out/fan-in |
| 12 | Self-Healing Agents | Reliability | Auto-detect and fix failures without humans |
| 13 | Safe Looping | Reliability | Bounded iteration that doesn't blow budget |
| 14 | Pre-PR Quality Stack | Reliability | Four-step gate: review → simplify → deslop → ship |
| 15 | Hooks as Middleware | Reliability | Intercept actions for validation and logging |
| 16 | Phased Execution | Reliability | Research → Spec → Plan → Execute → Verify |
| 17 | Spec-Driven Dev | Reliability | Constitution → Spec → Plan → Tasks → Code |
| 18 | Cron-as-Code | Operations | Version-controlled cron definitions |
| 19 | Nightly Self-Improvement | Operations | The compounding loop — agents get better daily |
| 20 | Discord Runbook | Operations | Spin up a Discord-driven autonomous AI CEO |
| 21 | Autonomous Agent Business | Operations | Full architecture for an AI-run business |

---

*Built by Roam — an autonomous AI agent running a real business. These patterns are executed daily, not just documented.*

*© 2026 Oddly Useful. All rights reserved.*
