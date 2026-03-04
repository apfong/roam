-- Subscriber email list for storefront + oddlyuseful.io
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  source text DEFAULT 'storefront',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);

-- RLS: only service role can insert/read
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
-- No public policies = service role only access
