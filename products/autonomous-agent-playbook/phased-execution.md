# Phased Execution

Break complex tasks into explicit phases. Each phase produces artifacts the next phase consumes.

Source: [@pedrohcgs thread](https://x.com/pedrohcgs/status/2019925876478251045), [@bcherny tips](https://x.com/bcherny/status/2017742745365057733)

## Why Phases Beat Monolithic Prompts

**Monolithic:**
```
Build me a user authentication system with magic links, 
session management, and protected routes.
```
→ Agent tries to do everything at once, gets confused, produces incomplete work.

**Phased:**
```
Phase 1: Research existing auth patterns in this codebase
Phase 2: Write spec for magic link auth
Phase 3: Create implementation plan with file list
Phase 4: Implement auth module (following plan)
Phase 5: Add tests
Phase 6: Integration testing
```
→ Each phase has clear deliverable. Agent can verify completion before moving on.

## The Standard Phases

```
┌─────────────┐
│  RESEARCH   │  Gather context, understand constraints
└──────┬──────┘
       ↓
┌─────────────┐
│    SPEC     │  Define what we're building (acceptance criteria)
└──────┬──────┘
       ↓
┌─────────────┐
│    PLAN     │  Break into tasks, identify files, sequence work
└──────┬──────┘
       ↓
┌─────────────┐
│  EXECUTE    │  Implement (possibly in sub-phases)
└──────┬──────┘
       ↓
┌─────────────┐
│   VERIFY    │  Test, review, validate against spec
└─────────────┘
```

## Phase Artifacts

Each phase produces a concrete artifact:

| Phase | Artifact | Example |
|-------|----------|---------|
| Research | Context doc | `docs/auth-research.md` |
| Spec | Requirements | `docs/auth-spec.md` |
| Plan | Task breakdown | `docs/auth-plan.md` or GitHub issues |
| Execute | Code | `src/auth/*` |
| Verify | Test results | CI green, manual QA notes |

## Implementation Patterns

### Pattern 1: Plan Mode → Execute Mode

Claude Code's built-in approach:

```
1. Start in Plan mode (Shift+Tab twice)
2. Iterate on plan until solid
3. Accept plan → auto-clears context
4. Execute with fresh context focused on the plan
```

**Key insight:** Accepting a plan clears context, so the execution gets a clean slate with just the plan.

### Pattern 2: Explicit Phase Prompts

```markdown
## Phase 1: Research
Read the existing codebase and document:
- Current auth approach (if any)
- Database schema for users
- Existing session handling
- Related routes

Output: Write findings to docs/auth-research.md

## Phase 2: Spec
Based on research, write a spec for magic link auth:
- User stories
- Acceptance criteria
- Edge cases
- Security considerations

Output: Write to docs/auth-spec.md

[continue for each phase...]
```

### Pattern 3: Phase Gates

Require human approval between phases:

```markdown
After completing each phase:
1. Commit your work
2. Push and stop
3. Wait for approval to continue to next phase

Phase gates:
- Research → Spec: Approval needed
- Spec → Plan: Approval needed
- Plan → Execute: Approval needed
- Execute → Verify: Auto-continue
```

### Pattern 4: Subagent Per Phase

Different agents for different phases:

```javascript
// Research agent (read-only, web access)
await sessions_spawn({
  task: "Research auth patterns. Output to docs/auth-research.md",
  label: "auth-research"
});

// Planning agent (architect)
await sessions_spawn({
  task: "Read docs/auth-research.md. Create implementation plan.",
  label: "auth-plan"
});

// Implementation agent (coder)
await sessions_spawn({
  task: "Read docs/auth-plan.md. Implement following the plan exactly.",
  label: "auth-implement"
});
```

## Spec Document Template

```markdown
# Feature: [Name]

## Overview
[One paragraph summary]

## User Stories
- As a [user], I want [capability] so that [benefit]
- ...

## Acceptance Criteria
- [ ] [Specific testable criterion]
- [ ] [Specific testable criterion]
- [ ] ...

## Technical Approach
[High-level approach]

## Files to Create/Modify
- `src/auth/magic-link.ts` - Core logic
- `src/auth/session.ts` - Session management
- `src/routes/auth.ts` - API routes
- `tests/auth.test.ts` - Tests

## Edge Cases
- [ ] Expired magic links
- [ ] Multiple devices
- [ ] Rate limiting

## Security Considerations
- Token expiry
- Single-use links
- IP validation (optional)

## Out of Scope
- OAuth providers (future)
- 2FA (future)
```

## Plan Document Template

```markdown
# Implementation Plan: [Feature]

## Phase 1: [Name]
**Goal:** [What this phase achieves]
**Files:**
- [ ] `path/to/file.ts` - [what to do]
- [ ] `path/to/file.ts` - [what to do]
**Tests:** [How to verify phase is complete]
**Estimated:** [X commits]

## Phase 2: [Name]
...

## Dependencies
- Phase 2 depends on Phase 1
- Phase 3 can run in parallel with Phase 2

## Risks
- [Risk and mitigation]
```

## Anti-Patterns

❌ **Skipping research** — agent makes assumptions
❌ **Vague specs** — "make it work" isn't a spec
❌ **No plan** — agent wanders
❌ **Executing before plan approval** — expensive mistakes
❌ **Phases too granular** — overhead exceeds benefit

## When to Use

✅ **Features (multi-file changes)**
✅ **Refactors (high risk of regression)**
✅ **Integrations (external dependencies)**
✅ **Anything >2 hours of work**

❌ **Bug fixes (usually single phase)**
❌ **Typos/docs (just do it)**
❌ **Exploratory work (research IS the work)**

## See Also
- [patterns/safe-looping.md](safe-looping.md) — bounded execution within phases
- [patterns/parallel-agent-teams.md](parallel-agent-teams.md) — multiple agents per phase
