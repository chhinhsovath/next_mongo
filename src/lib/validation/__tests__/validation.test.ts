import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  paginationSchema,
  dateRangeSchema,
  emailSchema,
  phoneSchema,
  gpsCoordinatesSchema,
} from '../commonSchemas';
import { createEmployeeSchema } from '../employeeSchemas';
import { createLeaveRequestSchema } from '../leaveSchemas';
import { checkInSchema } from '../attendanceSchemas';

describe('Common Validation Schemas', () => {
  describe('paginationSchema', () => {
    it('should validate correct pagination', () => {
      const result = paginationSchema.safeParse({ page: 1, limit: 20 });
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject negative page', () => {
      const result = paginationSchema.safeParse({ page: -1, limit: 20 });
      expect(result.success).toBe(false);
    });

    it('should reject limit over 100', () => {
      const result = paginationSchema.safeParse({ page: 1, limit: 150 });
      expect(result.success).toBe(false);
    });
  });

  describe('dateRangeSchema', () => {
    it('should validate correct date range', () => {
      const result = dateRangeSchema.safeParse({
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('should reject end date before start date', () => {
      const result = dateRangeSchema.safeParse({
        start_date: '2024-12-31',
        end_date: '2024-01-01',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = dateRangeSchema.safeParse({
        start_date: '01-01-2024',
        end_date: '12-31-2024',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('should validate correct email', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('invalid-email');
      expect(result.success).toBe(false);
    });

    it('should convert to lowercase', () => {
      const result = emailSchema.safeParse('TEST@EXAMPLE.COM');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });
  });

  describe('phoneSchema', () => {
    it('should validate correct phone', () => {
      const result = phoneSchema.safeParse('0123456789');
      expect(result.success).toBe(true);
    });

    it('should reject too short phone', () => {
      const result = phoneSchema.safeParse('123');
      expect(result.success).toBe(false);
    });

    it('should reject too long phone', () => {
      const result = phoneSchema.safeParse('123456789012345678901');
      expect(result.success).toBe(false);
    });
  });

  describe('gpsCoordinatesSchema', () => {
    it('should validate correct coordinates', () => {
      const result = gpsCoordinatesSchema.safeParse({
        latitude: 11.5564,
        longitude: 104.9282,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitude', () => {
      const result = gpsCoordinatesSchema.safeParse({
        latitude: 100,
        longitude: 104.9282,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const result = gpsCoordinatesSchema.safeParse({
        latitude: 11.5564,
        longitude: 200,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Employee Validation', () => {
  const validEmployeeData = {
    employee_code: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '0123456789',
    date_of_birth: new Date('1990-01-01'),
    gender: 'male' as const,
    national_id: 'ID123456',
    address: '123 Main St',
    department_id: 'dept123',
    position_id: 'pos123',
    employee_type: 'full_time' as const,
    hire_date: new Date('2020-01-01'),
    salary_amount: 1000,
  };

  it('should validate correct employee data', () => {
    const result = createEmployeeSchema.safeParse(validEmployeeData);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const { email, ...incomplete } = validEmployeeData;
    const result = createEmployeeSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const invalidData = { ...validEmployeeData, email: 'invalid' };
    const result = createEmployeeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject negative salary', () => {
    const invalidData = { ...validEmployeeData, salary_amount: -100 };
    const result = createEmployeeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Leave Request Validation', () => {
  const validLeaveData = {
    employee_id: 'emp123',
    leave_type_id: 'lt123',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    reason: 'Vacation',
  };

  it('should validate correct leave request', () => {
    const result = createLeaveRequestSchema.safeParse(validLeaveData);
    expect(result.success).toBe(true);
  });

  it('should reject end date before start date', () => {
    const invalidData = {
      ...validLeaveData,
      start_date: '2024-01-05',
      end_date: '2024-01-01',
    };
    const result = createLeaveRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty reason', () => {
    const invalidData = { ...validLeaveData, reason: '' };
    const result = createLeaveRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject reason over 500 characters', () => {
    const invalidData = { ...validLeaveData, reason: 'a'.repeat(501) };
    const result = createLeaveRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Attendance Validation', () => {
  const validCheckInData = {
    employee_id: 'emp123',
    work_date: '2024-01-01',
    check_in_time: new Date('2024-01-01T08:00:00Z'),
    check_in_location_lat: 11.5564,
    check_in_location_lng: 104.9282,
  };

  it('should validate correct check-in data', () => {
    const result = checkInSchema.safeParse(validCheckInData);
    expect(result.success).toBe(true);
  });

  it('should validate check-in without GPS', () => {
    const { check_in_location_lat, check_in_location_lng, ...dataWithoutGPS } = validCheckInData;
    const result = checkInSchema.safeParse(dataWithoutGPS);
    expect(result.success).toBe(true);
  });

  it('should reject invalid work_date format', () => {
    const invalidData = { ...validCheckInData, work_date: '01-01-2024' };
    const result = checkInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid GPS coordinates', () => {
    const invalidData = { ...validCheckInData, check_in_location_lat: 100 };
    const result = checkInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
