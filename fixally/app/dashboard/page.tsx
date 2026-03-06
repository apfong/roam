'use client';

import { Nav } from '@/components/nav';
import { ProtectedRoute } from '@/lib/auth/protected';
import { EmptyState } from '@/components/error-state';
import { DashboardSkeleton } from '@/components/loading-skeleton';
import { MOCK_SCANS, MOCK_SUBSCRIPTION } from '@/lib/mock-data';
import type { DashboardScan, SubscriptionInfo } from '@/lib/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
};

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-slate-100 text-slate-600' },
  starter: { label: 'Starter', color: 'bg-indigo-100 text-indigo-700' },
  pro: { label: 'Pro', color: 'bg-purple-100 text-purple-700' },
};

function ScanRow({ scan }: { scan: DashboardScan }) {
  const date = new Date(scan.scannedAt);
  return (
    <Link
      href={`/scan/${scan.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{scan.url}</div>
        <div className="text-sm text-slate-500">
          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-slate-900">{scan.violationCount}</div>
        <div className="text-xs text-slate-500">issues</div>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_COLORS[scan.status]}`}>
        {scan.status}
      </span>
    </Link>
  );
}

function DashboardContent() {
  const [scans, setScans] = useState<DashboardScan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock: load data after a brief delay
    const timer = setTimeout(() => {
      setScans(MOCK_SCANS);
      setSubscription(MOCK_SUBSCRIPTION);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  const tierInfo = TIER_LABELS[subscription?.tier || 'free'];

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
        <div>
          <span className="text-sm text-slate-500">Current Plan:</span>{' '}
          <span className={`text-sm font-semibold px-2 py-1 rounded ${tierInfo.color}`}>
            {tierInfo.label}
          </span>
        </div>
        {subscription?.tier === 'free' && (
          <Link
            href="/pricing"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Upgrade →
          </Link>
        )}
      </div>

      {/* New Scan CTA */}
      <Link
        href="/"
        className="block text-center px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        + New Scan
      </Link>

      {/* Scan History */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Scans</h2>
        {scans.length === 0 ? (
          <EmptyState
            message="No scans yet. Run your first accessibility scan!"
            action={{ label: 'Scan a Website', href: '/' }}
          />
        ) : (
          <div className="space-y-2">
            {scans.map((scan) => (
              <ScanRow key={scan.id} scan={scan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Nav />
        <main className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
          <DashboardContent />
        </main>
      </div>
    </ProtectedRoute>
  );
}
