# Complete Admin Features & Functions Guide

**Login Credentials:**
- Username: `admin`
- Password: `Admin@123`

---

## 🎯 ADMIN ROLE OVERVIEW

The admin role has **FULL ACCESS** to all system features with the highest permission level (Level 4). Below is a complete list of every page, feature, and function available.

---

## 📊 1. DASHBOARD (`/dashboard`)

### Features:
- **Profile Summary Widget**
  - Display name (English/Khmer)
  - Employee code
  - Email
  - Position and department
  - Employment status

- **Leave Balance Summary**
  - View all leave types
  - Remaining days vs total days
  - Visual progress bars
  - Color-coded indicators (green >5 days, orange ≤5 days)

- **Recent Attendance Widget**
  - Last 5 attendance records
  - Check-in/check-out times
  - Work date
  - Attendance status (present, late, absent, half_day)

- **Pending Requests Widget**
  - View pending leave requests
  - Request dates and duration
  - Submission timestamps

- **Latest Payslip Widget**
  - Net salary display
  - Payroll period
  - Payment status
  - Quick link to payroll details

- **Recent Leave Requests**
  - Last 5 leave requests
  - Leave type
  - Date ranges
  - Status tags

- **Announcements**
  - System announcements
  - Important dates
  - Company news

- **Quick Actions**
  - Request Leave button
  - View Attendance button
  - View Payslips button
  - My Profile button

### Functions:
- Real-time data updates (30-60 second refresh)
- Timezone-aware date display (Asia/Phnom_Penh)
- Responsive grid layout
- Click-through navigation to detailed pages

---

## 👥 2. EMPLOYEES (`/employees`)

### Main Page Features:
- **Employee List Table**
  - View all employees
  - Search by name, code, email
  - Filter by department
  - Filter by position
  - Filter by status (active/inactive/terminated)
  - Pagination controls
  - Sort by any column

- **Actions per Employee:**
  - View details
  - Edit employee
  - Delete employee (soft delete)

### Create New Employee (`/employees/new`):
- **Personal Information:**
  - Employee code (unique)
  - First name & last name (English)
  - First name & last name (Khmer)
  - Email address
  - Phone number
  - Date of birth
  - Gender (male/female/other)
  - National ID
  - Address

- **Employment Information:**
  - Department selection
  - Position selection
  - Employee type (full_time/part_time/contract/intern)
  - Hire date
  - Termination date (optional)
  - Salary amount
  - Employment status (active/inactive/terminated)

- **Profile Photo:**
  - Upload employee photo

### Employee Detail Page (`/employees/[id]`):
- **Overview Tab:**
  - Complete employee information
  - Personal details
  - Contact information
  - Employment details
  - Salary information
  - Department and position

- **Attendance Tab:**
  - Employee attendance history (coming soon)

- **Leave Tab:**
  - Employee leave requests (coming soon)

- **Performance Tab:**
  - Performance evaluations (coming soon)

- **Payroll Tab:**
  - Payroll records (coming soon)

- **Actions:**
  - Edit employee button
  - Back to list button

### Functions:
- Create new employees
- Update employee information
- Soft delete employees
- Search and filter employees
- View complete employee profiles
- Export employee data
- Bulk operations

---

## 🏖️ 3. LEAVE MANAGEMENT

### My Leave Requests (`/leave/requests`):
- **View Own Requests:**
  - All personal leave requests
  - Status: pending, approved, rejected, cancelled
  - Leave type
  - Date ranges
  - Total days
  - Reason
  - Approval/rejection comments

- **Submit New Request:**
  - Select leave type
  - Choose start and end dates
  - Enter reason
  - View remaining balance
  - Submit for approval

### Leave Approvals (`/leave/approvals`):
- **Pending Requests List:**
  - All pending leave requests from all employees
  - Employee information
  - Leave details
  - Request date
  - Total days requested

- **Approval Actions:**
  - Approve leave request
  - Reject leave request
  - Add approval/rejection comments
  - View employee leave balance
  - Check for date conflicts

### Leave Overview (`/leave`):
- Combined view with:
  - Leave request form
  - Personal leave request list
  - Quick submission

### Functions:
- Submit leave requests
- Approve/reject any leave request
- View all employee leave requests
- Check leave balances
- Validate date overlaps
- Automatic balance calculation
- Leave type management
- Filter by status, employee, date range

---

## ⏰ 4. ATTENDANCE (`/attendance`)

