/**
 * Password Reset Token Verification API
 * POST /api/auth/password-reset/verify
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PasswordReset } from '@/models/PasswordReset';
import { connectDB } from '@/lib/mongodb';
import { verifyResetToken } from '@/lib/security/password';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifySchema.parse(body);
    
    await connectDB();
    
    // Find all non-used, non-expired reset tokens
    const resetRequests = await PasswordReset.find({
      used: false,
      expires_at: { $gt: new Date() },
    });
    
    // Verify token against stored hashes
    for (const resetRequest of resetRequests) {
      const isValid = await verifyResetToken(token, resetRequest.reset_token_hash);
      
      if (isValid) {
        return NextResponse.json({
          success: true,
          message: 'Token is valid',
          data: {
            user_id: resetRequest.user_id,
          },
        });
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or expired reset token',
        error: 'Token verification failed',
        code: 'INVALID_TOKEN',
      },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.issues[0].message,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }
    
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify token',
        error: 'Internal server error',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
