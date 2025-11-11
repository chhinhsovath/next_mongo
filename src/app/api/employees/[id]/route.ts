import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/apiAuth';
import { handleApiError, apiErrors } from '@/lib/apiError';
import {
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '@/services/employeeService';
import { updateEmployeeSchema } from '@/lib/validation/employeeSchemas';

/**
 * GET /api/employees/[id] - Get employee by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requirePermission('VIEW_EMPLOYEES');
    if (error) return error;

    const { id } = await params;
    const employee = await getEmployeeById(id);

    return NextResponse.json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/employees/[id] - Update employee
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requirePermission('MANAGE_EMPLOYEES');
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateEmployeeSchema.safeParse(body);
    if (!validation.success) {
      throw apiErrors.validation('Invalid employee data', validation.error.issues);
    }

    const employee = await updateEmployee(id, validation.data);

    return NextResponse.json({
      success: true,
      data: { employee },
      message: 'Employee updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/employees/[id] - Soft delete employee
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requirePermission('MANAGE_EMPLOYEES');
    if (error) return error;

    const { id } = await params;
    await deleteEmployee(id);

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
