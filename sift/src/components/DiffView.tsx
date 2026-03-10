'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { SheetInput, SheetDiff } from '@/lib/diff';
import ChangeSidebar from './ChangeSidebar';

const DiffOverlaySheet = dynamic(() => import('./DiffOverlaySheet'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-gray-400">Loading spreadsheet…</div>,
});

interface DiffViewProps {
  beforeSheets: SheetInput[];
  afterSheets: SheetInput[];
  beforeName: string;
  afterName: string;
  onReset: () => void;
}

/**
 * Match sheets between before/after by name, then by index.
 * Returns pairs of [before | null, after | null, displayName].
 */
function matchSheets(beforeSheets: SheetInput[], afterSheets: SheetInput[]): Array<{
  before: SheetInput | null;
  after: SheetInput | null;
  name: string;
  status: 'common' | 'added' | 'removed';
}> {
  const result: Array<{ before: SheetInput | null; after: SheetInput | null; name: string; status: 'common' | 'added' | 'removed' }> = [];
  const usedAfter = new Set<number>();

  for (const b of beforeSheets) {
    const afterIdx = afterSheets.findIndex((a, i) => !usedAfter.has(i) && a.name === b.name);
    if (afterIdx >= 0) {
      usedAfter.add(afterIdx);
      result.push({ before: b, after: afterSheets[afterIdx], name: b.name ?? 'Sheet', status: 'common' });
    } else {
      result.push({ before: b, after: null, name: b.name ?? 'Sheet', status: 'removed' });
    }
  }

  // Added sheets (in after but not matched)
  afterSheets.forEach((a, i) => {
    if (!usedAfter.has(i)) {
      result.push({ before: null, after: a, name: a.name ?? 'Sheet', status: 'added' });
    }
  });

  return result;
}

/** Empty sheet placeholder for diffing added/removed sheets */
const EMPTY_SHEET: SheetInput = { id: 'empty', cellData: {} };

export default function DiffView({ beforeSheets, afterSheets, beforeName, afterName, onReset }: DiffViewProps) {
  const sheetPairs = useMemo(() => matchSheets(beforeSheets, afterSheets), [beforeSheets, afterSheets]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [diff, setDiff] = useState<SheetDiff | null>(null);

  const active = sheetPairs[activeIdx] ?? sheetPairs[0];
  const before = active.before ?? EMPTY_SHEET;
  const after = active.after ?? EMPTY_SHEET;

  const showTabs = sheetPairs.length > 1;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main spreadsheet area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-3 flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Sift</h1>
          <span className="text-sm text-gray-500 truncate">
            {beforeName} → {afterName}
          </span>
          <button
            onClick={onReset}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← New comparison
          </button>
        </header>

        {/* Sheet tabs */}
        {showTabs && (
          <div className="bg-white border-b px-4 flex items-center gap-0 overflow-x-auto">
            {sheetPairs.map((pair, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveIdx(idx); setDiff(null); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  idx === activeIdx
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pair.name}
                {pair.status === 'added' && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">new</span>
                )}
                {pair.status === 'removed' && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">removed</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="h-full border rounded-lg overflow-hidden bg-white shadow-sm">
            <DiffOverlaySheet
              key={`sheet-${activeIdx}`}
              before={before}
              after={after}
              onDiffComputed={setDiff}
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* Change sidebar */}
      <div className="w-80 bg-white border-l shadow-sm flex flex-col flex-shrink-0">
        <ChangeSidebar diff={diff} sheetName={active.name} sheetStatus={active.status} />
      </div>
    </div>
  );
}
