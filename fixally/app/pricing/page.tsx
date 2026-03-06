'use client';

import { Nav } from '@/components/nav';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try it out on any site',
    features: [
      'Unlimited scans',
      '3 code fixes per scan',
      'Severity breakdown',
      'WCAG rule references',
    ],
    excluded: [
      'Full fix report',
      'Platform instructions',
      'Live preview',
      'Priority support',
      'API access',
    ],
    cta: 'Get Started Free',
    href: '/',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'For small business websites',
    features: [
      'Unlimited scans',
      'All code fixes (unlimited)',
      'Platform-specific instructions',
      'Live side-by-side preview',
      'Export reports (JSON, CSV)',
      'Scan history & dashboard',
      'Email support',
    ],
    excluded: [
      'API access',
      'Custom integrations',
    ],
    cta: 'Start Free Trial',
    href: '/login',
    highlighted: true,
    priceId: 'price_starter',
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/mo',
    description: 'For agencies & developers',
    features: [
      'Everything in Starter',
      'API access',
      'Bulk scanning (up to 50 URLs)',
      'AI-powered fixes for complex issues',
      'Custom integrations',
      'Priority support',
      'White-label reports',
    ],
    excluded: [],
    cta: 'Start Free Trial',
    href: '/login',
    highlighted: false,
    priceId: 'price_pro',
  },
];

const FAQ = [
  {
    q: 'What accessibility issues do you detect?',
    a: 'We scan for WCAG 2.1 Level A and AA violations including missing alt text, color contrast issues, missing form labels, heading order problems, missing landmarks, and more. We cover the most common issues that lead to ADA lawsuits.',
  },
  {
    q: 'How do the code fixes work?',
    a: 'Our rule engine generates exact HTML patches for each violation. You get before/after code diffs with copy-to-clipboard. For complex issues, our AI generates contextual fixes. Each fix includes the relevant WCAG criterion.',
  },
  {
    q: 'What platforms do you support?',
    a: 'We auto-detect WordPress, Shopify, Squarespace, Webflow, and Framer sites and provide platform-specific instructions for applying fixes (e.g., which theme file to edit in WordPress).',
  },
  {
    q: 'Is a free scan really free?',
    a: 'Yes! The free scan gives you a complete WCAG audit with severity breakdown. You get 3 code fixes per scan. Upgrade anytime to unlock all fixes, previews, and platform instructions.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. No long-term contracts. Cancel from your dashboard and your subscription ends at the current billing period.',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free. Upgrade when you need full fixes, previews, and platform instructions.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'rounded-lg border p-6 flex flex-col',
                tier.highlighted
                  ? 'border-indigo-600 bg-white shadow-lg ring-2 ring-indigo-600'
                  : 'border-slate-200 bg-white'
              )}
            >
              {tier.highlighted && (
                <span className="text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-full self-start mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                <span className="text-slate-500 text-sm">{tier.period}</span>
              </div>
              <p className="text-sm text-slate-600 mb-6">{tier.description}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-slate-700">{f}</span>
                  </li>
                ))}
                {tier.excluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-slate-300 mt-0.5">✗</span>
                    <span className="text-slate-400">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.href}
                className={cn(
                  'block text-center px-4 py-3 rounded-lg font-semibold transition-colors',
                  tier.highlighted
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-slate-900 text-sm">{item.q}</span>
                  <span className="text-slate-400">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm text-slate-600">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-slate-400">
          © 2026 FixA11y by Oddly Useful. Free WCAG accessibility scanning.
        </div>
      </footer>
    </div>
  );
}
