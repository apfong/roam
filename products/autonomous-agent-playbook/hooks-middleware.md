# Hooks as Middleware

Hooks let you intercept agent actions before or after execution — like middleware for your AI agent.

Source: [@adocomplete](https://x.com/adocomplete/status/2017723651089383736)

## Core Concept

```
User Request
    ↓
┌─────────────────┐
│  PreToolUse     │  ← Intercept BEFORE tool runs
│  (validate,     │
│   transform,    │
│   log)          │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Tool Executes  │
└────────┬────────┘
         ↓
┌─────────────────┐
│  PostToolUse    │  ← Intercept AFTER tool runs
│  (verify,       │
│   transform,    │
│   trigger next) │
└────────┬────────┘
         ↓
    Agent Response
```

## Use Cases

### 1. Logging & Observability
```yaml
hooks:
  PostToolUse:
    - command: "echo '[$(date)] Tool: $TOOL_NAME' >> ~/.agent_logs/tool_calls.log"
      async: true  # Don't block agent
```

### 2. Validation / Guardrails
```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      command: |
        # Block dangerous commands
        if echo "$TOOL_INPUT" | grep -qE "rm -rf|DROP TABLE|curl.*\| bash"; then
          echo "BLOCKED: Dangerous command detected"
          exit 1
        fi
```

### 3. Auto-Format After Edits
```yaml
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      command: "pnpm prettier --write $FILE_PATH"
      async: true
```

### 4. Test After Code Changes
```yaml
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      filter: "**/*.ts"
      command: "pnpm test --related $FILE_PATH"
```

### 5. Notifications
```yaml
hooks:
  PostToolUse:
    - matcher: "Task"  # When a task/subagent completes
      command: "notify-send 'Agent completed task: $TASK_DESCRIPTION'"
      async: true
```

### 6. Auto-Commit Checkpoints
```yaml
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      command: |
        cd $PROJECT_ROOT
        git add -A
        git commit -m "checkpoint: $TOOL_NAME on $FILE_PATH" --allow-empty
      async: true
```

### 7. Context Injection
```yaml
hooks:
  PreToolUse:
    - matcher: "Read"
      command: |
        # Add related files to context
        if [[ "$FILE_PATH" == *.test.* ]]; then
          echo "Also consider: ${FILE_PATH/.test/}"
        fi
```

## Claude Code Configuration

In `~/.claude/settings.json` or project `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "./scripts/validate-command.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "pnpm lint:fix $FILE_PATH",
        "async": true
      }
    ],
    "Stop": [
      {
        "command": "./scripts/on-agent-stop.sh"
      }
    ]
  }
}
```

### Available Hooks
- `PreToolUse` — before any tool call
- `PostToolUse` — after any tool call
- `Stop` — when agent stops (manually or naturally)
- `Notification` — when agent wants to notify user
- `TeammateIdle` — when a teammate agent becomes idle (agent teams)
- `TaskCompleted` — when a spawned task finishes

### Environment Variables Available
- `$TOOL_NAME` — which tool is running
- `$TOOL_INPUT` — the input to the tool
- `$FILE_PATH` — for file operations
- `$PROJECT_ROOT` — project root directory
- `$SESSION_ID` — current session ID

### Async Hooks
Add `async: true` for hooks that shouldn't block:
- Logging
- Notifications
- Non-critical formatting

Keep synchronous for:
- Validation/guardrails
- Required verification

## Patterns

### The Guardrail Stack
```yaml
PreToolUse:
  - matcher: "Bash"
    command: "./hooks/validate-bash.sh"      # Block dangerous commands
  - matcher: "Write"  
    command: "./hooks/validate-write.sh"     # Block writes to protected paths
  - matcher: "Edit"
    command: "./hooks/validate-edit.sh"      # Require backup before edit
```

### The Quality Stack
```yaml
PostToolUse:
  - matcher: "Edit|Write"
    filter: "**/*.{ts,tsx,js,jsx}"
    command: "pnpm eslint --fix $FILE_PATH"
    async: true
  - matcher: "Edit|Write"
    filter: "**/*.{ts,tsx,js,jsx}"
    command: "pnpm prettier --write $FILE_PATH"
    async: true
```

### The Audit Trail
```yaml
PreToolUse:
  - command: |
      echo "{\"ts\": \"$(date -Iseconds)\", \"tool\": \"$TOOL_NAME\", \"phase\": \"pre\"}" >> ~/.agent_audit.jsonl
    async: true
PostToolUse:
  - command: |
      echo "{\"ts\": \"$(date -Iseconds)\", \"tool\": \"$TOOL_NAME\", \"phase\": \"post\"}" >> ~/.agent_audit.jsonl
    async: true
```

## Anti-Patterns

❌ **Slow synchronous hooks** — blocks agent on every tool call
❌ **Hooks that fail silently** — agent continues unaware
❌ **Too many hooks** — death by a thousand cuts to latency
❌ **Hooks with side effects on PreToolUse** — tool might not execute

## Testing Hooks

```bash
# Test a hook script manually
TOOL_NAME="Bash" TOOL_INPUT="rm -rf /" ./hooks/validate-bash.sh
echo $?  # Should be non-zero (blocked)

TOOL_NAME="Bash" TOOL_INPUT="ls -la" ./hooks/validate-bash.sh
echo $?  # Should be 0 (allowed)
```

## See Also
- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [patterns/pre-pr-quality-stack.md](pre-pr-quality-stack.md) — example quality workflow
