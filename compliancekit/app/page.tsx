'use client';

import { useState } from 'react';
import { BUSINESS_TYPES, ENTITY_TYPES, EMPLOYEE_COUNTS, US_STATES, BUSINESS_ACTIVITIES } from '@/lib/types';
import type { BusinessType } from '@/lib/types';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      businessType: form.get('businessType'),
      businessActivities: form.getAll('businessActivities'),
      state: form.get('state'),
      city: form.get('city'),
      county: form.get('county') || undefined,
      entityType: form.get('entityType'),
      homeBased: form.get('homeBased') === 'on',
      employeeCount: form.get('employeeCount'),
      businessName: form.get('businessName') || undefined,
    };

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Something went wrong');
      }

      const result = await res.json();
      window.location.href = `/report/${result.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const activities = businessType ? BUSINESS_ACTIVITIES[businessType] ?? [] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Starting a business?<br />
          <span className="text-brand-600">Find every permit you need in 60 seconds.</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us your business type and location. Our AI research agent finds every permit,
          license, and registration required — with direct links, costs, and deadlines.
        </p>
      </section>

      {/* Intake Form */}
      <section className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8" id="intake-form">
        <h2 className="text-2xl font-semibold mb-6">Tell us about your business</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="My Business LLC"
            />
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              id="businessType"
              name="businessType"
              required
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select business type...</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Business Activities */}
          {activities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Activities
              </label>
              <div className="flex flex-wrap gap-2">
                {activities.map((a) => (
                  <label key={a} className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-200">
                    <input type="checkbox" name="businessActivities" value={a} className="rounded" />
                    {a.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* State + City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select state...</option>
                {Object.entries(US_STATES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                minLength={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500"
                placeholder="Austin"
              />
            </div>
          </div>

          {/* County */}
          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
              County <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="county"
              name="county"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500"
              placeholder="Travis County"
            />
          </div>

          {/* Entity Type + Employee Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 mb-1">
                Entity Type
              </label>
              <select
                id="entityType"
                name="entityType"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500"
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'sole_prop' ? 'Sole Proprietor' : t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-1">
                Employees
              </label>
              <select
                id="employeeCount"
                name="employeeCount"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500"
              >
                {EMPLOYEE_COUNTS.map((c) => (
                  <option key={c} value={c}>{c === '0' ? 'Just me (0)' : c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Home-based */}
          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="homeBased" className="rounded" />
              <span className="text-sm text-gray-700">This is a home-based business</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Researching your permits...' : 'Find My Permits →'}
          </button>
        </form>
      </section>

      {/* How it works */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-bold mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Tell us about your business', desc: 'Business type, location, and a few details.' },
            { step: '2', title: 'AI researches your requirements', desc: 'Our agent searches federal, state, and local sources in seconds.' },
            { step: '3', title: 'Get your complete permit list', desc: 'Every permit with costs, links, and deadlines. Download as PDF.' },
          ].map((item) => (
            <div key={item.step} className="p-6">
              <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mt-20 text-center" id="pricing">
        <h2 className="text-2xl font-bold mb-8">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="font-bold text-lg mb-2">Free Summary</h3>
            <p className="text-3xl font-bold mb-4">$0</p>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>✓ Total permit count</li>
              <li>✓ Category breakdown</li>
              <li>✓ 2 sample permits in detail</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-brand-600 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="font-bold text-lg mb-2">Standard Report</h3>
            <p className="text-3xl font-bold mb-4">$99</p>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>✓ Full permit list with details</li>
              <li>✓ Direct application links</li>
              <li>✓ Cost estimates</li>
              <li>✓ PDF download</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="font-bold text-lg mb-2">Premium Report</h3>
            <p className="text-3xl font-bold mb-4">$149</p>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>✓ Everything in Standard</li>
              <li>✓ Suggested filing order</li>
              <li>✓ 1 email Q&A session</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
