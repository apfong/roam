# CLM-Lite Validation Summary

*Research date: March 6, 2026*

## 🟢 RECOMMENDATION: GO

---

## Market Size

- **CLM market overall:** $2-3B in 2026, growing 12-13% CAGR to $5-6B by 2031-2034
- **US freelancers:** 70+ million (2025), projected 86.5M by 2027
- **US small businesses:** 33+ million
- **Addressable market (freelancers + SMBs needing contract management):** Conservative 5% adoption = 3.5M+ potential users
- **SAM at $29/mo ARPU:** Even 10,000 customers = $3.5M ARR

## Willingness to Pay — STRONG ✅

Evidence:
1. Freelancers already pay $24-$40/mo for Bonsai/HoneyBook (which have basic contract features)
2. SMBs pay $375-$600/mo for ContractSafe/ContractWorks when they find them
3. Users actively building DIY solutions with Notion ($10/mo) + PandaDoc ($19-49/mo) = $29-59/mo already spent cobbling together what CLM-Lite would offer natively
4. Multiple Reddit threads explicitly asking for affordable contract management — demand is stated, not inferred
5. The $80-$375/mo pricing gap means there's NO competition at our target price point

## Competition Risk — LOW ✅

| Risk | Assessment |
|------|-----------|
| Enterprise CLM moves downmarket | Low — they're consolidating around AI-native platforms, moving upmarket |
| Bonsai/HoneyBook adds CLM features | Medium — possible but they're focused on all-in-one freelancer suite, not contract lifecycle |
| PandaDoc expands contract management | Medium — closest risk, but they're sales-focused, not contract-lifecycle-focused |
| New startup enters same gap | Medium — obvious gap, someone will fill it; first-mover advantage matters |
| Open source alternatives | Low — GLPI exists but terrible UX; no polished open-source CLM |

**Key insight:** Enterprise CLM vendors are consolidating and moving upmarket. Freelancer tools are broadening horizontally (adding more features outside contracts). Nobody is laser-focused on affordable contract lifecycle management.

## Build Complexity — MODERATE ⚠️

| Component | Complexity | Notes |
|-----------|-----------|-------|
| Contract upload/storage | Low | S3 + metadata DB |
| Full-text search/OCR | Medium | Can use existing OCR APIs |
| Renewal reminders | Low | Cron jobs + email |
| Dashboard UI | Medium | Standard CRUD app |
| E-signatures | High | Build vs. integrate (DocuSign API, or use open-source) |
| AI clause analysis | Medium-High | LLM integration, need legal accuracy |
| Template system | Medium | Document generation with variables |

**Estimated MVP build time:** 2-3 weeks for core (upload, search, reminders, dashboard). E-signatures and AI can come later.

## Key Risks

1. **E-signature is table stakes but hard to build** — Mitigation: integrate with existing API (DocuSign/HelloSign API) initially, build native later
2. **Legal liability** — AI contract review could give bad legal advice. Mitigation: strong disclaimers, position as "highlighting" not "advising"
3. **Churn risk** — Contract management is low-frequency (people don't sign contracts daily). Mitigation: reminder emails keep users engaged, add obligation tracking for ongoing value
4. **Customer acquisition** — SMBs are expensive to reach. Mitigation: SEO content ("free contract template," "contract renewal tracker"), freemium funnel, Reddit/forum presence
5. **"Good enough" alternatives** — Notion + calendar reminders works for some. Mitigation: 10x better experience, OCR search, AI features they can't DIY

## Recommended MVP Scope (Week 1)

### Build This First:
1. **Contract Repository** — Upload PDFs/docs, organize by client, tag by type
2. **Smart Search** — Full-text search across all uploaded contracts (OCR for PDFs)
3. **Renewal Dashboard** — Visual timeline of upcoming expirations/renewals with status indicators
4. **Email Reminders** — Configurable alerts (30/60/90 days before expiration)
5. **Basic Metadata** — Client name, contract type, start/end date, value, status, notes

### Tech Stack Suggestion:
- Next.js + Supabase (fast to build, cheap to host)
- S3 for document storage
- Tesseract or cloud OCR for PDF text extraction
- Resend for transactional emails
- Stripe for billing

### Landing Page Copy:
> **Stop losing money on forgotten contracts.**
> CLM-Lite: Contract lifecycle management that doesn't cost a fortune.
> Upload, search, track, and never miss a renewal again.
> Starting at $12/month.

### Validation Before Building:
- Landing page with email capture (1 week)
- Target: 200+ email signups before writing code
- Post in Reddit threads where people are actively asking for this
- Cross-post on Indie Hackers, Hacker News (Show HN)

---

## Final Assessment

| Factor | Score | Notes |
|--------|-------|-------|
| Market demand | 9/10 | Clear, stated pain from real users |
| Willingness to pay | 8/10 | Already paying for inferior alternatives |
| Competition gap | 9/10 | Massive pricing gap, no direct competitor |
| Build feasibility | 7/10 | Core MVP is straightforward; e-sig and AI add complexity |
| Revenue potential | 8/10 | $29 ARPU × large addressable market |
| Differentiation | 7/10 | Price is main differentiator initially; AI adds moat later |
| **Overall** | **8/10** | **Strong GO** |

**This is the best product opportunity we've evaluated.** The gap is clear, the pain is real, users are spending money on workarounds, and nobody is serving the $10-100/mo CLM market with a focused product.
