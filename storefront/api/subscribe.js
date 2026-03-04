const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Parse body
  let body = '';
  for await (const chunk of req) body += chunk;
  const params = new URLSearchParams(body);
  const email = (params.get('email') || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  // Store in /tmp (Vercel serverless) — also log to console for persistence
  console.log(`[SUBSCRIBER] ${new Date().toISOString()} ${email}`);

  // Return success page
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
