# Billing & Gating Spec

## Free Tier
- 3 fix results shown per scan (highest impact first)
- Remaining fixes blurred/locked with upgrade CTA

## Paid Tier ($49/mo)
- All fixes unlocked
- Preview system access
- Verification loop results

## Stripe Integration
- `createCheckoutSession(userId, priceId)` → Stripe checkout URL
- Webhook handles: checkout.session.completed, customer.subscription.deleted
- Test mode only for now

## Gating Logic
```typescript
getVisibleFixes(fixes: FixResult[], isPaid: boolean): { visible: FixResult[], locked: number }
```
