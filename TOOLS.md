# TOOLS.md — Roam's Operational Notes

## Infrastructure
- **Workspace:** ~/roam
- **Repo:** git@github.com:apfong/roam.git
- **Sibling workspace:** ~/clawd (Pip's workspace)
- **Shared toolkit:** ~/agent-orchestration-toolkit

## Discord Command Center
- Server: TBD (waiting on bot token)
- Channels: #general, #daily-report, #support, #dev-log, #bugs, #twitter-drafts, #blog, #sales, #finances

## Revenue Stack
- **Payments:** Stripe (verify account with Alex)
- **Products:** DemandProof integration (~/demandproof if exists)
- **Storefront:** Own site + ClawMart (later)

## Cron Jobs
- **2:00 AM ET** — Nightly self-improvement (primary)
- **3:00 AM ET** — Nightly self-improvement (backup)
- More to be added as operations scale

## Cost Tracking
Track in `finances/costs.md`:
- Claude API tokens (via OpenClaw)
- Hosting (currently Alex's machine — $0)
- Tool subscriptions
- Any paid APIs

## Sub-Agents
Prefer separate OpenClaw instances over sessions_spawn for durability.
Use Codex (gpt-5.3-codex) for coding tasks via codex-agent.sh.
