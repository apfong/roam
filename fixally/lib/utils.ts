/**
 * Simple diff utility for HTML code comparison.
 */

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

export function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const result: DiffLine[] = [];

  // Simple line-by-line diff (LCS-based would be better but this is lightweight)
  const maxLen = Math.max(beforeLines.length, afterLines.length);

  // Use a simple approach: find matching lines, mark rest as added/removed
  const beforeSet = new Map<string, number[]>();
  beforeLines.forEach((line, i) => {
    const existing = beforeSet.get(line) || [];
    existing.push(i);
    beforeSet.set(line, existing);
  });

  // If before and after are the same, just return unchanged
  if (before === after) {
    return beforeLines.map((line, i) => ({
      type: 'unchanged' as const,
      content: line,
      lineNumber: i + 1,
    }));
  }

  // Simple approach: show removed lines then added lines
  let lineNum = 1;
  for (const line of beforeLines) {
    result.push({ type: 'removed', content: line, lineNumber: lineNum++ });
  }
  for (const line of afterLines) {
    result.push({ type: 'added', content: line, lineNumber: lineNum++ });
  }

  return result;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function exportToJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(rows: Record<string, string | number>[], filename: string): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
