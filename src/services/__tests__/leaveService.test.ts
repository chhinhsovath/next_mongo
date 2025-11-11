import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
  validateLeaveOverlap,
  calculateLeaveDays,
  getOrCreateLeaveBalance,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../leaveService';
import LeaveRequest from '@/models/LeaveRequest';
import LeaveBalance from '@/models/LeaveBalance';
import LeaveType from '@/models/LeaveType';
import Employee from '@/models/Employee';
import Department from '@/models/Department';
import Position from '@/models/Position';
import { CreateLeaveRequestInput, ApproveLeaveInput, RejectLeaveInput } from '@/types/leave';

// Mock nanoid to avoid ESM issues
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test${idCounter++}`),
}));

// Mock the connectDB function to use in-memory database
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(mongoose),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  // Reset counter
  idCounter = 0;
});

describe('Leave Service - Overlap Validation', () => {
  let testEmployee: any;
  let testLeaveType: any;

  beforeEach(async () => {
    // Create test data
    const department = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_status: 'active',
    });

    const position = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      department_id: department.department_id,
      position_status: 'active',
    });

    testEmployee = await Employee.create({
      employee_id: 'EMP-001',
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      national_id: '1234567890123',
      address: '123 Main St',
      department_id: department.department_id,
      position_id: position.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    testLeaveType = await LeaveType.create({
      leave_type_id: 'LT-001',
      leave_type_name: 'Annual Leave',
      annual_quota: 18,
      is_paid: true,
      leave_type_status: 'active',
    });
  });

  test('should detect overlap with existing pending leave', async () => {
    // Create existing leave request
    await LeaveRequest.create({
      leave_request_id: 'LR-001',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      start_date: new Date('2024-06-10'),
      end_date: new Date('2024-06-15'),
      total_days: 6,
      reason: 'Vacation',
      leave_status: 'pending',
    });

    // Test overlapping dates
    const result = await validateLeaveOverlap(
      testEmployee.employee_id,
      new Date('2024-06-12'),
      new Date('2024-06-18')
    );

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Leave request overlaps with existing leave request');
  });

  test('should detect overlap with existing approved leave', async () => {
    await LeaveRequest.create({
      leave_request_id: 'LR-002',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      start_date: new Date('2024-07-01'),
      end_date: new Date('2024-07-05'),
      total_days: 5,
      reason: 'Holiday',
      leave_status: 'approved',
    });

    const result = await validateLeaveOverlap(
      testEmployee.employee_id,
      new Date('2024-07-03'),
      new Date('2024-07-08')
    );

    expect(result.valid).toBe(false);
  });

  test('should allow non-overlapping leave dates', async () => {
    await LeaveRequest.create({
      leave_request_id: 'LR-003',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      start_date: new Date('2024-08-01'),
      end_date: new Date('2024-08-05'),
      total_days: 5,
      reason: 'Vacation',
      leave_status: 'approved',
    });

    const result = await validateLeaveOverlap(
      testEmployee.employee_id,
      new Date('2024-08-10'),
      new Date('2024-08-15')
    );

    expect(result.valid).toBe(true);
  });

  test('should exclude specific request when checking overlap', async () => {
    const existingRequest = await LeaveRequest.create({
      leave_request_id: 'LR-004',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      start_date: new Date('2024-09-01'),
      end_date: new Date('2024-09-05'),
      total_days: 5,
      reason: 'Vacation',
      leave_status: 'pending',
    });

    // Should be valid when excluding the same request
    const result = await validateLeaveOverlap(
      testEmployee.employee_id,
      new Date('2024-09-01'),
      new Date('2024-09-05'),
      existingRequest.leave_request_id
    );

    expect(result.valid).toBe(true);
  });

  test('should ignore rejected and cancelled leaves', async () => {
    await LeaveRequest.create({
      leave_request_id: 'LR-005',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      start_date: new Date('2024-10-01'),
      end_date: new Date('2024-10-05'),
      total_days: 5,
      reason: 'Vacation',
      leave_status: 'rejected',
    });

    const result = await validateLeaveOverlap(
      testEmployee.employee_id,
      new Date('2024-10-01'),
      new Date('2024-10-05')
    );

    expect(result.valid).toBe(true);
  });
});

describe('Leave Service - Balance Calculation', () => {
  let testEmployee: any;
  let testLeaveType: any;

  beforeEach(async () => {
    const department = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_status: 'active',
    });

    const position = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      department_id: department.department_id,
      position_status: 'active',
    });

    testEmployee = await Employee.create({
      employee_id: 'EMP-001',
      employee_code: 'EMP001',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'female',
      national_id: '9876543210987',
      address: '456 Second St',
      department_id: department.department_id,
      position_id: position.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1200,
    });

    testLeaveType = await LeaveType.create({
      leave_type_id: 'LT-001',
      leave_type_name: 'Annual Leave',
      annual_quota: 18,
      is_paid: true,
      leave_type_status: 'active',
    });
  });

  test('should create new leave balance if not exists', async () => {
    const balance = await getOrCreateLeaveBalance(
      testEmployee.employee_id,
      testLeaveType.leave_type_id,
      2024
    );

    expect(balance).toBeDefined();
    expect(balance.employee_id).toBe(testEmployee.employee_id);
    expect(balance.leave_type_id).toBe(testLeaveType.leave_type_id);
    expect(balance.year).toBe(2024);
    expect(balance.total_allocated).toBe(18);
    expect(balance.used_days).toBe(0);
    expect(balance.remaining_days).toBe(18);
  });

  test('should return existing leave balance', async () => {
    // Create initial balance
    const initialBalance = await LeaveBalance.create({
      leave_balance_id: 'LB-001',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      year: 2024,
      total_allocated: 18,
      used_days: 5,
      remaining_days: 13,
    });

    const balance = await getOrCreateLeaveBalance(
      testEmployee.employee_id,
      testLeaveType.leave_type_id,
      2024
    );

    expect(balance.leave_balance_id).toBe(initialBalance.leave_balance_id);
    expect(balance.used_days).toBe(5);
    expect(balance.remaining_days).toBe(13);
  });

  test('should calculate leave days correctly', () => {
    // Single day
    expect(calculateLeaveDays(new Date('2024-06-10'), new Date('2024-06-10'))).toBe(1);
    
    // Multiple days
    expect(calculateLeaveDays(new Date('2024-06-10'), new Date('2024-06-15'))).toBe(6);
    
    // One week
    expect(calculateLeaveDays(new Date('2024-06-01'), new Date('2024-06-07'))).toBe(7);
  });

  test('should reject leave request with insufficient balance', async () => {
    // Create balance with limited days
    await LeaveBalance.create({
      leave_balance_id: 'LB-002',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      year: 2024,
      total_allocated: 18,
      used_days: 15,
      remaining_days: 3,
    });

    const leaveData: CreateLeaveRequestInput = {
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      start_date: new Date('2024-06-10'),
      end_date: new Date('2024-06-15'), // 6 days
      reason: 'Vacation',
    };

    await expect(createLeaveRequest(leaveData)).rejects.toThrow('Insufficient leave balance');
  });
});

describe('Leave Service - Approval/Rejection Logic', () => {
  let testEmployee: any;
  let testLeaveType: any;
  let testLeaveRequest: any;

  beforeEach(async () => {
    const department = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_status: 'active',
    });

    const position = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      department_id: department.department_id,
      position_status: 'active',
    });

    testEmployee = await Employee.create({
      employee_id: 'EMP-001',
      employee_code: 'EMP001',
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob.johnson@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      national_id: '5555555555555',
      address: '789 Third St',
      department_id: department.department_id,
      position_id: position.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1500,
    });

    testLeaveType = await LeaveType.create({
      leave_type_id: 'LT-001',
      leave_type_name: 'Annual Leave',
      annual_quota: 18,
      is_paid: true,
      leave_type_status: 'active',
    });

    // Create leave balance
    await LeaveBalance.create({
      leave_balance_id: 'LB-001',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      year: 2024,
      total_allocated: 18,
      used_days: 0,
      remaining_days: 18,
    });

    // Create pending leave request
    testLeaveRequest = await LeaveRequest.create({
      leave_request_id: 'LR-001',
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      start_date: new Date('2024-06-10'),
      end_date: new Date('2024-06-14'),
      total_days: 5,
      reason: 'Vacation',
      leave_status: 'pending',
    });
  });

  test('should approve leave request and update balance', async () => {
    const approveData: ApproveLeaveInput = {
      approved_by: 'MGR-001',
    };

    const approved = await approveLeaveRequest(testLeaveRequest.leave_request_id, approveData);

    expect(approved.leave_status).toBe('approved');
    expect(approved.approved_by).toBe('MGR-001');
    expect(approved.approved_at).toBeDefined();

    // Check balance was updated
    const balance = await LeaveBalance.findOne({
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      year: 2024,
    });

    expect(balance?.used_days).toBe(5);
    expect(balance?.remaining_days).toBe(13);
  });

  test('should reject leave request without updating balance', async () => {
    const rejectData: RejectLeaveInput = {
      rejection_reason: 'Insufficient staffing',
    };

    const rejected = await rejectLeaveRequest(testLeaveRequest.leave_request_id, rejectData);

    expect(rejected.leave_status).toBe('rejected');
    expect(rejected.rejection_reason).toBe('Insufficient staffing');

    // Check balance was not updated
    const balance = await LeaveBalance.findOne({
      employee_id: testEmployee.employee_id,
      leave_type_id: testLeaveType.leave_type_id,
      year: 2024,
    });

    expect(balance?.used_days).toBe(0);
    expect(balance?.remaining_days).toBe(18);
  });

  test('should not approve already approved leave request', async () => {
    // First approval
    await approveLeaveRequest(testLeaveRequest.leave_request_id, { approved_by: 'MGR-001' });

    // Try to approve again
    await expect(
      approveLeaveRequest(testLeaveRequest.leave_request_id, { approved_by: 'MGR-002' })
    ).rejects.toThrow('Only pending leave requests can be approved');
  });

  test('should not reject already rejected leave request', async () => {
    // First rejection
    await rejectLeaveRequest(testLeaveRequest.leave_request_id, { rejection_reason: 'Test' });

    // Try to reject again
    await expect(
      rejectLeaveRequest(testLeaveRequest.leave_request_id, { rejection_reason: 'Test again' })
    ).rejects.toThrow('Only pending leave requests can be rejected');
  });

  test('should not approve non-existent leave request', async () => {
    await expect(
      approveLeaveRequest('NON-EXISTENT', { approved_by: 'MGR-001' })
    ).rejects.toThrow('Leave request not found');
  });

  test('should not reject non-existent leave request', async () => {
    await expect(
      rejectLeaveRequest('NON-EXISTENT', { rejection_reason: 'Test' })
    ).rejects.toThrow('Leave request not found');
  });
});
