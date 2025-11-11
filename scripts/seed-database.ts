/**
 * Database Seeding Script
 * Seeds initial data for HRMIS system including:
 * - Admin user account
 * - Sample departments (with Khmer names)
 * - Sample positions (with Khmer names)
 * - Sample employees (with Khmer names)
 * - Leave types (with Khmer names)
 * - Initial leave balances
 */

import mongoose from 'mongoose';
import { hashPassword } from '../src/lib/security/password';
import User from '../src/models/User';
import Employee from '../src/models/Employee';
import Department from '../src/models/Department';
import Position from '../src/models/Position';
import LeaveType from '../src/models/LeaveType';
import LeaveBalance from '../src/models/LeaveBalance';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://chhinhs_db_user:29kFylpMI5pQ08iV@pedhrmis.9s3kean.mongodb.net/?appName=PEDHRMIS';
const MONGODB_DB = process.env.MONGODB_DB || 'sangapac_hrmis';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearCollections() {
  console.log('\n🗑️  Clearing existing data...');
  
  await User.deleteMany({});
  await Employee.deleteMany({});
  await Department.deleteMany({});
  await Position.deleteMany({});
  await LeaveType.deleteMany({});
  await LeaveBalance.deleteMany({});
  
  console.log('✅ Collections cleared');
}

async function seedDepartments() {
  console.log('\n📁 Seeding departments...');
  
  const departments = [
    {
      department_id: 'DEPT001',
      department_code: 'HR',
      department_name: 'Human Resources',
      department_name_khmer: 'ធនធានមនុស្ស',
      department_status: 'active',
    },
    {
      department_id: 'DEPT002',
      department_code: 'IT',
      department_name: 'Information Technology',
      department_name_khmer: 'បច្ចេកវិទ្យាព័ត៌មាន',
      department_status: 'active',
    },
    {
      department_id: 'DEPT003',
      department_code: 'FIN',
      department_name: 'Finance',
      department_name_khmer: 'ហិរញ្ញវត្ថុ',
      department_status: 'active',
    },
    {
      department_id: 'DEPT004',
      department_code: 'OPS',
      department_name: 'Operations',
      department_name_khmer: 'ប្រតិបត្តិការ',
      department_status: 'active',
    },
    {
      department_id: 'DEPT005',
      department_code: 'SALES',
      department_name: 'Sales & Marketing',
      department_name_khmer: 'លក់និងទីផ្សារ',
      department_status: 'active',
    },
  ];
  
  await Department.insertMany(departments);
  console.log(`✅ Seeded ${departments.length} departments`);
  
  return departments;
}

