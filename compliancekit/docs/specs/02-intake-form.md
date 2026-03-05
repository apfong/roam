# Intake Form Spec

## Purpose
Collect business information to determine required permits/licenses.

## Required Fields
- Business type (dropdown) — REQUIRED
- State (dropdown) — REQUIRED  
- City (text with autocomplete) — REQUIRED

## Optional Fields
- Business name (text)
- Business activities (multi-select chips)
- County (text)
- Entity type (dropdown, default: llc)
- Home-based (checkbox, default: false)
- Employee count (dropdown, default: 0)

## Validation (Zod)
- businessType: must be valid enum value
- state: 2-letter US state code
- city: non-empty string, min 2 chars
- employeeCount: valid enum

## UX Flow
1. User fills form on landing page
2. Submit → POST /api/research
3. Redirect to /report/[id] with loading state
4. Poll for completion (SSE or polling)

## Activities by Business Type
- restaurant: serve_food, serve_alcohol, outdoor_seating, live_music, delivery
- salon: cut_hair, color_hair, nail_services, waxing, massage
- retail: sell_products, online_sales, wholesale
- consulting: professional_advice, training
- construction: general_contracting, electrical, plumbing, hvac
