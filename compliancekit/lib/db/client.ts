import { ResearchRequest, Permit } from '../types';

/**
 * Database client — in-memory for MVP, swap for Supabase in production.
 * This provides the same interface regardless of backend.
 */

const store = {
  requests: new Map<string, ResearchRequest>(),
  payments: new Map<string, PaymentRecord>(),
  checklist: new Map<string, ChecklistItem[]>(),
};

export interface PaymentRecord {
  id: string;
  stripeSessionId: string;
  reportId: string;
  amountCents: number;
  tier: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  reportId: string;
  permitId: string;
  status: 'not_started' | 'in_progress' | 'obtained';
  notes: string;
  updatedAt: string;
}

// Research Requests
export async function saveResearchRequest(request: ResearchRequest): Promise<void> {
  store.requests.set(request.id, { ...request });
}

export async function getResearchRequest(id: string): Promise<ResearchRequest | null> {
  return store.requests.get(id) ?? null;
}

export async function getResearchRequestByCacheKey(cacheKey: string): Promise<ResearchRequest | null> {
  for (const req of store.requests.values()) {
    if (req.cacheKey === cacheKey && req.status === 'complete') {
      return req;
    }
  }
  return null;
}

export async function updateResearchRequest(
  id: string,
  updates: Partial<ResearchRequest>
): Promise<void> {
  const existing = store.requests.get(id);
  if (!existing) throw new Error(`Research request ${id} not found`);
  store.requests.set(id, { ...existing, ...updates });
}

// Payments
export async function savePayment(payment: PaymentRecord): Promise<void> {
  store.payments.set(payment.id, { ...payment });
}

export async function getPaymentByReportId(reportId: string): Promise<PaymentRecord | null> {
  for (const p of store.payments.values()) {
    if (p.reportId === reportId && p.status === 'completed') return p;
  }
  return null;
}

export async function markReportPaid(reportId: string, paymentId: string): Promise<void> {
  await updateResearchRequest(reportId, { paid: true, paymentId });
}

// Checklist
export async function getChecklist(reportId: string): Promise<ChecklistItem[]> {
  return store.checklist.get(reportId) ?? [];
}

export async function initializeChecklist(reportId: string, permits: Permit[]): Promise<void> {
  const items: ChecklistItem[] = permits.map((p) => ({
    id: crypto.randomUUID(),
    reportId,
    permitId: p.id,
    status: 'not_started',
    notes: '',
    updatedAt: new Date().toISOString(),
  }));
  store.checklist.set(reportId, items);
}

export async function updateChecklistItem(
  reportId: string,
  permitId: string,
  updates: Partial<Pick<ChecklistItem, 'status' | 'notes'>>
): Promise<void> {
  const items = store.checklist.get(reportId) ?? [];
  const idx = items.findIndex((i) => i.permitId === permitId);
  if (idx === -1) throw new Error(`Checklist item not found: ${permitId}`);
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  store.checklist.set(reportId, items);
}

// Testing helper
export function clearStore(): void {
  store.requests.clear();
  store.payments.clear();
  store.checklist.clear();
}
