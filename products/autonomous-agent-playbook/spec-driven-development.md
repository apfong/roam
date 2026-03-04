# Spec-Driven Development (SDD)

Formalize the pipeline from idea → specification → implementation plan → task breakdown → execution. Prevents "vibe coding" by making the spec the source of truth, not the code.

Inspired by [GitHub's spec-kit](https://github.com/github/spec-kit), adapted for multi-agent orchestration.

## Core Idea

Traditional development: idea → code → docs (if lucky).
SDD: idea → **constitution** → **spec** → **plan** → **tasks** → code.

Each phase produces a concrete artifact that gates the next phase. Specs are versioned alongside code and evolve with the project.

## The Pipeline

```
┌──────────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌───────────┐
│ Constitution │────▶│   Spec   │────▶│   Plan   │────▶│  Tasks   │────▶│ Implement │
│  (project)   │     │(feature) │     │(technical)│    │(actionable)│   │  (code)   │
└──────────────┘     └──────────┘     └──────────┘     └──────────┘     └───────────┘
     ▲                                                                        │
     └────────────────── feedback loop (production learnings) ────────────────┘
```

## Phase 1: Constitution

A project-level governance document. Written once, evolves rarely. Every feature must comply.

**What it defines:**
- Core principles (3-7, not 30)
- Non-negotiable standards (testing, security, observability)
- Technology constraints and preferences
- Quality gates and review process
- Governance rules (how to amend the constitution itself)

**Template:**

```markdown
# [Project] Constitution

## Core Principles

### I. [Principle Name]
[Description + specific rules]

### II. [Principle Name]
[Description + specific rules]

## Quality Gates
- [ ] Tests pass before merge
- [ ] No [NEEDS CLARIFICATION] markers in specs
- [ ] Constitution compliance verified

## Governance
- Constitution supersedes ad-hoc decisions
- Amendments require documentation + rationale
- Version: X.Y | Ratified: [DATE]
```

**Why this matters for agents:** Agents without constraints produce inconsistent work. A constitution acts as a persistent system prompt for every agent in the project — it's the "rules" layer from [skills-vs-rules.md](skills-vs-rules.md).

## Phase 2: Feature Spec

Describes **what** and **why**, never **how**. Written for business stakeholders, not developers. No tech stack, no APIs, no code structure.

**Key innovations from spec-kit worth adopting:**

### Prioritized User Stories with Independent Testability

Each user story is:
- **Prioritized** (P1, P2, P3) — P1 is your MVP
- **Independently testable** — implementing just P1 gives you a viable product
- **Bounded** with Given/When/Then acceptance scenarios

```markdown
### User Story 1 - Photo Album Creation (Priority: P1) 🎯 MVP

Users can create and name photo albums grouped by date.

**Why this priority**: Core value prop — without albums, there's no product.

**Independent Test**: Upload 3 photos → verify album created with date grouping.

**Acceptance Scenarios**:
1. **Given** a user with photos, **When** they click "Create Album",
   **Then** photos are grouped by date automatically.
2. **Given** an empty album, **When** user drags photos in,
   **Then** album updates with new photos.
```

### Requirement Precision

- Use RFC 2119 language (MUST, SHOULD, MAY)
- Max 3 `[NEEDS CLARIFICATION]` markers — force informed guesses over analysis paralysis
- Every requirement must be testable; if you can't test it, rewrite it

### Success Criteria (Technology-Agnostic)

Good: "Users complete checkout in under 3 minutes"
Bad: "API response time under 200ms" (implementation detail leaking into spec)

## Phase 3: Implementation Plan

Translates the spec into technical decisions. This is where tech stack, architecture, and file structure live.

**Template structure:**

```markdown
# Implementation Plan: [Feature]

## Summary
[What + technical approach]

## Technical Context
- Language/Version: [e.g., TypeScript 5.x]
- Dependencies: [e.g., Next.js, Prisma]
- Storage: [e.g., PostgreSQL]
- Testing: [e.g., Vitest]

## Constitution Compliance Check
- [ ] Principle I satisfied because [reason]
- [ ] Principle II satisfied because [reason]

## Project Structure
[Concrete file tree — no "Option 1/2/3", pick one]

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [item]    | [reason]   | [why simpler doesn't work]          |
```

**Constitution compliance is a gate** — plan can't proceed without passing.

## Phase 4: Task Breakdown

The most agent-friendly phase. Tasks become directly assignable work units.

### Parallelism Markers

```markdown
- [ ] T001 [P] [US1] Create User model in src/models/user.ts
- [ ] T002 [P] [US1] Create Album model in src/models/album.ts
- [ ] T003 [US1] Implement AlbumService in src/services/album.ts (depends on T001, T002)
```

- **`[P]`** = can run in parallel (different files, no deps)
- **`[US1]`** = belongs to User Story 1 — enables story-level progress tracking
- **Exact file paths** in every task — no ambiguity for agents

### Phased Execution with Checkpoints

```
Phase 1: Setup (project scaffolding)
Phase 2: Foundation (shared infra — BLOCKS all user stories)
   ⏸️ Checkpoint: foundation ready
Phase 3: User Story 1 (P1 — MVP)
   ⏸️ Checkpoint: US1 independently testable
Phase 4: User Story 2 (P2)
   ⏸️ Checkpoint: US1 + US2 both work
Phase N: Polish (cross-cutting concerns)
```

### Mapping to Multi-Agent Orchestration

This is where our toolkit adds value over spec-kit:

```yaml
# ChatDev-style DAG for task execution
graph:
  start: [setup]
  nodes:
    - id: setup
      type: agent  # scaffolding agent
    - id: foundation
      type: agent  # core infra agent
    - id: us1_models
      type: subgraph
      config:
        # Fan-out: parallel model creation
        type: map
        tasks: [T001, T002]  # [P] tasks
    - id: us1_services
      type: agent  # sequential: depends on models
    - id: us1_verify
      type: agent  # checkpoint verification
  edges:
    - from: setup → foundation
    - from: foundation → us1_models
    - from: us1_models → us1_services
    - from: us1_services → us1_verify
```

Tasks marked `[P]` become fan-out nodes. Sequential tasks become edges. User stories become subgraphs. Checkpoints become gate nodes that can pause for human review.

## Phase 5: Implementation

Execute tasks phase by phase. Key rules:
- **Mark tasks complete** as you go (`[x]`)
- **Halt on failure** for sequential tasks; continue parallel tasks
- **Validate at checkpoints** before proceeding
- **Checklist gates** can block implementation start (e.g., UX review, security review)

## Checklist Gates

Optional but powerful: checklists that must pass before a phase can start.

```markdown
# Pre-Implementation Checklist: Photo Albums

## Spec Quality
- [x] No implementation details in spec
- [x] All acceptance scenarios defined
- [x] Success criteria are measurable + tech-agnostic
- [ ] UX review completed  ← BLOCKS implementation

## Security
- [x] Auth requirements defined
- [x] Data retention policy documented
```

If any checklist item is incomplete, the agent asks before proceeding. This is the "human-in-the-loop checkpoint" pattern applied to specs.

## Integration with Existing Patterns

| Existing Pattern | How SDD Connects |
|-----------------|------------------|
| [Phased Execution](phased-execution.md) | SDD formalizes the phases: constitution → spec → plan → tasks → implement |
| [Parallel Agent Teams](parallel-agent-teams.md) | `[P]` markers identify parallelizable work; `[US]` markers define team boundaries |
| [Pre-PR Quality Stack](pre-pr-quality-stack.md) | Constitution compliance check = the first quality gate |
| [Safe Looping](safe-looping.md) | Checkpoints between phases = natural bounded iteration points |
| [Skills vs Rules](skills-vs-rules.md) | Constitution = rules (always-on); spec/plan/tasks = skills (per-feature) |
| [ChatDev DAG](chatdev-2.0-yaml-patterns.md) | Task breakdown maps directly to DAG nodes, edges, and fan-out |

## When to Use SDD

**Good fit:**
- Greenfield features with unclear scope
- Multi-agent implementation (tasks need to be unambiguous)
- Projects with quality/compliance requirements
- Anything you'd regret vibe-coding

**Overkill:**
- Bug fixes, typo corrections
- Well-understood changes to existing patterns
- Exploratory prototypes (spec after, not before)

## Directory Convention

```
project/
├── constitution.md          # Project-level (one per project)
└── specs/
    ├── 001-user-auth/
    │   ├── spec.md          # Feature spec
    │   ├── plan.md          # Implementation plan
    │   ├── tasks.md         # Task breakdown
    │   ├── research.md      # Optional: research notes
    │   └── checklists/      # Optional: gate checklists
    │       ├── requirements.md
    │       └── security.md
    └── 002-photo-albums/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

Branch per feature: `001-user-auth`, `002-photo-albums`. Specs live in the repo, versioned with git.

## Key Takeaways

1. **Specs are executable** — they directly generate task DAGs for agent orchestration
2. **Constitution prevents drift** — project principles apply to every feature, every agent
3. **Independent user stories** — each priority level is a standalone MVP increment
4. **Parallelism is explicit** — `[P]` markers + file paths = zero ambiguity for agents
5. **Checkpoints are gates** — phases don't bleed into each other
6. **Feedback loops close** — production learnings update specs, not just code

---

*Sources: [GitHub spec-kit](https://github.com/github/spec-kit), [spec-driven.md philosophy](https://github.com/github/spec-kit/blob/main/spec-driven.md). Adapted for multi-agent orchestration contexts.*
