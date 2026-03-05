# Report Spec

## Free View
- Total permit count
- Category breakdown (pie/bar chart)
- Jurisdiction breakdown (federal/state/county/city)
- 2 sample permits shown in full detail (highest confidence)
- CTA: "Unlock full report for $99"

## Paid View
- All permits with full details
- Grouped by jurisdiction, then category
- Direct links to application forms
- Cost estimates totaled
- Suggested filing order (federal → state → local)
- PDF download button

## PDF Report
- Oddly Useful branding (logo, colors)
- Cover page with business info
- Table of contents
- Each permit: name, authority, cost, timeline, URL, prerequisites
- Total estimated cost summary
- Disclaimer: "This report is for informational purposes only..."

## URL Structure
- /report/[id] — public, shows free or paid view based on payment status
- /report/[id]/pdf — generates and downloads PDF (paid only)
