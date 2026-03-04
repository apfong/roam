# DemandProof Billing Guards Integration

**Date:** 2026-03-04  
**Status:** ✅ Complete — build passes

## Summary

Integrated `checkStageAccess` billing guards into all authenticated DemandProof API routes that were missing them. The billing system (`~/demandproof/src/lib/billing/`) was already built; this work wired it into the route layer.

## What Was Already Guarded
- `POST /api/projects` — `requireUsage(userId, "projects")` ✅
- `POST /api/projects/[id]/signal/run` — `requireUsage(userId, "signal_runs")` + `requireStageAccess` + `incrementUsage` ✅
- `POST /api/projects/[id]/spark/generate` — `checkStageAccess(userId, "spark")` ✅
- `POST /api/projects/[id]/reach/icp-search` — `checkStageAccess(userId, "reach")` ✅
- `POST /api/projects/[id]/discover/scripts` — `checkStageAccess(userId, "discover")` ✅
- `POST /api/projects/[id]/prove/tests` — `checkStageAccess(userId, "prove")` ✅

## Routes Added Guards To (17 routes)

### Spark stage (`checkStageAccess(userId, "spark")`)
- `spark/variants/route.ts` (GET + PATCH)
- `spark/media/search/route.ts`
- `spark/landing-pages/[pageId]/route.ts`
- `spark/deploy/route.ts`

### Reach stage (`checkStageAccess(userId, "reach")`)
- `reach/generate-messages/route.ts`
- `reach/test-email/route.ts`
- `reach/messages/route.ts` (GET + POST)
- `reach/contacts/route.ts` (GET + POST)
- `reach/send/route.ts`

### Discover stage (`checkStageAccess(userId, "discover")`)
- `discover/interviews/route.ts` (GET + POST)
- `discover/interviews/[interviewId]/route.ts`
- `discover/call/route.ts`
- `discover/analyze/route.ts`

### Prove stage (`checkStageAccess(userId, "prove")`)
- `prove/checkout/route.ts` (guarded only when auth present — public checkout still works for live tests)

### Score stage (`checkStageAccess(userId, "score")`)
- `score/history/route.ts`
- `score/summary/route.ts`
- `score/calculate/route.ts`

## Intentionally Skipped (public/webhook endpoints, no auth)
- `spark/checkout/route.ts` — public checkout for visitors
- `spark/track/route.ts` — analytics tracking (public)
- `prove/track/route.ts` — conversion tracking (public)
- `prove/webhook/route.ts` — Stripe webhook

## Also Added
- `handlePlanError()` helper in `~/demandproof/src/lib/billing/middleware.ts` — generic catch-block helper returning 403 for PlanLimitError

## Build
`pnpm build` passes cleanly.
