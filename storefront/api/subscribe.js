module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  
  // Support both JSON and URL-encoded form data
  let email, source;
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      const json = JSON.parse(body);
      email = (json.email || '').trim().toLowerCase();
      source = (json.source || 'storefront').trim();
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  } else {
    const params = new URLSearchParams(body);
    email = (params.get('email') || '').trim().toLowerCase();
    source = (params.get('source') || 'storefront').trim();
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  // Persist to Supabase if configured, otherwise fall back to console log
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const resp = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({ email, source })
      });
      if (!resp.ok) {
        const err = await resp.text();
        console.error(`[SUBSCRIBER] Supabase error: ${err}`);
      }
    } catch (e) {
      console.error(`[SUBSCRIBER] Supabase failed: ${e.message}`);
    }
  }

  // Always log to console as backup
  console.log(`[SUBSCRIBER] ${new Date().toISOString()} ${email} (${source})`);

  // Return JSON for AJAX requests, HTML for form submissions
  if (contentType.includes('application/json')) {
    return res.status(200).json({ ok: true, email });
  }

  // Return success page for form submissions
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're on the list!</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0a0a0a; color: #e0e0e0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.card { text-align: center; max-width: 480px; padding: 40px; }
h1 { font-size: 2em; color: #4ade80; margin-bottom: 12px; }
p { color: #888; margin-bottom: 24px; }
a { color: #6366f1; text-decoration: none; }
</style></head><body><div class="card">
<h1>✓ You're on the list!</h1>
<p>We'll email you the moment the Playbook is available for purchase. Usually within days, not weeks.</p>
<p><a href="/">← Back to the Playbook</a></p>
</div></body></html>`);
};
