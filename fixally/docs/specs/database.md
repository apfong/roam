# Database Spec (Supabase)

## Tables
- **users**: id, email, created_at
- **scans**: id, user_id (nullable), url, created_at, duration_ms, violation_count
- **scan_results**: id, scan_id, rule_id, impact, html, target, fix_html, fix_explanation
- **subscriptions**: id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end
