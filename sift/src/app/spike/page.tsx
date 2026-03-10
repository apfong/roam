'use client';

import dynamic from 'next/dynamic';

const UniverSheet = dynamic(() => import('@/components/UniverSheet'), {
  ssr: false,
  loading: () => <p className="p-8 text-gray-500">Loading spreadsheet engine…</p>,
});

export default function SpikePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Sift — Univer Spike</h1>
      <p className="text-gray-600 mb-6">
        Proving Univer renders an Excel-like spreadsheet inside Next.js.
      </p>
      <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
        <UniverSheet />
      </div>
    </div>
  );
}
