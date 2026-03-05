# MVP Scope Documents
*Created: 2026-03-05 | Team: 1 human dev + 1 AI agent*

---

# Product 1: FixA11y — Accessibility Remediation Tool

## What It Does
Enter a URL → get WCAG violations → get code patches to fix them → preview the fixed site. Free scan shows the problem count; paid tier shows the fixes.

## Core MVP Features

### 1. Free Scanner
- User enters URL
- Headless browser loads page, runs axe-core
- Returns: violation count by severity (critical/serious/moderate/minor), WCAG level (A/AA/AAA), affected elements count
- **No auth required** — this is the top-of-funnel hook

### 2. Fix Generator (Paid)
- For each violation, generate a unified diff patch
- **Rule-based fixes (~80% of issues):**
  - Missing `alt=""` on decorative images → add `alt=""`
  - Missing form labels → associate existing text or add `aria-label`
  - Color contrast → suggest closest compliant color (compute via WCAG contrast algorithm)
  - Missing lang attribute → detect language, add `lang="en"`
  - Empty links/buttons → add `aria-label` from context
  - Missing heading hierarchy → suggest restructure
  - ARIA role corrections → map common misuses to correct roles
- **LLM-powered fixes (~20% of issues):**
  - Meaningful alt text generation (send image to vision model)
  - Complex ARIA patterns (modals, tabs, accordions)
  - Content rewriting for readability
- Output format: JSON array of `{ selector, currentHTML, fixedHTML, explanation, wcagRule }`

### 3. Preview (Paid)
- Server-side proxy: fetch target page HTML, apply patches, serve modified version in iframe
- Implementation: Express middleware that intercepts the page, applies string replacements based on CSS selectors, serves result
- **Not** a full rendering proxy — just patch the HTML and serve. CSS/JS loaded from original domain
- Limitation for MVP: single-page only, no SPA navigation

### 4. Gated Model
| Feature | Free | Starter ($49/mo) | Pro ($149/mo) |
|---------|------|-------------------|---------------|
| Scan (issue count + severity) | ✅ | ✅ | ✅ |
| Sample fixes (3 issues) | ✅ | ✅ | ✅ |
| Full fix report | ❌ | ✅ | ✅ |
| Live preview | ❌ | ✅ | ✅ |
| Pages per scan | 1 | 10 | 50 |
| Re-scanning / monitoring | ❌ | Weekly | Daily |
| Export (JSON, CSV, PDF) | ❌ | ✅ | ✅ |
| Platform-specific instructions | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |

### 5. Platform-Specific Guidance
For each fix, detect the platform (via meta tags, headers, DOM patterns) and provide:
- **WordPress:** "Go to Appearance → Editor → header.php, line ~42. Or install plugin X."
- **Shopify:** "Edit theme → Sections → Header → add `alt` attribute to logo snippet."
- **Squarespace:** "This requires Custom CSS injection: Settings → Advanced → Code Injection."
- **Generic HTML:** Show the diff directly.

Detection logic: check for `wp-content`, `cdn.shopify.com`, `static1.squarespace.com` in page source.

## Technical Architecture

### Stack
```
Frontend:  Next.js 14 (App Router) + Tailwind + shadcn/ui
Backend:   Next.js API routes + Bull queue (Redis-backed)
Scanner:   Puppeteer + axe-core (run in headless Chromium)
Fix Gen:   Rule engine (TypeScript) + Claude API (vision for alt text)
Preview:   Express proxy middleware
Database:  PostgreSQL (Supabase) — scans, users, subscriptions
Auth:      Supabase Auth (magic link + Google)
Payments:  Stripe Checkout + webhooks
Hosting:   Vercel (frontend) + Railway or Fly.io (scanner workers)
Queue:     BullMQ + Redis (Railway)
```

### Scanning Flow
```
User submits URL
  → API validates URL, creates scan record (status: queued)
  → Enqueue job to BullMQ
  → Worker picks up job:
      1. Launch Puppeteer (headless Chromium)
      2. Navigate to URL, wait for networkidle
      3. Inject axe-core, run axe.run()
      4. Store raw violations in DB
      5. For each violation, run fix generator
      6. Store fixes in DB
      7. Update scan status to "complete"
  → Frontend polls /api/scan/:id every 2s (or use SSE)
  → Display results
```