### Check In/Out Tab:
- **Manual Entry:**
  - Select employee (admin can enter for anyone)
  - Select work date
  - Enter check-in time
  - Enter check-out time
  - GPS location capture (optional)
  - Add notes

- **Quick Check-in:**
  - One-click check-in with current time
  - GPS location auto-capture
  - Current date selection

### Calendar Tab:
- **Attendance Calendar View:**
  - Monthly calendar display
  - Color-coded attendance status:
    - Green: Present
    - Orange: Late
    - Red: Absent
    - Blue: Half day
  - Click date to view details
  - Month/year navigation
  - View any employee's calendar

### Report Tab:
- **Attendance Reports:**
  - Select date range
  - Select employee (or all)
  - View total work hours
  - Count present days
  - Count late arrivals
  - Count absences
  - Export to Excel/PDF

### Functions:
- Record attendance for any employee
- Manual time entry
- GPS location tracking
- View attendance history
- Generate attendance reports
- Calendar visualization
- Calculate work hours
- Mark absences
- Late arrival tracking

---

## 💰 5. PAYROLL (`/payroll`)

### Main Features:
- **Payroll Table:**
  - View all payroll records
  - Filter by month
  - Filter by employee
  - Filter by status (draft/approved/paid)
  - Sort by any column
  - Pagination

- **Payroll Information Displayed:**
  - Employee name and code
  - Payroll month
  - Base salary
  - Allowances
  - Bonuses
  - Overtime pay
  - Deductions
  - Net salary
  - Payment status
  - Payment date

### Create Payroll:
- **Manual Creation:**
  - Select employee
  - Select payroll month
  - Enter base salary (auto-filled from employee record)
  - Enter allowances
  - Enter bonuses
  - Enter overtime pay
  - Enter deductions
  - System calculates net salary automatically

### Generate Payroll:
- **Bulk Generation:**
  - Select payroll month
  - Select specific employees (optional - defaults to all active)
  - System generates payroll for all selected employees
  - Uses employee base salary
  - Creates draft payroll records
  - Shows summary: created, skipped, errors

### View Payslip:
- **Detailed Payslip View:**
  - Employee information
  - Payroll period
  - Earnings breakdown:
    - Base salary
    - Allowances
    - Bonuses
    - Overtime pay
  - Deductions breakdown
  - Net salary calculation
  - Payment status
  - Print/export functionality

### Functions:
- Create individual payroll records
- Generate bulk payroll
- Approve payroll
- Mark as paid
- View payslips
- Export payroll data
- Calculate net salary
- Manage salary components
- Filter and search payroll
- Payroll history tracking

---

## 🏆 6. PERFORMANCE (`/performance`)

### Main Features:
- **Evaluations Table:**
  - View all performance evaluations
  - Search by employee ID
  - Filter by status (draft/completed/acknowledged)
  - Sort by any column
  - Pagination

- **Evaluation Information:**
  - Evaluation ID
  - Employee ID
  - Evaluator ID
  - Evaluation period (start/end dates)
  - Overall score (1-5 scale)
  - Status
  - Created date

### Create New Evaluation:
- **Evaluation Form:**
  - Select employee
  - Select evaluator
  - Set evaluation period (start/end dates)
  - Add multiple criteria:
    - Criterion name
    - Description
    - Score (1-5)
    - Comments
  - Set goals:
    - Goal description
    - Achieved status (yes/no)
  - Overall comments
  - Development plan
  - Status (draft/completed)

### View Evaluation Details:
- **Details Tab:**
  - Complete evaluation information
  - All criteria with scores and comments
  - Goals and achievement status
  - Overall comments
  - Development plan
  - Acknowledgment status

- **Visualizations Tab:**
  - Performance trend chart (line chart over time)
  - Radar chart (criteria breakdown)
  - Score comparisons

### Actions:
- **Edit Evaluation:**
  - Modify any field
  - Update scores
  - Change status

- **Delete Evaluation:**
  - Remove evaluation (with confirmation)

- **Acknowledge Evaluation:**
  - Employee acknowledges review
  - Records acknowledgment date

### Functions:
- Create performance evaluations for any employee
- Edit evaluations
- Delete evaluations
- View evaluation history
- Acknowledge evaluations
- Multiple criteria rating
- Goal tracking
- Development planning
- Performance visualization
- Trend analysis
- Export evaluations

---

