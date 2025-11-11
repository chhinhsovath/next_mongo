import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
  calculateWorkHours,
  determineAttendanceStatus,
  getWorkDate,
  markAbsences,
} from '../attendanceService';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';
import Department from '@/models/Department';
import Position from '@/models/Position';

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

describe('Attendance Service - Work Hours Calculation', () => {
  test('should calculate work hours for full day', () => {
    const checkIn = new Date('2024-06-10T08:00:00Z');
    const checkOut = new Date('2024-06-10T17:00:00Z');
    
    const hours = calculateWorkHours(checkIn, checkOut);
    
    expect(hours).toBe(9);
  });

  test('should calculate work hours for half day', () => {
    const checkIn = new Date('2024-06-10T08:00:00Z');
    const checkOut = new Date('2024-06-10T12:00:00Z');
    
    const hours = calculateWorkHours(checkIn, checkOut);
    
    expect(hours).toBe(4);
  });

  test('should calculate work hours with minutes', () => {
    const checkIn = new Date('2024-06-10T08:30:00Z');
    const checkOut = new Date('2024-06-10T17:45:00Z');
    
    const hours = calculateWorkHours(checkIn, checkOut);
    
    expect(hours).toBe(9.25);
  });

  test('should round work hours to 2 decimal places', () => {
    const checkIn = new Date('2024-06-10T08:00:00Z');
    const checkOut = new Date('2024-06-10T11:20:00Z');
    
    const hours = calculateWorkHours(checkIn, checkOut);
    
    expect(hours).toBe(3.33);
  });

  test('should calculate work hours across midnight', () => {
    const checkIn = new Date('2024-06-10T22:00:00Z');
    const checkOut = new Date('2024-06-11T06:00:00Z');
    
    const hours = calculateWorkHours(checkIn, checkOut);
    
    expect(hours).toBe(8);
  });
});

describe('Attendance Service - Attendance Status Determination', () => {
  test('should mark as present for on-time check-in', () => {
    // 8:00 AM Cambodia time (1:00 AM UTC)
    const checkIn = new Date('2024-06-10T01:00:00Z');
    
    const status = determineAttendanceStatus(checkIn);
    
    expect(status).toBe('present');
  });

  test('should mark as present for check-in within threshold', () => {
    // 8:10 AM Cambodia time (1:10 AM UTC)
    const checkIn = new Date('2024-06-10T01:10:00Z');
    
    const status = determineAttendanceStatus(checkIn);
    
    expect(status).toBe('present');
  });

  test('should mark as late for check-in after threshold', () => {
    // 8:20 AM Cambodia time (1:20 AM UTC)
    const checkIn = new Date('2024-06-10T01:20:00Z');
    
    const status = determineAttendanceStatus(checkIn);
    
    expect(status).toBe('late');
  });

  test('should mark as late for significantly late check-in', () => {
    // 9:00 AM Cambodia time (2:00 AM UTC)
    const checkIn = new Date('2024-06-10T02:00:00Z');
    
    const status = determineAttendanceStatus(checkIn);
    
    expect(status).toBe('late');
  });

  test('should mark as half_day when work hours less than 4', () => {
    // 8:00 AM Cambodia time
    const checkIn = new Date('2024-06-10T01:00:00Z');
    const workHours = 3.5;
    
    const status = determineAttendanceStatus(checkIn, workHours);
    
    expect(status).toBe('half_day');
  });

  test('should mark as present when work hours exactly 4', () => {
    // 8:00 AM Cambodia time
    const checkIn = new Date('2024-06-10T01:00:00Z');
    const workHours = 4;
    
    const status = determineAttendanceStatus(checkIn, workHours);
    
    expect(status).toBe('present');
  });

  test('should mark as late with half_day when late and short hours', () => {
    // 8:30 AM Cambodia time (1:30 AM UTC)
    const checkIn = new Date('2024-06-10T01:30:00Z');
    const workHours = 3;
    
    const status = determineAttendanceStatus(checkIn, workHours);
    
    expect(status).toBe('half_day');
  });
});

