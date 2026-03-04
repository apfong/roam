# Harness Engineering

How to systematically improve your AI agent's effectiveness over time.

Source: [Mitchell Hashimoto - My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)

## Core Principle

> "Every agent mistake → new test or AGENTS.md fix"

The agent harness (prompts, rules, tests, tools) is as important as the code. Engineer it like production software.

## The Feedback Loop

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

## The Six-Step Progression

Mitchell's journey from skeptic to power user:

### 1. Drop the Chatbot Mindset
Stop treating AI as a Q&A chatbot. Use **agents** that can take action.

**Before:** Ask Claude a question, copy-paste the answer
**After:** Give Claude a task, let it edit files directly

### 2. Reproduce Your Own Work
Do tasks manually AND with the agent. Compare results. Learn the edges.

```
Task: Add error handling to this function

Manual: Takes 10 minutes, handles 5 edge cases
Agent: Takes 2 minutes, handles 3 edge cases

→ Learn which edge cases agent misses
→ Add to CLAUDE.md: "Always handle: [those edge cases]"
```

### 3. End-of-Day Agents
Before signing off, kick off long-running agent tasks:
- Research for tomorrow's work
- Triage issues/PRs
- Run analysis that needs time

**Why:** Agent works while you don't. Review results next morning.

### 4. Outsource Slam Dunks
Identify high-confidence tasks agent handles well. Let it do those in background.

```markdown
## Slam Dunks (agent handles autonomously)
- Test file generation
- Documentation updates
- Simple bug fixes with clear repro
- Dependency updates with passing tests
- Code formatting/linting fixes
```

### 5. Engineer the Harness
Every mistake becomes improvement:

| Mistake Type | Harness Fix |
|-------------|-------------|
| Style violation | Add to rules |
| Missed edge case | Add test |
| Wrong approach | Document in CLAUDE.md |
| Used wrong tool | Restrict tool access |
| Missed context | Improve skill/prompt |

**CLAUDE.md evolution:**
```markdown
# CLAUDE.md

## Lessons Learned (agent wrote these)
- Always check for null before accessing .length
- The payments module uses Stripe, not our internal billing
- Tests must pass before any PR is created
- When editing auth code, also update the auth tests
```

### 6. Always Have an Agent Running
Target: 10-20% of workday has an agent actively working.

**Pro tip:** Turn off desktop notifications. You control when to check on the agent, not the other way around.

## Implementation Checklist

### Weekly Harness Review
- [ ] Review agent mistakes from the week
- [ ] Update CLAUDE.md with new rules
- [ ] Add tests for failure cases
- [ ] Refine skills that performed poorly
- [ ] Document failed approaches (so agent doesn't repeat)

### Mistake Triage Template
```markdown
## Mistake: [what happened]
**Date:** YYYY-MM-DD
**Task:** [what agent was trying to do]
**Expected:** [what should have happened]
**Actual:** [what actually happened]
**Root cause:** [unclear prompt / missing context / wrong tool / etc.]
**Fix applied:** [what you changed in the harness]
```

### CLAUDE.md Structure for Harness Engineering
```markdown
# Project: [name]

## Context
[What this project is, key technologies]

## Rules (Always)
[Style, conventions, security]

## Learned Rules (From Mistakes)
- [Rule added after mistake 1]
- [Rule added after mistake 2]

## Failed Approaches (Don't Repeat)
- Tried X for Y, failed because Z
- Library A doesn't work with B

## Slam Dunks (Agent Handles Well)
- [Task type 1]
- [Task type 2]

## Needs Human (Agent Struggles)
- [Task type that needs oversight]
- [Task type that needs domain knowledge]
```

## Metrics to Track

- **Mistake rate:** How often does agent need correction?
- **Harness growth:** Lines added to CLAUDE.md per week
- **Slam dunk coverage:** % of tasks agent handles autonomously
- **Time to first useful output:** How long until agent produces something usable?

## "See Like an Agent" — Tool Design Principle

Source: [Thariq (@trq212)](https://x.com/trq212/status/2027463795355095314) — "Lessons from Building Claude Code"

The Claude Code team's core framework for designing agent tools:

### Shape Tools to Model Abilities

Imagine being given a difficult math problem. What tools would you want?
- Paper = minimum (limited by manual calculation)
- Calculator = better (but need to know the interface)
- Computer = most powerful (but need to know how to code)

**Design tools that match what the model is good at.** Not what's easiest to implement. Not what a human would want.

### How to Learn What Works

"You pay attention, read its outputs, experiment." There are no rigid rules. It depends on:
- The model you're using (different models need different tools)
- The goal of the agent
- The environment it operates in

### Lessons from Claude Code's Tool Evolution

**1. AskUserQuestion Tool (Elicitation)**
- Attempt 1: Added questions as parameter to ExitPlanTool → confused the model
- Attempt 2: Modified markdown output format for inline questions → unreliable formatting
- Attempt 3: Dedicated tool that triggers a UI modal → worked well, Claude liked calling it
- **Takeaway:** Even the best-designed tool doesn't work if the model doesn't understand how to call it

**2. TodoWrite → Task Tool (Capability Drift)**
- Original: TodoWrite tool + system reminders every 5 turns
- Problem: As models improved, reminders made Claude think it had to stick to the list rigidly
- Fix: Replaced with Task Tool — supports dependencies, shared updates across subagents, model can alter/delete
- **Takeaway:** Tools that worked for weaker models may constrain stronger ones. Revisit assumptions as capabilities change.

**3. RAG → Grep → Progressive Disclosure (Context Building)**
- V1: RAG vector database (fragile, needed indexing, context given TO Claude)
- V2: Grep tool (Claude builds its OWN context by searching)
- V3: Skills that reference other files recursively (nested search, progressive discovery)
- **Takeaway:** As models get smarter, let them build their own context instead of pre-computing it for them

### Progressive Disclosure Pattern

Add capabilities without adding tools:
- Skill files reference deeper context files
- Model reads skill → discovers references → reads those → discovers more
- Each layer only loads when needed (not upfront in system prompt)

**Example:** Instead of putting all Claude Code docs in the system prompt, Claude Code gives the model a link to its docs. When asked about itself, it loads the Guide subagent which has instructions on searching docs well.

**Rule:** Every line in your system prompt/CLAUDE.md should answer: "Would the agent make a mistake if this line wasn't here?" If no, cut it.

### Applying to Our Stack

1. When Codex or sub-agents struggle with a tool, ask: is the tool shaped wrong for the model?
2. Periodically audit AGENTS.md/CLAUDE.md — does every line prevent a real mistake?
3. Prefer progressive disclosure (reference files) over front-loading all context
4. When adding a capability, try adding a file/skill reference before adding a tool

---

## Anti-Patterns

❌ **Accepting mistakes without fixing harness** — same mistakes repeat
❌ **Blaming the model** — usually it's the harness
❌ **Fixing mistakes in code only** — should also fix in harness
❌ **Huge CLAUDE.md** — split into skills (see [skills-vs-rules.md](skills-vs-rules.md))

## Mental Model

Think of the harness as **institutional knowledge for your agent**.

Humans learn from mistakes and remember. Agents don't — unless you encode the learning in the harness.

Your job shifts from "doing the work" to "teaching the agent to do the work."

## See Also
- [patterns/safe-looping.md](safe-looping.md) — bounded agent execution
- [patterns/skills-vs-rules.md](skills-vs-rules.md) — when to use each
- [Mitchell's full post](https://mitchellh.com/writing/my-ai-adoption-journey)
