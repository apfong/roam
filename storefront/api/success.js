const Stripe = require('stripe');
const crypto = require('crypto');

// In production, use a database. For now, tokens are ephemeral per instance.
// The PDF URL is generated as a signed token that encodes the session ID.
function generateDownloadUrl(host, sessionId) {
  const secret = process.env.DOWNLOAD_SECRET || process.env.STRIPE_SECRET_KEY;
  const token = crypto.createHmac('sha256', secret).update(sessionId).digest('hex');
  return `${host}/api/download?session_id=${encodeURIComponent(sessionId)}&token=${token}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).send('Missing session');

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const host = `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(402).send('Payment not completed.');
    }

    const downloadUrl = generateDownloadUrl(host, sessionId);

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Thank You</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0a0a0a; color: #e0e0e0; line-height: 1.6; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.container { max-width: 520px; text-align: center; padding: 40px 20px; }
h1 { font-size: 1.8em; color: #fff; margin-bottom: 16px; }
p { color: #888; margin-bottom: 24px; }
.download-btn { display: inline-block; background: #4ade80; color: #0a0a0a; padding: 14px 40px; border-radius: 8px; font-size: 1.1em; font-weight: 600; text-decoration: none; }
.note { font-size: 0.8em; color: #555; margin-top: 20px; }
</style></head><body><div class="container">
<h1>You're in! 🎉</h1>
<p>Thank you for purchasing The Autonomous Agent Playbook. Your download is ready.</p>
<a href="${downloadUrl}" class="download-btn">Download PDF →</a>
<p class="note">This link is unique to your purchase. Bookmark it — you can re-download anytime.</p>
</div></body></html>`);
  } catch (err) {
    console.error('Session verify error:', err.message);
    res.status(500).send('Error verifying payment.');
  }
};
