-- ComplianceKit Database Schema (Supabase/PostgreSQL)

CREATE TABLE IF NOT EXISTS research_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'researching', 'complete', 'error')),
  permits JSONB NOT NULL DEFAULT '[]',
  cache_key TEXT NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  payment_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_research_cache_key ON research_requests(cache_key);
CREATE INDEX idx_research_status ON research_requests(status);
CREATE INDEX idx_research_created ON research_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  report_id UUID REFERENCES research_requests(id),
  amount_cents INTEGER NOT NULL,
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_report ON payments(report_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_session_id);

CREATE TABLE IF NOT EXISTS permit_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES research_requests(id),
  permit_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'obtained')),
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_report ON permit_checklist(report_id);

-- Cache table for research results
CREATE TABLE IF NOT EXISTS research_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 days')
);

CREATE INDEX idx_cache_expires ON research_cache(expires_at);
