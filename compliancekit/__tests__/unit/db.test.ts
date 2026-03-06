import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveResearchRequest,
  getResearchRequest,
  updateResearchRequest,
  markReportPaid,
  getChecklist,
  initializeChecklist,
  updateChecklistItem,
  clearStore,
} from '@/lib/db/client';
import type { ResearchRequest, Permit } from '@/lib/types';

const mockPermit: Permit = {
  id: 'permit-1',
  name: 'EIN',
  issuingAuthority: 'IRS',
  jurisdiction: 'federal',
  url: 'https://irs.gov',
  estimatedCost: 'Free',
  processingTime: 'Immediate',
  renewalPeriod: 'One-time',
  prerequisites: [],
  category: 'registration',
  confidence: 'high',
  deadline: 'Before opening',
};

const mockRequest: ResearchRequest = {
  id: 'req-1',
  intake: {
    businessType: 'restaurant',
    businessActivities: [],
    state: 'TX',
    city: 'Austin',
    entityType: 'llc',
    homeBased: false,
    employeeCount: '0',
  },
  status: 'complete',
  permits: [mockPermit],
  createdAt: new Date().toISOString(),
  paid: false,
  cacheKey: 'abc123',
};

describe('DB Client', () => {
  beforeEach(() => clearStore());

  it('saves and retrieves research request', async () => {
    await saveResearchRequest(mockRequest);
    const result = await getResearchRequest('req-1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('req-1');
    expect(result?.permits.length).toBe(1);
  });

  it('returns null for missing request', async () => {
    const result = await getResearchRequest('nonexistent');
    expect(result).toBeNull();
  });

  it('updates research request', async () => {
    await saveResearchRequest(mockRequest);
    await updateResearchRequest('req-1', { paid: true, paymentId: 'pay-1' });
    const result = await getResearchRequest('req-1');
    expect(result?.paid).toBe(true);
    expect(result?.paymentId).toBe('pay-1');
  });

  it('throws on updating nonexistent request', async () => {
    await expect(updateResearchRequest('bad-id', {})).rejects.toThrow();
  });

  it('marks report as paid', async () => {
    await saveResearchRequest(mockRequest);
    await markReportPaid('req-1', 'pay-1');
    const result = await getResearchRequest('req-1');
    expect(result?.paid).toBe(true);
  });

  describe('checklist', () => {
    it('initializes checklist from permits', async () => {
      await initializeChecklist('req-1', [mockPermit]);
      const checklist = await getChecklist('req-1');
      expect(checklist.length).toBe(1);
      expect(checklist[0].permitId).toBe('permit-1');
      expect(checklist[0].status).toBe('not_started');
    });

    it('updates checklist item status', async () => {
      await initializeChecklist('req-1', [mockPermit]);
      await updateChecklistItem('req-1', 'permit-1', { status: 'in_progress' });
      const checklist = await getChecklist('req-1');
      expect(checklist[0].status).toBe('in_progress');
    });

    it('throws on updating nonexistent checklist item', async () => {
      await initializeChecklist('req-1', [mockPermit]);
      await expect(updateChecklistItem('req-1', 'bad-id', {})).rejects.toThrow();
    });
  });
});