async function seedPositions(departments: any[]) {
  console.log('\n💼 Seeding positions...');
  
  const positions = [
    // HR Department
    {
      position_id: 'POS001',
      position_code: 'HR-DIR',
      position_name: 'HR Director',
      position_name_khmer: 'នាយកធនធានមនុស្ស',
      department_id: 'DEPT001',
      position_level: 1,
      position_status: 'active',
    },
    {
      position_id: 'POS002',
      position_code: 'HR-MGR',
      position_name: 'HR Manager',
      position_name_khmer: 'អ្នកគ្រប់គ្រងធនធានមនុស្ស',
      department_id: 'DEPT001',
      position_level: 2,
      position_status: 'active',
    },
    {
      position_id: 'POS003',
      position_code: 'HR-SPEC',
      position_name: 'HR Specialist',
      position_name_khmer: 'អ្នកឯកទេសធនធានមនុស្ស',
      department_id: 'DEPT001',
      position_level: 3,
      position_status: 'active',
    },
    // IT Department
    {
      position_id: 'POS004',
      position_code: 'IT-DIR',
      position_name: 'IT Director',
      position_name_khmer: 'នាយកបច្ចេកវិទ្យាព័ត៌មាន',
      department_id: 'DEPT002',
      position_level: 1,
      position_status: 'active',
    },
    {
      position_id: 'POS005',
      position_code: 'DEV-LEAD',
      position_name: 'Development Lead',
      position_name_khmer: 'ប្រធានក្រុមអភិវឌ្ឍន៍',
      department_id: 'DEPT002',
      position_level: 2,
      position_status: 'active',
    },
    {
      position_id: 'POS006',
      position_code: 'SR-DEV',
      position_name: 'Senior Developer',
      position_name_khmer: 'អ្នកអភិវឌ្ឍន៍ជាន់ខ្ពស់',
      department_id: 'DEPT002',
      position_level: 3,
      position_status: 'active',
    },
    {
      position_id: 'POS007',
      position_code: 'JR-DEV',
      position_name: 'Junior Developer',
      position_name_khmer: 'អ្នកអភិវឌ្ឍន៍កម្រិតដំបូង',
      department_id: 'DEPT002',
      position_level: 4,
      position_status: 'active',
    },
    // Finance Department
    {
      position_id: 'POS008',
      position_code: 'FIN-DIR',
      position_name: 'Finance Director',
      position_name_khmer: 'នាយកហិរញ្ញវត្ថុ',
      department_id: 'DEPT003',
      position_level: 1,
      position_status: 'active',
    },
    {
      position_id: 'POS009',
      position_code: 'ACC-MGR',
      position_name: 'Accounting Manager',
      position_name_khmer: 'អ្នកគ្រប់គ្រងគណនេយ្យ',
      department_id: 'DEPT003',
      position_level: 2,
      position_status: 'active',
    },
    {
      position_id: 'POS010',
      position_code: 'ACCOUNTANT',
      position_name: 'Accountant',
      position_name_khmer: 'គណនេយ្យករ',
      department_id: 'DEPT003',
      position_level: 3,
      position_status: 'active',
    },
    // Operations Department
    {
      position_id: 'POS011',
      position_code: 'OPS-MGR',
      position_name: 'Operations Manager',
      position_name_khmer: 'អ្នកគ្រប់គ្រងប្រតិបត្តិការ',
      department_id: 'DEPT004',
      position_level: 2,
      position_status: 'active',
    },
    {
      position_id: 'POS012',
      position_code: 'OPS-COORD',
      position_name: 'Operations Coordinator',
      position_name_khmer: 'អ្នកសម្របសម្រួលប្រតិបត្តិការ',
      department_id: 'DEPT004',
      position_level: 3,
      position_status: 'active',
    },
    // Sales & Marketing Department
    {
      position_id: 'POS013',
      position_code: 'SALES-MGR',
      position_name: 'Sales Manager',
      position_name_khmer: 'អ្នកគ្រប់គ្រងលក់',
      department_id: 'DEPT005',
      position_level: 2,
      position_status: 'active',
    },
    {
      position_id: 'POS014',
      position_code: 'SALES-REP',
      position_name: 'Sales Representative',
      position_name_khmer: 'តំណាងលក់',
      department_id: 'DEPT005',
      position_level: 3,
      position_status: 'active',
    },
  ];
  
  await Position.insertMany(positions);
  console.log(`✅ Seeded ${positions.length} positions`);
  
  return positions;
}

