# Implementation Plan

- [x] 1. Set up project foundation and configuration
  - Initialize Next.js 14 project with TypeScript and App Router
  - Install and configure dependencies (Ant Design 5, Mongoose 8, NextAuth 4, Zod, SWR, Day.js with timezone plugin, Recharts)
  - Set up environment variables for MongoDB connection (use provided connection string)
  - Configure snake_case naming convention for all database fields and API parameters
  - Configure timezone handling (UTC storage, Asia/Phnom_Penh display)
  - Configure TypeScript, ESLint, and Prettier
  - Create directory structure as per design document
  - Set up bilingual support structure (English and Khmer)
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Implement database connection and core models
  - Create MongoDB connection utility with connection pooling using provided credentials
  - Implement User model with snake_case fields (user_id, employee_id, username, password_hash, user_role, user_status, last_login_at)
  - Implement Employee model with snake_case fields including Khmer name fields (first_name_khmer, last_name_khmer)
  - Implement Department model with snake_case fields and Khmer name support (department_name_khmer)
  - Implement Position model with snake_case fields and Khmer name support (position_name_khmer)
  - Implement LeaveType model with snake_case fields and Khmer name support
  - Add soft delete support (deleted_at field) to Employee model
  - Create database indexes for performance optimization (employee_code, email, department_id, position_id)
  - _Requirements: 1.5, 7.5, 8.2_

- [x] 3. Set up authentication system
  - Configure NextAuth.js with credentials provider
  - Implement JWT strategy for session management
  - Create login API route with credential validation
  - Create login page with Ant Design form components
  - Implement authentication middleware for protected routes
  - Create AuthContext for managing authentication state
  - Implement role-based access control helpers
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. Build dashboard layout and navigation
  - Create DashboardLayout component with Ant Design Layout
  - Implement Sidebar component with navigation menu
  - Implement Header component with user menu and logout
  - Create responsive navigation for mobile devices
  - Implement route protection for dashboard routes
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 5. Implement employee management module
  - Create Employee API routes (GET, POST, PUT, DELETE)
  - Implement employee service layer with business logic
  - Create EmployeeList component with Ant Design Table
  - Implement search and filter functionality for employees
  - Create EmployeeForm component for add/edit operations
  - Implement form validation with Zod schemas
  - Create employee detail page with tabs
  - Implement employee CRUD operations with error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 5.1 Write unit tests for employee service functions
  - Test employee creation validation
  - Test employee update logic
  - Test employee search and filter functions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 6. Implement leave management module
  - Create LeaveRequest model with snake_case fields (leave_request_id, employee_id, leave_type_id, start_date, end_date, total_days, leave_status, approved_by, approved_at, rejection_reason)
  - Create leave API routes following the endpoint structure (/api/leaves/request, /api/leaves/[employee_id], /api/leaves/[leave_request_id]/approve, /api/leaves/[leave_request_id]/reject)
  - Implement leave service with overlap validation
  - Create LeaveRequestForm component for employees with leave type selector
  - Implement leave balance calculation logic based on leave types
  - Create LeaveRequestList component with status filters (pending, approved, rejected, cancelled)
  - Create leave approval interface for managers
  - Implement leave approval/rejection with balance updates
  - Add notification system for leave status changes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6.1 Write unit tests for leave service
  - Test leave overlap validation
  - Test leave balance calculation
  - Test approval/rejection logic
  - _Requirements: 2.2, 2.5, 3.4, 3.5_

- [x] 7. Implement attendance tracking module
  - Create Attendance model with snake_case fields including GPS location fields (attendance_id, employee_id, work_date, check_in_time, check_out_time, check_in_location_lat, check_in_location_lng, check_out_location_lat, check_out_location_lng, work_hours, attendance_status)
  - Create attendance API routes (/api/attendance/check-in, /api/attendance/check-out, /api/attendance/[employee_id])
  - Implement GPS location capture using browser Geolocation API for check-in/check-out
  - Implement attendance service with work hours calculation
  - Store work_date as YYYY-MM-DD string in Cambodia timezone, timestamps in UTC
  - Create AttendanceForm component for check-in/check-out with GPS capture
  - Create AttendanceCalendar component with Ant Design Calendar
  - Implement color-coded attendance status display (present, late, absent, half_day)
  - Create attendance report generation functionality
  - Implement absence detection for scheduled work days
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 7.1 Write unit tests for attendance calculations
  - Test work hours calculation
  - Test absence detection logic
  - _Requirements: 4.2, 4.5_