### Scaling the Scanner
- **MVP (week 1-4):** Single worker process, 1 concurrent Puppeteer instance. Can handle ~100 scans/day.
- **Month 2:** Worker pool (3-5 instances on Fly.io), concurrency 2 per worker. ~500-1000 scans/day.
- **Rate limiting:** 5 free scans per IP per day. Paid users: based on plan.
- **Timeout:** 30s per page. Kill and report partial results if exceeded.

### Fix Generation Pipeline
```typescript
interface Violation {
  id: string;          // axe rule ID e.g. "image-alt"
  impact: string;      // critical | serious | moderate | minor
  nodes: Array<{
    html: string;      // the offending element
    target: string[];  // CSS selector path
  }>;
}

// Step 1: Try rule-based fix
const fix = ruleEngine.tryFix(violation);
if (fix) return fix;

// Step 2: Fall back to LLM
const fix = await llmFixGenerator.generate(violation, pageContext);
return fix;
```

Rule engine: a map of `axe-rule-id → fix function`. Start with top 15 rules that cover ~80% of violations:
1. `image-alt` — add alt text (LLM for meaningful, rule for decorative)
2. `label` — associate labels with form inputs
3. `color-contrast` — compute closest WCAG-compliant color
4. `link-name` — add aria-label from context
5. `button-name` — add aria-label
6. `html-has-lang` — detect and add lang
7. `document-title` — add title from h1 or meta
8. `heading-order` — flag and suggest reorder
9. `list` — fix list markup
10. `landmark-one-main` — add main landmark
11. `region` — wrap content in landmarks
12. `meta-viewport` — fix viewport scaling
13. `bypass` — add skip link
14. `duplicate-id` — suffix duplicate IDs
15. `frame-title` — add title to iframes

### Preview Architecture
```
Browser → /preview?scan_id=xxx
  → Server fetches original page HTML (cached from scan)
  → Applies fixes via Cheerio (jQuery-like HTML manipulation)
  → Rewrites relative URLs to absolute (point to original domain)
  → Serves modified HTML in sandboxed iframe
  → Side-by-side: original (left) vs fixed (right)
```

Limitations (acceptable for MVP):
- No JS execution in preview (static HTML snapshot)
- No SPA support
- Some CSS may break due to relative paths (best-effort rewriting)

### Cost Estimates

**Hosting (monthly):**
| Service | Cost |
|---------|------|
| Vercel (Pro) | $20 |
| Railway (workers + Redis) | $20-50 |
| Supabase (Pro) | $25 |
| Domain | $1 |
| **Total** | **~$70-100/mo** |

**API Costs (per 1000 scans):**
| Operation | Cost |
|-----------|------|
| Claude API — alt text generation (~200 images/1000 scans, vision) | ~$5-10 |
| Claude API — complex fixes (~50 LLM calls/1000 scans) | ~$2-5 |
| **Total per 1000 scans** | **~$7-15** |

At $49/mo per customer, need ~2-3 paying customers to break even on hosting. Each customer's scans cost ~$0.50-1.50/mo in API fees. **Unit economics are strong.**

## Distribution Plan

### Phase 1: Automated Outreach (Weeks 3-6)
**The agent-executable play:**
1. Scrape business directories (Yelp, Google Maps, Chamber of Commerce) for SMB websites
2. Run free scan on each site automatically
3. Generate personalized email:
   > "Hi [Name], I scanned [website] and found [X] accessibility issues, including [Y] critical ones that could expose you to ADA lawsuits. [Company in your industry] was sued for $[amount] last year for similar issues. I can show you exactly how to fix each one — here's your free report: [link]"
4. Track opens, clicks, conversions

**Volume target:** 500 cold emails/week → 2-5% reply rate → 10-25 conversations → 2-5 paying customers/week

### Phase 2: SEO (Weeks 4-8)
- "Free accessibility audit tool"
- "WCAG compliance checker for [WordPress/Shopify/Squarespace]"
- "[Platform] accessibility checklist 2026"
- Programmatic pages: "Accessibility audit for [industry] websites"

### Phase 3: Agency Partnerships (Month 2+)
- White-label option for web dev agencies
- Agency pricing: $299/mo for 20 client sites
- Agencies resell as part of their maintenance packages

## Timeline: 4-Week MVP

