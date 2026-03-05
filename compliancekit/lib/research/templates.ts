import { Permit, IntakeForm, BusinessType } from '../types';
import { randomUUID } from 'crypto';

function makePermit(partial: Omit<Permit, 'id'>): Permit {
  return { id: randomUUID(), ...partial };
}

/** Always-needed federal permits */
function federalPermits(intake: IntakeForm): Permit[] {
  const permits: Permit[] = [
    makePermit({
      name: 'EIN (Employer Identification Number)',
      issuingAuthority: 'IRS',
      jurisdiction: 'federal',
      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
      estimatedCost: 'Free',
      processingTime: 'Immediate (online)',
      renewalPeriod: 'One-time',
      prerequisites: [],
      category: 'registration',
      confidence: 'high',
      deadline: 'Before hiring employees or opening bank account',
    }),
  ];
  return permits;
}

/** State entity registration */
function stateRegistrationPermits(intake: IntakeForm): Permit[] {
  const permits: Permit[] = [];
  const stateData = STATE_REGISTRATION[intake.state];

  if (intake.entityType === 'llc' || intake.entityType === 'corp') {
    permits.push(
      makePermit({
        name: intake.entityType === 'llc'
          ? `${stateData?.name ?? intake.state} LLC Registration`
          : `${stateData?.name ?? intake.state} Corporation Registration`,
        issuingAuthority: `${stateData?.name ?? intake.state} Secretary of State`,
        jurisdiction: 'state',
        url: stateData?.sosUrl ?? `https://www.sos.${intake.state.toLowerCase()}.gov`,
        estimatedCost: stateData?.llcCost ?? 'Varies by state',
        processingTime: '1-2 weeks',
        renewalPeriod: stateData?.annualReport ?? 'Annual report required',
        prerequisites: [],
        category: 'registration',
        confidence: 'high',
        deadline: 'Before conducting business',
      })
    );
  }

  return permits;
}

/** State tax permits */
function stateTaxPermits(intake: IntakeForm): Permit[] {
  const permits: Permit[] = [];
  const noSalesTax = ['OR', 'MT', 'NH', 'DE', 'AK'];

  if (!noSalesTax.includes(intake.state)) {
    permits.push(
      makePermit({
        name: `${STATE_REGISTRATION[intake.state]?.name ?? intake.state} Sales Tax Permit`,
        issuingAuthority: STATE_TAX_AUTHORITY[intake.state] ?? `${intake.state} Dept of Revenue`,
        jurisdiction: 'state',
        url: STATE_TAX_URL[intake.state] ?? '',
        estimatedCost: 'Free',
        processingTime: '1-2 weeks',
        renewalPeriod: 'Ongoing (file returns)',
        prerequisites: ['EIN or SSN', 'State registration'],
        category: 'tax',
        confidence: 'high',
        deadline: 'Before making taxable sales',
      })
    );
  }

  // Franchise tax (TX)
  if (intake.state === 'TX') {
    permits.push(
      makePermit({
        name: 'Texas Franchise Tax Registration',
        issuingAuthority: 'TX Comptroller of Public Accounts',
        jurisdiction: 'state',
        url: 'https://comptroller.texas.gov/taxes/franchise/',
        estimatedCost: 'No fee to register; tax varies',
        processingTime: '1-2 weeks',
        renewalPeriod: 'Annual',
        prerequisites: ['State registration'],
        category: 'tax',
        confidence: 'high',
        deadline: 'After forming entity',
      })
    );
  }

  return permits;
}

/** Employer-specific permits */
function employerPermits(intake: IntakeForm): Permit[] {
  if (intake.employeeCount === '0') return [];

  const permits: Permit[] = [];
  const stateData = EMPLOYER_REGISTRATION[intake.state];

  if (stateData) {
    permits.push(
      makePermit({
        name: stateData.name,
        issuingAuthority: stateData.authority,
        jurisdiction: 'state',
        url: stateData.url,
        estimatedCost: 'Varies',
        processingTime: '1-2 weeks',
        renewalPeriod: 'Quarterly filings',
        prerequisites: ['EIN', 'State registration'],
        category: 'employment',
        confidence: 'high',
        deadline: 'Before first employee starts',
      })
    );
  }

  return permits;
}

