import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cambodia timezone constant
export const CAMBODIA_TIMEZONE = 'Asia/Phnom_Penh';

/**
 * Convert UTC date to Cambodia timezone
 */
export function toCambodiaTime(date: Date | string): dayjs.Dayjs {
  return dayjs.utc(date).tz(CAMBODIA_TIMEZONE);
}

/**
 * Convert Cambodia time to UTC
 */
export function toUTC(date: Date | string): dayjs.Dayjs {
  return dayjs.tz(date, CAMBODIA_TIMEZONE).utc();
}

/**
 * Get current date in Cambodia timezone as YYYY-MM-DD string
 */
export function getCurrentCambodiaDate(): string {
  return dayjs().tz(CAMBODIA_TIMEZONE).format('YYYY-MM-DD');
}

/**
 * Format date for display in Cambodia timezone
 */
export function formatCambodiaDate(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return toCambodiaTime(date).format(format);
}

/**
 * Calculate work hours between check-in and check-out times
 */
export function calculateWorkHours(checkIn: Date, checkOut: Date): number {
  const diff = dayjs(checkOut).diff(dayjs(checkIn), 'hour', true);
  return Math.round(diff * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate number of days between two dates
 */
export function calculateDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');
  return end.diff(start, 'day') + 1; // Include both start and end dates
}

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}${random}`.toUpperCase();
}

/**
 * Format currency for display (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
