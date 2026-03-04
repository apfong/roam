# Tiered Agent Orchestration

Multi-level agent hierarchies that combine reasoning agents (Claude) with specialized coding agents (Codex) for maximum throughput and capability coverage.

## Core Architecture

```
Orchestrator (Pip / main session)
    │
    ├── Claude Sub-Agent (full tool access)
    │   ├── browser, web_search, web_fetch, exec, files
    │   ├── can spawn and monitor Codex agents
    │   └── acts as "senior dev" reviewing Codex output
    │
    └── Codex Agent (sandboxed coding)
        ├── read/write files, run commands in workdir
        ├── NO browser, web search, API calls, messaging
        └── excels at raw implementation from clear specs
```

### Capability Matrix

| Capability | Orchestrator | Claude Sub-Agent | Codex Agent |
|-----------|-------------|-----------------|-------------|
| Reasoning / planning | ✅ Best | ✅ Good | ⚠️ Limited |
| Web search / browse | ✅ | ✅ | ❌ |
| API calls | ✅ | ✅ | ❌ |
| File read/write | ✅ | ✅ | ✅ |
| Shell commands | ✅ | ✅ | ✅ (sandboxed) |
| Raw coding speed | — | Good | ✅ Best |
| Context window | Shared session | Isolated | Isolated |
| Cost | Main session | Sub-agent tokens | Codex subscription |

## The Bridge Pattern: Claude as Codex's Arms & Eyes

Codex can't browse the web, call APIs, or access external services. Its parent Claude sub-agent handles this by **pre-staging context**:

```
Claude Implementer Sub-Agent:
    1. web_fetch API docs → write to workdir/docs/api-reference.md
    2. browser snapshot of target UI → save screenshot to workdir/reference/
    3. web_search for library examples → write to workdir/docs/examples.md
    4. Read existing codebase, write architecture summary → workdir/CONTEXT.md
    5. Spawn Codex with: "Implement X. Read CONTEXT.md and docs/ for reference."
    6. Monitor Codex output
    7. If Codex needs more context → fetch it, write to workdir, send feedback
    8. Review final output, run tests, approve or iterate
```

**Key insight:** The Claude sub-agent is Codex's interface to the outside world. Anything Codex needs that's beyond its sandbox, Claude fetches and stages as files.

## Dynamic Hierarchy Design

The hierarchy is NOT fixed. The orchestrator designs the optimal team for each problem. Some examples:

### Product Feature Implementation
```
Orchestrator
├── Claude: Architect (specs, reviews architecture decisions)
├── Claude: Implementer-A (frontend)
│   └── Codex: frontend-feature (React/CSS/etc)
├── Claude: Implementer-B (backend)
│   └── Codex: backend-api (API endpoints, DB migrations)
└── Claude: Reviewer (adversarial cross-examination)
```

### Research & Analysis
```
Orchestrator
├── Claude: Researcher-A (web search, data gathering)
├── Claude: Researcher-B (different angle/sources)
├── Claude: Analyst (synthesize findings)
└── Claude: Skeptic (adversarial review)
```

### Bug Investigation & Fix
```
Orchestrator
├── Claude: Investigator (read logs, trace code, identify root cause)
│   └── Codex: fix-implementation (write the actual fix)
└── Claude: Verifier (test the fix, check for regressions)
```

### Infrastructure / DevOps
```
Orchestrator
├── Claude: Planner (research best practices, design config)
│   └── Codex: implement-infra (Terraform, Docker, CI config)
└── Claude: Security Reviewer (audit the changes)
```

### Creative / Content
```
Orchestrator
├── Claude: Researcher (gather context, examples, data)
├── Claude: Writer (draft content)
└── Claude: Editor (review, tighten, fact-check)
```

### The Point
The orchestrator assesses the problem and designs the team. Factors:
- **Does it need external data?** → Claude agents for research/browsing
- **Does it need raw coding volume?** → Codex agents under Claude supervisors
- **Does it need adversarial review?** → Dedicated reviewer agent
- **Is it simple enough for one agent?** → Just do it, no hierarchy needed

## Spawning & Monitoring

