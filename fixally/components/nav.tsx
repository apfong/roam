'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';

export function Nav() {
  const { user, signOut, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-slate-900">
          Fix<span className="text-indigo-600">A11y</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
            Pricing
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Sign Out
              </button>
              <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
