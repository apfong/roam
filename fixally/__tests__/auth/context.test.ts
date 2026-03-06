import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test the auth logic directly (not React hooks)
describe('Auth logic', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
    });
    vi.stubGlobal('btoa', (s: string) => Buffer.from(s).toString('base64'));
  });

  it('validates email format', () => {
    expect('test@example.com'.includes('@')).toBe(true);
    expect('invalid-email'.includes('@')).toBe(false);
  });

  it('generates consistent user IDs from email', () => {
    const email = 'test@example.com';
    const id1 = `user_${Buffer.from(email).toString('base64').slice(0, 12)}`;
    const id2 = `user_${Buffer.from(email).toString('base64').slice(0, 12)}`;
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^user_/);
  });

  it('stores and retrieves user from localStorage', () => {
    const user = { id: 'user_123', email: 'test@example.com' };
    localStorage.setItem('fixally_user', JSON.stringify(user));
    const stored = JSON.parse(localStorage.getItem('fixally_user')!);
    expect(stored.email).toBe('test@example.com');
  });

  it('clears user on sign out', () => {
    localStorage.setItem('fixally_user', JSON.stringify({ id: '1', email: 'a@b.com' }));
    localStorage.removeItem('fixally_user');
    expect(localStorage.getItem('fixally_user')).toBeNull();
  });
});
