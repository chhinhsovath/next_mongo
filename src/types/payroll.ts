export interface Payroll {
  _id: string;
  payroll_id: string;
  employee_id: string;
  payroll_month: string; // Format: "YYYY-MM"
  base_salary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  overtime_pay: number;
  net_salary: number;
  payment_date?: string;
  payroll_status: 'draft' | 'approved' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface PayrollWithEmployee extends Payroll {
  employee: {
    employee_code: string;
    first_name: string;
    last_name: string;
    first_name_khmer?: string;
    last_name_khmer?: string;
    department_id: string;
    position_id: string;
  };
}

export interface CreatePayrollRequest {
  employee_id: string;
  payroll_month: string;
  base_salary: number;
  allowances?: number;
  bonuses?: number;
  deductions?: number;
  overtime_pay?: number;
}

export interface UpdatePayrollRequest {
  base_salary?: number;
  allowances?: number;
  bonuses?: number;
  deductions?: number;
  overtime_pay?: number;
  payment_date?: string;
  payroll_status?: 'draft' | 'approved' | 'paid';
}

export interface GeneratePayrollRequest {
  payroll_month: string;
  employee_ids?: string[];
}

export interface PayrollSummary {
  total_employees: number;
  total_base_salary: number;
  total_allowances: number;
  total_bonuses: number;
  total_deductions: number;
  total_overtime_pay: number;
  total_net_salary: number;
  by_department?: {
    department_id: string;
    department_name: string;
    employee_count: number;
    total_net_salary: number;
  }[];
}
