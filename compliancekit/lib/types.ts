export const BUSINESS_TYPES = [
  'restaurant',
  'retail',
  'salon',
  'consulting',
  'food_truck',
  'construction',
  'professional_services',
  'ecommerce',
  'home_based',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const ENTITY_TYPES = ['sole_prop', 'llc', 'corp', 'partnership'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const EMPLOYEE_COUNTS = ['0', '1-5', '6-50', '50+'] as const;
export type EmployeeCount = (typeof EMPLOYEE_COUNTS)[number];

export const JURISDICTIONS = ['federal', 'state', 'county', 'city'] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];

export const CATEGORIES = [
  'registration',
  'health_safety',
  'zoning',
  'professional',
  'tax',
  'employment',
  'industry',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export interface Permit {
  id: string;
  name: string;
  issuingAuthority: string;
  jurisdiction: Jurisdiction;
  url: string;
  estimatedCost: string;
  processingTime: string;
  renewalPeriod: string;
  prerequisites: string[];
  category: Category;
  confidence: ConfidenceLevel;
  deadline: string;
}

export interface IntakeForm {
  businessType: BusinessType;
  businessActivities: string[];
  state: string;
  city: string;
  county?: string;
  entityType: EntityType;
  homeBased: boolean;
  employeeCount: EmployeeCount;
  businessName?: string;
}

export type ResearchStatus = 'pending' | 'researching' | 'complete' | 'error';

export interface ResearchRequest {
  id: string;
  intake: IntakeForm;
  status: ResearchStatus;
  permits: Permit[];
  createdAt: string;
  completedAt?: string;
  paid: boolean;
  paymentId?: string;
  cacheKey: string;
  error?: string;
}

export const BUSINESS_ACTIVITIES: Record<BusinessType, string[]> = {
  restaurant: ['serve_food', 'serve_alcohol', 'outdoor_seating', 'live_music', 'delivery', 'catering'],
  retail: ['sell_products', 'online_sales', 'wholesale', 'firearms', 'tobacco', 'pharmacy'],
  salon: ['cut_hair', 'color_hair', 'nail_services', 'waxing', 'massage', 'skincare'],
  consulting: ['professional_advice', 'training', 'financial_consulting', 'it_consulting'],
  food_truck: ['serve_food', 'serve_alcohol', 'mobile_vending', 'catering'],
  construction: ['general_contracting', 'electrical', 'plumbing', 'hvac', 'demolition'],
  professional_services: ['accounting', 'legal', 'medical', 'engineering', 'architecture'],
  ecommerce: ['sell_products', 'digital_products', 'dropshipping', 'subscription'],
  home_based: ['consulting', 'freelancing', 'crafts', 'tutoring', 'pet_services'],
};

export const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};
