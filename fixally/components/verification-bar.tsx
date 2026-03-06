'use client';

import { cn } from '@/lib/utils';

interface VerificationBarProps {
  originalCount: number;
  fixedCount: number;
  remainingCount: number;
}

export function VerificationBar({ originalCount, fixedCount, remainingCount }: VerificationBarProps) {
  const fixedPct = originalCount > 0 ? (fixedCount / originalCount) * 100 : 0;
  const remainingPct = originalCount > 0 ? (remainingCount / originalCount) * 100 : 0;

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center gap-2 text-sm mb-3">
        <span className="font-bold text-slate-900">{originalCount}</span>
        <span className="text-slate-500">found</span>
        <span className="text-slate-300">→</span>
        <span className="font-bold text-green-700">{fixedCount}</span>
        <span className="text-slate-500">auto-fixed</span>
        <span className="text-slate-300">→</span>
        <span className="font-bold text-amber-700">{remainingCount}</span>
        <span className="text-slate-500">manual review</span>
      </div>
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${fixedPct}%` }}
        />
        <div
          className="bg-amber-400 transition-all duration-500"
          style={{ width: `${remainingPct}%` }}
        />
      </div>
    </div>
  );
}
