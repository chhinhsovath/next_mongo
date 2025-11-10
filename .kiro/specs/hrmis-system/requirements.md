# Requirements Document

## Introduction

The Human Resources Management Information System (HRMIS) for Sangapac Company is a comprehensive web-based application designed to streamline and automate HR operations. The system will manage employee information, attendance tracking, leave management, payroll processing, performance evaluations, and organizational structure. Built with Next.js, React, Ant Design, and MongoDB, the HRMIS will provide a modern, responsive interface for HR staff and employees to efficiently handle all human resources activities.

## Glossary

- **HRMIS**: The Human Resources Management Information System being developed for Sangapac Company
- **Employee**: A person employed by Sangapac Company whose information is managed in the HRMIS
- **HR Administrator**: A user with full administrative privileges to manage all aspects of the HRMIS
- **Manager**: A user who supervises employees and has authority to approve leave requests and conduct performance evaluations
- **Employee User**: A regular employee user who can view their own information and submit requests
- **Leave Request**: A formal request submitted by an Employee for time off from work
- **Attendance Record**: A record of an Employee's work hours, check-in, and check-out times
- **Payroll Cycle**: A recurring period for which employee compensation is calculated and processed
- **Performance Evaluation**: A formal assessment of an Employee's work performance
- **Department**: An organizational unit within Sangapac Company
- **Position**: A job role or title held by an Employee
- **Authentication System**: The security mechanism that verifies user identity and manages access

## Requirements

### Requirement 1

**User Story:** As an HR Administrator, I want to manage employee records in a centralized system, so that I can maintain accurate and up-to-date information about all company employees.

#### Acceptance Criteria

1. THE HRMIS SHALL provide a user interface to create new Employee records with personal information, contact details, emergency contacts, position, department, and employment start date
2. THE HRMIS SHALL provide a user interface to update existing Employee records with modified information
3. THE HRMIS SHALL provide a user interface to view Employee records with all associated information displayed in a structured format
4. THE HRMIS SHALL provide a search functionality to locate Employee records by name, employee ID, department, or position
5. THE HRMIS SHALL store all Employee records in the MongoDB database with proper data validation

### Requirement 2

**User Story:** As an Employee User, I want to submit leave requests through the system, so that I can formally request time off and track the approval status.

#### Acceptance Criteria

1. WHEN an Employee User submits a leave request, THE HRMIS SHALL capture the leave type, start date, end date, reason, and automatically set the status to pending
2. THE HRMIS SHALL validate that the requested leave dates do not overlap with existing approved leave for the same Employee
3. THE HRMIS SHALL display all leave requests submitted by the Employee User with their current approval status
4. WHEN a Manager approves or rejects a leave request, THE HRMIS SHALL update the request status and notify the requesting Employee
5. THE HRMIS SHALL calculate and display the remaining leave balance for each leave type for the Employee User

### Requirement 3

**User Story:** As a Manager, I want to review and approve leave requests from my team members, so that I can manage team availability and workload effectively.

#### Acceptance Criteria

1. THE HRMIS SHALL display all pending leave requests for Employees reporting to the Manager
2. WHEN a Manager selects a leave request, THE HRMIS SHALL display the full request details including Employee information, leave type, dates, and reason
3. THE HRMIS SHALL provide action buttons for the Manager to approve or reject the leave request with optional comments
4. WHEN a Manager approves a leave request, THE HRMIS SHALL update the request status to approved and deduct the leave days from the Employee's leave balance
5. WHEN a Manager rejects a leave request, THE HRMIS SHALL update the request status to rejected and retain the Employee's leave balance

### Requirement 4

**User Story:** As an HR Administrator, I want to track employee attendance with location verification, so that I can monitor work hours and ensure employees are at designated work locations.

#### Acceptance Criteria

1. THE HRMIS SHALL provide a user interface for recording Employee check-in and check-out times with GPS coordinates
2. WHEN an Employee checks in or checks out, THE HRMIS SHALL capture the GPS location coordinates if available
3. THE HRMIS SHALL calculate total work hours for each Attendance Record based on check-in and check-out times
4. THE HRMIS SHALL display attendance records in a calendar view showing daily attendance status for each Employee
5. THE HRMIS SHALL generate attendance reports for specified date ranges showing total work hours, late arrivals, and absences
6. WHEN an Employee has no Attendance Record for a scheduled work day, THE HRMIS SHALL mark the day as absent