### Week 1: Scanner + Core Backend
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Project setup: Next.js, Supabase, Tailwind, deploy pipeline | Human |
| 1-2 | axe-core integration: Puppeteer script that scans URL and returns violations | AI Agent |
| 3 | API route: POST /api/scan, store results, return scan ID | Human |
| 4 | BullMQ queue setup, worker process | AI Agent |
| 5 | Landing page with URL input, scan status polling, basic results display | Human |

**End of Week 1 deliverable:** User can enter URL, get violation report (count + severity).

### Week 2: Fix Generator + Gating
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Rule engine: top 10 axe rules → fix functions | AI Agent |
| 3 | LLM fix generator: alt text via Claude vision, complex ARIA | AI Agent |
| 4 | Gating logic: free shows 3 fixes, paid shows all | Human |
| 5 | Fix display UI: violation list, expandable code diffs, copy button | Human |

**End of Week 2 deliverable:** Scans produce actionable fixes. Free/paid split works.

### Week 3: Preview + Payments + Platform Detection
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Preview proxy: fetch HTML, apply Cheerio patches, serve in iframe | AI Agent |
| 3 | Side-by-side preview UI | Human |
| 3 | Platform detection + platform-specific guidance templates | AI Agent |
| 4 | Stripe integration: checkout, webhooks, subscription management | Human |
| 5 | Auth flow: magic link signup, dashboard with scan history | Human |

**End of Week 3 deliverable:** Full paid flow works end-to-end.

### Week 4: Polish + Distribution + Launch
| Day | Task | Owner |
|-----|------|-------|
| 1 | PDF/CSV export of reports | AI Agent |
| 2 | Cold outreach system: scraper + email templates + personalized reports | AI Agent |
| 3 | Landing page polish, testimonial placeholders, pricing page | Human |
| 4 | Rate limiting, error handling, monitoring (Sentry) | Human |
| 5 | Launch: ProductHunt draft, first 100 cold emails, post to HN/Reddit | Both |

**End of Week 4 deliverable:** Live product with first paying customers.

## Riskiest Assumption
**"Site owners will pay $49-149/mo for fix suggestions they still have to implement manually."**

The fear: they see the fixes, think "I'll just hire a dev for $200 one-time," and churn.

### Week 1 Test
Before building the fix generator, run 20 manual scans on SMB sites. Email the business owner a personalized report (manually created) with:
- Issue count + severity
- 3 sample fixes with exact code
- "Full report available for $49/mo"

**Success criteria:** 3+ of 20 reply with interest (15% response rate). If < 5% respond, pivot the value prop to "we implement the fixes for you" (done-for-you service tier at $499 one-time).

---

# Product 2: ComplianceKit — Permits + Landlord Compliance

## What It Does
Tell us your business type and location → we research every permit, license, and registration you need → get a checklist with deadlines, links, and renewal tracking.

Phase 2 adds landlord-specific compliance: notices, rent rules, disclosure requirements.

## Phase 1 MVP: Permit Finder (Weeks 1-4)

### Features

#### 1. Intake Form
Fields:
- Business name (optional)
- Business type (dropdown: restaurant, retail, home-based, professional services, construction, food truck, salon, etc.)
- Business activities (multi-select: sell food, serve alcohol, handle hazardous materials, employ workers, operate vehicles, etc.)
- State + City/County
- Entity type (sole prop, LLC, corp)
- Home-based? (Y/N)
- Number of employees (0, 1-5, 6-50, 50+)

#### 2. AI Research Agent
For each submission, an automated pipeline:
```
1. Construct search queries based on intake:
   - "[state] [business type] license requirements"
   - "[city] business permit application"
   - "[state] employer registration requirements"
   - "[business type] federal permits"
   
2. Web search (Brave API) → collect top 10 results per query

3. Fetch and extract content from .gov and official sources

4. LLM synthesis: extract structured data:
   {
     permit_name: "Food Service Establishment Permit",
     issuing_authority: "NYC Dept of Health",
     url: "https://...",
     estimated_cost: "$280",
     processing_time: "4-6 weeks",
     renewal_period: "annual",
     prerequisites: ["Food Protection Certificate"],
     deadline: "Before opening",
     category: "health_safety"
   }

5. Human QA queue: flag low-confidence items for review
   (MVP: Alex reviews flagged items manually)
```

