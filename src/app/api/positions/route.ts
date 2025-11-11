import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { handleApiError } from '@/lib/apiError';
import {
  getAllPositions,
  getPositionsByDepartment,
  getPositionsWithDetails,
  createPosition,
  CreatePositionInput,
} from '@/services/positionService';

/**
 * GET /api/positions - List all positions
 */
export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const department_id = searchParams.get('department_id');
    const withDetails = searchParams.get('with_details') === 'true';
    const includeInactive = searchParams.get('include_inactive') === 'true';

    if (department_id) {
      const positions = await getPositionsByDepartment(department_id);
      return NextResponse.json({
        success: true,
        data: { positions },
      });
    }

    if (withDetails) {
      const positions = await getPositionsWithDetails();
      return NextResponse.json({
        success: true,
        data: { positions },
      });
    }

    const positions = await getAllPositions(includeInactive);

    return NextResponse.json({
      success: true,
      data: { positions },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/positions - Create a new position
 */
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth(['admin', 'hr_manager']);
    if (error) return error;

    const body = await request.json();

    const input: CreatePositionInput = {
      position_code: body.position_code,
      position_name: body.position_name,
      position_name_khmer: body.position_name_khmer,
      department_id: body.department_id,
      position_level: body.position_level,
    };

    const position = await createPosition(input);

    return NextResponse.json(
      {
        success: true,
        data: { position },
        message: 'Position created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
