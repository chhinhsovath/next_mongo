import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
  generateHeadcountReport,
  generateLeaveUtilizationReport,
  generateAttendanceSummaryReport,
} from '../reportService';
import Employee from '@/models/Employee';
import Department from '@/models/Department';
import Position from '@/models/Position';
import LeaveRequest from '@/models/LeaveRequest';
import LeaveBalance from '@/models/LeaveBalance';
import LeaveType from '@/models/LeaveType';
import Attendance from '@/models/Attendance';

// Mock nanoid
let idCounter = 0;
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => `test${idCounter++}`),
}));

// Mock connectDB
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(mongoose),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  idCounter = 0;
});

describe('Report Service - Headcount Report', () => {
  let dept1: any, dept2: any;
  let pos1: any, pos2: any;

  beforeEach(async () => {
    dept1 = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_name_khmer: 'បច្ចេកវិទ្យាព័ត៌មាន',
      department_status: 'active',
    });

    dept2 = await Department.create({
      department_id: 'DEPT-002',
      department_code: 'HR',
      department_name: 'Human Resources',
      department_name_khmer: 'ធនធានមនុស្ស',
      department_status: 'active',
    });

    pos1 = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      position_name_khmer: 'អ្នកអភិវឌ្ឍន៍',
      department_id: dept1.department_id,
      position_status: 'active',
    });

    pos2 = await Position.create({
      position_id: 'POS-002',
      position_code: 'MGR',
      position_name: 'Manager',
      position_name_khmer: 'អ្នកគ្រប់គ្រង',
      department_id: dept2.department_id,
      position_status: 'active',
    });

    // Create employees
    await Employee.create({
      employee_id: 'EMP-001',
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      national_id: '1111111111111',
      address: 'Address 1',
      department_id: dept1.department_id,
      position_id: pos1.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    await Employee.create({
      employee_id: 'EMP-002',
      employee_code: 'EMP002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1991-01-01'),
      gender: 'female',
      national_id: '2222222222222',
      address: 'Address 2',
      department_id: dept1.department_id,
      position_id: pos1.position_id,
      employee_type: 'part_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 800,
    });

    await Employee.create({
      employee_id: 'EMP-003',
      employee_code: 'EMP003',
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1992-01-01'),
      gender: 'male',
      national_id: '3333333333333',
      address: 'Address 3',
      department_id: dept2.department_id,
      position_id: pos2.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1200,
    });

    await Employee.create({
      employee_id: 'EMP-004',
      employee_code: 'EMP004',
      first_name: 'Alice',
      last_name: 'Williams',
      email: 'alice@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1993-01-01'),
      gender: 'female',
      national_id: '4444444444444',
      address: 'Address 4',
      department_id: dept2.department_id,
      position_id: pos2.position_id,
      employee_type: 'contract',
      employee_status: 'inactive',
      hire_date: new Date('2024-01-01'),
      salary_amount: 900,
    });
  });

  test('should calculate total active employees correctly', async () => {
    const report = await generateHeadcountReport();

    expect(report.total_employees).toBe(3);
  });

  test('should group employees by department accurately', async () => {
    const report = await generateHeadcountReport();

    expect(report.by_department).toHaveLength(2);
    
    const itDept = report.by_department.find(d => d.department_id === dept1.department_id);
    expect(itDept).toBeDefined();
    expect(itDept?.employee_count).toBe(2);
    expect(itDept?.department_name).toBe('Information Technology');
    expect(itDept?.department_name_khmer).toBe('បច្ចេកវិទ្យាព័ត៌មាន');

    const hrDept = report.by_department.find(d => d.department_id === dept2.department_id);
    expect(hrDept).toBeDefined();
    expect(hrDept?.employee_count).toBe(1);
  });

  test('should group employees by position accurately', async () => {
    const report = await generateHeadcountReport();

    expect(report.by_position).toHaveLength(2);
    
    const devPos = report.by_position.find(p => p.position_id === pos1.position_id);
    expect(devPos).toBeDefined();
    expect(devPos?.employee_count).toBe(2);
    expect(devPos?.position_name).toBe('Developer');

    const mgrPos = report.by_position.find(p => p.position_id === pos2.position_id);
    expect(mgrPos).toBeDefined();
    expect(mgrPos?.employee_count).toBe(1);
  });

  test('should group employees by status accurately', async () => {
    const report = await generateHeadcountReport();

    const activeStatus = report.by_status.find(s => s.employee_status === 'active');
    expect(activeStatus).toBeDefined();
    expect(activeStatus?.employee_count).toBe(3);

    const inactiveStatus = report.by_status.find(s => s.employee_status === 'inactive');
    expect(inactiveStatus).toBeDefined();
    expect(inactiveStatus?.employee_count).toBe(1);
  });

  test('should group employees by type accurately', async () => {
    const report = await generateHeadcountReport();

    expect(report.by_type).toHaveLength(2);

    const fullTime = report.by_type.find(t => t.employee_type === 'full_time');
    expect(fullTime).toBeDefined();
    expect(fullTime?.employee_count).toBe(2);

    const partTime = report.by_type.find(t => t.employee_type === 'part_time');
    expect(partTime).toBeDefined();
    expect(partTime?.employee_count).toBe(1);
  });
});

