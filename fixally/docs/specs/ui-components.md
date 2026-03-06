# UI Components Spec

## Components

### `fix-display.tsx`
- Renders list of `FixDisplayItem` objects with expandable details
- Code diff viewer: before/after HTML blocks with syntax highlighting
- Copy-to-clipboard button per fix
- Severity badges: critical(red), serious(orange), moderate(yellow), minor(blue)
- 🔒 lock icon for gated fixes beyond free limit (3)
- Platform-specific instructions when available

### `preview-panel.tsx`
- Split view: original URL (iframe) vs fixed HTML (srcDoc iframe)
- Toggle: split mode / overlay mode (with opacity slider)
- Issue count badges on each side
- Responsive: stacks vertically on mobile

### `verification-bar.tsx`
- Progress bar: "X found → Y fixed → Z manual review"
- Green (fixed) + amber (remaining) segments

### `nav.tsx`
- Shared navigation: logo, pricing link, auth state (sign in/out)

### `loading-skeleton.tsx`
- Animated pulse skeletons for scan results and dashboard
- `ScanLoadingSkeleton` and `DashboardSkeleton` exports

### `error-state.tsx`
- `ErrorState`: error message + optional retry button
- `EmptyState`: empty content + optional CTA

## Pages

### `/` (Home)
- URL input → scan → tabbed results (violations / fixes / preview)
- Export buttons (JSON, CSV)
- Verification progress bar
- Upgrade CTA for locked fixes

### `/pricing`
- 3 tiers: Free ($0), Starter ($49/mo), Pro ($149/mo)
- Feature comparison, FAQ accordion

### `/login`
- Magic link email form (mock auth, localStorage-based)

### `/dashboard` (Protected)
- Scan history list, subscription status, "New Scan" CTA

### `/scan/[id]`
- Placeholder for database-backed scan detail view
