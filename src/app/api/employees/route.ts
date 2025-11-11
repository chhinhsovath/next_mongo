import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/apiAuth';
import { apiErrors } from '@/lib/apiError';
import { getEmployees, createEmployee } from '@/services/employeeService';
import { createEmployeeSchema } from '@/lib/validation/employeeSchemas';
import { withApiHandler, createSuccessResponse, createListResponse } from '@/lib/apiMiddleware';
import { parseAndValidateBody } from '@/lib/validation/middleware';

/**
 * GET /api/employees - List all employees with filters and pagination
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { error, session } = await requirePermission('VIEW_EMPLOYEES');
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  
  const filters = {
    search: searchParams.get('search') || undefined,
    department_id: searchParams.get('department_id') || undefined,
    position_id: searchParams.get('position_id') || undefined,
    employee_status: searchParams.get('employee_status') || undefined,
    employee_type: searchParams.get('employee_type') || undefined,
  };

  const pagination = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  };

  const result = await getEmployees(filters, pagination);

  return createListResponse(
    result.employees,
    result.total,
    result.page,
    result.limit
  );
});

/**
 * POST /api/employees - Create new employee
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const { error, session } = await requirePermission('MANAGE_EMPLOYEES');
  if (error) return error;

  // Validate request body with middleware
  const validatedData = await parseAndValidateBody(request, createEmployeeSchema);

  const employee = await createEmployee(validatedData);

  return createSuccessResponse(
    { employee },
    'Employee created successfully',
    201
  );
});
