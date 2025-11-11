import { LeaveStatus, LeaveTypeStatus } from './index';

export interface LeaveRequest {
  _id: string;
  leave_request_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  leave_status: LeaveStatus;
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveType {
  _id: string;
  leave_type_id: string;
  leave_type_name: string;
  leave_type_name_khmer?: string;
  annual_quota: number;
  is_paid: boolean;
  leave_type_status: LeaveTypeStatus;
  created_at: Date;
}

export interface CreateLeaveRequestInput {
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  reason: string;
}

export interface ApproveLeaveInput {
  approved_by: string;
}

export interface RejectLeaveInput {
  rejection_reason: string;
}

export interface LeaveBalance {
  _id: string;
  leave_balance_id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_allocated: number;
  used_days: number;
  remaining_days: number;
  created_at: Date;
  updated_at: Date;
}
