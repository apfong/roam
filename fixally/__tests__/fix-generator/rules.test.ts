import { describe, it, expect } from 'vitest';
import { fixImageAlt } from '@/lib/fix-generator/rules/image-alt';
import { fixLabel } from '@/lib/fix-generator/rules/label';
import { fixColorContrast } from '@/lib/fix-generator/rules/color-contrast';
import { fixLinkName } from '@/lib/fix-generator/rules/link-name';
import { fixButtonName } from '@/lib/fix-generator/rules/button-name';
import { fixHtmlHasLang } from '@/lib/fix-generator/rules/html-has-lang';
import { fixDocumentTitle } from '@/lib/fix-generator/rules/document-title';
import { fixHeadingOrder } from '@/lib/fix-generator/rules/heading-order';
import { fixLandmarkOneMain } from '@/lib/fix-generator/rules/landmark-one-main';
import { fixMetaViewport } from '@/lib/fix-generator/rules/meta-viewport';
import { ViolationContext } from '@/lib/fix-generator/types';

function makeContext(overrides: Partial<ViolationContext>): ViolationContext {
  return {
    ruleId: 'test',
    impact: 'serious',
    html: '',
    target: ['#el'],
    failureSummary: 'Fix this',
    pageUrl: 'https://example.com',
    ...overrides,
  };
}

describe('fixImageAlt', () => {
  it('adds alt="" for decorative images', () => {
    const ctx = makeContext({ ruleId: 'image-alt', html: '<img src="/spacer.gif">' });
    const result = fixImageAlt(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).toContain('alt=""');
    expect(result!.confidence).toBe('high');
  });

  it('adds placeholder alt for meaningful images', () => {
    const ctx = makeContext({ ruleId: 'image-alt', html: '<img src="/hero-photo.jpg">' });
    const result = fixImageAlt(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).toContain('alt="[Descriptive alt text needed]"');
  });

  it('returns low confidence when alt exists', () => {
    const ctx = makeContext({ ruleId: 'image-alt', html: '<img src="/photo.jpg" alt="image">' });
    const result = fixImageAlt(ctx);
    expect(result).not.toBeNull();
    expect(result!.confidence).toBe('low');
  });

  it('returns null for non-img elements', () => {
    const ctx = makeContext({ ruleId: 'image-alt', html: '<div>not an image</div>' });
    expect(fixImageAlt(ctx)).toBeNull();
  });
});

describe('fixLabel', () => {
  it('adds aria-label to input without label', () => {
    const ctx = makeContext({ ruleId: 'label', html: '<input type="text" name="email">' });
    const result = fixLabel(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).toContain('aria-label="email"');
  });

  it('uses placeholder as label text', () => {
    const ctx = makeContext({ ruleId: 'label', html: '<input placeholder="Enter email">' });
    const result = fixLabel(ctx);
    expect(result!.fixedHTML).toContain('aria-label="Enter email"');
  });

  it('returns null if aria-label already exists', () => {
    const ctx = makeContext({ ruleId: 'label', html: '<input aria-label="Email">' });
    expect(fixLabel(ctx)).toBeNull();
  });

  it('returns null for non-input elements', () => {
    const ctx = makeContext({ ruleId: 'label', html: '<div>not an input</div>' });
    expect(fixLabel(ctx)).toBeNull();
  });
});

describe('fixColorContrast', () => {
  it('returns low confidence advisory fix', () => {
    const ctx = makeContext({ ruleId: 'color-contrast', html: '<p style="color: #999">Light text</p>' });
    const result = fixColorContrast(ctx);
    expect(result).not.toBeNull();
    expect(result!.confidence).toBe('low');
    expect(result!.explanation).toContain('contrast');
  });
});

describe('fixLinkName', () => {
  it('adds aria-label to empty link', () => {
    const ctx = makeContext({ ruleId: 'link-name', html: '<a href="/about"><i class="icon"></i></a>' });
    const result = fixLinkName(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).toContain('aria-label=');
  });

  it('returns null if aria-label exists', () => {
    const ctx = makeContext({ ruleId: 'link-name', html: '<a href="/" aria-label="Home">X</a>' });
    expect(fixLinkName(ctx)).toBeNull();
  });
});

describe('fixButtonName', () => {
  it('adds aria-label to empty button', () => {
    const ctx = makeContext({ ruleId: 'button-name', html: '<button><svg></svg></button>' });
    const result = fixButtonName(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).toContain('aria-label="Button"');
  });

  it('returns null for buttons with text', () => {
    const ctx = makeContext({ ruleId: 'button-name', html: '<button>Submit</button>' });
    expect(fixButtonName(ctx)).toBeNull();
  });
});

describe('fixHtmlHasLang', () => {
  it('adds lang="en" to html without lang', () => {
    const ctx = makeContext({ ruleId: 'html-has-lang', html: '<html>' });
    const result = fixHtmlHasLang(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).toBe('<html lang="en">');
    expect(result!.confidence).toBe('high');
  });

  it('returns null if lang exists', () => {
    const ctx = makeContext({ ruleId: 'html-has-lang', html: '<html lang="fr">' });
    expect(fixHtmlHasLang(ctx)).toBeNull();
  });
});

describe('fixDocumentTitle', () => {
  it('suggests adding a title element', () => {
    const ctx = makeContext({ ruleId: 'document-title', html: '<head></head>' });
    const result = fixDocumentTitle(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).toContain('<title>');
  });
});

describe('fixHeadingOrder', () => {
  it('reports heading level issue', () => {
    const ctx = makeContext({ ruleId: 'heading-order', html: '<h4>Skipped heading</h4>' });
    const result = fixHeadingOrder(ctx);
    expect(result).not.toBeNull();
    expect(result!.explanation).toContain('h4');
    expect(result!.confidence).toBe('low');
  });
});

describe('fixLandmarkOneMain', () => {
  it('suggests adding main landmark', () => {
    const ctx = makeContext({ ruleId: 'landmark-one-main', html: '<body><div>Content</div></body>' });
    const result = fixLandmarkOneMain(ctx);
    expect(result).not.toBeNull();
    expect(result!.explanation).toContain('<main>');
  });
});

describe('fixMetaViewport', () => {
  it('removes user-scalable=no', () => {
    const ctx = makeContext({
      ruleId: 'meta-viewport',
      html: '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">',
    });
    const result = fixMetaViewport(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).not.toContain('user-scalable=no');
  });

  it('removes maximum-scale=1', () => {
    const ctx = makeContext({
      ruleId: 'meta-viewport',
      html: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">',
    });
    const result = fixMetaViewport(ctx);
    expect(result).not.toBeNull();
    expect(result!.fixedHTML).not.toContain('maximum-scale=1');
  });

  it('returns null if no restrictive properties', () => {
    const ctx = makeContext({
      ruleId: 'meta-viewport',
      html: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    });
    expect(fixMetaViewport(ctx)).toBeNull();
  });
});
