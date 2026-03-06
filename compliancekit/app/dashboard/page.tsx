'use client';

import { useEffect, useState } from 'react';

interface ReportSummary {
  id: string;
  businessType: string;
  city: string;
  state: string;
  permitCount: number;
  status: string;
  paid: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          setReports(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
          <p className="text-gray-600 mb-4">Run your first permit scan to get started.</p>
          <a href="/" className="text-brand-600 hover:underline font-medium">
            Find My Permits →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <a
              key={report.id}
              href={`/report/${report.id}`}
              className="block bg-white rounded-lg border p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold capitalize">
                    {report.businessType.replace(/_/g, ' ')} — {report.city}, {report.state}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.permitCount} permits found • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.status === 'complete' ? 'bg-green-100 text-green-800' :
                    report.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  {report.paid && (
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-800">
                      Paid
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