#### 3. Gated Report
**Free tier (no auth):**
- "Based on your inputs, you likely need **14 permits and licenses** across federal, state, and local levels."
- Breakdown by category: Federal (2), State (5), Local (4), Industry-specific (3)
- 2 sample permits shown in full detail

**Paid tier ($99-149 one-time):**
- Full list with all details
- Direct links to application forms
- Cost estimates for each
- Suggested order of operations (what to file first based on dependencies)
- PDF download
- Email delivery

#### 4. Dashboard (Paid)
- Checklist view: ☐ Not started / 🔄 In progress / ✅ Obtained
- Renewal calendar with email reminders (30 days before expiration)
- Notes field per permit
- Monitoring add-on ($29/mo): agent re-checks quarterly for new requirements

### Technical Architecture

#### Stack
```
Frontend:  Next.js 14 + Tailwind + shadcn/ui
Backend:   Next.js API routes
Research:  Brave Search API + web_fetch + Claude API
Database:  Supabase (PostgreSQL)
Auth:      Supabase Auth
Payments:  Stripe (one-time + subscription)
Queue:     BullMQ + Redis (for research jobs)
Email:     Resend (transactional + reminders)
Hosting:   Vercel + Railway
```

#### Research Agent Pipeline (Detail)
```
Intake submitted
  → Create research job in queue
  → Worker executes:
  
  Step 1: Template-based requirements (instant, no API cost)
    - Every US business: EIN, state registration, local business license
    - Employers: state unemployment insurance, workers comp, I-9
    - LLC/Corp: articles of organization, registered agent
    → Generates 5-10 "always needed" permits
  
  Step 2: Search-based research (30-60 seconds)
    - 5-8 targeted web searches via Brave API
    - Fetch top .gov results
    - Claude extracts structured permit data
    → Generates 5-15 additional permits
  
  Step 3: Industry-specific rules (pre-built database)
    - Restaurant: food service permit, liquor license, fire inspection, grease trap, signage
    - Construction: contractor license, building permits, OSHA
    - Salon: cosmetology license, board registration
    → Cross-reference with state/city
    
  Step 4: Confidence scoring
    - High confidence (template-based): auto-include
    - Medium confidence (search-verified on .gov): auto-include, flag for QA
    - Low confidence (search-found but unverified): include with disclaimer, flag for QA
    
  Step 5: Store results, notify user
```

