import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
  calculateNetSalary,
  validatePayrollMonth,
  createPayroll,
  updatePayroll,
  approvePayroll,
  generatePayroll,
  getPayrollSummary,
} from '../payrollService';
import Payroll from '@/models/Payroll';
import Employee from '@/models/Employee';
import Department from '@/models/Department';
import Position from '@/models/Position';
import { CreatePayrollRequest, UpdatePayrollRequest } from '@/types/payroll';

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

describe('Payroll Service - Net Salary Calculation', () => {
  test('should calculate net salary with base salary only', () => {
    const netSalary = calculateNetSalary(1000);
    expect(netSalary).toBe(1000);
  });

  test('should calculate net salary with base salary and allowances', () => {
    const netSalary = calculateNetSalary(1000, 200);
    expect(netSalary).toBe(1200);
  });

  test('should calculate net salary with base salary, allowances, and bonuses', () => {
    const netSalary = calculateNetSalary(1000, 200, 300);
    expect(netSalary).toBe(1500);
  });

  test('should calculate net salary with base salary, allowances, bonuses, and overtime', () => {
    const netSalary = calculateNetSalary(1000, 200, 300, 150);
    expect(netSalary).toBe(1650);
  });

  test('should calculate net salary with all components including deductions', () => {
    const netSalary = calculateNetSalary(1000, 200, 300, 150, 250);
    expect(netSalary).toBe(1400);
  });

  test('should handle zero values for optional components', () => {
    const netSalary = calculateNetSalary(1000, 0, 0, 0, 0);
    expect(netSalary).toBe(1000);
  });

  test('should calculate correct net salary when deductions exceed additions', () => {
    const netSalary = calculateNetSalary(1000, 100, 50, 0, 800);
    expect(netSalary).toBe(350);
  });

  test('should handle decimal values correctly', () => {
    const netSalary = calculateNetSalary(1000.50, 200.25, 150.75, 100.50, 250.00);
    expect(netSalary).toBe(1202);
  });
});

describe('Payroll Service - Deductions Calculation', () => {
  test('should correctly subtract single deduction from gross salary', () => {
    const baseSalary = 2000;
    const deductions = 300;
    const netSalary = calculateNetSalary(baseSalary, 0, 0, 0, deductions);
    expect(netSalary).toBe(1700);
  });

  test('should correctly subtract deductions from gross salary with allowances', () => {
    const baseSalary = 2000;
    const allowances = 500;
    const deductions = 400;
    const grossSalary = baseSalary + allowances;
    const netSalary = calculateNetSalary(baseSalary, allowances, 0, 0, deductions);
    
    expect(grossSalary).toBe(2500);
    expect(netSalary).toBe(2100);
  });

  test('should correctly subtract deductions from gross salary with all additions', () => {
    const baseSalary = 2000;
    const allowances = 300;
    const bonuses = 500;
    const overtimePay = 200;
    const deductions = 600;
    
    const grossSalary = baseSalary + allowances + bonuses + overtimePay;
    const netSalary = calculateNetSalary(baseSalary, allowances, bonuses, overtimePay, deductions);
    
    expect(grossSalary).toBe(3000);
    expect(netSalary).toBe(2400);
  });

  test('should handle multiple deduction types correctly', () => {
    // Simulating tax + insurance deductions
    const baseSalary = 3000;
    const taxDeduction = 450; // 15% tax
    const insuranceDeduction = 150; // 5% insurance
    const totalDeductions = taxDeduction + insuranceDeduction;
    
    const netSalary = calculateNetSalary(baseSalary, 0, 0, 0, totalDeductions);
    expect(netSalary).toBe(2400);
  });

  test('should handle zero deductions', () => {
    const baseSalary = 1500;
    const allowances = 200;
    const netSalary = calculateNetSalary(baseSalary, allowances, 0, 0, 0);
    expect(netSalary).toBe(1700);
  });
});

