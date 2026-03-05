export interface PlatformDetection {
  platform: string | null;
  confidence: number;
}

interface PlatformSignature {
  name: string;
  patterns: RegExp[];
  weight: number;
}

const PLATFORMS: PlatformSignature[] = [
  {
    name: 'wordpress',
    patterns: [
      /wp-content\//i,
      /wp-includes\//i,
      /wp-json/i,
      /<meta[^>]*generator[^>]*WordPress/i,
    ],
    weight: 1,
  },
  {
    name: 'shopify',
    patterns: [
      /cdn\.shopify\.com/i,
      /Shopify\.theme/i,
      /<meta[^>]*generator[^>]*Shopify/i,
    ],
    weight: 1,
  },
  {
    name: 'squarespace',
    patterns: [
      /static\.squarespace\.com/i,
      /squarespace\.com\/universal/i,
      /<meta[^>]*generator[^>]*Squarespace/i,
    ],
    weight: 1,
  },
  {
    name: 'framer',
    patterns: [
      /framer\.com/i,
      /data-framer/i,
      /framerusercontent\.com/i,
    ],
    weight: 1,
  },
  {
    name: 'webflow',
    patterns: [
      /assets\.website-files\.com/i,
      /webflow\.com/i,
      /class="w-/i,
      /data-wf-/i,
    ],
    weight: 1,
  },
];

export function detectPlatform(html: string): PlatformDetection {
  let bestPlatform: string | null = null;
  let bestScore = 0;

  for (const platform of PLATFORMS) {
    let score = 0;
    for (const pattern of platform.patterns) {
      if (pattern.test(html)) {
        score += platform.weight;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPlatform = platform.name;
    }
  }

  if (bestScore === 0) {
    return { platform: null, confidence: 0 };
  }

  const maxPossible = PLATFORMS.find((p) => p.name === bestPlatform)!.patterns.length;
  return {
    platform: bestPlatform,
    confidence: Math.min(1, bestScore / maxPossible),
  };
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  wordpress: 'Install an accessibility plugin like WP Accessibility or Starter Templates. Edit theme files in Appearance → Theme File Editor, or use a page builder with accessibility options.',
  shopify: 'Edit your theme in Online Store → Themes → Edit code. Look in sections/ and snippets/ directories for the affected templates.',
  squarespace: 'Use Code Injection (Settings → Advanced → Code Injection) for global fixes. For per-page fixes, use Code Blocks in the page editor.',
  framer: 'Edit component properties in the Framer editor. Use the Code tab for custom HTML/CSS fixes.',
  webflow: 'Select the element in the Webflow Designer and use the Settings panel to add ARIA attributes. Use custom code embed for complex fixes.',
};

export function getPlatformInstructions(platform: string): string {
  return PLATFORM_INSTRUCTIONS[platform] || 'Edit your HTML source code directly to apply these fixes.';
}
