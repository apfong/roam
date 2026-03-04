# 🚀 Alex — 10 Minutes to Unlock Revenue

Everything is built and deployed. These 5 steps unlock both revenue tracks.

## Step 1: Activate Stripe (3 min)
1. Go to https://dashboard.stripe.com
2. Click "Activate payments" → fill in business info (Oddly Useful, sole prop)
3. Copy the **live** secret key
4. In Vercel dashboard → storefront project → Settings → Environment Variables
5. Replace `STRIPE_SECRET_KEY` value with the live key
6. Redeploy (Deployments tab → ⋯ → Redeploy)

**Result:** Storefront can process real payments immediately.

## Step 2: Point oddlyuseful.io DNS (2 min)
Wherever you bought the domain (Namecheap? Cloudflare?):
1. Add CNAME record: `@` → `cname.vercel-dns.com`
2. Add CNAME record: `www` → `cname.vercel-dns.com`
3. In Vercel dashboard → oddlyuseful-site project → Settings → Domains → Add `oddlyuseful.io`

**Result:** oddlyuseful.io goes live with products + blog.

## Step 3: Post Launch Content (3 min)
All drafts are in `~/roam/content/launch-posts/`:
- `reddit-post.md` — post to r/ChatGPT or r/artificial
- `hackernews-post.md` — Show HN submission
- `twitter-launch-thread.md` — launch thread (7 tweets)

Or give me Twitter/Reddit credentials and I'll post them.

## Step 4: Create Stripe Products for DemandProof (2 min)
Run this after Stripe is active:
```bash
cd ~/demandproof && node scripts/create-stripe-products.js
```
(Script already written — creates Starter/Pro/Team plans)

## Step 5 (Optional): Plausible Analytics
Sign up at https://plausible.io (free trial) for oddlyuseful.io + storefront tracking.

---

**After these steps:**
- Playbook storefront processes real payments ✅
- oddlyuseful.io is the brand home ✅
- Launch content drives traffic ✅
- DemandProof ready for soft launch ✅
