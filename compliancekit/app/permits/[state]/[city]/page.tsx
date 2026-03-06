import { Metadata } from 'next';
import Link from 'next/link';
import { US_STATES } from '@/lib/types';

// Top FL cities for initial SEO pages
const FL_CITIES = [
  'Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St Petersburg',
  'Fort Lauderdale', 'Boca Raton', 'Naples', 'Hialeah', 'Kissimmee',
  'Tallahassee', 'Gainesville', 'Sarasota', 'Clearwater', 'Coral Springs',
  'Cape Coral', 'Lakeland', 'Port St Lucie', 'Pembroke Pines', 'Hollywood',
];

const BUSINESS_EXAMPLES = [
  { type: 'Restaurant', permits: '12-18', example: 'food service permit, liquor license, health inspection' },
  { type: 'Hair Salon', permits: '8-12', example: 'cosmetology license, salon permit, health dept approval' },
  { type: 'Construction', permits: '10-15', example: 'contractor license, building permits, OSHA compliance' },
  { type: 'Retail Store', permits: '8-12', example: 'sales tax permit, signage permit, occupancy certificate' },
  { type: 'Food Truck', permits: '10-16', example: 'mobile vendor license, commissary agreement, fire safety' },
  { type: 'Consulting LLC', permits: '5-8', example: 'professional license, local business tax receipt' },
];

export async function generateStaticParams() {
  // Generate pages for FL cities initially
  return FL_CITIES.map(city => ({
    state: 'FL',
    city: city.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: { params: { state: string; city: string } }): Promise<Metadata> {
  const city = params.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const stateName = US_STATES[params.state.toUpperCase() as keyof typeof US_STATES] || params.state;

  return {
    title: `Business Permits & Licenses in ${city}, ${stateName} (2026 Guide)`,
    description: `Find every permit and license you need to start a business in ${city}, ${stateName}. Free AI-powered research tool — get your complete checklist in 60 seconds.`,
    openGraph: {
      title: `What permits do you need in ${city}, ${stateName}?`,
      description: `Most businesses in ${city} need 8-15 permits. Find yours in 60 seconds.`,
    },
  };
}

export default function CityPermitsPage({ params }: { params: { state: string; city: string } }) {
  const city = params.city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const state = params.state.toUpperCase();
  const stateName = US_STATES[state as keyof typeof US_STATES] || state;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <h1 className="text-4xl font-bold mb-4">
        Business Permits & Licenses in {city}, {stateName}
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Starting a business in {city}? You likely need <strong>8-15 permits and licenses</strong> across
        federal, state, and local levels. Our AI research tool finds every one in 60 seconds.
      </p>

      {/* CTA */}
      <div className="bg-brand-50 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-3">Find Your Exact Permits</h2>
        <p className="text-gray-600 mb-4">
          Tell us your business type and get a complete checklist with costs, deadlines, and application links.
        </p>
        <Link
          href={`/?state=${state}&city=${encodeURIComponent(city)}`}
          className="inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-700"
        >
          Get My Permit List (Free) →
        </Link>
      </div>

      {/* Common permits section */}
      <h2 className="text-2xl font-bold mb-6">Common Permits by Business Type in {city}</h2>
      <div className="space-y-4 mb-12">
        {BUSINESS_EXAMPLES.map(biz => (
          <div key={biz.type} className="border rounded-lg p-5">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{biz.type}</h3>
              <span className="text-brand-600 font-bold">{biz.permits} permits</span>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Typically includes: {biz.example}
            </p>
            <Link
              href={`/?state=${state}&city=${encodeURIComponent(city)}&type=${biz.type.toLowerCase().replace(/\s+/g, '_')}`}
              className="text-brand-600 text-sm hover:underline mt-2 inline-block"
            >
              See full list for {biz.type} →
            </Link>
          </div>
        ))}
      </div>

      {/* Universal permits */}
      <h2 className="text-2xl font-bold mb-6">Permits Every {city} Business Needs</h2>
      <div className="bg-white border rounded-xl p-6 mb-12">
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <strong>EIN (Employer Identification Number)</strong>
              <p className="text-sm text-gray-600">Free from IRS — required for bank accounts and hiring</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <strong>{stateName} Business Registration</strong>
              <p className="text-sm text-gray-600">File with Secretary of State — LLC, Corp, or Partnership</p>
            </div>
          </li>
          {state === 'FL' && (
            <li className="flex gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Florida Sales Tax Permit</strong>
                <p className="text-sm text-gray-600">Free from FL Dept of Revenue — required if selling taxable goods</p>
              </div>
            </li>
          )}
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <strong>{city} Local Business Tax Receipt</strong>
              <p className="text-sm text-gray-600">Required by most {city} businesses — apply through city/county</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <strong>Zoning Approval / Certificate of Use</strong>
              <p className="text-sm text-gray-600">Verify your business location is zoned for your activity</p>
            </div>
          </li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold mb-6">FAQ: {city} Business Permits</h2>
      <div className="space-y-4 mb-12">
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">How many permits does a typical {city} business need?</summary>
          <p className="mt-2 text-gray-600">Most businesses in {city}, {stateName} need between 8 and 15 permits across federal, state, and local levels. The exact number depends on your business type, whether you have employees, and your specific industry.</p>
        </details>
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">How much do business permits cost in {city}?</summary>
          <p className="mt-2 text-gray-600">Total permit costs typically range from $200-$2,000 for a small business. Some permits are free (like EIN), while others like liquor licenses can cost $1,000+. Our report breaks down costs for each permit you need.</p>
        </details>
        <details className="border rounded-lg p-4">
          <summary className="font-semibold cursor-pointer">What happens if I operate without the required permits?</summary>
          <p className="mt-2 text-gray-600">Operating without required permits can result in fines, forced closure, and legal liability. In {stateName}, penalties vary by permit type but can range from $100 to $10,000+.</p>
        </details>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Don't risk missing a required permit</h2>
        <p className="mb-6 opacity-90">
          Our AI researches federal, state, and {city} requirements in 60 seconds.
        </p>
        <Link
          href={`/?state=${state}&city=${encodeURIComponent(city)}`}
          className="inline-block bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100"
        >
          Find My Permits (Free) →
        </Link>
      </div>

      {/* Schema markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `Business Permits in ${city}, ${stateName}`,
            description: `Complete guide to permits and licenses needed for businesses in ${city}, ${stateName}.`,
            mainEntity: {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `How many permits does a ${city} business need?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Most businesses in ${city} need 8-15 permits.`,
                  },
                },
              ],
            },
          }),
        }}
      />
    </div>
  );
}
