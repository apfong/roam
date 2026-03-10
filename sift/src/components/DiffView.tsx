'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { SheetInput, SheetDiff } from '@/lib/diff';
import ChangeSidebar from './ChangeSidebar';

const DiffOverlaySheet = dynamic(() => import('./DiffOverlaySheet'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-gray-400">Loading spreadsheet…</div>,
});

interface DiffViewProps {
  before: SheetInput;
  after: SheetInput;
  beforeName: string;
  afterName: string;
  onReset: () => void;
}

export default function DiffView({ before, after, beforeName, afterName, onReset }: DiffViewProps) {
  const [diff, setDiff] = useState<SheetDiff | null>(null);

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
        <div className="flex-1 p-4">
          <div className="h-full border rounded-lg overflow-hidden bg-white shadow-sm">
            <DiffOverlaySheet
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
        <ChangeSidebar diff={diff} />
      </div>
    </div>
  );
}
