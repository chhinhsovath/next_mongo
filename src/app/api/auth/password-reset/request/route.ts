/**
 * Password Reset Request API
 * POST /api/auth/password-reset/request
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import { PasswordReset } from '@/models/PasswordReset';
import { connectDB } from '@/lib/mongodb';
import { generateResetToken } from '@/lib/security/password';
import { applyRateLimit, rateLimitConfigs } from '@/lib/security/rateLimit';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { logAuthEvent, AuditEventType } from '@/lib/security/audit';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, rateLimitConfigs.auth);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    const body = await request.json();
    const { email } = requestSchema.parse(body);
    
    const sanitizedEmail = sanitizeEmail(email);
    
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail, user_status: 'active' });
    
    // Always return success to prevent email enumeration
    if (!user) {
      logAuthEvent(
        AuditEventType.PASSWORD_RESET_REQUEST,
        request,
        undefined,
        sanitizedEmail,
        'failure',
        { reason: 'User not found' }
      );
      
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }
    
    // Generate reset token
    const { token, hashedToken, expiresAt } = generateResetToken();
    
    // Save reset token to database
    await PasswordReset.create({
      user_id: user.user_id,
      reset_token_hash: hashedToken,
      expires_at: expiresAt,
      used: false,
    });
    
    // Log audit event
    logAuthEvent(
      AuditEventType.PASSWORD_RESET_REQUEST,
      request,
      user.user_id,
      user.username,
      'success'
    );
    
    // TODO: Send email with reset link
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    // await sendPasswordResetEmail(user.username, resetLink);
    
    // For development, log the token (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${user.username}: ${token}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent',
    });
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
    
    console.error('Password reset request error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process password reset request',
        error: 'Internal server error',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
