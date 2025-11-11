import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { handleApiError } from '@/lib/apiError';
import {
  getAllDepartments,
  getDepartmentHierarchy,
  createDepartment,
  CreateDepartmentInput,
} from '@/services/departmentService';

/**
 * GET /api/departments - List all departments or get hierarchy
 */
export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const hierarchy = searchParams.get('hierarchy') === 'true';
    const includeInactive = searchParams.get('include_inactive') === 'true';

    if (hierarchy) {
      const departments = await getDepartmentHierarchy();
      return NextResponse.json({
        success: true,
        data: { departments },
      });
    }

    const departments = await getAllDepartments(includeInactive);

    return NextResponse.json({
      success: true,
      data: { departments },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/departments - Create a new department
 */
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(['admin', 'hr_manager']);
    if (error) return error;

    const body = await request.json();

    const input: CreateDepartmentInput = {
      department_code: body.department_code,
      department_name: body.department_name,
      department_name_khmer: body.department_name_khmer,
      manager_id: body.manager_id,
      parent_department_id: body.parent_department_id,
    };

    const department = await createDepartment(input);

    return NextResponse.json(
      {
        success: true,
        data: { department },
        message: 'Department created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