## 🏢 7. ORGANIZATION

### Departments (`/organization/departments`):

#### Features:
- **Department Hierarchy Tree:**
  - Visual tree structure
  - Parent-child relationships
  - Employee count per department
  - Expandable/collapsible nodes
  - Click to select department

- **Department Details Panel:**
  - Department code
  - Department name (English)
  - Department name (Khmer)
  - Manager name
  - Employee count
  - Status (active/inactive)
  - Parent department

#### Create/Edit Department:
- **Department Form:**
  - Department code (unique)
  - Department name (English)
  - Department name (Khmer)
  - Parent department (optional - for hierarchy)
  - Department manager (select from employees)
  - Status

#### Functions:
- Create new departments
- Edit departments
- Delete departments
- Assign department managers
- Create department hierarchy
- View organizational structure
- Employee count tracking
- Department status management

### Positions (`/organization/positions`):

#### Features:
- **Positions Table:**
  - Position code
  - Position name (English)
  - Position name (Khmer)
  - Department
  - Position level (1=highest)
  - Employee count
  - Status (active/inactive)
  - Sort by any column
  - Pagination

- **Filter Options:**
  - Filter by department
  - View all or specific department positions

#### Create/Edit Position:
- **Position Form:**
  - Position code (unique)
  - Position name (English)
  - Position name (Khmer)
  - Department (required)
  - Position level (1-10, lower = higher rank)
  - Status

#### Functions:
- Create new positions
- Edit positions
- Delete positions
- Link positions to departments
- Define position hierarchy (levels)
- Employee count per position
- Position status management
- Filter by department

---

## 📈 8. REPORTS (`/reports`)

### Report Types:

#### 1. Employee Headcount Report:
- **Filters:**
  - Date range
  - Department
  - Position
  - Employment status
  - Employee type

- **Data Displayed:**
  - Total employees
  - Breakdown by department
  - Breakdown by position
  - Breakdown by status
  - Breakdown by type
  - Charts and visualizations

#### 2. Leave Utilization Report:
- **Filters:**
  - Date range
  - Employee
  - Department
  - Leave type

- **Data Displayed:**
  - Leave taken vs available
  - Leave balance by employee
  - Leave type breakdown
  - Department-wise leave usage
  - Trends over time

#### 3. Attendance Summary Report:
- **Filters:**
  - Date range
  - Employee
  - Department
  - Attendance status

- **Data Displayed:**
  - Total work days
  - Present days
  - Absent days
  - Late arrivals
  - Work hours summary
  - Attendance rate percentage
  - Department comparison

#### 4. Payroll Summary Report:
- **Filters:**
  - Payroll month/period
  - Department
  - Employee

- **Data Displayed:**
  - Total payroll cost
  - Breakdown by department
  - Salary components summary
  - Deductions summary
  - Net salary totals
  - Cost trends

### Export Options:
- **PDF Export:**
  - Formatted report
  - Charts and tables
  - Company branding
  - Print-ready

- **Excel Export:**
  - Raw data
  - Multiple sheets
  - Formulas included
  - Pivot-ready format

### Functions:
- Generate custom reports
- Select multiple filters
- Date range selection
- Department/employee filtering
- Data visualization
- Export to PDF
- Export to Excel
- Print reports
- Save report templates
- Schedule reports (future)

---

## 🔐 ADMIN-SPECIFIC PERMISSIONS

### Full Access To:
✅ View all employees
✅ Create/edit/delete employees
✅ View all leave requests
✅ Approve/reject any leave request
✅ View all attendance records
✅ Record attendance for anyone
✅ View all payroll records
✅ Create/approve payroll
✅ Conduct performance evaluations for anyone
✅ View all evaluations
✅ Manage departments
✅ Manage positions
✅ Generate all reports
✅ Export all data
✅ Manage organizational structure
✅ Access system settings (future)
✅ Manage users (future)

### Permission Level:
- **Admin**: Level 4 (Highest)
- **HR Manager**: Level 3
- **Manager**: Level 2
- **Employee**: Level 1

---

## 🎨 UI FEATURES

### Navigation:
- **Sidebar Menu:**
  - Dashboard
  - Employees
  - Leave Management (with submenu)
    - My Requests
    - Approvals
  - Attendance
  - Payroll
  - Performance
  - Organization (with submenu)
    - Departments
    - Positions
  - Reports

