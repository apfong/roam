'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type ViewMode = 'split' | 'overlay';

interface PreviewPanelProps {
  originalUrl: string;
  fixedHtml: string | null;
  originalIssueCount: number;
  fixedIssueCount: number;
  loading?: boolean;
}

export function PreviewPanel({
  originalUrl,
  fixedHtml,
  originalIssueCount,
  fixedIssueCount,
  loading = false,
}: PreviewPanelProps) {
  const [mode, setMode] = useState<ViewMode>('split');
  const [overlayOpacity, setOverlayOpacity] = useState(50);

  if (loading) {
    return (
      <div className="border border-slate-200 rounded-lg p-8 text-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 text-sm">Generating preview...</p>
      </div>
    );
  }

  if (!fixedHtml) {
    return (
      <div className="border border-slate-200 rounded-lg p-8 text-center bg-slate-50">
        <p className="text-slate-500 text-sm">Preview will appear after fixes are generated</p>
      </div>
    );
  }

  const fixedBlobUrl = `data:text/html;charset=utf-8,${encodeURIComponent(fixedHtml)}`;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('split')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded',
              mode === 'split' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-300'
            )}
          >
            Split
          </button>
          <button
            onClick={() => setMode('overlay')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded',
              mode === 'overlay' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-300'
            )}
          >
            Overlay
          </button>
        </div>
      </div>

      {mode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Original */}
          <div className="border-r border-slate-200">
            <div className="flex items-center justify-between px-3 py-1 bg-red-50 border-b border-slate-200">
              <span className="text-xs font-medium text-red-700">Original</span>
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                {originalIssueCount} issues
              </span>
            </div>
            <iframe
              src={originalUrl}
              title="Original site preview"
              className="w-full h-[400px] md:h-[500px]"
              sandbox="allow-same-origin"
            />
          </div>
          {/* Fixed */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 bg-green-50 border-b border-slate-200">
              <span className="text-xs font-medium text-green-700">Fixed</span>
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                {fixedIssueCount} issues
              </span>
            </div>
            <iframe
              srcDoc={fixedHtml}
              title="Fixed site preview"
              className="w-full h-[400px] md:h-[500px]"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <span className="text-xs text-slate-500">Original</span>
            <input
              type="range"
              min={0}
              max={100}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-slate-500">Fixed</span>
          </div>
          <div className="relative h-[500px]">
            <iframe
              src={originalUrl}
              title="Original site preview"
              className="absolute inset-0 w-full h-full"
              sandbox="allow-same-origin"
            />
            <iframe
              srcDoc={fixedHtml}
              title="Fixed site preview"
              className="absolute inset-0 w-full h-full"
              style={{ opacity: overlayOpacity / 100 }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
