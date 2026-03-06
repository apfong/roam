/**
 * Shared UI types that extend the core lib types for frontend use.
 */

import type { FixResult, ViolationContext } from './fix-generator/types';
import type { Violation, ScanResult } from './scanner';

export type { FixResult, ViolationContext, Violation, ScanResult };

export interface FixWithViolation {
  fix: FixResult;
  violation: ViolationContext;
  locked: boolean;
  platformInstructions?: string;
}

export interface ScanReport {
  id: string;
  url: string;
  scannedAt: string;
  duration: number;
  violations: Violation[];
  fixes: FixResult[];
  lockedCount: number;
  summary: ScanResult['summary'];
  verification?: {
    originalCount: number;
    fixedCount: number;
    remainingCount: number;
  };
  platform?: string;
}

export interface DashboardScan {
  id: string;
  url: string;
  scannedAt: string;
  violationCount: number;
  status: 'completed' | 'failed' | 'in-progress';
}

export type SubscriptionTier = 'free' | 'starter' | 'pro';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  currentPeriodEnd?: string;
}