#### Data Caching Strategy
- Cache research results by `(state, city, business_type, activities)` hash
- TTL: 90 days (regulatory requirements don't change fast)
- First request for a combination: full research (~$0.50-1.00 in API costs)
- Subsequent requests with same combo: serve cached, ~$0 cost
- **This creates a compounding data moat** — every customer makes the next one cheaper

#### Keeping Data Current
- Quarterly re-research for top 50 state/city/business-type combos
- User-reported corrections ("this permit no longer exists") → flag for review
- RSS/news monitoring for major regulatory changes (stretch goal)
- Manual audit of top 10 states quarterly (Alex or contractor, 2 hours/quarter)

### Cost Estimates

**Hosting (monthly):**
| Service | Cost |
|---------|------|
| Vercel | $20 |
| Railway (workers + Redis) | $10-20 |
| Supabase | $25 |
| Resend | $20 |
| **Total** | **~$75-85/mo** |

**Per-report API costs:**
| Operation | Cost |
|-----------|------|
| Brave Search (8 queries) | ~$0.04 |
| Claude API (extraction + synthesis) | ~$0.30-0.80 |
| **Total per report** | **~$0.35-0.85** |

At $99/report, gross margin is ~99%. At $149, even better. **Excellent unit economics.**

### Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Permit count + category breakdown + 2 samples |
| Standard Report | $99 one-time | Full report, PDF, application links |
| Premium Report | $149 one-time | Full report + suggested filing order + 1 email Q&A |
| Monitoring | $29/mo | Quarterly re-check, renewal reminders, dashboard |

### Distribution

#### Primary: New Business Filing Scrape → Cold Email
1. Most states publish new LLC/Corp filings publicly (Secretary of State websites)
2. Scrape new filings daily (registered agent name + address available)
3. Cross-reference with email lookup (Hunter.io or similar)
4. Send personalized email within 48 hours of filing:
   > "Congratulations on registering [Business Name] in [State]! As a new [LLC/Corp], you likely need [X] additional permits and licenses beyond your state registration. We researched the requirements for [business type based on NAICS if available] businesses in [City, State]. See your free summary: [link]"
5. **Volume:** ~150,000 new LLCs filed per month in US. Even 0.1% conversion = 150 customers/mo = $15-22K/mo.

#### Secondary: SEO
- "[State] business license requirements"
- "What permits do I need to open a [business type] in [city]"
- "LLC requirements [state] checklist"
- Programmatic pages for every state × business type combo (2,500+ pages)

#### Tertiary: Partnerships
- Accountants, business attorneys, registered agent services
- Referral fee: 20% of report cost

## Phase 2: Landlord Compliance (Weeks 5-8)

### Features

#### 1. Property Intake
- Property address (auto-detect jurisdiction)
- Number of units
- Residential / commercial / mixed
- Current lease terms (month-to-month, fixed term, length)
- Rent amount (for rent control detection)
- Section 8 / subsidized? (Y/N)

#### 2. State/Local Law Engine
Research agent generates jurisdiction-specific compliance profile:
- **Notice requirements:** days notice for lease termination, entry, rent increase
- **Rent control:** applicable? caps? exemptions?
- **Security deposits:** max amount, holding requirements, return deadline, itemization rules
- **Required disclosures:** lead paint, mold, sex offenders, flood zone, bed bugs, etc.
- **Habitability standards:** required systems, repair timelines
- **Eviction process:** notice types, cure periods, court filing requirements
- **Fair housing:** protected classes beyond federal (some cities add source of income, etc.)

Data structure:
```json
{
  "jurisdiction": "Portland, OR",
  "rent_control": {
    "applicable": true,
    "max_increase": "7% + CPI annually",
    "exemption": "buildings < 15 years old"
  },
  "termination_notice": {
    "month_to_month": "90 days (no-cause) / 30 days (for-cause)",
    "fixed_term": "90 days before expiration"
  },
  "security_deposit": {
    "max": "no statutory max",
    "return_deadline": "31 days",
    "itemization_required": true
  },
  "required_disclosures": [
    "Lead paint (pre-1978)",
    "Mold",
    "Flood zone",
    "Smoking policy",
    "Carbon monoxide detectors"
  ]
}
```

#### 3. Notice Generator
Pre-filled, jurisdiction-compliant document templates:
- Rent increase notice (correct number of days, required language)
- Lease termination notice
- Entry notice
- Security deposit disposition letter
- Repair request response
- Late rent notice

Implementation: Markdown templates with variable substitution → PDF generation via Puppeteer.

#### 4. Compliance Calendar
- Auto-populated deadlines based on property data:
  - Lease renewal decision dates
  - Rent increase notice deadlines (working back from effective date)
  - Annual inspection reminders
  - License renewal dates (rental license, lead cert, etc.)
- Email + in-app reminders at 30, 14, 7 days
- iCal export

### Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Single Property | $49/mo | 1 property, compliance profile, notices, calendar |
| Portfolio (2-10) | $99/mo | Up to 10 properties |
| Portfolio (11-50) | $199/mo | Up to 50 properties |
| Enterprise | Custom | 50+ properties, API, white-label |

### Distribution
- **Reddit/BiggerPockets:** Answer questions about landlord requirements, link to tool
- **SEO:** "[State] landlord tenant laws," "[City] rent increase notice requirements," "[State] security deposit rules"
- **Programmatic pages:** Every state × requirement type (500+ pages)
- **Property management software integrations** (Month 3+)

## Combined Timeline: 8 Weeks

### Phase 1: Permit Finder

**Week 1: Research Agent + Intake**
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Project setup, Supabase schema, Next.js scaffold | Human |
| 1-2 | Research agent: Brave search + Claude extraction pipeline | AI Agent |
| 3 | Intake form UI + validation | Human |
| 4 | Template-based requirements (always-needed permits) | AI Agent |
| 5 | End-to-end test: intake → research → raw results | Both |

**Week 2: Report + Gating**
| Day | Task | Owner |
|-----|------|-------|
| 1 | Report display UI (full permit list, expandable details) | Human |
| 2 | Confidence scoring + QA flagging system | AI Agent |
| 3 | Free/paid gating logic | Human |
| 4 | PDF report generation | AI Agent |
| 5 | Caching layer (hash-based result reuse) | AI Agent |

**Week 3: Payments + Dashboard**
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Stripe one-time payment + webhook handling | Human |
| 3 | User dashboard: scan history, permit checklist | Human |
| 3-4 | Industry-specific rule database (top 10 business types) | AI Agent |
| 5 | Email delivery of reports (Resend) | AI Agent |

**Week 4: Distribution + Launch**
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | SOS scraper for 5 high-volume states (DE, FL, TX, CA, NY) | AI Agent |
| 3 | Cold email templates + outreach pipeline | AI Agent |
| 4 | Landing page, SEO pages for top 10 states | Human |
| 5 | Launch: first 200 cold emails, Reddit posts, HN | Both |

### Phase 2: Landlord Compliance

**Week 5: Landlord Research Agent**
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Property intake form + jurisdiction detection | Human |
| 1-2 | Landlord compliance research agent (extend existing pipeline) | AI Agent |
| 3-4 | Compliance profile data model + top 10 state data | AI Agent |
| 5 | Compliance profile display UI | Human |

**Week 6: Notice Generator**
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Notice templates (rent increase, termination, entry, deposit) | AI Agent |
| 3 | Template variable system + PDF generation | AI Agent |
| 4-5 | Notice generator UI: select type, fill variables, preview, download | Human |

**Week 7: Calendar + Monitoring**
| Day | Task | Owner |
|-----|------|-------|
| 1-2 | Compliance calendar: auto-populate from property data | Human |
| 3 | Email reminders (Resend cron) | AI Agent |
| 4 | Subscription billing (Stripe recurring) | Human |
| 5 | iCal export | AI Agent |

**Week 8: Polish + Launch Landlord Module**
| Day | Task | Owner |
|-----|------|-------|
| 1 | Multi-property dashboard | Human |
| 2 | SEO pages: top 20 "[state] landlord requirements" pages | AI Agent |
| 3 | BiggerPockets / Reddit content plan + first posts | AI Agent |
| 4 | Cross-sell: permit customers → landlord module (if applicable) | Human |
| 5 | Launch landlord module | Both |

## Riskiest Assumption
**"The AI research agent produces accurate, complete permit lists that users trust enough to pay $99-149 for."**

If the research is wrong or incomplete, we're selling a liability, not a product. Regulatory information has a very low tolerance for error.

### Week 1 Test
1. Pick 3 well-understood business types (restaurant, hair salon, home-based consulting) in 3 cities (Austin TX, Portland OR, Miami FL) = 9 test cases
2. Run the research agent on all 9
3. **Manually verify every result** against official .gov sources
4. Score: accuracy (% of permits that are real and current) and completeness (% of actual requirements captured)

**Success criteria:**
- Accuracy ≥ 90% (≤ 10% false positives)
- Completeness ≥ 70% (catches at least 7 of 10 real requirements)
- If accuracy < 80%: don't launch as automated — pivot to "AI-assisted research reviewed by a human" model (charge more, $249-499, but deliver manually-verified reports)
- If completeness < 50%: the research pipeline needs fundamental rework before proceeding

---

# Comparison: Which to Build First?

| Factor | FixA11y | ComplianceKit |
|--------|---------|---------------|
| Time to revenue | Faster (SaaS from week 3) | Slower (need accuracy validation) |
| Recurring revenue | Strong (monthly monitoring) | Mixed (one-time + optional monitoring) |
| Moat | Weak (axe-core is open source) | Strong (cached regulatory data compounds) |
| Risk | Medium (will they pay for DIY fixes?) | High (accuracy requirements are strict) |
| Market size | Large (every website) | Large (every new business) |
| Distribution edge | Strong (can scan sites proactively) | Strong (can scrape SOS filings) |
| AI agent leverage | High (scanning + outreach automated) | High (research + outreach automated) |
| Competition | Crowded (accessiBe, AudioEye, etc.) | Fragmented (mostly manual consultants) |

**Recommendation:** Build FixA11y first. Faster to validate, lower accuracy risk, easier to demonstrate value (scan a site, show problems, sell fixes). Use revenue from FixA11y to fund ComplianceKit development in month 2.

Alternatively, run the ComplianceKit accuracy test in Week 1 *while* building FixA11y. If accuracy passes, start ComplianceKit in Week 5 as planned. If not, continue investing in FixA11y.
