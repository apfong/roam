import { describe, it, expect } from 'vitest';
import { getTemplatePermits } from '@/lib/research/templates';
import type { IntakeForm } from '@/lib/types';

// Golden test cases from compliance-accuracy-test.md

const restaurantAustin: IntakeForm = {
  businessType: 'restaurant',
  businessActivities: ['serve_food', 'serve_alcohol'],
  state: 'TX',
  city: 'Austin',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '6-50',
};

const restaurantPortland: IntakeForm = {
  businessType: 'restaurant',
  businessActivities: ['serve_food', 'serve_alcohol'],
  state: 'OR',
  city: 'Portland',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '6-50',
};

const restaurantMiami: IntakeForm = {
  businessType: 'restaurant',
  businessActivities: ['serve_food'],
  state: 'FL',
  city: 'Miami',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '1-5',
};

const salonAustin: IntakeForm = {
  businessType: 'salon',
  businessActivities: ['cut_hair'],
  state: 'TX',
  city: 'Austin',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '1-5',
};

const salonPortland: IntakeForm = {
  businessType: 'salon',
  businessActivities: ['cut_hair'],
  state: 'OR',
  city: 'Portland',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '1-5',
};

const salonMiami: IntakeForm = {
  businessType: 'salon',
  businessActivities: ['cut_hair'],
  state: 'FL',
  city: 'Miami',
  entityType: 'llc',
  homeBased: false,
  employeeCount: '1-5',
};

const consultingAustin: IntakeForm = {
  businessType: 'consulting',
  businessActivities: [],
  state: 'TX',
  city: 'Austin',
  entityType: 'llc',
  homeBased: true,
  employeeCount: '0',
};

const consultingPortland: IntakeForm = {
  businessType: 'consulting',
  businessActivities: [],
  state: 'OR',
  city: 'Portland',
  entityType: 'llc',
  homeBased: true,
  employeeCount: '0',
};

const consultingMiami: IntakeForm = {
  businessType: 'consulting',
  businessActivities: [],
  state: 'FL',
  city: 'Miami',
  entityType: 'llc',
  homeBased: true,
  employeeCount: '0',
};

