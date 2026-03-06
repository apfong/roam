'use client';

import { Nav } from '@/components/nav';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Scan results detail page.
 * In production, fetches from database by scan ID.
 * Currently shows a placeholder with link back to main scanner.
 */
export default function ScanDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Scan Report</h1>
        <p className="text-slate-600 mb-2">
          Scan ID: <code className="bg-slate-100 px-2 py-1 rounded text-sm">{id}</code>
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Full scan reports will be available when the database is connected.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors inline-block"
        >
          Run a New Scan
        </Link>
      </main>
    </div>
  );
}