- [x] 8. Implement payroll processing module
  - Create Payroll model with snake_case fields (payroll_id, employee_id, payroll_month, base_salary, allowances, bonuses, deductions, overtime_pay, net_salary, payment_date, payroll_status)
  - Create payroll API routes (/api/payroll, /api/payroll/[employee_id], /api/payroll/[payroll_id]/approve)
  - Implement payroll service with salary calculations
  - Create net salary calculation logic (base_salary + allowances + bonuses + overtime_pay - deductions)
  - Store payroll_month as YYYY-MM format string
  - Create PayrollTable component with Ant Design Table
  - Create PayslipView component with detailed breakdown showing all components
  - Implement payroll report generation
  - Add export functionality for payroll data
  - Support payroll status workflow (draft, approved, paid)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8.1 Write unit tests for payroll calculations
  - Test gross salary calculation
  - Test deductions calculation
  - Test net salary calculation
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Implement performance evaluation module
  - Create PerformanceEvaluation model with Mongoose schema
  - Create performance API routes for CRUD operations
  - Implement performance service with score calculations
  - Create EvaluationForm component with multiple criteria
  - Implement overall score calculation from criteria scores
  - Create PerformanceChart component for visualization
  - Create performance history view for employees
  - Implement evaluation acknowledgment workflow
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9.1 Write unit tests for performance calculations
  - Test overall score calculation
  - Test performance trend analysis
  - _Requirements: 6.3_

- [x] 10. Implement organizational structure management
  - Create department API routes for CRUD operations
  - Create position API routes for CRUD operations
  - Implement department service with hierarchy logic
  - Create DepartmentManager page with tree view
  - Create PositionManager page with department linking
  - Implement organizational chart visualization
  - Add referential integrity validation for assignments
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Implement employee dashboard
  - Create dashboard page with personalized widgets
  - Implement profile summary widget
  - Create leave balance summary widget
  - Create recent attendance widget
  - Create pending requests widget
  - Implement quick action buttons
  - Add announcements section
  - Implement real-time data updates with SWR
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 12. Implement reporting module
  - Create reports API routes for different report types
  - Implement report service with data aggregation
  - Create employee headcount report by department and position
  - Create leave utilization report with balance tracking
  - Create attendance summary report with rates and absences
  - Create payroll summary report by department and cycle
  - Create ReportGenerator component with filters
  - Implement PDF export functionality
  - Implement Excel export functionality
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12.1 Write integration tests for report generation
  - Test headcount report accuracy
  - Test leave utilization calculations
  - Test attendance summary calculations
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 13. Implement data validation and error handling
  - Create Zod schemas for all data models with snake_case field names
  - Implement API middleware for request validation
  - Create consistent error response format matching specification (success: false, message, error, details, code)
  - Implement error boundaries in React components
  - Add user-friendly error messages with Ant Design notifications
  - Implement retry logic for failed API calls
  - Add logging for errors and API requests
  - Support bilingual error messages (English and Khmer)
  - _Requirements: 1.5, 2.2, 7.5_

- [x] 14. Implement security features
  - Add CSRF protection to forms
  - Implement rate limiting on API endpoints
  - Add input sanitization for all user inputs
  - Implement session timeout after 30 minutes
  - Add password strength validation
  - Implement secure password reset flow
  - Add audit logging for sensitive operations
  - _Requirements: 8.2, 8.3, 8.5_

- [x] 15. Optimize performance
  - Implement code splitting for heavy components
  - Add lazy loading for charts and calendars
  - Implement virtual scrolling for large employee lists
  - Add pagination to all list endpoints
  - Optimize MongoDB queries with proper indexing
  - Implement caching for departments and positions
  - Add image optimization for employee photos
  - _Requirements: 1.4, 4.4, 10.1, 10.2, 10.3, 10.4_

- [x] 16. Create initial data seeding
  - Create database seeding script with snake_case field names
  - Seed admin user account with default credentials
  - Seed sample departments with both English and Khmer names
  - Seed sample positions with both English and Khmer names
  - Seed sample employees for testing with Khmer name fields
  - Seed leave types with Khmer names (annual leave, sick leave, personal leave, etc.)
  - Set up initial leave balances for employees
  - _Requirements: 1.1, 7.1, 7.2, 8.1_

- [x] 17. Final integration and polish
  - Test all user workflows end-to-end
  - Fix any integration issues between modules
  - Ensure consistent UI/UX across all pages
  - Verify all requirements are implemented
  - Add loading states to all async operations
  - Implement proper empty states for lists
  - Add confirmation dialogs for destructive actions
  - Verify responsive design on mobile devices
  - _Requirements: All_