describe('Report Service - Leave Utilization Report', () => {
  let dept: any, pos: any;
  let emp1: any, emp2: any;
  let leaveType1: any, leaveType2: any;

  beforeEach(async () => {
    dept = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_status: 'active',
    });

    pos = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      department_id: dept.department_id,
      position_status: 'active',
    });

    emp1 = await Employee.create({
      employee_id: 'EMP-001',
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      national_id: '1111111111111',
      address: 'Address 1',
      department_id: dept.department_id,
      position_id: pos.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    emp2 = await Employee.create({
      employee_id: 'EMP-002',
      employee_code: 'EMP002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1991-01-01'),
      gender: 'female',
      national_id: '2222222222222',
      address: 'Address 2',
      department_id: dept.department_id,
      position_id: pos.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    leaveType1 = await LeaveType.create({
      leave_type_id: 'LT-001',
      leave_type_name: 'Annual Leave',
      leave_type_name_khmer: 'ច្បាប់ប្រចាំឆ្នាំ',
      annual_quota: 18,
      is_paid: true,
      leave_type_status: 'active',
    });

    leaveType2 = await LeaveType.create({
      leave_type_id: 'LT-002',
      leave_type_name: 'Sick Leave',
      leave_type_name_khmer: 'ច្បាប់ឈឺ',
      annual_quota: 10,
      is_paid: true,
      leave_type_status: 'active',
    });

    // Create leave balances
    await LeaveBalance.create({
      leave_balance_id: 'LB-001',
      employee_id: emp1.employee_id,
      leave_type_id: leaveType1.leave_type_id,
      year: 2024,
      total_allocated: 18,
      used_days: 5,
      remaining_days: 13,
    });

    await LeaveBalance.create({
      leave_balance_id: 'LB-002',
      employee_id: emp2.employee_id,
      leave_type_id: leaveType1.leave_type_id,
      year: 2024,
      total_allocated: 18,
      used_days: 10,
      remaining_days: 8,
    });

    await LeaveBalance.create({
      leave_balance_id: 'LB-003',
      employee_id: emp1.employee_id,
      leave_type_id: leaveType2.leave_type_id,
      year: 2024,
      total_allocated: 10,
      used_days: 2,
      remaining_days: 8,
    });

    // Create leave requests
    await LeaveRequest.create({
      leave_request_id: 'LR-001',
      employee_id: emp1.employee_id,
      leave_type_id: leaveType1.leave_type_id,
      start_date: new Date('2024-01-10'),
      end_date: new Date('2024-01-12'),
      total_days: 3,
      reason: 'Vacation',
      leave_status: 'approved',
    });

    await LeaveRequest.create({
      leave_request_id: 'LR-002',
      employee_id: emp1.employee_id,
      leave_type_id: leaveType1.leave_type_id,
      start_date: new Date('2024-02-15'),
      end_date: new Date('2024-02-16'),
      total_days: 2,
      reason: 'Personal',
      leave_status: 'approved',
    });

    await LeaveRequest.create({
      leave_request_id: 'LR-003',
      employee_id: emp2.employee_id,
      leave_type_id: leaveType1.leave_type_id,
      start_date: new Date('2024-03-01'),
      end_date: new Date('2024-03-05'),
      total_days: 5,
      reason: 'Holiday',
      leave_status: 'approved',
    });

    await LeaveRequest.create({
      leave_request_id: 'LR-004',
      employee_id: emp2.employee_id,
      leave_type_id: leaveType2.leave_type_id,
      start_date: new Date('2024-04-10'),
      end_date: new Date('2024-04-10'),
      total_days: 1,
      reason: 'Sick',
      leave_status: 'pending',
    });

    await LeaveRequest.create({
      leave_request_id: 'LR-005',
      employee_id: emp1.employee_id,
      leave_type_id: leaveType2.leave_type_id,
      start_date: new Date('2024-05-01'),
      end_date: new Date('2024-05-02'),
      total_days: 2,
      reason: 'Medical',
      leave_status: 'rejected',
    });
  });

  test('should calculate leave balance by employee correctly', async () => {
    const report = await generateLeaveUtilizationReport();

    expect(report.by_employee).toHaveLength(3);

    const emp1Annual = report.by_employee.find(
      e => e.employee_id === emp1.employee_id && e.leave_type === 'Annual Leave'
    );
    expect(emp1Annual).toBeDefined();
    expect(emp1Annual?.total_quota).toBe(18);
    expect(emp1Annual?.used_days).toBe(5);
    expect(emp1Annual?.remaining_days).toBe(13);
    expect(emp1Annual?.utilization_rate).toBeCloseTo(27.78, 1);
  });

  test('should calculate leave statistics by leave type correctly', async () => {
    const report = await generateLeaveUtilizationReport();

    const annualLeave = report.by_leave_type.find(
      lt => lt.leave_type_id === leaveType1.leave_type_id
    );
    expect(annualLeave).toBeDefined();
    expect(annualLeave?.total_requests).toBe(3);
    expect(annualLeave?.approved_requests).toBe(3);
    expect(annualLeave?.total_days_taken).toBe(10);
    expect(annualLeave?.average_days_per_request).toBeCloseTo(3.33, 1);

    const sickLeave = report.by_leave_type.find(
      lt => lt.leave_type_id === leaveType2.leave_type_id
    );
    expect(sickLeave).toBeDefined();
    expect(sickLeave?.total_requests).toBe(2);
    expect(sickLeave?.approved_requests).toBe(0);
  });

  test('should calculate summary statistics correctly', async () => {
    const report = await generateLeaveUtilizationReport();

    expect(report.summary.total_leave_requests).toBe(5);
    expect(report.summary.approved_requests).toBe(3);
    expect(report.summary.pending_requests).toBe(1);
    expect(report.summary.rejected_requests).toBe(1);
  });

  test('should filter leave requests by date range', async () => {
    const startDate = new Date('2024-02-01');
    const endDate = new Date('2024-03-31');

    const report = await generateLeaveUtilizationReport(startDate, endDate);

    const annualLeave = report.by_leave_type.find(
      lt => lt.leave_type_id === leaveType1.leave_type_id
    );
    expect(annualLeave?.total_requests).toBe(2);
    expect(report.summary.total_leave_requests).toBe(2);
  });
});

