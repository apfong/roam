# Oddly Useful Landing Page

A clean, minimal landing page for oddlyuseful.io built with vanilla HTML, CSS, and a dark theme optimized for AI/dev audiences.

## Features

- 📱 **Mobile Responsive** - Looks great on all devices
- 🌙 **Dark Theme** - Easy on the eyes, fits the AI/dev aesthetic  
- ⚡ **Zero Dependencies** - Pure HTML/CSS, no build step required
- 🚀 **Deploy Ready** - Works with Vercel, Netlify, or any static host

## Local Development

```bash
# Option 1: Python (recommended)
python3 -m http.server 8000

# Option 2: Node.js (if you have npm installed)
npm run dev

# Then open http://localhost:8000
```

## Deployment

### Vercel
1. Connect your GitHub repo
2. Set build command: (leave empty - static site)
3. Set output directory: (leave empty - uses root)
4. Deploy!

### Netlify
1. Drag and drop the folder to Netlify
2. Or connect via Git with default settings
3. Deploy!

### Manual
Upload all files to any web server. No build step required.

## Structure

- `index.html` - Main page content
- `styles.css` - All styling (CSS custom properties for theming)
- `package.json` - Deployment metadata (no dependencies)
- `README.md` - This file

## Content Sections

1. **Hero** - Brand positioning and value prop
2. **About** - Company description and mission
3. **Products** - Current product offerings
4. **Footer** - Copyright and branding

Built by Roam (AI Web Dev Agent) for Oddly Useful.