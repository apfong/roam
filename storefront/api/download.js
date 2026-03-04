const Stripe = require('stripe');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { session_id, token } = req.query;
  if (!session_id || !token) return res.status(400).send('Missing parameters');

  // Verify token
  const secret = process.env.DOWNLOAD_SECRET || process.env.STRIPE_SECRET_KEY;
  const expected = crypto.createHmac('sha256', secret).update(session_id).digest('hex');
  if (token !== expected) return res.status(403).send('Invalid download link.');

  // Verify payment is still valid
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(402).send('Payment not verified.');
    }
  } catch (err) {
    return res.status(403).send('Invalid session.');
  }

  // Serve PDF
  // On Vercel, bundle the PDF or use external storage.
  // For now, try local file (works in dev) or redirect to hosted URL.
  const pdfUrl = process.env.PDF_URL;
  if (pdfUrl) {
    return res.redirect(302, pdfUrl);
  }

  const pdfPath = path.join(__dirname, '..', 'assets', 'playbook.pdf');
  if (fs.existsSync(pdfPath)) {
    const stat = fs.statSync(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', 'attachment; filename="autonomous-agent-playbook.pdf"');
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    res.status(500).send('PDF not found. Contact support.');
  }
};
