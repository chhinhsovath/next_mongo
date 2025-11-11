# Seeded Data Quick Reference

This document provides a quick reference for all data seeded by the `npm run seed` command.

## Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `Admin@123`
- **Role**: Admin (full system access)
- **Employee**: Admin User (EMP001)

### HR Manager
- **Username**: `sokha.chan`
- **Password**: `Admin@123`
- **Role**: HR Manager
- **Employee**: Sokha Chan (EMP002)

### Department Managers
- **Username**: `virak.seng` (IT Director)
  - Password: `Admin@123`
  - Role: Manager
  - Employee: Virak Seng (EMP004)

- **Username**: `sreymom.keo` (Development Lead)
  - Password: `Admin@123`
  - Role: Manager
  - Employee: Sreymom Keo (EMP005)

- **Username**: `sophea.mao` (Finance Director)
  - Password: `Admin@123`
  - Role: Manager
  - Employee: Sophea Mao (EMP008)

- **Username**: `piseth.tan` (Accounting Manager)
  - Password: `Admin@123`
  - Role: Manager
  - Employee: Piseth Tan (EMP009)

### Regular Employees
- **Username**: `dara.pov` (HR Specialist)
  - Password: `Admin@123`
  - Role: Employee
  - Employee: Dara Pov (EMP003)

- **Username**: `bopha.lim` (Senior Developer)
  - Password: `Admin@123`
  - Role: Employee
  - Employee: Bopha Lim (EMP006)

- **Username**: `ratanak.heng` (Junior Developer)
  - Password: `Admin@123`
  - Role: Employee
  - Employee: Ratanak Heng (EMP007)

- **Username**: `chenda.sok` (Accountant)
  - Password: `Admin@123`
  - Role: Employee
  - Employee: Chenda Sok (EMP010)

## Departments

| ID | Code | English Name | Khmer Name | Manager |
|----|------|-------------|------------|---------|
| DEPT001 | HR | Human Resources | ធនធានមនុស្ស | Admin User (EMP001) |
| DEPT002 | IT | Information Technology | បច្ចេកវិទ្យាព័ត៌មាន | Virak Seng (EMP004) |
| DEPT003 | FIN | Finance | ហិរញ្ញវត្ថុ | Sophea Mao (EMP008) |
| DEPT004 | OPS | Operations | ប្រតិបត្តិការ | - |
| DEPT005 | SALES | Sales & Marketing | លក់និងទីផ្សារ | - |

## Positions

### HR Department (DEPT001)
| ID | Code | English Name | Khmer Name | Level |
|----|------|-------------|------------|-------|
| POS001 | HR-DIR | HR Director | នាយកធនធានមនុស្ស | 1 |
| POS002 | HR-MGR | HR Manager | អ្នកគ្រប់គ្រងធនធានមនុស្ស | 2 |
| POS003 | HR-SPEC | HR Specialist | អ្នកឯកទេសធនធានមនុស្ស | 3 |

### IT Department (DEPT002)
| ID | Code | English Name | Khmer Name | Level |
|----|------|-------------|------------|-------|
| POS004 | IT-DIR | IT Director | នាយកបច្ចេកវិទ្យាព័ត៌មាន | 1 |
| POS005 | DEV-LEAD | Development Lead | ប្រធានក្រុមអភិវឌ្ឍន៍ | 2 |
| POS006 | SR-DEV | Senior Developer | អ្នកអភិវឌ្ឍន៍ជាន់ខ្ពស់ | 3 |
| POS007 | JR-DEV | Junior Developer | អ្នកអភិវឌ្ឍន៍កម្រិតដំបូង | 4 |

### Finance Department (DEPT003)
| ID | Code | English Name | Khmer Name | Level |
|----|------|-------------|------------|-------|
| POS008 | FIN-DIR | Finance Director | នាយកហិរញ្ញវត្ថុ | 1 |
| POS009 | ACC-MGR | Accounting Manager | អ្នកគ្រប់គ្រងគណនេយ្យ | 2 |
| POS010 | ACCOUNTANT | Accountant | គណនេយ្យករ | 3 |

### Operations Department (DEPT004)
| ID | Code | English Name | Khmer Name | Level |
|----|------|-------------|------------|-------|
| POS011 | OPS-MGR | Operations Manager | អ្នកគ្រប់គ្រងប្រតិបត្តិការ | 2 |
| POS012 | OPS-COORD | Operations Coordinator | អ្នកសម្របសម្រួលប្រតិបត្តិការ | 3 |

### Sales & Marketing Department (DEPT005)
| ID | Code | English Name | Khmer Name | Level |
|----|------|-------------|------------|-------|
| POS013 | SALES-MGR | Sales Manager | អ្នកគ្រប់គ្រងលក់ | 2 |
| POS014 | SALES-REP | Sales Representative | តំណាងលក់ | 3 |

## Employees

