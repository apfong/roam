'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { SheetInput, SheetDiff } from '@/lib/diff';
import ChangeSidebar from '@/components/ChangeSidebar';

const DiffOverlaySheet = dynamic(() => import('@/components/DiffOverlaySheet'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-gray-400">Loading spreadsheet…</div>,
});

// --- Sample data: a realistic budget spreadsheet ---
const BEFORE: SheetInput = {
  id: 'budget',
  name: 'Q1 Budget',
  cellData: {
    0: { 0: { v: 'Department' }, 1: { v: 'Budget' }, 2: { v: 'Actual' }, 3: { v: 'Variance' } },
    1: { 0: { v: 'Engineering' }, 1: { v: 150000 }, 2: { v: 142000 }, 3: { v: -8000, f: '=C2-B2' } },
    2: { 0: { v: 'Marketing' }, 1: { v: 80000 }, 2: { v: 95000 }, 3: { v: 15000, f: '=C3-B3' } },
    3: { 0: { v: 'Sales' }, 1: { v: 60000 }, 2: { v: 58000 }, 3: { v: -2000, f: '=C4-B4' } },
    4: { 0: { v: 'Operations' }, 1: { v: 45000 }, 2: { v: 44000 }, 3: { v: -1000, f: '=C5-B5' } },
    5: { 0: { v: 'Total' }, 1: { v: 335000, f: '=SUM(B2:B5)' }, 2: { v: 339000, f: '=SUM(C2:C5)' }, 3: { v: 4000, f: '=SUM(D2:D5)' } },
  },
};

const AFTER: SheetInput = {
  id: 'budget',
  name: 'Q1 Budget',
  cellData: {
    0: { 0: { v: 'Department' }, 1: { v: 'Budget' }, 2: { v: 'Actual' }, 3: { v: 'Variance' }, 4: { v: '% Var' } },
    1: { 0: { v: 'Engineering' }, 1: { v: 155000 }, 2: { v: 142000 }, 3: { v: -13000, f: '=C2-B2' } },
    2: { 0: { v: 'Marketing' }, 1: { v: 80000 }, 2: { v: 102000 }, 3: { v: 22000, f: '=C3-B3' } },
    3: { 0: { v: 'Sales' }, 1: { v: 60000 }, 2: { v: 58000 }, 3: { v: -2000, f: '=C4-B4' } },
    4: { 0: { v: 'Operations' }, 1: { v: 45000 }, 2: { v: 44000 }, 3: { v: -1000, f: '=C5-B5' } },
    // HR department added
    5: { 0: { v: 'HR' }, 1: { v: 35000 }, 2: { v: 33000 }, 3: { v: -2000, f: '=C6-B6' } },
    6: { 0: { v: 'Total' }, 1: { v: 375000, f: '=SUM(B2:B6)' }, 2: { v: 379000, f: '=SUM(C2:C6)' }, 3: { v: 4000, f: '=SUM(D2:D6)' } },
  },
};

export default function DiffPage() {
  const [diff, setDiff] = useState<SheetDiff | null>(null);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main spreadsheet area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-3 flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Sift</h1>
          <span className="text-sm text-gray-500">Spreadsheet Diff & Review</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-400">Demo: Q1 Budget v1 → v2</span>
          </div>
        </header>
        <div className="flex-1 p-4">
          <div className="h-full border rounded-lg overflow-hidden bg-white shadow-sm">
            <DiffOverlaySheet
              before={BEFORE}
              after={AFTER}
              onDiffComputed={setDiff}
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* Change sidebar */}
      <div className="w-80 bg-white border-l shadow-sm flex flex-col">
        <ChangeSidebar diff={diff} />
      </div>
    </div>
  );
}