describe('Payroll Service - Gross Salary Calculation', () => {
  test('should calculate gross salary from base salary only', () => {
    const baseSalary = 1000;
    const grossSalary = baseSalary;
    const netSalary = calculateNetSalary(baseSalary, 0, 0, 0, 0);
    expect(netSalary).toBe(grossSalary);
  });

  test('should calculate gross salary with base salary and allowances', () => {
    const baseSalary = 1500;
    const allowances = 300;
    const expectedGross = baseSalary + allowances;
    const netSalary = calculateNetSalary(baseSalary, allowances, 0, 0, 0);
    expect(netSalary).toBe(expectedGross);
  });

  test('should calculate gross salary with base salary, allowances, and bonuses', () => {
    const baseSalary = 2000;
    const allowances = 400;
    const bonuses = 600;
    const expectedGross = baseSalary + allowances + bonuses;
    const netSalary = calculateNetSalary(baseSalary, allowances, bonuses, 0, 0);
    expect(netSalary).toBe(expectedGross);
  });

  test('should calculate gross salary with all earning components', () => {
    const baseSalary = 2500;
    const allowances = 500;
    const bonuses = 750;
    const overtimePay = 250;
    const expectedGross = baseSalary + allowances + bonuses + overtimePay;
    const netSalary = calculateNetSalary(baseSalary, allowances, bonuses, overtimePay, 0);
    expect(netSalary).toBe(expectedGross);
    expect(netSalary).toBe(4000);
  });

  test('should handle performance bonus correctly', () => {
    const baseSalary = 3000;
    const performanceBonus = 1000;
    const netSalary = calculateNetSalary(baseSalary, 0, performanceBonus, 0, 0);
    expect(netSalary).toBe(4000);
  });

  test('should handle overtime pay correctly', () => {
    const baseSalary = 1800;
    const overtimePay = 300;
    const netSalary = calculateNetSalary(baseSalary, 0, 0, overtimePay, 0);
    expect(netSalary).toBe(2100);
  });
});

describe('Payroll Service - Integration Tests', () => {
  let testEmployee: any;
  let testDepartment: any;
  let testPosition: any;

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
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 2000,
    });
  });

  test('should create payroll with correct net salary calculation', async () => {
    const payrollData: CreatePayrollRequest = {
      employee_id: testEmployee._id.toString(),
      payroll_month: '2024-06',
      base_salary: 2000,
      allowances: 300,
      bonuses: 500,
      overtime_pay: 200,
      deductions: 400,
    };

    const payroll = await createPayroll(payrollData);

    expect(payroll).toBeDefined();
    expect(payroll.base_salary).toBe(2000);
    expect(payroll.allowances).toBe(300);
    expect(payroll.bonuses).toBe(500);
    expect(payroll.overtime_pay).toBe(200);
    expect(payroll.deductions).toBe(400);
    expect(payroll.net_salary).toBe(2600); // 2000 + 300 + 500 + 200 - 400
  });

  test('should update payroll and recalculate net salary', async () => {
    // Create initial payroll
    const payrollData: CreatePayrollRequest = {
      employee_id: testEmployee._id.toString(),
      payroll_month: '2024-07',
      base_salary: 2000,
      allowances: 200,
      bonuses: 0,
      overtime_pay: 0,
      deductions: 300,
    };

    const payroll = await createPayroll(payrollData);
    expect(payroll.net_salary).toBe(1900); // 2000 + 200 - 300

    // Update payroll
    const updateData: UpdatePayrollRequest = {
      bonuses: 500,
      overtime_pay: 150,
    };

    const updated = await updatePayroll(payroll.payroll_id, updateData);
    expect(updated.bonuses).toBe(500);
    expect(updated.overtime_pay).toBe(150);
    expect(updated.net_salary).toBe(2550); // 2000 + 200 + 500 + 150 - 300
  });

  test('should validate payroll month format', () => {
    expect(validatePayrollMonth('2024-01')).toBe(true);
    expect(validatePayrollMonth('2024-12')).toBe(true);
    expect(validatePayrollMonth('2024-06')).toBe(true);
    
    expect(validatePayrollMonth('2024-13')).toBe(false); // Invalid month
    expect(validatePayrollMonth('2024-00')).toBe(false); // Invalid month
    expect(validatePayrollMonth('24-06')).toBe(false); // Invalid year format
    expect(validatePayrollMonth('2024/06')).toBe(false); // Wrong separator
    expect(validatePayrollMonth('202406')).toBe(false); // Missing separator
  });

  test('should generate payroll summary with correct totals', async () => {
    // Create multiple payroll records
    const employee2 = await Employee.create({
      employee_id: 'EMP-002',
      employee_code: 'EMP002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1992-01-01'),
      gender: 'female',
      national_id: '9876543210987',
      address: '456 Second St',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1800,
    });

    await createPayroll({
      employee_id: testEmployee._id.toString(),
      payroll_month: '2024-08',
      base_salary: 2000,
      allowances: 300,
      bonuses: 500,
      overtime_pay: 200,
      deductions: 400,
    });

    await createPayroll({
      employee_id: employee2._id.toString(),
      payroll_month: '2024-08',
      base_salary: 1800,
      allowances: 250,
      bonuses: 300,
      overtime_pay: 150,
      deductions: 350,
    });

    const summary = await getPayrollSummary('2024-08');

    expect(summary.total_employees).toBe(2);
    expect(summary.total_base_salary).toBe(3800); // 2000 + 1800
    expect(summary.total_allowances).toBe(550); // 300 + 250
    expect(summary.total_bonuses).toBe(800); // 500 + 300
    expect(summary.total_overtime_pay).toBe(350); // 200 + 150
    expect(summary.total_deductions).toBe(750); // 400 + 350
    expect(summary.total_net_salary).toBe(4750); // 2600 + 2150
  });
});
