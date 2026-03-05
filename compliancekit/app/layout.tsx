import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ComplianceKit — Find Every Permit Your Business Needs',
  description: 'Starting a business? Find every permit, license, and registration you need in 60 seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-brand-700">
              ComplianceKit
            </a>
            <nav className="flex gap-6 text-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-200 mt-20 py-8 text-center text-sm text-gray-500">
          <p>© 2026 Oddly Useful. ComplianceKit is for informational purposes only — not legal advice.</p>
        </footer>
      </body>
    </html>
  );
}
