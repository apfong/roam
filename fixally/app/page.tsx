"use client";

import { useState } from "react";

interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

interface Violation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string[];
  nodes: ViolationNode[];
}

interface ScanResult {
  url: string;
  scannedAt: string;
  duration: number;
  violations: Violation[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  error?: string;
}

const impactColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  serious: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  moderate: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  minor: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
};

const impactEmoji: Record<string, string> = {
  critical: "🔴",
  serious: "🟠",
  moderate: "🟡",
  minor: "🔵",
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedViolations(new Set());

    let scanUrl = url.trim();
    if (!scanUrl.startsWith("http://") && !scanUrl.startsWith("https://")) {
      scanUrl = "https://" + scanUrl;
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl }),
      });
      const data = await res.json();
      if (!res.ok && !data.result) {
        setError(data.error || "Scan failed");
      } else {
        setResult(data.result || data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleViolation = (id: string) => {
    setExpandedViolations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Fix<span className="text-indigo-600">A11y</span>
          </h1>
          <span className="text-sm text-slate-500">Free Accessibility Scanner</span>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Find accessibility issues in seconds
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enter any URL to get a free WCAG compliance audit. We scan for{" "}
            <strong>critical, serious, moderate,</strong> and <strong>minor</strong> violations
            that could affect your users — and expose you to lawsuits.
          </p>
        </div>

        {/* Scan Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleScan()}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              disabled={loading}
            />
            <button
              onClick={handleScan}
              disabled={loading || !url.trim()}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg whitespace-nowrap"
            >
              {loading ? "Scanning..." : "Scan"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-600 text-lg">
              Scanning your site for accessibility issues...
            </p>
            <p className="text-slate-400 text-sm mt-2">This usually takes 10-30 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {(["critical", "serious", "moderate", "minor"] as const).map((level) => (
                <div
                  key={level}
                  className={`p-4 rounded-lg border ${impactColors[level].bg} ${impactColors[level].border}`}
                >
                  <div className={`text-3xl font-bold ${impactColors[level].text}`}>
                    {result.summary[level]}
                  </div>
                  <div className={`text-sm font-medium capitalize ${impactColors[level].text}`}>
                    {level}
                  </div>
                </div>
              ))}
              <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                <div className="text-3xl font-bold text-slate-900">{result.summary.total}</div>
                <div className="text-sm font-medium text-slate-600">Total Issues</div>
              </div>
            </div>

            {/* Scan Meta */}
            <div className="text-sm text-slate-500 mb-6">
              Scanned <strong>{result.url}</strong> in{" "}
              {(result.duration / 1000).toFixed(1)}s
            </div>

            {/* Violation List */}
            {result.violations.length === 0 ? (
              <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-green-700 font-semibold text-lg">
                  No accessibility violations found!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">Violations</h3>
                {result.violations
                  .sort((a, b) => {
                    const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
                    return order[a.impact] - order[b.impact];
                  })
                  .map((v) => (
                    <div
                      key={v.id}
                      className={`border rounded-lg overflow-hidden ${impactColors[v.impact].border}`}
                    >
                      <button
                        className={`w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors`}
                        onClick={() => toggleViolation(v.id)}
                      >
                        <span>{impactEmoji[v.impact]}</span>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{v.help}</div>
                          <div className="text-sm text-slate-500">
                            {v.nodes.length} element{v.nodes.length !== 1 ? "s" : ""} affected
                            &middot; <code className="text-xs bg-slate-100 px-1 rounded">{v.id}</code>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${impactColors[v.impact].bg} ${impactColors[v.impact].text}`}
                        >
                          {v.impact}
                        </span>
                        <span className="text-slate-400">
                          {expandedViolations.has(v.id) ? "▲" : "▼"}
                        </span>
                      </button>

                      {expandedViolations.has(v.id) && (
                        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
                          <p className="text-sm text-slate-600">{v.description}</p>
                          <a
                            href={v.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Learn how to fix this →
                          </a>
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-700">
                              Affected Elements:
                            </h4>
                            {v.nodes.slice(0, 5).map((node, i) => (
                              <div
                                key={i}
                                className="bg-white border border-slate-200 rounded p-3"
                              >
                                <code className="text-xs text-slate-700 block overflow-x-auto whitespace-pre-wrap break-all">
                                  {node.html}
                                </code>
                                {node.failureSummary && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    {node.failureSummary}
                                  </p>
                                )}
                              </div>
                            ))}
                            {v.nodes.length > 5 && (
                              <p className="text-xs text-slate-400">
                                + {v.nodes.length - 5} more elements
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 text-center p-8 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Want code fixes for every issue?
              </h3>
              <p className="text-slate-600 mb-4">
                Upgrade to get exact code patches, platform-specific instructions, and a
                live preview of your fixed site.
              </p>
              <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                Get Full Report — Starting at $49/mo
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-slate-400">
          © 2026 FixA11y by Oddly Useful. Free WCAG accessibility scanning.
        </div>
      </footer>
    </div>
  );
}
