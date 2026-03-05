# Website Accessibility Audit & Remediation as a Service — Deep Dive Research

**Date:** 2026-03-05  
**Purpose:** Evaluate as potential Oddly Useful product (2-person team: 1 human + 1 AI agent)

---

## 1. Competitive Landscape

### Major Players & Pricing

| Company | Pricing | Revenue | Model |
|---------|---------|---------|-------|
| **accessiBe** | $490–$3,990/yr (by traffic tier: 5K–100K visits/mo) | **$51.3M (2024)** | JS overlay widget + AI claims |
| **AudioEye** | ~$468/yr (SMB), custom enterprise | **~$35.2M projected (2024)** | Overlay + some manual remediation |
| **UserWay** | $490/yr (100K pageviews) – $1,490/yr (1M) | Acquired by LevelAccess | Overlay widget |
| **EqualWeb** | From $590/yr | Private | Overlay widget |
| **LevelAccess** (acquired UserWay) | Enterprise pricing | Private | Full-service + overlay |
| **Siteimprove** | Enterprise (thousands/yr) | Private | Full platform (SEO + accessibility) |

### The accessiBe Controversy (Critical Intel)
- **FTC fined accessiBe $1 million (Jan 2025)** for false advertising and fake customer reviews
- FTC found accessWidget did NOT make websites WCAG-compliant despite claims
- $1M fine on $51.3M revenue = **cost of doing business** (1.9% of revenue)
- Class action lawsuit filed (July 2024) by customers who paid $490/yr expecting compliance
- Accessibility community has been documenting failures since 2020
- Tools exist specifically to **block accessiBe overlay** (OverlayFactSheet.com signed by 700+ accessibility professionals)
- Alt text accuracy is poor: FTC complaint cited example of steak being described as "brown bread on white ceramic plate"

### Open Source Tools
- **axe-core** (Deque) — the gold standard scanning engine, MIT licensed
- **Pa11y** — CLI/Node accessibility testing, open source
- **Lighthouse** (Google) — includes accessibility audit module
- **WAVE** (WebAIM) — free browser extension
- **Webhint** — open source linting tool

### Key Insight
The overlay market is **massive but hated by the disability community**. There's a genuine gap for a service that does *actual remediation* rather than overlay Band-Aids.

---

## 2. Legal Landscape

### Lawsuit Volume (Real Numbers)
| Year | Total Digital Accessibility Lawsuits | Trend |
|------|-------------------------------------|-------|
| 2021 (H1) | 6,304 (federal only, annualized ~12K+) | Peak |
| 2022 | ~4,000+ | Stabilizing |
| 2023 | 4,061 (UsableNet) / 2,281 (Accessibility.com) | Slight dip |
| 2024 | **4,187** (UsableNet) | Slight increase |

**~4,000+ lawsuits per year is the steady state.** Not shrinking.

### Who Gets Sued
- **Custom-coded websites:** 41.78% (1,332 cases in 2024) — highest category
- E-commerce sites are primary targets
- Plaintiffs have serial filing operations (law firms file dozens per month)
- **Small businesses are targets** — they settle quickly ($5K–$25K typical)

### Overlay Users Get Sued MORE
- **25% of all 2024 lawsuits (1,023) explicitly cited overlay widgets as the problem**
- In 2023, 900+ businesses with overlays were sued — **62% increase from 2022**
- Overlays are actually *attracting* lawsuits, not preventing them

### Regulatory Tailwinds
- **European Accessibility Act (EAA)** became enforceable **June 28, 2025** — covers digital products/services across all EU member states
- DOJ finalized Title II ADA web accessibility rule (2024) — requires WCAG 2.1 AA for state/local government
- Growing body of case law establishing websites as "places of public accommodation"
- **This market is expanding, not contracting**

---

## 3. Technical Feasibility

### What Automated Scanners Actually Catch

