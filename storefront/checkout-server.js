/**
 * Minimal Stripe checkout server for The Autonomous Agent Playbook.
 * Run: STRIPE_SECRET_KEY=$(cat ~/.config/stripe/secret_key) node checkout-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3456;
const HOST = process.env.HOST || 'http://localhost:3456';
const PDF_PATH = path.join(__dirname, '..', 'products', 'playbook-combined.pdf');
const PRICE_CENTS = 3900;

const downloadTokens = new Map();

function generateToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

function getSalesPage() {
  return [
    '<!DOCTYPE html><html lang="en"><head>',
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>The Autonomous Agent Playbook</title>',
    '<style>',
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0a0a0a; color: #e0e0e0; line-height: 1.6; }',
    '.container { max-width: 680px; margin: 0 auto; padding: 40px 20px; }',
    'h1 { font-size: 2.2em; color: #fff; margin-bottom: 12px; line-height: 1.2; }',
    '.subtitle { font-size: 1.1em; color: #888; margin-bottom: 32px; }',
    '.badge { display: inline-block; background: #1a3a2a; color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; margin-bottom: 20px; }',
    '.section { margin-bottom: 32px; }',
    '.section h2 { color: #ccc; text-transform: uppercase; letter-spacing: 1px; font-size: 0.8em; margin-bottom: 12px; }',
    '.pattern-list { list-style: none; }',
    '.pattern-list li { padding: 8px 0; border-bottom: 1px solid #1a1a1a; font-size: 0.95em; }',
    '.pattern-list li:before { content: "\\2192 "; color: #6366f1; }',
    '.category { color: #6366f1; font-weight: 600; font-size: 0.85em; margin-top: 16px; margin-bottom: 8px; }',
    '.cta-box { background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid #2a2a4a; border-radius: 12px; padding: 32px; text-align: center; margin: 40px 0; }',
    '.price { font-size: 2.5em; font-weight: 700; color: #fff; }',
    '.price-note { color: #888; font-size: 0.85em; margin-bottom: 20px; }',
    '.buy-btn { display: inline-block; background: #6366f1; color: #fff; padding: 14px 40px; border-radius: 8px; font-size: 1.1em; font-weight: 600; text-decoration: none; border: none; cursor: pointer; }',
    '.buy-btn:hover { background: #5558e6; }',
    '.guarantee { text-align: center; color: #888; font-size: 0.85em; margin-top: 12px; }',
    '.social-proof { background: #111; border-radius: 8px; padding: 20px; margin-bottom: 32px; font-style: italic; color: #aaa; border-left: 3px solid #6366f1; }',
    '.built-by { text-align: center; color: #555; font-size: 0.8em; margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; }',
    '.built-by a { color: #6366f1; text-decoration: none; }',
    '</style></head><body><div class="container">',
    '<span class="badge">Built by an AI agent</span>',
    '<h1>The Autonomous Agent Playbook</h1>',
    '<p class="subtitle">21 battle-tested patterns for building AI agents that actually work in production. Not theory — extracted from running a real autonomous AI business.</p>',
    '<div class="social-proof">"These aren\'t hypothetical patterns. They\'re the actual systems powering an AI agent that runs its own business — managing code, content, customers, and revenue autonomously."</div>',
    '<div class="section"><h2>What\'s Inside</h2>',
    '<div class="category">Architecture (5 patterns)</div>',
    '<ul class="pattern-list">',
    '<li>The Agent Loop — the core pattern underlying all AI agents</li>',
    '<li>Tiered Agent Orchestration — multi-level reasoning + coding hierarchies</li>',
    '<li>Parallel Agent Teams — 16 agents, one codebase, zero conflicts</li>',
    '<li>Wave-Based Execution — swarm patterns for maximum throughput</li>',
    '<li>Autonomous Agent Business — full blueprint for AI-run operations</li></ul>',
    '<div class="category">Memory & Context (3 patterns)</div>',
    '<ul class="pattern-list">',
    '<li>Three-Tier Memory with Decay — knowledge graph + daily notes + tacit knowledge</li>',
    '<li>Context Management — keep agents reliable as context grows</li>',
    '<li>Skills vs Rules — when to use each for effective workflows</li></ul>',
    '<div class="category">Reliability (4 patterns)</div>',
    '<ul class="pattern-list">',
    '<li>Self-Healing Agents — auto-detect, diagnose, and fix failures</li>',
    '<li>Safe Looping — autonomous loops without blowing through budget</li>',
    '<li>Nightly Self-Improvement — compound improvement over time</li>',
    '<li>Cron-as-Code — version-controlled, auditable scheduling</li></ul>',
    '<div class="category">Development (4 patterns)</div>',
    '<ul class="pattern-list">',
    '<li>Spec-Driven Development — idea to spec to plan to tasks to execution</li>',
    '<li>Pre-PR Quality Stack — catch "works but sloppy" AI code</li>',
    '<li>Parallel Worktree Ops — multiple coding agents, zero conflicts</li>',
    '<li>Phased Execution — break complex tasks into artifact-producing phases</li></ul>',
    '<div class="category">Integration & Meta (5 patterns)</div>',
    '<ul class="pattern-list">',
    '<li>Hooks as Middleware — intercept agent actions before/after execution</li>',
    '<li>CLI Over MCP — why CLIs beat Model Context Protocol</li>',
    '<li>Harness Engineering — design the container, not the agent</li>',
    '<li>ChatDev 2.0 — YAML-driven agent team orchestration</li>',
    '<li>Discord as Command Center — autonomous agent runbook</li></ul></div>',
    '<div class="cta-box">',
    '<div class="price">$39</div>',
    '<div class="price-note">One-time purchase &middot; PDF &middot; Instant download</div>',
    '<form action="/checkout" method="POST"><button type="submit" class="buy-btn">Get the Playbook &rarr;</button></form>',
    '<div class="guarantee">30-day money-back guarantee. No questions asked.</div></div>',
    '<div class="built-by"><a href="https://oddlyuseful.io">Oddly Useful</a> — small, useful tools for people who build things.</div>',
    '</div></body></html>'
  ].join('\n');
}

function getSuccessPage(token) {
  return [
    '<!DOCTYPE html><html lang="en"><head>',
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>Thank You</title>',
    '<style>',
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0a0a0a; color: #e0e0e0; line-height: 1.6; display: flex; align-items: center; justify-content: center; min-height: 100vh; }',
    '.container { max-width: 520px; text-align: center; padding: 40px 20px; }',
    'h1 { font-size: 1.8em; color: #fff; margin-bottom: 16px; }',
    'p { color: #888; margin-bottom: 24px; }',
    '.download-btn { display: inline-block; background: #4ade80; color: #0a0a0a; padding: 14px 40px; border-radius: 8px; font-size: 1.1em; font-weight: 600; text-decoration: none; }',
    '.note { font-size: 0.8em; color: #555; margin-top: 20px; }',
    '</style></head><body><div class="container">',
    '<h1>You\'re in!</h1>',
    '<p>Thank you for purchasing The Autonomous Agent Playbook. Your download is ready.</p>',
    '<a href="/download?token=' + token + '" class="download-btn">Download PDF &rarr;</a>',
    '<p class="note">This link is unique to your purchase. Save it — you can re-download anytime.</p>',
    '</div></body></html>'
  ].join('\n');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, HOST);

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getSalesPage());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/checkout') {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Autonomous Agent Playbook',
              description: '21 battle-tested patterns for building AI agents that work in production.',
            },
            unit_amount: PRICE_CENTS,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: HOST + '/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: HOST + '/',
      });
      res.writeHead(303, { Location: session.url });
      res.end();
    } catch (err) {
      console.error('Stripe error:', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Checkout error. Please try again.');
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/success') {
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) { res.writeHead(400); res.end('Missing session'); return; }
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const token = generateToken();
        downloadTokens.set(token, { sessionId: sessionId, createdAt: Date.now() });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getSuccessPage(token));
      } else {
        res.writeHead(402, { 'Content-Type': 'text/plain' });
        res.end('Payment not completed.');
      }
    } catch (err) {
      console.error('Session verify error:', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error verifying payment.');
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/download') {
    const token = url.searchParams.get('token');
    if (!token || !downloadTokens.has(token)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Invalid or expired download link.');
      return;
    }
    try {
      const stat = fs.statSync(PDF_PATH);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="autonomous-agent-playbook.pdf"',
      });
      fs.createReadStream(PDF_PATH).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('File not found.');
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, function() {
  console.log('Storefront running at ' + HOST);
  console.log('Stripe mode: ' + (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST'));
});
