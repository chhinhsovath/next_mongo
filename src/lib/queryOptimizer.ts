/**
 * MongoDB query optimization utilities
 */

import { FilterQuery } from 'mongoose';

/**
 * Build optimized pagination query
 */
export function buildPaginationQuery(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return { skip, limit };
}

/**
 * Build optimized search query with text index
 */
export function buildSearchQuery(
  searchTerm: string,
  fields: string[]
): FilterQuery<any> {
  if (!searchTerm) return {};

  const searchRegex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map((field) => ({ [field]: searchRegex })),
  };
}

/**
 * Build date range query
 */
export function buildDateRangeQuery(
  field: string,
  startDate?: Date | string,
  endDate?: Date | string
): FilterQuery<any> {
  const query: any = {};

  if (startDate || endDate) {
    query[field] = {};
    if (startDate) {
      query[field].$gte = new Date(startDate);
    }
    if (endDate) {
      query[field].$lte = new Date(endDate);
    }
  }

  return query;
}

/**
 * Select only necessary fields to reduce data transfer
 */
export function selectFields(fields: string[]): string {
  return fields.join(' ');
}

/**
 * Common field selections for different models
 */
export const FIELD_SELECTIONS = {
  employee: {
    list: 'employee_id employee_code first_name last_name email phone_number employee_type employee_status department_id position_id hire_date',
    detail: 'employee_id employee_code first_name last_name first_name_khmer last_name_khmer email phone_number date_of_birth gender national_id address department_id position_id employee_type employee_status hire_date termination_date salary_amount profile_photo_url',
    minimal: 'employee_id employee_code first_name last_name',
  },
  department: {
    list: 'department_id department_code department_name department_name_khmer manager_id parent_department_id department_status',
    minimal: 'department_id department_name',
  },
  position: {
    list: 'position_id position_code position_name position_name_khmer department_id position_level position_status',
    minimal: 'position_id position_name',
  },
  leave: {
    list: 'leave_request_id employee_id leave_type_id start_date end_date total_days leave_status created_at',
    detail: 'leave_request_id employee_id leave_type_id start_date end_date total_days reason leave_status approved_by approved_at rejection_reason created_at updated_at',
  },
  attendance: {
    list: 'attendance_id employee_id work_date check_in_time check_out_time work_hours attendance_status',
    detail: 'attendance_id employee_id work_date check_in_time check_out_time check_in_location_lat check_in_location_lng check_out_location_lat check_out_location_lng work_hours attendance_status notes',
  },
  payroll: {
    list: 'payroll_id employee_id payroll_month base_salary net_salary payroll_status payment_date',
    detail: 'payroll_id employee_id payroll_month base_salary allowances bonuses deductions overtime_pay net_salary payment_date payroll_status',
  },
  performance: {
    list: 'evaluation_id employee_id evaluator_id evaluation_period overall_score evaluation_status created_at',
    detail: 'evaluation_id employee_id evaluator_id evaluation_period criteria overall_score overall_comments goals development_plan evaluation_status acknowledged_by acknowledged_at',
  },
};

/**
 * Build aggregation pipeline for reports
 */
export function buildAggregationPipeline(options: {
  match?: FilterQuery<any>;
  group?: any;
  sort?: any;
  limit?: number;
  skip?: number;
  project?: any;
}) {
  const pipeline: any[] = [];

  if (options.match) {
    pipeline.push({ $match: options.match });
  }

  if (options.group) {
    pipeline.push({ $group: options.group });
  }

  if (options.sort) {
    pipeline.push({ $sort: options.sort });
  }

  if (options.skip) {
    pipeline.push({ $skip: options.skip });
  }

  if (options.limit) {
    pipeline.push({ $limit: options.limit });
  }

  if (options.project) {
    pipeline.push({ $project: options.project });
  }

  return pipeline;
}

/**
 * Optimize query with lean() and select()
 */
export function optimizeQuery<T>(
  query: any,
  fields?: string,
  options?: {
    lean?: boolean;
    limit?: number;
    skip?: number;
    sort?: any;
  }
) {
  let optimizedQuery = query;

  if (fields) {
    optimizedQuery = optimizedQuery.select(fields);
  }

  if (options?.lean !== false) {
    optimizedQuery = optimizedQuery.lean();
  }

  if (options?.limit) {
    optimizedQuery = optimizedQuery.limit(options.limit);
  }

  if (options?.skip) {
    optimizedQuery = optimizedQuery.skip(options.skip);
  }

  if (options?.sort) {
    optimizedQuery = optimizedQuery.sort(options.sort);
  }

  return optimizedQuery;
}