async function seedEmployees() {
  console.log('\n👥 Seeding employees...');
  
  const employees = [
    // Admin User
    {
      employee_id: 'EMP001',
      employee_code: 'ADM001',
      first_name: 'Admin',
      last_name: 'User',
      first_name_khmer: 'អ្នកគ្រប់គ្រង',
      last_name_khmer: 'ប្រព័ន្ធ',
      email: 'admin@sangapac.com',
      phone_number: '+855 12 345 678',
      date_of_birth: new Date('1985-01-15'),
      gender: 'male',
      national_id: '001234567',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT001',
      position_id: 'POS001',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2020-01-01'),
      salary_amount: 2000,
    },
    // HR Manager
    {
      employee_id: 'EMP002',
      employee_code: 'HR001',
      first_name: 'Sokha',
      last_name: 'Chan',
      first_name_khmer: 'សុខា',
      last_name_khmer: 'ចាន់',
      email: 'sokha.chan@sangapac.com',
      phone_number: '+855 12 456 789',
      date_of_birth: new Date('1988-03-20'),
      gender: 'female',
      national_id: '001234568',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT001',
      position_id: 'POS002',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2020-06-15'),
      salary_amount: 1500,
    },
    // HR Specialist
    {
      employee_id: 'EMP003',
      employee_code: 'HR002',
      first_name: 'Dara',
      last_name: 'Pov',
      first_name_khmer: 'ដារ៉ា',
      last_name_khmer: 'ពៅ',
      email: 'dara.pov@sangapac.com',
      phone_number: '+855 12 567 890',
      date_of_birth: new Date('1992-07-10'),
      gender: 'male',
      national_id: '001234569',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT001',
      position_id: 'POS003',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2021-03-01'),
      salary_amount: 1000,
    },
    // IT Director
    {
      employee_id: 'EMP004',
      employee_code: 'IT001',
      first_name: 'Virak',
      last_name: 'Seng',
      first_name_khmer: 'វីរៈ',
      last_name_khmer: 'សេង',
      email: 'virak.seng@sangapac.com',
      phone_number: '+855 12 678 901',
      date_of_birth: new Date('1986-11-25'),
      gender: 'male',
      national_id: '001234570',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT002',
      position_id: 'POS004',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2020-02-01'),
      salary_amount: 2200,
    },
    // Development Lead
    {
      employee_id: 'EMP005',
      employee_code: 'IT002',
      first_name: 'Sreymom',
      last_name: 'Keo',
      first_name_khmer: 'ស្រីមុំ',
      last_name_khmer: 'កែវ',
      email: 'sreymom.keo@sangapac.com',
      phone_number: '+855 12 789 012',
      date_of_birth: new Date('1990-05-18'),
      gender: 'female',
      national_id: '001234571',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT002',
      position_id: 'POS005',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2020-08-15'),
      salary_amount: 1800,
    },
    // Senior Developer
    {
      employee_id: 'EMP006',
      employee_code: 'IT003',
      first_name: 'Bopha',
      last_name: 'Lim',
      first_name_khmer: 'បុប្ផា',
      last_name_khmer: 'លឹម',
      email: 'bopha.lim@sangapac.com',
      phone_number: '+855 12 890 123',
      date_of_birth: new Date('1991-09-30'),
      gender: 'female',
      national_id: '001234572',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT002',
      position_id: 'POS006',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2021-01-10'),
      salary_amount: 1400,
    },
    // Junior Developer
    {
      employee_id: 'EMP007',
      employee_code: 'IT004',
      first_name: 'Ratanak',
      last_name: 'Heng',
      first_name_khmer: 'រតនៈ',
      last_name_khmer: 'ហេង',
      email: 'ratanak.heng@sangapac.com',
      phone_number: '+855 12 901 234',
      date_of_birth: new Date('1995-12-05'),
      gender: 'male',
      national_id: '001234573',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT002',
      position_id: 'POS007',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2022-06-01'),
      salary_amount: 800,
    },
    // Finance Director
    {
      employee_id: 'EMP008',
      employee_code: 'FIN001',
      first_name: 'Sophea',
      last_name: 'Mao',
      first_name_khmer: 'សុភា',
      last_name_khmer: 'ម៉ៅ',
      email: 'sophea.mao@sangapac.com',
      phone_number: '+855 12 012 345',
      date_of_birth: new Date('1984-04-12'),
      gender: 'female',
      national_id: '001234574',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT003',
      position_id: 'POS008',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2020-03-01'),
      salary_amount: 2100,
    },
    // Accounting Manager
    {
      employee_id: 'EMP009',
      employee_code: 'FIN002',
      first_name: 'Piseth',
      last_name: 'Tan',
      first_name_khmer: 'ពិសិដ្ឋ',
      last_name_khmer: 'តាន់',
      email: 'piseth.tan@sangapac.com',
      phone_number: '+855 12 123 456',
      date_of_birth: new Date('1989-08-22'),
      gender: 'male',
      national_id: '001234575',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT003',
      position_id: 'POS009',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2020-09-01'),
      salary_amount: 1600,
    },
    // Accountant
    {
      employee_id: 'EMP010',
      employee_code: 'FIN003',
      first_name: 'Chenda',
      last_name: 'Sok',
      first_name_khmer: 'ចេន្ដា',
      last_name_khmer: 'សុខ',
      email: 'chenda.sok@sangapac.com',
      phone_number: '+855 12 234 567',
      date_of_birth: new Date('1993-02-14'),
      gender: 'female',
      national_id: '001234576',
      address: 'Phnom Penh, Cambodia',
      department_id: 'DEPT003',
      position_id: 'POS010',
      employee_type: 'full_time',
      employee_status: 'active',
      hire_date: new Date('2021-07-15'),
      salary_amount: 1100,
    },
  ];
  
  await Employee.insertMany(employees);
  console.log(`✅ Seeded ${employees.length} employees`);
  
  return employees;
}

