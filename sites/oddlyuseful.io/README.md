# oddlyuseful.io

Professional landing site for Oddly Useful - Small tools that solve real problems.

## 🚀 Quick Deploy

Once you have a Vercel token:

```bash
export VERCEL_TOKEN=your_token_here
./scripts/deploy.sh --prod
```

## 🛠 Development

```bash
# Start local server
npm run dev
# Opens at http://localhost:8000

# Deploy to preview
npm run preview

# Deploy to production  
npm run deploy:prod
```

## 📁 Structure

```
├── index.html          # Main landing page
├── playbook.html       # Agent Playbook sales page ($39)
├── validate.html       # DemandProof Validation sales page ($49-99)
├── styles.css          # All styles (dark theme, responsive)
├── vercel.json         # Vercel deployment config
├── scripts/
│   └── deploy.sh       # One-command deployment script
└── *.png.placeholder   # OG image placeholders (replace before launch)
```

## 📋 Pre-Launch Checklist

### Required
- [ ] Replace OG image placeholders with actual images (1200x630)
- [ ] Set up Vercel project with custom domain
- [ ] Configure Stripe checkout for Buy Now buttons
- [ ] Test all pages on mobile/desktop
- [ ] Set up analytics (Plausible/Google Analytics)

### Optional
- [ ] Add proper favicon.ico (currently SVG only)
- [ ] Set up form handling for email collection
- [ ] Add loading states for Buy Now buttons
- [ ] Implement proper error handling for payments

## 🎨 Design System

### Colors
- Background: `#08080a`
- Surface: `#0f0f12` 
- Text: `#e8e8ed`
- Text dim: `#7a7a85`
- Accent: `#c4f042`
- Border: `#1c1c22`

### Fonts
- Primary: Space Grotesk
- Mono: Space Mono

### Breakpoints
- Mobile: 480px
- Tablet: 768px
- Desktop: 1024px+

## 💰 Products

### The Autonomous Agent Playbook - $39
Sales page at `/playbook`
- Target: Developers, indie hackers
- Value: Working configs, real architectures
- CTA: Direct purchase with Stripe

### DemandProof Validation Reports - $49-99  
Sales page at `/validate`
- Target: Founders, idea validators
- Value: 24hr data-backed validation reports
- CTA: Two tiers (Quick $49, Deep $99)

## 🔧 Technical Notes

- Pure static HTML/CSS/JS (no build step)
- Vercel handles routing via vercel.json
- Buy buttons currently placeholder (need Stripe integration)
- All external resources loaded from CDN
- Grain texture via SVG data URL
- Mobile-first responsive design

## 🚨 Known Issues

- ImageMagick not available for favicon.ico generation
- OG images are placeholders
- Buy Now buttons need Stripe integration
- No email collection forms yet

## 📞 Support

Questions? Check the main Roam workspace or Discord #dev-log.