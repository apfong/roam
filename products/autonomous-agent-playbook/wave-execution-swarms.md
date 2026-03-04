# Wave-Based Execution (Swarms Pattern)

Source: https://github.com/am-will/swarms
For: Claude Code, Codex CLI

## Core Idea

An orchestrator that **plans** the work should also **coordinate** the execution. It already has the complete picture — why throw that away?

Instead of simple loops where each agent starts fresh, the orchestrator:
1. Plans with explicit dependencies
2. Executes in parallel "waves"
3. Verifies between waves
4. Maintains context throughout

## Phase 1: Planning

The orchestrator:
- Researches codebase architecture
- Fetches current library docs
- Asks clarifying questions when ambiguity exists
- Generates a plan with explicit task dependencies
- Spawns a review subagent to check for gaps

### Dependency Format
```
T1: [depends_on: []] Create database schema
T2: [depends_on: []] Install packages
T3: [depends_on: [T1]] Create repository layer
T4: [depends_on: [T1]] Create service interfaces
T5: [depends_on: [T3, T4]] Implement business logic
T6: [depends_on: [T2, T5]] Add API endpoints
```

### Wave Computation (Topological Sort)
```
Wave 1: T1, T2          (no dependencies)
Wave 2: T3, T4          (after T1)
Wave 3: T5              (after T3, T4)
Wave 4: T6              (after T2, T5)
```

## Phase 2: Wave Execution

For each wave:
1. Orchestrator identifies unblocked tasks
2. Launches subagents in parallel with **targeted context**:
   - The plan file
   - Exact files to work on
   - Correct filenames/paths for dependencies
   - What adjacent tasks are doing
   - Current project state
3. Subagents complete, commit (never push), update plan
4. **Orchestrator verifies** the wave before proceeding
5. Next wave begins

### Plan as Living Document

Each task has mutable fields updated by subagents:
```markdown
### T1: Create User Model
- **depends_on**: []
- **location**: src/models/user.ts
- **description**: Define User entity with required fields
- **validation**: Unit tests pass
- **status**: Completed ✅
- **log**: Created User model with email, name, passwordHash fields
- **files edited/created**: src/models/user.ts, src/models/index.ts
```

## Key Rules

### Commit But Never Push
Subagents commit their work but never push while other agents are working in parallel. The orchestrator handles integration after wave verification.

### Targeted Context Per Subagent
Instead of "figure it out," each agent gets:
- Exact file paths to modify
- What adjacent tasks are building
- Dependencies' output locations
- Relevant plan sections

This **dramatically reduces discovery tokens** — agents know where to go instead of grepping and exploring.

### Orchestrator Verification Between Waves
After each wave completes, the orchestrator:
- Checks all subagent outputs
- Runs validation if feasible
- Catches issues immediately (not 3 tasks later)
- Fixes problems before they compound

## Comparison

| Approach | Context | Parallelism | Oversight | Complexity |
|----------|---------|-------------|-----------|------------|
| Simple loop | Fresh each time | None | Self-check | Minimal |
| Anthropic git-lock | Fresh + shared files | Full parallel | None between tasks | Low |
| **Swarms waves** | **Orchestrator maintains** | **Within waves** | **Between waves** | **Medium** |
| ChatDev DAG | Edge-based flow | Full DAG | Condition routing | High |
| Complex multi-agent | Specialized agents | Full parallel | Multiple systems | Very high |

## When to Use

**Swarms waves** when:
- Building features with clear task dependencies
- Working with Claude Code or Codex
- Want verification between phases
- Need to minimize token waste on discovery

**Simple loops** when:
- Many independent tasks (test fixing)
- Exploration/research

**Full DAG (ChatDev)** when:
- Complex workflows with dynamic routing
- Need loops, self-reflection, fan-out/fan-in
- Building reusable workflow templates

## Installation

```bash
# Claude Code / Codex
npx skills add am-will/swarms
```

Recommended pairing: Context7 MCP for latest library docs during planning.

## See Also
- `parallel-agent-teams.md` — Anthropic's git-based approach
- `safe-looping.md` — Bounded iteration patterns
- `chatdev-2.0-yaml-patterns.md` — DAG-based workflows