### Requirement 5

**User Story:** As an HR Administrator, I want to process payroll for employees, so that I can ensure accurate and timely compensation.

#### Acceptance Criteria

1. THE HRMIS SHALL calculate gross salary for each Employee based on their base salary, allowances, and worked hours for the Payroll Cycle
2. THE HRMIS SHALL calculate deductions including taxes, insurance, and other withholdings based on configured rates
3. THE HRMIS SHALL calculate net salary by subtracting total deductions from gross salary
4. THE HRMIS SHALL generate payroll reports for each Payroll Cycle showing detailed salary breakdown for all Employees
5. THE HRMIS SHALL store payroll records in the MongoDB database with audit trail information

### Requirement 6

**User Story:** As a Manager, I want to conduct performance evaluations for my team members, so that I can provide feedback and support employee development.

#### Acceptance Criteria

1. THE HRMIS SHALL provide a user interface for Managers to create Performance Evaluations with evaluation period, rating criteria, scores, and comments
2. THE HRMIS SHALL allow Managers to rate Employees on multiple criteria with numerical scores and qualitative feedback
3. THE HRMIS SHALL calculate an overall performance score based on individual criterion scores
4. THE HRMIS SHALL store Performance Evaluations in the MongoDB database linked to the evaluated Employee
5. THE HRMIS SHALL display performance history for each Employee showing all past evaluations with trends

### Requirement 7

**User Story:** As an HR Administrator, I want to manage the organizational structure, so that I can maintain accurate department and reporting relationships.

#### Acceptance Criteria

1. THE HRMIS SHALL provide a user interface to create and manage Departments with department name, description, and department head
2. THE HRMIS SHALL provide a user interface to create and manage Positions with position title, description, and department assignment
3. THE HRMIS SHALL allow assignment of Employees to Departments and Positions
4. THE HRMIS SHALL display an organizational chart showing the hierarchical structure of Departments and reporting relationships
5. THE HRMIS SHALL enforce referential integrity ensuring Employees cannot be assigned to non-existent Departments or Positions

### Requirement 8

**User Story:** As a user of the system, I want to securely log in with my credentials, so that I can access features appropriate to my role.

#### Acceptance Criteria

1. THE HRMIS SHALL provide a login interface requiring username and password
2. WHEN a user submits valid credentials, THE Authentication System SHALL verify the credentials against stored user records and grant access
3. WHEN a user submits invalid credentials, THE Authentication System SHALL reject the login attempt and display an error message
4. THE HRMIS SHALL assign role-based permissions determining which features each user can access based on their role
5. WHEN a user session expires after 30 minutes of inactivity, THE HRMIS SHALL automatically log out the user and redirect to the login page

### Requirement 9

**User Story:** As an Employee User, I want to view my personal dashboard, so that I can quickly access my information and pending tasks.

#### Acceptance Criteria

1. THE HRMIS SHALL display a personalized dashboard showing the Employee's profile summary, upcoming leave, recent attendance, and pending requests
2. THE HRMIS SHALL display leave balance summary showing remaining days for each leave type
3. THE HRMIS SHALL display upcoming company announcements and important dates
4. THE HRMIS SHALL provide quick action buttons for common tasks such as submitting leave requests and viewing payslips
5. THE HRMIS SHALL update dashboard information in real-time when underlying data changes

### Requirement 10

**User Story:** As an HR Administrator, I want to generate various HR reports, so that I can analyze workforce data and support decision-making.

#### Acceptance Criteria

1. THE HRMIS SHALL generate employee headcount reports showing total Employees by Department, Position, and employment status
2. THE HRMIS SHALL generate leave utilization reports showing leave taken and remaining balance by Employee and leave type
3. THE HRMIS SHALL generate attendance summary reports showing attendance rates, late arrivals, and absences for specified periods
4. THE HRMIS SHALL generate payroll summary reports showing total compensation costs by Department and Payroll Cycle
5. THE HRMIS SHALL allow export of all reports in PDF and Excel formats
