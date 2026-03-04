# Cron-as-Code Pattern

## Overview

Store cron job definitions in a YAML file in git, rather than configuring them directly on the host. This makes cron jobs auditable, versionable, and reproducible.

## Format

```yaml
# crons.yaml
jobs:
  - name: market-monitor
    schedule: "0 8,12,16,20 * * 1-5"
    timezone: America/New_York
    command: python3 scripts/insider_scanner.py
    smoke_test: python3 scripts/insider_scanner.py --dry-run
    description: "Check RSS, SEC, Reddit for market signals"

  - name: daily-smoke-test
    schedule: "0 6 * * *"
    command: bash tests/smoke_test.sh
    description: "Run all smoke tests, alert on failures"

  - name: ai-workflow-intel
    schedule: "0 8 * * *"
    timezone: America/New_York
    command: python3 scripts/collector.py
    smoke_test: python3 scripts/collector.py --dry-run
    description: "AI tooling updates for practitioners"
```

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Unique job identifier |
| `schedule` | yes | Cron expression (5-field) |
| `command` | yes | Shell command to run |
| `timezone` | no | IANA timezone (default: system) |
| `smoke_test` | no | Command to validate job works (--dry-run) |
| `description` | no | Human-readable description |
| `enabled` | no | Boolean, default true |
| `workdir` | no | Working directory for the command |

## Tooling

### `lib/self-healing/cron_manifest.py`

```bash
# Show what's declared in crons.yaml
python3 cron_manifest.py show crons.yaml

# Diff declared vs live crons
python3 cron_manifest.py diff crons.yaml

# Sync: apply crons.yaml to live system
python3 cron_manifest.py sync crons.yaml

# Run all smoke tests for declared jobs
python3 cron_manifest.py smoke crons.yaml
```

## Benefits

1. **Auditable:** Git blame shows who added/changed each job and when
2. **Reproducible:** New environments get the same cron setup
3. **Testable:** Each job has an optional smoke_test command
4. **Documentable:** Description field explains intent
5. **Diffable:** `cron_manifest.py diff` catches drift between declared and actual

## Integration with Self-Healing

The smoke test framework (`smoke_runner.sh`) can read `crons.yaml` and run each job's `smoke_test` command as part of the daily health check. If a smoke test fails, the auto-correction loop kicks in.
