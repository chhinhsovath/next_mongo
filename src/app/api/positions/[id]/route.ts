import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { handleApiError } from '@/lib/apiError';
import {
  getPositionById,
  updatePosition,
  deletePosition,
  UpdatePositionInput,
} from '@/services/positionService';

/**
 * GET /api/positions/[id] - Get position by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const position = await getPositionById(id);

    if (!position) {
      return NextResponse.json(
        {
          success: false,
          message: 'Position not found',
          error: 'Position not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { position },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/positions/[id] - Update position
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

    const input: UpdatePositionInput = {
      position_code: body.position_code,
      position_name: body.position_name,
      position_name_khmer: body.position_name_khmer,
      department_id: body.department_id,
      position_level: body.position_level,
      position_status: body.position_status,
    };

    const position = await updatePosition(id, input);

    return NextResponse.json({
      success: true,
      data: { position },
      message: 'Position updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/positions/[id] - Delete position (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth(['admin', 'hr_manager']);
    if (error) return error;

    const { id } = await params;
    await deletePosition(id);

    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
