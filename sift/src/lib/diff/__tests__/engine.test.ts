import { describe, it, expect } from 'vitest';
import { diffSheet, diffWorkbook } from '../engine';
import type { SheetInput } from '../types';

function sheet(id: string, cells: Record<number, Record<number, { v?: unknown; f?: string }>>): SheetInput {
  return { id, cellData: cells as SheetInput['cellData'] };
}

describe('diffSheet', () => {
  it('detects no changes on identical sheets', () => {
    const s = sheet('s1', { 0: { 0: { v: 'hello' }, 1: { v: 42 } } });
    const result = diffSheet(s, s);
    expect(result.changes).toHaveLength(0);
    expect(result.summary.totalChanges).toBe(0);
  });

  it('detects a value change', () => {
    const before = sheet('s1', { 0: { 0: { v: 100 } } });
    const after = sheet('s1', { 0: { 0: { v: 200 } } });
    const result = diffSheet(before, after);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].changeType).toBe('value');
    expect(result.summary.valueChanges).toBe(1);
  });

  it('detects added cells', () => {
    const before = sheet('s1', {});
    const after = sheet('s1', { 0: { 0: { v: 'new' } } });
    const result = diffSheet(before, after);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].changeType).toBe('added');
  });

  it('detects removed cells', () => {
    const before = sheet('s1', { 0: { 0: { v: 'old' } } });
    const after = sheet('s1', {});
    const result = diffSheet(before, after);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].changeType).toBe('removed');
  });

  it('detects formula changes', () => {
    const before = sheet('s1', { 0: { 0: { v: 10, f: '=SUM(A2:A5)' } } });
    const after = sheet('s1', { 0: { 0: { v: 15, f: '=SUM(A2:A6)' } } });
    const result = diffSheet(before, after);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].changeType).toBe('formula');
  });

  it('detects formula-value changes (recalc)', () => {
    const before = sheet('s1', { 0: { 0: { v: 10, f: '=SUM(A2:A5)' } } });
    const after = sheet('s1', { 0: { 0: { v: 15, f: '=SUM(A2:A5)' } } });
    const result = diffSheet(before, after);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].changeType).toBe('formula-value');
    expect(result.summary.formulaValueChanges).toBe(1);
  });

  it('is case-insensitive for formula comparison', () => {
    const before = sheet('s1', { 0: { 0: { v: 10, f: '=sum(a1:a5)' } } });
    const after = sheet('s1', { 0: { 0: { v: 10, f: '=SUM(A1:A5)' } } });
    const result = diffSheet(before, after);
    expect(result.changes).toHaveLength(0);
  });

  it('detects added rows beyond bounds', () => {
    const before = sheet('s1', { 0: { 0: { v: 'a' } } });
    const after = sheet('s1', { 0: { 0: { v: 'a' } }, 5: { 0: { v: 'new row' } } });
    const result = diffSheet(before, after);
    expect(result.rowChanges.length).toBeGreaterThan(0);
    expect(result.rowChanges[0].type).toBe('added');
  });

  it('handles complex multi-change scenario', () => {
    const before = sheet('s1', {
      0: { 0: { v: 'Name' }, 1: { v: 'Amount' } },
      1: { 0: { v: 'Alice' }, 1: { v: 100 } },
      2: { 0: { v: 'Bob' }, 1: { v: 200 } },
      3: { 0: { v: 'Total' }, 1: { v: 300, f: '=SUM(B2:B3)' } },
    });
    const after = sheet('s1', {
      0: { 0: { v: 'Name' }, 1: { v: 'Amount' } },
      1: { 0: { v: 'Alice' }, 1: { v: 150 } },      // value change
      2: { 0: { v: 'Bob' }, 1: { v: 200 } },
      3: { 0: { v: 'Total' }, 1: { v: 350, f: '=SUM(B2:B3)' } }, // formula-value
      4: { 0: { v: 'Charlie' }, 1: { v: 75 } },      // added
    });
    const result = diffSheet(before, after);
    expect(result.summary.valueChanges).toBe(1);
    expect(result.summary.formulaValueChanges).toBe(1);
    expect(result.summary.addedCells).toBe(2); // Charlie + 75
  });
});

describe('diffWorkbook', () => {
  it('detects added and removed sheets', () => {
    const before = { sheets: { s1: sheet('s1', { 0: { 0: { v: 1 } } }) } };
    const after = { sheets: { s2: sheet('s2', { 0: { 0: { v: 2 } } }) } };
    const result = diffWorkbook(before, after);
    expect(result.addedSheets).toEqual(['s2']);
    expect(result.removedSheets).toEqual(['s1']);
  });

  it('aggregates summaries across sheets', () => {
    const before = {
      sheets: {
        s1: sheet('s1', { 0: { 0: { v: 1 } } }),
        s2: sheet('s2', { 0: { 0: { v: 'a' } } }),
      },
    };
    const after = {
      sheets: {
        s1: sheet('s1', { 0: { 0: { v: 2 } } }),
        s2: sheet('s2', { 0: { 0: { v: 'b' } } }),
      },
    };
    const result = diffWorkbook(before, after);
    expect(result.totalSummary.valueChanges).toBe(2);
  });
});
