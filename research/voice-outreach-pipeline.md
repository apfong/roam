# AI Voice Outreach Pipeline Research

*Research conducted March 4, 2026 by Roam's Research Agent*

## Executive Summary

Building an AI voice outreach pipeline for autonomous SMB prospecting is technically feasible with current technology, but comes with significant legal compliance requirements and costs. The total cost per call ranges from $0.20-$0.40, making it viable only for high-value leads or high-conversion scenarios.

**Key findings:**
- **Voice AI providers** range from $0.07-$0.14/minute with Retell AI offering the most competitive all-in pricing
- **Legal compliance** is critical - TCPA requires prior written consent for AI-generated sales calls, with penalties up to $1,500 per violation
- **Business data** can be obtained affordably through APIs (Google Business Profile is free) and enrichment services
- **Total cost per qualified lead** estimated at $8-$25 for 100 calls/day operation

## 1. Voice AI Providers Comparison

### Retell AI (Recommended)
- **Pricing**: $0.07-$0.31/minute (all-inclusive)
- **Components**: Infrastructure ($0.055/min) + Voice ($0.015/min) + LLM ($0.012-$0.08/min) + Telephony ($0.015/min)
- **Strengths**: Transparent pricing, includes telephony, good integration ecosystem
- **Latency**: <500ms
- **Features**: Outbound calling, call recording, analytics, HIPAA compliance available
- **Phone numbers**: Included, $2/month for additional numbers

### Vapi AI
- **Pricing**: $0.05/minute base + additional costs (total ~$0.20-$0.35/minute)
- **Components**: Orchestration layer only - requires separate providers for TTS, LLM, telephony
- **Strengths**: High customization, developer-friendly
- **Weaknesses**: Complex billing across multiple vendors, higher effective cost
- **Latency**: <500ms

### Bland AI
- **Pricing**: Tiered by plan
  - Start: $0.14/minute (free plan)
  - Build: $0.12/minute ($299/month)
  - Scale: $0.11/minute ($499/month)
- **Features**: Warm transfers, call recording, concurrent call limits by plan
- **Minimum charge**: $0.015/call for failed calls
- **Strengths**: Simple pricing, good for high-volume operations

### ElevenLabs Agents
- **Pricing**: ~$0.10/minute (Creator plan) to $0.08/minute (Business plan)
- **Features**: High-quality voice synthesis, multimodal capabilities
- **Strengths**: Superior voice quality, established TTS technology
- **Weaknesses**: Newer to conversational AI space, limited telephony integrations

## 2. Phone Number & Telephony

### Twilio (Industry Standard)
- **Phone Numbers**: $1/month local, $2/month toll-free
- **Outbound Calls**: 
  - US (Zone 1): $0.010/minute
  - Alaska: $0.0862/minute
  - High Cost areas: $0.062/minute
- **Features**: Extensive API, reliable infrastructure, enterprise support
- **Compliance**: Built-in DNC scrubbing capabilities