### Orchestrator → Claude Sub-Agent
```
sessions_spawn with:
  - task: detailed instructions including when/how to spawn Codex
  - label: descriptive (e.g., "implementer-frontend")
  - runTimeoutSeconds: 1800+ (Codex loops take time)
```

### Claude Sub-Agent → Codex Agent
The Claude sub-agent uses exec to run codex-agent.sh:
```bash
exec pty:true background:true timeout:1800
codex-agent.sh \
  --label feature-auth \
  --workdir ~/project \
  --max-iterations 5 \
  --success-cmd "npm test" \
  "Implement auth middleware per CONTEXT.md spec"
```

### Status Bubbling
Three-level monitoring:
1. **Codex → Claude sub-agent:** Claude sub-agent checks `/tmp/codex-agents/{label}/status`
2. **Claude sub-agent → Orchestrator:** Sub-agent completion auto-announces via sessions_spawn
3. **Orchestrator → Human:** Orchestrator synthesizes all results and reports

The orchestrator sets a monitor cron that checks if all sub-agents are done. When they are:
1. Read results from each (sessions_history)
2. Cross-reference outputs
3. Run adversarial review if warranted
4. Verify (build, test, browser check)
5. Report to human

## Communication Flow

```
Orchestrator
    │
    │ sessions_spawn("Research X, then spawn Codex to implement")
    ▼
Claude Sub-Agent
    │
    │ 1. Research (web_search, browser, read codebase)
    │ 2. Write context files to workdir
    │ 3. exec codex-agent.sh with spec
    │ 4. Monitor Codex status file
    │ 5. Review output, send feedback if needed
    │ 6. When done: completion auto-announces
    │
    ▼
Codex Agent
    │
    │ 1. Read CONTEXT.md and reference docs
    │ 2. Implement
    │ 3. Run success-cmd
    │ 4. Write status (success/waiting-feedback/failed)
    │
    ▼
Results flow back up
```

## When to Use Each Tier

| Task Complexity | Approach |
|----------------|----------|
| Simple fix, quick question | Orchestrator handles directly |
| Medium feature, single domain | One Claude sub-agent, maybe one Codex |
| Large feature, multi-domain | Full hierarchy with specialized agents |
| Research / analysis | Claude sub-agents only (no Codex needed) |
| Pure greenfield coding | Codex with Claude staging context |

**Rule of thumb:** Don't over-orchestrate. If you can do it in one session, do it in one session. The hierarchy exists for problems that genuinely benefit from parallelism and specialization.

## Cost Considerations

- Claude sub-agents consume API tokens (or subscription quota)
- Codex agents consume Codex subscription quota
- More agents ≠ better results for simple tasks
- The orchestrator should minimize hierarchy depth for cost efficiency
- Pre-staging context for Codex (instead of letting it search) saves Codex tokens

## Integration with Other Patterns

| Pattern | How It Connects |
|---------|----------------|
| [Adversarial Review](parallel-agent-teams.md#adversarial-review-round) | Dedicated reviewer agent in the hierarchy |
| [Harness Engineering](harness-engineering.md) | "See Like an Agent" guides tool design at each tier |
| [CLI Over MCP](cli-over-mcp.md) | Codex already uses CLIs; Claude agents should too |
| [Pre-PR Quality Stack](pre-pr-quality-stack.md) | Run quality gates before results bubble up |
| [Spec-Driven Development](spec-driven-development.md) | Architect agent produces specs, implementers consume them |
| [Progressive Disclosure](../CLAUDE.md) | Context staged in layers, not dumped all at once |

## Anti-Patterns

❌ **Over-orchestrating simple tasks** — spawning 5 agents to fix a typo
❌ **Fixed hierarchies** — using the same team structure regardless of problem
❌ **No monitoring** — spawning agents and hoping they finish
❌ **Codex without context** — expecting Codex to figure out architecture from scratch
❌ **Polling loops** — checking status every 10 seconds instead of using completion announcements
❌ **Skipping adversarial review** — merging parallel outputs without cross-examination

---

*Sources: OpenClaw agent architecture, Codex CLI sandbox model, Claude Code team patterns (@trq212), swarm adversarial patterns (@Voxyz_ai).*