describe('Attendance Service - Absence Detection', () => {
  let testDepartment: any;
  let testPosition: any;
  let testEmployee1: any;
  let testEmployee2: any;
  let testEmployee3: any;

  beforeEach(async () => {
    // Create test data
    testDepartment = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_status: 'active',
    });

    testPosition = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      department_id: testDepartment.department_id,
      position_status: 'active',
    });

    testEmployee1 = await Employee.create({
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
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    testEmployee2 = await Employee.create({
      employee_id: 'EMP-002',
      employee_code: 'EMP002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1991-01-01'),
      gender: 'female',
      national_id: '9876543210987',
      address: '456 Second St',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1200,
    });

    testEmployee3 = await Employee.create({
      employee_id: 'EMP-003',
      employee_code: 'EMP003',
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob.johnson@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1992-01-01'),
      gender: 'male',
      national_id: '5555555555555',
      address: '789 Third St',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      employee_status: 'inactive',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1500,
    });
  });

  test('should mark all active employees as absent when no attendance records', async () => {
    const workDate = '2024-06-10';
    
    const markedCount = await markAbsences(workDate);
    
    expect(markedCount).toBe(2); // Only active employees
    
    const absences = await Attendance.find({ work_date: workDate });
    expect(absences).toHaveLength(2);
    expect(absences.every(a => a.attendance_status === 'absent')).toBe(true);
    expect(absences.every(a => a.attendance_id)).toBe(true);
  });

  test('should not mark employees with existing attendance', async () => {
    const workDate = '2024-06-11';
    
    // Create attendance for employee 1 using new and save to trigger pre-save hook
    const attendance = new Attendance({
      employee_id: testEmployee1._id,
      work_date: workDate,
      check_in_time: new Date('2024-06-11T01:00:00Z'),
      attendance_status: 'present',
    });
    await attendance.save();
    
    const markedCount = await markAbsences(workDate);
    
    expect(markedCount).toBe(1); // Only employee 2 should be marked
    
    const absences = await Attendance.find({ 
      work_date: workDate,
      attendance_status: 'absent'
    });
    expect(absences).toHaveLength(1);
    expect(absences[0].employee_id.toString()).toBe(testEmployee2._id.toString());
  });

  test('should not mark inactive employees as absent', async () => {
    const workDate = '2024-06-12';
    
    const markedCount = await markAbsences(workDate);
    
    const absences = await Attendance.find({ work_date: workDate });
    const employeeIds = absences.map(a => a.employee_id.toString());
    
    expect(employeeIds).not.toContain(testEmployee3._id.toString());
  });

  test('should not mark soft-deleted employees as absent', async () => {
    const workDate = '2024-06-13';
    
    // Soft delete employee 1
    testEmployee1.deleted_at = new Date();
    await testEmployee1.save();
    
    const markedCount = await markAbsences(workDate);
    
    expect(markedCount).toBe(1); // Only employee 2
    
    const absences = await Attendance.find({ work_date: workDate });
    expect(absences).toHaveLength(1);
    expect(absences[0].employee_id.toString()).toBe(testEmployee2._id.toString());
  });

  test('should return zero when all employees have attendance', async () => {
    const workDate = '2024-06-14';
    
    // Create attendance for all active employees using new and save
    const attendance1 = new Attendance({
      employee_id: testEmployee1._id,
      work_date: workDate,
      check_in_time: new Date('2024-06-14T01:00:00Z'),
      attendance_status: 'present',
    });
    await attendance1.save();
    
    const attendance2 = new Attendance({
      employee_id: testEmployee2._id,
      work_date: workDate,
      check_in_time: new Date('2024-06-14T01:00:00Z'),
      attendance_status: 'present',
    });
    await attendance2.save();
    
    const markedCount = await markAbsences(workDate);
    
    expect(markedCount).toBe(0);
  });
});
