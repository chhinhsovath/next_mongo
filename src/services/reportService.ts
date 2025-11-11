import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import LeaveRequest from '@/models/LeaveRequest';
import LeaveBalance from '@/models/LeaveBalance';
import Attendance from '@/models/Attendance';
import Payroll from '@/models/Payroll';
import Department from '@/models/Department';
import Position from '@/models/Position';
import LeaveType from '@/models/LeaveType';

export interface HeadcountReportData {
  total_employees: number;
  by_department: {
    department_id: string;
    department_name: string;
    department_name_khmer?: string;
    employee_count: number;
  }[];
  by_position: {
    position_id: string;
    position_name: string;
    position_name_khmer?: string;
    employee_count: number;
  }[];
  by_status: {
    employee_status: string;
    employee_count: number;
  }[];
  by_type: {
    employee_type: string;
    employee_count: number;
  }[];
}

export interface LeaveUtilizationReportData {
  by_employee: {
    employee_id: string;
    employee_code: string;
    employee_name: string;
    leave_type: string;
    total_quota: number;
    used_days: number;
    remaining_days: number;
    utilization_rate: number;
  }[];
  by_leave_type: {
    leave_type_id: string;
    leave_type_name: string;
    total_requests: number;
    approved_requests: number;
    total_days_taken: number;
    average_days_per_request: number;
  }[];
  summary: {
    total_leave_requests: number;
    approved_requests: number;
    pending_requests: number;
    rejected_requests: number;
  };
}

export interface AttendanceSummaryReportData {
  by_employee: {
    employee_id: string;
    employee_code: string;
    employee_name: string;
    total_days: number;
    present_days: number;
    late_days: number;
    absent_days: number;
    half_days: number;
    total_work_hours: number;
    attendance_rate: number;
  }[];
  summary: {
    total_employees: number;
    average_attendance_rate: number;
    total_absences: number;
    total_late_arrivals: number;
  };
}

export interface PayrollSummaryReportData {
  by_employee: {
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department_name: string;
    base_salary: number;
    allowances: number;
    bonuses: number;
    overtime_pay: number;
    deductions: number;
    net_salary: number;
  }[];
  by_department: {
    department_id: string;
    department_name: string;
    employee_count: number;
    total_base_salary: number;
    total_allowances: number;
    total_bonuses: number;
    total_overtime: number;
    total_deductions: number;
    total_net_salary: number;
  }[];
  summary: {
    total_employees: number;
    total_base_salary: number;
    total_allowances: number;
    total_bonuses: number;
    total_overtime: number;
    total_deductions: number;
    total_net_salary: number;
  };
}

export async function generateHeadcountReport(): Promise<HeadcountReportData> {
  await connectDB();

  // Get total active employees
  const totalEmployees = await Employee.countDocuments({
    employee_status: 'active',
    deleted_at: null,
  });

  // Group by department
  const byDepartment = await Employee.aggregate([
    {
      $match: {
        employee_status: 'active',
        deleted_at: null,
      },
    },
    {
      $group: {
        _id: '$department_id',
        employee_count: { $sum: 1 },
      },
    },
  ]);

  // Populate department names
  const departmentData = await Promise.all(
    byDepartment.map(async (item) => {
      const dept = await Department.findOne({ department_id: item._id });
      return {
        department_id: item._id,
        department_name: dept?.department_name || 'Unknown',
        department_name_khmer: dept?.department_name_khmer,
        employee_count: item.employee_count,
      };
    })
  );

  // Group by position
  const byPosition = await Employee.aggregate([
    {
      $match: {
        employee_status: 'active',
        deleted_at: null,
      },
    },
    {
      $group: {
        _id: '$position_id',
        employee_count: { $sum: 1 },
      },
    },
  ]);

  // Populate position names
  const positionData = await Promise.all(
    byPosition.map(async (item) => {
      const pos = await Position.findOne({ position_id: item._id });
      return {
        position_id: item._id,
        position_name: pos?.position_name || 'Unknown',
        position_name_khmer: pos?.position_name_khmer,
        employee_count: item.employee_count,
      };
    })
  );

  // Group by status
  const byStatus = await Employee.aggregate([
    {
      $match: {
        deleted_at: null,
      },
    },
    {
      $group: {
        _id: '$employee_status',
        employee_count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        employee_status: '$_id',
        employee_count: 1,
      },
    },
  ]);

  // Group by type
  const byType = await Employee.aggregate([
    {
      $match: {
        employee_status: 'active',
        deleted_at: null,
      },
    },
    {
      $group: {
        _id: '$employee_type',
        employee_count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        employee_type: '$_id',
        employee_count: 1,
      },
    },
  ]);

  return {
    total_employees: totalEmployees,
    by_department: departmentData,
    by_position: positionData,
    by_status: byStatus,
    by_type: byType,
  };
}

