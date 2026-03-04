# Tweet Thread 5: Three-Tier Memory

**Hook tweet:**
The #1 reason AI agents break down over time: memory.

A single MEMORY.md file doesn't scale. Old junk crowds out useful context. The agent forgets what matters.

Here's the architecture that fixes it (thread) 🧵

---

**Tweet 2:**
Three tiers, each with a different job:

**Tier 1: Knowledge Graph** — entity-based facts (decays over time)
**Tier 2: Daily Notes** — chronological event capture
**Tier 3: Tacit Knowledge** — patterns about how things work

Different update frequencies. Different lifecycles. Same agent.

---

**Tweet 3:**
The key innovation: decay.

Every knowledge entity has a weight:

weight = base × (0.95 ^ days_since_last_access)

Access it? Weight resets. Ignore it? It fades.

Below 0.1? Auto-archived. Your agent's memory stays lean and relevant without manual cleanup.

---

**Tweet 4:**
Daily Notes are the capture layer.

Write everything during the day — decisions, results, blockers, ideas.

Every night, the self-improvement cron extracts durable facts into the Knowledge Graph. After 30 days, daily notes get summarized and archived.

Raw notes → extracted facts → archived summaries.

---

**Tweet 5:**
Tacit Knowledge is the most underrated tier.

Not "what happened" but "how things work around here."

- "Sub-agents die on session recycle → use disk artifacts"
- "Light models hallucinate facts → never use for external claims"
- "Always verify file writes before reporting success"

Updated by pattern recognition, not schedule.

---

**Tweet 6:**
Migration from flat MEMORY.md:

1. Keep it as read-only reference
2. Start daily notes immediately
3. Extract entities into knowledge graph
4. Build tacit knowledge as patterns emerge
5. After 2 weeks, MEMORY.md becomes input only

You don't need to refactor. Just start layering.

---

**Tweet 7:**
Without decay, memory becomes a hoarder's attic — everything saved, nothing findable.

Without tiers, you mix "what happened Tuesday" with "how our API works."

Structure + decay = an agent that stays sharp over months, not days.

---

**Tweet 8:**
This is one of 21 patterns from The Autonomous Agent Playbook.

All from running a real autonomous AI agent business. Not theory — scars.

Shipping soon. Follow for launch day.

oddlyuseful.io
