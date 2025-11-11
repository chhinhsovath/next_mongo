import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getPerformanceEvaluationById,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
} from '@/services/performanceService';
import { createErrorResponse } from '@/lib/apiError';

export async function GET(
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
    const evaluation = await getPerformanceEvaluationById(id);

    if (!evaluation) {
      return NextResponse.json(
        createErrorResponse('Performance evaluation not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error('Error fetching performance evaluation:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to fetch performance evaluation',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Validate criteria if provided
    if (body.criteria) {
      if (!Array.isArray(body.criteria) || body.criteria.length === 0) {
        return NextResponse.json(
          createErrorResponse(
            'Invalid criteria',
            'VALIDATION_ERROR',
            'At least one criterion is required'
          ),
          { status: 400 }
        );
      }

      for (const criterion of body.criteria) {
        if (!criterion.name || !criterion.description || typeof criterion.score !== 'number') {
          return NextResponse.json(
            createErrorResponse(
              'Invalid criterion',
              'VALIDATION_ERROR',
              'Each criterion must have name, description, and score'
            ),
            { status: 400 }
          );
        }

        if (criterion.score < 1 || criterion.score > 5) {
          return NextResponse.json(
            createErrorResponse(
              'Invalid score',
              'VALIDATION_ERROR',
              'Score must be between 1 and 5'
            ),
            { status: 400 }
          );
        }
      }
    }

    const evaluation = await updatePerformanceEvaluation(id, body);

    if (!evaluation) {
      return NextResponse.json(
        createErrorResponse('Performance evaluation not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error('Error updating performance evaluation:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to update performance evaluation',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const deleted = await deletePerformanceEvaluation(id);

    if (!deleted) {
      return NextResponse.json(
        createErrorResponse('Performance evaluation not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Performance evaluation deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting performance evaluation:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to delete performance evaluation',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}
