/**
 * Type-safe database query functions.
 * Uses Supabase client. Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string | null;
  url: string;
  created_at: string;
  duration_ms: number;
  violation_count: number;
}

export interface ScanResultRow {
  id: string;
  scan_id: string;
  rule_id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  html: string | null;
  target: string[];
  fix_html: string | null;
  fix_explanation: string | null;
  confidence: 'high' | 'medium' | 'low' | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  current_period_end: string | null;
}

// Supabase client factory — returns null if not configured
function getSupabaseClient(): { from: (table: string) => Record<string, unknown> } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // Dynamic import to avoid bundling issues; in production use @supabase/supabase-js
  return null; // Placeholder — wire up when Supabase is configured
}

export async function createUser(email: string): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  // INSERT INTO users (email) VALUES ($1) RETURNING *
  return null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  return null;
}

export async function createScan(params: {
  userId?: string;
  url: string;
  durationMs: number;
  violationCount: number;
}): Promise<Scan | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  return null;
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  return null;
}

export async function upsertSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: Subscription['status'];
  currentPeriodEnd: string;
}): Promise<Subscription | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  return null;
}
