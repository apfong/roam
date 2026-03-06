import { describe, it, expect } from 'vitest';
import { computeDiff, escapeHtml, cn, formatDuration } from '@/lib/utils';

describe('computeDiff', () => {
  it('returns unchanged for identical strings', () => {
    const result = computeDiff('hello', 'hello');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('unchanged');
    expect(result[0].content).toBe('hello');
  });

  it('shows removed and added lines for different strings', () => {
    const result = computeDiff('<img src="x">', '<img src="x" alt="photo">');
    const removed = result.filter(l => l.type === 'removed');
    const added = result.filter(l => l.type === 'added');
    expect(removed.length).toBeGreaterThan(0);
    expect(added.length).toBeGreaterThan(0);
  });

  it('handles multi-line diff', () => {
    const before = 'line1\nline2';
    const after = 'line1\nline3';
    const result = computeDiff(before, after);
    expect(result.length).toBe(4); // 2 removed + 2 added
  });
});

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<img src="x">')).toBe('&lt;img src=&quot;x&quot;&gt;');
  });

  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms');
  });

  it('formats seconds', () => {
    expect(formatDuration(2500)).toBe('2.5s');
  });
});
