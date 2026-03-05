import { FixResult } from '../fix-generator/types';

const FREE_FIX_LIMIT = 3;

export interface GatedFixes {
  visible: FixResult[];
  lockedCount: number;
  isPaid: boolean;
}

export function getVisibleFixes(fixes: FixResult[], isPaid: boolean): GatedFixes {
  if (isPaid) {
    return { visible: fixes, lockedCount: 0, isPaid };
  }

  // Sort by confidence (high first) then show top FREE_FIX_LIMIT
  const sorted = [...fixes].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });

  return {
    visible: sorted.slice(0, FREE_FIX_LIMIT),
    lockedCount: Math.max(0, sorted.length - FREE_FIX_LIMIT),
    isPaid,
  };
}

export function isWithinFreeLimit(fixCount: number): boolean {
  return fixCount <= FREE_FIX_LIMIT;
}

export { FREE_FIX_LIMIT };