async function seedUsers(employees: any[]) {
  console.log('\n🔐 Seeding users...');
  
  // Default password for all users: Admin@123
  const defaultPassword = 'Admin@123';
  const hashedPassword = await hashPassword(defaultPassword);
  
  const users = [
    {
      user_id: 'USR001',
      employee_id: 'EMP001',
      username: 'admin',
      password_hash: hashedPassword,
      user_role: 'admin',
      user_status: 'active',
    },
    {
      user_id: 'USR002',
      employee_id: 'EMP002',
      username: 'sokha.chan',
      password_hash: hashedPassword,
      user_role: 'hr_manager',
      user_status: 'active',
    },
    {
      user_id: 'USR003',
      employee_id: 'EMP003',
      username: 'dara.pov',
      password_hash: hashedPassword,
      user_role: 'employee',
      user_status: 'active',
    },
    {
      user_id: 'USR004',
      employee_id: 'EMP004',
      username: 'virak.seng',
      password_hash: hashedPassword,
      user_role: 'manager',
      user_status: 'active',
    },
    {
      user_id: 'USR005',
      employee_id: 'EMP005',
      username: 'sreymom.keo',
      password_hash: hashedPassword,
      user_role: 'manager',
      user_status: 'active',
    },
    {
      user_id: 'USR006',
      employee_id: 'EMP006',
      username: 'bopha.lim',
      password_hash: hashedPassword,
      user_role: 'employee',
      user_status: 'active',
    },
    {
      user_id: 'USR007',
      employee_id: 'EMP007',
      username: 'ratanak.heng',
      password_hash: hashedPassword,
      user_role: 'employee',
      user_status: 'active',
    },
    {
      user_id: 'USR008',
      employee_id: 'EMP008',
      username: 'sophea.mao',
      password_hash: hashedPassword,
      user_role: 'manager',
      user_status: 'active',
    },
    {
      user_id: 'USR009',
      employee_id: 'EMP009',
      username: 'piseth.tan',
      password_hash: hashedPassword,
      user_role: 'manager',
      user_status: 'active',
    },
    {
      user_id: 'USR010',
      employee_id: 'EMP010',
      username: 'chenda.sok',
      password_hash: hashedPassword,
      user_role: 'employee',
      user_status: 'active',
    },
  ];
  
  await User.insertMany(users);
  console.log(`✅ Seeded ${users.length} users`);
  console.log(`ℹ️  Default password for all users: ${defaultPassword}`);
  
  return users;
}

