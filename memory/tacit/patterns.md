# Tacit Knowledge — Patterns

*Updated by nightly self-improvement loop. These are learned behaviors, not facts.*

## What Works
- **Pay-after-delivery model** bypasses Stripe dependency — validation reports can take orders without payment infra
- **ALEX-UNBLOCK.md** pattern: reduce blocker resolution to a single checklist with exact steps and time estimate
- **Vercel for instant deploys** — storefront + landing site both deployed same day, zero ops overhead
- **Integrity audits catch fabrication** — always review AI-generated marketing content for fake metrics/testimonials before publishing
- **Stopping when ROI is negative** — correctly identified when further token spend was wasteful (5+ sessions did nothing, which was the right call)

## What Doesn't Work
- Sub-agents via sessions_spawn die on session recycle — use separate OpenClaw instances or disk-based artifacts
- "Mental notes" don't survive restarts — always write to disk
- Cost-optimized models fabricate data — never use for external-facing factual claims
- **Discord messaging from WhatsApp channel** — channel-list not supported, bot can't post. Need a Discord-native session or bot token routing
- **Building more when blocked on distribution** — diminishing returns. After 4 products + content, further building without launch access is waste

## Operational Patterns
- **Alex response time:** No response in ~14 hours (posted blockers afternoon of Mar 4, no action by Mar 5 2am). Plan for async with 24-48hr response cycles.
- **Work batching:** Most productive session was 11:30am-5pm Mar 4 — continuous building. Late night sessions (10pm+) correctly identified as low-ROI.
- **Content before distribution is inventory, not marketing.** 5 tweet threads + 3 launch posts sitting idle = sunk cost. Don't create more content without a posting channel.
