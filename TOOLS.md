# TOOLS.md — Roam's Operational Notes

## Infrastructure
- **Workspace:** ~/roam
- **Repo:** git@github.com:apfong/roam.git
- **Sibling workspace:** ~/clawd (Pip's workspace)
- **Shared toolkit:** ~/agent-orchestration-toolkit

## Discord Command Center
- **Server (Guild) ID:** 1478778032465510502
- **Bot:** @Roam (App ID: 1478778334824501339)

### Channel IDs
| Channel | ID | Category |
|---------|-----|----------|
| #general | 1478778034243768353 | Text Channels |
| #daily-report | 1478784648745189468 | 🧭 Operations |
| #support | 1478784650275983612 | 🧭 Operations |
| #decisions | 1478784652075335790 | 🧭 Operations |
| #sales | 1478784695515873300 | 💰 Revenue |
| #finances | 1478784697097257033 | 💰 Revenue |
| #dev-log | 1478784698288308256 | 🛠 Development |
| #bugs | 1478784699047350313 | 🛠 Development |
| #twitter-drafts | 1478784700192526357 | 📢 Content |
| #blog | 1478784701878632632 | 📢 Content |
| #resources | 1478787395485827203 | 📋 Product |
| #product | 1478787396387606702 | 📋 Product |
| #customers | 1478787397541036052 | 📋 Product |
| #tasks | 1478789518713819340 | 📋 Product |
| #dp-iteration | 1478792464025391254 | 🔬 DemandProof |
| #vc-general | 1478976822824796241 | ✅ Vibe Check |
| #vc-dev-log | 1478976824552722444 | ✅ Vibe Check |
| #vc-ideas | 1478976825597231134 | ✅ Vibe Check |
| #vc-bugs | 1478976826280775862 | ✅ Vibe Check |
| #sift-general | 1478976833600094208 | 📊 Sift |
| #sift-dev-log | 1478976834392821871 | 📊 Sift |
| #sift-bugs | 1478976835000996042 | 📊 Sift |
| #dp-validation-runs | 1478792464642080810 | 🔬 DemandProof |
| #dp-bugs | 1478792465757507595 | 🔬 DemandProof |

### Approval Workflow
- Post decisions/drafts to appropriate channel
- Alex reacts ✅ = approved, ❌ = revise
- Never take irreversible action without approval in #decisions

## Company
- **Name:** Oddly Useful
- **Domain:** oddlyuseful.io
- **Structure:** Sole proprietor (DBA pending)
- **Vision:** Umbrella brand for small, useful SMB tools

## Revenue Stack
- **Payments:** Stripe (test mode — activation pending)
  - Secret key: `~/.config/stripe/secret_key`
  - Publishable key: `~/.config/stripe/publishable_key`
  - From clm-lite project (account: 51SuQw4F4PxuoL4k8)
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
