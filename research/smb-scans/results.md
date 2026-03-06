# SMB Accessibility Scan Results

Scanned on 2026-03-06

| # | Business | Type | Critical | Serious | Moderate | Minor | Total Issues | Elements |
|---|----------|------|----------|---------|----------|-------|-------------|----------|
| 1 | Joe's Pizza NYC | restaurant | 0 | 1 | 0 | 0 | 1 | 1 |
| 2 | Mama's Fish House | restaurant | 1 | 0 | 0 | 0 | 1 | 24 |
| 3 | The Spotted Pig | restaurant | 4 | 3 | 1 | 0 | 8 | 76 |
| 4 | Bouchon Bakery | bakery | ERROR | - | - | - | net::ERR_CONNECTION_REFUSED at https://www.bouchonbakery.com | - |
| 5 | Aspen Dental | dentist | 0 | 0 | 0 | 0 | 0 | 0 |
| 6 | Gentle Dental | dentist | 0 | 4 | 0 | 0 | 4 | 18 |
| 7 | Roto-Rooter | plumber | 2 | 1 | 0 | 0 | 3 | 18 |
| 8 | Mr. Rooter Plumbing | plumber | 3 | 4 | 0 | 0 | 7 | 19 |
| 9 | Two Men and a Truck | moving | 1 | 0 | 0 | 0 | 1 | 1 |
| 10 | Meineke | auto repair | 1 | 0 | 1 | 0 | 2 | 2 |
| 11 | Jiffy Lube | auto repair | 0 | 0 | 0 | 0 | 0 | 0 |
| 12 | Sport Clips | hair salon | 0 | 2 | 0 | 0 | 2 | 3 |
| 13 | Great Clips | hair salon | 0 | 0 | 0 | 0 | 0 | 0 |
| 14 | PetSuites | pet care | 0 | 0 | 0 | 0 | 0 | 0 |
| 15 | Kumon | tutoring | 1 | 2 | 0 | 0 | 3 | 30 |
| 16 | Mathnasium | tutoring | 3 | 3 | 0 | 0 | 6 | 19 |
| 17 | Anytime Fitness | gym | 0 | 0 | 0 | 0 | 0 | 0 |
| 18 | European Wax Center | beauty | 2 | 3 | 0 | 0 | 5 | 16 |
| 19 | Batteries Plus | retail | 1 | 2 | 0 | 0 | 3 | 20 |
| 20 | Ace Hardware | hardware store | 1 | 2 | 1 | 0 | 4 | 32 |

## Detailed Violations

### 1. Joe's Pizza NYC (https://www.joespizzanyc.com)

- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (1 elements)

### 2. Mama's Fish House (https://www.mamasfishhouse.com)

- **CRITICAL** `button-name` — Buttons must have discernible text (24 elements)

### 3. The Spotted Pig (https://www.thespottedpig.com)

- **CRITICAL** `aria-required-children` — Certain ARIA roles must contain particular children (1 elements)
- **CRITICAL** `aria-required-parent` — Certain ARIA roles must be contained by particular parents (3 elements)
- **CRITICAL** `button-name` — Buttons must have discernible text (1 elements)
- **CRITICAL** `image-alt` — Images must have alternative text (1 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (42 elements)
- **SERIOUS** `link-name` — Links must have discernible text (19 elements)
- **SERIOUS** `listitem` — <li> elements must be contained in a <ul> or <ol> (8 elements)
- **MODERATE** `meta-viewport` — Zooming and scaling must not be disabled (1 elements)

### 5. Aspen Dental (https://www.aspendental.com)

No violations found.

### 6. Gentle Dental (https://www.gentledental.com)

- **SERIOUS** `aria-hidden-focus` — ARIA hidden element must not be focusable or contain focusable elements (11 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (3 elements)
- **SERIOUS** `link-name` — Links must have discernible text (3 elements)
- **SERIOUS** `list` — <ul> and <ol> must only directly contain <li>, <script> or <template> elements (1 elements)

### 7. Roto-Rooter (https://www.rotorooter.com)

- **CRITICAL** `aria-allowed-attr` — Elements must only use supported ARIA attributes (5 elements)
- **CRITICAL** `aria-required-attr` — Required ARIA attributes must be provided (10 elements)
- **SERIOUS** `link-name` — Links must have discernible text (3 elements)

### 8. Mr. Rooter Plumbing (https://www.mrrooter.com)

- **CRITICAL** `aria-required-children` — Certain ARIA roles must contain particular children (2 elements)
- **CRITICAL** `button-name` — Buttons must have discernible text (2 elements)
- **CRITICAL** `label` — Form elements must have labels (2 elements)
- **SERIOUS** `aria-hidden-focus` — ARIA hidden element must not be focusable or contain focusable elements (2 elements)
- **SERIOUS** `aria-prohibited-attr` — Elements must only use permitted ARIA attributes (1 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (6 elements)
- **SERIOUS** `listitem` — <li> elements must be contained in a <ul> or <ol> (4 elements)

### 9. Two Men and a Truck (https://www.twomenandatruck.com)

- **CRITICAL** `image-alt` — Images must have alternative text (1 elements)

### 10. Meineke (https://www.meineke.com)

- **CRITICAL** `aria-required-attr` — Required ARIA attributes must be provided (1 elements)
- **MODERATE** `meta-viewport` — Zooming and scaling must not be disabled (1 elements)

### 11. Jiffy Lube (https://www.jiffylube.com)

No violations found.

### 12. Sport Clips (https://www.sportclips.com)

- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (1 elements)
- **SERIOUS** `link-name` — Links must have discernible text (2 elements)

### 13. Great Clips (https://www.greatclips.com)

No violations found.

### 14. PetSuites (https://www.petsuites.com)

No violations found.

### 15. Kumon (https://www.kumon.com)

- **CRITICAL** `image-alt` — Images must have alternative text (1 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (26 elements)
- **SERIOUS** `nested-interactive` — Interactive controls must not be nested (3 elements)

### 16. Mathnasium (https://www.mathnasium.com)

- **CRITICAL** `button-name` — Buttons must have discernible text (4 elements)
- **CRITICAL** `image-alt` — Images must have alternative text (2 elements)
- **CRITICAL** `select-name` — Select element must have an accessible name (1 elements)
- **SERIOUS** `autocomplete-valid` — autocomplete attribute must be used correctly (1 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (7 elements)
- **SERIOUS** `link-name` — Links must have discernible text (4 elements)

### 17. Anytime Fitness (https://www.anytimefitness.com)

No violations found.

### 18. European Wax Center (https://www.waxcenter.com)

- **CRITICAL** `aria-required-children` — Certain ARIA roles must contain particular children (1 elements)
- **CRITICAL** `image-alt` — Images must have alternative text (3 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (2 elements)
- **SERIOUS** `link-name` — Links must have discernible text (9 elements)
- **SERIOUS** `summary-name` — Summary elements must have discernible text (1 elements)

### 19. Batteries Plus (https://www.batteriesplus.com)

- **CRITICAL** `aria-required-children` — Certain ARIA roles must contain particular children (7 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (12 elements)
- **SERIOUS** `frame-title` — Frames must have an accessible name (1 elements)

### 20. Ace Hardware (https://www.acehardware.com)

- **CRITICAL** `image-alt` — Images must have alternative text (1 elements)
- **SERIOUS** `color-contrast` — Elements must meet minimum color contrast ratio thresholds (29 elements)
- **SERIOUS** `nested-interactive` — Interactive controls must not be nested (1 elements)
- **MODERATE** `meta-viewport` — Zooming and scaling must not be disabled (1 elements)