export async function generateLeaveUtilizationReport(
  startDate?: Date,
  endDate?: Date
): Promise<LeaveUtilizationReportData> {
  await connectDB();

  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.start_date = {};
    if (startDate) dateFilter.start_date.$gte = startDate;
    if (endDate) dateFilter.start_date.$lte = endDate;
  }

  // Get all leave balances with employee info
  const leaveBalances = await LeaveBalance.find({}).lean();
  const employees = await Employee.find({
    employee_status: 'active',
    deleted_at: null,
  }).lean();
  const leaveTypes = await LeaveType.find({}).lean();

  const byEmployee = await Promise.all(
    leaveBalances.map(async (balance) => {
      const employee = employees.find((e) => e.employee_id === balance.employee_id);
      const leaveType = leaveTypes.find((lt) => lt.leave_type_id === balance.leave_type_id);

      return {
        employee_id: balance.employee_id,
        employee_code: employee?.employee_code || '',
        employee_name: employee
          ? `${employee.first_name} ${employee.last_name}`
          : 'Unknown',
        leave_type: leaveType?.leave_type_name || 'Unknown',
        total_quota: balance.total_allocated,
        used_days: balance.used_days,
        remaining_days: balance.remaining_days,
        utilization_rate: balance.total_allocated > 0
          ? (balance.used_days / balance.total_allocated) * 100
          : 0,
      };
    })
  );

  // Group by leave type
  const leaveRequestsByType = await LeaveRequest.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: '$leave_type_id',
        total_requests: { $sum: 1 },
        approved_requests: {
          $sum: { $cond: [{ $eq: ['$leave_status', 'approved'] }, 1, 0] },
        },
        total_days_taken: {
          $sum: {
            $cond: [{ $eq: ['$leave_status', 'approved'] }, '$total_days', 0],
          },
        },
      },
    },
  ]);

  const byLeaveType = await Promise.all(
    leaveRequestsByType.map(async (item) => {
      const leaveType = leaveTypes.find((lt) => lt.leave_type_id === item._id);
      return {
        leave_type_id: item._id,
        leave_type_name: leaveType?.leave_type_name || 'Unknown',
        total_requests: item.total_requests,
        approved_requests: item.approved_requests,
        total_days_taken: item.total_days_taken,
        average_days_per_request:
          item.approved_requests > 0
            ? item.total_days_taken / item.approved_requests
            : 0,
      };
    })
  );

  // Summary
  const allRequests = await LeaveRequest.find(dateFilter).lean();
  const summary = {
    total_leave_requests: allRequests.length,
    approved_requests: allRequests.filter((r) => r.leave_status === 'approved').length,
    pending_requests: allRequests.filter((r) => r.leave_status === 'pending').length,
    rejected_requests: allRequests.filter((r) => r.leave_status === 'rejected').length,
  };

  return {
    by_employee: byEmployee,
    by_leave_type: byLeaveType,
    summary,
  };
}

