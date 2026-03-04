# Memory Architecture — Three-Tier System

## Overview

Memory is organized in three layers, inspired by Felix's production system but adapted for our needs.

## Layer 1: Knowledge Graph (`memory/knowledge-graph/`)

Entity-based storage using PARA method:
- `projects/` — Active initiatives with deadlines and deliverables
- `areas/` — Ongoing responsibilities (revenue, customers, infrastructure)
- `resources/` — Reference material (API docs, competitor intel, market research)
- `archives/` — Completed/deprecated items

Each entity is a JSON file:
```json
{
  "id": "entity-uuid",
  "type": "project|area|resource|archive",
  "title": "Human-readable name",
  "content": "The actual knowledge",
  "tags": ["tag1", "tag2"],
  "created": "2026-03-04T00:00:00Z",
  "lastAccessed": "2026-03-04T00:00:00Z",
  "accessCount": 5,
  "decayWeight": 1.0,
  "connections": ["other-entity-id"]
}
```

**Decay formula:** `weight = base_weight * (0.95 ^ days_since_last_access)`
- Entities below 0.1 weight move to archives automatically
- Accessing an entity resets its weight to 1.0
- Nightly job recalculates all weights

## Layer 2: Daily Notes (`memory/daily/`)

Chronological timeline — `YYYY-MM-DD.md` files.
- Raw capture of what happened each day
- Write-heavy, read-selectively
- Nightly job extracts durable facts → promotes to knowledge graph
- Files older than 30 days get summarized and archived

## Layer 3: Tacit Knowledge (`memory/tacit/`)

Patterns about HOW things work, not WHAT happened:
- `preferences.md` — Alex's preferences, approval patterns
- `patterns.md` — What works, what doesn't (learned from experience)
- `customers.md` — Customer behavior patterns
- `operations.md` — Operational insights (best times to post, etc.)

Tacit knowledge is the hardest to capture and most valuable. Update it whenever you notice a pattern repeating.

## Maintenance Cycle

**Nightly (2am ET):**
1. Recalculate decay weights on all knowledge graph entities
2. Extract facts from today's daily notes → create/update knowledge graph entities
3. Review session transcripts for tacit knowledge patterns
4. Archive decayed entities (weight < 0.1)
5. Generate changelog of all memory modifications

**Weekly:**
1. Summarize and archive daily notes older than 30 days
2. Review tacit knowledge for accuracy
3. Prune duplicate/contradictory knowledge graph entries
