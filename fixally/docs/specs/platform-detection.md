# Platform Detection Spec

## Detectable Platforms
- **WordPress**: meta generator, wp-content paths, wp-json
- **Shopify**: Shopify.theme, cdn.shopify.com, meta generator
- **Squarespace**: squarespace.com scripts, Static.squarespace.com
- **Framer**: framer.com in scripts, data-framer attributes
- **Webflow**: webflow.com in scripts, w-widget class prefix

## API
```typescript
detectPlatform(html: string): { platform: string | null; confidence: number }
```

## Platform-specific instructions
Each platform gets tailored fix instructions (e.g., WordPress → plugin recommendations, Shopify → theme editor paths).
