import * as cheerio from 'cheerio';

const URL_ATTRS: Record<string, string[]> = {
  a: ['href'],
  img: ['src', 'srcset'],
  link: ['href'],
  script: ['src'],
  source: ['src', 'srcset'],
  video: ['src', 'poster'],
  audio: ['src'],
  form: ['action'],
  iframe: ['src'],
};

export function rewriteUrls(html: string, baseUrl: string): string {
  const $ = cheerio.load(html);

  for (const [tag, attrs] of Object.entries(URL_ATTRS)) {
    $(tag).each((_, el) => {
      for (const attr of attrs) {
        const value = $(el).attr(attr);
        if (!value) continue;

        if (attr === 'srcset') {
          const rewritten = value
            .split(',')
            .map((entry) => {
              const parts = entry.trim().split(/\s+/);
              if (parts[0]) {
                parts[0] = resolveUrl(parts[0], baseUrl);
              }
              return parts.join(' ');
            })
            .join(', ');
          $(el).attr(attr, rewritten);
        } else {
          $(el).attr(attr, resolveUrl(value, baseUrl));
        }
      }
    });
  }

  // Rewrite CSS url() in style attributes
  $('[style]').each((_, el) => {
    const style = $(el).attr('style');
    if (style) {
      $(el).attr(
        'style',
        style.replace(/url\(["']?([^"')]+)["']?\)/g, (match, url) => {
          return `url("${resolveUrl(url, baseUrl)}")`;
        })
      );
    }
  });

  return $.html();
}

export function resolveUrl(url: string, baseUrl: string): string {
  if (!url || url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('#') || url.startsWith('mailto:')) {
    return url;
  }
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
