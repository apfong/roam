# DemandProof — Product Audit

**Date:** 2026-03-04  
**Auditor:** Roam Product Audit Agent  

---

## 1. What Is DemandProof?

An AI-powered startup idea validation tool with 6 stages: **Signal → Spark → Reach → Discover → Prove → Score**. Users describe a startup idea, and the platform scrapes real data (Reddit, HackerNews, G2, Google Trends), generates landing pages, runs outreach, conducts AI voice interviews, tests prepayment via Stripe, and produces a composite validation score.

**Key differentiator:** Uses real data and real money signals, not just LLM opinions.

---

## 2. Codebase Overview

| Metric | Value |
|--------|-------|
| Total source files | ~350 .ts/.tsx files |
| Total lines of code | ~61,700 |
| Test files | 57 |
| Tests passing | 172 (per QA report) |
| Supabase migrations | 30 migration files |
| Build status | ✅ Compiles successfully |
| Framework | Next.js 16.1.6, React 19, TypeScript 5, Tailwind v4 |
| Database | Supabase (PostgreSQL + pgvector) |
| AI | OpenAI GPT-4o-mini + embeddings |
| Payments | Stripe |
| Background jobs | Inngest |
| Voice | Retell AI |
| Email | Resend |

**This is a substantial, real codebase — not a prototype.** 62K lines with 30 DB migrations, 57 test files, and comprehensive env setup.

---

## 3. What's Built (Working)

### ✅ Signal Stage (Core — Most Complete)
- **Reddit scraper** (889 lines) — Arctic Shift historical + old.reddit.com real-time, no API key needed
- **HackerNews scraper** (590 lines)
- **G2 scraper** (637 lines)
- **Google Trends** (300 lines)
- **Keyword extraction** (375 lines)
- **Competitor discovery** (677 lines)
- **AI analysis pipeline** (1,070 lines) — relevance scoring, pain extraction, WTP extraction, similarity dedup
- **Signal orchestrator** with event bus, progress tracking, cost tracking
- **Market sizing** signals (job postings, funding, app store proxies)
- **Competitive moat** analysis, trend velocity scoring
- Tests for all major components

### ✅ Spark Stage (Landing Pages)
- **Landing page assembler** with component registry (hero, CTA, features, social proof, footer)
- **4 themes:** midnight, clean, mono, cosmos
- **AI landing page generation** + critic/validator
- **Landing page preview** at `/lp/[slug]`
- **Vercel deployment** integration for standalone URLs
- **Stripe checkout** for landing page pre-orders
- **Media search** (Pexels, Unsplash)
- **A/B variant tracking**

### ✅ Reach Stage (Outreach)
- **ICP search** (ideal customer profile)
- **AI outreach message generation** (2 separate implementations)
- **Contact management** (add contacts, track company/domain/role)
- **Email sending** via Resend
- **Response tracking**

### ✅ Discover Stage (Interviews)
- **Retell AI voice integration** — dynamic agent creation
- **Interview scripts** generation (AI)
- **Interview insights** extraction
- **Manual interview notes** UI

### ✅ Prove Stage (Payments)
- **Stripe checkout** flow for pre-orders
- **Payment tracking** in Supabase
- **Test page** at `/test/[testId]`

### ✅ Score Stage
- **Composite scoring** (593 lines) — multi-dimension scoring algorithm
- **Score summary** AI generation
- **Score history** tracking

### ✅ Infrastructure
- Supabase auth (login, middleware, server/client/route clients)
- Dashboard with project listing
- Project CRUD
- Admin page (ungated — see issues)
- Settings page
- Snapshot system (save/restore project state)
- Pipeline logging
- Rate limiter
- Error handling framework
- `.env.example` with all vars documented

---

## 4. What's Broken / Needs Fixing

### 🔴 P0 — Security (from existing QA report)
1. **IDOR on 4 API routes** — any authenticated user can access any project's data (signals, pain-points, signal/run). No ownership checks.
2. **Admin page ungated** — any authenticated user can access

