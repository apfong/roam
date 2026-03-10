/**
 * Sift Diff — Color scheme for change types
 */

import type { ChangeType } from './types';

export interface DiffColor {
  /** Cell background color (hex) */
  bg: string;
  /** Darker border/accent color */
  accent: string;
  /** Human label */
  label: string;
}

export const DIFF_COLORS: Record<ChangeType, DiffColor> = {
  added:         { bg: '#dcfce7', accent: '#16a34a', label: 'Added' },
  removed:       { bg: '#fee2e2', accent: '#dc2626', label: 'Removed' },
  value:         { bg: '#fef9c3', accent: '#ca8a04', label: 'Value Changed' },
  formula:       { bg: '#dbeafe', accent: '#2563eb', label: 'Formula Changed' },
  'formula-value': { bg: '#e0e7ff', accent: '#4f46e5', label: 'Recalculated' },
  type:          { bg: '#f3e8ff', accent: '#9333ea', label: 'Type Changed' },
  style:         { bg: '#f1f5f9', accent: '#64748b', label: 'Style Changed' },
};
