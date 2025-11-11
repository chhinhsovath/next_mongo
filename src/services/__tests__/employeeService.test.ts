import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
  createEmployee,
  updateEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee,
} from '../employeeService';
import Employee from '@/models/Employee';
import Department from '@/models/Department';
import Position from '@/models/Position';
import { CreateEmployeeInput, UpdateEmployeeInput } from '@/types/employee';

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
});

describe('Employee Service - Creation Validation', () => {
  let testDepartment: any;
  let testPosition: any;

  beforeEach(async () => {
    // Create test department and position
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
  });

  test('should create employee with valid data', async () => {
    const employeeData: CreateEmployeeInput = {
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      national_id: '1234567890123',
      address: '123 Main St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    };

    const employee = await createEmployee(employeeData);

    expect(employee).toBeDefined();
    expect(employee.employee_id).toMatch(/^EMP-/);
    expect(employee.first_name).toBe('John');
    expect(employee.last_name).toBe('Doe');
    expect(employee.email).toBe('john.doe@example.com');
    expect(employee.employee_status).toBe('active');
  });

  test('should reject employee with invalid department_id', async () => {
    const employeeData: CreateEmployeeInput = {
      employee_code: 'EMP002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1992-05-15'),
      gender: 'female',
      national_id: '9876543210987',
      address: '456 Second St, Phnom Penh',
      department_id: 'INVALID-DEPT',
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1200,
    };

    await expect(createEmployee(employeeData)).rejects.toThrow('Invalid department_id');
  });

  test('should reject employee with invalid position_id', async () => {
    const employeeData: CreateEmployeeInput = {
      employee_code: 'EMP003',
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob.johnson@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1988-03-20'),
      gender: 'male',
      national_id: '5555555555555',
      address: '789 Third St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: 'INVALID-POS',
      employee_type: 'contract',
      hire_date: new Date('2024-01-01'),
      salary_amount: 900,
    };

    await expect(createEmployee(employeeData)).rejects.toThrow('Invalid position_id');
  });

  test('should reject duplicate employee_code', async () => {
    const employeeData: CreateEmployeeInput = {
      employee_code: 'EMP004',
      first_name: 'Alice',
      last_name: 'Williams',
      email: 'alice.williams@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1995-07-10'),
      gender: 'female',
      national_id: '1111111111111',
      address: '321 Fourth St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1100,
    };

    await createEmployee(employeeData);

    const duplicateData = { ...employeeData, email: 'different@example.com', national_id: '2222222222222' };
    await expect(createEmployee(duplicateData)).rejects.toThrow('Employee code already exists');
  });

  test('should reject duplicate email', async () => {
    const employeeData: CreateEmployeeInput = {
      employee_code: 'EMP005',
      first_name: 'Charlie',
      last_name: 'Brown',
      email: 'charlie.brown@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1991-11-25'),
      gender: 'male',
      national_id: '3333333333333',
      address: '654 Fifth St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'part_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 800,
    };

    await createEmployee(employeeData);

    const duplicateData = { ...employeeData, employee_code: 'EMP006', national_id: '4444444444444' };
    await expect(createEmployee(duplicateData)).rejects.toThrow('Email already exists');
  });

  test('should reject duplicate national_id', async () => {
    const employeeData: CreateEmployeeInput = {
      employee_code: 'EMP007',
      first_name: 'David',
      last_name: 'Miller',
      email: 'david.miller@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1993-09-05'),
      gender: 'male',
      national_id: '6666666666666',
      address: '987 Sixth St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'intern',
      hire_date: new Date('2024-01-01'),
      salary_amount: 500,
    };

    await createEmployee(employeeData);

    const duplicateData = { ...employeeData, employee_code: 'EMP008', email: 'different2@example.com' };
    await expect(createEmployee(duplicateData)).rejects.toThrow('National ID already exists');
  });
});

