import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createPerformanceEvaluation,
  getAllPerformanceEvaluations,
} from '@/services/performanceService';
import { createErrorResponse } from '@/lib/apiError';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createErrorResponse('Authentication required', 'AUTH_REQUIRED'),
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const employee_id = searchParams.get('employee_id') || undefined;
    const evaluator_id = searchParams.get('evaluator_id') || undefined;
    const evaluation_status = searchParams.get('evaluation_status') || undefined;
    const start_date = searchParams.get('start_date')
      ? new Date(searchParams.get('start_date')!)
      : undefined;
    const end_date = searchParams.get('end_date')
      ? new Date(searchParams.get('end_date')!)
      : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await getAllPerformanceEvaluations({
      employee_id,
      evaluator_id,
      evaluation_status,
      start_date,
      end_date,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching performance evaluations:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to fetch performance evaluations',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createErrorResponse('Authentication required', 'AUTH_REQUIRED'),
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.employee_id || !body.evaluator_id || !body.evaluation_period || !body.criteria) {
      return NextResponse.json(
        createErrorResponse(
          'Missing required fields',
          'VALIDATION_ERROR',
          'employee_id, evaluator_id, evaluation_period, and criteria are required'
        ),
        { status: 400 }
      );
    }

    // Validate criteria array
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

    // Validate each criterion
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

    const evaluation = await createPerformanceEvaluation(body);

    return NextResponse.json(
      {
        success: true,
        data: evaluation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating performance evaluation:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to create performance evaluation',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}