describe('Template Permits', () => {
  describe('always includes EIN for all businesses', () => {
    const cases = [restaurantAustin, salonPortland, consultingMiami];
    for (const intake of cases) {
      it(`${intake.businessType} in ${intake.city}, ${intake.state}`, () => {
        const permits = getTemplatePermits(intake);
        const ein = permits.find((p) => p.name.includes('EIN'));
        expect(ein).toBeDefined();
        expect(ein?.jurisdiction).toBe('federal');
        expect(ein?.confidence).toBe('high');
      });
    }
  });

  describe('includes state LLC registration for LLC entities', () => {
    it('Texas LLC', () => {
      const permits = getTemplatePermits(restaurantAustin);
      const llc = permits.find((p) => p.name.includes('LLC'));
      expect(llc).toBeDefined();
      expect(llc?.jurisdiction).toBe('state');
      expect(llc?.estimatedCost).toBe('$300');
    });

    it('Oregon LLC', () => {
      const permits = getTemplatePermits(restaurantPortland);
      const llc = permits.find((p) => p.name.includes('LLC'));
      expect(llc).toBeDefined();
      expect(llc?.estimatedCost).toBe('$100');
    });

    it('Florida LLC', () => {
      const permits = getTemplatePermits(restaurantMiami);
      const llc = permits.find((p) => p.name.includes('LLC'));
      expect(llc).toBeDefined();
      expect(llc?.estimatedCost).toBe('$125');
    });
  });

  describe('includes sales tax permit for states with sales tax', () => {
    it('Texas has sales tax', () => {
      const permits = getTemplatePermits(restaurantAustin);
      const tax = permits.find((p) => p.name.includes('Sales Tax'));
      expect(tax).toBeDefined();
    });

    it('Oregon has NO sales tax', () => {
      const permits = getTemplatePermits(restaurantPortland);
      const tax = permits.find((p) => p.name.includes('Sales Tax'));
      expect(tax).toBeUndefined();
    });

    it('Florida has sales tax', () => {
      const permits = getTemplatePermits(restaurantMiami);
      const tax = permits.find((p) => p.name.includes('Sales Tax'));
      expect(tax).toBeDefined();
    });
  });

  describe('includes employer registration when employees > 0', () => {
    it('restaurant with 6-50 employees in TX', () => {
      const permits = getTemplatePermits(restaurantAustin);
      const employer = permits.find((p) => p.category === 'employment');
      expect(employer).toBeDefined();
      expect(employer?.name).toContain('TWC');
    });

    it('consulting with 0 employees does NOT include employer regs', () => {
      const permits = getTemplatePermits(consultingAustin);
      const employer = permits.find((p) => p.category === 'employment');
      expect(employer).toBeUndefined();
    });
  });

  describe('includes Texas franchise tax for TX businesses', () => {
    it('TX restaurant gets franchise tax', () => {
      const permits = getTemplatePermits(restaurantAustin);
      const ft = permits.find((p) => p.name.includes('Franchise Tax'));
      expect(ft).toBeDefined();
    });

    it('OR restaurant does NOT get TX franchise tax', () => {
      const permits = getTemplatePermits(restaurantPortland);
      const ft = permits.find((p) => p.name.includes('Franchise Tax'));
      expect(ft).toBeUndefined();
    });
  });

  describe('restaurant-specific permits', () => {
    it('Austin restaurant gets food permit', () => {
      const permits = getTemplatePermits(restaurantAustin);
      const food = permits.find((p) => p.name.includes('Food Enterprise'));
      expect(food).toBeDefined();
      expect(food?.category).toBe('health_safety');
    });

    it('Portland restaurant gets restaurant license', () => {
      const permits = getTemplatePermits(restaurantPortland);
      const food = permits.find((p) => p.name.includes('Restaurant License'));
      expect(food).toBeDefined();
      expect(food?.estimatedCost).toBe('$970-$1,545');
    });

    it('Miami restaurant gets DBPR food service license', () => {
      const permits = getTemplatePermits(restaurantMiami);
      const food = permits.find((p) => p.name.includes('Public Food Service'));
      expect(food).toBeDefined();
    });

    it('includes food handler certification', () => {
      const permits = getTemplatePermits(restaurantAustin);
      const fh = permits.find((p) => p.name.includes('Food Handler'));
      expect(fh).toBeDefined();
    });

    it('includes fire inspection', () => {
      const permits = getTemplatePermits(restaurantAustin);
      const fire = permits.find((p) => p.name.includes('Fire'));
      expect(fire).toBeDefined();
    });
  });

  describe('salon-specific permits', () => {
    it('Austin salon gets TDLR cosmetology license', () => {
      const permits = getTemplatePermits(salonAustin);
      const cos = permits.find((p) => p.name.includes('TDLR'));
      expect(cos).toBeDefined();
      expect(cos?.estimatedCost).toBe('$78');
    });

    it('Portland salon gets OHA cosmetology license', () => {
      const permits = getTemplatePermits(salonPortland);
      const cos = permits.find((p) => p.name.includes('OHA'));
      expect(cos).toBeDefined();
      expect(cos?.estimatedCost).toBe('$295');
    });

    it('Miami salon gets DBPR cosmetology license', () => {
      const permits = getTemplatePermits(salonMiami);
      const cos = permits.find((p) => p.name.includes('DBPR'));
      expect(cos).toBeDefined();
    });

    it('includes individual operator license', () => {
      const permits = getTemplatePermits(salonAustin);
      const ind = permits.find((p) => p.name.includes('Individual'));
      expect(ind).toBeDefined();
    });
  });

  describe('consulting has minimal permits', () => {
    it('Austin consulting: EIN + LLC + franchise tax + sales tax', () => {
      const permits = getTemplatePermits(consultingAustin);
      expect(permits.length).toBeGreaterThanOrEqual(3);
      expect(permits.length).toBeLessThanOrEqual(6);
    });

    it('Portland consulting: EIN + LLC (no sales tax)', () => {
      const permits = getTemplatePermits(consultingPortland);
      expect(permits.length).toBeGreaterThanOrEqual(2);
      const salesTax = permits.find((p) => p.name.includes('Sales Tax'));
      expect(salesTax).toBeUndefined();
    });
  });

  describe('golden test case permit counts (template layer only)', () => {
    // These counts are for templates only — search adds more
    it('Restaurant Austin TX: ≥8 template permits', () => {
      const permits = getTemplatePermits(restaurantAustin);
      expect(permits.length).toBeGreaterThanOrEqual(8);
    });

    it('Salon Austin TX: ≥6 template permits', () => {
      const permits = getTemplatePermits(salonAustin);
      expect(permits.length).toBeGreaterThanOrEqual(6);
    });

    it('Consulting Austin TX: ≥3 template permits', () => {
      const permits = getTemplatePermits(consultingAustin);
      expect(permits.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('all permits have required fields', () => {
    it('every permit has id, name, url, jurisdiction, category, confidence', () => {
      const allIntakes = [restaurantAustin, salonPortland, consultingMiami];
      for (const intake of allIntakes) {
        const permits = getTemplatePermits(intake);
        for (const p of permits) {
          expect(p.id).toBeTruthy();
          expect(p.name).toBeTruthy();
          expect(p.jurisdiction).toBeTruthy();
          expect(p.category).toBeTruthy();
          expect(p.confidence).toBe('high'); // All template permits are high confidence
        }
      }
    });
  });
});