### Common Features:
- **Search & Filter:**
  - Available on all list pages
  - Multiple filter criteria
  - Real-time search

- **Pagination:**
  - Configurable page size
  - Total count display
  - Jump to page

- **Sorting:**
  - Click column headers
  - Ascending/descending
  - Multi-column sort

- **Actions:**
  - View details
  - Edit
  - Delete (with confirmation)
  - Export
  - Print

- **Responsive Design:**
  - Mobile-friendly
  - Tablet-optimized
  - Desktop full-featured

- **Bilingual Support:**
  - English interface
  - Khmer names for entities
  - Language toggle (future)

---

## 🔧 SYSTEM FEATURES

### Data Management:
- **Timezone Handling:**
  - All dates stored in UTC
  - Displayed in Asia/Phnom_Penh (UTC+7)
  - Automatic conversion

- **Soft Delete:**
  - Employees marked as deleted, not removed
  - Data retention for compliance
  - Restore capability (future)

- **Audit Trail:**
  - Created timestamps
  - Updated timestamps
  - User tracking (future)

### Security:
- **Session Management:**
  - 30-minute timeout
  - Auto-logout on inactivity
  - Secure JWT tokens

- **Role-Based Access:**
  - Permission checks on every page
  - API-level authorization
  - Dynamic menu based on role

- **Data Validation:**
  - Client-side validation
  - Server-side validation
  - Zod schema validation

### Performance:
- **Data Fetching:**
  - SWR for caching
  - Auto-refresh intervals
  - Optimistic updates

- **Loading States:**
  - Skeleton screens
  - Loading spinners
  - Progress indicators

---

## 📱 FUTURE ADMIN FEATURES (Planned)

### User Management:
- Create/edit user accounts
- Reset passwords
- Assign roles
- Manage permissions
- User activity logs

### System Settings:
- Configure leave types
- Set leave quotas
- Define work hours
- Configure holidays
- Email notifications
- System preferences

### Advanced Features:
- Backup and restore
- Data import/export
- Bulk operations
- Workflow automation
- Custom reports builder
- Dashboard customization
- Announcement management
- Document management

### Recruitment Module:
- Job postings
- Application tracking
- Interview scheduling
- Candidate evaluation

### Training Module:
- Course management
- Certification tracking
- Training calendar
- Skills development

---

## 🚀 QUICK START GUIDE FOR ADMIN

### First Login:
1. Navigate to login page
2. Enter username: `admin`
3. Enter password: `Admin@123`
4. Click Login

### Initial Setup:
1. **Create Departments:**
   - Go to Organization → Departments
   - Create company departments
   - Set up hierarchy

2. **Create Positions:**
   - Go to Organization → Positions
   - Create job positions
   - Link to departments

3. **Add Employees:**
   - Go to Employees → New Employee
   - Fill in employee details
   - Assign department and position

4. **Configure Leave Types:**
   - (Future feature - currently in database)

5. **Start Using:**
   - Record attendance
   - Process leave requests
   - Generate payroll
   - Conduct evaluations
   - Generate reports

---

## 📞 SUPPORT & DOCUMENTATION

### Documentation Files:
- `docs/admin-features-guide.md` - Feature overview
- `.kiro/specs/hrmis-system/requirements.md` - System requirements
- `.kiro/specs/hrmis-system/design.md` - Technical design
- `.kiro/specs/hrmis-system/tasks.md` - Implementation tasks

### Technical Details:
- **Frontend**: Next.js 14, React 18, Ant Design 5
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth with JWT
- **Timezone**: Asia/Phnom_Penh (UTC+7)

---

## ✅ SUMMARY

The admin role has **COMPLETE ACCESS** to all 8 main modules with full CRUD operations:

1. ✅ **Dashboard** - Overview and quick actions
2. ✅ **Employees** - Full employee lifecycle management
3. ✅ **Leave Management** - Request and approval workflows
4. ✅ **Attendance** - Time tracking with GPS
5. ✅ **Payroll** - Salary processing and payslips
6. ✅ **Performance** - Evaluations and development
7. ✅ **Organization** - Structure management
8. ✅ **Reports** - Analytics and exports

**Total Features**: 100+ functions across all modules
**Total Pages**: 15+ unique pages
**Total Actions**: Create, Read, Update, Delete, Approve, Export, Generate, Analyze

---

*Last Updated: November 10, 2025*
*System Version: 1.0*
*Role: Admin (Level 4)*
