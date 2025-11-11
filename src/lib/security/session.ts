/**
 * Session Management Utilities
 * Handles session timeout and validation
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Session timeout configuration (30 minutes)
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Check if session is expired
 */
export function isSessionExpired(lastActivity: Date): boolean {
  const now = new Date();
  const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
  return timeSinceLastActivity > SESSION_TIMEOUT_MS;
}

/**
 * Get session with timeout validation
 */
export async function getValidSession() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return null;
  }
  
  // Check if session has expired based on last activity
  // Note: lastActivity tracking would require custom session storage
  // For now, we rely on NextAuth's built-in session expiration
  // if (session.user?.lastActivity) {
  //   const lastActivity = new Date(session.user.lastActivity);
  //   if (isSessionExpired(lastActivity)) {
  //     return null;
  //   }
  // }
  
  return session;
}

/**
 * Session activity tracker for client-side
 */
export class SessionActivityTracker {
  private lastActivity: Date;
  private timeoutId: NodeJS.Timeout | null = null;
  private onTimeout: () => void;
  
  constructor(onTimeout: () => void) {
    this.lastActivity = new Date();
    this.onTimeout = onTimeout;
    this.startTracking();
  }
  
  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.lastActivity = new Date();
    this.resetTimeout();
  }
  
  /**
   * Start tracking user activity
   */
  private startTracking(): void {
    // Track various user activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });
    
    this.resetTimeout();
  }
  
  /**
   * Reset the timeout timer
   */
  private resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.onTimeout();
    }, SESSION_TIMEOUT_MS);
  }
  
  /**
   * Get time remaining until timeout
   */
  getTimeRemaining(): number {
    const now = new Date();
    const elapsed = now.getTime() - this.lastActivity.getTime();
    return Math.max(0, SESSION_TIMEOUT_MS - elapsed);
  }
  
  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return this.getTimeRemaining() === 0;
  }
  
  /**
   * Stop tracking
   */
  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

/**
 * Session warning threshold (5 minutes before timeout)
 */
export const SESSION_WARNING_MS = 5 * 60 * 1000;

/**
 * Check if session is about to expire
 */
export function isSessionAboutToExpire(lastActivity: Date): boolean {
  const now = new Date();
  const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
  return timeSinceLastActivity > (SESSION_TIMEOUT_MS - SESSION_WARNING_MS);
}
