'use client';

import { useState, useCallback } from 'react';
import type { FixResult } from '@/lib/fix-generator/types';
import { escapeHtml, cn } from '@/lib/utils';

export interface FixDisplayItem {
  fix: FixResult;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  locked: boolean;
  platformInstructions?: string;
  ruleId: string;
}

interface FixDisplayProps {
  items: FixDisplayItem[];
  onUnlock?: () => void;
}

const SEVERITY_COLORS: Record<string, { badge: string; bg: string }> = {
  critical: { badge: 'bg-red-600 text-white', bg: 'border-red-200 bg-red-50' },
  serious: { badge: 'bg-orange-500 text-white', bg: 'border-orange-200 bg-orange-50' },
  moderate: { badge: 'bg-yellow-500 text-white', bg: 'border-yellow-200 bg-yellow-50' },
  minor: { badge: 'bg-blue-500 text-white', bg: 'border-blue-200 bg-blue-50' },
};

function CodeBlock({ code, variant }: { code: string; variant: 'before' | 'after' }) {
  const bgColor = variant === 'before' ? 'bg-red-950/10' : 'bg-green-950/10';
  const borderColor = variant === 'before' ? 'border-red-300' : 'border-green-300';
  const label = variant === 'before' ? 'Before' : 'After';
  const labelColor = variant === 'before' ? 'text-red-600' : 'text-green-600';

  return (
    <div className={cn('rounded border', borderColor)}>
      <div className={cn('text-xs font-semibold px-3 py-1 border-b', labelColor, borderColor, bgColor)}>
        {label}
      </div>
      <pre className={cn('p-3 text-sm overflow-x-auto', bgColor)}>
        <code dangerouslySetInnerHTML={{ __html: escapeHtml(code) }} />
      </pre>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 text-xs font-medium rounded border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
      title="Copy fixed HTML"
    >
      {copied ? '✓ Copied' : '📋 Copy Fix'}
    </button>
  );
}

function FixItem({ item, onUnlock }: { item: FixDisplayItem; onUnlock?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const colors = SEVERITY_COLORS[item.impact];

  return (
    <div className={cn('border rounded-lg overflow-hidden', item.locked ? 'opacity-75' : '')}>
      <button
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => !item.locked && setExpanded(!expanded)}
      >
        {item.locked && <span className="text-lg" title="Upgrade to unlock">🔒</span>}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 truncate">
            {item.fix.explanation}
          </div>
          <div className="text-sm text-slate-500">
            <code className="text-xs bg-slate-100 px-1 rounded">{item.ruleId}</code>
            {' · '}
            <code className="text-xs bg-slate-100 px-1 rounded">{item.fix.wcagRule}</code>
            {' · '}
            Confidence: {item.fix.confidence}
          </div>
        </div>
        <span className={cn('text-xs font-semibold px-2 py-1 rounded', colors.badge)}>
          {item.impact}
        </span>
        {!item.locked && (
          <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
        )}
      </button>

      {item.locked && (
        <div className="border-t border-slate-200 p-4 bg-slate-50 text-center">
          <p className="text-sm text-slate-600 mb-2">Upgrade to see this fix</p>
          <button
            onClick={onUnlock}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Unlock All Fixes
          </button>
        </div>
      )}

      {expanded && !item.locked && (
        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={item.fix.currentHTML} variant="before" />
            <CodeBlock code={item.fix.fixedHTML} variant="after" />
          </div>

          <div className="flex items-center gap-2">
            <CopyButton text={item.fix.fixedHTML} />
          </div>

          {item.platformInstructions && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded text-sm text-indigo-800">
              <strong>📍 Platform Instructions:</strong> {item.platformInstructions}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FixDisplay({ items, onUnlock }: FixDisplayProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
        <div className="text-3xl mb-2">✅</div>
        <p className="text-green-700 font-medium">No fixes needed — looking good!</p>
      </div>
    );
  }

  const freeCount = items.filter(i => !i.locked).length;
  const lockedCount = items.filter(i => i.locked).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Code Fixes ({freeCount} available{lockedCount > 0 ? `, ${lockedCount} locked` : ''})
        </h3>
      </div>
      {items.map((item, i) => (
        <FixItem key={`${item.ruleId}-${i}`} item={item} onUnlock={onUnlock} />
      ))}
    </div>
  );
}
