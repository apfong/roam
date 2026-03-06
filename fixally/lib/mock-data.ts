/**
 * Mock data for development/testing when Supabase isn't configured.
 */

import type { DashboardScan, SubscriptionInfo } from './types';

export const MOCK_SCANS: DashboardScan[] = [
  {
    id: 'scan_001',
    url: 'https://example.com',
    scannedAt: '2026-03-05T18:30:00Z',
    violationCount: 12,
    status: 'completed',
  },
  {
    id: 'scan_002',
    url: 'https://myshop.com',
    scannedAt: '2026-03-04T14:15:00Z',
    violationCount: 7,
    status: 'completed',
  },
  {
    id: 'scan_003',
    url: 'https://blog.example.com',
    scannedAt: '2026-03-03T09:00:00Z',
    violationCount: 23,
    status: 'completed',
  },
];

export const MOCK_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'free',
  status: 'active',
};
