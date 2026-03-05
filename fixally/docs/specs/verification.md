# Verification Loop Spec

## Flow
1. Scan URL → get violations
2. Generate fixes for each violation
3. Apply fixes to HTML (via preview proxy)
4. Re-run axe-core on patched HTML (in-memory, no network)
5. Compare: original violations vs remaining violations
6. Report: "X found → Y auto-fixed → Z need manual review"

## API
```typescript
interface VerificationResult {
  originalCount: number;
  fixedCount: number;
  remainingCount: number;
  remainingViolations: Violation[];
}
```
