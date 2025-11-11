// Central export for all Mongoose models
export { default as User } from './User';
export { default as Employee } from './Employee';
export { default as Department } from './Department';
export { default as Position } from './Position';
export { default as LeaveType } from './LeaveType';
export { default as LeaveRequest } from './LeaveRequest';
export { default as LeaveBalance } from './LeaveBalance';
export { default as Attendance } from './Attendance';
export { default as Payroll } from './Payroll';
export { default as PerformanceEvaluation } from './PerformanceEvaluation';

// Export interfaces
export type { IUser } from './User';
export type { IEmployee } from './Employee';
export type { IDepartment } from './Department';
export type { IPosition } from './Position';
export type { ILeaveType } from './LeaveType';
export type { ILeaveRequest } from './LeaveRequest';
export type { ILeaveBalance } from './LeaveBalance';
