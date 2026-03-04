# Tweet Thread 3: Safe Looping

**Hook tweet:**
The #1 way people blow their API budget with AI agents:

Autonomous loops without guardrails.

Agent hits an error → retries → hits the same error → retries → $200 later you notice.

Here's the Safe Looping pattern 🧵

---

**Tweet 2:**
Every autonomous loop needs 4 controls:

1. **Iteration cap** — hard limit on loop count
2. **Cost ceiling** — kill the loop at $X spent
3. **Progress detection** — is the agent making progress or spinning?
4. **Escalation path** — when stuck, alert a human instead of retrying

---

**Tweet 3:**
Progress detection is the key insight.

After each iteration, compare output to the previous iteration:
- New test passing? Progress.
- Same error, different approach? Progress.
- Identical error, identical approach? Spinning. Kill it.

Simple diff-based check saves hundreds of dollars.

---

**Tweet 4:**
Budget guardrails in practice:

```
loop_count=0
max_loops=10
while [ $loop_count -lt $max_loops ]; do
    run_agent
    if tests_pass; then break; fi
    if no_progress; then escalate; break; fi
    loop_count=$((loop_count + 1))
done
```

10 iterations max. Progress check each round. Escalate on spin.

---

**Tweet 5:**
The "gentle degradation" pattern:

- Iteration 1-3: Full autonomy, agent tries to fix
- Iteration 4-6: Reduced scope, simpler fix attempts
- Iteration 7-9: Gather diagnostics only
- Iteration 10: Package everything for human review

Each phase has a different strategy. Don't just retry the same thing 10 times.

---

**Tweet 6:**
Real numbers from production:

Without safe looping: agents occasionally burned $50-100 on stuck loops
With safe looping: worst case is ~$5 before escalation

That's a 10-20x cost reduction on failure cases. And failures happen daily in production.

---

**Tweet 7:**
This is one of 21 patterns in The Autonomous Agent Playbook.

Every pattern solves a real production problem. No theory — just what works.

Shipping soon at oddlyuseful.io. Follow for more patterns.
