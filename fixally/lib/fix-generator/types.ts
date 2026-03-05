export interface ViolationContext {
  ruleId: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  html: string;
  target: string[];
  failureSummary: string;
  pageUrl: string;
}

export interface FixResult {
  selector: string;
  currentHTML: string;
  fixedHTML: string;
  explanation: string;
  wcagRule: string;
  confidence: 'high' | 'medium' | 'low';
}

export type RuleFixFn = (context: ViolationContext) => FixResult | null;
