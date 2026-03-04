# Pattern: Three-Tier Memory with Decay

## Problem
Flat-file memory (single MEMORY.md) doesn't scale. Old info crowds out recent context. No way to distinguish durable knowledge from transient notes.

## Solution
Three specialized memory layers with automatic decay and promotion.

## Layer 1: Knowledge Graph
**What:** Entity-based facts organized by PARA (Projects, Areas, Resources, Archives)
**Format:** JSON files with metadata
**Decay:** `weight = base_weight * (0.95 ^ days_since_last_access)`
**Maintenance:** Nightly recalculation, auto-archive at weight < 0.1

```json
{
  "id": "uuid",
  "type": "project",
  "title": "Descriptive name",
  "content": "The actual knowledge",
  "tags": ["relevant", "tags"],
  "created": "ISO-8601",
  "lastAccessed": "ISO-8601",
  "accessCount": 0,
  "decayWeight": 1.0,
  "connections": ["related-entity-ids"]
}
```

## Layer 2: Daily Notes
**What:** Chronological capture of events and decisions
**Format:** `YYYY-MM-DD.md` markdown files
**Lifecycle:** Write daily → extract facts nightly → summarize + archive at 30 days

## Layer 3: Tacit Knowledge
**What:** Patterns about how things work (not what happened)
**Format:** Thematic markdown files (preferences.md, patterns.md, etc.)
**Update trigger:** Pattern recognition, not schedule

## Maintenance Crons

### Nightly (2am)
1. Recalculate all decay weights
2. Extract facts from today's daily notes → knowledge graph
3. Check for new tacit patterns from session review
4. Archive decayed entities
5. Generate modification changelog

### Weekly
1. Summarize daily notes older than 30 days
2. Audit tacit knowledge for accuracy
3. Deduplicate knowledge graph

## Migration from Flat Memory
1. Keep existing MEMORY.md as read-only reference
2. Extract entities into knowledge graph
3. Start writing daily notes immediately
4. Build tacit knowledge file as patterns emerge
5. After 2 weeks, MEMORY.md becomes Layer 3 input only

## Key Insight
The decay mechanism is crucial. Without it, memory becomes a hoarder's attic — everything saved, nothing findable. Decay ensures that frequently-accessed knowledge stays prominent while stale info fades naturally. Accessing an entity resets its weight, so important-but-infrequent knowledge survives when you actually use it.
