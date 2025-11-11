/**
 * CSRF Token API
 * GET /api/auth/csrf - Get CSRF token
 */

import { NextResponse } from 'next/server';
import { setCsrfToken } from '@/lib/security/csrf';

export async function GET() {
  try {
    const token = await setCsrfToken();
    
    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate CSRF token',
        error: 'Internal server error',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
