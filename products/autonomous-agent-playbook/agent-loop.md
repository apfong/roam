# The Agent Loop

The agent loop is the core pattern underlying all AI agents. Understanding it is essential for building reliable orchestration systems.

## Reference: OpenAI Codex Architecture

Source: [Unrolling the Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/) (Michael Bolin, Jan 2026)
Open source: [github.com/openai/codex](https://github.com/openai/codex)

## The Canonical Loop

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

A single turn can include many tool calls before producing a final assistant message. The loop continues until the model decides it has enough information to respond.

## Prompt Construction

### Layered Priority (from OpenAI's design)

Items in the prompt have roles that determine weight (decreasing priority):

| Role | Content | Who Controls |
|------|---------|-------------|
| `system` | Model behavior rules | Server/platform |
| `developer` | Sandbox rules, config instructions | Developer/agent builder |
| `user` | Instructions, context, actual message | User + workspace files |
| `assistant` | Model's prior responses | Model |

### Instruction Hierarchy

Instructions are aggregated from multiple sources, most specific last:

```
Global defaults (toolkit/platform)
  → Project-level (AGENTS.md in repo root)
    → Directory-level (AGENTS.md in cwd)
      → Task-specific (per-delegation instructions)
```

Most specific instructions win on conflicts. This enables:
- Shared defaults across all projects
- Project-specific overrides
- Task-specific customization without modifying globals

### Prompt Components (Codex reference)

1. **Instructions** — from config or bundled defaults
2. **Tools** — function definitions (shell, search, MCP servers, custom)
3. **Input** — sandbox permissions, developer instructions, environment context, conversation history, user message

## Tool Execution

### Sandbox Model

Not all tools are equal in trust level:

| Trust Level | Examples | Guardrails |
|-------------|----------|------------|
| **Sandboxed** | Shell commands, file writes | Agent enforces restrictions |
| **Self-guarded** | MCP servers, external APIs | Tool enforces own limits |
| **Trusted** | Read-only operations, search | Minimal restrictions |

**Codex's approach:** Shell tool is sandboxed by the agent harness. MCP server tools are NOT sandboxed — they're responsible for their own guardrails.

**Implication for multi-agent:** Each specialist agent should have a defined trust/sandbox profile:
- **Researcher**: read-only tools, web search, no file writes
- **Coder**: sandboxed shell + file writes, scoped to working directory
- **Critic**: read-only + test execution, no file mutations
- **Orchestrator**: delegation tools, no direct tool execution

## Context Management

### Append-Only History (Key Insight)

Every new prompt = old prompt + new items appended at the end.

```
Turn 1: [system] [tools] [instructions] [user msg]
Turn 1+: [system] [tools] [instructions] [user msg] [tool call] [tool result] [asst msg]
Turn 2:  [system] [tools] [instructions] [user msg] [tool call] [tool result] [asst msg] [user msg 2]
```

**Why this matters:** Exact prefix matching enables prompt caching. The model only processes new tokens; cached prefix is reused. This turns quadratic inference into linear.

**Trade-off:** Data transfer is quadratic (full history resent each time), but inference cost dominates, so caching wins.

### Stateless vs Stateful

| Approach | Pros | Cons |
|----------|------|------|
| **Stateless** (Codex) | Resilient, ZDR-compatible, any request reconstructs | Quadratic data transfer |
| **Stateful** (previous_response_id) | Less data per request | Server must persist state, harder ZDR |

Codex chose stateless for simplicity and compliance. For our toolkit, stateless is also recommended unless working with very long conversations.

### Context Window Budgeting

Every model has a context window (max tokens for input + output). The agent must manage this:

1. **Monitor usage** — track token count per turn
2. **Compact when needed** — summarize old context to free space
3. **Prioritize recency** — recent tool results matter more than old ones
4. **Reserve output space** — don't fill the entire window with input

## Multi-Turn Conversations

Each new user message starts a new turn. The full conversation history (messages + tool calls from all prior turns) is included in the prompt.

```
Turn 1: User asks → Agent works → Assistant responds
Turn 2: User follows up → Agent sees Turn 1 context + new message → Works → Responds
Turn N: Full history of turns 1..N-1 + new message
```

This is why context window management matters — conversations grow without bound.

## Applying to Multi-Agent Systems

In our toolkit, the agent loop operates at two levels:

### Level 1: Individual Agent Loop
Each specialist (researcher, coder, critic) runs its own agent loop:
- Takes delegation from orchestrator
- Runs tool calls
- Returns result

### Level 2: Orchestrator Loop
The orchestrator runs a higher-order loop:
- Receives user goal
- Decomposes into tasks
- Delegates to specialists (each running Level 1 loops)
- Integrates results
- Returns to user or loops for more work

```
User Goal
  → Orchestrator decomposes
    → Researcher loop (search → synthesize → report)
    → Coder loop (plan → implement → test)
    → Critic loop (review → issue → suggest)
  → Orchestrator integrates
  → Human checkpoint or final output
```

This nested loop structure is what makes multi-agent more powerful than single-agent for complex tasks — each specialist is optimized for its subtask.

## References

- [OpenAI: Unrolling the Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [OpenAI Codex CLI (open source)](https://github.com/openai/codex)
- [OpenAI Responses API docs](https://platform.openai.com/docs/api-reference/responses)