| ID | Code | Name | Khmer Name | Email | Department | Position | Salary |
|----|------|------|------------|-------|------------|----------|--------|
| EMP001 | ADM001 | Admin User | អ្នកគ្រប់គ្រង ប្រព័ន្ធ | admin@sangapac.com | HR | HR Director | $2,000 |
| EMP002 | HR001 | Sokha Chan | សុខា ចាន់ | sokha.chan@sangapac.com | HR | HR Manager | $1,500 |
| EMP003 | HR002 | Dara Pov | ដារ៉ា ពៅ | dara.pov@sangapac.com | HR | HR Specialist | $1,000 |
| EMP004 | IT001 | Virak Seng | វីរៈ សេង | virak.seng@sangapac.com | IT | IT Director | $2,200 |
| EMP005 | IT002 | Sreymom Keo | ស្រីមុំ កែវ | sreymom.keo@sangapac.com | IT | Development Lead | $1,800 |
| EMP006 | IT003 | Bopha Lim | បុប្ផា លឹម | bopha.lim@sangapac.com | IT | Senior Developer | $1,400 |
| EMP007 | IT004 | Ratanak Heng | រតនៈ ហេង | ratanak.heng@sangapac.com | IT | Junior Developer | $800 |
| EMP008 | FIN001 | Sophea Mao | សុភា ម៉ៅ | sophea.mao@sangapac.com | Finance | Finance Director | $2,100 |
| EMP009 | FIN002 | Piseth Tan | ពិសិដ្ឋ តាន់ | piseth.tan@sangapac.com | Finance | Accounting Manager | $1,600 |
| EMP010 | FIN003 | Chenda Sok | ចេន្ដា សុខ | chenda.sok@sangapac.com | Finance | Accountant | $1,100 |

## Leave Types

| ID | English Name | Khmer Name | Annual Quota | Paid |
|----|-------------|------------|--------------|------|
| LT001 | Annual Leave | ច្បាប់ប្រចាំឆ្នាំ | 18 days | Yes |
| LT002 | Sick Leave | ច្បាប់ឈឺ | 15 days | Yes |
| LT003 | Personal Leave | ច្បាប់ផ្ទាល់ខ្លួន | 7 days | Yes |
| LT004 | Maternity Leave | ច្បាប់សម្រាល | 90 days | Yes |
| LT005 | Paternity Leave | ច្បាប់បិតា | 7 days | Yes |
| LT006 | Unpaid Leave | ច្បាប់គ្មានប្រាក់ខែ | 30 days | No |
| LT007 | Compassionate Leave | ច្បាប់កង្វល់ | 5 days | Yes |

## Leave Balances

Each employee has a leave balance for each leave type for the current year:
- **Total Allocated**: Full annual quota
- **Used Days**: 0
- **Remaining Days**: Full annual quota

Example for EMP001 (Admin User):
- Annual Leave: 18/18 days remaining
- Sick Leave: 15/15 days remaining
- Personal Leave: 7/7 days remaining
- Maternity Leave: 90/90 days remaining
- Paternity Leave: 7/7 days remaining
- Unpaid Leave: 30/30 days remaining
- Compassionate Leave: 5/5 days remaining

## Testing Scenarios

### Scenario 1: Admin Operations
1. Login as `admin` / `Admin@123`
2. View all employees across departments
3. Create new employee
4. Manage departments and positions
5. Generate reports

### Scenario 2: Leave Request Flow
1. Login as `bopha.lim` / `Admin@123` (Employee)
2. Submit leave request for Annual Leave
3. Logout and login as `virak.seng` / `Admin@123` (Manager)
4. Approve the leave request
5. Logout and login back as `bopha.lim`
6. Verify leave balance updated

### Scenario 3: HR Manager Operations
1. Login as `sokha.chan` / `Admin@123` (HR Manager)
2. View all employees
3. Update employee information
4. Process payroll
5. Generate HR reports

### Scenario 4: Department Manager
1. Login as `virak.seng` / `Admin@123` (IT Director)
2. View team members (IT department employees)
3. Review pending leave requests from team
4. Conduct performance evaluations
5. View team attendance

### Scenario 5: Regular Employee
1. Login as `ratanak.heng` / `Admin@123` (Junior Developer)
2. View personal dashboard
3. Check leave balances
4. Submit leave request
5. View attendance history
6. View payslips

## Data Relationships

### Department → Manager
- HR (DEPT001) → Admin User (EMP001)
- IT (DEPT002) → Virak Seng (EMP004)
- Finance (DEPT003) → Sophea Mao (EMP008)

### Department → Employees
- HR: EMP001, EMP002, EMP003
- IT: EMP004, EMP005, EMP006, EMP007
- Finance: EMP008, EMP009, EMP010

### Employee → User
Each employee has exactly one user account with the same employee_id

### Employee → Leave Balances
Each employee has 7 leave balances (one for each leave type)

## Important Notes

1. **All passwords are the same**: `Admin@123` - Change in production!
2. **All employees are active**: No terminated or inactive employees
3. **All leave balances are full**: No leave has been taken yet
4. **Current year**: Leave balances are for the current year
5. **Phone numbers**: All use Cambodia format (+855)
6. **Addresses**: All set to "Phnom Penh, Cambodia"
7. **Hire dates**: Range from 2020 to 2022

## Resetting Data

To reset the database to initial state:

```bash
npm run seed
```

This will:
1. Delete all existing data
2. Re-seed with fresh initial data
3. Reset all passwords to `Admin@123`
4. Reset all leave balances to full quota

⚠️ **Warning**: This deletes ALL data including any test data you've created!
