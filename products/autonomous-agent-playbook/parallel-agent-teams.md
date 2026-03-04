# Parallel Agent Teams

Source: https://www.anthropic.com/engineering/building-c-compiler
Case Study: 16 parallel Claude agents built a 100K-line C compiler for $20K over ~2000 sessions

## Core Architecture

### The Loop Harness
Keep Claude in a continuous loop, picking up the next task when done:

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

**Key insight:** Claude stops and waits for input by default. The loop forces continuous progress. Prompt should say "keep going until it's perfect."

**Safety:** Run in a container, not your actual machine.

### Git-Based Task Locking (No Orchestrator)

Simple coordination without a central orchestrator:

```
current_tasks/
├── parse_if_statement.txt      # Agent A's lock
├── codegen_function_def.txt    # Agent B's lock
└── fix_arm_backend.txt         # Agent C's lock
```

**Protocol:**
1. Agent writes a file to `current_tasks/` to claim a task
2. Git's conflict resolution prevents duplicates (second agent must pick different task)
3. Agent works, pulls upstream, merges, pushes, removes lock
4. Loop spawns new session in fresh container

**Why this works:** Git IS the coordination layer. No message passing, no orchestrator, no complexity.

---

## Designing for Agents (Not Humans)

### Context Window Pollution
- **Don't:** Print thousands of lines of test output
- **Do:** Print summary stats only, log details to files
- **Do:** Pre-compute aggregates so Claude doesn't recompute

### Grep-able Output
```
# Bad - Claude has to parse this
Test results: 847 passed, 12 failed, see details below...

# Good - one grep finds all errors
ERROR parse_int: expected 42, got 0
ERROR codegen_loop: segfault at line 847
OK 847 tests passed
```

### Time Blindness
Claude can't tell time and will happily spend hours on one thing.

**Solutions:**
- Add `--fast` flag for 10% random sample
- Print progress sparingly (avoid context pollution)
- Make subsample deterministic per-agent but random across agents (full coverage, local reproducibility)

### Fresh Context Problem
Each agent drops into a fresh container with no memory.

**Solutions:**
- Maintain extensive READMEs updated frequently
- Keep `PROGRESS.md` with current status, next steps
- Document failed approaches so agents don't repeat them
- Use `lessons.md` for persistent learnings

---

## Test Design for Autonomous Agents

**Critical insight:** "Claude will solve whatever problem the tests define. If tests are wrong, Claude solves the wrong problem."

### Requirements for Good Tests
1. **Nearly perfect verifier** — false positives send Claude down wrong paths
2. **Fast feedback** — slow tests waste tokens and time
3. **Independent failures** — each failing test should be fixable independently
4. **Regression prevention** — CI that blocks commits breaking existing code

### Watching for Failure Modes
As you observe Claude making mistakes, design new tests that catch those patterns. The test suite evolves with the project.

---

## Parallelism Strategies

### Easy Case: Independent Tasks
Many distinct failing tests → each agent picks a different one.

```
Agent A: fix test_parse_int
Agent B: fix test_codegen_loop  
Agent C: fix test_arm_backend
```

### Hard Case: Monolithic Task
One giant task (e.g., "compile the Linux kernel") → all agents hit same bug, overwrite each other.

**Solution: Oracle-Based Division**

Use a known-good reference to divide work:

```python
# Randomly compile most files with GCC (known-good)
# Only compile subset with Claude's compiler
# If kernel works → bug not in Claude's subset
# If kernel breaks → binary search to isolate

for file in kernel_files:
    if random() < 0.9:
        compile_with_gcc(file)
    else:
        compile_with_claude(file)
```

Each agent works on different random subsets, isolating different bugs in parallel.

---

## Specialized Agent Roles

Don't have all agents do the same thing. Specialize:

| Role | Responsibility |
|------|----------------|
| **Feature agents** | Implement new functionality, fix failing tests |
| **Code quality agent** | Coalesce duplicate code, refactor |
| **Performance agent** | Optimize for speed |
| **Output quality agent** | Improve generated artifacts |
| **Design critic** | Structural improvements, architecture review |
| **Documentation agent** | Keep docs current, update READMEs |

**Implementation:** Different `AGENT_PROMPT.md` per role, or role instructions in shared prompt.

---

## Project Structure