describe('Report Service - Attendance Summary Report', () => {
  let dept: any, pos: any;
  let emp1: any, emp2: any;

  beforeEach(async () => {
    dept = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_status: 'active',
    });

    pos = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      department_id: dept.department_id,
      position_status: 'active',
    });

    emp1 = await Employee.create({
      employee_id: 'EMP-001',
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      national_id: '1111111111111',
      address: 'Address 1',
      department_id: dept.department_id,
      position_id: pos.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    emp2 = await Employee.create({
      employee_id: 'EMP-002',
      employee_code: 'EMP002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1991-01-01'),
      gender: 'female',
      national_id: '2222222222222',
      address: 'Address 2',
      department_id: dept.department_id,
      position_id: pos.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    // Create attendance records for emp1
    await Attendance.create({
      attendance_id: 'ATT-001',
      employee_id: emp1._id,
      work_date: '2024-01-01',
      check_in_time: new Date('2024-01-01T01:00:00Z'),
      check_out_time: new Date('2024-01-01T09:00:00Z'),
      work_hours: 8,
      attendance_status: 'present',
    });

    await Attendance.create({
      attendance_id: 'ATT-002',
      employee_id: emp1._id,
      work_date: '2024-01-02',
      check_in_time: new Date('2024-01-02T01:30:00Z'),
      check_out_time: new Date('2024-01-02T09:30:00Z'),
      work_hours: 8,
      attendance_status: 'late',
    });

    await Attendance.create({
      attendance_id: 'ATT-003',
      employee_id: emp1._id,
      work_date: '2024-01-03',
      attendance_status: 'absent',
    });

    await Attendance.create({
      attendance_id: 'ATT-004',
      employee_id: emp1._id,
      work_date: '2024-01-04',
      check_in_time: new Date('2024-01-04T01:00:00Z'),
      check_out_time: new Date('2024-01-04T05:00:00Z'),
      work_hours: 4,
      attendance_status: 'half_day',
    });

    await Attendance.create({
      attendance_id: 'ATT-005',
      employee_id: emp1._id,
      work_date: '2024-01-05',
      check_in_time: new Date('2024-01-05T01:00:00Z'),
      check_out_time: new Date('2024-01-05T09:00:00Z'),
      work_hours: 8,
      attendance_status: 'present',
    });

    // Create attendance records for emp2
    await Attendance.create({
      attendance_id: 'ATT-006',
      employee_id: emp2._id,
      work_date: '2024-01-01',
      check_in_time: new Date('2024-01-01T01:00:00Z'),
      check_out_time: new Date('2024-01-01T09:00:00Z'),
      work_hours: 8,
      attendance_status: 'present',
    });

    await Attendance.create({
      attendance_id: 'ATT-007',
      employee_id: emp2._id,
      work_date: '2024-01-02',
      check_in_time: new Date('2024-01-02T01:00:00Z'),
      check_out_time: new Date('2024-01-02T09:00:00Z'),
      work_hours: 8,
      attendance_status: 'present',
    });

    await Attendance.create({
      attendance_id: 'ATT-008',
      employee_id: emp2._id,
      work_date: '2024-01-03',
      check_in_time: new Date('2024-01-03T01:00:00Z'),
      check_out_time: new Date('2024-01-03T09:00:00Z'),
      work_hours: 8,
      attendance_status: 'present',
    });

    await Attendance.create({
      attendance_id: 'ATT-009',
      employee_id: emp2._id,
      work_date: '2024-01-04',
      attendance_status: 'absent',
    });

    await Attendance.create({
      attendance_id: 'ATT-010',
      employee_id: emp2._id,
      work_date: '2024-01-05',
      check_in_time: new Date('2024-01-05T01:30:00Z'),
      check_out_time: new Date('2024-01-05T09:30:00Z'),
      work_hours: 8,
      attendance_status: 'late',
    });
  });

  test('should calculate attendance statistics by employee correctly', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-05');

    const report = await generateAttendanceSummaryReport(startDate, endDate);

    expect(report.by_employee).toHaveLength(2);

    const emp1Data = report.by_employee.find(e => e.employee_id === emp1.employee_id);
    expect(emp1Data).toBeDefined();
    expect(emp1Data?.employee_code).toBe('EMP001');
    expect(emp1Data?.employee_name).toBe('John Doe');
    expect(emp1Data?.total_days).toBe(5);
    expect(emp1Data?.present_days).toBe(2);
    expect(emp1Data?.late_days).toBe(1);
    expect(emp1Data?.absent_days).toBe(1);
    expect(emp1Data?.half_days).toBe(1);
    expect(emp1Data?.total_work_hours).toBe(28);
  });

  test('should calculate attendance rate correctly', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-05');

    const report = await generateAttendanceSummaryReport(startDate, endDate);

    const emp1Data = report.by_employee.find(e => e.employee_id === emp1.employee_id);
    // Attendance rate = (present + late + half_day * 0.5) / working_days * 100
    // = (2 + 1 + 1 * 0.5) / 5 * 100 = 70%
    expect(emp1Data?.attendance_rate).toBe(70);

    const emp2Data = report.by_employee.find(e => e.employee_id === emp2.employee_id);
    // = (3 + 1 + 0 * 0.5) / 5 * 100 = 80%
    expect(emp2Data?.attendance_rate).toBe(80);
  });

  test('should calculate summary statistics correctly', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-05');

    const report = await generateAttendanceSummaryReport(startDate, endDate);

    expect(report.summary.total_employees).toBe(2);
    expect(report.summary.average_attendance_rate).toBe(75);
    expect(report.summary.total_absences).toBe(2);
    expect(report.summary.total_late_arrivals).toBe(2);
  });

  test('should handle different date ranges correctly', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-03');

    const report = await generateAttendanceSummaryReport(startDate, endDate);

    const emp1Data = report.by_employee.find(e => e.employee_id === emp1.employee_id);
    expect(emp1Data?.total_days).toBe(3);
    expect(emp1Data?.present_days).toBe(1);
    expect(emp1Data?.late_days).toBe(1);
    expect(emp1Data?.absent_days).toBe(1);
  });

  test('should calculate total work hours accurately', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-05');

    const report = await generateAttendanceSummaryReport(startDate, endDate);

    const emp1Data = report.by_employee.find(e => e.employee_id === emp1.employee_id);
    expect(emp1Data?.total_work_hours).toBe(28); // 8 + 8 + 0 + 4 + 8

    const emp2Data = report.by_employee.find(e => e.employee_id === emp2.employee_id);
    expect(emp2Data?.total_work_hours).toBe(32); // 8 + 8 + 8 + 0 + 8
  });
});
