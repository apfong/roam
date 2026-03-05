import { FixResult } from '../fix-generator/types';
import { Violation } from '../scanner';

export interface VerificationResult {
  originalCount: number;
  fixedCount: number;
  remainingCount: number;
  remainingViolations: Violation[];
}

/**
 * Compare original violations with post-fix violations to determine effectiveness.
 */
export function computeVerification(
  originalViolations: Violation[],
  postFixViolations: Violation[]
): VerificationResult {
  const originalIds = new Set(originalViolations.map((v) => v.id));
  const remaining = postFixViolations.filter((v) => originalIds.has(v.id));
  const fixedCount = originalViolations.length - remaining.length;

  return {
    originalCount: originalViolations.length,
    fixedCount: Math.max(0, fixedCount),
    remainingCount: remaining.length,
    remainingViolations: remaining,
  };
}

/**
 * Format verification result as human-readable string.
 */
export function formatVerification(result: VerificationResult): string {
  return `${result.originalCount} issues found → ${result.fixedCount} auto-fixed → ${result.remainingCount} need manual review`;
}
