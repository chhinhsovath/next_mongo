# Admin User Features Guide

## Login Credentials
- **Username**: admin
- **Password**: Admin@123

## Admin Role Overview

The admin role has the highest level of permissions in the HRMIS system. Admins have full access to all features and can perform all operations across the system.

## Available Features & Pages

### 1. Dashboard (`/dashboard`)
- **Access**: All users
- **Admin Capabilities**:
  - View system-wide statistics and metrics
  - Quick access to all modules
  - View recent activities across all employees
  - Access to announcements and notifications

### 2. Employees (`/employees`)
- **Access**: Admin, HR Manager
- **Admin Capabilities**:
  - **View**: List all employees with search and filter
  - **Create**: Add new employees (`/employees/new`)
  - **Update**: Edit employee information
  - **Delete**: Remove employees (soft delete)
  - **View Details**: See complete employee profile (`/employees/[id]`)
  - Manage employee personal info, contact details, position, department, salary
  - Upload employee profile photos
  - View employee attendance, leave, performance, and payroll history

### 3. Leave Management (`/leave`)
- **Access**: All users (with different permissions)
- **Admin Capabilities**:
  - **My Requests** (`/leave/requests`): Submit and track own leave requests
  - **Approvals** (`/leave/approvals`): Approve or reject leave requests from all employees
  - View leave balances for all employees
  - Override leave policies if needed
  - Manage leave types and quotas

### 4. Attendance (`/attendance`)
- **Access**: All users (with different permissions)
- **Admin Capabilities**:
  - View attendance records for all employees
  - Manual attendance entry for any employee
  - Check-in/Check-out with GPS location tracking
  - View attendance calendar with color-coded status
  - Mark absences for employees
  - Generate attendance reports
  - View work hours and late arrivals

### 5. Payroll (`/payroll`)
- **Access**: Admin, HR Manager
- **Admin Capabilities**:
  - View all payroll records
  - Generate payroll for specific periods
  - Calculate gross salary, deductions, and net salary
  - Approve payroll records
  - View detailed payslips for all employees
  - Export payroll data
  - Manage salary components (base, allowances, bonuses, deductions)

### 6. Performance (`/performance`)
- **Access**: All users (with different permissions)
- **Admin Capabilities**:
  - Conduct performance evaluations for any employee
  - View all performance evaluations
  - Rate employees on multiple criteria
  - Add comments and feedback
  - Set goals and development plans
  - View performance trends and charts
  - Track evaluation acknowledgments

### 7. Organization (`/organization`)
- **Access**: All users can view, Admin/HR Manager can manage
- **Admin Capabilities**:
  - **Departments** (`/organization/departments`):
    - Create, update, and delete departments
    - Assign department heads
    - Manage department hierarchy
    - View department structure
  - **Positions** (`/organization/positions`):
    - Create, update, and delete positions
    - Link positions to departments
    - Define position levels
    - Manage position status

### 8. Reports (`/reports`)
- **Access**: Admin, HR Manager, Manager
- **Admin Capabilities**:
  - Generate employee headcount reports
  - Generate leave utilization reports
  - Generate attendance summary reports
  - Generate payroll summary reports
  - Filter reports by date range, department, position
  - Export reports in PDF and Excel formats
  - View data visualizations and charts

## Role-Based Access Control (RBAC)

The admin role has the following permission level:
- **Role Hierarchy**: Admin (Level 4) - Highest
- **Permissions**: All permissions across the system

### Permission Comparison

| Feature | Employee | Manager | HR Manager | Admin |
|---------|----------|---------|------------|-------|
| View own data | ✓ | ✓ | ✓ | ✓ |
| View all employees | ✗ | ✓ | ✓ | ✓ |
| Manage employees | ✗ | ✗ | ✓ | ✓ |
| Approve leave | ✗ | ✓ | ✓ | ✓ |
| Manage payroll | ✗ | ✗ | ✓ | ✓ |
| Conduct evaluations | ✗ | ✓ | ✓ | ✓ |
| Manage organization | ✗ | ✗ | ✓ | ✓ |
| View reports | ✗ | ✓ | ✓ | ✓ |

## Key Admin Workflows

### 1. Employee Onboarding
1. Navigate to Employees → New Employee
2. Fill in employee details (personal info, contact, position, department)
3. Set salary information
4. Upload profile photo
5. Create user account with appropriate role
6. Assign initial leave balances

### 2. Leave Approval Process
1. Navigate to Leave Management → Approvals
2. Review pending leave requests
3. Check employee leave balance
4. Approve or reject with comments
5. System automatically updates leave balance

### 3. Payroll Processing
1. Navigate to Payroll
2. Select payroll period (month)
3. Generate payroll for all employees
4. Review calculated amounts (gross, deductions, net)
5. Approve payroll records
6. Mark as paid when processed

### 4. Performance Evaluation
1. Navigate to Performance
2. Select employee to evaluate
3. Set evaluation period
4. Rate on multiple criteria (1-5 scale)
5. Add comments and feedback
6. Set goals and development plan
7. Submit evaluation
8. Employee acknowledges evaluation

### 5. Organizational Management
1. Navigate to Organization
2. Create departments with hierarchy
3. Assign department heads
4. Create positions linked to departments
5. Assign employees to positions and departments

## System Features

### Security
- Session timeout after 30 minutes of inactivity
- Role-based access control
- Secure password hashing
- CSRF protection
- Input validation and sanitization

### Data Management
- All dates stored in UTC, displayed in Asia/Phnom_Penh (UTC+7)
- Soft delete for employees (data retention)
- Audit trail for critical operations
- Data validation on client and server

### Localization
- Bilingual support: English and Khmer (ភាសាខ្មែរ)
- Khmer names for employees, departments, positions, leave types
- Timezone-aware date/time handling

### GPS Location Tracking
- Attendance check-in/check-out captures GPS coordinates
- Location verification for work attendance
- Privacy-compliant implementation

## API Endpoints (Admin Access)

As an admin, you have access to all API endpoints:

- `/api/employees` - Employee management
- `/api/leave` - Leave request management
- `/api/attendance` - Attendance tracking
- `/api/payroll` - Payroll processing
- `/api/performance` - Performance evaluations
- `/api/departments` - Department management
- `/api/positions` - Position management
- `/api/reports` - Report generation

## Troubleshooting

### Can't see menu items?
- Ensure you're logged in with admin credentials
- Check that your session hasn't expired
- Verify your user role is set to 'admin' in the database

### Missing features?
- Some features may be in development (check the spec files in `.kiro/specs/hrmis-system/`)
- Refer to the design document for planned features

### Need to add new features?
- Review the requirements document (`.kiro/specs/hrmis-system/requirements.md`)
- Check the design document (`.kiro/specs/hrmis-system/design.md`)
- Follow the implementation tasks (`.kiro/specs/hrmis-system/tasks.md`)

## Future Enhancements (Planned)

The following admin features are planned for future releases:
- User management interface (create/edit users, reset passwords)
- System settings configuration
- Leave type management UI
- Email notification settings
- Backup and restore functionality
- Audit log viewer
- System health monitoring
- Recruitment module
- Training & development module

## Support

For technical issues or feature requests, refer to:
- Requirements: `.kiro/specs/hrmis-system/requirements.md`
- Design: `.kiro/specs/hrmis-system/design.md`
- Implementation: `.kiro/specs/hrmis-system/tasks.md`
