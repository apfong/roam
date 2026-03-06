import { describe, it, expect } from 'vitest';
import { validateIntakeForm } from '@/lib/validation';

describe('validateIntakeForm', () => {
  const validInput = {
    businessType: 'restaurant',
    state: 'TX',
    city: 'Austin',
    entityType: 'llc',
    employeeCount: '1-5',
    homeBased: false,
    businessActivities: ['serve_food'],
  };

  it('accepts valid input', () => {
    const result = validateIntakeForm(validInput);
    expect(result.success).toBe(true);
    expect(result.data?.businessType).toBe('restaurant');
    expect(result.data?.state).toBe('TX');
    expect(result.data?.city).toBe('Austin');
  });

  it('requires businessType', () => {
    const result = validateIntakeForm({ ...validInput, businessType: undefined });
    expect(result.success).toBe(false);
  });

  it('rejects invalid businessType', () => {
    const result = validateIntakeForm({ ...validInput, businessType: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('requires state as 2-letter code', () => {
    const result = validateIntakeForm({ ...validInput, state: 'Texas' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid state code', () => {
    const result = validateIntakeForm({ ...validInput, state: 'ZZ' });
    expect(result.success).toBe(false);
  });

  it('requires city with min 2 chars', () => {
    const result = validateIntakeForm({ ...validInput, city: 'A' });
    expect(result.success).toBe(false);
  });

  it('requires city', () => {
    const result = validateIntakeForm({ ...validInput, city: undefined });
    expect(result.success).toBe(false);
  });

  it('defaults optional fields', () => {
    const result = validateIntakeForm({
      businessType: 'consulting',
      state: 'OR',
      city: 'Portland',
    });
    expect(result.success).toBe(true);
    expect(result.data?.entityType).toBe('llc');
    expect(result.data?.homeBased).toBe(false);
    expect(result.data?.employeeCount).toBe('0');
    expect(result.data?.businessActivities).toEqual([]);
  });

  it('accepts all valid business types', () => {
    const types = ['restaurant', 'retail', 'salon', 'consulting', 'food_truck', 'construction', 'professional_services', 'ecommerce', 'home_based'];
    for (const t of types) {
      const result = validateIntakeForm({ ...validInput, businessType: t });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid employee counts', () => {
    for (const c of ['0', '1-5', '6-50', '50+']) {
      const result = validateIntakeForm({ ...validInput, employeeCount: c });
      expect(result.success).toBe(true);
    }
  });
});
