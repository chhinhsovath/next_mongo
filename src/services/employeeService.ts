import { nanoid } from 'nanoid';
import Employee, { IEmployee } from '@/models/Employee';
import Department from '@/models/Department';
import Position from '@/models/Position';
import { connectDB } from '@/lib/mongodb';
import { apiErrors } from '@/lib/apiError';
import { CreateEmployeeInput, UpdateEmployeeInput } from '@/types/employee';
import { buildSearchQuery, buildPaginationQuery, FIELD_SELECTIONS, optimizeQuery } from '@/lib/queryOptimizer';

export interface EmployeeFilters {
  search?: string;
  department_id?: string;
  position_id?: string;
  employee_status?: string;
  employee_type?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Get paginated list of employees with filters (optimized)
 */
export async function getEmployees(
  filters: EmployeeFilters = {},
  pagination: PaginationParams = {}
) {
  await connectDB();

  const { search, department_id, position_id, employee_status, employee_type } = filters;
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.min(100, Math.max(1, pagination.limit || 10));
  const { skip } = buildPaginationQuery(page, limit);

  // Build optimized query
  const query: any = { deleted_at: null };

  // Use optimized search query builder
  if (search) {
    const searchQuery = buildSearchQuery(search, [
      'first_name',
      'last_name',
      'employee_code',
      'email',
    ]);
    Object.assign(query, searchQuery);
  }

  if (department_id) {
    query.department_id = department_id;
  }

  if (position_id) {
    query.position_id = position_id;
  }

  if (employee_status) {
    query.employee_status = employee_status;
  }

  if (employee_type) {
    query.employee_type = employee_type;
  }

  // Execute optimized queries in parallel
  const [employees, total] = await Promise.all([
    optimizeQuery(
      Employee.find(query),
      FIELD_SELECTIONS.employee.list,
      {
        lean: true,
        skip,
        limit,
        sort: { created_at: -1 },
      }
    ),
    Employee.countDocuments(query),
  ]);

  return {
    employees,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(employeeId: string) {
  await connectDB();

  const employee = await Employee.findOne({
    employee_id: employeeId,
    deleted_at: null,
  }).lean();

  if (!employee) {
    throw apiErrors.notFound('Employee');
  }

  return employee;
}

/**
 * Create new employee
 */
export async function createEmployee(data: CreateEmployeeInput) {
  await connectDB();

  // Validate department exists
  const department = await Department.findOne({
    department_id: data.department_id,
    department_status: 'active',
  });

  if (!department) {
    throw apiErrors.validation('Invalid department_id', {
      field: 'department_id',
      value: data.department_id,
    });
  }

  // Validate position exists
  const position = await Position.findOne({
    position_id: data.position_id,
    position_status: 'active',
  });

  if (!position) {
    throw apiErrors.validation('Invalid position_id', {
      field: 'position_id',
      value: data.position_id,
    });
  }

  // Check for duplicate employee_code
  const existingCode = await Employee.findOne({
    employee_code: data.employee_code,
    deleted_at: null,
  });

  if (existingCode) {
    throw apiErrors.conflict('Employee code already exists');
  }

  // Check for duplicate email
  const existingEmail = await Employee.findOne({
    email: data.email,
    deleted_at: null,
  });

  if (existingEmail) {
    throw apiErrors.conflict('Email already exists');
  }

  // Check for duplicate national_id
  const existingNationalId = await Employee.findOne({
    national_id: data.national_id,
    deleted_at: null,
  });

  if (existingNationalId) {
    throw apiErrors.conflict('National ID already exists');
  }

  // Create employee
  const employee = await Employee.create({
    ...data,
    employee_id: `EMP-${nanoid(10)}`,
    employee_status: 'active',
  });

  return employee.toObject();
}

/**
 * Update employee
 */
export async function updateEmployee(
  employeeId: string,
  data: UpdateEmployeeInput
) {
  await connectDB();

  const employee = await Employee.findOne({
    employee_id: employeeId,
    deleted_at: null,
  });

  if (!employee) {
    throw apiErrors.notFound('Employee');
  }

  // Validate department if provided
  if (data.department_id) {
    const department = await Department.findOne({
      department_id: data.department_id,
      department_status: 'active',
    });

    if (!department) {
      throw apiErrors.validation('Invalid department_id', {
        field: 'department_id',
        value: data.department_id,
      });
    }
  }

  // Validate position if provided
  if (data.position_id) {
    const position = await Position.findOne({
      position_id: data.position_id,
      position_status: 'active',
    });

    if (!position) {
      throw apiErrors.validation('Invalid position_id', {
        field: 'position_id',
        value: data.position_id,
      });
    }
  }

  // Check for duplicate employee_code
  if (data.employee_code && data.employee_code !== employee.employee_code) {
    const existingCode = await Employee.findOne({
      employee_code: data.employee_code,
      deleted_at: null,
      employee_id: { $ne: employeeId },
    });

    if (existingCode) {
      throw apiErrors.conflict('Employee code already exists');
    }
  }

  // Check for duplicate email
  if (data.email && data.email !== employee.email) {
    const existingEmail = await Employee.findOne({
      email: data.email,
      deleted_at: null,
      employee_id: { $ne: employeeId },
    });

    if (existingEmail) {
      throw apiErrors.conflict('Email already exists');
    }
  }

  // Check for duplicate national_id
  if (data.national_id && data.national_id !== employee.national_id) {
    const existingNationalId = await Employee.findOne({
      national_id: data.national_id,
      deleted_at: null,
      employee_id: { $ne: employeeId },
    });

    if (existingNationalId) {
      throw apiErrors.conflict('National ID already exists');
    }
  }

  // Update employee
  Object.assign(employee, data);
  await employee.save();

  return employee.toObject();
}

/**
 * Soft delete employee
 */
export async function deleteEmployee(employeeId: string) {
  await connectDB();

  const employee = await Employee.findOne({
    employee_id: employeeId,
    deleted_at: null,
  });

  if (!employee) {
    throw apiErrors.notFound('Employee');
  }

  employee.deleted_at = new Date();
  employee.employee_status = 'terminated';
  await employee.save();

  return { success: true };
}
