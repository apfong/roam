# Context Management

How to manage the growing context window in agent systems — the difference between agents that work reliably and ones that fall apart on complex tasks.

## The Problem

Every agent turn adds to the conversation:
- User messages
- Tool calls + results
- Assistant responses
- Reasoning traces

Context grows without bound. Models have finite context windows. Something has to give.

## Strategies

### 1. Append-Only (Codex Approach)

**How:** Never rearrange history. Every new prompt = old prompt + new content at the end.

```
Turn 1: [system][tools][instructions][msg1]
Turn 2: [system][tools][instructions][msg1][tools1][result1][asst1][msg2]
Turn 3: ...+[tools2][result2][asst2][msg3]
```

**Pros:**
- Prompt caching works (exact prefix match → reuse prior computation)
- Simple, predictable
- Stateless (any request is self-contained)

**Cons:**
- Data transfer grows quadratically
- Eventually hits context window limit

**When to use:** Default choice. Works well for focused tasks that complete within context budget.

### 2. Summarize-and-Compact

**How:** When context approaches the limit, summarize older turns into a condensed form.

```
Before: [system][tools][instructions][turn1..turn50][new_msg]
After:  [system][tools][instructions][summary_of_1-45][turn46..50][new_msg]
```

**Pros:**
- Keeps context within budget
- Preserves key information
- Enables longer conversations

**Cons:**
- Lossy — details can be lost in summarization
- Breaks prompt caching (prefix changes after compaction)
- Summary quality depends on the model

**When to use:** Long-running sessions, conversational agents, ongoing projects.

### 3. Selective Context Loading

**How:** Only include context relevant to the current task. Use retrieval (search, embeddings) to find relevant prior context.

```
[system][tools][instructions][retrieved_relevant_context][new_msg]
```

**Pros:**
- Efficient use of context window
- Scales to very long histories
- Most relevant info always present

**Cons:**
- Retrieval can miss important context
- More complex to implement
- Requires embedding/indexing infrastructure

**When to use:** Multi-session agents, knowledge-intensive tasks, domain specialists.

### 4. Hierarchical Context (For Multi-Agent)

**How:** Each agent level manages its own context:

```
Orchestrator context:
  [goal][task_list][specialist_summaries][current_step]

Specialist context:
  [delegation][task_specific_tools][task_history][current_work]
```

**Pros:**
- Each agent has focused, relevant context
- Avoids polluting specialist context with orchestrator details
- Scales to many specialists

**Cons:**
- Information loss at boundaries
- Orchestrator must summarize specialist output well

**When to use:** Our toolkit's default approach for multi-agent workflows.

## Context Budget Planning

### Token Allocation

For a 200K context window:

| Component | Budget | Notes |
|-----------|--------|-------|
| System prompt | ~2K | Fixed overhead |
| Tools/functions | ~3K | Grows with tool count |
| Instructions | ~5K | AGENTS.md, configs |
| Conversation history | ~150K | The growing part |
| Output reserve | ~30K | Space for model's response |
| Safety margin | ~10K | Buffer |

### Warning Signs

- 🟡 **>50% used:** Start monitoring growth rate
- 🟠 **>75% used:** Consider compaction
- 🔴 **>90% used:** Compact now or risk truncation

### Per-Agent Budgets

In multi-agent systems, each specialist gets a fraction:

```
Orchestrator: 50K (needs overview of everything)
Researcher:   30K (deep on one topic at a time)
Coder:        50K (needs code context + instructions)
Critic:       30K (focused review scope)
```

## Delegation Context Protocol

When the orchestrator delegates to a specialist, what context to pass:

### Always Include
- Clear task description
- Relevant constraints
- Expected output format
- Available tools

### Include If Relevant
- Prior findings from other specialists
- User preferences/requirements
- Domain context

### Never Include
- Other specialists' full conversation history
- Orchestrator's internal reasoning
- Unrelated prior tasks

### Template
```
DELEGATION CONTEXT:
  Task: [specific objective]
  Background: [relevant prior findings, 1-2 paragraphs max]
  Constraints: [scope, time, quality bar]
  Tools: [available tools for this task]
  Output: [expected format and deliverables]
```

## Caching Optimization

### Why It Matters

Without caching, every turn re-processes the entire history. For a 100-turn conversation:
- **Uncached:** Process 100 + 99 + 98 + ... = ~5000 units of work (quadratic)
- **Cached:** Process 100 + 1 + 1 + ... = ~200 units of work (linear)

### How to Maximize Cache Hits

1. **Keep prefix stable** — don't rearrange system prompt, tools, or instructions
2. **Append only** — new content always at the end
3. **Avoid dynamic system prompts** — changing system text invalidates cache
4. **Batch tool results** — append multiple results in sequence rather than interleaving

### When Cache Breaks

- System prompt changes → full reprocess
- Tool definitions change → full reprocess
- Context compaction → full reprocess (new prefix)
- Model switch → different cache

## References

- [OpenAI: Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching)
- [OpenAI: Unrolling the Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [Anthropic: Prompt Caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
