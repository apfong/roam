'use client';

import { useMemo } from 'react';
import type { SheetDiff, CellChange } from '@/lib/diff';
import { DIFF_COLORS } from '@/lib/diff/colors';
import { generateSummary } from '@/lib/diff/summarize';

function colLetter(col: number): string {
  let s = '';
  let c = col;
  while (c >= 0) {
    s = String.fromCharCode(65 + (c % 26)) + s;
    c = Math.floor(c / 26) - 1;
  }
  return s;
}

function cellRef(row: number, col: number): string {
  return `${colLetter(col)}${row + 1}`;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '(empty)';
  if (typeof v === 'number') return v.toLocaleString();
  return String(v);
}

interface ChangeSidebarProps {
  diff: SheetDiff | null;
}

export default function ChangeSidebar({ diff }: ChangeSidebarProps) {
  if (!diff) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        Computing diff…
      </div>
    );
  }

  const aiSummary = useMemo(() => generateSummary(diff), [diff]);
  const { summary, changes } = diff;

  // Group by change type
  const grouped = new Map<string, CellChange[]>();
  for (const c of changes) {
    const list = grouped.get(c.changeType) ?? [];
    list.push(c);
    grouped.set(c.changeType, list);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Summary header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-lg mb-2">Changes</h2>
        <p className="text-sm text-gray-600">
          {summary.totalChanges} cell{summary.totalChanges !== 1 ? 's' : ''} changed
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {summary.addedCells > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: DIFF_COLORS.added.bg, color: DIFF_COLORS.added.accent }}>
              +{summary.addedCells} added
            </span>
          )}
          {summary.removedCells > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: DIFF_COLORS.removed.bg, color: DIFF_COLORS.removed.accent }}>
              −{summary.removedCells} removed
            </span>
          )}
          {summary.valueChanges > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: DIFF_COLORS.value.bg, color: DIFF_COLORS.value.accent }}>
              {summary.valueChanges} value
            </span>
          )}
          {summary.formulaChanges > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: DIFF_COLORS.formula.bg, color: DIFF_COLORS.formula.accent }}>
              {summary.formulaChanges} formula
            </span>
          )}
          {summary.formulaValueChanges > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: DIFF_COLORS['formula-value'].bg, color: DIFF_COLORS['formula-value'].accent }}>
              {summary.formulaValueChanges} recalc
            </span>
          )}
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-4 border-b bg-blue-50">
        <h3 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2">✨ Summary</h3>
        <p className="text-sm text-gray-700 whitespace-pre-line">{aiSummary}</p>
      </div>

      {/* Change list */}
      <div className="flex-1 overflow-y-auto">
        {[...grouped.entries()].map(([type, items]) => {
          const color = DIFF_COLORS[type as keyof typeof DIFF_COLORS];
          return (
            <div key={type} className="border-b last:border-b-0">
              <div
                className="px-4 py-2 text-xs font-medium uppercase tracking-wide"
                style={{ background: color.bg, color: color.accent }}
              >
                {color.label} ({items.length})
              </div>
              {items.map((change, i) => (
                <div
                  key={i}
                  className="px-4 py-2 text-sm border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="font-mono text-xs text-gray-500 mb-1">
                    {cellRef(change.address.row, change.address.col)}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {change.before && (
                      <span className="text-red-600 line-through">
                        {formatValue(change.before.v)}
                        {change.before.f && (
                          <span className="ml-1 text-red-400">({change.before.f})</span>
                        )}
                      </span>
                    )}
                    {change.before && change.after && (
                      <span className="text-gray-400">→</span>
                    )}
                    {change.after && (
                      <span className="text-green-700 font-medium">
                        {formatValue(change.after.v)}
                        {change.after.f && (
                          <span className="ml-1 text-green-500">({change.after.f})</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
