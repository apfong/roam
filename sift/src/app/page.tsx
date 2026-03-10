'use client';

import { useState, useCallback } from 'react';
import type { SheetInput } from '@/lib/diff/types';
import { parseWorkbook } from '@/lib/xlsx-parser';
import DiffView from '@/components/DiffView';

type Stage = 'upload-before' | 'upload-after' | 'diffing';

interface FileState {
  sheets: SheetInput[];
  fileName: string;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('upload-before');
  const [beforeFile, setBeforeFile] = useState<FileState | null>(null);
  const [afterFile, setAfterFile] = useState<FileState | null>(null);

  const handleFile = useCallback(async (file: File, target: 'before' | 'after') => {
    const buffer = await file.arrayBuffer();
    const parsed = parseWorkbook(buffer, file.name);
    if (parsed.sheets.length === 0) return;

    if (target === 'before') {
      setBeforeFile(parsed);
      setStage('upload-after');
    } else {
      setAfterFile(parsed);
      setStage('diffing');
    }
  }, []);

  const reset = useCallback(() => {
    setBeforeFile(null);
    setAfterFile(null);
    setStage('upload-before');
  }, []);

  if (stage === 'diffing' && beforeFile && afterFile) {
    return (
      <DiffView
        before={beforeFile.sheets[0]}
        after={afterFile.sheets[0]}
        beforeName={beforeFile.fileName}
        afterName={afterFile.fileName}
        onReset={reset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sift</h1>
          <p className="text-lg text-gray-600">
            See exactly what changed between two spreadsheets.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Cell-level diffs, formula tracking, AI summaries.
          </p>
        </div>

        {stage === 'upload-before' && (
          <UploadCard
            title="Upload the original file"
            subtitle="The &ldquo;before&rdquo; version"
            onFile={(f) => handleFile(f, 'before')}
          />
        )}

        {stage === 'upload-after' && (
          <div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
              <span>✓</span>
              <span><strong>{beforeFile!.fileName}</strong> loaded ({beforeFile!.sheets.length} sheet{beforeFile!.sheets.length > 1 ? 's' : ''})</span>
            </div>
            <UploadCard
              title="Now upload the updated file"
              subtitle="The &ldquo;after&rdquo; version"
              onFile={(f) => handleFile(f, 'after')}
            />
            <button
              onClick={reset}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 mx-auto block"
            >
              ← Start over
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Files are processed locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}

function UploadCard({ title, subtitle, onFile }: { title: string; subtitle: string; onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
        dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv,.ods';
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) onFile(file);
        };
        input.click();
      }}
    >
      <div className="text-4xl mb-3">📊</div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      <p className="text-xs text-gray-400">
        Drop a file here or click to browse<br />
        .xlsx, .xls, .csv, .ods
      </p>
    </div>
  );
}