/** Industry-specific template permits */
function industryPermits(intake: IntakeForm): Permit[] {
  const permits: Permit[] = [];
  const industryData = INDUSTRY_TEMPLATES[intake.businessType];

  if (industryData) {
    for (const template of industryData) {
      // Check if state-specific version exists
      const stateSpecific = template.stateOverrides?.[intake.state];
      permits.push(
        makePermit({
          name: stateSpecific?.name ?? template.name,
          issuingAuthority: stateSpecific?.authority ?? template.authority,
          jurisdiction: template.jurisdiction,
          url: stateSpecific?.url ?? template.url,
          estimatedCost: stateSpecific?.cost ?? template.cost,
          processingTime: template.processingTime,
          renewalPeriod: template.renewalPeriod,
          prerequisites: template.prerequisites,
          category: template.category,
          confidence: 'high',
          deadline: template.deadline,
        })
      );
    }
  }

  return permits;
}

/** Main template function — generates all template-based permits */
export function getTemplatePermits(intake: IntakeForm): Permit[] {
  return [
    ...federalPermits(intake),
    ...stateRegistrationPermits(intake),
    ...stateTaxPermits(intake),
    ...employerPermits(intake),
    ...industryPermits(intake),
  ];
}

// ---- Reference Data ----

interface StateInfo {
  name: string;
  sosUrl: string;
  llcCost: string;
  annualReport: string;
}

const STATE_REGISTRATION: Record<string, StateInfo> = {
  TX: {
    name: 'Texas',
    sosUrl: 'https://www.sos.texas.gov/corp/forms/205_boc.pdf',
    llcCost: '$300',
    annualReport: 'No annual report required in TX',
  },
  OR: {
    name: 'Oregon',
    sosUrl: 'https://sos.oregon.gov/business/Pages/register.aspx',
    llcCost: '$100',
    annualReport: 'Annual ($100)',
  },
  FL: {
    name: 'Florida',
    sosUrl: 'https://dos.fl.gov/sunbiz/start-business/',
    llcCost: '$125',
    annualReport: 'Annual ($138.75)',
  },
};

const STATE_TAX_AUTHORITY: Record<string, string> = {
  TX: 'TX Comptroller of Public Accounts',
  FL: 'FL Dept of Revenue',
  OR: 'OR Dept of Revenue',
};

const STATE_TAX_URL: Record<string, string> = {
  TX: 'https://comptroller.texas.gov/taxes/permit/',
  FL: 'https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx',
};

const EMPLOYER_REGISTRATION: Record<string, { name: string; authority: string; url: string }> = {
  TX: {
    name: 'TWC Employer Unemployment Tax Registration',
    authority: 'TX Workforce Commission',
    url: 'https://www.twc.texas.gov/businesses/employer-tax-information',
  },
  OR: {
    name: 'Oregon Employer Tax Registration',
    authority: 'Oregon Dept of Revenue / Employment Dept',
    url: 'https://www.oregon.gov/employ/businesses/pages/tax-information.aspx',
  },
  FL: {
    name: 'Reemployment (Unemployment) Tax Registration',
    authority: 'FL Dept of Revenue',
    url: 'https://floridarevenue.com/taxes/taxesfees/Pages/reemploy.aspx',
  },
};

interface IndustryTemplate {
  name: string;
  authority: string;
  jurisdiction: 'federal' | 'state' | 'county' | 'city';
  url: string;
  cost: string;
  processingTime: string;
  renewalPeriod: string;
  prerequisites: string[];
  category: 'registration' | 'health_safety' | 'zoning' | 'professional' | 'tax' | 'employment' | 'industry';
  deadline: string;
  stateOverrides?: Record<string, { name?: string; authority?: string; url?: string; cost?: string }>;
}

