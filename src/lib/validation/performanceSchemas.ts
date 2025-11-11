import { z } from 'zod';

const criterionSchema = z.object({
  name: z.string().min(1, 'Criterion name is required'),
  description: z.string().optional(),
  score: z.number().min(1, 'Score must be at least 1').max(5, 'Score must be at most 5'),
  comments: z.string().optional(),
});

const goalSchema = z.object({
  description: z.string().min(1, 'Goal description is required'),
  achieved: z.boolean(),
});

export const createPerformanceEvaluationSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  evaluator_id: z.string().min(1, 'Evaluator ID is required'),
  evaluation_period: z.object({
    start: z.string().or(z.date()).transform((val) => new Date(val)),
    end: z.string().or(z.date()).transform((val) => new Date(val)),
  }).refine((data) => data.start <= data.end, {
    message: 'End date must be after or equal to start date',
  }),
  criteria: z.array(criterionSchema).min(1, 'At least one criterion is required'),
  overall_comments: z.string().optional(),
  goals: z.array(goalSchema).optional(),
  development_plan: z.string().optional(),
});

export const updatePerformanceEvaluationSchema = z.object({
  evaluation_period: z.object({
    start: z.string().or(z.date()).transform((val) => new Date(val)),
    end: z.string().or(z.date()).transform((val) => new Date(val)),
  }).optional(),
  criteria: z.array(criterionSchema).optional(),
  overall_comments: z.string().optional(),
  goals: z.array(goalSchema).optional(),
  development_plan: z.string().optional(),
  evaluation_status: z.enum(['draft', 'completed', 'acknowledged']).optional(),
});

export const acknowledgeEvaluationSchema = z.object({
  acknowledged_by: z.string().min(1, 'Employee ID is required'),
});

export const performanceQuerySchema = z.object({
  employee_id: z.string().optional(),
  evaluator_id: z.string().optional(),
  evaluation_status: z.enum(['draft', 'completed', 'acknowledged']).optional(),
  start_date: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  end_date: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export type CreatePerformanceEvaluationSchema = z.infer<typeof createPerformanceEvaluationSchema>;
export type UpdatePerformanceEvaluationSchema = z.infer<typeof updatePerformanceEvaluationSchema>;
export type AcknowledgeEvaluationSchema = z.infer<typeof acknowledgeEvaluationSchema>;
export type PerformanceQuerySchema = z.infer<typeof performanceQuerySchema>;
