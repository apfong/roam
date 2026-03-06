'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/nav';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(email);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
      // Mock: redirect immediately since we auto-sign-in
      setTimeout(() => router.push('/dashboard'), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Nav />
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign In</h1>
          <p className="text-sm text-slate-600 mb-6">
            Enter your email to receive a magic link. No password needed.
          </p>

          {sent ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">✉️</div>
              <p className="text-green-700 font-medium">Signed in successfully!</p>
              <p className="text-sm text-slate-500 mt-1">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