### Telnyx (Cost-Effective Alternative)
- **Outbound Calls**: $0.014/minute (vs Twilio's $0.010)
- **Inbound Calls**: $0.0085/minute
- **Strengths**: Lower latency, competitive pricing, owned infrastructure
- **Features**: WebRTC support, good for AI applications

### Key Considerations
- **Number Portability**: Both support porting existing numbers
- **Reliability**: Twilio has more enterprise features, Telnyx offers better price/performance
- **Integration**: Most voice AI platforms integrate with both

## 3. Business Data Sources

### Google Business Profile API
- **Cost**: **FREE**
- **Data**: Business names, addresses, phone numbers, categories, reviews
- **Rate Limits**: Reasonable for prospecting use
- **Legal**: Public data, terms compliant for most use cases

### Yelp Fusion API
- **Cost**: $229/month minimum (1,000 calls/day), up to $14.99/1000 calls premium
- **Data**: Business details, reviews, photos, hours
- **Note**: Significant price increases in 2024 make this less attractive

### Apollo.io
- **Cost**: Free tier available, paid plans from $49/month
- **Data**: 270M+ contacts, 35M+ companies, email addresses, phone numbers
- **Features**: Email enrichment, technographic data, API access
- **Strengths**: High data quality, good for B2B prospecting

### Hunter.io
- **Cost**: Free tier (25 searches/month), paid from $34/month
- **Specialty**: Email finding and verification
- **Use**: Secondary enrichment after initial business discovery

### Alternative Sources
- **State Business Registries**: Free public records (varies by state)
- **Industry Directories**: Sector-specific, often paid
- **Web Scraping**: Legal but requires careful compliance with ToS

## 4. Full Pipeline Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Data Collection │ -> │ Pain Detection & │ -> │  Lead Scoring   │
│                 │    │   Enrichment     │    │                 │
│ • Google API    │    │ • Website scrape │    │ • Business size │
│ • State Records │    │ • Social signals │    │ • Tech stack    │
│ • Apollo.io     │    │ • Industry trends│    │ • Growth signals│
└─────────────────┘    └──────────────────┘    └─────────────────┘
          |                       |                       |
          v                       v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Script Generate │ -> │   Voice Calling  │ -> │   Follow-up &   │
│                 │    │                  │    │      CRM        │
│ • Dynamic based │    │ • AI voice agent │    │ • Schedule demos│
│   on pain point │    │ • Call recording │    │ • Email sequence│
│ • Personalized  │    │ • Live handoff   │    │ • Opportunity   │
│   messaging     │    │ • Compliance     │    │   tracking      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technical Implementation
1. **Data Pipeline**: Daily batch collection from APIs, stored in database
2. **Enrichment Engine**: Web scraping and signal detection for pain points
3. **Scoring Algorithm**: ML model to rank leads by conversion probability
4. **Voice Agent**: Dynamic script generation based on prospect data
5. **CRM Integration**: Automatic logging and follow-up workflow creation

## 5. Compliance & Legal Requirements

### TCPA (Telephone Consumer Protection Act)
- **Key Rule**: AI-generated calls require **prior written consent** for marketing purposes
- **Coverage**: ALL AI voice calls fall under "artificial or prerecorded voice" restrictions
- **Penalties**: $500-$1,500 per illegal call
- **Exceptions**: Emergency calls, debt collection (with existing relationship), political calls

### FTC Regulations
- **AI Disclosure**: Must clearly disclose AI-generated nature of calls
- **Truthfulness**: All claims must be substantiated
- **Do Not Call Registry**: Must scrub against federal and state lists

### State-by-State Requirements
- **Varies significantly**: Some states have stricter consent requirements
- **California**: CCPA privacy considerations for data collection
- **Illinois**: BIPA requirements for voice biometrics (if analyzing caller voice)
- **Texas**: Additional robocall restrictions

### Compliance Strategy
1. **Obtain explicit consent** before any AI calls (web forms, opt-ins)
2. **Clear AI disclosure** at start of every call
3. **Honor opt-outs** immediately with automated removal
4. **Maintain consent records** with timestamps and source documentation
5. **Regular DNC scrubbing** (daily recommended)
6. **Call recording consent** (required in some states)

### Legal Risk Mitigation
- **Legal review** of scripts and processes
- **Compliance training** for any human agents
- **Insurance coverage** for TCPA liability
- **Regular audits** of calling practices

## 6. Cost Model (100 Calls/Day)

### Base Scenario: 100 calls/day, 3-minute average duration, 30-day month

#### Voice AI Costs (Retell AI)
- 9,000 minutes/month × $0.10/minute = **$900/month**

#### Telephony Costs (Twilio)
- 9,000 minutes × $0.010/minute = **$90/month**
- Phone numbers: 5 × $1/month = **$5/month**

#### Data & Enrichment
- Google Business API: **$0/month**
- Apollo.io (professional): **$79/month**
- Hunter.io enrichment: **$34/month**

#### Infrastructure & Compliance
- DNC scrubbing service: **$50/month**
- Call recording storage: **$25/month**
- Compliance tools: **$100/month**

#### Total Monthly Cost: **$1,283/month**

### Cost Per Call Breakdown
- **Total cost**: $1,283 ÷ 3,000 calls = **$0.43/call**
- **Cost per minute**: $1,283 ÷ 9,000 minutes = **$0.14/minute**

### Lead Qualification Metrics
- **Contact rate**: 30% (realistic for cold outbound)
- **Qualification rate**: 8% of contacts (industry average)
- **Qualified leads/month**: 3,000 × 0.30 × 0.08 = **72 leads**
- **Cost per qualified lead**: $1,283 ÷ 72 = **$17.82/lead**

### Scale Economics
| Daily Calls | Monthly Cost | Cost/Call | Qualified Leads | Cost/Lead |
|-------------|--------------|-----------|-----------------|-----------|
| 50          | $742         | $0.49     | 36              | $20.61    |
| 100         | $1,283       | $0.43     | 72              | $17.82    |
| 250         | $2,883       | $0.38     | 180             | $16.02    |
| 500         | $5,508       | $0.37     | 360             | $15.30    |

## Recommendations

### Immediate Next Steps
1. **Legal consultation** on TCPA compliance strategy
2. **Pilot program** with explicit consent list (existing customers/warm leads)
3. **Technology stack selection**: Retell AI + Twilio + Google Business API + Apollo.io
4. **Compliance infrastructure** setup before any calling

### Success Prerequisites
- **High-value target market** (>$50 LTV to justify costs)
- **Clear consent mechanism** for lead generation
- **Quality lead scoring** to maximize contact rates
- **Human backup** for warm transfers and complex conversations

### Risk Factors
- **Legal liability** can be severe ($500-$1,500 per violation)
- **Reputation risk** from poor AI call experiences
- **Technical complexity** requires ongoing maintenance
- **Market saturation** as AI calling becomes more common

## Conclusion

An AI voice outreach pipeline is technically and economically viable for the right use case, but requires careful legal compliance and significant upfront investment in technology and processes. The $15-$20 cost per qualified lead makes it suitable for high-value B2B sales but may not work for lower-ticket offerings.

The legal landscape heavily favors explicit consent models over cold calling, suggesting this technology is best suited for warm lead follow-up, customer service, and existing relationship nurturing rather than pure cold prospecting.