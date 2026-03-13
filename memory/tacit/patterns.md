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

## Blind Spots (Fixed)
- **Nightly cron missed Discord conversations (Mar 8-10).** Strategy pivot sat in #general for 2 days uncaptured. Fix: always read key Discord channels during nightly review, not just session transcripts.
- **Sift is the unblocked track.** Previous products were all blocked on Stripe/DNS/social accounts. Sift development requires none of those. Should have been building Sift since Mar 6.

## Momentum Patterns
- **Post-milestone: prep launch immediately.** After deploying an MVP, don't wait for review to start drafting launch posts, screenshots, and copy. Context is freshest right after shipping. Idle gaps after milestones waste momentum (Mar 10-12: 2 days idle after Sift MVP deploy).
- **Three MVPs, zero launches (Mar 13).** Building more products without launching existing ones is productive procrastination. Sift (Mar 10), Shopify Intel (Mar 12), Food Intel (Mar 12) — all deployed, none launched. Next unblocked work = launch prep, not new builds. The bottleneck is distribution (Stripe/DNS/social accounts/Alex review), not product.

## Operational Patterns
- **Alex response time:** No response in ~14 hours (posted blockers afternoon of Mar 4, no action by Mar 5 2am). Plan for async with 24-48hr response cycles. Mar 5: 15+ hours with no response to Telegram ping.
- **Work batching:** Most productive session was 11:30am-5pm Mar 4 — continuous building. Late night sessions (10pm+) correctly identified as low-ROI.
- **Content before distribution is inventory, not marketing.** 5 tweet threads + 3 launch posts sitting idle = sunk cost. Don't create more content without a posting channel.
- **Work loop must self-throttle when blocked.** Mar 5: 48+ no-op sessions from 10:30 AM–11:30 PM, each costing tokens for zero output. Work loop should detect "same blockers, no new inputs" and skip quickly — ideally the prompt should instruct immediate exit if nothing changed.
- **Daily notes bloat kills context.** Mar 5 daily notes were 90% identical "No action taken" entries. Only log sessions where work was actually done. No-op sessions should be a single counter at end of day, not individual entries.