```
project/
├── AGENT_PROMPT.md           # Instructions for all agents
├── PROGRESS.md               # Current status, updated by agents
├── lessons.md                # Failed approaches, learnings
├── current_tasks/            # Task locks (git-coordinated)
│   └── *.txt
├── agent_logs/               # Session logs per commit
│   └── agent_*.log
├── src/                      # Actual code
└── tests/
    ├── run_tests.sh          # Fast test runner with --fast flag
    └── test_*.c
```

---

## Cost & Scale Reference

From the C compiler project:
- **Agents:** 16 parallel
- **Sessions:** ~2000 Claude Code sessions
- **Duration:** ~2 weeks
- **Tokens:** 2B input, 140M output
- **Cost:** ~$20,000
- **Output:** 100K lines of Rust

---

## Adversarial Review Round

Source: [@Voxyz_ai](https://x.com/Voxyz_ai/status/2028090618681991413) — "The Hidden Layer in OpenClaw Swarms"

### The Problem: Groupthink

When you spawn parallel agents and merge their outputs, you get **unanimous agreement**, not validated conclusions. Each agent works blind to the others — nobody challenges anyone's assumptions.

This is groupthink. 4 specialists, 4 reports, 0 dissent. Looks bulletproof. Isn't.

### The Fix: Three-Phase Pipeline

```
Phase 1: Independent Analysis
    4-6 specialists work in parallel, blind to each other
            ↓
Phase 2: Cross-Examination (NEW)
    2-3 reviewers read specialist reports
    Each MUST find problems (hardcoded requirement)
            ↓
Phase 3: Judgment
    Synthesizer rules on each conclusion:
    retain | needs more evidence | overturn
```

### Phase 2 Details: The Adversarial Round

After all specialist reports come back, spawn **reviewer agents**. Each gets 2-3 specialist outputs. Their job: find problems.

**Critical design choice:** Hardcode the output contract. Don't say "review this." Say:

```
[OUTPUT_CONTRACT]
1) TOP 3 OPPOSING ARGUMENTS
2) OVERESTIMATED FACTORS (2 items)
3) UNDERESTIMATED FACTOR (1 item)
4) CONTRADICTIONS between specialist outputs
5) REMAINING BLIND SPOTS
6) Review Confidence (0-5)
7) DECISION SIGNAL: proceed | proceed_with_caution | block
```

Why hardcode? Because "please review this" produces polite agreement. Forcing "you MUST find 3 problems" makes the reviewer actually dig.

### Reviewer Assignment

- Activate when ≥3 specialists (too few and cross-examination doesn't help)
- Use rotation: each reviewer gets 2-3 reports, every report seen by ≥1 reviewer
- With ≥4 specialists, add a **global skeptic** that reads ALL reports and looks for cross-report contradictions

### Phase 3: Judgment

The synthesizer gets both stacks — specialist reports AND reviewer challenges — and rules on each conclusion:

| Ruling | Meaning |
|--------|---------|
| **Retain** | Challenged and held up |
| **Needs more evidence** | Challenge has merit, needs data |
| **Overturn** | Challenge undermines the foundation |

### Implementation in Our Stack

When using `sessions_spawn` for parallel research/analysis:

1. Spawn specialist sub-agents as normal
2. When all complete, spawn 1-2 reviewer sub-agents with the specialist outputs
3. Spawn a final synthesizer with both specialist + reviewer outputs
4. Report the synthesized result, noting which conclusions survived challenge

### When to Use

- **Strategic decisions** (product direction, architecture choices) — always
- **Research synthesis** (market analysis, competitor review) — always
- **Simple parallel tasks** (implement feature A and B) — skip, not needed
- **Rule of thumb:** If the output will influence a decision, add the adversarial round

### The Real Difference

Before: "4 experts agreed, so it must be right."
After: "4 experts agreed, 2 reviewers tried to break it, it held up. Confidence: 3/5, with these caveats..."

Two extra minutes. In return: an answer that knows where its own boundaries are.

---

## Limitations Observed

Even with this setup, Opus 4.6 hit ceilings:
- New features frequently broke existing functionality
- Some specialized tasks (16-bit x86) remained unsolved
- Code quality "reasonable but not expert-level"
- Generated output less efficient than baseline tools

**Takeaway:** Agent teams extend what's possible, but there are still hard limits. Design for graceful degradation.

---

## See Also
- [Claude's C Compiler repo](https://github.com/anthropics/claudes-c-compiler)
- [GCC Torture Test Suite](https://gcc.gnu.org/onlinedocs/gccint/Torture-Tests.html)