### 🟡 P1 — Functional Issues
1. **Score page is a dead-end** — shows "No score yet" with no data fetching even when scores exist
2. **Project creation form fields silently discarded** — Zod strips `one_liner`, `target_audience`, `problem_statement`, `proposed_solution`
3. **Middleware deprecation** — Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` (ticking time bomb)
4. **Fire-and-forget signal runs** — no user feedback on success/failure
5. **Source upload route** has TODO for full implementation

### 🟠 P2 — Polish
- Duplicate `force-dynamic` exports
- Missing loading/error states in some pages
- No onboarding flow
- No billing/subscription system (Stripe is only for landing page pre-orders, not for DemandProof itself)

---

## 5. What's Needed to Make It Sellable

### Must-Have (Before Charging Money)

| Item | Effort | Notes |
|------|--------|-------|
| Fix IDOR security holes (4 routes) | 2-3 hours | Add auth checks + ownership verification |
| Fix score page to actually display scores | 2 hours | Data fetching already exists on overview page |
| Fix form field schema to save all fields | 1 hour | Extend Zod schema |
| Add billing/subscription (Stripe) | 8-12 hours | Monthly plans, usage limits, trial |
| Migrate middleware → proxy | 3-4 hours | Next.js 16 deprecation |
| Gate admin page by role | 1 hour | |
| Onboarding flow (first-run wizard) | 4-6 hours | Guide users through first project |
| Error handling on signal runs | 2-3 hours | User-facing feedback |
| Rate limiting per user (cost protection) | 3-4 hours | Prevent OpenAI abuse |
| **Total** | **~30-40 hours** | **~1 week full-time** |

### Nice-to-Have (Post-Launch)

- Usage analytics dashboard
- Team/org support
- API access
- Custom data source uploads (partially built)
- Webhook integrations
- Export to PDF/Notion

---

## 6. Production Readiness Estimate

**Current state: 75-80% complete for MVP.**

The core product loop works: create project → run signal collection → view analysis → generate landing pages → run outreach → score. The big gaps are security, billing, and polish.

| Effort Level | Timeline | What You Get |
|-------------|----------|-------------|
| **Sprint (40 hrs)** | 1 week | Sellable MVP — security fixed, billing added, core flows polished |
| **Comfortable (80 hrs)** | 2 weeks | Polished product — onboarding, error handling, rate limiting, docs |
| **Full launch (120 hrs)** | 3 weeks | Production-grade — monitoring, team support, API, custom branding |

---

## 7. Market Assessment — Can We Sell This?

### Value Proposition
**"Validate your startup idea with real data, not AI opinions."**

Most competitors (ValidatorAI, DimeADozen, FounderPal) just feed your idea to an LLM and get a generic report. DemandProof actually scrapes real conversations, finds real pain points, generates testable landing pages, and measures real purchase intent. That's a fundamentally different and more valuable product.

### Target Customers
1. **Solo founders / indie hackers** — validating before building (primary)
2. **Small startup teams** — pre-launch validation
3. **Product managers** — evaluating new feature/product bets
4. **Accelerator/incubator programs** — structured validation for cohorts

### Pricing Model

| Tier | Price | What's Included |
|------|-------|----------------|
| **Free trial** | $0 | 1 project, Signal stage only |
| **Starter** | $29/mo | 3 projects, all 6 stages, 10 signal runs/mo |
| **Pro** | $79/mo | Unlimited projects, unlimited runs, priority AI, export |
| **One-time report** | $49 | Single full validation (no subscription) |

### Revenue Estimate
- **Conservative:** 50 paying users × $29/mo = **$1,450/mo**
- **Moderate:** 200 users × $45 avg = **$9,000/mo**
- **Optimistic:** 500 users × $55 avg = **$27,500/mo**

### Comparable Products & Pricing
- ValidatorAI: $19/mo (LLM-only, no real data)
- DimeADozen: $39 one-time (LLM report)
- FounderPal: Free (basic LLM analysis)

DemandProof does significantly more than any of these. The $29-79 range is justified.

### Cost Structure (Per User)
- OpenAI API: ~$0.10-0.50 per signal run (GPT-4o-mini is cheap)
- Supabase: ~$25/mo base (scales with usage)
- Retell AI: ~$0.10/minute for voice calls
- Resend: ~$0 (free tier covers early usage)
- **Gross margin: 80-90%** at scale

### Verdict
**Yes, this is sellable.** The product is differentiated, the tech is real (not vaporware), the codebase is substantial, and the market (startup validation tools) has proven demand. The one-week sprint to add billing and fix security is the only real blocker.

---

## 8. Recommended Next Steps

1. **Fix security holes** (2-3 hours) — non-negotiable before any users
2. **Add Stripe billing** (8-12 hours) — subscription plans + usage metering
3. **Fix score page + form fields** (3 hours) — core UX gaps
4. **Build simple landing page for DemandProof itself** (4 hours) — dogfood the Spark stage
5. **Deploy to Vercel** with production Supabase instance
6. **Soft launch** on indie hacker communities (Reddit, HN, Twitter)

**Bottom line: DemandProof is a real product with a real codebase that's ~1 week of focused work away from being sellable.**
