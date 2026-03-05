import { RuleFixFn, ViolationContext, FixResult } from './types';
import { fixImageAlt } from './rules/image-alt';
import { fixLabel } from './rules/label';
import { fixColorContrast } from './rules/color-contrast';
import { fixLinkName } from './rules/link-name';
import { fixButtonName } from './rules/button-name';
import { fixHtmlHasLang } from './rules/html-has-lang';
import { fixDocumentTitle } from './rules/document-title';
import { fixHeadingOrder } from './rules/heading-order';
import { fixLandmarkOneMain } from './rules/landmark-one-main';
import { fixMetaViewport } from './rules/meta-viewport';

const ruleMap: Record<string, RuleFixFn> = {
  'image-alt': fixImageAlt,
  'label': fixLabel,
  'color-contrast': fixColorContrast,
  'link-name': fixLinkName,
  'button-name': fixButtonName,
  'html-has-lang': fixHtmlHasLang,
  'document-title': fixDocumentTitle,
  'heading-order': fixHeadingOrder,
  'landmark-one-main': fixLandmarkOneMain,
  'meta-viewport': fixMetaViewport,
};

export function getFixer(ruleId: string): RuleFixFn | null {
  return ruleMap[ruleId] || null;
}

export function generateFix(context: ViolationContext): FixResult | null {
  const fixer = getFixer(context.ruleId);
  if (!fixer) return null;
  try {
    return fixer(context);
  } catch {
    return null;
  }
}

export function generateFixes(contexts: ViolationContext[]): FixResult[] {
  const results: FixResult[] = [];
  for (const ctx of contexts) {
    const fix = generateFix(ctx);
    if (fix) results.push(fix);
  }
  return results;
}

export function getSupportedRules(): string[] {
  return Object.keys(ruleMap);
}
