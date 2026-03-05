# Research Agent Spec

## Pipeline
1. **Templates** → always-needed permits based on entity type, employees, state
2. **Search** → Brave API queries for business-type + location specific permits
3. **Extract** → Fetch .gov pages, LLM extracts structured permit data
4. **Synthesize** → Deduplicate, score confidence, order by priority
5. **Cache** → Store by intake hash, TTL 90 days

## Template Layer (Zero API Cost)
Every business: EIN (federal)
LLC: State formation filing
Corp: State incorporation, bylaws
Employers (1+): State unemployment tax, workers comp check, I-9 compliance
State-specific: Sales tax permit (if applicable), franchise tax, state income tax reg

## Search Queries (per request: 5-8 queries)
- "{state} {businessType} license requirements"
- "{city} business permit requirements"  
- "{state} {businessType} permit application"
- "{city} {county} business license"
- "{businessType} federal permits requirements"
- If employees: "{state} employer registration requirements"
- If specific activities: "{state} {activity} permit" (e.g., "Texas liquor license")

## Extraction Prompt
Given page content from {url}, extract permits/licenses as JSON array:
- name, issuingAuthority, url, estimatedCost, processingTime, renewalPeriod, prerequisites, category

## Confidence Scoring
- high: from template OR found on .gov with complete info
- medium: found on .gov but incomplete info
- low: found on non-.gov source only

## Cache Key
SHA256 of: `${state}:${city}:${businessType}:${activities.sort().join(',')}:${entityType}:${homeBased}:${employeeCount}`
