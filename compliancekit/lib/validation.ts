import { z } from 'zod';
import { BUSINESS_TYPES, ENTITY_TYPES, EMPLOYEE_COUNTS, US_STATES } from './types';

export const intakeFormSchema = z.object({
  businessType: z.enum(BUSINESS_TYPES, {
    errorMap: () => ({ message: 'Please select a business type' }),
  }),
  businessActivities: z.array(z.string()).default([]),
  state: z.string().length(2, 'Please select a state').refine(
    (val) => val in US_STATES,
    { message: 'Invalid state code' }
  ),
  city: z.string().min(2, 'City must be at least 2 characters'),
  county: z.string().optional(),
  entityType: z.enum(ENTITY_TYPES).default('llc'),
  homeBased: z.boolean().default(false),
  employeeCount: z.enum(EMPLOYEE_COUNTS).default('0'),
  businessName: z.string().optional(),
});

export type IntakeFormInput = z.infer<typeof intakeFormSchema>;

export function validateIntakeForm(data: unknown): {
  success: boolean;
  data?: IntakeFormInput;
  errors?: z.ZodError['errors'];
} {
  const result = intakeFormSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.errors };
}
