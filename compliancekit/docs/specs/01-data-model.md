# Data Model Spec

## Permit
```typescript
interface Permit {
  id: string;
  name: string;
  issuingAuthority: string;
  jurisdiction: 'federal' | 'state' | 'county' | 'city';
  url: string;
  estimatedCost: string;
  processingTime: string;
  renewalPeriod: string;
  prerequisites: string[];
  category: 'registration' | 'health_safety' | 'zoning' | 'professional' | 'tax' | 'employment' | 'industry';
  confidence: 'high' | 'medium' | 'low';
  deadline: string;
}
```

## IntakeForm
```typescript
interface IntakeForm {
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
```

## ResearchRequest
```typescript
interface ResearchRequest {
  id: string;
  intake: IntakeForm;
  status: 'pending' | 'researching' | 'complete' | 'error';
  permits: Permit[];
  createdAt: string;
  completedAt?: string;
  paid: boolean;
  paymentId?: string;
  cacheKey: string;
}
```

## Enums
- BusinessType: restaurant, retail, salon, consulting, food_truck, construction, professional_services, ecommerce, home_based
- EntityType: sole_prop, llc, corp, partnership
- EmployeeCount: '0' | '1-5' | '6-50' | '50+'
