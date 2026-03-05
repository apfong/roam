export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, idea, details, plan } = req.body || {};

  if (!name || !email || !idea || !plan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log to Supabase if available, otherwise console
  const submission = { name, email, idea, details, plan, submitted_at: new Date().toISOString() };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/validation_orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(submission)
      });
    } catch (e) {
      console.error('Supabase insert failed:', e.message);
    }
  }

  // Always log to console as backup
  console.log('VALIDATION_ORDER:', JSON.stringify(submission));

  return res.status(200).json({ success: true, message: 'Order received' });
}
