import { z } from 'zod';

/**
 * Common validation schemas and utilities
 */

// MongoDB ObjectId validation
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Date range schema
export const dateRangeSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
}).refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

// Optional date range schema
export const optionalDateRangeSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

// Email schema
export const emailSchema = z.string().email('Invalid email address').toLowerCase();

// Phone number schema (flexible for international formats)
export const phoneSchema = z.string().min(8, 'Phone number must be at least 8 characters').max(20, 'Phone number must be less than 20 characters');

// URL schema
export const urlSchema = z.string().url('Invalid URL format');

// Status schemas
export const activeStatusSchema = z.enum(['active', 'inactive']);
export const leaveStatusSchema = z.enum(['pending', 'approved', 'rejected', 'cancelled']);
export const payrollStatusSchema = z.enum(['draft', 'approved', 'paid']);
export const evaluationStatusSchema = z.enum(['draft', 'completed', 'acknowledged']);
export const attendanceStatusSchema = z.enum(['present', 'late', 'absent', 'half_day']);

// Employee type schema
export const employeeTypeSchema = z.enum(['full_time', 'part_time', 'contract', 'intern']);

// Gender schema
export const genderSchema = z.enum(['male', 'female', 'other']);

// User role schema
export const userRoleSchema = z.enum(['admin', 'hr_manager', 'manager', 'employee']);

// Date string schema (YYYY-MM-DD)
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Month string schema (YYYY-MM)
export const monthStringSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format');

// GPS coordinates schema
export const gpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

// Optional GPS coordinates schema
export const optionalGpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Search query schema
export const searchQuerySchema = z.object({
  search: z.string().optional(),
  ...paginationSchema.shape,
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

/**
 * Helper function to create a query schema with pagination
 */
export function createQuerySchema<T extends z.ZodRawShape>(shape: T) {
  return z.object({
    ...shape,
    ...paginationSchema.shape,
  });
}

/**
 * Helper function to create a partial update schema
 */
export function createUpdateSchema<T extends z.ZodObject<any>>(schema: T) {
  return schema.partial();
}

export type PaginationSchema = z.infer<typeof paginationSchema>;
export type DateRangeSchema = z.infer<typeof dateRangeSchema>;
export type OptionalDateRangeSchema = z.infer<typeof optionalDateRangeSchema>;
export type GpsCoordinatesSchema = z.infer<typeof gpsCoordinatesSchema>;
export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;
export type IdParamSchema = z.infer<typeof idParamSchema>;