export async function generateAttendanceSummaryReport(
  startDate: Date,
  endDate: Date
): Promise<AttendanceSummaryReportData> {
  await connectDB();

  const employees = await Employee.find({
    employee_status: 'active',
    deleted_at: null,
  }).lean();

  const byEmployee = await Promise.all(
    employees.map(async (employee) => {
      const attendanceRecords = await Attendance.find({
        employee_id: employee._id,
        work_date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0],
        },
      }).lean();

      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(
        (r) => r.attendance_status === 'present'
      ).length;
      const lateDays = attendanceRecords.filter(
        (r) => r.attendance_status === 'late'
      ).length;
      const absentDays = attendanceRecords.filter(
        (r) => r.attendance_status === 'absent'
      ).length;
      const halfDays = attendanceRecords.filter(
        (r) => r.attendance_status === 'half_day'
      ).length;
      const totalWorkHours = attendanceRecords.reduce(
        (sum, r) => sum + (r.work_hours || 0),
        0
      );

      // Calculate working days in the period
      const workingDays = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      const attendanceRate = workingDays > 0
        ? ((presentDays + lateDays + halfDays * 0.5) / workingDays) * 100
        : 0;

      return {
        employee_id: employee.employee_id,
        employee_code: employee.employee_code,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        total_days: totalDays,
        present_days: presentDays,
        late_days: lateDays,
        absent_days: absentDays,
        half_days: halfDays,
        total_work_hours: Math.round(totalWorkHours * 100) / 100,
        attendance_rate: Math.round(attendanceRate * 100) / 100,
      };
    })
  );

  const summary = {
    total_employees: employees.length,
    average_attendance_rate:
      byEmployee.length > 0
        ? byEmployee.reduce((sum, e) => sum + e.attendance_rate, 0) / byEmployee.length
        : 0,
    total_absences: byEmployee.reduce((sum, e) => sum + e.absent_days, 0),
    total_late_arrivals: byEmployee.reduce((sum, e) => sum + e.late_days, 0),
  };

  return {
    by_employee: byEmployee,
    summary: {
      ...summary,
      average_attendance_rate: Math.round(summary.average_attendance_rate * 100) / 100,
    },
  };
}

export async function generatePayrollSummaryReport(
  payrollMonth: string
): Promise<PayrollSummaryReportData> {
  await connectDB();

  const payrollRecords = await Payroll.find({
    payroll_month: payrollMonth,
  }).lean();

  const employees = await Employee.find({
    employee_id: { $in: payrollRecords.map((p) => p.employee_id) },
  }).lean();

  const departments = await Department.find({}).lean();

  const byEmployee = await Promise.all(
    payrollRecords.map(async (payroll) => {
      const employee = employees.find((e) => e.employee_id === payroll.employee_id);
      const department = departments.find(
        (d) => d.department_id === employee?.department_id
      );

      return {
        employee_id: payroll.employee_id,
        employee_code: employee?.employee_code || '',
        employee_name: employee
          ? `${employee.first_name} ${employee.last_name}`
          : 'Unknown',
        department_name: department?.department_name || 'Unknown',
        base_salary: payroll.base_salary,
        allowances: payroll.allowances,
        bonuses: payroll.bonuses,
        overtime_pay: payroll.overtime_pay,
        deductions: payroll.deductions,
        net_salary: payroll.net_salary,
      };
    })
  );

  // Group by department
  const departmentMap = new Map<string, any>();

  byEmployee.forEach((emp) => {
    const deptEmployee = employees.find((e) => e.employee_code === emp.employee_code);
    const deptId = deptEmployee?.department_id || 'unknown';

    if (!departmentMap.has(deptId)) {
      const dept = departments.find((d) => d.department_id === deptId);
      departmentMap.set(deptId, {
        department_id: deptId,
        department_name: dept?.department_name || 'Unknown',
        employee_count: 0,
        total_base_salary: 0,
        total_allowances: 0,
        total_bonuses: 0,
        total_overtime: 0,
        total_deductions: 0,
        total_net_salary: 0,
      });
    }

    const deptData = departmentMap.get(deptId);
    deptData.employee_count += 1;
    deptData.total_base_salary += emp.base_salary;
    deptData.total_allowances += emp.allowances;
    deptData.total_bonuses += emp.bonuses;
    deptData.total_overtime += emp.overtime_pay;
    deptData.total_deductions += emp.deductions;
    deptData.total_net_salary += emp.net_salary;
  });

  const byDepartment = Array.from(departmentMap.values());

  const summary = {
    total_employees: payrollRecords.length,
    total_base_salary: byEmployee.reduce((sum, e) => sum + e.base_salary, 0),
    total_allowances: byEmployee.reduce((sum, e) => sum + e.allowances, 0),
    total_bonuses: byEmployee.reduce((sum, e) => sum + e.bonuses, 0),
    total_overtime: byEmployee.reduce((sum, e) => sum + e.overtime_pay, 0),
    total_deductions: byEmployee.reduce((sum, e) => sum + e.deductions, 0),
    total_net_salary: byEmployee.reduce((sum, e) => sum + e.net_salary, 0),
  };

  return {
    by_employee: byEmployee,
    by_department: byDepartment,
    summary,
  };
}
