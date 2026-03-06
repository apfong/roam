'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Permit } from '@/lib/types';

interface ReportData {
  id: string;
  status: string;
  intake: {
    businessType: string;
    state: string;
    city: string;
    businessName?: string;
  };
  permitCount?: number;
  permits?: Permit[];
  samplePermits?: Permit[];
  categories: Record<string, number>;
  jurisdictions: Record<string, number>;
  totalCost: { low: number; high: number };
  paid: boolean;
}

function PermitCard({ permit }: { permit: Permit }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{permit.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          permit.confidence === 'high' ? 'bg-green-100 text-green-800' :
          permit.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-600'
        }`}>
          {permit.confidence}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{permit.issuingAuthority}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Jurisdiction:</span>{' '}
          <span className="capitalize">{permit.jurisdiction}</span>
        </div>
        <div>
          <span className="text-gray-500">Cost:</span> {permit.estimatedCost}
        </div>
        <div>
          <span className="text-gray-500">Processing:</span> {permit.processingTime}
        </div>
        <div>
          <span className="text-gray-500">Renewal:</span> {permit.renewalPeriod}
        </div>
      </div>
      {permit.prerequisites.length > 0 && (
        <div className="mt-3 text-sm">
          <span className="text-gray-500">Prerequisites:</span>{' '}
          {permit.prerequisites.join(', ')}
        </div>
      )}
      <div className="mt-3 text-sm">
        <span className="text-gray-500">Deadline:</span> {permit.deadline}
      </div>
      {permit.url && (
        <a
          href={permit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-brand-600 hover:underline"
        >
          Apply / Learn more →
        </a>
      )}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/report/${params.id}`);
        if (res.ok) {
          setReport(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [params.id]);

  async function handlePayment(tier: 'standard' | 'premium') {
    setPayLoading(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: params.id, tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setPayLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse text-lg">Researching your permits...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Report not found</h1>
      </div>
    );
  }

  const permitCount = report.paid ? report.permits?.length ?? 0 : report.permitCount ?? 0;
  const displayPermits = report.paid ? report.permits ?? [] : report.samplePermits ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Your Permit Report
        </h1>
        <p className="text-gray-600">
          {report.intake.businessName && `${report.intake.businessName} — `}
          {report.intake.businessType.replace(/_/g, ' ')} in {report.intake.city}, {report.intake.state}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-brand-50 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          You need <span className="text-brand-600 text-3xl font-bold">{permitCount}</span> permits and licenses
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(report.jurisdictions).map(([jur, count]) => (
            <div key={jur} className="text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{jur}</div>
            </div>
          ))}
        </div>
        {report.totalCost.high > 0 && (
          <p className="mt-4 text-sm text-gray-600">
            Estimated total cost: ${report.totalCost.low.toLocaleString()} – ${report.totalCost.high.toLocaleString()}
          </p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">By Category</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(report.categories).map(([cat, count]) => (
            <div key={cat} className="bg-white border rounded-lg px-4 py-2 text-sm">
              <span className="font-medium capitalize">{cat.replace(/_/g, ' ')}</span>
              <span className="ml-2 text-brand-600 font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Permits */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {report.paid ? 'All Permits & Licenses' : 'Sample Permits'}
        </h2>
        <div className="space-y-4">
          {displayPermits.map((permit) => (
            <PermitCard key={permit.id} permit={permit} />
          ))}
        </div>
      </div>

      {/* Paywall */}
      {!report.paid && (
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Unlock Your Full Report</h2>
          <p className="mb-6 opacity-90">
            See all {permitCount} permits with direct application links, costs, and deadlines.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handlePayment('standard')}
              disabled={payLoading}
              className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Standard Report — $99
            </button>
            <button
              onClick={() => handlePayment('premium')}
              disabled={payLoading}
              className="bg-brand-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-800 disabled:opacity-50"
            >
              Premium — $149
            </button>
          </div>
        </div>
      )}

      {/* PDF Download (paid) */}
      {report.paid && (
        <div className="text-center">
          <a
            href={`/api/report/${report.id}/pdf`}
            className="inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-700"
          >
            Download PDF Report
          </a>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-12 text-xs text-gray-400 text-center">
        This report is for informational purposes only and does not constitute legal advice.
        Requirements may change. Always verify with the issuing authority before applying.
      </p>
    </div>
  );
}
