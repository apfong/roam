# ChatDev 2.0 YAML Workflow Patterns

Source: https://github.com/OpenBMB/ChatDev (cloned to `chatdev-2.0/`)

## Core Schema

```yaml
version: 0.4.0
vars:
  MODEL_NAME: gpt-4o
  API_KEY: ${API_KEY}  # env var substitution
  
graph:
  id: workflow_name
  description: What this workflow does
  log_level: DEBUG|INFO
  is_majority_voting: false
  initial_instruction: Optional user-facing prompt
  start: [node_ids...]  # entry points (can be multiple for parallel start)
  end: [node_ids...]    # terminal nodes
  nodes: [...]
  edges: [...]
  memory: []  # optional memory configs
```

## Node Types

### 1. Agent Node (LLM call)
```yaml
- id: Planner
  type: agent
  context_window: 20  # how many messages to keep (-1 = all, 0 = none)
  config:
    provider: openai|gemini|anthropic
    name: gpt-4o
    base_url: ${BASE_URL}
    api_key: ${API_KEY}
    role: |
      System prompt goes here...
    params:
      temperature: 0.1
      max_tokens: 4000
    tooling:
      - type: function
        config:
          tools:
            - name: web_search
            - name: deep_research:All  # tool groups
          timeout: null
    thinking: null  # for o1-style reasoning
    memories: []
    retry: null
```

### 2. Literal Node (static content)
```yaml
- id: UserPrompt
  type: literal
  config:
    content: "Please plan what to eat in Shanghai"
    role: user|assistant
```

### 3. Passthrough Node (aggregation/routing)
```yaml
- id: Aggregator
  type: passthrough
  config:
    only_last_message: false  # true = only forward last msg
```

### 4. Subgraph Node (nesting)
```yaml
- id: ReActLoop
  type: subgraph
  config:
    type: file
    config:
      path: "subgraphs/react_agent.yaml"
      
# Or inline:
- id: InlineCritic
  type: subgraph
  config:
    type: config
    config:
      id: critic_graph
      nodes: [...]
      edges: [...]
```

### 5. Loop Counter Node
```yaml
- id: LoopGate
  type: loop_counter
  config:
    max_iterations: 3
    reset_on_emit: true
    message: "Loop finished after three passes"
```

## Edge Configuration

```yaml
edges:
  - from: NodeA
    to: NodeB
    trigger: true          # whether this edge activates NodeB
    condition: 'true'      # or condition object below
    carry_data: true       # pass messages along
    keep_message: false    # retain in context
    clear_context: false   # reset node's context
    process: null          # optional transform
    dynamic: null          # for fan-out (see below)
```

### Conditional Routing (keyword-based)
```yaml
condition:
  type: keyword
  config:
    any:
      - "ROUTE: Planner"
      - "FINISHED"
    none: []
    regex: []
    case_sensitive: true
```

## Dynamic Execution (Fan-Out/Fan-In)

### Map Pattern (parallel execution per item)
```yaml
dynamic:
  type: map
  split:
    type: regex
    config:
      pattern: "<Query>:\\s*(.*)"  # extract each query
  config:
    max_parallel: 3
```

### Tree Pattern (hierarchical aggregation)
```yaml
dynamic:
  type: tree
  split:
    type: message
  config:
    group_size: 2      # aggregate in pairs
    max_parallel: 10
```

---

## Pattern Library

### 1. Deep Research (Iterative Chapter Writing)

**Flow:** START → Demand Analyst → Planner → Executor (subgraph) → Report Writer → Quality Reviewer → (loop back or finish) → Structure Organizer

**Key insights:**
- Planner decides next chapter, generates search queries
- Executor fans out queries in parallel (dynamic map)
- Writer synthesizes facts into prose with citations
- Reviewer routes back to Writer (fix) or Planner (next chapter)
- Keyword-based routing: `ROUTE: Planner` vs `ROUTE: Report Writer`

**Pattern:** Incremental refinement with quality gate loop

### 2. ReAct Agent

**Flow:** Task Normalizer → ReAct Subgraph (loop) → Final QA Editor

**Key insights:**
- Normalizer structures user intent as JSON
- Subgraph handles Thought→Action→Observation loop internally
- QA Editor checks if output meets constraints
- If "TODO" found in output, routes back to subgraph

**Pattern:** Preprocessing + iterative reasoning + post-validation

### 3. Loop Counter (Fixed Iterations)

**Flow:** Writer ↔ Critic ↔ Loop Gate → Finalizer

**Key insights:**
- Simple revision loop with hard cutoff
- Loop Gate counts entries, emits only on Nth pass
- No LLM needed for loop control

**Pattern:** Bounded iteration for revision tasks

### 4. Dynamic Fan-Out/Tree Aggregation

**Flow:** Multiple start nodes → Passthrough → Agent (map) → Agent (tree) → END

**Key insights:**
- Multiple `start` nodes fire in parallel
- Passthrough collects all inputs
- Map node processes each message in parallel
- Tree node aggregates results hierarchically (groups of N)

**Pattern:** Scatter-gather with hierarchical reduce

### 5. MACNet (DAG with Shared Context)

**Flow:** USER → Node(-1) → Node(0) → [Node(1), Node(2), Node(3)] → Node(-2) → END

**Key insights:**
- Diamond topology: one-to-many then many-to-one
- Each node is a subgraph (can be arbitrarily complex)
- Non-trigger edges (`trigger: false`) provide context without activation
- Process functions can run code on edge transitions

**Pattern:** Complex DAG with fan-out/fan-in and code execution

### 6. Reflexion Loop (Self-Critique)

**Flow:** Intake → Research → Reflexion Subgraph → Client QA

**Key insights:**
- Reflexion subgraph handles actor/critic loop internally
- Outer graph handles input normalization and output formatting
- Context flows forward to final editor for reference

**Pattern:** Nested self-improvement loop

---

## Implementation Notes

### Context Management
- `context_window: -1` = keep all messages (expensive)
- `context_window: 0` = stateless (cheapest)
- `context_window: N` = rolling window of N messages

### Tool Integration
- Tools defined in `functions/` directory as Python
- Group syntax: `tool_group:All` or `tool_group:specific_tool`
- MCP support via `demo_mcp.yaml`

### Execution
```bash
# Backend
uv run python server_main.py --port 6400

# Frontend  
cd frontend && VITE_API_BASE_URL=http://localhost:6400 npm run dev

# SDK (programmatic)
from runtime.sdk import run_workflow
result = run_workflow(yaml_file="...", task_prompt="...", attachments=[])
```

---

## Cost Considerations

Multi-agent = more API calls. Mitigations:
1. Use `context_window: 0` for stateless nodes
2. Use smaller models for routing/normalization (gpt-4o-mini)
3. Limit `max_parallel` to avoid burst costs
4. Use `loop_counter` to bound iteration loops
5. Consider their "puppeteer" approach (RL-based dynamic agent selection) for production

---

## See Also
- `yaml_instance/` - all example workflows
- `docs/user_guide/en/workflow_authoring.md` - official docs
- MacNet paper: https://arxiv.org/abs/2406.07155
- Puppeteer paper: https://arxiv.org/abs/2505.19591