describe('Employee Service - Update Logic', () => {
  let testDepartment: any;
  let testPosition: any;
  let testEmployee: any;

  beforeEach(async () => {
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

    const employeeData: CreateEmployeeInput = {
      employee_code: 'EMP100',
      first_name: 'Test',
      last_name: 'User',
      email: 'test.user@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      national_id: '9999999999999',
      address: '100 Test St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    };

    testEmployee = await createEmployee(employeeData);
  });

  test('should update employee with valid data', async () => {
    const updateData: UpdateEmployeeInput = {
      first_name: 'Updated',
      last_name: 'Name',
      salary_amount: 1500,
    };

    const updated = await updateEmployee(testEmployee.employee_id, updateData);

    expect(updated.first_name).toBe('Updated');
    expect(updated.last_name).toBe('Name');
    expect(updated.salary_amount).toBe(1500);
    expect(updated.email).toBe(testEmployee.email); // Unchanged fields remain
  });

  test('should reject update with invalid department_id', async () => {
    const updateData: UpdateEmployeeInput = {
      department_id: 'INVALID-DEPT',
    };

    await expect(updateEmployee(testEmployee.employee_id, updateData)).rejects.toThrow('Invalid department_id');
  });

  test('should reject update with invalid position_id', async () => {
    const updateData: UpdateEmployeeInput = {
      position_id: 'INVALID-POS',
    };

    await expect(updateEmployee(testEmployee.employee_id, updateData)).rejects.toThrow('Invalid position_id');
  });

  test('should reject update with duplicate employee_code', async () => {
    // Create another employee
    const anotherEmployee = await createEmployee({
      employee_code: 'EMP101',
      first_name: 'Another',
      last_name: 'Employee',
      email: 'another@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1991-01-01'),
      gender: 'female',
      national_id: '8888888888888',
      address: '200 Test St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    const updateData: UpdateEmployeeInput = {
      employee_code: anotherEmployee.employee_code,
    };

    await expect(updateEmployee(testEmployee.employee_id, updateData)).rejects.toThrow('Employee code already exists');
  });

  test('should reject update with duplicate email', async () => {
    const anotherEmployee = await createEmployee({
      employee_code: 'EMP102',
      first_name: 'Third',
      last_name: 'Employee',
      email: 'third@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1992-01-01'),
      gender: 'male',
      national_id: '7777777777777',
      address: '300 Test St, Phnom Penh',
      department_id: testDepartment.department_id,
      position_id: testPosition.position_id,
      employee_type: 'full_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    const updateData: UpdateEmployeeInput = {
      email: anotherEmployee.email,
    };

    await expect(updateEmployee(testEmployee.employee_id, updateData)).rejects.toThrow('Email already exists');
  });

  test('should allow updating to same employee_code', async () => {
    const updateData: UpdateEmployeeInput = {
      employee_code: testEmployee.employee_code,
      first_name: 'SameName',
    };

    const updated = await updateEmployee(testEmployee.employee_id, updateData);
    expect(updated.first_name).toBe('SameName');
    expect(updated.employee_code).toBe(testEmployee.employee_code);
  });

  test('should throw error when updating non-existent employee', async () => {
    await expect(updateEmployee('NON-EXISTENT-ID', { first_name: 'Test' })).rejects.toThrow('Employee not found');
  });
});

describe('Employee Service - Search and Filter', () => {
  let testDepartment1: any;
  let testDepartment2: any;
  let testPosition1: any;
  let testPosition2: any;

  beforeEach(async () => {
    testDepartment1 = await Department.create({
      department_id: 'DEPT-001',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_status: 'active',
    });

    testDepartment2 = await Department.create({
      department_id: 'DEPT-002',
      department_code: 'HR',
      department_name: 'Human Resources',
      department_status: 'active',
    });

    testPosition1 = await Position.create({
      position_id: 'POS-001',
      position_code: 'DEV',
      position_name: 'Developer',
      department_id: testDepartment1.department_id,
      position_status: 'active',
    });

    testPosition2 = await Position.create({
      position_id: 'POS-002',
      position_code: 'MGR',
      position_name: 'Manager',
      department_id: testDepartment2.department_id,
      position_status: 'active',
    });

    // Create multiple employees
    await createEmployee({
      employee_code: 'EMP201',
      first_name: 'Alice',
      last_name: 'Anderson',
      email: 'alice.anderson@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1990-01-01'),
      gender: 'female',
      national_id: '1111111111111',
      address: '100 Test St',
      department_id: testDepartment1.department_id,
      position_id: testPosition1.position_id,
      employee_type: 'full_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 1000,
    });

    await createEmployee({
      employee_code: 'EMP202',
      first_name: 'Bob',
      last_name: 'Brown',
      email: 'bob.brown@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1991-01-01'),
      gender: 'male',
      national_id: '2222222222222',
      address: '200 Test St',
      department_id: testDepartment2.department_id,
      position_id: testPosition2.position_id,
      employee_type: 'part_time',
      hire_date: new Date('2024-01-01'),
      salary_amount: 800,
    });

    await createEmployee({
      employee_code: 'EMP203',
      first_name: 'Charlie',
      last_name: 'Chen',
      email: 'charlie.chen@example.com',
      phone_number: '+855123456789',
      date_of_birth: new Date('1992-01-01'),
      gender: 'male',
      national_id: '3333333333333',
      address: '300 Test St',
      department_id: testDepartment1.department_id,
      position_id: testPosition1.position_id,
      employee_type: 'contract',
      hire_date: new Date('2024-01-01'),
      salary_amount: 900,
    });
  });

  test('should return all employees without filters', async () => {
    const result = await getEmployees();

    expect(result.employees).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
  });

  test('should filter employees by department_id', async () => {
    const result = await getEmployees({ department_id: testDepartment1.department_id });

    expect(result.employees).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.employees.every((e: any) => e.department_id === testDepartment1.department_id)).toBe(true);
  });

  test('should filter employees by position_id', async () => {
    const result = await getEmployees({ position_id: testPosition2.position_id });

    expect(result.employees).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.employees[0].position_id).toBe(testPosition2.position_id);
  });

  test('should filter employees by employee_type', async () => {
    const result = await getEmployees({ employee_type: 'full_time' });

    expect(result.employees).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.employees[0].employee_type).toBe('full_time');
  });

  test('should search employees by first name', async () => {
    const result = await getEmployees({ search: 'Alice' });

    expect(result.employees).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.employees[0].first_name).toBe('Alice');
  });

  test('should search employees by last name', async () => {
    const result = await getEmployees({ search: 'Brown' });

    expect(result.employees).toHaveLength(1);
    expect(result.employees[0].last_name).toBe('Brown');
  });

  test('should search employees by employee_code', async () => {
    const result = await getEmployees({ search: 'EMP202' });

    expect(result.employees).toHaveLength(1);
    expect(result.employees[0].employee_code).toBe('EMP202');
  });

  test('should search employees by email', async () => {
    const result = await getEmployees({ search: 'charlie.chen' });

    expect(result.employees).toHaveLength(1);
    expect(result.employees[0].email).toContain('charlie.chen');
  });

  test('should handle pagination correctly', async () => {
    const page1 = await getEmployees({}, { page: 1, limit: 2 });
    expect(page1.employees).toHaveLength(2);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(2);
    expect(page1.total_pages).toBe(2);

    const page2 = await getEmployees({}, { page: 2, limit: 2 });
    expect(page2.employees).toHaveLength(1);
    expect(page2.page).toBe(2);
  });

  test('should exclude soft-deleted employees', async () => {
    const employee = await getEmployees({ search: 'Alice' });
    await deleteEmployee(employee.employees[0].employee_id);

    const result = await getEmployees();
    expect(result.total).toBe(2);
    expect(result.employees.every((e: any) => e.first_name !== 'Alice')).toBe(true);
  });

  test('should get employee by ID', async () => {
    const allEmployees = await getEmployees();
    const employeeId = allEmployees.employees[0].employee_id;

    const employee = await getEmployeeById(employeeId);
    expect(employee).toBeDefined();
    expect(employee.employee_id).toBe(employeeId);
  });

  test('should throw error when getting non-existent employee', async () => {
    await expect(getEmployeeById('NON-EXISTENT-ID')).rejects.toThrow('Employee not found');
  });
});
