import { nanoid } from 'nanoid';
import LeaveRequest, { ILeaveRequest } from '@/models/LeaveRequest';
import LeaveBalance, { ILeaveBalance } from '@/models/LeaveBalance';
import LeaveType from '@/models/LeaveType';
import Employee from '@/models/Employee';
import { CreateLeaveRequestInput, ApproveLeaveInput, RejectLeaveInput } from '@/types/leave';
import { LeaveStatus } from '@/types';

/**
 * Calculate the number of days between two dates (inclusive)
 */
export function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time to start of day for accurate calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  
  return diffDays;
}

/**
 * Check if two date ranges overlap
 */
export function checkDateOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Validate that leave request doesn't overlap with existing approved leaves
 */
export async function validateLeaveOverlap(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeRequestId?: string
): Promise<{ valid: boolean; message?: string }> {
  const query: any = {
    employee_id: employeeId,
    leave_status: { $in: ['pending', 'approved'] },
    $or: [
      {
        start_date: { $lte: endDate },
        end_date: { $gte: startDate },
      },
    ],
  };

  // Exclude current request when updating
  if (excludeRequestId) {
    query.leave_request_id = { $ne: excludeRequestId };
  }

  const overlappingLeaves = await LeaveRequest.find(query);

  if (overlappingLeaves.length > 0) {
    return {
      valid: false,
      message: 'Leave request overlaps with existing leave request',
    };
  }

  return { valid: true };
}

/**
 * Get or create leave balance for employee
 */
export async function getOrCreateLeaveBalance(
  employeeId: string,
  leaveTypeId: string,
  year: number
): Promise<ILeaveBalance> {
  let balance = await LeaveBalance.findOne({
    employee_id: employeeId,
    leave_type_id: leaveTypeId,
    year,
  });

  if (!balance) {
    // Get leave type to determine annual quota
    const leaveType = await LeaveType.findOne({ leave_type_id: leaveTypeId });
    if (!leaveType) {
      throw new Error('Leave type not found');
    }

    // Create new balance
    balance = await LeaveBalance.create({
      leave_balance_id: `LB-${nanoid(10)}`,
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year,
      total_allocated: leaveType.annual_quota,
      used_days: 0,
      remaining_days: leaveType.annual_quota,
    });
  }

  return balance;
}

/**
 * Get leave balances for an employee
 */
export async function getEmployeeLeaveBalances(
  employeeId: string,
  year?: number
): Promise<ILeaveBalance[]> {
  const currentYear = year || new Date().getFullYear();
  
  const balances = await LeaveBalance.find({
    employee_id: employeeId,
    year: currentYear,
  });

  return balances;
}

/**
 * Create a new leave request
 */
export async function createLeaveRequest(
  input: CreateLeaveRequestInput
): Promise<ILeaveRequest> {
  const { employee_id, leave_type_id, start_date, end_date, reason } = input;

  // Validate employee exists
  const employee = await Employee.findOne({ employee_id, deleted_at: null });
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Validate leave type exists
  const leaveType = await LeaveType.findOne({ 
    leave_type_id,
    leave_type_status: 'active'
  });
  if (!leaveType) {
    throw new Error('Leave type not found or inactive');
  }

  // Validate dates
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  
  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  // Check for overlapping leaves
  const overlapCheck = await validateLeaveOverlap(employee_id, startDate, endDate);
  if (!overlapCheck.valid) {
    throw new Error(overlapCheck.message);
  }

  // Calculate total days
  const totalDays = calculateLeaveDays(startDate, endDate);

  // Check leave balance
  const year = startDate.getFullYear();
  const balance = await getOrCreateLeaveBalance(employee_id, leave_type_id, year);
  
  if (balance.remaining_days < totalDays) {
    throw new Error(`Insufficient leave balance. Available: ${balance.remaining_days} days, Requested: ${totalDays} days`);
  }

  // Create leave request
  const leaveRequest = await LeaveRequest.create({
    leave_request_id: `LR-${nanoid(10)}`,
    employee_id,
    leave_type_id,
    start_date: startDate,
    end_date: endDate,
    total_days: totalDays,
    reason,
    leave_status: 'pending',
  });

  return leaveRequest;
}

/**
 * Get leave requests with filters
 */