| Tool | Coverage | Notes |
|------|----------|-------|
| **axe-core** | **57% of WCAG issues** (Deque's own study, 13,000+ pages) | Industry-leading, zero false positives goal |
| **Deque DevTools** (commercial) | Claims ~80% | Includes guided manual testing |
| **General industry belief** | 20-30% | Deque's study disproved this for their tool |

**Key breakdown from Deque's study:**
- Color contrast (1.4.3): 83% auto-detected, accounts for 30% of all errors
- Missing alt text: Nearly 100% auto-detectable
- Missing form labels: Nearly 100% auto-detectable
- Heading structure issues: Mostly auto-detectable
- ARIA misuse: Partially auto-detectable
- Keyboard navigation: Requires manual testing
- Dynamic content/state changes: Requires manual testing
- Cognitive accessibility: Cannot be automated

### Overlay vs. Actual Remediation

| Approach | What It Does | Effectiveness |
|----------|-------------|---------------|
| **Overlay (accessiBe etc.)** | Injects JS that tries to modify DOM at runtime | Does NOT fix source code; breaks screen readers; introduces new issues; FTC confirmed doesn't work |
| **Source remediation** | Modifies actual HTML/CSS/ARIA in source | Permanent, proper fix; what courts actually want |
| **Hybrid (our opportunity)** | Auto-scan + auto-generate fix code + human review | Best of both: scalable but real |

---

## 4. The Remediation Pipeline — What's Automatable

### By Fix Type

| Issue | Auto-Detectable | Auto-Fixable | Method |
|-------|----------------|-------------|--------|
| **Missing alt text** | ✅ 100% | ✅ ~85-90% | AI vision models (GPT-4V, Claude) generate descriptions; decorative images can be auto-tagged as `alt=""` |
| **Color contrast** | ✅ ~83% | ⚠️ ~60% | Can suggest/generate compliant color alternatives; but may need brand approval |
| **Missing form labels** | ✅ ~95% | ✅ ~80% | Can infer from placeholder/name/context and generate `<label>` or `aria-label` |
| **Heading structure** | ✅ ~90% | ⚠️ ~50% | Can detect skipped levels; auto-fix risks changing visual layout |
| **Missing ARIA labels** | ✅ ~80% | ✅ ~70% | Can generate from context for buttons, links, landmarks |
| **Missing lang attribute** | ✅ 100% | ✅ 100% | Trivial to detect and fix |
| **Keyboard navigation** | ⚠️ ~40% | ❌ ~10% | Tab order/focus management requires understanding of UI intent |
| **Dynamic content** | ❌ ~20% | ❌ ~5% | Live regions, SPAs, modals need manual testing |

### By Platform

| Platform | API/Plugin Access | Auto-Fix Capability |
|----------|------------------|-------------------|
| **WordPress** | ✅ Full REST API, theme file access, plugin ecosystem | **Best** — can modify templates, add plugins, edit content via API |
| **Shopify** | ✅ Admin API, theme Liquid files, app ecosystem | **Good** — can modify theme files, product data, metafields |
| **Squarespace** | ⚠️ Limited — no theme file access, some content API | **Limited** — can modify content/alt text but not template structure |
| **Wix** | ⚠️ Very limited API, Velo for custom code | **Limited** — mostly content-level fixes |
| **Custom sites** | Varies — need hosting access | **Best if access granted** — full control |

### AltText.ai as Reference
- Existing product doing AI alt text at scale: 85,000+ sites
- Pricing: from $5/mo (small) to enterprise
- WordPress plugin + Shopify app + API
- Proves the alt text piece is commoditized

---

## 5. Unit Economics

### Cost Per Site (Our Estimated Stack)

| Component | Cost | Notes |
|-----------|------|-------|
| **Scanning** (axe-core/Pa11y) | ~$0.01–0.05/scan | Open source, our compute; ~100 pages = pennies |
| **AI Alt Text Generation** | ~$0.01–0.05/image | Using GPT-4V or Claude Vision API |
| **AI Fix Generation** (contrast, labels, ARIA) | ~$0.05–0.20/page | LLM generates code patches |
| **Hosting/compute** | ~$5–20/mo shared | For scan infrastructure |
| **Per-site total (initial audit + fixes)** | **~$1–5** | For a typical 50-page SMB site |
| **Monthly monitoring** | ~$0.10–0.50/site | Re-scan on schedule |

### What We Could Charge

| Tier | Price | What They Get |
|------|-------|---------------|
| **Free scan** | $0 | Lead gen — PDF report showing issues |
| **Basic** | $49–99/mo | Automated scan + fix for top issues (alt text, contrast, labels) |
| **Pro** | $149–299/mo | Full remediation pipeline + monitoring + compliance report |
| **Agency** | $499+/mo | Multi-site, priority, human review |

### Comparison to Competitors
- accessiBe charges $490/yr ($41/mo) for an overlay that **doesn't work** and **gets you sued**
- We'd charge similar or more for something that **actually fixes the code**
- Our COGS per site: $1–5 initial + $0.50/mo ongoing
- **Gross margin: 90%+**

### Retention
- Accessibility is ongoing (new content, site changes) — natural recurring need
- Compliance fear = strong retention driver
- Industry overlay tools report low churn (customers afraid to remove them)
- Estimated **80-90% annual retention** if providing real value + monitoring

---

## 6. Distribution

### Free Scan Lead Gen (Primary Channel)
- **Scanning capacity:** 10,000–50,000 sites/day easily (headless browser + axe-core, parallelized)
- **Target:** Crawl business directories, Shopify store lists, WordPress sites
- Generate PDF accessibility report → email to business owner
- "Your site has 47 accessibility issues. You're at risk of an ADA lawsuit (4,187 filed in 2024). Here's what we can fix."

### Cold Email Conversion
- Compliance/fear-based outreach typically converts at **1-3%** for cold email
- With a personalized scan report attached: **3-8%** reply rate expected
- Key: the free scan IS the value prop — not a generic pitch

### Other Channels
- **SEO:** "Is my website ADA compliant?" — high intent keyword
- **Agency partnerships:** Web dev agencies need this for clients (white-label)
- **Shopify/WordPress plugin directories:** Built-in distribution
- **After-lawsuit market:** Businesses that just got sued need immediate remediation

### AI Agent Advantage
- Agent can autonomously: find targets, run scans, generate reports, send personalized outreach, follow up
- This is where the "2-person team" model shines — the agent IS the sales team
- Could realistically process **100-500 leads/day** with outreach

---

## 7. Risks and Gotchas

### 🔴 Critical Risks

1. **False sense of security / Liability**
   - If a customer gets sued after using our service, are we liable?
   - Must have strong disclaimers: "improves accessibility" not "guarantees compliance"
   - accessiBe's FTC fine is a warning — **never claim full WCAG compliance from automation alone**
   - Need clear Terms of Service limiting liability

2. **Automated fixes can break things**
   - Changing alt text, ARIA labels, heading structure can affect SEO, layout, or functionality
   - Need customer approval workflow or at minimum a "preview changes" step
   - Rollback capability is essential

3. **Platform changes**
   - Shopify theme updates could break injected fixes
   - WordPress plugin conflicts
   - Need monitoring + re-scan after platform updates

### 🟡 Moderate Risks

4. **Competition from platforms themselves**
   - Shopify, Wix, Squarespace are adding native accessibility features
   - WordPress has accessibility-focused themes
   - But: this actually helps us (raises awareness without solving the problem)

5. **Regulatory uncertainty**
   - New administration could weaken ADA enforcement (but lawsuits are private, not government-driven)
   - 96%+ of lawsuits are private plaintiff-driven — policy changes have limited impact

6. **"Good enough" perception**
   - SMBs may think an overlay is fine until they get sued
   - Education/content marketing needed

7. **Market positioning**
   - Being associated with "accessibility overlay" companies would be toxic
   - Need to clearly differentiate: "We fix your code, not slap a widget on it"

### 🟢 Manageable Risks

8. **Scale challenges**
   - Squarespace/Wix limited APIs = smaller TAM for those platforms
   - Focus on WordPress (43% of web) + Shopify first

9. **AI alt text quality**
   - Current AI vision models are good but not perfect (see FTC's "steak vs bread" example)
   - Solution: human review option for premium tier, confidence scoring

---

## Overall Assessment

### Opportunity Score: **8/10**

**Why it's strong:**
- ✅ Real, growing legal threat (4,000+ lawsuits/yr, EAA expanding market)
- ✅ Incumbent solutions are demonstrably terrible (FTC-fined, community-hated)
- ✅ Technical moat: AI-native remediation vs. overlay Band-Aids
- ✅ Incredible unit economics (90%+ margins)
- ✅ Natural for AI agent distribution (automated scanning + outreach)
- ✅ Recurring revenue with strong retention dynamics
- ✅ 2-person team can execute: scanning is automated, fixes are AI-generated

**Why it's not 10/10:**
- ⚠️ Crowded market (even if competitors are bad, there are many)
- ⚠️ Liability risk needs careful legal setup
- ⚠️ Limited platform access for Squarespace/Wix
- ⚠️ Need to avoid being lumped in with overlay companies

### Recommended Positioning
**"The anti-overlay accessibility service."** Actually fix the code. Show the diff. Prove the improvement. No widgets, no JavaScript injection, no false promises.

### MVP Scope
1. axe-core scan → AI-generated fix recommendations → downloadable report
2. WordPress plugin that applies fixes with one click
3. Free scan as lead gen → $99/mo subscription
4. Target: WordPress + Shopify stores with 10-500 pages
