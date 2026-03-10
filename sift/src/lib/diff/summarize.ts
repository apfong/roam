/**
 * Generate a human-readable summary of spreadsheet changes.
 * Pure logic — no API calls. Fast and free.
 */
import type { SheetDiff, CellChange } from './types';

export function generateSummary(diff: SheetDiff): string {
  const { summary, changes } = diff;
  const lines: string[] = [];

  if (summary.totalChanges === 0) {
    return 'No changes detected between the two versions.';
  }

  // Overall
  lines.push(`${summary.totalChanges} cell${summary.totalChanges !== 1 ? 's' : ''} changed.`);

  // Structural changes
  if (summary.addedRows > 0) lines.push(`${summary.addedRows} new row${summary.addedRows > 1 ? 's' : ''} added.`);
  if (summary.removedRows > 0) lines.push(`${summary.removedRows} row${summary.removedRows > 1 ? 's' : ''} removed.`);
  if (summary.addedCols > 0) lines.push(`${summary.addedCols} new column${summary.addedCols > 1 ? 's' : ''} added.`);
  if (summary.removedCols > 0) lines.push(`${summary.removedCols} column${summary.removedCols > 1 ? 's' : ''} removed.`);

  // Highlight notable value changes (biggest numeric swings)
  const numericChanges = changes.filter(
    c => c.changeType === 'value' && typeof c.before?.v === 'number' && typeof c.after?.v === 'number'
  );

  if (numericChanges.length > 0) {
    const sorted = numericChanges
      .map(c => ({
        change: c,
        delta: (c.after!.v as number) - (c.before!.v as number),
        pct: c.before!.v !== 0 ? ((c.after!.v as number) - (c.before!.v as number)) / Math.abs(c.before!.v as number) * 100 : Infinity,
      }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    const top = sorted.slice(0, 3);
    if (top.length > 0) {
      lines.push('');
      lines.push('Biggest changes:');
      for (const t of top) {
        const ref = cellRef(t.change.address.row, t.change.address.col);
        const sign = t.delta > 0 ? '+' : '';
        const pctStr = isFinite(t.pct) ? ` (${sign}${t.pct.toFixed(0)}%)` : '';
        lines.push(`• ${ref}: ${formatNum(t.change.before!.v as number)} → ${formatNum(t.change.after!.v as number)}${pctStr}`);
      }
    }
  }

  // Formula changes
  if (summary.formulaChanges > 0) {
    lines.push('');
    lines.push(`${summary.formulaChanges} formula${summary.formulaChanges > 1 ? 's' : ''} modified.`);
    if (summary.formulaValueChanges > 0) {
      lines.push(`${summary.formulaValueChanges} formula result${summary.formulaValueChanges > 1 ? 's' : ''} recalculated.`);
    }
  }

  return lines.join('\n');
}

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

function formatNum(n: number): string {
  return n.toLocaleString();
}
