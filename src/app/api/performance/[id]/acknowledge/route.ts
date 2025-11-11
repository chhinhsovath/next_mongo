import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { acknowledgePerformanceEvaluation } from '@/services/performanceService';
import { createErrorResponse } from '@/lib/apiError';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createErrorResponse('Authentication required', 'AUTH_REQUIRED'),
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.acknowledged_by) {
      return NextResponse.json(
        createErrorResponse(
          'Missing required field',
          'VALIDATION_ERROR',
          'acknowledged_by is required'
        ),
        { status: 400 }
      );
    }

    const evaluation = await acknowledgePerformanceEvaluation(
      id,
      body.acknowledged_by
    );

    if (!evaluation) {
      return NextResponse.json(
        createErrorResponse('Performance evaluation not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: evaluation,
      message: 'Performance evaluation acknowledged successfully',
    });
  } catch (error: any) {
    console.error('Error acknowledging performance evaluation:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to acknowledge performance evaluation',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}