export async function getLeaveRequests(filters: {
  employee_id?: string;
  leave_status?: LeaveStatus;
  start_date?: Date;
  end_date?: Date;
}): Promise<ILeaveRequest[]> {
  const query: any = {};

  if (filters.employee_id) {
    query.employee_id = filters.employee_id;
  }

  if (filters.leave_status) {
    query.leave_status = filters.leave_status;
  }

  if (filters.start_date || filters.end_date) {
    query.$or = [];
    if (filters.start_date && filters.end_date) {
      query.$or.push({
        start_date: { $lte: filters.end_date },
        end_date: { $gte: filters.start_date },
      });
    } else if (filters.start_date) {
      query.start_date = { $gte: filters.start_date };
    } else if (filters.end_date) {
      query.end_date = { $lte: filters.end_date };
    }
  }

  const leaveRequests = await LeaveRequest.find(query).sort({ created_at: -1 });
  return leaveRequests;
}

/**
 * Get a single leave request by ID
 */
export async function getLeaveRequestById(
  leaveRequestId: string
): Promise<ILeaveRequest | null> {
  return await LeaveRequest.findOne({ leave_request_id: leaveRequestId });
}

/**
 * Approve a leave request
 */
export async function approveLeaveRequest(
  leaveRequestId: string,
  input: ApproveLeaveInput
): Promise<ILeaveRequest> {
  const leaveRequest = await LeaveRequest.findOne({ leave_request_id: leaveRequestId });
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  if (leaveRequest.leave_status !== 'pending') {
    throw new Error('Only pending leave requests can be approved');
  }

  // Update leave balance
  const year = leaveRequest.start_date.getFullYear();
  await LeaveBalance.findOneAndUpdate(
    {
      employee_id: leaveRequest.employee_id,
      leave_type_id: leaveRequest.leave_type_id,
      year,
    },
    {
      $inc: {
        used_days: leaveRequest.total_days,
        remaining_days: -leaveRequest.total_days,
      },
    }
  );

  // Update leave request
  const updatedRequest = await LeaveRequest.findOneAndUpdate(
    { leave_request_id: leaveRequestId },
    {
      leave_status: 'approved',
      approved_by: input.approved_by,
      approved_at: new Date(),
    },
    { new: true }
  );

  if (!updatedRequest) {
    throw new Error('Failed to update leave request');
  }

  return updatedRequest;
}

/**
 * Reject a leave request
 */
export async function rejectLeaveRequest(
  leaveRequestId: string,
  input: RejectLeaveInput
): Promise<ILeaveRequest> {
  const leaveRequest = await LeaveRequest.findOne({ leave_request_id: leaveRequestId });
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  if (leaveRequest.leave_status !== 'pending') {
    throw new Error('Only pending leave requests can be rejected');
  }

  // Update leave request
  const updatedRequest = await LeaveRequest.findOneAndUpdate(
    { leave_request_id: leaveRequestId },
    {
      leave_status: 'rejected',
      rejection_reason: input.rejection_reason,
    },
    { new: true }
  );

  if (!updatedRequest) {
    throw new Error('Failed to update leave request');
  }

  return updatedRequest;
}

/**
 * Cancel a leave request (by employee)
 */
export async function cancelLeaveRequest(
  leaveRequestId: string,
  employeeId: string
): Promise<ILeaveRequest> {
  const leaveRequest = await LeaveRequest.findOne({ 
    leave_request_id: leaveRequestId,
    employee_id: employeeId
  });
  
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  if (leaveRequest.leave_status === 'cancelled') {
    throw new Error('Leave request is already cancelled');
  }

  // If approved, restore the balance
  if (leaveRequest.leave_status === 'approved') {
    const year = leaveRequest.start_date.getFullYear();
    await LeaveBalance.findOneAndUpdate(
      {
        employee_id: leaveRequest.employee_id,
        leave_type_id: leaveRequest.leave_type_id,
        year,
      },
      {
        $inc: {
          used_days: -leaveRequest.total_days,
          remaining_days: leaveRequest.total_days,
        },
      }
    );
  }

  // Update leave request
  const updatedRequest = await LeaveRequest.findOneAndUpdate(
    { leave_request_id: leaveRequestId, employee_id: employeeId },
    {
      leave_status: 'cancelled',
    },
    { new: true }
  );

  if (!updatedRequest) {
    throw new Error('Failed to cancel leave request');
  }

  return updatedRequest;
}
