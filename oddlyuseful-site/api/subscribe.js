export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let body = '';
  for await (const chunk of req) body += chunk;

  const contentType = (req.headers['content-type'] || '').toLowerCase();
  let email, source;
  if (contentType.includes('application/json')) {
    try {
      const json = JSON.parse(body);
      email = (json.email || '').trim().toLowerCase();
      source = (json.source || 'site').trim();
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  } else {
    const params = new URLSearchParams(body);
    email = (params.get('email') || '').trim().toLowerCase();
    source = (params.get('source') || 'site').trim();
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  // Log subscriber (Vercel function logs)
  console.log(`[SUBSCRIBER] ${new Date().toISOString()} ${email} (${source})`);

  // Return success page for form submissions
  if (!contentType.includes('application/json')) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're on the list!</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#fafafa;color:#1a1a2e;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{text-align:center;max-width:480px;padding:40px}
h1{font-size:2em;color:#6c5ce7;margin-bottom:12px}
p{color:#666;margin-bottom:24px;line-height:1.6}
a{color:#6c5ce7;text-decoration:none}
</style></head><body><div class="card">
<h1>✓ You're on the list!</h1>
<p>We'll let you know when new tools and guides launch. No spam — just the good stuff.</p>
<p><a href="/">← Back to Oddly Useful</a></p>
</div></body></html>`);
  }

  return res.status(200).json({ ok: true, email });
};
