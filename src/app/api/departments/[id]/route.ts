import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { handleApiError } from '@/lib/apiError';
import {
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  UpdateDepartmentInput,
} from '@/services/departmentService';

/**
 * GET /api/departments/[id] - Get department by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const department = await getDepartmentById(id);

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: 'Department not found',
          error: 'Department not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { department },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/departments/[id] - Update department
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth(['admin', 'hr_manager']);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const input: UpdateDepartmentInput = {
      department_code: body.department_code,
      department_name: body.department_name,
      department_name_khmer: body.department_name_khmer,
      manager_id: body.manager_id,
      parent_department_id: body.parent_department_id,
      department_status: body.department_status,
    };

    const department = await updateDepartment(id, input);

    return NextResponse.json({
      success: true,
      data: { department },
      message: 'Department updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/departments/[id] - Delete department (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth(['admin', 'hr_manager']);
    if (error) return error;

    const { id } = await params;
    await deleteDepartment(id);

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
