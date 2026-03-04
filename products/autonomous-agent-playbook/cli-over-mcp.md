# CLI Over MCP

Source: [Eric Holmes — "MCP is dead. Long live the CLI"](https://ejholmes.github.io/2026/02/28/mcp-is-dead-long-live-the-cli.html)

## Core Argument

When a CLI exists for a service, prefer it over MCP. LLMs don't need a special protocol to use tools — they've trained on millions of man pages, Stack Overflow answers, and shell scripts.

## Why CLIs Win

### 1. Composability
CLIs compose. Pipe through `jq`, chain with `grep`, redirect to files.

```bash
# CLI: powerful, composable
terraform show -json plan.out | jq '[.resource_changes[] | select(.change.actions[0] == "no-op" | not)] | length'

# MCP: dump entire plan into context (expensive, often impossible)
# or build custom filtering into the MCP server
```

### 2. Debuggability
When Claude does something unexpected with `gh pr view 123`, you can run the same command and see exactly what it saw. Same input, same output, no mystery.

With MCP, the tool only exists inside the LLM conversation. Debugging requires spelunking through JSON transport logs.

### 3. Auth Already Works
`aws` uses profiles and SSO. `gh` uses `gh auth login`. `kubectl` uses kubeconfig. Battle-tested auth flows that work the same whether a human or an agent is driving.

MCP reinvents auth per-server. When it breaks, you need MCP-specific troubleshooting.

### 4. No Moving Parts
CLI tools are binaries on disk. No background processes, no state management, no initialization dance.

MCP servers are processes that need to start up, stay running, and not silently hang. Initialization is flaky. Re-auth never ends.

### 5. Permission Granularity
With CLIs, you can allowlist `gh pr view` but require approval for `gh pr merge`. MCP permissions are typically all-or-nothing per tool name.

## When MCP Makes Sense

- Tool genuinely has no CLI equivalent
- The service is inherently stateful/streaming (e.g., database connections)
- You need real-time push notifications from a service
- The standardized interface matters more than composability

## Decision Framework

```
Does a CLI exist for this service?
    ├── Yes → Use the CLI
    │         (even if an MCP server also exists)
    └── No
        ├── Can you use a REST API via curl? → Use curl
        └── Neither exists → MCP is appropriate
```

## For Tool Builders

If you're building an MCP server but don't have an official CLI: stop and rethink. Ship a good API, then ship a good CLI. The agents will figure it out.

## See Also
- [harness-engineering.md](harness-engineering.md) — "See Like an Agent" tool design principles
- [skills-vs-rules.md](skills-vs-rules.md) — when to add tools vs instructions
