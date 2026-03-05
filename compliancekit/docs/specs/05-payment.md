# Payment Spec

## Flow
1. User clicks "Unlock Full Report" on /report/[id]
2. Create Stripe Checkout session with report ID in metadata
3. Redirect to Stripe Checkout
4. On success: redirect to /report/[id]?paid=true
5. Webhook confirms payment → mark report as paid in DB

## Stripe Integration
- One-time payment: $99 (Standard) or $149 (Premium)
- Product: "ComplianceKit Permit Report"
- Metadata: { reportId, businessType, state, city }
- Success URL: /report/{id}?session_id={CHECKOUT_SESSION_ID}
- Cancel URL: /report/{id}

## Webhook Events
- checkout.session.completed → mark report paid
- payment_intent.payment_failed → log error

## Security
- Verify webhook signature
- Validate report ID exists before creating session
- Don't expose full report data until payment confirmed server-side
