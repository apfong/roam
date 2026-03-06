'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Mock/stub auth provider. Uses localStorage for persistence.
 * Replace with real Supabase auth when keys are available.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    try {
      const stored = localStorage.getItem('fixally_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid email address' };
    }

    // Mock: create a user session immediately
    // In production, this sends a magic link via Supabase
    const mockUser: AuthUser = {
      id: `user_${btoa(email).slice(0, 12)}`,
      email,
    };

    setUser(mockUser);
    localStorage.setItem('fixally_user', JSON.stringify(mockUser));

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('fixally_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
