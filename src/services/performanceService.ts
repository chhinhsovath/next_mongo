import PerformanceEvaluation from '@/models/PerformanceEvaluation';
import { connectDB } from '@/lib/mongodb';
import {
  CreatePerformanceEvaluationRequest,
  UpdatePerformanceEvaluationRequest,
  PerformanceCriterion,
} from '@/types/performance';

/**
 * Calculate overall score from criteria scores
 */
export function calculateOverallScore(criteria: PerformanceCriterion[]): number {
  if (!criteria || criteria.length === 0) {
    return 0;
  }

  const totalScore = criteria.reduce((sum, criterion) => sum + criterion.score, 0);
  const averageScore = totalScore / criteria.length;
  
  // Round to 2 decimal places
  return Math.round(averageScore * 100) / 100;
}

/**
 * Generate unique evaluation ID
 */
function generateEvaluationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `EVAL-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a new performance evaluation
 */
export async function createPerformanceEvaluation(
  data: CreatePerformanceEvaluationRequest
) {
  await connectDB();

  const evaluation_id = generateEvaluationId();
  const overall_score = calculateOverallScore(data.criteria);

  const evaluation = await PerformanceEvaluation.create({
    evaluation_id,
    employee_id: data.employee_id,
    evaluator_id: data.evaluator_id,
    evaluation_period: {
      start: new Date(data.evaluation_period.start),
      end: new Date(data.evaluation_period.end),
    },
    criteria: data.criteria,
    overall_score,
    overall_comments: data.overall_comments || '',
    goals: data.goals || [],
    development_plan: data.development_plan || '',
    evaluation_status: 'draft',
  });

  return evaluation;
}

/**
 * Get performance evaluations by employee ID
 */
export async function getPerformanceEvaluationsByEmployee(
  employee_id: string,
  options?: {
    limit?: number;
    skip?: number;
  }
) {
  await connectDB();

  const query = PerformanceEvaluation.find({ employee_id })
    .sort({ 'evaluation_period.start': -1 });

  if (options?.limit) {
    query.limit(options.limit);
  }

  if (options?.skip) {
    query.skip(options.skip);
  }

  const evaluations = await query.exec();
  const total = await PerformanceEvaluation.countDocuments({ employee_id });

  return { evaluations, total };
}

/**
 * Get performance evaluation by ID
 */
export async function getPerformanceEvaluationById(evaluation_id: string) {
  await connectDB();

  const evaluation = await PerformanceEvaluation.findOne({ evaluation_id });
  return evaluation;
}

/**
 * Update performance evaluation
 */
export async function updatePerformanceEvaluation(
  evaluation_id: string,
  data: UpdatePerformanceEvaluationRequest
) {
  await connectDB();

  const updateData: any = { ...data };

  // Recalculate overall score if criteria are updated
  if (data.criteria) {
    updateData.overall_score = calculateOverallScore(data.criteria);
  }

  // Convert date strings to Date objects if provided
  if (data.evaluation_period) {
    updateData.evaluation_period = {
      start: new Date(data.evaluation_period.start),
      end: new Date(data.evaluation_period.end),
    };
  }

  const evaluation = await PerformanceEvaluation.findOneAndUpdate(
    { evaluation_id },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return evaluation;
}

/**
 * Delete performance evaluation
 */
export async function deletePerformanceEvaluation(evaluation_id: string) {
  await connectDB();

  const result = await PerformanceEvaluation.deleteOne({ evaluation_id });
  return result.deletedCount > 0;
}

/**
 * Acknowledge performance evaluation
 */
export async function acknowledgePerformanceEvaluation(
  evaluation_id: string,
  acknowledged_by: string
) {
  await connectDB();

  const evaluation = await PerformanceEvaluation.findOneAndUpdate(
    { evaluation_id },
    {
      $set: {
        evaluation_status: 'acknowledged',
        acknowledged_by,
        acknowledged_at: new Date(),
      },
    },
    { new: true }
  );

  return evaluation;
}

/**
 * Get performance trend for an employee
 */
export async function getPerformanceTrend(employee_id: string, limit: number = 5) {
  await connectDB();

  const evaluations = await PerformanceEvaluation.find({
    employee_id,
    evaluation_status: { $in: ['completed', 'acknowledged'] },
  })
    .sort({ 'evaluation_period.start': -1 })
    .limit(limit)
    .select('evaluation_period overall_score')
    .exec();

  return evaluations.reverse(); // Return in chronological order for chart
}

/**
 * Get all performance evaluations with filters
 */
export async function getAllPerformanceEvaluations(filters?: {
  employee_id?: string;
  evaluator_id?: string;
  evaluation_status?: string;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}) {
  await connectDB();

  const query: any = {};

  if (filters?.employee_id) {
    query.employee_id = filters.employee_id;
  }

  if (filters?.evaluator_id) {
    query.evaluator_id = filters.evaluator_id;
  }

  if (filters?.evaluation_status) {
    query.evaluation_status = filters.evaluation_status;
  }

  if (filters?.start_date || filters?.end_date) {
    query['evaluation_period.start'] = {};
    if (filters.start_date) {
      query['evaluation_period.start'].$gte = filters.start_date;
    }
    if (filters.end_date) {
      query['evaluation_period.start'].$lte = filters.end_date;
    }
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const evaluations = await PerformanceEvaluation.find(query)
    .sort({ 'evaluation_period.start': -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await PerformanceEvaluation.countDocuments(query);

  return {
    evaluations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