const INDUSTRY_TEMPLATES: Partial<Record<BusinessType, IndustryTemplate[]>> = {
  restaurant: [
    {
      name: 'Food Service Establishment Permit',
      authority: 'Local Health Department',
      jurisdiction: 'city',
      url: '',
      cost: 'Varies',
      processingTime: '2-6 weeks',
      renewalPeriod: 'Annual',
      prerequisites: ['Plan review', 'Fire inspection'],
      category: 'health_safety',
      deadline: 'Before opening',
      stateOverrides: {
        TX: { name: 'Food Enterprise Permit', authority: 'Austin Public Health', url: 'https://www.austintexas.gov/department/fixed-food-establishments' },
        OR: { name: 'Restaurant License', authority: 'Multnomah County Environmental Health', url: 'https://multco.us/services/restaurants', cost: '$970-$1,545' },
        FL: { name: 'Public Food Service Establishment License', authority: 'FL DBPR - Division of Hotels & Restaurants', url: 'https://www2.myfloridalicense.com/hotels-restaurants/licensing/general/', cost: '$250-$750' },
      },
    },
    {
      name: 'Food Handler Certification',
      authority: 'State Health Department',
      jurisdiction: 'state',
      url: '',
      cost: '~$10-15/person',
      processingTime: '1 day (online course)',
      renewalPeriod: '2-3 years',
      prerequisites: [],
      category: 'health_safety',
      deadline: 'Before employees handle food',
      stateOverrides: {
        TX: { name: 'Food Handler Certification', authority: 'TX DSHS-approved provider', url: 'https://www.dshs.texas.gov/retail-food-establishments' },
        OR: { name: 'Food Handler Card', authority: 'Oregon Health Authority', url: 'https://www.oregon.gov/oha/ph/healthyenvironments/foodsafety/pages/cert.aspx' },
      },
    },
    {
      name: 'Certificate of Occupancy',
      authority: 'City Development Services',
      jurisdiction: 'city',
      url: '',
      cost: 'Varies',
      processingTime: '2-4 weeks',
      renewalPeriod: 'One-time',
      prerequisites: ['Building permit', 'Fire inspection', 'Health inspection'],
      category: 'zoning',
      deadline: 'Before opening',
    },
    {
      name: 'Fire Inspection / Fire Code Compliance',
      authority: 'Local Fire Department',
      jurisdiction: 'city',
      url: '',
      cost: 'Varies',
      processingTime: '1-2 weeks',
      renewalPeriod: 'Annual inspection',
      prerequisites: [],
      category: 'health_safety',
      deadline: 'Before opening',
    },
    {
      name: 'Sign Permit',
      authority: 'City Development Services',
      jurisdiction: 'city',
      url: '',
      cost: '$64-200',
      processingTime: '1-2 weeks',
      renewalPeriod: 'One-time',
      prerequisites: [],
      category: 'zoning',
      deadline: 'Before installing signage',
    },
  ],
  salon: [
    {
      name: 'Cosmetology Establishment License',
      authority: 'State Licensing Board',
      jurisdiction: 'state',
      url: '',
      cost: 'Varies',
      processingTime: '2-4 weeks',
      renewalPeriod: 'Biennial',
      prerequisites: ['Individual operator licenses'],
      category: 'professional',
      deadline: 'Before opening',
      stateOverrides: {
        TX: { name: 'TDLR Cosmetology Establishment License', authority: 'TX Dept of Licensing & Regulation', url: 'https://www.tdlr.texas.gov/barbering-and-cosmetology/establishments/apply.htm', cost: '$78' },
        OR: { name: 'OHA Cosmetology Facility License', authority: 'Oregon Health Authority - Health Licensing Office', url: 'https://www.oregon.gov/oha/ph/hlo/pages/board-cosmetology-business-authorizations.aspx', cost: '$295' },
        FL: { name: 'DBPR Cosmetology Salon License', authority: 'FL DBPR - Board of Cosmetology', url: 'https://www.myfloridalicense.com/CheckListDetail.asp?SID=&xactCode=1030&clientCode=0502&XACT_DEFN_ID=5237', cost: '~$105' },
      },
    },
    {
      name: 'Individual Cosmetology License',
      authority: 'State Licensing Board',
      jurisdiction: 'state',
      url: '',
      cost: '~$50-75',
      processingTime: '2-4 weeks',
      renewalPeriod: 'Biennial',
      prerequisites: ['Cosmetology school completion', 'State exam'],
      category: 'professional',
      deadline: 'Before practicing',
      stateOverrides: {
        TX: { name: 'Individual Cosmetology Operator License', authority: 'TX TDLR', url: 'https://www.tdlr.texas.gov/barbering-and-cosmetology/individuals/apply-cosmetologist.htm', cost: '~$50-60' },
        OR: { name: 'Individual Hair Design Certification', authority: 'Oregon Health Authority - HLO', url: 'https://www.oregon.gov/oha/ph/hlo/pages/board-cosmetology-hair-design-license.aspx', cost: '~$65' },
        FL: { name: 'Individual Cosmetologist License', authority: 'FL DBPR', url: 'https://www2.myfloridalicense.com/cosmetology/', cost: '~$75' },
      },
    },
    {
      name: 'Certificate of Occupancy',
      authority: 'City Development Services',
      jurisdiction: 'city',
      url: '',
      cost: 'Varies',
      processingTime: '2-4 weeks',
      renewalPeriod: 'One-time',
      prerequisites: ['Building permit'],
      category: 'zoning',
      deadline: 'Before opening',
    },
    {
      name: 'Sign Permit',
      authority: 'City Development Services',
      jurisdiction: 'city',
      url: '',
      cost: '$64-200',
      processingTime: '1-2 weeks',
      renewalPeriod: 'One-time',
      prerequisites: [],
      category: 'zoning',
      deadline: 'Before installing signage',
    },
  ],
  consulting: [],
};
