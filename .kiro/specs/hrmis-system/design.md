# HRMIS Design Document

## Overview

The HRMIS is a full-stack web application built with Next.js 14+ (App Router), React 18+, Ant Design 5.x, and MongoDB. The system follows a modern architecture with server-side rendering, API routes, and a component-based UI. The application will be deployed as a monolithic Next.js application with clear separation between frontend components, backend API logic, and database operations.

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Ant Design 5, TypeScript
- **Backend**: Next.js API Routes (App Router), Node.js
- **Database**: MongoDB Atlas (Cloud)
- **ORM**: Mongoose 8
- **Authentication**: NextAuth 4 with JWT
- **State Management**: React Context API + SWR for data fetching
- **Form Handling**: Ant Design Form + React Hook Form
- **Validation**: Zod for schema validation
- **Date Handling**: Day.js (Ant Design compatible)
- **Charts**: Recharts for data visualization
- **Naming Convention**: snake_case for all database fields and API parameters
- **Timezone**: Store all dates in UTC, display in Asia/Phnom_Penh (UTC+7)
- **Language Support**: English and Khmer (ភាសាខ្មែរ)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React Components (Ant Design UI)            │    │
│  │  - Pages (App Router)                               │    │
│  │  - Shared Components                                │    │
│  │  - Context Providers                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Server                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Routes (App Router)                │    │
│  │  - /api/auth/* (NextAuth)                          │    │
│  │  - /api/employees/*                                │    │
│  │  - /api/leave/*                                    │    │
│  │  - /api/attendance/*                               │    │
│  │  - /api/payroll/*                                  │    │
│  │  - /api/performance/*                              │    │
│  │  - /api/departments/*                              │    │
│  │  - /api/reports/*                                  │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Business Logic Layer                     │    │
│  │  - Services (Business Rules)                       │    │
│  │  - Middleware (Auth, Validation)                   │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Data Access Layer (Models)                 │    │
│  │  - MongoDB Models (Mongoose)                       │    │
│  │  - Database Connection                             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas Cloud Database                    │
│  - Collections: users, employees, leave_requests,           │
│    attendance, payroll, performance_evaluations,            │
│    departments, positions                                   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
next_mongo/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected route group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── employees/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── leave/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── requests/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── approvals/
│   │   │   │       └── page.tsx
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── payroll/
│   │   │   │   └── page.tsx
│   │   │   ├── performance/
│   │   │   │   └── page.tsx
│   │   │   ├── organization/
│   │   │   │   ├── departments/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── positions/
│   │   │   │       └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── employees/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── leave/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── approve/
│   │   │   │       └── route.ts
│   │   │   ├── attendance/
│   │   │   │   └── route.ts
│   │   │   ├── payroll/
│   │   │   │   └── route.ts
│   │   │   ├── performance/
│   │   │   │   └── route.ts
│   │   │   ├── departments/
│   │   │   │   └── route.ts
│   │   │   ├── positions/
│   │   │   │   └── route.ts
│   │   │   └── reports/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                   # Reusable components
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── employees/
│   │   │   ├── EmployeeForm.tsx
│   │   │   ├── EmployeeList.tsx
│   │   │   └── EmployeeCard.tsx
│   │   ├── leave/
│   │   │   ├── LeaveRequestForm.tsx
│   │   │   ├── LeaveRequestList.tsx
│   │   │   └── LeaveApprovalCard.tsx
│   │   ├── attendance/
│   │   │   ├── AttendanceCalendar.tsx
│   │   │   └── AttendanceForm.tsx
│   │   ├── payroll/
│   │   │   ├── PayrollTable.tsx
│   │   │   └── PayslipView.tsx
│   │   ├── performance/
│   │   │   ├── EvaluationForm.tsx
│   │   │   └── PerformanceChart.tsx
│   │   ├── reports/
│   │   │   └── ReportGenerator.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ProtectedRoute.tsx
│   ├── lib/                          # Utilities and configurations
│   │   ├── mongodb.ts                # MongoDB connection
│   │   ├── auth.ts                   # NextAuth configuration
│   │   └── utils.ts                  # Helper functions
│   ├── models/                       # Mongoose models
│   │   ├── User.ts
│   │   ├── Employee.ts
│   │   ├── LeaveRequest.ts
│   │   ├── Attendance.ts
│   │   ├── Payroll.ts
│   │   ├── PerformanceEvaluation.ts
│   │   ├── Department.ts
│   │   └── Position.ts
│   ├── services/                     # Business logic
│   │   ├── employeeService.ts
│   │   ├── leaveService.ts
│   │   ├── attendanceService.ts
│   │   ├── payrollService.ts
│   │   ├── performanceService.ts
│   │   └── reportService.ts
│   ├── types/                        # TypeScript types
│   │   ├── employee.ts
│   │   ├── leave.ts
│   │   ├── attendance.ts
│   │   ├── payroll.ts
│   │   └── index.ts
│   ├── contexts/                     # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   └── middleware.ts                 # Next.js middleware
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Components and Interfaces

### Core Components

#### 1. Authentication Components

**LoginPage** (`app/(auth)/login/page.tsx`)
- Login form with email and password fields
- Integration with NextAuth.js
- Error handling and validation
- Redirect to dashboard on successful login

**AuthContext** (`contexts/AuthContext.tsx`)
- Provides authentication state throughout the app
- User session management
- Role-based access control helpers

#### 2. Dashboard Components

**DashboardLayout** (`components/layout/DashboardLayout.tsx`)
- Main layout wrapper with Ant Design Layout
- Sidebar navigation
- Header with user menu
- Responsive design

**DashboardPage** (`app/(dashboard)/dashboard/page.tsx`)
- Employee dashboard with widgets
- Leave balance summary
- Recent attendance
- Quick actions
- Announcements

#### 3. Employee Management Components

**EmployeeList** (`components/employees/EmployeeList.tsx`)
- Ant Design Table with employee data
- Search and filter functionality
- Pagination
- Actions: view, edit, delete

**EmployeeForm** (`components/employees/EmployeeForm.tsx`)
- Form for creating/editing employees
- Fields: personal info, contact, position, department, salary
- Validation with Zod
- File upload for profile photo

**EmployeeDetailPage** (`app/(dashboard)/employees/[id]/page.tsx`)
- Detailed employee view
- Tabs: Overview, Attendance, Leave, Performance, Payroll
- Edit and delete actions

#### 4. Leave Management Components

**LeaveRequestForm** (`components/leave/LeaveRequestForm.tsx`)
- Form for submitting leave requests
- Date range picker
- Leave type selector
- Reason text area
- Leave balance display

**LeaveRequestList** (`components/leave/LeaveRequestList.tsx`)
- List of employee's leave requests
- Status badges (pending, approved, rejected)
- Filter by status and date range

**LeaveApprovalCard** (`components/leave/LeaveApprovalCard.tsx`)
- Card component for managers to review requests
- Employee details
- Leave details
- Approve/Reject buttons with comment modal

#### 5. Attendance Components

**AttendanceCalendar** (`components/attendance/AttendanceCalendar.tsx`)
- Ant Design Calendar component
- Color-coded attendance status
- Click to view daily details
- Month/Year navigation

**AttendanceForm** (`components/attendance/AttendanceForm.tsx`)
- Check-in/Check-out form
- Time picker
- Date selector
- Manual entry for HR admins

#### 6. Payroll Components

**PayrollTable** (`components/payroll/PayrollTable.tsx`)
- Table showing payroll records
- Columns: employee, gross, deductions, net
- Filter by payroll cycle
- Export functionality

**PayslipView** (`components/payroll/PayslipView.tsx`)
- Detailed payslip view
- Earnings breakdown
- Deductions breakdown
- Printable format

#### 7. Performance Components

**EvaluationForm** (`components/performance/EvaluationForm.tsx`)
- Form for creating performance evaluations
- Multiple rating criteria
- Score inputs (1-5 scale)
- Comments for each criterion
- Overall rating calculation

**PerformanceChart** (`components/performance/PerformanceChart.tsx`)
- Chart.js visualization of performance trends
- Line chart showing scores over time
- Radar chart for criterion breakdown

#### 8. Organization Components

**DepartmentManager** (`app/(dashboard)/organization/departments/page.tsx`)
- CRUD interface for departments
- Tree view of organizational structure
- Assign department heads

**PositionManager** (`app/(dashboard)/organization/positions/page.tsx`)
- CRUD interface for positions
- Link positions to departments
- Position hierarchy

#### 9. Reports Components

**ReportGenerator** (`components/reports/ReportGenerator.tsx`)
- Report type selector
- Date range picker
- Filter options
- Generate and export buttons
- Preview area

### API Interfaces

#### Employee API (`/api/employees`)

```typescript
// GET /api/employees - List all employees
// Query params: page, limit, search, department_id, position_id
Response: {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}

// POST /api/employees - Create employee
Request: {
  employee_code: string;
  first_name: string;
  last_name: string;
  first_name_khmer?: string;
  last_name_khmer?: string;
  email: string;
  phone_number: string;
  date_of_birth: Date;
  gender: 'male' | 'female' | 'other';
  national_id: string;
  address: string;
  department_id: string;
  position_id: string;
  hire_date: Date;
  salary_amount: number;
  employee_type: 'full_time' | 'part_time' | 'contract' | 'intern';
}
Response: { employee: Employee }

// GET /api/employees/[employee_id] - Get employee by ID
Response: { employee: Employee }

// PUT /api/employees/[employee_id] - Update employee
Request: Partial<Employee>
Response: { employee: Employee }

// DELETE /api/employees/[employee_id] - Soft delete employee
Response: { success: boolean }
```

#### Leave API (`/api/leaves`)

```typescript
// GET /api/leaves - List leave requests
// Query params: employee_id, leave_status, start_date, end_date
Response: {
  leave_requests: LeaveRequest[];
  total: number;
}

// POST /api/leaves/request - Create leave request
Request: {
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  reason: string;
}
Response: { leave_request: LeaveRequest }

// GET /api/leaves/[employee_id] - Get employee leave requests
Response: { leave_requests: LeaveRequest[] }

// PUT /api/leaves/[leave_request_id]/approve - Approve leave request
Request: {
  approved_by: string;
}
Response: { leave_request: LeaveRequest }

// PUT /api/leaves/[leave_request_id]/reject - Reject leave request
Request: {
  rejection_reason: string;
}
Response: { leave_request: LeaveRequest }
```

#### Attendance API (`/api/attendance`)

```typescript
// GET /api/attendance/[employee_id] - Get employee attendance records
// Query params: start_date, end_date
Response: {
  attendance_records: Attendance[];
  total: number;
}

// POST /api/attendance/check-in - Check-in attendance
Request: {
  employee_id: string;
  work_date: string; // YYYY-MM-DD
  check_in_time: Date; // UTC timestamp
  check_in_location_lat?: number;
  check_in_location_lng?: number;
}
Response: { attendance: Attendance }

// POST /api/attendance/check-out - Check-out attendance
Request: {
  employee_id: string;
  work_date: string; // YYYY-MM-DD
  check_out_time: Date; // UTC timestamp
  check_out_location_lat?: number;
  check_out_location_lng?: number;
}
Response: { attendance: Attendance }
```

#### Payroll API (`/api/payroll`)

```typescript
// GET /api/payroll/[employee_id] - Get employee payroll records
// Query params: payroll_month
Response: {
  payroll_records: Payroll[];
  total: number;
}

// POST /api/payroll - Generate payroll
Request: {
  payroll_month: string; // e.g., "2024-01"
  employee_ids?: string[]; // Optional, all if not provided
}
Response: { payroll_records: Payroll[] }

// PUT /api/payroll/[payroll_id]/approve - Approve payroll
Request: {
  approved_by: string;
}
Response: { payroll: Payroll }
```

## Data Models

### User Model

```typescript
interface User {
  _id: ObjectId;
  user_id: string; // Unique user ID
  employee_id: string; // Reference to Employee (required, unique)
  username: string; // Unique username
  password_hash: string; // Hashed password
  user_role: 'admin' | 'hr_manager' | 'manager' | 'employee';
  last_login_at?: Date;
  user_status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}
```

### Employee Model

```typescript
interface Employee {
  _id: ObjectId;
  employee_id: string; // Auto-generated unique ID
  employee_code: string; // Unique employee code
  first_name: string;
  last_name: string;
  first_name_khmer?: string; // Khmer name support
  last_name_khmer?: string; // Khmer name support
  email: string;
  phone_number: string;
  date_of_birth: Date;
  gender: 'male' | 'female' | 'other';
  national_id: string; // National ID card number
  address: string;
  department_id: string; // Reference to Department
  position_id: string; // Reference to Position
  employee_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  employee_status: 'active' | 'inactive' | 'terminated';
  hire_date: Date;
  termination_date?: Date;
  salary_amount: number;
  profile_photo_url?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // Soft delete support
}
```

### LeaveRequest Model

```typescript
interface LeaveRequest {
  _id: ObjectId;
  leave_request_id: string; // Unique leave request ID
  employee_id: string; // Reference to Employee
  leave_type_id: string; // Reference to LeaveType
  start_date: Date;
  end_date: Date;
  total_days: number; // Calculated
  reason: string;
  leave_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string; // Reference to User (manager)
  approved_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}

interface LeaveType {
  _id: ObjectId;
  leave_type_id: string; // Unique leave type ID
  leave_type_name: string;
  leave_type_name_khmer?: string; // Khmer name support
  annual_quota: number; // Days per year
  is_paid: boolean;
  leave_type_status: 'active' | 'inactive';
  created_at: Date;
}
```

### Attendance Model

```typescript
interface Attendance {
  _id: ObjectId;
  attendance_id: string; // Unique attendance ID
  employee_id: string; // Reference to Employee
  work_date: string; // YYYY-MM-DD in Cambodia timezone
  check_in_time?: Date; // UTC timestamp
  check_out_time?: Date; // UTC timestamp
  check_in_location_lat?: number; // GPS latitude for check-in
  check_in_location_lng?: number; // GPS longitude for check-in
  check_out_location_lat?: number; // GPS latitude for check-out
  check_out_location_lng?: number; // GPS longitude for check-out
  work_hours?: number; // Total hours worked (calculated)
  attendance_status: 'present' | 'late' | 'absent' | 'half_day';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Payroll Model

```typescript
interface Payroll {
  _id: ObjectId;
  payroll_id: string; // Unique payroll ID
  employee_id: string; // Reference to Employee
  payroll_month: string; // Format: "YYYY-MM"
  base_salary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  overtime_pay: number;
  net_salary: number; // Calculated: base + allowances + bonuses + overtime - deductions
  payment_date?: Date;
  payroll_status: 'draft' | 'approved' | 'paid';
  created_at: Date;
  updated_at: Date;
}
```

### PerformanceEvaluation Model

```typescript
interface PerformanceEvaluation {
  _id: ObjectId;
  evaluation_id: string; // Unique evaluation ID
  employee_id: string; // Reference to Employee
  evaluator_id: string; // Reference to User (manager)
  evaluation_period: {
    start: Date;
    end: Date;
  };
  criteria: {
    name: string;
    description: string;
    score: number; // 1-5 scale
    comments: string;
  }[];
  overall_score: number; // Calculated average
  overall_comments: string;
  goals: {
    description: string;
    achieved: boolean;
  }[];
  development_plan: string;
  evaluation_status: 'draft' | 'completed' | 'acknowledged';
  acknowledged_by?: string; // Reference to Employee
  acknowledged_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Department Model

```typescript
interface Department {
  _id: ObjectId;
  department_id: string; // Unique department ID
  department_code: string; // Unique department code
  department_name: string;
  department_name_khmer?: string; // Khmer name support
  manager_id?: string; // Reference to Employee (department head)
  parent_department_id?: string; // Reference to Department (for hierarchy)
  department_status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}
```

### Position Model

```typescript
interface Position {
  _id: ObjectId;
  position_id: string; // Unique position ID
  position_code: string; // Unique position code
  position_name: string;
  position_name_khmer?: string; // Khmer name support
  department_id: string; // Reference to Department
  position_level?: number; // Organizational level (1 = highest)
  position_status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}
```

## Error Handling

### API Error Responses

All API endpoints will return consistent error responses following this format:

```typescript
interface ErrorResponse {
  success: false;
  message: string; // Human-readable error description
  error: string; // System error message
  details?: any; // Additional error details
  code: string; // Error code (e.g., "AUTH_REQUIRED", "VALIDATION_ERROR")
}
```

Example error response:
```json
{
  "success": false,
  "message": "Employee not found",
  "error": "No employee exists with the provided ID",
  "details": {
    "employee_id": "EMP001"
  },
  "code": "NOT_FOUND"
}
```

### Error Codes

- `AUTH_REQUIRED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Input validation failed
- `CONFLICT` (409): Resource conflict (e.g., duplicate email)
- `SERVER_ERROR` (500): Internal server error
- `DATABASE_ERROR` (500): Database operation failed

### Frontend Error Handling

- Use Ant Design `message` and `notification` components for user feedback
- Implement error boundaries for component-level error catching
- Display user-friendly error messages
- Log errors to console in development mode
- Implement retry logic for failed API calls

### Validation

- Use Zod schemas for request validation
- Validate on both client and server side
- Display field-level validation errors in forms
- Implement custom validation rules for business logic

## Testing Strategy

### Unit Testing

**Tools**: Jest, React Testing Library

**Coverage**:
- Service layer functions (business logic)
- Utility functions
- Custom hooks
- Form validation logic
- Data transformation functions

**Example Test Cases**:
- `calculateNetSalary()` correctly computes net salary
- `validateLeaveRequest()` rejects overlapping leave dates
- `calculateWorkHours()` correctly computes hours from check-in/out times

### Integration Testing

**Tools**: Jest, Supertest (for API testing)

**Coverage**:
- API route handlers
- Database operations
- Authentication flows
- End-to-end user workflows

**Example Test Cases**:
- POST `/api/employees` creates employee and returns correct response
- Leave approval updates leave balance correctly
- Payroll generation calculates all fields accurately

### Component Testing

**Tools**: Jest, React Testing Library

**Coverage**:
- Form components (submission, validation)
- List/Table components (rendering, filtering, pagination)
- Modal components (open/close, actions)
- Layout components (navigation, responsive behavior)

**Example Test Cases**:
- `EmployeeForm` displays validation errors
- `LeaveRequestList` filters by status correctly
- `AttendanceCalendar` renders attendance data

### E2E Testing

**Tools**: Playwright or Cypress

**Coverage**:
- Critical user journeys
- Authentication flows
- Multi-step processes

**Example Test Cases**:
- User can log in, submit leave request, and see it in pending status
- Manager can approve leave request and employee sees updated balance
- HR admin can create employee, assign to department, and generate payroll

### Testing Approach

1. Write tests for core business logic first (services)
2. Test API endpoints with various scenarios (success, validation errors, auth errors)
3. Test critical UI components
4. Implement E2E tests for main user flows
5. Aim for 70%+ code coverage on business logic
6. Run tests in CI/CD pipeline before deployment

## Timezone and Localization

### Timezone Handling

All dates and times in the system follow this pattern:

- **Storage**: All timestamps stored in MongoDB as UTC
- **Display**: Convert to Asia/Phnom_Penh timezone (UTC+7) for display
- **Work Date**: Store as string in YYYY-MM-DD format in Cambodia timezone for attendance records
- **Conversion**: Use Day.js with timezone plugin for all conversions

```typescript
// Example: Converting UTC to Cambodia time
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const cambodiaTime = dayjs.utc(utcDate).tz('Asia/Phnom_Penh');
```

### Language Support

The system supports bilingual interface:

- **English**: Default language for all UI elements
- **Khmer (ភាសាខ្មែរ)**: Secondary language for local users
- **Database Fields**: Key entities (employees, departments, positions, leave types) have both English and Khmer name fields
- **UI Implementation**: Use i18n library or Ant Design's ConfigProvider for language switching

### GPS Location Tracking

Attendance check-in/check-out includes GPS coordinates:

- **Purpose**: Verify employees are at designated work locations
- **Fields**: `check_in_location_lat`, `check_in_location_lng`, `check_out_location_lat`, `check_out_location_lng`
- **Implementation**: Use browser Geolocation API to capture coordinates
- **Privacy**: Inform employees about location tracking and obtain consent
- **Validation**: Optional geofencing to validate location within acceptable radius

```typescript
// Example: Capturing GPS location
navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    // Submit with check-in data
  },
  (error) => {
    // Handle error or allow check-in without location
  }
);
```

## Security Considerations

### Authentication & Authorization

- Use NextAuth.js with JWT strategy
- Implement role-based access control (RBAC)
- Protect API routes with middleware
- Session timeout after 30 minutes of inactivity
- Secure password hashing with bcrypt

### Data Protection

- Validate and sanitize all user inputs
- Use Zod schemas for type-safe validation
- Implement CSRF protection
- Use HTTPS in production
- Encrypt sensitive data in database
- Implement rate limiting on API endpoints

### MongoDB Security

- Use connection string from environment variables
- Enable MongoDB authentication
- Implement database-level access controls
- Regular backups
- Use MongoDB Atlas security features (IP whitelist, VPC peering)

## Performance Optimization

### Frontend

- Implement code splitting with Next.js dynamic imports
- Use SWR for efficient data fetching and caching
- Lazy load heavy components (charts, calendars)
- Optimize images with Next.js Image component
- Implement virtual scrolling for large lists
- Use Ant Design's tree-shaking for smaller bundle size

### Backend

- Implement database indexing on frequently queried fields
- Use MongoDB aggregation pipelines for complex queries
- Implement pagination for list endpoints
- Cache frequently accessed data (departments, positions)
- Optimize database queries (select only needed fields)
- Use connection pooling for MongoDB

### Deployment

- Deploy on Vercel or similar platform with edge caching
- Use CDN for static assets
- Enable gzip compression
- Implement proper caching headers
- Monitor performance with analytics tools

## Future Modules (Phase 2)

The following modules are planned for future implementation after the core system is complete:

### Recruitment Module (Priority 6)

Features:
- Job postings management
- Application tracking
- Interview scheduling
- Candidate evaluation
- Hiring workflow

### Training & Development Module (Priority 7)

Features:
- Course management
- Certification tracking
- Training progress monitoring
- Training calendar
- Skills development tracking

These modules will follow the same architectural patterns and naming conventions as the core system.

## Deployment Architecture

### Environment Variables

```
# Database
MONGODB_URI=mongodb+srv://chhinhs_db_user:29kFylpMI5pQ08iV@pedhrmis.9s3kean.mongodb.net/?appName=PEDHRMIS
MONGODB_DB=sangapac_hrmis

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>

# Application
NODE_ENV=production

# Timezone
TZ=Asia/Phnom_Penh
```

### Deployment Steps

1. Set up MongoDB Atlas database with provided credentials
2. Create database indexes for performance
3. Seed initial data (admin user, departments, positions)
4. Deploy Next.js application to Vercel
5. Configure environment variables in Vercel
6. Set up custom domain (optional)
7. Configure monitoring and logging

### Monitoring

- Use Vercel Analytics for performance monitoring
- Implement error tracking (Sentry or similar)
- Set up logging for API requests
- Monitor database performance in MongoDB Atlas
- Set up alerts for critical errors