async function seedLeaveTypes() {
  console.log('\n🏖️  Seeding leave types...');
  
  const leaveTypes = [
    {
      leave_type_id: 'LT001',
      leave_type_name: 'Annual Leave',
      leave_type_name_khmer: 'ច្បាប់ប្រចាំឆ្នាំ',
      annual_quota: 18,
      is_paid: true,
      leave_type_status: 'active',
    },
    {
      leave_type_id: 'LT002',
      leave_type_name: 'Sick Leave',
      leave_type_name_khmer: 'ច្បាប់ឈឺ',
      annual_quota: 15,
      is_paid: true,
      leave_type_status: 'active',
    },
    {
      leave_type_id: 'LT003',
      leave_type_name: 'Personal Leave',
      leave_type_name_khmer: 'ច្បាប់ផ្ទាល់ខ្លួន',
      annual_quota: 7,
      is_paid: true,
      leave_type_status: 'active',
    },
    {
      leave_type_id: 'LT004',
      leave_type_name: 'Maternity Leave',
      leave_type_name_khmer: 'ច្បាប់សម្រាល',
      annual_quota: 90,
      is_paid: true,
      leave_type_status: 'active',
    },
    {
      leave_type_id: 'LT005',
      leave_type_name: 'Paternity Leave',
      leave_type_name_khmer: 'ច្បាប់បិតា',
      annual_quota: 7,
      is_paid: true,
      leave_type_status: 'active',
    },
    {
      leave_type_id: 'LT006',
      leave_type_name: 'Unpaid Leave',
      leave_type_name_khmer: 'ច្បាប់គ្មានប្រាក់ខែ',
      annual_quota: 30,
      is_paid: false,
      leave_type_status: 'active',
    },
    {
      leave_type_id: 'LT007',
      leave_type_name: 'Compassionate Leave',
      leave_type_name_khmer: 'ច្បាប់កង្វល់',
      annual_quota: 5,
      is_paid: true,
      leave_type_status: 'active',
    },
  ];
  
  await LeaveType.insertMany(leaveTypes);
  console.log(`✅ Seeded ${leaveTypes.length} leave types`);
  
  return leaveTypes;
}

async function seedLeaveBalances(employees: any[], leaveTypes: any[]) {
  console.log('\n💰 Seeding leave balances...');
  
  const currentYear = new Date().getFullYear();
  const leaveBalances = [];
  
  // Create leave balances for each employee for each leave type
  for (const employee of employees) {
    for (const leaveType of leaveTypes) {
      leaveBalances.push({
        leave_balance_id: `LB${employee.employee_id.substring(3)}_${leaveType.leave_type_id.substring(2)}_${currentYear}`,
        employee_id: employee.employee_id,
        leave_type_id: leaveType.leave_type_id,
        year: currentYear,
        total_allocated: leaveType.annual_quota,
        used_days: 0,
        remaining_days: leaveType.annual_quota,
      });
    }
  }
  
  await LeaveBalance.insertMany(leaveBalances);
  console.log(`✅ Seeded ${leaveBalances.length} leave balances`);
  
  return leaveBalances;
}

async function updateDepartmentManagers() {
  console.log('\n👔 Updating department managers...');
  
  // Assign department heads
  await Department.updateOne(
    { department_id: 'DEPT001' },
    { manager_id: 'EMP001' }
  );
  
  await Department.updateOne(
    { department_id: 'DEPT002' },
    { manager_id: 'EMP004' }
  );
  
  await Department.updateOne(
    { department_id: 'DEPT003' },
    { manager_id: 'EMP008' }
  );
  
  console.log('✅ Department managers updated');
}

async function main() {
  console.log('🌱 Starting database seeding...\n');
  console.log('Database:', MONGODB_DB);
  
  await connectDB();
  
  // Clear existing data
  await clearCollections();
  
  // Seed data in order
  const departments = await seedDepartments();
  const positions = await seedPositions(departments);
  const employees = await seedEmployees();
  const users = await seedUsers(employees);
  const leaveTypes = await seedLeaveTypes();
  const leaveBalances = await seedLeaveBalances(employees, leaveTypes);
  
  // Update relationships
  await updateDepartmentManagers();
  
  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Departments: ${departments.length}`);
  console.log(`   - Positions: ${positions.length}`);
  console.log(`   - Employees: ${employees.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Leave Types: ${leaveTypes.length}`);
  console.log(`   - Leave Balances: ${leaveBalances.length}`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Username: admin');
  console.log('   Password: Admin@123');
  console.log('\n   All users have the same default password: Admin@123');
  
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
}

// Run the seeding script
main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
