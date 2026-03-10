# CLM-Lite Gap Analysis

*Research date: March 6, 2026*

## Enterprise CLM Features SMBs DON'T Need

| Feature | Why Enterprise Needs It | Why Freelancers/SMBs Don't |
|---------|------------------------|---------------------------|
| Multi-level approval chains | Compliance, legal review, exec sign-off | 1-2 people make all decisions |
| Advanced compliance/audit trails | Regulatory requirements (SOX, GDPR Art 30) | Basic record-keeping suffices |
| Salesforce/ERP integrations | Contract data feeds into revenue systems | No ERP, maybe a simple CRM |
| AI clause negotiation | High-stakes enterprise deals | Contracts are simpler, fewer edge cases |
| Custom workflow builder | Complex organizational processes | Simple linear workflows |
| Multi-entity management | Global companies, subsidiaries | Single entity |
| Obligation management (complex) | Hundreds of active obligations | Dozens at most |
| Role-based access control (granular) | Legal vs. sales vs. finance teams | Everyone sees everything |
| Contract analytics dashboards | C-suite reporting | Nice-to-have, not critical |
| API/webhook ecosystem | Dev teams building integrations | Not a priority |

## Features Freelancers/SMBs Are CRYING OUT For

Based on Reddit/forum analysis:

### 1. 🔴 Contract Repository with Search (Critical)
- **Pain:** "Digging through old inbox threads, Slack messages, and random attachments"
- **Current solution:** Email folders, Google Drive, Dropbox, Notion databases
- **What they want:** Upload any contract (PDF, Word), search by client/term/date, find anything in seconds

### 2. 🔴 Renewal/Expiration Reminders (Critical)
- **Pain:** "Forgotten a contract renewal once" / "Post-it notes and reminder emails"
- **Current solution:** Spreadsheets with conditional formatting, Outlook calendar reminders
- **What they want:** Automatic alerts 30/60/90 days before expiration, auto-renew flags

### 3. 🟡 Simple Templates (Important)
- **Pain:** "Best website to create contracts?" / rewriting from scratch each time
- **Current solution:** Google Docs templates, Bonsai templates, lawyer-drafted PDFs
- **What they want:** Industry-specific templates, fillable fields, quick customization

### 4. 🟡 E-Signatures (Important)
- **Pain:** "How do you send clients a contract and how do they send it back?"
- **Current solution:** DocuSign ($10+/mo), PandaDoc, HelloSign, or printing/scanning
- **What they want:** Built-in signing without separate tool cost

### 5. 🟡 Version Tracking (Important)
- **Pain:** "What did we promise in the last revision?"
- **Current solution:** filename_v2_final_FINAL.docx
- **What they want:** See all versions, compare changes, know which is current

### 6. 🟢 Obligation/Milestone Tracking (Nice-to-Have)
- **Pain:** "Do we owe a maintenance update?"
- **Current solution:** Memory, project management tools
- **What they want:** See what you owe and what's owed to you per contract

### 7. 🟢 AI Contract Review (Nice-to-Have, Differentiator)
- **Pain:** Not knowing if contract terms are fair/standard
- **Current solution:** Pay a lawyer $200-500 per review
- **What they want:** AI highlighting risky clauses, missing protections, unusual terms

## The "Just Right" Feature Set ($10-30/mo)

### Must-Have for MVP (Week 1-2):
1. **Contract upload & repository** — Drag-and-drop PDFs/docs, organized by client
2. **Full-text search** — OCR for scanned docs, search any term
3. **Renewal/expiration tracking** — Set dates, get email reminders
4. **Basic metadata** — Client, type, start/end date, value, status
5. **Dashboard** — At-a-glance view of active contracts, upcoming expirations

### Should-Have (Month 1):
6. **Contract templates** — 10-15 common templates (NDA, SOW, MSA, freelance agreement)
7. **E-signatures** — Basic built-in signing flow
8. **Version history** — Track amendments and revisions

### Nice-to-Have (Month 2-3):
9. **AI clause analysis** — Flag risky terms, suggest improvements
10. **Obligation tracking** — What's owed, by whom, by when
11. **Simple reporting** — Contract value by client, expiring soon, etc.
12. **Integrations** — Google Drive, Dropbox, email forwarding

## Competitive Positioning

```
                    Features →
                    Basic          Full CLM
              ┌──────────────────────────────┐
    Cheap     │  Bonsai        ★ CLM-Lite    │
    ($10-40)  │  HoneyBook     (THE GAP)     │
              │  PandaDoc                     │
    Price ↓   ├──────────────────────────────┤
    Expensive │               ContractSafe    │
    ($375+)   │               Concord         │
              │               Ironclad        │
              └──────────────────────────────┘
```

**CLM-Lite's positioning:** 80% of the CLM features people actually use, at 5% of the price.
