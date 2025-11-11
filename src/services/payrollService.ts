import mongoose from 'mongoose';
import Payroll from '@/models/Payroll';
import Employee from '@/models/Employee';
import { CreatePayrollRequest, UpdatePayrollRequest, PayrollSummary } from '@/types/payroll';

/**
 * Calculate net salary
 * Formula: base_salary + allowances + bonuses + overtime_pay - deductions
 */
export function calculateNetSalary(
  base_salary: number,
  allowances: number = 0,
  bonuses: number = 0,
  overtime_pay: number = 0,
  deductions: number = 0
): number {
  return base_salary + allowances + bonuses + overtime_pay - deductions;
}

/**
 * Generate unique payroll ID
 */
function generatePayrollId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `PAY-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate payroll month format (YYYY-MM)
 */
export function validatePayrollMonth(payroll_month: string): boolean {
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return regex.test(payroll_month);
}

/**
 * Create a payroll record
 */
export async function createPayroll(data: CreatePayrollRequest) {
  // Validate payroll month format
  if (!validatePayrollMonth(data.payroll_month)) {
    throw new Error('Invalid payroll_month format. Expected YYYY-MM');
  }

  // Check if employee exists
  const employee = await Employee.findById(data.employee_id);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Check if payroll already exists for this employee and month
  const existingPayroll = await Payroll.findOne({
    employee_id: data.employee_id,
    payroll_month: data.payroll_month,
  });

  if (existingPayroll) {
    throw new Error('Payroll already exists for this employee and month');
  }

  // Calculate net salary
  const net_salary = calculateNetSalary(
    data.base_salary,
    data.allowances || 0,
    data.bonuses || 0,
    data.overtime_pay || 0,
    data.deductions || 0
  );

  // Create payroll
  const payroll = await Payroll.create({
    payroll_id: generatePayrollId(),
    employee_id: data.employee_id,
    payroll_month: data.payroll_month,
    base_salary: data.base_salary,
    allowances: data.allowances || 0,
    bonuses: data.bonuses || 0,
    deductions: data.deductions || 0,
    overtime_pay: data.overtime_pay || 0,
    net_salary,
    payroll_status: 'draft',
  });

  return payroll;
}

/**
 * Get payroll records with filters
 */
export async function getPayrolls(filters: {
  employee_id?: string;
  payroll_month?: string;
  payroll_status?: string;
  page?: number;
  limit?: number;
}) {
  const query: any = {};

  if (filters.employee_id) {
    query.employee_id = filters.employee_id;
  }

  if (filters.payroll_month) {
    query.payroll_month = filters.payroll_month;
  }

  if (filters.payroll_status) {
    query.payroll_status = filters.payroll_status;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const [payrolls, total] = await Promise.all([
    Payroll.find(query)
      .populate('employee_id', 'employee_code first_name last_name first_name_khmer last_name_khmer department_id position_id')
      .sort({ payroll_month: -1, created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payroll.countDocuments(query),
  ]);

  return {
    payrolls,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get payroll by ID
 */
export async function getPayrollById(payroll_id: string) {
  const payroll = await Payroll.findOne({ payroll_id })
    .populate('employee_id', 'employee_code first_name last_name first_name_khmer last_name_khmer department_id position_id email')
    .lean();

  if (!payroll) {
    throw new Error('Payroll not found');
  }

  return payroll;
}

/**
 * Update payroll record
 */
export async function updatePayroll(payroll_id: string, data: UpdatePayrollRequest) {
  const payroll = await Payroll.findOne({ payroll_id });

  if (!payroll) {
    throw new Error('Payroll not found');
  }

  // Don't allow updates if payroll is paid
  if (payroll.payroll_status === 'paid') {
    throw new Error('Cannot update paid payroll');
  }

  // Update fields
  if (data.base_salary !== undefined) payroll.base_salary = data.base_salary;
  if (data.allowances !== undefined) payroll.allowances = data.allowances;
  if (data.bonuses !== undefined) payroll.bonuses = data.bonuses;
  if (data.deductions !== undefined) payroll.deductions = data.deductions;
  if (data.overtime_pay !== undefined) payroll.overtime_pay = data.overtime_pay;
  if (data.payment_date !== undefined) payroll.payment_date = new Date(data.payment_date);
  if (data.payroll_status !== undefined) payroll.payroll_status = data.payroll_status;

  // Net salary will be recalculated by pre-save hook
  await payroll.save();

  return payroll;
}

/**
 * Approve payroll
 */
export async function approvePayroll(payroll_id: string) {
  const payroll = await Payroll.findOne({ payroll_id });

  if (!payroll) {
    throw new Error('Payroll not found');
  }

  if (payroll.payroll_status === 'paid') {
    throw new Error('Payroll is already paid');
  }

  payroll.payroll_status = 'approved';
  await payroll.save();

  return payroll;
}

/**
 * Generate payroll for multiple employees
 */
export async function generatePayroll(payroll_month: string, employee_ids?: string[]) {
  // Validate payroll month format
  if (!validatePayrollMonth(payroll_month)) {
    throw new Error('Invalid payroll_month format. Expected YYYY-MM');
  }

  // Get employees
  const query: any = { employee_status: 'active' };
  if (employee_ids && employee_ids.length > 0) {
    query._id = { $in: employee_ids };
  }

  const employees = await Employee.find(query).lean();

  if (employees.length === 0) {
    throw new Error('No active employees found');
  }

  const results = {
    created: [] as any[],
    skipped: [] as any[],
    errors: [] as any[],
  };

  // Generate payroll for each employee
  for (const employee of employees) {
    try {
      // Check if payroll already exists
      const existingPayroll = await Payroll.findOne({
        employee_id: employee._id,
        payroll_month,
      });

      if (existingPayroll) {
        results.skipped.push({
          employee_id: employee._id.toString(),
          employee_code: employee.employee_code,
          reason: 'Payroll already exists',
        });
        continue;
      }

      // Create payroll with base salary from employee
      const payroll = await createPayroll({
        employee_id: employee._id.toString(),
        payroll_month,
        base_salary: employee.salary_amount,
        allowances: 0,
        bonuses: 0,
        deductions: 0,
        overtime_pay: 0,
      });

      results.created.push({
        payroll_id: payroll.payroll_id,
        employee_id: employee._id.toString(),
        employee_code: employee.employee_code,
      });
    } catch (error: any) {
      results.errors.push({
        employee_id: employee._id.toString(),
        employee_code: employee.employee_code,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Get payroll summary for a month
 */
export async function getPayrollSummary(payroll_month: string): Promise<PayrollSummary> {
  const payrolls = await Payroll.find({ payroll_month })
    .populate('employee_id', 'department_id')
    .lean();

  const summary: PayrollSummary = {
    total_employees: payrolls.length,
    total_base_salary: 0,
    total_allowances: 0,
    total_bonuses: 0,
    total_deductions: 0,
    total_overtime_pay: 0,
    total_net_salary: 0,
  };

  payrolls.forEach((payroll) => {
    summary.total_base_salary += payroll.base_salary;
    summary.total_allowances += payroll.allowances;
    summary.total_bonuses += payroll.bonuses;
    summary.total_deductions += payroll.deductions;
    summary.total_overtime_pay += payroll.overtime_pay;
    summary.total_net_salary += payroll.net_salary;
  });

  return summary;
}

/**
 * Delete payroll (only if draft)
 */
export async function deletePayroll(payroll_id: string) {
  const payroll = await Payroll.findOne({ payroll_id });

  if (!payroll) {
    throw new Error('Payroll not found');
  }

  if (payroll.payroll_status !== 'draft') {
    throw new Error('Can only delete draft payroll');
  }

  await Payroll.deleteOne({ payroll_id });

  return { success: true };
}
