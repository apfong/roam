import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-gray-900">Sift</div>
        <Link
          href="/app"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Try it free →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          100% client-side • No uploads • Free
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          See exactly what changed<br />between two spreadsheets
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Drop two files. Get a cell-by-cell diff with formula tracking,
          AI-powered change summaries, and zero data leaving your browser.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/app"
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            Compare spreadsheets →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Three steps. Zero setup.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '📤',
              title: '1. Upload the original',
              desc: 'Drop your "before" spreadsheet — XLSX, CSV, or ODS.',
            },
            {
              icon: '📥',
              title: '2. Upload the update',
              desc: 'Drop the revised version. Sift parses both instantly in your browser.',
            },
            {
              icon: '🔍',
              title: '3. See every change',
              desc: 'Cell-level diffs color-coded: green for additions, red for deletions, yellow for modifications.',
            },
          ].map((step) => (
            <div key={step.title} className="text-center p-6">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Built for spreadsheet pros</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Formula tracking',
                desc: 'See when a formula changed, not just the computed value. Catch =SUM → hardcoded swaps instantly.',
                icon: '🧮',
              },
              {
                title: 'AI change summaries',
                desc: 'Natural-language descriptions of what changed and why it might matter. No more squinting at cells.',
                icon: '🤖',
              },
              {
                title: 'Multi-sheet support',
                desc: 'Compare workbooks with multiple tabs. Navigate changes across sheets with the sidebar.',
                icon: '📑',
              },
              {
                title: 'Privacy-first',
                desc: 'Everything runs in your browser. Your files never leave your machine. No accounts, no servers.',
                icon: '🔒',
              },
              {
                title: 'Row & column changes',
                desc: 'Detect inserted, deleted, and moved rows — not just value changes.',
                icon: '↕️',
              },
              {
                title: 'Change sidebar',
                desc: 'Browse all changes in a filterable list. Jump to any change with one click.',
                icon: '📋',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Who it&apos;s for</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { role: 'Finance teams', example: 'Audit budget revisions before sign-off' },
            { role: 'Accountants', example: 'Catch changes between draft and final reports' },
            { role: 'Operations', example: 'Track inventory or pricing updates from vendors' },
          ].map((u) => (
            <div key={u.role}>
              <h3 className="font-semibold text-gray-900 mb-1">{u.role}</h3>
              <p className="text-gray-500 text-sm">{u.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Stop eyeballing spreadsheets</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Free, private, instant. No sign-up required.
          </p>
          <Link
            href="/app"
            className="inline-block bg-white text-blue-700 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Compare spreadsheets →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
        <span>© 2026 Oddly Useful</span>
        <span>Built with care. Your data stays yours.</span>
      </footer>
    </div>
  );
}
