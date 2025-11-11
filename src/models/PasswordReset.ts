/**
 * Password Reset Model
 * Stores password reset tokens
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  user_id: string;
  reset_token_hash: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  reset_token_hash: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for automatic cleanup of expired tokens
PasswordResetSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset = mongoose.models.PasswordReset || 
  mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
