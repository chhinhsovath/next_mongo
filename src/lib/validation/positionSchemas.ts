import { z } from 'zod';

export const createPositionSchema = z.object({
  position_code: z.string().min(1, 'Position code is required'),
  position_name: z.string().min(1, 'Position name is required'),
  position_name_khmer: z.string().optional(),
  department_id: z.string().min(1, 'Department ID is required'),
  position_level: z.number().int().positive().optional(),
});

export const updatePositionSchema = z.object({
  position_code: z.string().min(1).optional(),
  position_name: z.string().min(1).optional(),
  position_name_khmer: z.string().optional(),
  department_id: z.string().min(1).optional(),
  position_level: z.number().int().positive().optional(),
  position_status: z.enum(['active', 'inactive']).optional(),
});

export const positionQuerySchema = z.object({
  department_id: z.string().optional(),
  position_status: z.enum(['active', 'inactive']).optional(),
});

export type CreatePositionSchema = z.infer<typeof createPositionSchema>;
export type UpdatePositionSchema = z.infer<typeof updatePositionSchema>;
export type PositionQuerySchema = z.infer<typeof positionQuerySchema>;
